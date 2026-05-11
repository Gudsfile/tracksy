import{T as u,D as d,A as f,S as _,a as y}from"./App.DLx9LNZf.js";const E=["top_artists","top_tracks","top_albums","streams_per_month","streams_per_hour","streams_per_day_of_week","calendar_heatmap","session_analysis","artist_discovery","listening_rhythm","skip_rate","regularity","new_vs_old","favorite_weekday","total_streams","custom"],p={top_artists:{description:"Top artists ranked by stream count",acceptsYear:!0,acceptsLimit:!0},top_tracks:{description:"Top tracks ranked by stream count",acceptsYear:!0,acceptsLimit:!0},top_albums:{description:"Top albums ranked by stream count",acceptsYear:!0,acceptsLimit:!0},streams_per_month:{description:"Streams aggregated per month within a year",acceptsYear:!0,acceptsLimit:!1},streams_per_hour:{description:"Hourly stream distribution shown as a radial chart",acceptsYear:!0,acceptsLimit:!1},streams_per_day_of_week:{description:"Streams aggregated per day of week",acceptsYear:!0,acceptsLimit:!1},calendar_heatmap:{description:"Calendar heatmap of listening activity for a single year (year is required)",acceptsYear:!0,acceptsLimit:!1},session_analysis:{description:"Listening session statistics (length, frequency)",acceptsYear:!0,acceptsLimit:!1},artist_discovery:{description:"New vs cumulative artists discovered over time",acceptsYear:!1,acceptsLimit:!1},listening_rhythm:{description:"Distribution of listening across morning, afternoon, evening, night",acceptsYear:!0,acceptsLimit:!1},skip_rate:{description:"Share of streams that were skipped vs completed",acceptsYear:!0,acceptsLimit:!1},regularity:{description:"How regularly the user listens (days with streams, longest pause)",acceptsYear:!0,acceptsLimit:!1},new_vs_old:{description:"Streams of newly released music vs older catalog",acceptsYear:!0,acceptsLimit:!1},favorite_weekday:{description:"Top weekday for listening",acceptsYear:!0,acceptsLimit:!1},total_streams:{description:"Lifetime total of streams",acceptsYear:!1,acceptsLimit:!1},custom:{description:"Fallback for any question not covered above. Requires a SELECT-only SQL string in the answer.",acceptsYear:!1,acceptsLimit:!1}};function h(a){return typeof a=="string"&&E.includes(a)}const T=`DuckDB schema (the user's music streaming history, fully local):

Table ${u} (one row per playback):
  track_uri TEXT, track_name TEXT, artist_name TEXT, album_name TEXT,
  ts TIMESTAMP (ISO 8601), ms_played INTEGER (milliseconds), platform TEXT

Table ${d}:
  day DATE, stream_count DOUBLE, ms_played DOUBLE

Table ${f}:
  artist_name TEXT, first_year INTEGER

Table ${_}:
  session_id INTEGER, track_count DOUBLE, duration_ms DOUBLE,
  session_start TIMESTAMP, session_end TIMESTAMP

Table ${y}: aggregate stats cache (rarely needed).

Notes:
- Use ts::date for grouping by day. EXTRACT(year FROM ts) for year.
- ms_played is milliseconds (divide by 60000 for minutes).
- Only SELECT or WITH..SELECT statements are allowed in custom SQL.
`;function S(){return Object.keys(p).map(a=>{const n=p[a],t=[];n.acceptsYear&&t.push("year (int, optional)"),n.acceptsLimit&&t.push("limit (int, optional)");const e=t.length?` [params: ${t.join(", ")}]`:"";return`  - ${a}${e}: ${n.description}`}).join(`
`)}const g=`You are a routing assistant for a local music-listening data app.

Given a user question, you choose ONE intent from the catalog below, fill in optional params, and return a single JSON object — nothing else.

${T}

Available intents (pick exactly one):
${S()}

Output format (return EXACTLY one JSON object, no prose, no code fences, no comments, double-quoted keys):
{
  "intent": "<one of the intent names above>",
  "params": { "year": <int|omit>, "limit": <int|omit> },
  "title": "<short chart title>",
  "explanation": "<one sentence: what the chart shows>",
  "sql": "<SELECT or WITH..SELECT representing this question, no semicolon, no DDL/DML>"
}

Rules:
- "intent" MUST be one of the catalog names.
- "sql" is ALWAYS required for every intent, including non-custom ones.
- "params.year" only if user mentioned a year. Omit otherwise.
- "params.limit" only for top_artists/top_tracks/top_albums when user asked for a specific N.
- Use intent "custom" ONLY if no other intent fits.
- Never invent table or column names. Never include any text outside the JSON object.
`,L=[{user:"Who are my top artists?",assistant:JSON.stringify({intent:"top_artists",params:{},title:"Top artists",explanation:"Artists ranked by total stream count.",sql:"SELECT artist_name, COUNT(*)::DOUBLE AS count_streams, SUM(ms_played)::DOUBLE AS ms_played FROM music_streams WHERE artist_name IS NOT NULL GROUP BY artist_name ORDER BY count_streams DESC LIMIT 5"})},{user:"Show me my top 10 tracks in 2023",assistant:JSON.stringify({intent:"top_tracks",params:{year:2023,limit:10},title:"Top 10 tracks in 2023",explanation:"Most-played tracks during 2023.",sql:"SELECT track_name, artist_name, COUNT(*)::DOUBLE AS count_streams FROM music_streams WHERE EXTRACT(year FROM ts) = 2023 AND track_name IS NOT NULL GROUP BY track_name, artist_name ORDER BY count_streams DESC LIMIT 10"})},{user:"How does my listening look across the year?",assistant:JSON.stringify({intent:"calendar_heatmap",params:{year:new Date().getFullYear()},title:"Listening calendar",explanation:"Daily listening intensity across the calendar year.",sql:`SELECT ts::date AS day, COUNT(*)::DOUBLE AS stream_count FROM music_streams WHERE EXTRACT(year FROM ts) = ${new Date().getFullYear()} GROUP BY ts::date ORDER BY day`})},{user:"Streams per month for 2022",assistant:JSON.stringify({intent:"streams_per_month",params:{year:2022},title:"Streams per month — 2022",explanation:"Monthly stream counts for the year 2022.",sql:"SELECT DATE_TRUNC('month', ts) AS month, COUNT(*)::DOUBLE AS count_streams, SUM(ms_played)::DOUBLE AS ms_played FROM music_streams WHERE EXTRACT(year FROM ts) = 2022 GROUP BY month ORDER BY month"})},{user:"How many minutes per platform did I listen on?",assistant:JSON.stringify({intent:"custom",params:{},title:"Minutes listened per platform",explanation:"Total minutes of playback grouped by reported platform.",sql:"SELECT platform, SUM(ms_played) / 60000.0 AS minutes FROM music_streams WHERE platform IS NOT NULL GROUP BY platform ORDER BY minutes DESC"})},{user:"What is my skip rate?",assistant:JSON.stringify({intent:"skip_rate",params:{},title:"Skip rate",explanation:"Share of streams that were skipped vs completed.",sql:"SELECT COUNT(*) FILTER (WHERE ms_played < 30000)::DOUBLE AS skipped_listens, COUNT(*) FILTER (WHERE ms_played >= 30000)::DOUBLE AS complete_listens FROM music_streams"})}];class o extends Error{constructor(n,t){super(n),this.kind=t,this.name="LLMError"}kind}function O(a,n){const t=[{role:"system",content:g}];for(const s of L)t.push({role:"user",content:s.user}),t.push({role:"assistant",content:s.assistant});const e=n.slice(-8);for(const s of e)t.push({role:s.role,content:s.text});return t.push({role:"user",content:a}),t}function R(a){const n=a.match(/```(?:json)?\s*([\s\S]*?)\s*```/i),t=n?n[1]:a,e=t.indexOf("{");if(e===-1)throw new o("No JSON object found in model output.","parse");let s=0,r=!1,i=!1;for(let c=e;c<t.length;c++){const l=t[c];if(i){i=!1;continue}if(l==="\\"){i=!0;continue}if(l==='"'){r=!r;continue}if(!r){if(l==="{")s++;else if(l==="}"&&(s--,s===0))return t.slice(e,c+1)}}throw new o("Unbalanced JSON braces in model output.","parse")}function N(a){const n=R(a);let t;try{t=JSON.parse(n)}catch{throw new o("Model output is not valid JSON.","parse")}if(typeof t!="object"||t===null)throw new o("Model output is not a JSON object.","schema");const e=t;if(!h(e.intent))throw new o(`Unknown or missing intent: ${String(e.intent)}`,"schema");const s=e.intent,r=e.params??{},i={};typeof r.year=="number"&&Number.isFinite(r.year)&&(i.year=Math.trunc(r.year)),typeof r.limit=="number"&&Number.isFinite(r.limit)&&(i.limit=Math.trunc(r.limit));const c=typeof e.title=="string"&&e.title.trim().length>0?e.title.trim():"Result",l=typeof e.explanation=="string"?e.explanation.trim():"",m=typeof e.sql=="string"?e.sql.trim():"";if(m.length===0)throw new o("Response is missing the required sql field.","schema");return{intent:s,params:i,title:c,explanation:l,sql:m}}async function k(a,n,t){const e=O(n,t);let s;try{s=await a.chat.completions.create({messages:e,temperature:.1,max_tokens:512})}catch(r){const i=r instanceof Error?r.message:String(r);throw new o(i,"engine")}if(!("choices"in s)||!s.choices?.length||!s.choices[0].message?.content)throw new o("Empty response from model.","engine");return N(s.choices[0].message.content)}export{k as askLLM,R as extractJsonObject,N as parseChatAnswer};
