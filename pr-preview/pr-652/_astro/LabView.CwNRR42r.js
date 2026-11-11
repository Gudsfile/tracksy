import{a as e,c as t,n,r,t as i}from"./useDebouncedValue.C4kkormx.js";import{a,c as o,g as s,h as c,i as l,n as u,o as d,p as f,r as p,t as m}from"./InsightCard.8wpy2DFi.js";import{n as h}from"./react-dom.CYBYEVN3.js";import{rt as g}from"./getDB.jRXkJhEZ.js";import{a as _,c as v,i as y,l as b,n as x,o as S,r as C,s as w,t as T,u as E}from"./plot.aDgSf-j1.js";var D=`with spine as (
    select \${spineTimeTrunc} as ts
    from generate_series(\${spineStart}, \${spineEnd}, \${step}) as t (dt)
),

stream_agg as (
    select
        \${streamTimeTrunc} as ts,
        sum(ms_played) as ms_played,
        count(*) as count_streams
    from \${table}
    where \${year_condition}
    group by \${streamTimeTrunc}
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.count_streams, 0)::int as count_streams,
    coalesce(stream_agg.ms_played, 0) as ms_played
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
`,O={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function ee(t,n){let r=e(t),i=t!==void 0,{periodTrunc:a,spineStart:o,spineEnd:s,step:l}=O[n],u=`(select min(ts::date) from ${c} where ${r})`,d=`(select max(ts::date) from ${c} where ${r})`;return D.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${streamTimeTrunc}",a(`ts::date`)).replaceAll("${spineStart}",o(u,i)).replaceAll("${spineEnd}",s(d,i)).replaceAll("${step}",l).replaceAll("${table}",c).replaceAll("${year_condition}",r)}var k=h();function A(e,t,n){let r=new Date(e);return t===`year`?r.toLocaleDateString(n,{year:`numeric`}):t===`month`?r.toLocaleDateString(n,{month:`long`,year:`numeric`}):r.toLocaleDateString(n,{month:`short`,day:`numeric`,year:`numeric`})}function j(e,t,n,r,i){let a=new Date(e);if(r===`year`)return String(a.getUTCFullYear());if(r===`month`)return n===void 0?a.getUTCMonth()===0?String(a.getUTCFullYear()):``:a.toLocaleDateString(i,{month:`short`});if(r===`week`){let e=t?new Date(t):null;return e&&a.getUTCMonth()===e.getUTCMonth()?``:a.toLocaleDateString(i,{month:`short`})}return a.getUTCDate()===1?a.toLocaleDateString(i,{month:`short`}):``}var M=g(),te={year:`Year`,month:`Month`,week:`Week`,day:`Day`};function N({value:e,available:t,onChange:n}){return(0,M.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3`,children:[`year`,`month`,`week`,`day`].map(r=>{let i=t.includes(r);return(0,M.jsx)(`button`,{onClick:()=>i&&n(r),disabled:!i,className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===r?`bg-blue-500 text-white shadow-sm`:i?`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`:`text-gray-300 dark:text-gray-600 cursor-not-allowed`}`,children:te[r]},r)})})}function P({label:e,value:t}){return(0,M.jsxs)(`li`,{className:`flex justify-between items-center mt-1 first:mt-0`,role:`listitem`,children:[(0,M.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:e}),(0,M.jsx)(`span`,{className:`font-bold text-sm`,children:t})]})}function F({children:e}){return(0,M.jsx)(`ul`,{className:`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700`,role:`list`,children:e})}var ne=({data:e,year:t,granularity:n,availableGranularities:r,onGranularityChange:i,isLoading:o})=>{let[s,c]=(0,k.useState)(null),d=e?.reduce((e,t)=>e+t.ms_played,0)??0,f=e?.reduce((e,t)=>e+t.count_streams,0)??0,m=e?.length?Math.max(...e.map(e=>e.ms_played)):0,h=m||1,g=n!==`month`||t===void 0;return(0,M.jsxs)(a,{title:`Stream Timeline`,emoji:`📅`,isLoading:o,question:`How did my listening evolve over time?`,children:[(0,M.jsx)(N,{value:n,available:r,onChange:i}),!e?.length||f===0?(0,M.jsx)(l,{message:t===void 0?`No data`:`No data for this year`}):(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,M.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>c(null),children:e.map(e=>{let t=e.ms_played/h*100,n=e.ms_played===m&&e.ms_played>0;return(0,M.jsx)(`div`,{className:`flex-1 min-w-[3px] rounded-t transition-colors duration-200 ${n?`bg-brand-purple`:`bg-brand-blue`}`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.ms_played===0)return;let n=t.currentTarget.getBoundingClientRect();c({x:n.left+n.width/2,y:n.top,ts:e.ts,ms_played:e.ms_played,count_streams:e.count_streams})}},e.ts)})}),(0,M.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((r,i)=>{let a=j(r.ts,e[i-1]?.ts,t,n);return(0,M.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${g?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:a},r.ts)})})]}),(0,M.jsxs)(F,{children:[(0,M.jsx)(P,{label:`Total duration`,value:p(d)}),(0,M.jsx)(P,{label:`Total streams`,value:f.toLocaleString()})]})]}),s&&(0,M.jsx)(u,{x:s.x,y:s.y,title:A(s.ts,n),rows:[p(s.ms_played),`${s.count_streams.toLocaleString()} streams`]})]})},re=[`year`,`month`],ie=[`month`,`week`,`day`];function I(e){let[t,n]=(0,k.useState)(`month`),r=e===void 0?re:ie;return{granularity:t,setGranularity:n,availableGranularities:r,effectiveGranularity:r.includes(t)?t:r[0]}}function ae({year:e}){let{setGranularity:n,availableGranularities:r,effectiveGranularity:i}=I(e),{data:a,isLoading:o}=t({query:ee(e,i),year:e});return(0,M.jsx)(ne,{data:a,year:e,granularity:i,availableGranularities:r,onGranularityChange:n,isLoading:o})}var oe=`with spine as (
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
`,se=`select
    count(distinct \${entity_column})::int as total_distinct,
    (count(*) - count(distinct \${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from \${table}
where \${year_condition}
`,L={tracks:`track_uri`,artists:`artist_name`,albums:`album_name`},ce={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function le(t,n){let r=e(t);return se.replaceAll("${entity_column}",L[n]).replaceAll("${table}",c).replaceAll("${year_condition}",r)}function ue(t,n,r){let i=e(t),a=t!==void 0,{periodTrunc:o,spineStart:s,spineEnd:l,step:u}=ce[n],d=`(select min(ts::date) from ${c} where ${i})`,f=`(select max(ts::date) from ${c} where ${i})`;return oe.replaceAll("${spineTimeTrunc}",o(`t.dt`)).replaceAll("${streamTimeTrunc}",o(`ts::date`)).replaceAll("${entity_column}",L[r]).replaceAll("${spineStart}",s(d,a)).replaceAll("${spineEnd}",l(f,a)).replaceAll("${step}",u).replaceAll("${table}",c).replaceAll("${year_condition}",i)}function R({items:e}){return(0,M.jsx)(`div`,{className:`mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400`,children:e.map(({color:e,label:t})=>(0,M.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,M.jsx)(`span`,{className:`inline-block w-2 h-2 rounded-sm ${e}`}),t]},t))})}var de={artists:`Artists`,tracks:`Tracks`,albums:`Albums`};function z({value:e,onChange:t}){return(0,M.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[`artists`,`tracks`,`albums`].map(n=>(0,M.jsx)(`button`,{onClick:()=>t(n),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===n?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:de[n]},n))})}var B={tracks:`track`,artists:`artist`,albums:`album`},fe=({data:e,stats:t,year:n,granularity:r,availableGranularities:i,onGranularityChange:o,entity:s,onEntityChange:c,isLoading:d})=>{let[f,p]=(0,k.useState)(null),m=t?.total_distinct??0,h=(t?.total_streams??0)>0?Math.round((t?.total_distinct??0)/(t?.total_streams??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=r!==`month`||n===void 0;return(0,M.jsxs)(a,{title:`Stream Variety`,emoji:`🔀`,isLoading:d,question:`How varied was my listening?`,headerActions:(0,M.jsx)(z,{value:s,onChange:c}),children:[(0,M.jsx)(N,{value:r,available:i,onChange:o}),!e?.length||(t?.total_streams??0)===0?(0,M.jsx)(l,{message:n===void 0?`No data`:`No data for this year`}):(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,M.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>{let t=g>0?e.total_count/g*100:0;return(0,M.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,distinct_count:e.distinct_count,repeat_count:e.repeat_count,total_count:e.total_count})},children:[(0,M.jsx)(`div`,{className:`bg-yellow-400`,style:{flex:e.repeat_count}}),(0,M.jsx)(`div`,{className:`bg-orange-400`,style:{flex:e.distinct_count||+(e.total_count>0)}})]},e.ts)})}),(0,M.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,i)=>{let a=j(t.ts,e[i-1]?.ts,n,r);return(0,M.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:a},t.ts)})})]}),(0,M.jsx)(R,{items:[{color:`bg-orange-400`,label:`Distinct`},{color:`bg-yellow-400`,label:`Re-listens`}]}),(0,M.jsxs)(F,{children:[(0,M.jsx)(P,{label:`Unique ${B[s]}s listened`,value:m.toLocaleString()}),(0,M.jsx)(P,{label:(0,M.jsxs)(M.Fragment,{children:[`Variety rate`,(0,M.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(unique / total streams)`})]}),value:`${h}%`})]}),s!==`tracks`&&(0,M.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,M.jsx)(u,{x:f.x,y:f.y,title:A(f.ts,r),rows:[`${f.distinct_count.toLocaleString()} distinct`,`${f.repeat_count.toLocaleString()} re-listens`,`${f.total_count>0?Math.round(f.distinct_count/f.total_count*100):0}% variety`,`${f.distinct_count>0?Math.round(f.total_count/f.distinct_count):0} avg listens/${B[s]}`]})]})};function pe({year:e}){let{setGranularity:n,availableGranularities:r,effectiveGranularity:i}=I(e),[a,o]=(0,k.useState)(`tracks`),{data:s,isLoading:c}=t({query:ue(e,i,a),year:e}),{data:l}=t({query:le(e,a),year:e}),u=l?.[0];return(0,M.jsx)(fe,{data:s,stats:u,year:e,granularity:i,availableGranularities:r,onGranularityChange:n,entity:a,onEntityChange:o,isLoading:c})}var me=`with first_listen as (
    select
        \${entity_column},
        min(ts::date) as first_date
    from \${table}
    group by \${entity_column}
),

spine as (
    select \${spineTimeTrunc} as ts
    from generate_series(\${spineStart}, \${spineEnd}, \${step}) as t (dt)
),

joined as (
    select
        s.\${entity_column} as entity,
        s.ts::date as stream_date,
        f.first_date
    from \${table} as s
    inner join first_listen as f on s.\${entity_column} = f.\${entity_column}
    where \${year_condition}
),

tagged as (
    select
        \${streamTimeTrunc} as period,
        case
            when \${firstDateTrunc} = \${streamTimeTrunc}
                then entity
        end as new_entity,
        entity
    from joined
),

stream_agg as (
    select
        period as ts,
        count(distinct new_entity) as new_count,
        count(distinct entity)
        - count(distinct new_entity) as known_count,
        count(distinct entity) as total_count
    from tagged
    group by period
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.new_count, 0)::int as new_count,
    coalesce(stream_agg.known_count, 0)::int as known_count,
    coalesce(stream_agg.total_count, 0)::int as total_count
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
`,he=`with first_listen as (
    select
        \${entity_column},
        min(ts::date) as first_date
    from \${table}
    group by \${entity_column}
)

select
    count(
        distinct case when \${new_condition} then s.\${entity_column} end
    )::int as total_new,
    (
        count(distinct s.\${entity_column})
        - count(
            distinct case when \${new_condition} then s.\${entity_column} end
        )
    )::int as total_known,
    count(distinct s.\${entity_column})::int as total_distinct
from \${table} as s
inner join first_listen as f on s.\${entity_column} = f.\${entity_column}
where \${year_condition}
`,ge={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function _e(t,n){let r=e(t),i=t===void 0?`true`:`year(f.first_date) = ${t}`;return he.replaceAll("${entity_column}",L[n]).replaceAll("${table}",c).replaceAll("${year_condition}",r).replaceAll("${new_condition}",i)}function ve(t,n,r){let i=e(t),a=t!==void 0,{periodTrunc:o,spineStart:s,spineEnd:l,step:u}=ge[n],d=`(select min(ts::date) from ${c} where ${i})`,f=`(select max(ts::date) from ${c} where ${i})`;return me.replaceAll("${spineTimeTrunc}",o(`t.dt`)).replaceAll("${firstDateTrunc}",o(`first_date`)).replaceAll("${streamTimeTrunc}",o(`stream_date`)).replaceAll("${entity_column}",L[r]).replaceAll("${spineStart}",s(d,a)).replaceAll("${spineEnd}",l(f,a)).replaceAll("${step}",u).replaceAll("${table}",c).replaceAll("${year_condition}",i)}var ye=({data:e,stats:t,year:n,granularity:r,availableGranularities:i,onGranularityChange:o,entity:s,onEntityChange:c,isLoading:d})=>{let[f,p]=(0,k.useState)(null),m=t?.total_new??0,h=(t?.total_distinct??0)>0?Math.round((t?.total_new??0)/(t?.total_distinct??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=r!==`month`||n===void 0;return(0,M.jsxs)(a,{title:`Stream Discovery`,emoji:`🔭`,isLoading:d,question:`How many new artists, tracks, or albums did I discover?`,headerActions:(0,M.jsx)(z,{value:s,onChange:c}),children:[(0,M.jsx)(N,{value:r,available:i,onChange:o}),!e?.length||(t?.total_distinct??0)===0?(0,M.jsx)(l,{message:n===void 0?`No data`:`No data for this year`}):(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,M.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>{let t=g>0?e.total_count/g*100:0;return(0,M.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,new_count:e.new_count,known_count:e.known_count,total_count:e.total_count})},children:[(0,M.jsx)(`div`,{className:`bg-rose-500`,style:{flex:e.known_count}}),(0,M.jsx)(`div`,{className:`bg-rose-800`,style:{flex:e.new_count}})]},e.ts)})}),(0,M.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,i)=>{let a=j(t.ts,e[i-1]?.ts,n,r);return(0,M.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:a},t.ts)})})]}),(0,M.jsx)(R,{items:[{color:`bg-rose-800`,label:`New`},{color:`bg-rose-500`,label:`Known`}]}),(0,M.jsxs)(F,{children:[(0,M.jsx)(P,{label:`New ${B[s]}s discovered`,value:m.toLocaleString()}),(0,M.jsx)(P,{label:(0,M.jsxs)(M.Fragment,{children:[`Discovery rate`,(0,M.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(new / total distinct)`})]}),value:`${h}%`})]}),s!==`tracks`&&(0,M.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,M.jsx)(u,{x:f.x,y:f.y,title:A(f.ts,r),rows:[`${f.new_count.toLocaleString()} new`,`${f.known_count.toLocaleString()} known`,`${f.total_count>0?Math.round(f.new_count/f.total_count*100):0}% discovery`]})]})};function be({year:e}){let{setGranularity:n,availableGranularities:r,effectiveGranularity:i}=I(e),[a,o]=(0,k.useState)(`tracks`),{data:s,isLoading:c}=t({query:ve(e,i,a),year:e}),{data:l}=t({query:_e(e,a),year:e}),u=l?.[0];return(0,M.jsx)(ye,{data:s,stats:u,year:e,granularity:i,availableGranularities:r,onGranularityChange:n,entity:a,onEntityChange:o,isLoading:c})}var xe=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function Se(t){return xe.replaceAll("${table}",c).replaceAll("${year_condition}",e(t))}var Ce=3,V=24,we=Array.from({length:7},(e,t)=>t%2==0?``:new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`}));function H(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r)}function U(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function W(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}var G=e=>e.streak>0,K=e=>e.streak===0&&e.prevStreak>0&&e.inRange,Te=e=>G(e)||K(e);function Ee(e,t){return G(e)?`rgba(34,197,94,${Math.max(.2,e.streak/t)})`:K(e)?`rgba(239,68,68,0.45)`:e.inRange?null:`transparent`}function q(e){return new Date(e+`T00:00:00`).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`})}function De({data:e,year:t,isLatestYear:n,isLoading:r}){let i=(0,k.useRef)(null),[o,s]=(0,k.useState)(null),{cells:c,maxStreak:d,bestStreakEnd:f,bestStreakStart:p,currentStreak:m}=(0,k.useMemo)(()=>{if(!e||e.length===0)return{cells:[],maxStreak:0,bestStreakEnd:``,bestStreakStart:``,currentStreak:0};let n=new Set(e.map(e=>e.stream_date)),r=[...n].sort(),i=r[0],a=r[r.length-1],o=t===void 0?i:`${t}-01-01`,s=t===void 0?a:`${t}-12-31`,c=[],l=H(o),u=H(s),d=0,f=0,p=``,m=0;for(;l<=u;){let e=U(l),r=d;d=n.has(e)?r+1:0;let o=t===void 0||e>=i&&e<=a;c.push({day:e,streak:d,prevStreak:r,inRange:o}),d>f&&(f=d,p=e),n.has(e)&&(m=d),l.setDate(l.getDate()+1)}let h=``;return p&&f>0&&(h=U(W(H(p),-(f-1)))),{cells:c,maxStreak:f,bestStreakEnd:p,bestStreakStart:h,currentStreak:m}},[e,t]),{weeks:h,monthLabels:g,weekCount:_}=(0,k.useMemo)(()=>{if(c.length===0)return{weeks:[],monthLabels:[],weekCount:0};let e=new Map(c.map(e=>[e.day,e])),t=H(c[0].day),n=H(c[c.length-1].day),r=new Date(t);r.setDate(r.getDate()-r.getDay());let i=new Date(n);i.setDate(i.getDate()+(6-i.getDay()));let a=(Math.round((i.getTime()-r.getTime())/864e5)+1)/7,o=[];for(let t=0;t<a;t++){let n=[];for(let i=0;i<7;i++){let a=U(W(r,t*7+i));n.push(e.get(a)??null)}o.push(n)}let s=[],l=-1,u=-1;for(let e=0;e<o.length;e++){let t=o[e].find(e=>e!==null);if(!t)continue;let n=H(t.day),r=n.getMonth(),i=n.getFullYear();if(r!==l){let t=i!==u,a=n.toLocaleDateString(void 0,{month:`short`});s.push({weekIdx:e,label:t?`${a} '${String(i).slice(2)}`:a}),l=r,u=i}}return{weeks:o,monthLabels:s,weekCount:a}},[c]);(0,k.useEffect)(()=>{let e=i.current;e&&(e.scrollLeft=t===void 0?e.scrollWidth:0)},[t,c]);let v=!e||e.length===0,y=V+_*13,b=`${V}px repeat(${_}, 1fr)`;return(0,M.jsxs)(a,{title:`Listening Streaks`,emoji:`🔥`,question:`How consistent is your listening?`,isLoading:r,children:[v?(0,M.jsx)(l,{}):(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(`div`,{ref:i,className:`overflow-x-auto pb-4`,onMouseLeave:()=>s(null),children:(0,M.jsxs)(`div`,{style:{minWidth:`${y}px`},children:[(0,M.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,marginBottom:2},children:[(0,M.jsx)(`div`,{}),Array.from({length:_},(e,t)=>{let n=g.find(e=>e.weekIdx===t);return(0,M.jsx)(`div`,{className:`text-[9px] text-gray-400 dark:text-gray-600`,children:n?.label??``},t)})]}),(0,M.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,gridTemplateRows:`repeat(7, auto)`,gap:`${Ce}px`},children:[we.map((e,t)=>(0,M.jsx)(`div`,{style:{gridColumn:1,gridRow:t+1},className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:e},`label-${t}`)),h.flatMap((e,t)=>e.map((e,n)=>{let r=e?G(e)?`streak-cell-active`:K(e)?`streak-cell-break`:void 0:void 0,i=e?Ee(e,d):`transparent`;return(0,M.jsx)(`div`,{"data-testid":r,style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`,backgroundColor:i??void 0},className:`rounded-xs ${i===null?`bg-gray-100 dark:bg-slate-700/50`:``}`,onMouseEnter:e&&Te(e)?t=>{let n=t.currentTarget.getBoundingClientRect();s({cell:e,x:n.left+n.width/2,y:n.top})}:void 0},`${t}-${n}`)}))]})]})}),(0,M.jsxs)(F,{children:[(0,M.jsx)(P,{label:`Best streak`,value:(0,M.jsxs)(M.Fragment,{children:[d,` day`,d===1?``:`s`,p&&f&&(0,M.jsxs)(`span`,{className:`font-normal text-gray-500 dark:text-gray-400`,children:[` `,`·`,` `,q(p),` `,`–`,` `,q(f)]})]})}),n&&(0,M.jsx)(P,{label:`Current streak`,value:`${m} day${m===1?``:`s`}`})]})]}),o&&(0,M.jsx)(u,{x:o.x,y:o.y,title:q(o.cell.day),rows:[o.cell.streak>0?`Day ${o.cell.streak} of streak`:`Streak broken`]})]})}function Oe({year:e,isLatestYear:n}){let{data:r,isLoading:i}=t({query:Se(e),year:e});return(0,M.jsx)(De,{data:r,year:e,isLatestYear:n,isLoading:i})}var ke=`with artist_yearly_play_counts as (
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
`;function Ae(){return ke.replaceAll("${table}",c)}function je({data:e}){let t=(0,k.useRef)(null);return(0,k.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.artist===t.artist?e.stream_year-t.stream_year:e.artist.localeCompare(t.artist)),r=[...Array.from(new Set(n.map(e=>e.artist))).map(e=>{let t=n.filter(t=>t.artist===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=_({title:`Global Top 10 Artists Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[y(n,{x:`stream_year`,y:`stream_rank`,stroke:`artist`,strokeWidth:2.5}),C(n,{x:`stream_year`,y:`stream_rank`,fill:`artist`,r:4}),b(i,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),b(a,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),E(n,S({x:`stream_year`,y:`stream_rank`,title:e=>`${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,M.jsx)(`div`,{ref:t})}function Me(){let[e,t]=(0,k.useState)([]);return(0,k.useEffect)(()=>{(async()=>{let e=await d(Ae());t(e)})()},[]),e.length===0?null:(0,M.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,M.jsx)(je,{data:e})})}var Ne=`with
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
`;function Pe(){return Ne.replaceAll("${table}",c)}function Fe({data:e}){let t=(0,k.useRef)(null);return(0,k.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.album===t.album?e.stream_year-t.stream_year:e.album.localeCompare(t.album)),r=[...Array.from(new Set(n.map(e=>e.album))).map(e=>{let t=n.filter(t=>t.album===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=_({title:`Global Top 10 Albums Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[y(n,{x:`stream_year`,y:`stream_rank`,stroke:`album`,strokeWidth:2.5}),C(n,{x:`stream_year`,y:`stream_rank`,fill:`album`,r:4}),b(i,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),b(a,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),E(n,S({x:`stream_year`,y:`stream_rank`,title:e=>`${e.album} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,M.jsx)(`div`,{ref:t})}function Ie(){let[e,t]=(0,k.useState)([]);return(0,k.useEffect)(()=>{(async()=>{let e=await d(Pe());t(e)})()},[]),e.length===0?null:(0,M.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,M.jsx)(Fe,{data:e})})}var Le=`with track_yearly_play_counts as (
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
`;function Re(){return Le.replaceAll("${table}",c)}function ze({data:e}){let t=(0,k.useRef)(null);return(0,k.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.track===t.track?e.stream_year-t.stream_year:e.track.localeCompare(t.track)),r=[...Array.from(new Set(n.map(e=>e.track))).map(e=>{let t=n.filter(t=>t.track===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=_({title:`Global Top 10 Track Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[y(n,{x:`stream_year`,y:`stream_rank`,stroke:`track`,strokeWidth:2.5}),C(n,{x:`stream_year`,y:`stream_rank`,fill:`track`,r:4}),b(i,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),b(a,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),E(n,S({x:`stream_year`,y:`stream_rank`,title:e=>`${e.track} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,M.jsx)(`div`,{ref:t})}function Be(){let[e,t]=(0,k.useState)([]);return(0,k.useEffect)(()=>{(async()=>{let e=await d(Re());t(e)})()},[]),e.length===0?null:(0,M.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,M.jsx)(ze,{data:e})})}var Ve=`with daily as (
    select
        ts::date as stream_date,
        dayofweek(ts::date)::integer as day_of_week,
        hour(ts::datetime)::integer as play_hour,
        count(*) as daily_count
    from \${table}
    where \${year_condition}
    group by ts::date, dayofweek(ts::date), hour(ts::datetime)
)

select
    day_of_week,
    play_hour,
    sum(daily_count) over (
        partition by day_of_week, play_hour
        order by stream_date
        rows between unbounded preceding and current row
    )::double as cumulative_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily
order by stream_date_ts, day_of_week, play_hour
`;function He(t){let n=e(t);return Ve.replaceAll("${table}",c).replaceAll("${year_condition}",n)}function J({frameCount:e,startTs:t,endTs:n,currentFrameIdx:r,speedMultiplier:i,isPlaying:a,onFrameChange:o,onSpeedChange:s,onPlayPause:c}){let l=r>=e-1;return(0,M.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[(0,M.jsxs)(`div`,{className:`flex items-center gap-2 flex-1 min-w-0 px-1`,children:[(0,M.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(t).toLocaleDateString(void 0,{year:`numeric`,month:`short`})}),(0,M.jsx)(`input`,{type:`range`,"aria-label":`Animation timeline`,min:0,max:e-1,value:r,onChange:e=>o(Number(e.target.value)),className:`flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-w-0`}),(0,M.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(n).toLocaleDateString(void 0,{year:`numeric`,month:`short`})})]}),(0,M.jsxs)(`div`,{className:`flex items-center shrink-0 self-center sm:self-auto`,children:[[.5,1,2,4].map(e=>(0,M.jsxs)(`button`,{type:`button`,onClick:()=>s(e),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${i===e?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:[e,`x`]},e)),(0,M.jsx)(`div`,{className:`w-px h-4 bg-gray-300/50 dark:bg-slate-600/50 mx-1`}),(0,M.jsx)(`button`,{type:`button`,onClick:c,"aria-label":a?`Pause`:l?`Replay`:`Play`,title:a?`Pause`:l?`Replay`:`Play`,className:`p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-all`,children:a?(0,M.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,M.jsx)(`rect`,{x:`3`,y:`2`,width:`4`,height:`12`,rx:`1`}),(0,M.jsx)(`rect`,{x:`9`,y:`2`,width:`4`,height:`12`,rx:`1`})]}):l?(0,M.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,M.jsx)(`path`,{d:`M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z`}),(0,M.jsx)(`path`,{d:`M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z`})]}):(0,M.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:(0,M.jsx)(`path`,{d:`M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z`})})})]})]})}function Y({frameCount:e,baseSpeed:t,entityType:n}){let[r,i]=(0,k.useState)(0),[a,o]=(0,k.useState)(!1),[s,c]=(0,k.useState)(1),[l,u]=(0,k.useState)(!1),d=(0,k.useRef)(null);(0,k.useEffect)(()=>{let e=new IntersectionObserver(([e])=>{u(e.isIntersecting)},{threshold:.1}),t=d.current;return t&&e.observe(t),()=>{t&&e.unobserve(t)}},[]);let f=(0,k.useRef)(!1);return(0,k.useEffect)(()=>{f.current?(i(0),o(!0)):f.current=!0},[n]),(0,k.useEffect)(()=>{if(!a||!l||e===0)return;let n=setInterval(()=>{i(t=>t>=e-1?(o(!1),t):t+1)},t/s);return()=>clearInterval(n)},[a,l,e,t,s]),{containerRef:d,currentFrameIdx:r,isPlaying:a,speedMultiplier:s,onFrameChange:e=>{o(!1),i(e)},onSpeedChange:c,onPlayPause:()=>{r>=e-1?(i(0),o(!0)):o(e=>!e)}}}var X=3,Z=24,Q=40,Ue=120,We=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`long`,timeZone:`UTC`})),Ge=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`})),Ke=Array.from({length:24},(e,t)=>t%6==0?String(t):``);function qe({data:e,year:t,isLoading:n}){let{frames:r,maxCount:i,topDay:o,topHour:s,firstPlayedByCell:c,firstCompleteHourFrame:l,firstCompleteHourLabel:d,firstCompleteDayFrame:f,firstCompleteDayLabel:p,bingoFrame:m,uncoveredCells:h}=(0,k.useMemo)(()=>{if(!e||e.length===0)return{frames:[],maxCount:1,topDay:-1,topHour:-1,firstPlayedByCell:new Map,firstCompleteHourFrame:null,firstCompleteHourLabel:``,firstCompleteDayFrame:null,firstCompleteDayLabel:``,bingoFrame:null,uncoveredCells:168};let t=[...new Set(e.map(e=>e.stream_date_ts))].sort((e,t)=>e-t),n=new Map;for(let t of e)n.has(t.stream_date_ts)||n.set(t.stream_date_ts,[]),n.get(t.stream_date_ts).push(t);let r=new Map,i=[],a=new Map,o=new Map,s=new Map,c=0,l=null,u=``,d=null,f=``,p=null;for(let e=0;e<t.length;e++){let m=t[e],h=n.get(m)??[];for(let e of h){let t=`${e.day_of_week},${e.play_hour}`;if(!r.has(t)){a.set(t,m),c++;let n=e.day_of_week,r=e.play_hour;o.has(r)||o.set(r,new Set),o.get(r).add(n),s.has(n)||s.set(n,new Set),s.get(n).add(r)}r.set(t,e.cumulative_count)}if(i.push({dateTs:m,cells:new Map(r)}),l===null){for(let[t,n]of o)if(n.size===7){l=e,u=`${t}h · ${new Date(m).toLocaleDateString()}`;break}}if(d===null){for(let[t,n]of s)if(n.size===24){d=e,f=`${We[t]} · ${new Date(m).toLocaleDateString()}`;break}}p===null&&c===168&&(p=e)}let m=168-c,h=i[i.length-1].cells,g=Math.max(1,...h.values()),_=Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=h.get(`${t},${e}`)??0;return n}),v=Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=h.get(`${e},${t}`)??0;return n});return{frames:i,maxCount:g,topDay:_.indexOf(Math.max(..._)),topHour:v.indexOf(Math.max(...v)),firstPlayedByCell:a,firstCompleteHourFrame:l,firstCompleteHourLabel:u,firstCompleteDayFrame:d,firstCompleteDayLabel:f,bingoFrame:p,uncoveredCells:m}},[e]),{containerRef:g,currentFrameIdx:_,isPlaying:v,speedMultiplier:y,onFrameChange:b,onSpeedChange:x,onPlayPause:S}=Y({frameCount:r.length,baseSpeed:Ue,entityType:String(t)}),C=(0,k.useMemo)(()=>r[_]?.cells??new Map,[r,_]),{dayTotals:w,hourTotals:T}=(0,k.useMemo)(()=>({dayTotals:Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=C.get(`${t},${e}`)??0;return n}),hourTotals:Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=C.get(`${e},${t}`)??0;return n})}),[C]),[E,D]=(0,k.useState)(null),O=null;return m!==null&&_>=m?O=(0,M.jsx)(`span`,{className:`font-bold text-sm`,children:new Date(r[m].dateTs).toLocaleDateString()}):m===null&&r.length>0&&_>=r.length-1&&(O=(0,M.jsxs)(`span`,{className:`text-sm text-gray-500`,children:[h,` cells uncovered`]})),(0,M.jsx)(`div`,{ref:g,children:(0,M.jsxs)(a,{title:`Listening Bingo`,emoji:`🎰`,question:`Have you listened at every hour of every day?`,isLoading:n,children:[(0,M.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,M.jsx)(`div`,{className:`md:hidden`,"data-testid":`bingo-grid-mobile`,children:(0,M.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`${Z}px repeat(7, 1fr) ${Q}px`,gap:`${X}px`},onMouseLeave:()=>D(null),children:[(0,M.jsx)(`div`,{}),Ge.map((e,t)=>(0,M.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,M.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),Array.from({length:24},(e,t)=>(0,M.jsxs)(k.Fragment,{children:[(0,M.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:Ke[t]}),Array.from({length:7},(e,n)=>{let r=C.get(`${n},${t}`)??0,a=r>0;return(0,M.jsx)(`div`,{style:{height:12,...a&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/i)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${a?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let i=e.currentTarget.getBoundingClientRect();D({x:i.left+i.width/2,y:i.top,day:n,hour:t,count:r,firstPlayedTs:a?c.get(`${n},${t}`)??null:null})}},`${n}-${r}`)}),(0,M.jsx)(`div`,{className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:T[t]>0?T[t]:``})]},t)),(0,M.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),w.map((e,t)=>(0,M.jsx)(`div`,{className:`text-[8px] text-center font-medium ${t===o?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,M.jsx)(`div`,{})]})}),(0,M.jsx)(`div`,{className:`hidden md:block overflow-x-auto`,children:(0,M.jsxs)(`div`,{"data-testid":`bingo-grid-desktop`,style:{display:`grid`,gridTemplateColumns:`${Z}px repeat(24, 1fr) ${Q}px`,gap:`${X}px`,minWidth:`376px`},onMouseLeave:()=>D(null),children:[(0,M.jsx)(`div`,{}),Ke.map((e,t)=>(0,M.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,M.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),Ge.map((e,t)=>(0,M.jsxs)(k.Fragment,{children:[(0,M.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:t===1||t===3||t===5?e:``}),Array.from({length:24},(e,n)=>{let r=C.get(`${t},${n}`)??0,a=r>0;return(0,M.jsx)(`div`,{style:{aspectRatio:`1`,...a&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/i)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${a?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let i=e.currentTarget.getBoundingClientRect();D({x:i.left+i.width/2,y:i.top,day:t,hour:n,count:r,firstPlayedTs:a?c.get(`${t},${n}`)??null:null})}},`${n}-${r}`)}),(0,M.jsx)(`div`,{"data-testid":`day-total-${t}`,className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===o?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:w[t]>0?w[t]:``})]},t)),(0,M.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),T.map((e,t)=>(0,M.jsx)(`div`,{"data-testid":`hour-total-${t}`,className:`text-[8px] text-center font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,M.jsx)(`div`,{})]})}),r.length>1&&(0,M.jsx)(J,{frameCount:r.length,startTs:r[0].dateTs,endTs:r[r.length-1].dateTs,currentFrameIdx:_,speedMultiplier:y,isPlaying:v,onFrameChange:b,onSpeedChange:x,onPlayPause:S}),(0,M.jsxs)(F,{children:[(0,M.jsx)(P,{label:`First complete hour`,value:l!==null&&_>=l?d:null}),(0,M.jsx)(P,{label:`First complete day`,value:f!==null&&_>=f?p:null}),(0,M.jsx)(P,{label:`Bingo`,value:O})]})]}),E&&(0,M.jsx)(u,{x:E.x,y:E.y,title:`${We[E.day]} ${E.hour}h`,rows:[`${E.count.toLocaleString()} streams`,E.firstPlayedTs===null?null:`first played ${new Date(E.firstPlayedTs).toLocaleDateString()}`]})]})})}function Je({year:e}){let{data:n,isLoading:r}=t({query:He(e),year:e});return(0,M.jsx)(qe,{data:n,year:e,isLoading:r})}var Ye={artists:`with daily_streams as (
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
        count(*)::int as daily_plays,
        album_name || ' — ' || artist_name as entity_name
    from \${table}
    where album_name is not null and artist_name is not null
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
`};function Xe(e,t=`artists`){let n=Ye[t].replaceAll("${table}",c);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function Ze(e,t){let n=(0,k.useRef)(e),[r,i]=(0,k.useState)(t);return(0,k.useEffect)(()=>{e!==n.current&&(n.current=e,i(t))},[e,t]),r}var $=[`bg-blue-500`,`bg-red-500`,`bg-green-500`,`bg-yellow-500`,`bg-purple-500`,`bg-pink-500`,`bg-indigo-500`,`bg-teal-500`,`bg-orange-500`,`bg-cyan-500`],Qe=120,$e=44,et=60;function tt({data:e,entityType:t}){let{frames:n,entityColors:r}=(0,k.useMemo)(()=>{let t=Array.from(new Set(e.map(e=>e.stream_date_ts))).sort((e,t)=>e-t),n=new Map,r=[],i=new Map,a=0,o=new Map;for(let t of e)o.has(t.stream_date_ts)||o.set(t.stream_date_ts,[]),o.get(t.stream_date_ts).push(t);for(let e of t){let t=o.get(e)||[];for(let e of t)n.set(e.entity_name,e.play_count),i.has(e.entity_name)||(i.set(e.entity_name,$[a%$.length]),a++);let s=Array.from(n.entries()).sort((e,t)=>t[1]-e[1]).slice(0,10);r.push({dateTs:e,top10:s.map(([e,t])=>({label:e,play_count:t})),maxScore:Math.max(1,s[0]?.[1]||1)})}return{frames:r,entityColors:i}},[e]),{containerRef:i,currentFrameIdx:a,isPlaying:o,speedMultiplier:s,onFrameChange:c,onSpeedChange:l,onPlayPause:u}=Y({frameCount:n.length,baseSpeed:Qe,entityType:t}),d=n[a];return d?(0,M.jsxs)(`div`,{ref:i,className:`flex flex-col gap-4 w-full`,children:[(0,M.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[new Date(d.dateTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,M.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· daily`})]}),(0,M.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:et},children:(0,M.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`streams`})}),(0,M.jsx)(`div`,{className:`relative w-full`,style:{height:d.top10.length*$e},children:d.top10.map((e,t)=>{let n=e.play_count/d.maxScore*100,i=t*$e;return(0,M.jsxs)(`div`,{className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,M.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,M.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,M.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,M.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,M.jsx)(`div`,{className:`ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:et},children:e.play_count.toLocaleString()})]},e.label)})}),n.length>1&&(0,M.jsx)(J,{frameCount:n.length,startTs:n[0].dateTs,endTs:n[n.length-1].dateTs,currentFrameIdx:a,speedMultiplier:s,isPlaying:o,onFrameChange:c,onSpeedChange:l,onPlayPause:u})]}):null}function nt({year:e}){let[n,r]=(0,k.useState)(`artists`),{data:i,isLoading:o}=t({query:Xe(e,n),year:e}),s=i??[],c=Ze(i,n),u=o&&s.length===0;return(0,M.jsx)(a,{title:`Top 10 Race`,emoji:`🏎️`,className:`md:col-span-2 lg:col-span-3`,isLoading:u,question:`Who dominated my listening, and when did they rise?`,headerActions:(0,M.jsx)(z,{value:n,onChange:r}),children:s.length===0?(0,M.jsx)(l,{}):(0,M.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,M.jsx)(tt,{data:s,entityType:c})})})}var rt={artists:`select
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
    count(*)::int as period_plays,
    album_name || ' — ' || artist_name as entity_name,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where album_name is not null and artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`};function it(e,t=`artists`){let n=rt[t].replaceAll("${table}",c);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function at({ranking:e,activeLabels:t}){return(0,M.jsxs)(`div`,{className:`flex flex-col`,children:[(0,M.jsx)(`span`,{className:`text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3`,children:`Longevity Leaderboard`}),(0,M.jsx)(`div`,{className:`flex flex-col gap-0.5`,children:e.map((e,n)=>(0,M.jsxs)(`div`,{className:`flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors`,children:[(0,M.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono`,children:n+1}),(0,M.jsx)(`span`,{className:`text-sm truncate flex-1 min-w-0 ${t.has(e.label)?`font-bold text-gray-900 dark:text-white`:`font-normal text-gray-500 dark:text-gray-400`}`,children:e.label}),(0,M.jsxs)(`span`,{className:`text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0`,children:[e.periodsInTop10,`w`]}),(0,M.jsx)(`span`,{className:`text-xs font-mono shrink-0 w-8 text-right`,children:e.rankDelta===null?(0,M.jsx)(`span`,{className:`text-blue-400`,children:`new`}):e.rankDelta>0?(0,M.jsxs)(`span`,{className:`text-emerald-400`,children:[`↑`,e.rankDelta]}):e.rankDelta<0?(0,M.jsxs)(`span`,{className:`text-red-400`,children:[`↓`,Math.abs(e.rankDelta)]}):(0,M.jsx)(`span`,{className:`text-gray-400 opacity-40`,children:`—`})})]},e.label))})]})}var ot=240,st=44,ct=62;function lt({data:e,entityType:t}){let{frames:n,entityColors:r,streakRecord:i}=(0,k.useMemo)(()=>{let t=[...new Set(e.map(e=>e.period_ts))].sort((e,t)=>e-t),n=Math.exp(-.2),r=new Map;for(let t of e)r.has(t.period_ts)||r.set(t.period_ts,[]),r.get(t.period_ts).push({label:t.entity_name,plays:t.period_plays});let i=new Map,a=new Map,o=new Map,s=new Map,c=new Map,l=0,u=[];for(let e of t){for(let[e,t]of i)i.set(e,t*n);for(let{label:t,plays:n}of r.get(e)??[])i.set(t,(i.get(t)??0)+n),c.has(t)||(c.set(t,$[l%$.length]),l++);let t=[...i.entries()].filter(([,e])=>e>.01).sort((e,t)=>t[1]-e[1]).slice(0,10),d=new Set(t.map(([e])=>e));for(let[e]of t){a.set(e,(a.get(e)??0)+1),o.set(e,(o.get(e)??0)+1);let t=o.get(e);t>(s.get(e)??0)&&s.set(e,t)}for(let[e]of i)!d.has(e)&&(o.get(e)??0)>0&&o.set(e,0);let f=t[0]?.[1]??1,p=u.length>0?u[u.length-1].ghostRanking:[],m=new Map(p.map((e,t)=>[e.label,t])),h=[...a.entries()].sort((e,t)=>t[1]-e[1]).slice(0,10).map(([e,t],n)=>({label:e,periodsInTop10:t,rankDelta:p.length===0?null:m.has(e)?m.get(e)-n:null}));u.push({periodTs:e,top10:t.map(([e,t])=>({label:e,score:t,periodsInTop10:a.get(e)??0})),maxScore:f,ghostRanking:h})}let d={label:``,weeks:0};for(let[e,t]of s)t>d.weeks&&(d={label:e,weeks:t});return{frames:u,entityColors:c,streakRecord:d}},[e]),{containerRef:a,currentFrameIdx:o,isPlaying:s,speedMultiplier:c,onFrameChange:l,onSpeedChange:u,onPlayPause:d}=Y({frameCount:n.length,baseSpeed:ot,entityType:t}),f=n[o],p=(0,k.useMemo)(()=>new Set(f?.top10.map(e=>e.label)??[]),[f]);return f?(0,M.jsxs)(`div`,{ref:a,className:`flex flex-col gap-4 w-full`,children:[(0,M.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[`Week of `+new Date(f.periodTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,M.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· weekly`})]}),(0,M.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-6`,children:[(0,M.jsxs)(`div`,{className:`md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4`,children:[(0,M.jsx)(at,{ranking:f.ghostRanking,activeLabels:p}),i.weeks>0&&(0,M.jsxs)(m,{children:[(0,M.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 mb-0.5`,children:`🔥 Longest streak`}),o>=n.length-1?(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`span`,{className:`font-bold`,children:i.label}),(0,M.jsxs)(`span`,{className:`text-xs font-normal text-gray-500 dark:text-gray-400 ml-1`,children:[i.weeks,` consecutive weeks`]})]}):(0,M.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 italic`,children:`Watch till the end to find out…`})]})]}),(0,M.jsxs)(`div`,{className:`md:col-span-2 flex flex-col`,children:[(0,M.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:ct},children:(0,M.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`score`})}),(0,M.jsx)(`div`,{className:`relative w-full mt-4`,style:{height:f.top10.length*st},children:f.top10.map((e,t)=>{let n=e.score/f.maxScore*100,i=t*st;return(0,M.jsxs)(`div`,{title:`${e.periodsInTop10} weeks in top 10`,className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,M.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,M.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,M.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,M.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,M.jsx)(`div`,{className:`ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:ct},children:Math.round(e.score).toLocaleString()})]},e.label)})}),(0,M.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2`,children:`Score = Σ streams × e^(−0.2×Δweeks)`})]})]}),n.length>1&&(0,M.jsx)(J,{frameCount:n.length,startTs:n[0].periodTs,endTs:n[n.length-1].periodTs,currentFrameIdx:o,speedMultiplier:c,isPlaying:s,onFrameChange:l,onSpeedChange:u,onPlayPause:d})]}):null}function ut({year:e}){let[n,r]=(0,k.useState)(`artists`),{data:i,isLoading:o}=t({query:it(e,n),year:e}),s=i??[],c=Ze(i,n),u=o&&s.length===0;return(0,M.jsx)(a,{title:`Top 10 Billboard`,emoji:`🏆`,className:`md:col-span-2 lg:col-span-3`,isLoading:u,question:`Who stayed in the charts the longest week after week?`,headerActions:(0,M.jsx)(z,{value:n,onChange:r}),children:s.length===0?(0,M.jsx)(l,{}):(0,M.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,M.jsx)(lt,{data:s,entityType:c})})})}function dt(t){let n=e(t,`year(session_start::date)`);return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${f}
        WHERE ${n}
        ORDER BY session_start
    `}var ft=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];function pt(e,t=!1){let n=`#7c3aed`,r={background:`transparent`,color:t?`#e5e7eb`:`#1f2937`},i=_({title:`Session duration distribution`,width:600,height:220,style:r,x:{label:`Duration (min)`,nice:!0},y:{label:`Sessions`,grid:!0},color:{range:[`#ede9fe`,n]},marks:[w(e,{...x({y:`count`,fill:`count`},{x:e=>e.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),v([0])]}),a=_({title:`Sessions over time`,width:600,height:260,style:r,x:{label:`Date`,type:`time`,nice:!0},y:{label:`Start hour`,domain:[0,23],tickFormat:e=>`${e}h`},r:{range:[2,20]},marks:[C(e,{x:e=>new Date(e.session_start),y:e=>e.start_hour,r:e=>e.duration_ms/6e4,fill:n,fillOpacity:.6,tip:!0})]}),o=e.reduce((e,t)=>(e[t.day_of_week]++,e),[0,0,0,0,0,0,0]),s=ft.map((e,t)=>({day:e,count:o[t]})),c=_({title:`Sessions by day of week`,width:400,height:200,style:r,x:{label:`Day`,domain:ft},y:{label:`Sessions`,grid:!0},marks:[T(s,{x:`day`,y:`count`,fill:n,tip:!0}),v([0])]}),l=document.createElement(`div`);return l.className=`space-y-4 p-4`,l.append(i,a,c),l}function mt({query:e,buildPlot:t}){let[n,r]=(0,k.useState)(),{effectiveTheme:i}=(0,k.useContext)(s),a=(0,k.useRef)(null);return(0,k.useEffect)(()=>{(async()=>{let t=await d(e);r(t)})()},[e]),(0,k.useEffect)(()=>{if(!n)return;let e=t(n,i===`dark`);return a.current&&a.current.replaceChildren(e),()=>{e.remove()}},[n,t,i]),(0,M.jsx)(`div`,{ref:a,className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`})}function ht({year:e}){let t=(0,k.useCallback)((e,t)=>pt(e,t),[]);return(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`p`,{className:`text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2`,children:`How have my listening sessions evolved over time?`}),(0,M.jsx)(mt,{query:dt(e),buildPlot:t})]})}var gt=(0,k.memo)(ae),_t=(0,k.memo)(pe),vt=(0,k.memo)(be),yt=(0,k.memo)(Oe),bt=(0,k.memo)(Me),xt=(0,k.memo)(Ie),St=(0,k.memo)(Be),Ct=(0,k.memo)(Je),wt=(0,k.memo)(nt),Tt=(0,k.memo)(ut),Et=(0,k.memo)(ht);function Dt(){let[e,t]=(0,k.useState)(2006),[a,s]=(0,k.useState)(),c=i(e,250),l=(0,k.useCallback)(async()=>{try{let e=await d(n);s(e[0]||void 0)}catch{}},[]);(0,k.useEffect)(()=>{l()},[l]),(0,k.useEffect)(()=>(window.addEventListener(o,l),()=>window.removeEventListener(o,l)),[l]),(0,k.useEffect)(()=>{a&&t(new Date(Number(a.max_datetime)).getFullYear())},[a]);let u=a?new Date(Number(a.max_datetime)).getFullYear():void 0,f=c===void 0||u!==void 0&&c===u;return(0,M.jsxs)(M.Fragment,{children:[a&&(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(r,{value:e,onChange:t,min:new Date(Number(a.min_datetime)).getFullYear(),max:new Date(Number(a.max_datetime)).getFullYear()}),(0,M.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,M.jsx)(gt,{year:c}),(0,M.jsx)(_t,{year:c}),(0,M.jsx)(vt,{year:c}),(0,M.jsx)(wt,{year:c}),(0,M.jsx)(yt,{year:c,isLatestYear:f}),(0,M.jsx)(Ct,{year:c})]})]}),(0,M.jsxs)(`section`,{className:`p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg`,children:[(0,M.jsxs)(`div`,{className:`relative mb-12`,children:[(0,M.jsx)(`div`,{className:`border-t border-gray-300`}),(0,M.jsx)(`span`,{className:`absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border`,children:`🚧 Work in Progress`})]}),(0,M.jsx)(`p`,{className:`mb-4 text-gray-900 dark:text-gray-100`,children:`Experimental section: the graphs below are currently under development and may contain errors.`}),(0,M.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,M.jsx)(bt,{}),(0,M.jsx)(St,{}),(0,M.jsx)(xt,{}),(0,M.jsx)(Tt,{year:c}),(0,M.jsx)(Et,{year:c})]})]})]})}export{Dt as LabView};