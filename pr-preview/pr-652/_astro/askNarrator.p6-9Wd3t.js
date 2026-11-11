function e(e){return e.map(e=>{if(!(`ms_played`in e))return e;let{ms_played:t,...n}=e,r=typeof t==`number`?Math.round(t/36e5*100)/100:t;return{...n,hours_played:r}})}function t(e){if(e.length===0)return`(no data)`;let t=e.slice(0,10),n=Object.keys(t[0]);return`${`| ${n.join(` | `)} |`}\n${`| ${n.map(()=>`---`).join(` | `)} |`}\n${t.map(e=>`| ${n.map(t=>String(e[t]??``)).join(` | `)} |`).join(`
`)}`}async function n(n,r,i,a,o){let s=e(i.slice(0,10)),c=[{role:`system`,content:`You are a witty music companion who comments on someone's listening data like a knowledgeable friend, not a report generator.

Given the user's question and their actual streaming data, write 1-3 engaging sentences that feel like a personal observation — highlight what is striking, dominant, or worth noticing in the numbers.

Rules:
- Ground every claim in the provided data. Never invent names, numbers, or genres not in the results.
- Lead with an insight or observation, not a list. Avoid starting with "Based on the data" or "According to the results".
- Use "you" and speak conversationally.
- hours_played is already computed in the data (ms ÷ 3 600 000). Use it directly — never invent or recalculate time values.
- If one item clearly dominates, say so. If the top and second are close, note that.
- Keep it to 1-3 sentences. Be warm, not formal.
- If no data is available, say so briefly in one sentence.`},{role:`user`,content:`Question: ${r}\n\n${s.length>0?`Data (${i.length} rows total, showing up to 10):\n${t(s)}`:o?`Chart description: ${o}`:`No result data available.`}`}],l=``,u=await n.chat.completions.create({messages:c,temperature:.3,max_tokens:256,stream:!0});for await(let e of u){let t=e.choices[0]?.delta?.content??``;t&&(l+=t,a(t))}return l}export{n as askNarrator};