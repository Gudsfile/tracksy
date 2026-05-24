import"./index.9CzYlZ0E.js";const f=`You are a music data analyst. Write a concise 2-3 sentence summary that directly answers the user's question using ONLY the data provided.

Rules:
- Only reference names, values, and counts that appear verbatim in the provided data.
- Never invent, guess, or add any information not present in the results.
- If the data is insufficient to answer, say so briefly.
- Write in a friendly, conversational tone. Do not repeat the question.`;async function y(o,r,i,t,c,n){const l=t.length>0?`Results (${t.length} rows total, showing up to 10):
${JSON.stringify(t.slice(0,10),null,2)}`:n?`Chart description: ${n}`:"No result data available.",u=[{role:"system",content:f},{role:"user",content:`Question: ${r}

SQL:
${i}

${l}`}],d=performance.now();let a="",m=0;const h=await o.chat.completions.create({messages:u,temperature:.1,max_tokens:256,stream:!0});for await(const s of h){const e=s.choices[0]?.delta?.content??"";e&&(a+=e,c(e)),m+=s.usage?.completion_tokens??0}return performance.now()-d,a}export{y as askNarrator};
