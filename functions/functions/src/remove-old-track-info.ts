import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/scheduler";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
// ENTRY POINT
export const removeOldTrackInfo = onSchedule({ region: "europe-west1", schedule: "every day 02:00" }, async () => {
  logger.info("Request received on function removeOldTrackInfo");

  await removeOldTracks();
});

async function removeOldTracks() {
  logger.info("Removing old track info");

  const db = getFirestore();
  const tracksCollection = db.collection("tracks");
  const now = new Date();

  const oldTracksQuery = await tracksCollection.where("expiresAt", "<", now).get();

  if (oldTracksQuery.empty) {
    logger.info("No old tracks to remove");
    return;
  }

  logger.info(`Removing ${oldTracksQuery.size} old tracks`);

  oldTracksQuery.forEach((doc) => {
    logger.info(`Removing track ${doc.id}`);
    tracksCollection.doc(doc.id).delete();
  });

  logger.info("Old tracks removed");
}
