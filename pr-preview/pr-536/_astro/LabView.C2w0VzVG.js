import{n as e}from"./react-dom.673hvCjg.js";import{a as t,d as n,i as r,l as i,n as a,o,p as s,t as c,u as l}from"./InsightCard.DZ85Q9lC.js";import{r as u}from"./getDB.COZ4IwAq.js";import{i as d,o as f}from"./constants.th95jnuK.js";import{n as p,r as m,t as h}from"./useDebouncedValue.DpUZQaLZ.js";import{C as g,S as _,T as v,_ as y,a as b,b as x,c as S,d as ee,f as C,g as te,h as w,i as ne,l as T,m as E,n as D,o as O,p as k,r as re,s as ie,t as A,u as j,v as M,w as ae,x as N,y as oe}from"./src.IxFFejw-.js";var P=e(),se=`with spine as (
    select \${spineTimeTrunc} as ts
    from generate_series(\${spineStart}, \${spineEnd}, \${step}) as t (dt)
),

stream_agg as (
    select
        \${streamTimeTrunc} as ts,
        count(distinct \${entity_column}) as distinct_count,
        count(*) - count(distinct \${entity_column}) as repeat_count,
        count(*) as total_count
    from \${table}
    where \${year_condition}
    group by \${streamTimeTrunc}
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.distinct_count, 0)::int as distinct_count,
    coalesce(stream_agg.repeat_count, 0)::int as repeat_count,
    coalesce(stream_agg.total_count, 0)::int as total_count
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
`,ce=`select
    count(distinct \${entity_column})::int as total_distinct,
    (count(*) - count(distinct \${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from \${table}
where \${year_condition}
`,le={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function ue(e,t){let n=o(e);return ce.replaceAll("${entity_column}",w[t]).replaceAll("${table}",f).replaceAll("${year_condition}",n)}function de(e,t,n){let r=o(e),i=e!==void 0,{periodTrunc:a,spineStart:s,spineEnd:c,step:l}=le[t],u=`(select min(ts::date) from ${f} where ${r})`,d=`(select max(ts::date) from ${f} where ${r})`;return se.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${streamTimeTrunc}",a(`ts::date`)).replaceAll("${entity_column}",w[n]).replaceAll("${spineStart}",s(u,i)).replaceAll("${spineEnd}",c(d,i)).replaceAll("${step}",l).replaceAll("${table}",f).replaceAll("${year_condition}",r)}var F=u(),fe=({data:e,stats:n,year:i,granularity:o,availableGranularities:s,onGranularityChange:c,entity:l,onEntityChange:u,isLoading:d})=>{let[f,p]=(0,P.useState)(null),m=n?.total_distinct??0,h=(n?.total_streams??0)>0?Math.round((n?.total_distinct??0)/(n?.total_streams??0)*100):0,y=e?.length?Math.max(...e.map(e=>e.total_count)):0,b=o!==`month`||i===void 0;return(0,F.jsxs)(t,{title:`Stream Variety`,emoji:`🔀`,isLoading:d,question:`How varied was my listening?`,headerActions:(0,F.jsx)(k,{value:l,onChange:u}),children:[(0,F.jsx)(g,{value:o,available:s,onChange:c}),!e?.length||(n?.total_streams??0)===0?(0,F.jsx)(r,{message:i===void 0?`No data`:`No data for this year`}):(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,F.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>(0,F.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${y>0?e.total_count/y*100:0}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,distinct_count:e.distinct_count,repeat_count:e.repeat_count,total_count:e.total_count})},children:[(0,F.jsx)(`div`,{className:`bg-yellow-400`,style:{flex:e.repeat_count}}),(0,F.jsx)(`div`,{className:`bg-orange-400`,style:{flex:e.distinct_count||+(e.total_count>0)}})]},e.ts))}),(0,F.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let r=ae(t.ts,e[n-1]?.ts,i,o);return(0,F.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${b?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:r},t.ts)})})]}),(0,F.jsx)(E,{items:[{color:`bg-orange-400`,label:`Distinct`},{color:`bg-yellow-400`,label:`Re-listens`}]}),(0,F.jsxs)(N,{children:[(0,F.jsx)(_,{label:`Unique ${C[l]}s listened`,value:m.toLocaleString()}),(0,F.jsx)(_,{label:(0,F.jsxs)(F.Fragment,{children:[`Variety rate`,(0,F.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(unique / total streams)`})]}),value:`${h}%`})]}),l!==`tracks`&&(0,F.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,F.jsx)(a,{x:f.x,y:f.y,title:v(f.ts,o),rows:[`${f.distinct_count.toLocaleString()} distinct`,`${f.repeat_count.toLocaleString()} re-listens`,`${f.total_count>0?Math.round(f.distinct_count/f.total_count*100):0}% variety`,`${f.distinct_count>0?Math.round(f.total_count/f.distinct_count):0} avg listens/${C[l]}`]})]})};function pe({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=x(e),[a,o]=(0,P.useState)(`tracks`),{data:s,isLoading:c}=i({query:de(e,r,a),year:e}),{data:l}=i({query:ue(e,a),year:e}),u=l?.[0];return(0,F.jsx)(fe,{data:s,stats:u,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,entity:a,onEntityChange:o,isLoading:c})}var me=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function I(e){return me.replaceAll("${table}",f).replaceAll("${year_condition}",o(e))}var L=3,R=24,z=Array.from({length:7},(e,t)=>t%2==0?``:new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`}));function B(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r)}function V(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function H(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}var U=e=>e.streak>0,W=e=>e.streak===0&&e.prevStreak>0&&e.inRange,he=e=>U(e)||W(e);function ge(e,t){return U(e)?`rgba(34,197,94,${Math.max(.2,e.streak/t)})`:W(e)?`rgba(239,68,68,0.45)`:e.inRange?null:`transparent`}function G(e){return new Date(e+`T00:00:00`).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`})}function _e({data:e,year:n,isLatestYear:i,isLoading:o}){let s=(0,P.useRef)(null),[c,l]=(0,P.useState)(null),{cells:u,maxStreak:d,bestStreakEnd:f,bestStreakStart:p,currentStreak:m}=(0,P.useMemo)(()=>{if(!e||e.length===0)return{cells:[],maxStreak:0,bestStreakEnd:``,bestStreakStart:``,currentStreak:0};let t=new Set(e.map(e=>e.stream_date)),r=[...t].sort(),i=r[0],a=r[r.length-1],o=n===void 0?i:`${n}-01-01`,s=n===void 0?a:`${n}-12-31`,c=[],l=B(o),u=B(s),d=0,f=0,p=``,m=0;for(;l<=u;){let e=V(l),r=d;d=t.has(e)?r+1:0;let o=n===void 0?!0:e>=i&&e<=a;c.push({day:e,streak:d,prevStreak:r,inRange:o}),d>f&&(f=d,p=e),t.has(e)&&(m=d),l.setDate(l.getDate()+1)}let h=``;return p&&f>0&&(h=V(H(B(p),-(f-1)))),{cells:c,maxStreak:f,bestStreakEnd:p,bestStreakStart:h,currentStreak:m}},[e,n]),{weeks:h,monthLabels:g,weekCount:v}=(0,P.useMemo)(()=>{if(u.length===0)return{weeks:[],monthLabels:[],weekCount:0};let e=new Map(u.map(e=>[e.day,e])),t=B(u[0].day),n=B(u[u.length-1].day),r=new Date(t);r.setDate(r.getDate()-r.getDay());let i=new Date(n);i.setDate(i.getDate()+(6-i.getDay()));let a=(Math.round((i.getTime()-r.getTime())/864e5)+1)/7,o=[];for(let t=0;t<a;t++){let n=[];for(let i=0;i<7;i++){let a=V(H(r,t*7+i));n.push(e.get(a)??null)}o.push(n)}let s=[],c=-1,l=-1;for(let e=0;e<o.length;e++){let t=o[e].find(e=>e!==null);if(!t)continue;let n=B(t.day),r=n.getMonth(),i=n.getFullYear();if(r!==c){let t=i!==l,a=n.toLocaleDateString(void 0,{month:`short`});s.push({weekIdx:e,label:t?`${a} '${String(i).slice(2)}`:a}),c=r,l=i}}return{weeks:o,monthLabels:s,weekCount:a}},[u]);(0,P.useEffect)(()=>{let e=s.current;e&&(n===void 0?e.scrollLeft=e.scrollWidth:e.scrollLeft=0)},[n,u]);let y=!e||e.length===0,b=R+v*13,x=`${R}px repeat(${v}, 1fr)`;return(0,F.jsxs)(t,{title:`Listening Streaks`,emoji:`🔥`,question:`How consistent is your listening?`,isLoading:o,children:[y?(0,F.jsx)(r,{}):(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(`div`,{ref:s,className:`overflow-x-auto pb-4`,onMouseLeave:()=>l(null),children:(0,F.jsxs)(`div`,{style:{minWidth:`${b}px`},children:[(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:x,marginBottom:2},children:[(0,F.jsx)(`div`,{}),Array.from({length:v},(e,t)=>(0,F.jsx)(`div`,{className:`text-[9px] text-gray-400 dark:text-gray-600`,children:g.find(e=>e.weekIdx===t)?.label??``},t))]}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:x,gridTemplateRows:`repeat(7, auto)`,gap:`${L}px`},children:[z.map((e,t)=>(0,F.jsx)(`div`,{style:{gridColumn:1,gridRow:t+1},className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:e},`label-${t}`)),h.flatMap((e,t)=>e.map((e,n)=>{let r=e?U(e)?`streak-cell-active`:W(e)?`streak-cell-break`:void 0:void 0,i=e?ge(e,d):`transparent`;return(0,F.jsx)(`div`,{"data-testid":r,style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`,backgroundColor:i??void 0},className:`rounded-xs ${i===null?`bg-gray-100 dark:bg-slate-700/50`:``}`,onMouseEnter:e&&he(e)?t=>{let n=t.currentTarget.getBoundingClientRect();l({cell:e,x:n.left+n.width/2,y:n.top})}:void 0},`${t}-${n}`)}))]})]})}),(0,F.jsxs)(N,{children:[(0,F.jsx)(_,{label:`Best streak`,value:(0,F.jsxs)(F.Fragment,{children:[d,` day`,d===1?``:`s`,p&&f&&(0,F.jsxs)(`span`,{className:`font-normal text-gray-500 dark:text-gray-400`,children:[` `,`·`,` `,G(p),` `,`–`,` `,G(f)]})]})}),i&&(0,F.jsx)(_,{label:`Current streak`,value:`${m} day${m===1?``:`s`}`})]})]}),c&&(0,F.jsx)(a,{x:c.x,y:c.y,title:G(c.cell.day),rows:[c.cell.streak>0?`Day ${c.cell.streak} of streak`:`Streak broken`]})]})}function ve({year:e,isLatestYear:t}){let{data:n,isLoading:r}=i({query:I(e),year:e});return(0,F.jsx)(_e,{data:n,year:e,isLatestYear:t,isLoading:r})}var ye=`with artist_yearly_play_counts as (
    select
        year(ts::datetime)::int as stream_year,
        artist_name as artist,
        count(*)::int as play_count
    from \${table}
    where artist_name is not null
    group by stream_year, artist
),

artist_total_play_counts as (
    select
        artist,
        sum(play_count)::int as total_play_count
    from artist_yearly_play_counts
    group by artist
),

top_10_global_artists as (
    select artist
    from artist_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        stream_year,
        artist,
        play_count,
        row_number()
            over (partition by stream_year order by play_count desc)
        ::int as stream_rank
    from artist_yearly_play_counts
)

select
    yr.stream_year,
    yr.artist,
    yr.stream_rank,
    yr.play_count
from yearly_ranks as yr
inner join top_10_global_artists as t10 on yr.artist = t10.artist
order by yr.stream_year, yr.stream_rank
`;function be(){return ye.replaceAll("${table}",f)}function xe({data:e}){let t=(0,P.useRef)(null);return(0,P.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.artist===t.artist?e.stream_year-t.stream_year:e.artist.localeCompare(t.artist)),r=[...Array.from(new Set(n.map(e=>e.artist))).map(e=>{let t=n.filter(t=>t.artist===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=b({title:`Global Top 10 Artists Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[A(n,{x:`stream_year`,y:`stream_rank`,stroke:`artist`,strokeWidth:2.5}),D(n,{x:`stream_year`,y:`stream_rank`,fill:`artist`,r:4}),S(i,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),S(a,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),O(n,j({x:`stream_year`,y:`stream_rank`,title:e=>`${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,F.jsx)(`div`,{ref:t})}function Se(){let[e,t]=(0,P.useState)([]);return(0,P.useEffect)(()=>{(async()=>{t(await l(be()))})()},[]),e.length===0?null:(0,F.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,F.jsx)(xe,{data:e})})}var Ce=`with
max_date as (
    select max(ts::date) as last_date
    from \${table}
),

album_listening as (
    select
        t.album_name,
        t.artist_name,
        year(t.ts::date)::int as stream_year,
        count(*) as playing_days_count
    from \${table} as t, max_date
    group by t.album_name, t.artist_name, t.ts::date
    -- arbitrary threshold: an album listen is counted from 7 distinct tracks
    -- conservative lower bound of average album length
    having count(distinct t.track_name) >= 7
),

album_yearly_play_counts as (
    select
        stream_year,
        album_name as album,
        artist_name as artist,
        count(*)::int as play_count
    from album_listening
    group by stream_year, album_name, artist_name
),

album_total_play_counts as (
    select
        album,
        artist,
        sum(play_count)::int as total_play_count
    from album_yearly_play_counts
    group by album, artist
),

top_10_global_albums as (
    select
        album,
        artist
    from album_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        stream_year,
        album,
        artist,
        play_count,
        row_number()
            over (partition by stream_year order by play_count desc)
        ::int as stream_rank
    from album_yearly_play_counts
)

select
    yr.stream_year,
    yr.album,
    yr.artist,
    yr.stream_rank,
    yr.play_count
from yearly_ranks as yr
inner join top_10_global_albums using (artist, album)
order by yr.stream_year, yr.stream_rank
`;function we(){return Ce.replaceAll("${table}",f)}function Te({data:e}){let t=(0,P.useRef)(null);return(0,P.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.album===t.album?e.stream_year-t.stream_year:e.album.localeCompare(t.album)),r=[...Array.from(new Set(n.map(e=>e.album))).map(e=>{let t=n.filter(t=>t.album===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=b({title:`Global Top 10 Albums Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[A(n,{x:`stream_year`,y:`stream_rank`,stroke:`album`,strokeWidth:2.5}),D(n,{x:`stream_year`,y:`stream_rank`,fill:`album`,r:4}),S(i,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),S(a,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),O(n,j({x:`stream_year`,y:`stream_rank`,title:e=>`${e.album} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,F.jsx)(`div`,{ref:t})}function Ee(){let[e,t]=(0,P.useState)([]);return(0,P.useEffect)(()=>{(async()=>{t(await l(we()))})()},[]),e.length===0?null:(0,F.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,F.jsx)(Te,{data:e})})}var De=`with track_yearly_play_counts as (
    select
        year(ts::datetime)::int as stream_year,
        track_name,
        artist_name,
        count(*)::int as play_count
    from \${table}
    where track_name is not null
    group by stream_year, track_name, artist_name
),

track_total_play_counts as (
    select
        track_name,
        artist_name,
        sum(play_count)::int as total_play_count
    from track_yearly_play_counts
    group by track_name, artist_name
),

top_10_global_tracks as (
    select
        track_name,
        artist_name
    from track_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        stream_year,
        track_name,
        artist_name,
        play_count,
        row_number()
            over (partition by stream_year order by play_count desc)
        ::int as stream_rank
    from track_yearly_play_counts
)

select
    yr.stream_year,
    yr.track_name as track,
    yr.artist_name as artist,
    yr.stream_rank,
    yr.play_count
from yearly_ranks as yr
inner join
    top_10_global_tracks
on yr.track_name = top_10_global_tracks.track_name
and yr.artist_name = top_10_global_tracks.artist_name
order by yr.stream_year, yr.stream_rank
`;function Oe(){return De.replaceAll("${table}",f)}function ke({data:e}){let t=(0,P.useRef)(null);return(0,P.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.track===t.track?e.stream_year-t.stream_year:e.track.localeCompare(t.track)),r=[...Array.from(new Set(n.map(e=>e.track))).map(e=>{let t=n.filter(t=>t.track===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=b({title:`Global Top 10 Track Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[A(n,{x:`stream_year`,y:`stream_rank`,stroke:`track`,strokeWidth:2.5}),D(n,{x:`stream_year`,y:`stream_rank`,fill:`track`,r:4}),S(i,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),S(a,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),O(n,j({x:`stream_year`,y:`stream_rank`,title:e=>`${e.track} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,F.jsx)(`div`,{ref:t})}function Ae(){let[e,t]=(0,P.useState)([]);return(0,P.useEffect)(()=>{(async()=>{t(await l(Oe()))})()},[]),e.length===0?null:(0,F.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,F.jsx)(ke,{data:e})})}var je={artists:`with daily_streams as (
    select
        date_trunc('day', ts::datetime)::date as stream_date,
        artist_name as entity_name,
        count(*)::int as daily_plays
    from \${table}
    where artist_name is not null
    \${yearFilter}
    GROUP BY stream_date, entity_name
)

select
    entity_name,
    sum(daily_plays)
        over (
            partition by entity_name
            order by
                stream_date asc
            rows between unbounded preceding and current row
        )
    ::int as play_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily_streams
order by stream_date_ts asc
`,tracks:`with daily_streams as (
    select
        date_trunc('day', ts::datetime)::date as stream_date,
        count(*)::int as daily_plays,
        track_name || ' — ' || artist_name as entity_name
    from \${table}
    where track_name is not null and artist_name is not null
    \${yearFilter}
    GROUP BY stream_date, entity_name
)

select
    entity_name,
    sum(daily_plays) over (
        partition by entity_name
        order by stream_date asc
        rows between unbounded preceding and current row
    )::int as play_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily_streams
order by stream_date_ts asc
`,albums:`with daily_streams as (
    select
        date_trunc('day', ts::datetime)::date as stream_date,
        album_name as entity_name,
        count(*)::int as daily_plays
    from \${table}
    where album_name is not null
    \${yearFilter}
    GROUP BY stream_date, entity_name
)

select
    entity_name,
    sum(daily_plays) over (
        partition by entity_name
        order by stream_date asc
        rows between unbounded preceding and current row
    )::int as play_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily_streams
order by stream_date_ts asc
`};function Me(e,t=`artists`){let n=je[t].replaceAll("${table}",f);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function K(e,t){let n=(0,P.useRef)(e),[r,i]=(0,P.useState)(t);return(0,P.useEffect)(()=>{e!==n.current&&(n.current=e,i(t))},[e,t]),r}var q=[`bg-blue-500`,`bg-red-500`,`bg-green-500`,`bg-yellow-500`,`bg-purple-500`,`bg-pink-500`,`bg-indigo-500`,`bg-teal-500`,`bg-orange-500`,`bg-cyan-500`],Ne=120,J=44,Y=60;function Pe({data:e,entityType:t}){let{frames:n,entityColors:r}=(0,P.useMemo)(()=>{let t=Array.from(new Set(e.map(e=>e.stream_date_ts))).sort((e,t)=>e-t),n=new Map,r=[],i=new Map,a=0,o=new Map;for(let t of e)o.has(t.stream_date_ts)||o.set(t.stream_date_ts,[]),o.get(t.stream_date_ts).push(t);for(let e of t){let t=o.get(e)||[];for(let e of t)n.set(e.entity_name,e.play_count),i.has(e.entity_name)||(i.set(e.entity_name,q[a%q.length]),a++);let s=Array.from(n.entries()).sort((e,t)=>t[1]-e[1]).slice(0,10);r.push({dateTs:e,top10:s.map(([e,t])=>({label:e,play_count:t})),maxScore:Math.max(1,s[0]?.[1]||1)})}return{frames:r,entityColors:i}},[e]),{containerRef:i,currentFrameIdx:a,isPlaying:o,speedMultiplier:s,onFrameChange:c,onSpeedChange:l,onPlayPause:u}=y({frameCount:n.length,baseSpeed:Ne,entityType:t}),d=n[a];return d?(0,F.jsxs)(`div`,{ref:i,className:`flex flex-col gap-4 w-full`,children:[(0,F.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[new Date(d.dateTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,F.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· daily`})]}),(0,F.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:Y},children:(0,F.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`streams`})}),(0,F.jsx)(`div`,{className:`relative w-full`,style:{height:d.top10.length*J},children:d.top10.map((e,t)=>{let n=e.play_count/d.maxScore*100;return(0,F.jsxs)(`div`,{className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${t*J}px`,zIndex:10-t},children:[(0,F.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,F.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,F.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,F.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,F.jsx)(`div`,{className:`ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:Y},children:e.play_count.toLocaleString()})]},e.label)})}),n.length>1&&(0,F.jsx)(M,{frameCount:n.length,startTs:n[0].dateTs,endTs:n[n.length-1].dateTs,currentFrameIdx:a,speedMultiplier:s,isPlaying:o,onFrameChange:c,onSpeedChange:l,onPlayPause:u})]}):null}function Fe({year:e}){let[n,a]=(0,P.useState)(`artists`),{data:o,isLoading:s}=i({query:Me(e,n),year:e}),c=o??[],l=K(o,n);return(0,F.jsx)(t,{title:`Top 10 Race`,emoji:`🏎️`,className:`md:col-span-2 lg:col-span-3`,isLoading:s&&c.length===0,question:`Who dominated my listening, and when did they rise?`,headerActions:(0,F.jsx)(k,{value:n,onChange:a}),children:c.length===0?(0,F.jsx)(r,{}):(0,F.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:s?.4:1},children:(0,F.jsx)(Pe,{data:c,entityType:l})})})}var Ie={artists:`select
    artist_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,tracks:`select
    count(*)::int as period_plays,
    track_name || ' — ' || artist_name as entity_name,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where track_name is not null and artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,albums:`select
    album_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where album_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`};function Le(e,t=`artists`){let n=Ie[t].replaceAll("${table}",f);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function X({ranking:e,activeLabels:t}){return(0,F.jsxs)(`div`,{className:`flex flex-col`,children:[(0,F.jsx)(`span`,{className:`text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3`,children:`Longevity Leaderboard`}),(0,F.jsx)(`div`,{className:`flex flex-col gap-0.5`,children:e.map((e,n)=>(0,F.jsxs)(`div`,{className:`flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors`,children:[(0,F.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono`,children:n+1}),(0,F.jsx)(`span`,{className:`text-sm truncate flex-1 min-w-0 ${t.has(e.label)?`font-bold text-gray-900 dark:text-white`:`font-normal text-gray-500 dark:text-gray-400`}`,children:e.label}),(0,F.jsxs)(`span`,{className:`text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0`,children:[e.periodsInTop10,`w`]}),(0,F.jsx)(`span`,{className:`text-xs font-mono shrink-0 w-8 text-right`,children:e.rankDelta===null?(0,F.jsx)(`span`,{className:`text-blue-400`,children:`new`}):e.rankDelta>0?(0,F.jsxs)(`span`,{className:`text-emerald-400`,children:[`↑`,e.rankDelta]}):e.rankDelta<0?(0,F.jsxs)(`span`,{className:`text-red-400`,children:[`↓`,Math.abs(e.rankDelta)]}):(0,F.jsx)(`span`,{className:`text-gray-400 opacity-40`,children:`—`})})]},e.label))})]})}var Re=240,Z=44,Q=62;function ze({data:e,entityType:t}){let{frames:n,entityColors:r,streakRecord:i}=(0,P.useMemo)(()=>{let t=[...new Set(e.map(e=>e.period_ts))].sort((e,t)=>e-t),n=Math.exp(-.2),r=new Map;for(let t of e)r.has(t.period_ts)||r.set(t.period_ts,[]),r.get(t.period_ts).push({label:t.entity_name,plays:t.period_plays});let i=new Map,a=new Map,o=new Map,s=new Map,c=new Map,l=0,u=[];for(let e of t){for(let[e,t]of i)i.set(e,t*n);for(let{label:t,plays:n}of r.get(e)??[])i.set(t,(i.get(t)??0)+n),c.has(t)||(c.set(t,q[l%q.length]),l++);let t=[...i.entries()].filter(([,e])=>e>.01).sort((e,t)=>t[1]-e[1]).slice(0,10),d=new Set(t.map(([e])=>e));for(let[e]of t){a.set(e,(a.get(e)??0)+1),o.set(e,(o.get(e)??0)+1);let t=o.get(e);t>(s.get(e)??0)&&s.set(e,t)}for(let[e]of i)!d.has(e)&&(o.get(e)??0)>0&&o.set(e,0);let f=t[0]?.[1]??1,p=u.length>0?u[u.length-1].ghostRanking:[],m=new Map(p.map((e,t)=>[e.label,t])),h=[...a.entries()].sort((e,t)=>t[1]-e[1]).slice(0,10).map(([e,t],n)=>({label:e,periodsInTop10:t,rankDelta:p.length===0?null:m.has(e)?m.get(e)-n:null}));u.push({periodTs:e,top10:t.map(([e,t])=>({label:e,score:t,periodsInTop10:a.get(e)??0})),maxScore:f,ghostRanking:h})}let d={label:``,weeks:0};for(let[e,t]of s)t>d.weeks&&(d={label:e,weeks:t});return{frames:u,entityColors:c,streakRecord:d}},[e]),{containerRef:a,currentFrameIdx:o,isPlaying:s,speedMultiplier:l,onFrameChange:u,onSpeedChange:d,onPlayPause:f}=y({frameCount:n.length,baseSpeed:Re,entityType:t}),p=n[o],m=(0,P.useMemo)(()=>new Set(p?.top10.map(e=>e.label)??[]),[p]);return p?(0,F.jsxs)(`div`,{ref:a,className:`flex flex-col gap-4 w-full`,children:[(0,F.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[`Week of `+new Date(p.periodTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,F.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· weekly`})]}),(0,F.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-6`,children:[(0,F.jsxs)(`div`,{className:`md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4`,children:[(0,F.jsx)(X,{ranking:p.ghostRanking,activeLabels:m}),i.weeks>0&&(0,F.jsxs)(c,{children:[(0,F.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 mb-0.5`,children:`🔥 Longest streak`}),o>=n.length-1?(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`span`,{className:`font-bold`,children:i.label}),(0,F.jsxs)(`span`,{className:`text-xs font-normal text-gray-500 dark:text-gray-400 ml-1`,children:[i.weeks,` consecutive weeks`]})]}):(0,F.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 italic`,children:`Watch till the end to find out…`})]})]}),(0,F.jsxs)(`div`,{className:`md:col-span-2 flex flex-col`,children:[(0,F.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:Q},children:(0,F.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`score`})}),(0,F.jsx)(`div`,{className:`relative w-full mt-4`,style:{height:p.top10.length*Z},children:p.top10.map((e,t)=>{let n=e.score/p.maxScore*100,i=t*Z;return(0,F.jsxs)(`div`,{title:`${e.periodsInTop10} weeks in top 10`,className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,F.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,F.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,F.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,F.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,F.jsx)(`div`,{className:`ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:Q},children:Math.round(e.score).toLocaleString()})]},e.label)})}),(0,F.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2`,children:`Score = Σ streams × e^(−0.2×Δweeks)`})]})]}),n.length>1&&(0,F.jsx)(M,{frameCount:n.length,startTs:n[0].periodTs,endTs:n[n.length-1].periodTs,currentFrameIdx:o,speedMultiplier:l,isPlaying:s,onFrameChange:u,onSpeedChange:d,onPlayPause:f})]}):null}function Be({year:e}){let[n,a]=(0,P.useState)(`artists`),{data:o,isLoading:s}=i({query:Le(e,n),year:e}),c=o??[],l=K(o,n);return(0,F.jsx)(t,{title:`Top 10 Billboard`,emoji:`🏆`,className:`md:col-span-2 lg:col-span-3`,isLoading:s&&c.length===0,question:`Who stayed in the charts the longest week after week?`,headerActions:(0,F.jsx)(k,{value:n,onChange:a}),children:c.length===0?(0,F.jsx)(r,{}):(0,F.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:s?.4:1},children:(0,F.jsx)(ze,{data:c,entityType:l})})})}function Ve(e){return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${d}
        WHERE ${o(e,`year(session_start::date)`)}
        ORDER BY session_start
    `}var $=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];function He(e,t=!1){let n=`#7c3aed`,r={background:`transparent`,color:t?`#e5e7eb`:`#1f2937`},i=b({title:`Session duration distribution`,width:600,height:220,style:r,x:{label:`Duration (min)`,nice:!0},y:{label:`Sessions`,grid:!0},color:{range:[`#ede9fe`,n]},marks:[ie(e,{...ne({y:`count`,fill:`count`},{x:e=>e.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),T([0])]}),a=b({title:`Sessions over time`,width:600,height:260,style:r,x:{label:`Date`,type:`time`,nice:!0},y:{label:`Start hour`,domain:[0,23],tickFormat:e=>`${e}h`},r:{range:[2,20]},marks:[D(e,{x:e=>new Date(e.session_start),y:e=>e.start_hour,r:e=>e.duration_ms/6e4,fill:n,fillOpacity:.6,tip:!0})]}),o=e.reduce((e,t)=>(e[t.day_of_week]++,e),[0,0,0,0,0,0,0]),s=$.map((e,t)=>({day:e,count:o[t]})),c=b({title:`Sessions by day of week`,width:400,height:200,style:r,x:{label:`Day`,domain:$},y:{label:`Sessions`,grid:!0},marks:[re(s,{x:`day`,y:`count`,fill:n,tip:!0}),T([0])]}),l=document.createElement(`div`);return l.className=`space-y-4 p-4`,l.append(i,a,c),l}function Ue({query:e,buildPlot:t}){let[n,r]=(0,P.useState)(),{effectiveTheme:i}=(0,P.useContext)(s),a=(0,P.useRef)(null);return(0,P.useEffect)(()=>{(async()=>{r(await l(e))})()},[e]),(0,P.useEffect)(()=>{if(!n)return;let e=t(n,i===`dark`);return a.current&&a.current.replaceChildren(e),()=>{e.remove()}},[n,t,i]),(0,F.jsx)(`div`,{ref:a,className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`})}function We({year:e}){let t=(0,P.useCallback)((e,t)=>He(e,t),[]);return(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`p`,{className:`text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2`,children:`How have my listening sessions evolved over time?`}),(0,F.jsx)(Ue,{query:Ve(e),buildPlot:t})]})}function Ge(){let[e,t]=(0,P.useState)(2006),[r,i]=(0,P.useState)(),a=h(e,250),o=(0,P.useCallback)(async()=>{try{i((await l(p))[0]||void 0)}catch{}},[]);(0,P.useEffect)(()=>{o()},[o]),(0,P.useEffect)(()=>(window.addEventListener(n,o),()=>window.removeEventListener(n,o)),[o]),(0,P.useEffect)(()=>{r&&t(new Date(Number(r.max_datetime)).getFullYear())},[r]);let s=r?new Date(Number(r.max_datetime)).getFullYear():void 0,c=a===void 0||s!==void 0&&a===s;return(0,F.jsxs)(F.Fragment,{children:[r&&(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(m,{value:e,onChange:t,min:new Date(Number(r.min_datetime)).getFullYear(),max:new Date(Number(r.max_datetime)).getFullYear()}),(0,F.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,F.jsx)(oe,{year:a}),(0,F.jsx)(pe,{year:a}),(0,F.jsx)(ee,{year:a}),(0,F.jsx)(Fe,{year:a}),(0,F.jsx)(ve,{year:a,isLatestYear:c}),(0,F.jsx)(te,{year:a})]})]}),(0,F.jsxs)(`section`,{className:`p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg`,children:[(0,F.jsxs)(`div`,{className:`relative mb-12`,children:[(0,F.jsx)(`div`,{className:`border-t border-gray-300`}),(0,F.jsx)(`span`,{className:`absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border`,children:`🚧 Work in Progress`})]}),(0,F.jsx)(`p`,{className:`mb-4 text-gray-900 dark:text-gray-100`,children:`Experimental section: the graphs below are currently under development and may contain errors.`}),(0,F.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,F.jsx)(Se,{}),(0,F.jsx)(Ae,{}),(0,F.jsx)(Ee,{}),(0,F.jsx)(Be,{year:a}),(0,F.jsx)(We,{year:a})]})]})]})}export{Ge as LabView};