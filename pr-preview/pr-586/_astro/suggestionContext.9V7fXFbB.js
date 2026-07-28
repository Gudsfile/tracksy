import{o as e}from"./constants.th95jnuK.js";import{n as t}from"./queryDBCached.BB8qriPT.js";var n=`
SELECT artist_name, COUNT(*) AS plays
FROM ${e}
WHERE artist_name IS NOT NULL
GROUP BY artist_name
ORDER BY plays DESC
LIMIT 10`,r=`
SELECT MIN(EXTRACT(year FROM ts)) AS first_year,
       MAX(EXTRACT(year FROM ts)) AS last_year
FROM ${e}`;async function i(){try{let[e,i]=await Promise.all([t(n,`suggestionContext`),t(r,`suggestionContext`)]),a=e.map(e=>e.artist_name).filter(e=>typeof e==`string`&&e.length>0),o=[];a.length>0&&o.push(`The user's most played artists: ${a.join(`, `)}.`);let{first_year:s,last_year:c}=i[0]??{};return s&&c&&o.push(`Their history covers ${s} to ${c}. Do not suggest years outside that range.`),o.length>0?o.join(`
`):void 0}catch{return}}export{i as getSuggestionContext};