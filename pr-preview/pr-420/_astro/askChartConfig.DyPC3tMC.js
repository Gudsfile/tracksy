import{b as l}from"./ChatView.DSFndbZm.js";import"./index.DL5C1mjd.js";const p=`You are a chart type selector. Given a user question, the column names and their types, and the number of rows, choose the best chart type and which columns to use.

Available types:
- "metric"  — single big number: 1 row, 1 numeric column
- "list"    — ranked items: ≤25 rows, 1 string label + 1 numeric value
- "bar"     — categorical comparison: string x-axis, numeric y-axis, many rows or explicit comparison
- "line"    — trend or time series: date/year/month/hour on x-axis, numeric y-axis
- "table"   — raw data: many columns, complex rows, or no clear chart shape

Output ONLY a JSON object, no markdown, no explanation:
{"type":"...","x":"column_name","y":"column_name"}`,y=[{user:`Question: Who are my top artists?
Columns: artist_name(string), count_streams(number), ms_played(number)
Rows: 10`,assistant:'{"type":"list","x":"artist_name","y":"count_streams"}'},{user:`Question: How many tracks did I stream in total?
Columns: total_streams(number)
Rows: 1`,assistant:'{"type":"metric","x":"total_streams"}'},{user:`Question: How has my listening evolved over the years?
Columns: stream_year(number), stream_count(number), ms_played(number)
Rows: 6`,assistant:'{"type":"line","x":"stream_year","y":"stream_count"}'},{user:`Question: Compare my streaming by platform
Columns: platform(string), count_streams(number)
Rows: 5`,assistant:'{"type":"bar","x":"platform","y":"count_streams"}'},{user:`Question: Show me my raw streaming data
Columns: track_name(string), artist_name(string), ts(string), ms_played(number), platform(string)
Rows: 50`,assistant:'{"type":"table"}'}];function h(n){const a=n[0];return Object.keys(a).map(s=>{const r=typeof a[s];return`${s}(${r==="number"?"number":"string"})`}).join(", ")}function d(n,a){const e=n.match(/```(?:json)?\s*([\s\S]*?)\s*```/i),s=e?e[1]:n,r=s.indexOf("{"),o=s.lastIndexOf("}");if(r===-1||o===-1)throw new Error("No JSON found");const t=JSON.parse(s.slice(r,o+1));if(!["metric","bar","line","list","table"].includes(t.type))throw new Error(`Invalid type: ${t.type}`);const m=new Set(Object.keys(a[0])),c=typeof t.x=="string"&&m.has(t.x)?t.x:void 0,u=typeof t.y=="string"&&m.has(t.y)?t.y:void 0;return{type:t.type,x:c,y:u}}async function g(n,a,e){const s=[{role:"system",content:p},...y.flatMap(i=>[{role:"user",content:i.user},{role:"assistant",content:i.assistant}]),{role:"user",content:`Question: ${a}
Columns: ${h(e)}
Rows: ${e.length}`}],r=performance.now(),o=await n.chat.completions.create({messages:s,temperature:.1,max_tokens:64});performance.now()-r,o.usage?.completion_tokens;const t=o.choices[0]?.message?.content??"";try{return d(t,e)}catch{return{type:l(e)}}}export{g as askChartConfig};
