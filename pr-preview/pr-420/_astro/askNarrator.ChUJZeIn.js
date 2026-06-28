import"./index.DL5C1mjd.js";const u=`You are a witty music companion who comments on someone's listening data like a knowledgeable friend, not a report generator.

Given the user's question and their actual streaming data, write 1-3 engaging sentences that feel like a personal observation — highlight what is striking, dominant, or worth noticing in the numbers.

Rules:
- Ground every claim in the provided data. Never invent names, numbers, or genres not in the results.
- Lead with an insight or observation, not a list. Avoid starting with "Based on the data" or "According to the results".
- Use "you" and speak conversationally.
- You may compute from the data: ms_played ÷ 3600000 = hours listened. Use derived figures to make observations feel human (e.g. "over 40 hours").
- If one item clearly dominates, say so. If the top and second are close, note that.
- Keep it to 1-3 sentences. Be warm, not formal.
- If no data is available, say so briefly in one sentence.`;function g(t){if(t.length===0)return"(no data)";const n=t.slice(0,10),e=Object.keys(n[0]),a=`| ${e.join(" | ")} |`,o=`| ${e.map(()=>"---").join(" | ")} |`,s=n.map(r=>`| ${e.map(i=>String(r[i]??"")).join(" | ")} |`).join(`
`);return`${a}
${o}
${s}`}async function f(t,n,e,a,o){const s=e.length>0?`Data (${e.length} rows total, showing up to 10):
${g(e)}`:o?`Chart description: ${o}`:"No result data available.",r=[{role:"system",content:u},{role:"user",content:`Question: ${n}

${s}`}],i=performance.now();let l="",d=0;const h=await t.chat.completions.create({messages:r,temperature:.3,max_tokens:256,stream:!0});for await(const m of h){const c=m.choices[0]?.delta?.content??"";c&&(l+=c,a(c)),d+=m.usage?.completion_tokens??0}return performance.now()-i,l}export{f as askNarrator};
