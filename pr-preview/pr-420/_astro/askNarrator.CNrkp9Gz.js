import"./index.DL5C1mjd.js";const h=`You are a music data analyst. Write a concise 2-3 sentence summary that directly answers the user's question using ONLY the data provided.

Rules:
- Only reference names, values, and counts that appear verbatim in the provided data.
- Never invent, guess, or add any information not present in the results.
- Start your response by referencing the first item in the data table by its exact name.
- If the data is insufficient to answer, say so briefly.
- Write in a friendly, conversational tone. Do not repeat the question.`;function f(s){const n=s.slice(0,10),e=Object.keys(n[0]),t=`| ${e.join(" | ")} |`,o=`| ${e.map(()=>"---").join(" | ")} |`,a=n.map(r=>`| ${e.map(i=>String(r[i]??"")).join(" | ")} |`).join(`
`);return`${t}
${o}
${a}`}async function $(s,n,e,t,o,a){const r=t.length>0?`Data (${t.length} rows total, showing up to 10):
${f(t)}`:a?`Chart description: ${a}`:"No result data available.",i=[{role:"system",content:h},{role:"user",content:`Question: ${n}

${r}

SQL used:
${e}`}],m=performance.now();let u="",d=0;const p=await s.chat.completions.create({messages:i,temperature:.1,max_tokens:256,stream:!0});for await(const l of p){const c=l.choices[0]?.delta?.content??"";c&&(u+=c,o(c)),d+=l.usage?.completion_tokens??0}return performance.now()-m,u}export{$ as askNarrator};
