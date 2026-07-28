import{t as e}from"./devBus.DRONl0Hn.js";import{r as t}from"./assistant-config.BVzPMrWw.js";import{t as n}from"./types.DZzuE3ID.js";import{t as r}from"./shortcuts.C3f7CBG1.js";import{r as i,t as a}from"./prompt.BzSAaBml.js";var o=4,s=24,c=`\
You help someone explore their own music listening history. They are part-way through typing a question. Propose ${o} complete questions they might have meant, so they can click one instead of finishing the sentence.

${i}

Style examples (match this tone and length):
${r.map(e=>`  - ${e.question}`).join(`
`)}

Rules:
- Every question must be answerable from the schema above. Never ask about genres, lyrics, moods, friends, or anything not present in the data.
- Continue the user's partial input — stay on the subject they started. Do not drift to unrelated topics.
- Write questions in the user's own voice, using "my" and "I".
- Make the ${o} questions meaningfully different from each other, not four rewordings of one idea.
- Each label is a short chip caption, at most ${s} characters, no trailing punctuation.
- If real artist names are provided below, feel free to use them.

Respond with ONLY a JSON array, no prose and no code fences:
[{"label": "Top artists", "question": "Who are my top 5 most listened to artists?"}]`;function l(e){let t=e.match(/```(?:json)?\s*([\s\S]*?)\s*```/i),r=t?t[1]:e,i=r.indexOf(`[`);if(i===-1)throw new n(`No JSON array found in model output.`,`parse`);let a=0,o=!1,s=!1;for(let e=i;e<r.length;e++){let t=r[e];if(s){s=!1;continue}if(t===`\\`){s=!0;continue}if(t===`"`){o=!o;continue}if(!o){if(t===`[`)a++;else if(t===`]`&&(a--,a===0))return r.slice(i,e+1)}}throw new n(`Unbalanced JSON brackets in model output.`,`parse`)}function u(e){let t;try{t=JSON.parse(l(e))}catch{return[]}if(!Array.isArray(t))return[];let n=[],r=new Set;for(let e of t){if(typeof e!=`object`||!e)continue;let{label:t,question:i}=e;if(typeof t!=`string`||typeof i!=`string`)continue;let a=t.trim(),c=i.trim();if(!(!a||!c)&&!r.has(c)&&(r.add(c),n.push({label:a.slice(0,s),question:c}),n.length===o))break}return n}async function d(r,i,o,s){if(s?.aborted)return[];let l=o?`\n\n${o}`:``,d=[{role:`system`,content:c},{role:`user`,content:`[Today is ${a}.]${l}\n\nPartial input: "${i}"`}],f=performance.now(),p;try{let e=r.chat.completions.create({messages:d,temperature:.4,max_tokens:200});if(s){let t=new Promise((e,t)=>{if(s.aborted){t(new n(`Cancelled`,`aborted`));return}s.addEventListener(`abort`,()=>t(new n(`Cancelled`,`aborted`)))});p=await Promise.race([e,t])}else p=await e}catch{return[]}let m=performance.now()-f,h=p.usage?.completion_tokens??0;e.emit(`webllm:inference`,{model:t(),durationMs:m,tokensPerSec:m>0?h/(m/1e3):0});let g=p.choices?.[0]?.message?.content;return g?u(g):[]}export{d as askSuggestions};