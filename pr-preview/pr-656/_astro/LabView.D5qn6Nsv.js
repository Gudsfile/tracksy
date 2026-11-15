import{n as e}from"./react-dom.CYBYEVN3.js";import{a as t,c as n,i as r,n as i,o as a,r as o,t as s,u as c}from"./InsightCard.nEqL3ZXj.js";import{rt as l}from"./getDB.BBWjdXVJ.js";import{i as u,o as d}from"./constants.th95jnuK.js";import{a as f,c as p,n as m,r as h,t as g}from"./useDebouncedValue.DZtTzuKv.js";import{a as _,n as v,o as y,r as b,s as x,t as S}from"./plot.DHDfo0HA.js";var C=`with spine as (
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
`,w={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function T(e,t){let n=f(e),r=e!==void 0,{periodTrunc:i,spineStart:a,spineEnd:o,step:s}=w[t],c=`(select min(ts::date) from ${d} where ${n})`,l=`(select max(ts::date) from ${d} where ${n})`;return C.replaceAll("${spineTimeTrunc}",i(`t.dt`)).replaceAll("${streamTimeTrunc}",i(`ts::date`)).replaceAll("${spineStart}",a(c,r)).replaceAll("${spineEnd}",o(l,r)).replaceAll("${step}",s).replaceAll("${table}",d).replaceAll("${year_condition}",n)}var E=e();function D(e,t,n){let r=new Date(e);return t===`year`?r.toLocaleDateString(n,{year:`numeric`}):t===`month`?r.toLocaleDateString(n,{month:`long`,year:`numeric`}):r.toLocaleDateString(n,{month:`short`,day:`numeric`,year:`numeric`})}function O(e,t,n,r,i){let a=new Date(e);if(r===`year`)return String(a.getUTCFullYear());if(r===`month`)return n===void 0?a.getUTCMonth()===0?String(a.getUTCFullYear()):``:a.toLocaleDateString(i,{month:`short`});if(r===`week`){let e=t?new Date(t):null;return e&&a.getUTCMonth()===e.getUTCMonth()?``:a.toLocaleDateString(i,{month:`short`})}return a.getUTCDate()===1?a.toLocaleDateString(i,{month:`short`}):``}var k=l(),A={year:`Year`,month:`Month`,week:`Week`,day:`Day`};function j({value:e,available:t,onChange:n}){return(0,k.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3`,children:[`year`,`month`,`week`,`day`].map(r=>{let i=t.includes(r);return(0,k.jsx)(`button`,{onClick:()=>i&&n(r),disabled:!i,className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===r?`bg-blue-500 text-white shadow-sm`:i?`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`:`text-gray-300 dark:text-gray-600 cursor-not-allowed`}`,children:A[r]},r)})})}function M({label:e,value:t}){return(0,k.jsxs)(`li`,{className:`flex justify-between items-center mt-1 first:mt-0`,role:`listitem`,children:[(0,k.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:e}),(0,k.jsx)(`span`,{className:`font-bold text-sm`,children:t})]})}function N({children:e}){return(0,k.jsx)(`ul`,{className:`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700`,role:`list`,children:e})}var ee=({data:e,year:n,granularity:a,availableGranularities:s,onGranularityChange:c,isLoading:l})=>{let[u,d]=(0,E.useState)(null),f=e?.reduce((e,t)=>e+t.ms_played,0)??0,p=e?.reduce((e,t)=>e+t.count_streams,0)??0,m=e?.length?Math.max(...e.map(e=>e.ms_played)):0,h=m||1,g=a!==`month`||n===void 0;return(0,k.jsxs)(t,{title:`Stream Timeline`,emoji:`📅`,isLoading:l,question:`How did my listening evolve over time?`,children:[(0,k.jsx)(j,{value:a,available:s,onChange:c}),!e?.length||p===0?(0,k.jsx)(r,{message:n===void 0?`No data`:`No data for this year`}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,k.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>d(null),children:e.map(e=>{let t=e.ms_played/h*100,n=e.ms_played===m&&e.ms_played>0;return(0,k.jsx)(`div`,{className:`flex-1 min-w-[3px] rounded-t transition-colors duration-200 ${n?`bg-brand-purple`:`bg-brand-blue`}`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.ms_played===0)return;let n=t.currentTarget.getBoundingClientRect();d({x:n.left+n.width/2,y:n.top,ts:e.ts,ms_played:e.ms_played,count_streams:e.count_streams})}},e.ts)})}),(0,k.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,r)=>{let i=O(t.ts,e[r-1]?.ts,n,a);return(0,k.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${g?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:i},t.ts)})})]}),(0,k.jsxs)(N,{children:[(0,k.jsx)(M,{label:`Total duration`,value:o(f)}),(0,k.jsx)(M,{label:`Total streams`,value:p.toLocaleString()})]})]}),u&&(0,k.jsx)(i,{x:u.x,y:u.y,title:D(u.ts,a),rows:[o(u.ms_played),`${u.count_streams.toLocaleString()} streams`]})]})},te=[`year`,`month`],ne=[`month`,`week`,`day`];function P(e){let[t,n]=(0,E.useState)(`month`),r=e===void 0?te:ne;return{granularity:t,setGranularity:n,availableGranularities:r,effectiveGranularity:r.includes(t)?t:r[0]}}function re({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=P(e),{data:i,isLoading:a}=p({query:T(e,r),year:e});return(0,k.jsx)(ee,{data:i,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,isLoading:a})}var ie=`with spine as (
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
`,ae=`select
    count(distinct \${entity_column})::int as total_distinct,
    (count(*) - count(distinct \${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from \${table}
where \${year_condition}
`,F={tracks:`track_uri`,artists:`artist_name`,albums:`album_name`},oe={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function se(e,t){let n=f(e);return ae.replaceAll("${entity_column}",F[t]).replaceAll("${table}",d).replaceAll("${year_condition}",n)}function ce(e,t,n){let r=f(e),i=e!==void 0,{periodTrunc:a,spineStart:o,spineEnd:s,step:c}=oe[t],l=`(select min(ts::date) from ${d} where ${r})`,u=`(select max(ts::date) from ${d} where ${r})`;return ie.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${streamTimeTrunc}",a(`ts::date`)).replaceAll("${entity_column}",F[n]).replaceAll("${spineStart}",o(l,i)).replaceAll("${spineEnd}",s(u,i)).replaceAll("${step}",c).replaceAll("${table}",d).replaceAll("${year_condition}",r)}function I({items:e}){return(0,k.jsx)(`div`,{className:`mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400`,children:e.map(({color:e,label:t})=>(0,k.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,k.jsx)(`span`,{className:`inline-block w-2 h-2 rounded-sm ${e}`}),t]},t))})}var le={artists:`Artists`,tracks:`Tracks`,albums:`Albums`};function L({value:e,onChange:t}){return(0,k.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[`artists`,`tracks`,`albums`].map(n=>(0,k.jsx)(`button`,{onClick:()=>t(n),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===n?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:le[n]},n))})}var R={tracks:`track`,artists:`artist`,albums:`album`},ue=({data:e,stats:n,year:a,granularity:o,availableGranularities:s,onGranularityChange:c,entity:l,onEntityChange:u,isLoading:d})=>{let[f,p]=(0,E.useState)(null),m=n?.total_distinct??0,h=(n?.total_streams??0)>0?Math.round((n?.total_distinct??0)/(n?.total_streams??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=o!==`month`||a===void 0;return(0,k.jsxs)(t,{title:`Stream Variety`,emoji:`🔀`,isLoading:d,question:`How varied was my listening?`,headerActions:(0,k.jsx)(L,{value:l,onChange:u}),children:[(0,k.jsx)(j,{value:o,available:s,onChange:c}),!e?.length||(n?.total_streams??0)===0?(0,k.jsx)(r,{message:a===void 0?`No data`:`No data for this year`}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,k.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>{let t=g>0?e.total_count/g*100:0;return(0,k.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,distinct_count:e.distinct_count,repeat_count:e.repeat_count,total_count:e.total_count})},children:[(0,k.jsx)(`div`,{className:`bg-yellow-400`,style:{flex:e.repeat_count}}),(0,k.jsx)(`div`,{className:`bg-orange-400`,style:{flex:e.distinct_count||+(e.total_count>0)}})]},e.ts)})}),(0,k.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let r=O(t.ts,e[n-1]?.ts,a,o);return(0,k.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:r},t.ts)})})]}),(0,k.jsx)(I,{items:[{color:`bg-orange-400`,label:`Distinct`},{color:`bg-yellow-400`,label:`Re-listens`}]}),(0,k.jsxs)(N,{children:[(0,k.jsx)(M,{label:`Unique ${R[l]}s listened`,value:m.toLocaleString()}),(0,k.jsx)(M,{label:(0,k.jsxs)(k.Fragment,{children:[`Variety rate`,(0,k.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(unique / total streams)`})]}),value:`${h}%`})]}),l!==`tracks`&&(0,k.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,k.jsx)(i,{x:f.x,y:f.y,title:D(f.ts,o),rows:[`${f.distinct_count.toLocaleString()} distinct`,`${f.repeat_count.toLocaleString()} re-listens`,`${f.total_count>0?Math.round(f.distinct_count/f.total_count*100):0}% variety`,`${f.distinct_count>0?Math.round(f.total_count/f.distinct_count):0} avg listens/${R[l]}`]})]})};function de({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=P(e),[i,a]=(0,E.useState)(`tracks`),{data:o,isLoading:s}=p({query:ce(e,r,i),year:e}),{data:c}=p({query:se(e,i),year:e}),l=c?.[0];return(0,k.jsx)(ue,{data:o,stats:l,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,entity:i,onEntityChange:a,isLoading:s})}var fe=`with first_listen as (
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
`,pe=`with first_listen as (
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
`,me={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function he(e,t){let n=f(e),r=e===void 0?`true`:`year(f.first_date) = ${e}`;return pe.replaceAll("${entity_column}",F[t]).replaceAll("${table}",d).replaceAll("${year_condition}",n).replaceAll("${new_condition}",r)}function ge(e,t,n){let r=f(e),i=e!==void 0,{periodTrunc:a,spineStart:o,spineEnd:s,step:c}=me[t],l=`(select min(ts::date) from ${d} where ${r})`,u=`(select max(ts::date) from ${d} where ${r})`;return fe.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${firstDateTrunc}",a(`first_date`)).replaceAll("${streamTimeTrunc}",a(`stream_date`)).replaceAll("${entity_column}",F[n]).replaceAll("${spineStart}",o(l,i)).replaceAll("${spineEnd}",s(u,i)).replaceAll("${step}",c).replaceAll("${table}",d).replaceAll("${year_condition}",r)}var _e=({data:e,stats:n,year:a,granularity:o,availableGranularities:s,onGranularityChange:c,entity:l,onEntityChange:u,isLoading:d})=>{let[f,p]=(0,E.useState)(null),m=n?.total_new??0,h=(n?.total_distinct??0)>0?Math.round((n?.total_new??0)/(n?.total_distinct??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=o!==`month`||a===void 0;return(0,k.jsxs)(t,{title:`Stream Discovery`,emoji:`🔭`,isLoading:d,question:`How many new artists, tracks, or albums did I discover?`,headerActions:(0,k.jsx)(L,{value:l,onChange:u}),children:[(0,k.jsx)(j,{value:o,available:s,onChange:c}),!e?.length||(n?.total_distinct??0)===0?(0,k.jsx)(r,{message:a===void 0?`No data`:`No data for this year`}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,k.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>{let t=g>0?e.total_count/g*100:0;return(0,k.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,new_count:e.new_count,known_count:e.known_count,total_count:e.total_count})},children:[(0,k.jsx)(`div`,{className:`bg-rose-500`,style:{flex:e.known_count}}),(0,k.jsx)(`div`,{className:`bg-rose-800`,style:{flex:e.new_count}})]},e.ts)})}),(0,k.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let r=O(t.ts,e[n-1]?.ts,a,o);return(0,k.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:r},t.ts)})})]}),(0,k.jsx)(I,{items:[{color:`bg-rose-800`,label:`New`},{color:`bg-rose-500`,label:`Known`}]}),(0,k.jsxs)(N,{children:[(0,k.jsx)(M,{label:`New ${R[l]}s discovered`,value:m.toLocaleString()}),(0,k.jsx)(M,{label:(0,k.jsxs)(k.Fragment,{children:[`Discovery rate`,(0,k.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(new / total distinct)`})]}),value:`${h}%`})]}),l!==`tracks`&&(0,k.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,k.jsx)(i,{x:f.x,y:f.y,title:D(f.ts,o),rows:[`${f.new_count.toLocaleString()} new`,`${f.known_count.toLocaleString()} known`,`${f.total_count>0?Math.round(f.new_count/f.total_count*100):0}% discovery`]})]})};function ve({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=P(e),[i,a]=(0,E.useState)(`tracks`),{data:o,isLoading:s}=p({query:ge(e,r,i),year:e}),{data:c}=p({query:he(e,i),year:e}),l=c?.[0];return(0,k.jsx)(_e,{data:o,stats:l,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,entity:i,onEntityChange:a,isLoading:s})}var ye=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function be(e){return ye.replaceAll("${table}",d).replaceAll("${year_condition}",f(e))}var xe=3,z=24,Se=Array.from({length:7},(e,t)=>t%2==0?``:new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`}));function B(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r)}function V(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function H(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}var U=e=>e.streak>0,W=e=>e.streak===0&&e.prevStreak>0&&e.inRange,Ce=e=>U(e)||W(e);function we(e,t){return U(e)?`rgba(34,197,94,${Math.max(.2,e.streak/t)})`:W(e)?`rgba(239,68,68,0.45)`:e.inRange?null:`transparent`}function G(e){return new Date(e+`T00:00:00`).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`})}function Te({data:e,year:n,isLatestYear:a,isLoading:o}){let s=(0,E.useRef)(null),[c,l]=(0,E.useState)(null),{cells:u,maxStreak:d,bestStreakEnd:f,bestStreakStart:p,currentStreak:m}=(0,E.useMemo)(()=>{if(!e||e.length===0)return{cells:[],maxStreak:0,bestStreakEnd:``,bestStreakStart:``,currentStreak:0};let t=new Set(e.map(e=>e.stream_date)),r=[...t].sort(),i=r[0],a=r[r.length-1],o=n===void 0?i:`${n}-01-01`,s=n===void 0?a:`${n}-12-31`,c=[],l=B(o),u=B(s),d=0,f=0,p=``,m=0;for(;l<=u;){let e=V(l),r=d;d=t.has(e)?r+1:0;let o=n===void 0||e>=i&&e<=a;c.push({day:e,streak:d,prevStreak:r,inRange:o}),d>f&&(f=d,p=e),t.has(e)&&(m=d),l.setDate(l.getDate()+1)}let h=``;return p&&f>0&&(h=V(H(B(p),-(f-1)))),{cells:c,maxStreak:f,bestStreakEnd:p,bestStreakStart:h,currentStreak:m}},[e,n]),{weeks:h,monthLabels:g,weekCount:_}=(0,E.useMemo)(()=>{if(u.length===0)return{weeks:[],monthLabels:[],weekCount:0};let e=new Map(u.map(e=>[e.day,e])),t=B(u[0].day),n=B(u[u.length-1].day),r=new Date(t);r.setDate(r.getDate()-r.getDay());let i=new Date(n);i.setDate(i.getDate()+(6-i.getDay()));let a=(Math.round((i.getTime()-r.getTime())/864e5)+1)/7,o=[];for(let t=0;t<a;t++){let n=[];for(let i=0;i<7;i++){let a=V(H(r,t*7+i));n.push(e.get(a)??null)}o.push(n)}let s=[],c=-1,l=-1;for(let e=0;e<o.length;e++){let t=o[e].find(e=>e!==null);if(!t)continue;let n=B(t.day),r=n.getMonth(),i=n.getFullYear();if(r!==c){let t=i!==l,a=n.toLocaleDateString(void 0,{month:`short`});s.push({weekIdx:e,label:t?`${a} '${String(i).slice(2)}`:a}),c=r,l=i}}return{weeks:o,monthLabels:s,weekCount:a}},[u]);(0,E.useEffect)(()=>{let e=s.current;e&&(e.scrollLeft=n===void 0?e.scrollWidth:0)},[n,u]);let v=!e||e.length===0,y=z+_*13,b=`${z}px repeat(${_}, 1fr)`;return(0,k.jsxs)(t,{title:`Listening Streaks`,emoji:`🔥`,question:`How consistent is your listening?`,isLoading:o,children:[v?(0,k.jsx)(r,{}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`div`,{ref:s,className:`overflow-x-auto pb-4`,onMouseLeave:()=>l(null),children:(0,k.jsxs)(`div`,{style:{minWidth:`${y}px`},children:[(0,k.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,marginBottom:2},children:[(0,k.jsx)(`div`,{}),Array.from({length:_},(e,t)=>{let n=g.find(e=>e.weekIdx===t);return(0,k.jsx)(`div`,{className:`text-[9px] text-gray-400 dark:text-gray-600`,children:n?.label??``},t)})]}),(0,k.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,gridTemplateRows:`repeat(7, auto)`,gap:`${xe}px`},children:[Se.map((e,t)=>(0,k.jsx)(`div`,{style:{gridColumn:1,gridRow:t+1},className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:e},`label-${t}`)),h.flatMap((e,t)=>e.map((e,n)=>{let r=e?U(e)?`streak-cell-active`:W(e)?`streak-cell-break`:void 0:void 0,i=e?we(e,d):`transparent`;return(0,k.jsx)(`div`,{"data-testid":r,style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`,backgroundColor:i??void 0},className:`rounded-xs ${i===null?`bg-gray-100 dark:bg-slate-700/50`:``}`,onMouseEnter:e&&Ce(e)?t=>{let n=t.currentTarget.getBoundingClientRect();l({cell:e,x:n.left+n.width/2,y:n.top})}:void 0},`${t}-${n}`)}))]})]})}),(0,k.jsxs)(N,{children:[(0,k.jsx)(M,{label:`Best streak`,value:(0,k.jsxs)(k.Fragment,{children:[d,` day`,d===1?``:`s`,p&&f&&(0,k.jsxs)(`span`,{className:`font-normal text-gray-500 dark:text-gray-400`,children:[` `,`·`,` `,G(p),` `,`–`,` `,G(f)]})]})}),a&&(0,k.jsx)(M,{label:`Current streak`,value:`${m} day${m===1?``:`s`}`})]})]}),c&&(0,k.jsx)(i,{x:c.x,y:c.y,title:G(c.cell.day),rows:[c.cell.streak>0?`Day ${c.cell.streak} of streak`:`Streak broken`]})]})}function Ee({year:e,isLatestYear:t}){let{data:n,isLoading:r}=p({query:be(e),year:e});return(0,k.jsx)(Te,{data:n,year:e,isLatestYear:t,isLoading:r})}var De={artists:`with artist_yearly_play_counts as (
    select
        year(ts::datetime)::int as stream_year,
        artist_name as artist,
        count(*)::int as play_count
    from \${table}
    where
        artist_name is not null
    \${yearFilter}
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
    yr.artist as entity_name,
    yr.stream_rank,
    yr.play_count
from yearly_ranks as yr
inner join top_10_global_artists as t10 on yr.artist = t10.artist
order by yr.stream_year, yr.stream_rank
`,tracks:`with track_yearly_play_counts as (
    select
        year(ts::datetime)::int as stream_year,
        track_name,
        artist_name,
        count(*)::int as play_count
    from \${table}
    where
        track_name is not null
    \${yearFilter}
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
    yr.stream_rank,
    yr.play_count,
    yr.track_name || ' — ' || yr.artist_name as entity_name
from yearly_ranks as yr
inner join
    top_10_global_tracks
on yr.track_name = top_10_global_tracks.track_name
and yr.artist_name = top_10_global_tracks.artist_name
order by yr.stream_year, yr.stream_rank
`,albums:`with
max_date as (
    select max(ts::date) as last_date
    from \${table}
    where
        true
    \${yearFilter}
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
    yr.stream_rank,
    yr.play_count,
    yr.album_name || ' — ' || yr.artist_name as entity_name
from yearly_ranks as yr
inner join top_10_global_albums using (artist, album)
order by yr.stream_year, yr.stream_rank
`};function Oe(e,t=`artists`){let n=De[t].replaceAll("${table}",d),r=e?`AND year(ts::datetime) <= ${e}`:``;return n.replaceAll("${table}",d).replace("${yearFilter}",r)}var K=[`bg-blue-500`,`bg-red-500`,`bg-green-500`,`bg-yellow-500`,`bg-purple-500`,`bg-pink-500`,`bg-indigo-500`,`bg-teal-500`,`bg-orange-500`,`bg-cyan-500`],q=1200,J=700,Y={top:20,right:200,bottom:40,left:60},X=q-Y.left-Y.right,Z=J-Y.top-Y.bottom,ke=[1,2,5],Ae=K.map(e=>`var(--color-${e.replace(/^bg-/,``)})`);function je(e){let t=[];for(let n=1;n<=e;n*=10)for(let r of ke)r*n<=e&&t.push(r*n);return t}function Me({data:e}){let[t,n]=(0,E.useState)(null),{series:r,labels:a,years:o,rankTicks:s,xScale:c,yScale:l}=(0,E.useMemo)(()=>{let t=new Map;for(let n of e)t.has(n.entity_name)||t.set(n.entity_name,[]),t.get(n.entity_name).push(n);let n=Array.from(t.values()).map(e=>(e.sort((e,t)=>e.stream_year-t.stream_year),e[e.length-1])).sort((e,t)=>e.stream_rank-t.stream_rank),r=new Map;for(let t of[...e].sort((e,t)=>e.stream_year-t.stream_year))r.has(t.entity_name)||r.set(t.entity_name,Ae[r.size%Ae.length]);let i=n.map(e=>({entity_name:e.entity_name,color:r.get(e.entity_name),points:t.get(e.entity_name)})),a=Math.min(...e.map(e=>e.stream_year)),o=Math.max(...e.map(e=>e.stream_year)),s=Math.max(2,...e.map(e=>e.stream_rank));return{series:i,labels:n,years:Array.from({length:o-a+1},(e,t)=>a+t),rankTicks:je(s),xScale:e=>Y.left+(o===a?X/2:(e-a)/(o-a)*X),yScale:e=>Y.top+Math.log(e)/Math.log(s)*Z}},[e]),u=new Map(r.map(e=>[e.entity_name,e.color])),d=t?.point.entity_name;return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`svg`,{viewBox:`0 0 ${q} ${J}`,className:`w-full h-auto`,onMouseLeave:()=>n(null),children:[s.map(e=>(0,k.jsxs)(`g`,{children:[(0,k.jsx)(`line`,{x1:Y.left,x2:Y.left+X,y1:l(e),y2:l(e),className:`stroke-gray-200 dark:stroke-slate-700`,strokeWidth:1}),(0,k.jsx)(`text`,{x:Y.left-8,y:l(e),textAnchor:`end`,dominantBaseline:`central`,fontSize:12,className:`fill-gray-500 dark:fill-gray-400`,children:e})]},e)),(0,k.jsx)(`text`,{x:Y.left-8,y:Y.top-8,textAnchor:`end`,fontSize:12,className:`fill-gray-500 dark:fill-gray-400`,children:`↑ Rank`}),o.map(e=>(0,k.jsx)(`text`,{x:c(e),y:Y.top+Z+20,textAnchor:`middle`,fontSize:12,className:`fill-gray-500 dark:fill-gray-400`,children:e},e)),(0,k.jsx)(`text`,{x:Y.left+X,y:696,textAnchor:`end`,fontSize:12,className:`fill-gray-500 dark:fill-gray-400`,children:`Year →`}),r.map(({entity_name:e,color:t,points:r})=>(0,k.jsxs)(`g`,{className:`transition-opacity duration-150`,stroke:t,fill:t,opacity:d!==void 0&&d!==e?.2:1,children:[(0,k.jsx)(`polyline`,{points:r.map(e=>`${c(e.stream_year)},${l(e.stream_rank)}`).join(` `),fill:`none`,strokeWidth:2.5,strokeLinejoin:`round`,strokeLinecap:`round`}),r.map(t=>(0,k.jsx)(`circle`,{cx:c(t.stream_year),cy:l(t.stream_rank),r:d===e?6:4,strokeWidth:0,onMouseEnter:e=>{let r=e.currentTarget.getBoundingClientRect();n({x:r.left+r.width/2,y:r.top,point:t})}},t.stream_year))]},e)),a.map((e,t)=>(0,k.jsx)(`text`,{x:c(e.stream_year)+10,y:l(e.stream_rank)+(t%2==0?-8:8),dominantBaseline:`central`,fontSize:11,fontWeight:`bold`,fill:u.get(e.entity_name),children:e.entity_name},e.entity_name))]}),t&&(0,k.jsx)(i,{x:t.x,y:t.y,title:t.point.entity_name,rows:[`Rank: ${t.point.stream_rank}`,`Year: ${t.point.stream_year}`,`${t.point.play_count.toLocaleString()} streams`]})]})}function Ne({year:e}){let[n,i]=(0,E.useState)(`artists`),{data:a,isLoading:o}=p({query:Oe(e,n),year:e}),s=a??[],c=o&&s.length===0;return(0,k.jsx)(t,{title:`Global Top 10 Artists Evolution`,emoji:`📈`,className:`md:col-span-2 lg:col-span-3`,isLoading:c,question:`How has the yearly ranking of my All-Time Top 10 Artists evolved over the years?`,headerActions:(0,k.jsx)(L,{value:n,onChange:i}),children:s.length===0?(0,k.jsx)(r,{}):(0,k.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,k.jsx)(Me,{data:s})})})}var Pe=`with daily as (
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
`;function Fe(e){let t=f(e);return Pe.replaceAll("${table}",d).replaceAll("${year_condition}",t)}function Q({frameCount:e,startTs:t,endTs:n,currentFrameIdx:r,speedMultiplier:i,isPlaying:a,onFrameChange:o,onSpeedChange:s,onPlayPause:c}){let l=r>=e-1;return(0,k.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[(0,k.jsxs)(`div`,{className:`flex items-center gap-2 flex-1 min-w-0 px-1`,children:[(0,k.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(t).toLocaleDateString(void 0,{year:`numeric`,month:`short`})}),(0,k.jsx)(`input`,{type:`range`,"aria-label":`Animation timeline`,min:0,max:e-1,value:r,onChange:e=>o(Number(e.target.value)),className:`flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-w-0`}),(0,k.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(n).toLocaleDateString(void 0,{year:`numeric`,month:`short`})})]}),(0,k.jsxs)(`div`,{className:`flex items-center shrink-0 self-center sm:self-auto`,children:[[.5,1,2,4].map(e=>(0,k.jsxs)(`button`,{type:`button`,onClick:()=>s(e),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${i===e?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:[e,`x`]},e)),(0,k.jsx)(`div`,{className:`w-px h-4 bg-gray-300/50 dark:bg-slate-600/50 mx-1`}),(0,k.jsx)(`button`,{type:`button`,onClick:c,"aria-label":a?`Pause`:l?`Replay`:`Play`,title:a?`Pause`:l?`Replay`:`Play`,className:`p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-all`,children:a?(0,k.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,k.jsx)(`rect`,{x:`3`,y:`2`,width:`4`,height:`12`,rx:`1`}),(0,k.jsx)(`rect`,{x:`9`,y:`2`,width:`4`,height:`12`,rx:`1`})]}):l?(0,k.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,k.jsx)(`path`,{d:`M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z`}),(0,k.jsx)(`path`,{d:`M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z`})]}):(0,k.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:(0,k.jsx)(`path`,{d:`M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z`})})})]})]})}function $({frameCount:e,baseSpeed:t,entityType:n}){let[r,i]=(0,E.useState)(0),[a,o]=(0,E.useState)(!1),[s,c]=(0,E.useState)(1),[l,u]=(0,E.useState)(!1),d=(0,E.useRef)(null);(0,E.useEffect)(()=>{let e=new IntersectionObserver(([e])=>{u(e.isIntersecting)},{threshold:.1}),t=d.current;return t&&e.observe(t),()=>{t&&e.unobserve(t)}},[]);let f=(0,E.useRef)(!1);return(0,E.useEffect)(()=>{f.current?(i(0),o(!0)):f.current=!0},[n]),(0,E.useEffect)(()=>{if(!a||!l||e===0)return;let n=setInterval(()=>{i(t=>t>=e-1?(o(!1),t):t+1)},t/s);return()=>clearInterval(n)},[a,l,e,t,s]),{containerRef:d,currentFrameIdx:r,isPlaying:a,speedMultiplier:s,onFrameChange:e=>{o(!1),i(e)},onSpeedChange:c,onPlayPause:()=>{r>=e-1?(i(0),o(!0)):o(e=>!e)}}}var Ie=3,Le=24,Re=40,ze=120,Be=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`long`,timeZone:`UTC`})),Ve=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`})),He=Array.from({length:24},(e,t)=>t%6==0?String(t):``);function Ue({data:e,year:n,isLoading:r}){let{frames:a,maxCount:o,topDay:s,topHour:c,firstPlayedByCell:l,firstCompleteHourFrame:u,firstCompleteHourLabel:d,firstCompleteDayFrame:f,firstCompleteDayLabel:p,bingoFrame:m,uncoveredCells:h}=(0,E.useMemo)(()=>{if(!e||e.length===0)return{frames:[],maxCount:1,topDay:-1,topHour:-1,firstPlayedByCell:new Map,firstCompleteHourFrame:null,firstCompleteHourLabel:``,firstCompleteDayFrame:null,firstCompleteDayLabel:``,bingoFrame:null,uncoveredCells:168};let t=[...new Set(e.map(e=>e.stream_date_ts))].sort((e,t)=>e-t),n=new Map;for(let t of e)n.has(t.stream_date_ts)||n.set(t.stream_date_ts,[]),n.get(t.stream_date_ts).push(t);let r=new Map,i=[],a=new Map,o=new Map,s=new Map,c=0,l=null,u=``,d=null,f=``,p=null;for(let e=0;e<t.length;e++){let m=t[e],h=n.get(m)??[];for(let e of h){let t=`${e.day_of_week},${e.play_hour}`;if(!r.has(t)){a.set(t,m),c++;let n=e.day_of_week,r=e.play_hour;o.has(r)||o.set(r,new Set),o.get(r).add(n),s.has(n)||s.set(n,new Set),s.get(n).add(r)}r.set(t,e.cumulative_count)}if(i.push({dateTs:m,cells:new Map(r)}),l===null){for(let[t,n]of o)if(n.size===7){l=e,u=`${t}h · ${new Date(m).toLocaleDateString()}`;break}}if(d===null){for(let[t,n]of s)if(n.size===24){d=e,f=`${Be[t]} · ${new Date(m).toLocaleDateString()}`;break}}p===null&&c===168&&(p=e)}let m=168-c,h=i[i.length-1].cells,g=Math.max(1,...h.values()),_=Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=h.get(`${t},${e}`)??0;return n}),v=Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=h.get(`${e},${t}`)??0;return n});return{frames:i,maxCount:g,topDay:_.indexOf(Math.max(..._)),topHour:v.indexOf(Math.max(...v)),firstPlayedByCell:a,firstCompleteHourFrame:l,firstCompleteHourLabel:u,firstCompleteDayFrame:d,firstCompleteDayLabel:f,bingoFrame:p,uncoveredCells:m}},[e]),{containerRef:g,currentFrameIdx:_,isPlaying:v,speedMultiplier:y,onFrameChange:b,onSpeedChange:x,onPlayPause:S}=$({frameCount:a.length,baseSpeed:ze,entityType:String(n)}),C=(0,E.useMemo)(()=>a[_]?.cells??new Map,[a,_]),{dayTotals:w,hourTotals:T}=(0,E.useMemo)(()=>({dayTotals:Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=C.get(`${t},${e}`)??0;return n}),hourTotals:Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=C.get(`${e},${t}`)??0;return n})}),[C]),[D,O]=(0,E.useState)(null),A=null;return m!==null&&_>=m?A=(0,k.jsx)(`span`,{className:`font-bold text-sm`,children:new Date(a[m].dateTs).toLocaleDateString()}):m===null&&a.length>0&&_>=a.length-1&&(A=(0,k.jsxs)(`span`,{className:`text-sm text-gray-500`,children:[h,` cells uncovered`]})),(0,k.jsx)(`div`,{ref:g,children:(0,k.jsxs)(t,{title:`Listening Bingo`,emoji:`🎰`,question:`Have you listened at every hour of every day?`,isLoading:r,children:[(0,k.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,k.jsx)(`div`,{className:`md:hidden`,"data-testid":`bingo-grid-mobile`,children:(0,k.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`${Le}px repeat(7, 1fr) ${Re}px`,gap:`${Ie}px`},onMouseLeave:()=>O(null),children:[(0,k.jsx)(`div`,{}),Ve.map((e,t)=>(0,k.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,k.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),Array.from({length:24},(e,t)=>(0,k.jsxs)(E.Fragment,{children:[(0,k.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:He[t]}),Array.from({length:7},(e,n)=>{let r=C.get(`${n},${t}`)??0,i=r>0;return(0,k.jsx)(`div`,{style:{height:12,...i&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/o)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${i?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let a=e.currentTarget.getBoundingClientRect();O({x:a.left+a.width/2,y:a.top,day:n,hour:t,count:r,firstPlayedTs:i?l.get(`${n},${t}`)??null:null})}},`${n}-${r}`)}),(0,k.jsx)(`div`,{className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===c?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:T[t]>0?T[t]:``})]},t)),(0,k.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),w.map((e,t)=>(0,k.jsx)(`div`,{className:`text-[8px] text-center font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,k.jsx)(`div`,{})]})}),(0,k.jsx)(`div`,{className:`hidden md:block overflow-x-auto`,children:(0,k.jsxs)(`div`,{"data-testid":`bingo-grid-desktop`,style:{display:`grid`,gridTemplateColumns:`${Le}px repeat(24, 1fr) ${Re}px`,gap:`${Ie}px`,minWidth:`376px`},onMouseLeave:()=>O(null),children:[(0,k.jsx)(`div`,{}),He.map((e,t)=>(0,k.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,k.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),Ve.map((e,t)=>(0,k.jsxs)(E.Fragment,{children:[(0,k.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:t===1||t===3||t===5?e:``}),Array.from({length:24},(e,n)=>{let r=C.get(`${t},${n}`)??0,i=r>0;return(0,k.jsx)(`div`,{style:{aspectRatio:`1`,...i&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/o)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${i?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let a=e.currentTarget.getBoundingClientRect();O({x:a.left+a.width/2,y:a.top,day:t,hour:n,count:r,firstPlayedTs:i?l.get(`${t},${n}`)??null:null})}},`${n}-${r}`)}),(0,k.jsx)(`div`,{"data-testid":`day-total-${t}`,className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:w[t]>0?w[t]:``})]},t)),(0,k.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),T.map((e,t)=>(0,k.jsx)(`div`,{"data-testid":`hour-total-${t}`,className:`text-[8px] text-center font-medium ${t===c?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,k.jsx)(`div`,{})]})}),a.length>1&&(0,k.jsx)(Q,{frameCount:a.length,startTs:a[0].dateTs,endTs:a[a.length-1].dateTs,currentFrameIdx:_,speedMultiplier:y,isPlaying:v,onFrameChange:b,onSpeedChange:x,onPlayPause:S}),(0,k.jsxs)(N,{children:[(0,k.jsx)(M,{label:`First complete hour`,value:u!==null&&_>=u?d:null}),(0,k.jsx)(M,{label:`First complete day`,value:f!==null&&_>=f?p:null}),(0,k.jsx)(M,{label:`Bingo`,value:A})]})]}),D&&(0,k.jsx)(i,{x:D.x,y:D.y,title:`${Be[D.day]} ${D.hour}h`,rows:[`${D.count.toLocaleString()} streams`,D.firstPlayedTs===null?null:`first played ${new Date(D.firstPlayedTs).toLocaleDateString()}`]})]})})}function We({year:e}){let{data:t,isLoading:n}=p({query:Fe(e),year:e});return(0,k.jsx)(Ue,{data:t,year:e,isLoading:n})}var Ge={artists:`with daily_streams as (
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
`};function Ke(e,t=`artists`){let n=Ge[t].replaceAll("${table}",d);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function qe(e,t){let n=(0,E.useRef)(e),[r,i]=(0,E.useState)(t);return(0,E.useEffect)(()=>{e!==n.current&&(n.current=e,i(t))},[e,t]),r}var Je=120,Ye=44,Xe=60;function Ze({data:e,entityType:t}){let{frames:n,entityColors:r}=(0,E.useMemo)(()=>{let t=Array.from(new Set(e.map(e=>e.stream_date_ts))).sort((e,t)=>e-t),n=new Map,r=[],i=new Map,a=0,o=new Map;for(let t of e)o.has(t.stream_date_ts)||o.set(t.stream_date_ts,[]),o.get(t.stream_date_ts).push(t);for(let e of t){let t=o.get(e)||[];for(let e of t)n.set(e.entity_name,e.play_count),i.has(e.entity_name)||(i.set(e.entity_name,K[a%K.length]),a++);let s=Array.from(n.entries()).sort((e,t)=>t[1]-e[1]).slice(0,10);r.push({dateTs:e,top10:s.map(([e,t])=>({label:e,play_count:t})),maxScore:Math.max(1,s[0]?.[1]||1)})}return{frames:r,entityColors:i}},[e]),{containerRef:i,currentFrameIdx:a,isPlaying:o,speedMultiplier:s,onFrameChange:c,onSpeedChange:l,onPlayPause:u}=$({frameCount:n.length,baseSpeed:Je,entityType:t}),d=n[a];return d?(0,k.jsxs)(`div`,{ref:i,className:`flex flex-col gap-4 w-full`,children:[(0,k.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[new Date(d.dateTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,k.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· daily`})]}),(0,k.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:Xe},children:(0,k.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`streams`})}),(0,k.jsx)(`div`,{className:`relative w-full`,style:{height:d.top10.length*Ye},children:d.top10.map((e,t)=>{let n=e.play_count/d.maxScore*100,i=t*Ye;return(0,k.jsxs)(`div`,{className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,k.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,k.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,k.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,k.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,k.jsx)(`div`,{className:`ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:Xe},children:e.play_count.toLocaleString()})]},e.label)})}),n.length>1&&(0,k.jsx)(Q,{frameCount:n.length,startTs:n[0].dateTs,endTs:n[n.length-1].dateTs,currentFrameIdx:a,speedMultiplier:s,isPlaying:o,onFrameChange:c,onSpeedChange:l,onPlayPause:u})]}):null}function Qe({year:e}){let[n,i]=(0,E.useState)(`artists`),{data:a,isLoading:o}=p({query:Ke(e,n),year:e}),s=a??[],c=qe(a,n),l=o&&s.length===0;return(0,k.jsx)(t,{title:`Top 10 Race`,emoji:`🏎️`,className:`md:col-span-2 lg:col-span-3`,isLoading:l,question:`Who dominated my listening, and when did they rise?`,headerActions:(0,k.jsx)(L,{value:n,onChange:i}),children:s.length===0?(0,k.jsx)(r,{}):(0,k.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,k.jsx)(Ze,{data:s,entityType:c})})})}var $e={artists:`select
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
`};function et(e,t=`artists`){let n=$e[t].replaceAll("${table}",d);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function tt({ranking:e,activeLabels:t}){return(0,k.jsxs)(`div`,{className:`flex flex-col`,children:[(0,k.jsx)(`span`,{className:`text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3`,children:`Longevity Leaderboard`}),(0,k.jsx)(`div`,{className:`flex flex-col gap-0.5`,children:e.map((e,n)=>(0,k.jsxs)(`div`,{className:`flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors`,children:[(0,k.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono`,children:n+1}),(0,k.jsx)(`span`,{className:`text-sm truncate flex-1 min-w-0 ${t.has(e.label)?`font-bold text-gray-900 dark:text-white`:`font-normal text-gray-500 dark:text-gray-400`}`,children:e.label}),(0,k.jsxs)(`span`,{className:`text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0`,children:[e.periodsInTop10,`w`]}),(0,k.jsx)(`span`,{className:`text-xs font-mono shrink-0 w-8 text-right`,children:e.rankDelta===null?(0,k.jsx)(`span`,{className:`text-blue-400`,children:`new`}):e.rankDelta>0?(0,k.jsxs)(`span`,{className:`text-emerald-400`,children:[`↑`,e.rankDelta]}):e.rankDelta<0?(0,k.jsxs)(`span`,{className:`text-red-400`,children:[`↓`,Math.abs(e.rankDelta)]}):(0,k.jsx)(`span`,{className:`text-gray-400 opacity-40`,children:`—`})})]},e.label))})]})}var nt=240,rt=44,it=62;function at({data:e,entityType:t}){let{frames:n,entityColors:r,streakRecord:i}=(0,E.useMemo)(()=>{let t=[...new Set(e.map(e=>e.period_ts))].sort((e,t)=>e-t),n=Math.exp(-.2),r=new Map;for(let t of e)r.has(t.period_ts)||r.set(t.period_ts,[]),r.get(t.period_ts).push({label:t.entity_name,plays:t.period_plays});let i=new Map,a=new Map,o=new Map,s=new Map,c=new Map,l=0,u=[];for(let e of t){for(let[e,t]of i)i.set(e,t*n);for(let{label:t,plays:n}of r.get(e)??[])i.set(t,(i.get(t)??0)+n),c.has(t)||(c.set(t,K[l%K.length]),l++);let t=[...i.entries()].filter(([,e])=>e>.01).sort((e,t)=>t[1]-e[1]).slice(0,10),d=new Set(t.map(([e])=>e));for(let[e]of t){a.set(e,(a.get(e)??0)+1),o.set(e,(o.get(e)??0)+1);let t=o.get(e);t>(s.get(e)??0)&&s.set(e,t)}for(let[e]of i)!d.has(e)&&(o.get(e)??0)>0&&o.set(e,0);let f=t[0]?.[1]??1,p=u.length>0?u[u.length-1].ghostRanking:[],m=new Map(p.map((e,t)=>[e.label,t])),h=[...a.entries()].sort((e,t)=>t[1]-e[1]).slice(0,10).map(([e,t],n)=>({label:e,periodsInTop10:t,rankDelta:p.length===0?null:m.has(e)?m.get(e)-n:null}));u.push({periodTs:e,top10:t.map(([e,t])=>({label:e,score:t,periodsInTop10:a.get(e)??0})),maxScore:f,ghostRanking:h})}let d={label:``,weeks:0};for(let[e,t]of s)t>d.weeks&&(d={label:e,weeks:t});return{frames:u,entityColors:c,streakRecord:d}},[e]),{containerRef:a,currentFrameIdx:o,isPlaying:c,speedMultiplier:l,onFrameChange:u,onSpeedChange:d,onPlayPause:f}=$({frameCount:n.length,baseSpeed:nt,entityType:t}),p=n[o],m=(0,E.useMemo)(()=>new Set(p?.top10.map(e=>e.label)??[]),[p]);return p?(0,k.jsxs)(`div`,{ref:a,className:`flex flex-col gap-4 w-full`,children:[(0,k.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[`Week of `+new Date(p.periodTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,k.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· weekly`})]}),(0,k.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-6`,children:[(0,k.jsxs)(`div`,{className:`md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4`,children:[(0,k.jsx)(tt,{ranking:p.ghostRanking,activeLabels:m}),i.weeks>0&&(0,k.jsxs)(s,{children:[(0,k.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 mb-0.5`,children:`🔥 Longest streak`}),o>=n.length-1?(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`span`,{className:`font-bold`,children:i.label}),(0,k.jsxs)(`span`,{className:`text-xs font-normal text-gray-500 dark:text-gray-400 ml-1`,children:[i.weeks,` consecutive weeks`]})]}):(0,k.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 italic`,children:`Watch till the end to find out…`})]})]}),(0,k.jsxs)(`div`,{className:`md:col-span-2 flex flex-col`,children:[(0,k.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:it},children:(0,k.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`score`})}),(0,k.jsx)(`div`,{className:`relative w-full mt-4`,style:{height:p.top10.length*rt},children:p.top10.map((e,t)=>{let n=e.score/p.maxScore*100,i=t*rt;return(0,k.jsxs)(`div`,{title:`${e.periodsInTop10} weeks in top 10`,className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,k.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,k.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,k.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,k.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,k.jsx)(`div`,{className:`ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:it},children:Math.round(e.score).toLocaleString()})]},e.label)})}),(0,k.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2`,children:`Score = Σ streams × e^(−0.2×Δweeks)`})]})]}),n.length>1&&(0,k.jsx)(Q,{frameCount:n.length,startTs:n[0].periodTs,endTs:n[n.length-1].periodTs,currentFrameIdx:o,speedMultiplier:l,isPlaying:c,onFrameChange:u,onSpeedChange:d,onPlayPause:f})]}):null}function ot({year:e}){let[n,i]=(0,E.useState)(`artists`),{data:a,isLoading:o}=p({query:et(e,n),year:e}),s=a??[],c=qe(a,n),l=o&&s.length===0;return(0,k.jsx)(t,{title:`Top 10 Billboard`,emoji:`🏆`,className:`md:col-span-2 lg:col-span-3`,isLoading:l,question:`Who stayed in the charts the longest week after week?`,headerActions:(0,k.jsx)(L,{value:n,onChange:i}),children:s.length===0?(0,k.jsx)(r,{}):(0,k.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,k.jsx)(at,{data:s,entityType:c})})})}function st(e){let t=f(e,`year(session_start::date)`);return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${u}
        WHERE ${t}
        ORDER BY session_start
    `}var ct=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];function lt(e,t=!1){let n=`#7c3aed`,r={background:`transparent`,color:t?`#e5e7eb`:`#1f2937`},i=_({title:`Session duration distribution`,width:600,height:220,style:r,x:{label:`Duration (min)`,nice:!0},y:{label:`Sessions`,grid:!0},color:{range:[`#ede9fe`,n]},marks:[y(e,{...v({y:`count`,fill:`count`},{x:e=>e.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),x([0])]}),a=_({title:`Sessions over time`,width:600,height:260,style:r,x:{label:`Date`,type:`time`,nice:!0},y:{label:`Start hour`,domain:[0,23],tickFormat:e=>`${e}h`},r:{range:[2,20]},marks:[b(e,{x:e=>new Date(e.session_start),y:e=>e.start_hour,r:e=>e.duration_ms/6e4,fill:n,fillOpacity:.6,tip:!0})]}),o=e.reduce((e,t)=>(e[t.day_of_week]++,e),[0,0,0,0,0,0,0]),s=ct.map((e,t)=>({day:e,count:o[t]})),c=_({title:`Sessions by day of week`,width:400,height:200,style:r,x:{label:`Day`,domain:ct},y:{label:`Sessions`,grid:!0},marks:[S(s,{x:`day`,y:`count`,fill:n,tip:!0}),x([0])]}),l=document.createElement(`div`);return l.className=`space-y-4 p-4`,l.append(i,a,c),l}function ut({query:e,buildPlot:t}){let[n,r]=(0,E.useState)(),{effectiveTheme:i}=(0,E.useContext)(c),o=(0,E.useRef)(null);return(0,E.useEffect)(()=>{(async()=>{let t=await a(e);r(t)})()},[e]),(0,E.useEffect)(()=>{if(!n)return;let e=t(n,i===`dark`);return o.current&&o.current.replaceChildren(e),()=>{e.remove()}},[n,t,i]),(0,k.jsx)(`div`,{ref:o,className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`})}function dt({year:e}){let t=(0,E.useCallback)((e,t)=>lt(e,t),[]);return(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`p`,{className:`text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2`,children:`How have my listening sessions evolved over time?`}),(0,k.jsx)(ut,{query:st(e),buildPlot:t})]})}var ft=(0,E.memo)(re),pt=(0,E.memo)(de),mt=(0,E.memo)(ve),ht=(0,E.memo)(Ee),gt=(0,E.memo)(Ne),_t=(0,E.memo)(We),vt=(0,E.memo)(Qe),yt=(0,E.memo)(ot),bt=(0,E.memo)(dt);function xt(){let[e,t]=(0,E.useState)(2006),[r,i]=(0,E.useState)(),o=g(e,250),s=(0,E.useCallback)(async()=>{try{let e=await a(m);i(e[0]||void 0)}catch{}},[]);(0,E.useEffect)(()=>{s()},[s]),(0,E.useEffect)(()=>(window.addEventListener(n,s),()=>window.removeEventListener(n,s)),[s]),(0,E.useEffect)(()=>{r&&t(new Date(Number(r.max_datetime)).getFullYear())},[r]);let c=r?new Date(Number(r.max_datetime)).getFullYear():void 0,l=o===void 0||c!==void 0&&o===c;return(0,k.jsxs)(k.Fragment,{children:[r&&(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(h,{value:e,onChange:t,min:new Date(Number(r.min_datetime)).getFullYear(),max:new Date(Number(r.max_datetime)).getFullYear()}),(0,k.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,k.jsx)(ft,{year:o}),(0,k.jsx)(pt,{year:o}),(0,k.jsx)(mt,{year:o}),(0,k.jsx)(vt,{year:o}),(0,k.jsx)(ht,{year:o,isLatestYear:l}),(0,k.jsx)(_t,{year:o})]})]}),(0,k.jsxs)(`section`,{className:`p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg`,children:[(0,k.jsxs)(`div`,{className:`relative mb-12`,children:[(0,k.jsx)(`div`,{className:`border-t border-gray-300`}),(0,k.jsx)(`span`,{className:`absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border`,children:`🚧 Work in Progress`})]}),(0,k.jsx)(`p`,{className:`mb-4 text-gray-900 dark:text-gray-100`,children:`Experimental section: the graphs below are currently under development and may contain errors.`}),(0,k.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,k.jsx)(gt,{year:e}),(0,k.jsx)(yt,{year:o}),(0,k.jsx)(bt,{year:o})]})]})]})}export{xt as LabView};