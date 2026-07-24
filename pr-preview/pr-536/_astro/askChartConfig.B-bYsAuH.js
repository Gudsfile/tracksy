import{r as e}from"./react.UlBwNWom.js";import{t}from"./devBus.DRONl0Hn.js";import{n}from"./engine.Bz12rB1G.js";function r(e){return typeof e==`number`&&Number.isFinite(e)}function i(e){if(typeof e!=`string`&&typeof e!=`number`)return!1;let t=new Date(e);return!Number.isNaN(t.getTime())}function a(e){if(!e||e.length===0)return`table`;let t=e[0],n=Object.keys(t);if(e.length===1&&n.length===1&&r(t[n[0]]))return`metric`;if(n.length===2){let[a,o]=n,s=typeof t[a]==`string`?a:typeof t[o]==`string`?o:void 0,c=r(t[a])?a:r(t[o])?o:void 0;if(s&&c)return i(t[s])&&e.length>6?`line`:e.length<=25?`list`:`bar`}return`table`}var o=e({askChartConfig:()=>f,inferConfig:()=>d}),s=`You are a chart type selector. Given a user question, column names with their types, and the row count, output a JSON chart config.

Available types:
- "ranked_list"      — ordered rows: 1 string label + 1 numeric score (top artists, tracks, weekdays…). Add "secondaryKey" for a subtitle column.
- "labeled_segments" — single row with named segment columns that sum to a total (morning/afternoon/…, winter/spring/…). Include ALL segment column names in "segmentKeys".
- "skip_rate"        — exactly 2 columns: complete_listens and skipped_listens (single row).
- "calendar_heatmap" — columns: a date string (YYYY-MM-DD) + a stream count.
- "radial"           — columns: play_hour (0-23) + count_streams.
- "metric"           — 1 row, 1 numeric column.
- "bar"              — categorical comparison: string x-axis + numeric y-axis.
- "line"             — time series or trend: date/year/month on x-axis + numeric y-axis.
- "table"            — fallback: many columns, no clear shape.

Output ONLY a JSON object, no markdown, no explanation.`,c=[{user:`Question: Who are my top artists?
Columns: artist_name(string), count_streams(number), ms_played(number)
Rows: 10`,assistant:`{"type":"ranked_list","labelKey":"artist_name","valueKey":"count_streams","secondaryKey":"ms_played"}`},{user:`Question: How many tracks did I stream in total?
Columns: total_streams(number)
Rows: 1`,assistant:`{"type":"metric","key":"total_streams"}`},{user:`Question: How has my listening evolved over the years?
Columns: stream_year(number), stream_count(number), ms_played(number)
Rows: 6`,assistant:`{"type":"line","x":"stream_year","y":"stream_count"}`},{user:`Question: Compare my streaming by platform
Columns: platform(string), count_streams(number)
Rows: 5`,assistant:`{"type":"bar","x":"platform","y":"count_streams"}`},{user:`Question: What time of day do I listen the most?
Columns: morning(number), afternoon(number), evening(number), night(number), total(number)
Rows: 1`,assistant:`{"type":"labeled_segments","segmentKeys":["morning","afternoon","evening","night"],"totalKey":"total"}`},{user:`Question: Do I skip tracks often?
Columns: complete_listens(number), skipped_listens(number)
Rows: 1`,assistant:`{"type":"skip_rate"}`},{user:`Question: Show my listening calendar for 2025
Columns: stream_date(string), stream_count(number)
Rows: 365`,assistant:`{"type":"calendar_heatmap","dateKey":"stream_date","countKey":"stream_count"}`},{user:`Question: Show my listening by hour
Columns: play_hour(number), count_streams(number), ms_played(number)
Rows: 24`,assistant:`{"type":"radial","angleKey":"play_hour","countKey":"count_streams"}`},{user:`Question: Show me my raw data
Columns: track_name(string), artist_name(string), ts(string), ms_played(number), platform(string)
Rows: 50`,assistant:`{"type":"table"}`}];function l(e){let t=e[0];return Object.keys(t).map(e=>`${e}(${typeof t[e]==`number`?`number`:`string`})`).join(`, `)}function u(e,t){let n=e.match(/```(?:json)?\s*([\s\S]*?)\s*```/i),r=n?n[1]:e,i=r.indexOf(`{`),a=r.lastIndexOf(`}`);if(i===-1||a===-1)throw Error(`No JSON found`);let o=JSON.parse(r.slice(i,a+1)),s=new Set(Object.keys(t[0]));function c(e){if(typeof e!=`string`||!s.has(e))throw Error(`Invalid column: ${String(e)}`);return e}switch(o.type){case`ranked_list`:return{type:`ranked_list`,labelKey:c(o.labelKey),valueKey:c(o.valueKey),secondaryKey:typeof o.secondaryKey==`string`&&s.has(o.secondaryKey)?o.secondaryKey:void 0};case`labeled_segments`:{let e=Array.isArray(o.segmentKeys)?o.segmentKeys.filter(e=>typeof e==`string`&&s.has(e)):[];if(e.length===0)throw Error(`No valid segmentKeys`);return{type:`labeled_segments`,segmentKeys:e,totalKey:c(o.totalKey)}}case`skip_rate`:if(!s.has(`complete_listens`)||!s.has(`skipped_listens`))throw Error(`Missing skip_rate columns`);return{type:`skip_rate`};case`calendar_heatmap`:return{type:`calendar_heatmap`,dateKey:c(o.dateKey),countKey:c(o.countKey)};case`radial`:return{type:`radial`,angleKey:c(o.angleKey),countKey:c(o.countKey)};case`metric`:return{type:`metric`,key:typeof o.key==`string`&&s.has(o.key)?o.key:[...s][0]};case`bar`:case`line`:{let e=c(o.x),t=c(o.y);return{type:o.type,x:e,y:t}}case`table`:return{type:`table`};default:throw Error(`Unknown type: ${String(o.type)}`)}}function d(e){if(!e.length)return{type:`table`};let t=a(e),n=Object.keys(e[0]);if(t===`metric`)return{type:`metric`,key:n[0]};if(t===`list`||t===`bar`||t===`line`){let r=n.find(t=>typeof e[0][t]==`string`)??n[0],i=n.find(t=>t!==r&&typeof e[0][t]==`number`)??n[1];return t===`list`?{type:`ranked_list`,labelKey:r,valueKey:i}:{type:t,x:r,y:i}}return{type:`table`}}async function f(e,r,i){let a=[{role:`system`,content:s},...c.flatMap(e=>[{role:`user`,content:e.user},{role:`assistant`,content:e.assistant}]),{role:`user`,content:`Question: ${r}\nColumns: ${l(i)}\nRows: ${i.length}`}],o=performance.now(),f=await e.chat.completions.create({messages:a,temperature:.1,max_tokens:128}),p=performance.now()-o,m=f.usage?.completion_tokens??0;t.emit(`webllm:inference`,{model:n(),durationMs:p,tokensPerSec:p>0?m/(p/1e3):0});let h=f.choices[0]?.message?.content??``;try{return u(h,i)}catch{return d(i)}}export{d as n,o as t};