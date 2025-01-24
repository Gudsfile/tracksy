import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { DocumentData, getFirestore } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import { uniq } from "lodash";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const client_id = defineString("SPOTIFY_CLIENT_ID");
const client_secret = defineString("SPOTIFY_CLIENT_SECRET");

// ENTRY POINT
export const getSpotifyTrackInfo = functions.https.onRequest({ region: "europe-west9" }, async (request, response) => {
  logger.info("Request received on function getSpotifyTrackInfo");

  const trackIdsParam = request.query.trackIds as string;

  if (!trackIdsParam || trackIdsParam.length === 0) {
    response.status(400).send("Missing trackIds query parameter");
    return;
  }

  // Remove duplicates
  const trackIds = uniq(trackIdsParam.trim().split(","));

  if (trackIds.length > 50) {
    response.status(400).send("You can only request info for up to 50 tracks at once");
    return;
  }

  logger.info(`Fetching track info for ${trackIds}`);

  const tracksInfo = await getTracksInfo(trackIds);

  if (!tracksInfo) {
    response.status(500).send("Failed to get track info");
    return;
  }

  response.status(200).send(tracksInfo);
});

async function getTracksInfo(trackIds: string[]) {
  const cachedTracks = await getCachedTracks(trackIds);
  const cachedTrackIds = cachedTracks.map((track) => track.id);
  const missingTrackIds = trackIds.filter((id) => !cachedTrackIds.includes(id));

  if (missingTrackIds.length) {
    const spotifyInfo = await getInfoFromSpotify(missingTrackIds.join(","));

    if (!spotifyInfo) {
      return null;
    }

    await cacheTracks(spotifyInfo);
    cachedTracks.push(...spotifyInfo);
  }

  return cachedTracks;
}

async function cacheTracks(tracks: object[]) {
  logger.log(`Caching ${tracks.length} tracks`);

  const db = getFirestore();
  const batch = db.batch();

  tracks.forEach((track) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const docRef = db.collection("tracks").doc(track.id);
    batch.set(docRef, {
      ...track,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 1 month (30 days)
    });
  });

  await batch.commit();
}

async function getCachedTracks(trackIds: string[]): Promise<DocumentData[]> {
  logger.log("Get cached track info for trackIds", trackIds.join(","));
  const db = getFirestore();

  const refs = trackIds.map((id) => db.doc(`tracks/${id}`));
  const result = await db.getAll(...refs);

  const cachedTracks = result.map((doc) => doc.data()).filter((doc): doc is DocumentData => doc != undefined);

  logger.log(`Found ${cachedTracks.length} cached tracks`);

  return cachedTracks;
}

async function getInfoFromSpotify(trackIds: string): Promise<object[] | null> {
  logger.log("Get track info from spotify for trackIds", trackIds);

  const token = await authSpotify();

  if (!token) {
    return null;
  }

  const res = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    logger.error("Failed to fetch track info from Spotify");
    return null;
  }

  const infos = await res.json();
  return infos.tracks;
}

async function authSpotify(): Promise<string | null> {
  logger.log("Authenticating with Spotify");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(client_id.value() + ":" + client_secret.value()).toString("base64"),
    },
  });

  if (!res.ok) {
    logger.error("Failed to authenticate with Spotify");
    return null;
  }

  const json = await res.json();
  return json.access_token;
}
