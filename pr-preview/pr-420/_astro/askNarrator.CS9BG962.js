import"./index.DL5C1mjd.js";const h=`You are a music data analyst. Write a concise 2-3 sentence summary that directly answers the user's question using ONLY the data provided.

Rules:
- Only reference names, values, and counts that appear verbatim in the provided data.
- Never invent, guess, or add any information not present in the results.
- Start your response by referencing the first item in the data table by its exact name.
- If the data is insufficient to answer, say so briefly.
- Write in a friendly, conversational tone. Do not repeat the question.`;function f(n){if(n.length===0)return"(no data)";const a=n.slice(0,10),e=Object.keys(a[0]),t=`| ${e.join(" | ")} |`,o=`| ${e.map(()=>"---").join(" | ")} |`,s=a.map(r=>`| ${e.map(i=>String(r[i]??"")).join(" | ")} |`).join(`
`);return`${t}
${o}
${s}`}async function $(n,a,e,t,o,s){const r=t.length>0?`Data (${t.length} rows total, showing up to 10):
${f(t)}`:s?`Chart description: ${s}`:"No result data available.",i=[{role:"system",content:h},{role:"user",content:`Question: ${a}

${r}

SQL used:
${e}`}],d=performance.now();let u="",m=0;const p=await n.chat.completions.create({messages:i,temperature:.1,max_tokens:256,stream:!0});for await(const l of p){const c=l.choices[0]?.delta?.content??"";c&&(u+=c,o(c)),m+=l.usage?.completion_tokens??0}return performance.now()-d,u}export{$ as askNarrator};
