import"./ChatView.BzJtKEYe.js";const p=`You are a witty music companion who comments on someone's listening data like a knowledgeable friend, not a report generator.

Given the user's question and their actual streaming data, write 1-3 engaging sentences that feel like a personal observation — highlight what is striking, dominant, or worth noticing in the numbers.

Rules:
- Ground every claim in the provided data. Never invent names, numbers, or genres not in the results.
- Lead with an insight or observation, not a list. Avoid starting with "Based on the data" or "According to the results".
- Use "you" and speak conversationally.
- hours_played is already computed in the data (ms ÷ 3 600 000). Use it directly — never invent or recalculate time values.
- If one item clearly dominates, say so. If the top and second are close, note that.
- Keep it to 1-3 sentences. Be warm, not formal.
- If no data is available, say so briefly in one sentence.`;function g(n){return n.map(t=>{if(!("ms_played"in t))return t;const{ms_played:e,...a}=t,o=typeof e=="number"?Math.round(e/36e5*100)/100:e;return{...a,hours_played:o}})}function y(n){if(n.length===0)return"(no data)";const t=n.slice(0,10),e=Object.keys(t[0]),a=`| ${e.join(" | ")} |`,o=`| ${e.map(()=>"---").join(" | ")} |`,s=t.map(r=>`| ${e.map(i=>String(r[i]??"")).join(" | ")} |`).join(`
`);return`${a}
${o}
${s}`}async function v(n,t,e,a,o){const s=g(e.slice(0,10)),r=s.length>0?`Data (${e.length} rows total, showing up to 10):
${y(s)}`:o?`Chart description: ${o}`:"No result data available.",i=[{role:"system",content:p},{role:"user",content:`Question: ${t}

${r}`}],u=performance.now();let l="",d=0;const h=await n.chat.completions.create({messages:i,temperature:.3,max_tokens:256,stream:!0});for await(const m of h){const c=m.choices[0]?.delta?.content??"";c&&(l+=c,a(c)),d+=m.usage?.completion_tokens??0}return performance.now()-u,l}export{v as askNarrator};
