import"./index.9CzYlZ0E.js";const p="You are a music data analyst. Given a user's question and context about the visualization, write a concise 2-3 sentence answer that directly addresses the question. When result data is available, mention specific values. When only a chart description is available, describe what the visualization reveals. Write in a friendly, conversational tone. Do not repeat the question.";async function f(o,i,r,t,c,a){const l=t.length>0?`Results (${t.length} rows total, showing up to 10):
${JSON.stringify(t.slice(0,10),null,2)}`:a?`Chart description: ${a}`:"No result data available.",u=[{role:"system",content:p},{role:"user",content:`Question: ${i}

SQL:
${r}

${l}`}],h=performance.now();let n="",d=0;const m=await o.chat.completions.create({messages:u,temperature:.3,max_tokens:256,stream:!0});for await(const s of m){const e=s.choices[0]?.delta?.content??"";e&&(n+=e,c(e)),d+=s.usage?.completion_tokens??0}return performance.now()-h,n}export{f as askNarrator};
