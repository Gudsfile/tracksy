import"./index.9CzYlZ0E.js";const f="You are a music data analyst. Given a user's question, the SQL query used, and a sample of the results, write a concise 2-3 sentence answer that directly addresses the question. Be specific — mention actual values from the data. Write in a friendly, conversational tone. Do not repeat the question.";async function d(a,o,r,t,c){const i=t.slice(0,10),l=[{role:"system",content:f},{role:"user",content:`Question: ${o}

SQL:
${r}

Results (${t.length} rows total, showing up to 10):
${JSON.stringify(i,null,2)}`}],u=performance.now();let n="",m=0;const p=await a.chat.completions.create({messages:l,temperature:.3,max_tokens:256,stream:!0});for await(const s of p){const e=s.choices[0]?.delta?.content??"";e&&(n+=e,c(e)),m+=s.usage?.completion_tokens??0}return performance.now()-u,n}export{d as askNarrator};
