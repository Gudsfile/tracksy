import{t as e}from"./devBus.DRONl0Hn.js";import{r as t}from"./assistant-config.BVzPMrWw.js";import{t as n}from"./types.DZzuE3ID.js";import{t as r}from"./shortcuts.C3f7CBG1.js";import{o as i,r as a,t as o}from"./prompt.BFkjyAod.js";var s=4,c=24,l=`\
You help someone explore their own music listening history. They are part-way through typing a question. Propose ${s} complete questions they might have meant, so they can click one instead of finishing the sentence.

${a}

Style examples (match this tone and length):
${r.map(e=>`  - ${e.question}`).join(`
`)}

Rules:
- Every question must be answerable from the schema above. Never ask about genres, lyrics, moods, friends, or anything not present in the data.
- Continue the user's partial input — stay on the subject they started. Do not drift to unrelated topics.
- Write questions in the user's own voice, using "my" and "I".
- Make the ${s} questions meaningfully different from each other, not four rewordings of one idea.
- Each label is a short chip caption, at most ${c} characters, no trailing punctuation.
- If real artist names are provided below, feel free to use them.

Respond with ONLY a JSON array, no prose and no code fences:
[{"label": "Top artists", "question": "Who are my top 5 most listened to artists?"}]`;function u(e){let t;try{t=JSON.parse(i(e))}catch{return[]}if(!Array.isArray(t))return[];let n=[],r=new Set;for(let e of t){if(typeof e!=`object`||!e)continue;let{label:t,question:i}=e;if(typeof t!=`string`||typeof i!=`string`)continue;let a=t.trim(),o=i.trim();if(!(!a||!o)&&!r.has(o)&&(r.add(o),n.push({label:a.slice(0,c),question:o}),n.length===s))break}return n}async function d(r,i,a,s){if(s?.aborted)return[];let c=a?`\n\n${a}`:``,d=[{role:`system`,content:l},{role:`user`,content:`[Today is ${o}.]${c}\n\nPartial input: "${i}"`}],f=performance.now(),p;try{let e=r.chat.completions.create({messages:d,temperature:.4,max_tokens:200});if(s){let t=new Promise((e,t)=>{s.addEventListener(`abort`,()=>{r.interruptGenerate(),t(new n(`Cancelled`,`aborted`))})});p=await Promise.race([e,t])}else p=await e}catch{return[]}let m=performance.now()-f,h=p.usage?.completion_tokens??0;e.emit(`webllm:inference`,{model:t(),durationMs:m,tokensPerSec:m>0?h/(m/1e3):0,kind:`suggestions`});let g=p.choices?.[0]?.message?.content;return g?u(g):[]}export{d as askSuggestions,u as parseSuggestions};