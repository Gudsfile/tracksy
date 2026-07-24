import{t as e}from"./react.DJx7QJrC.js";import{a as t,i as n,l as r,n as i,o as a,r as o,s,t as c}from"./InsightCard.Dz3MDvet.js";import{rt as l}from"./getDB.BA3kOfQi.js";import{i as u,o as d}from"./constants.th95jnuK.js";import{i as f,n as p,r as m,s as h,t as g}from"./useDebouncedValue.Bg5kfWsN.js";import{C as _,E as v,S as y,T as b,_ as ee,a as x,b as S,c as C,d as w,f as T,g as E,h as D,i as O,l as k,m as te,n as ne,o as re,p as ie,r as ae,s as A,t as j,u as M,v as oe,w as se,x as N,y as ce}from"./src.NSZrhzKy.js";var le={ariaLabel:`dot`,fill:`none`,stroke:`currentColor`,strokeWidth:1.5};function ue(e){return e.sort===void 0&&e.reverse===void 0?oe({channel:`-r`},e):e}var de=class extends w{constructor(e,t={}){let{x:n,y:r,r:i,rotate:a,symbol:o=b,frameAnchor:s}=t,[c,l]=N(a,0),[u,d]=ce(o),[f,p]=N(i,u==null?3:4.5);super(e,{x:{value:n,scale:`x`,optional:!0},y:{value:r,scale:`y`,optional:!0},r:{value:f,scale:`r`,filter:se,optional:!0},rotate:{value:c,optional:!0},symbol:{value:u,scale:`auto`,optional:!0}},ue(t),le),this.r=p,this.rotate=l,this.symbol=d,this.frameAnchor=S(s);let{channels:m}=this,{symbol:h}=m;if(h){let{fill:e,stroke:t}=m;h.hint={fill:e?e.value===h.value?`color`:`currentColor`:this.fill??`currentColor`,stroke:t?t.value===h.value?`color`:`currentColor`:this.stroke??`none`}}}render(e,t,n,r,i){let{x:a,y:o}=t,{x:s,y:c,r:l,rotate:u,symbol:d}=n,{r:f,rotate:p,symbol:m}=this,[h,g]=te(this,r),y=m===b,x=l?void 0:f*f*Math.PI;return _(f)&&(e=[]),ee(`svg:g`,i).call(D,this,r,i).call(E,this,{x:s&&a,y:c&&o}).call(t=>t.selectAll().data(e).enter().append(y?`circle`:`path`).call(ie,this).call(y?e=>{e.attr(`cx`,s?e=>s[e]:h).attr(`cy`,c?e=>c[e]:g).attr(`r`,l?e=>l[e]:f)}:e=>{e.attr(`transform`,C`translate(${s?e=>s[e]:h},${c?e=>c[e]:g})${u?e=>` rotate(${u[e]})`:p?` rotate(${p})`:``}`).attr(`d`,l&&d?e=>{let t=v();return d[e].draw(t,l[e]*l[e]*Math.PI),t}:l?e=>{let t=v();return m.draw(t,l[e]*l[e]*Math.PI),t}:d?e=>{let t=v();return d[e].draw(t,x),t}:(()=>{let e=v();return m.draw(e,x),e})())}).call(T,this,n)).node()}};function P(e,{x:t,y:n,...r}={}){return r.frameAnchor===void 0&&([t,n]=y(t,n)),new de(e,{...r,x:t,y:n})}var fe=`with spine as (
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
`,pe={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function me(e,t){let n=f(e),r=e!==void 0,{periodTrunc:i,spineStart:a,spineEnd:o,step:s}=pe[t],c=`(select min(ts::date) from ${d} where ${n})`,l=`(select max(ts::date) from ${d} where ${n})`;return fe.replaceAll("${spineTimeTrunc}",i(`t.dt`)).replaceAll("${streamTimeTrunc}",i(`ts::date`)).replaceAll("${spineStart}",a(c,r)).replaceAll("${spineEnd}",o(l,r)).replaceAll("${step}",s).replaceAll("${table}",d).replaceAll("${year_condition}",n)}var F=e();function I(e,t,n){let r=new Date(e);return t===`year`?r.toLocaleDateString(n,{year:`numeric`}):t===`month`?r.toLocaleDateString(n,{month:`long`,year:`numeric`}):r.toLocaleDateString(n,{month:`short`,day:`numeric`,year:`numeric`})}function L(e,t,n,r,i){let a=new Date(e);if(r===`year`)return String(a.getUTCFullYear());if(r===`month`)return n===void 0?a.getUTCMonth()===0?String(a.getUTCFullYear()):``:a.toLocaleDateString(i,{month:`short`});if(r===`week`){let e=t?new Date(t):null;return e&&a.getUTCMonth()===e.getUTCMonth()?``:a.toLocaleDateString(i,{month:`short`})}return a.getUTCDate()===1?a.toLocaleDateString(i,{month:`short`}):``}var R=l(),he={year:`Year`,month:`Month`,week:`Week`,day:`Day`};function z({value:e,available:t,onChange:n}){return(0,R.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3`,children:[`year`,`month`,`week`,`day`].map(r=>{let i=t.includes(r);return(0,R.jsx)(`button`,{onClick:()=>i&&n(r),disabled:!i,className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===r?`bg-blue-500 text-white shadow-sm`:i?`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`:`text-gray-300 dark:text-gray-600 cursor-not-allowed`}`,children:he[r]},r)})})}function B({label:e,value:t}){return(0,R.jsxs)(`li`,{className:`flex justify-between items-center mt-1 first:mt-0`,role:`listitem`,children:[(0,R.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:e}),(0,R.jsx)(`span`,{className:`font-bold text-sm`,children:t})]})}function V({children:e}){return(0,R.jsx)(`ul`,{className:`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700`,role:`list`,children:e})}var ge=({data:e,year:r,granularity:a,availableGranularities:s,onGranularityChange:c,isLoading:l})=>{let[u,d]=(0,F.useState)(null),f=e?.reduce((e,t)=>e+t.ms_played,0)??0,p=e?.reduce((e,t)=>e+t.count_streams,0)??0,m=e?.length?Math.max(...e.map(e=>e.ms_played)):0,h=m||1,g=a!==`month`||r===void 0;return(0,R.jsxs)(t,{title:`Stream Timeline`,emoji:`📅`,isLoading:l,question:`How did my listening evolve over time?`,children:[(0,R.jsx)(z,{value:a,available:s,onChange:c}),!e?.length||p===0?(0,R.jsx)(n,{message:r===void 0?`No data`:`No data for this year`}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,R.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>d(null),children:e.map(e=>{let t=e.ms_played/h*100;return(0,R.jsx)(`div`,{className:`flex-1 min-w-[3px] rounded-t transition-colors duration-200 ${e.ms_played===m&&e.ms_played>0?`bg-brand-purple`:`bg-brand-blue`}`,style:{height:`${t}%`},onMouseEnter:t=>{if(e.ms_played===0)return;let n=t.currentTarget.getBoundingClientRect();d({x:n.left+n.width/2,y:n.top,ts:e.ts,ms_played:e.ms_played,count_streams:e.count_streams})}},e.ts)})}),(0,R.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let i=L(t.ts,e[n-1]?.ts,r,a);return(0,R.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${g?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:i},t.ts)})})]}),(0,R.jsxs)(V,{children:[(0,R.jsx)(B,{label:`Total duration`,value:o(f)}),(0,R.jsx)(B,{label:`Total streams`,value:p.toLocaleString()})]})]}),u&&(0,R.jsx)(i,{x:u.x,y:u.y,title:I(u.ts,a),rows:[o(u.ms_played),`${u.count_streams.toLocaleString()} streams`]})]})},_e=[`year`,`month`],ve=[`month`,`week`,`day`];function H(e){let[t,n]=(0,F.useState)(`month`),r=e===void 0?_e:ve;return{granularity:t,setGranularity:n,availableGranularities:r,effectiveGranularity:r.includes(t)?t:r[0]}}function ye({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=H(e),{data:i,isLoading:a}=h({query:me(e,r),year:e});return(0,R.jsx)(ge,{data:i,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,isLoading:a})}var be=`with spine as (
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
`,xe=`select
    count(distinct \${entity_column})::int as total_distinct,
    (count(*) - count(distinct \${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from \${table}
where \${year_condition}
`,U={tracks:`track_uri`,artists:`artist_name`,albums:`album_name`},Se={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function Ce(e,t){let n=f(e);return xe.replaceAll("${entity_column}",U[t]).replaceAll("${table}",d).replaceAll("${year_condition}",n)}function we(e,t,n){let r=f(e),i=e!==void 0,{periodTrunc:a,spineStart:o,spineEnd:s,step:c}=Se[t],l=`(select min(ts::date) from ${d} where ${r})`,u=`(select max(ts::date) from ${d} where ${r})`;return be.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${streamTimeTrunc}",a(`ts::date`)).replaceAll("${entity_column}",U[n]).replaceAll("${spineStart}",o(l,i)).replaceAll("${spineEnd}",s(u,i)).replaceAll("${step}",c).replaceAll("${table}",d).replaceAll("${year_condition}",r)}function Te({items:e}){return(0,R.jsx)(`div`,{className:`mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400`,children:e.map(({color:e,label:t})=>(0,R.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,R.jsx)(`span`,{className:`inline-block w-2 h-2 rounded-sm ${e}`}),t]},t))})}var Ee={artists:`Artists`,tracks:`Tracks`,albums:`Albums`};function W({value:e,onChange:t}){return(0,R.jsx)(`div`,{className:`flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[`artists`,`tracks`,`albums`].map(n=>(0,R.jsx)(`button`,{onClick:()=>t(n),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${e===n?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:Ee[n]},n))})}var G={tracks:`track`,artists:`artist`,albums:`album`},De=({data:e,stats:r,year:a,granularity:o,availableGranularities:s,onGranularityChange:c,entity:l,onEntityChange:u,isLoading:d})=>{let[f,p]=(0,F.useState)(null),m=r?.total_distinct??0,h=(r?.total_streams??0)>0?Math.round((r?.total_distinct??0)/(r?.total_streams??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=o!==`month`||a===void 0;return(0,R.jsxs)(t,{title:`Stream Variety`,emoji:`🔀`,isLoading:d,question:`How varied was my listening?`,headerActions:(0,R.jsx)(W,{value:l,onChange:u}),children:[(0,R.jsx)(z,{value:o,available:s,onChange:c}),!e?.length||(r?.total_streams??0)===0?(0,R.jsx)(n,{message:a===void 0?`No data`:`No data for this year`}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,R.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>(0,R.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${g>0?e.total_count/g*100:0}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,distinct_count:e.distinct_count,repeat_count:e.repeat_count,total_count:e.total_count})},children:[(0,R.jsx)(`div`,{className:`bg-yellow-400`,style:{flex:e.repeat_count}}),(0,R.jsx)(`div`,{className:`bg-orange-400`,style:{flex:e.distinct_count||+(e.total_count>0)}})]},e.ts))}),(0,R.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let r=L(t.ts,e[n-1]?.ts,a,o);return(0,R.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:r},t.ts)})})]}),(0,R.jsx)(Te,{items:[{color:`bg-orange-400`,label:`Distinct`},{color:`bg-yellow-400`,label:`Re-listens`}]}),(0,R.jsxs)(V,{children:[(0,R.jsx)(B,{label:`Unique ${G[l]}s listened`,value:m.toLocaleString()}),(0,R.jsx)(B,{label:(0,R.jsxs)(R.Fragment,{children:[`Variety rate`,(0,R.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(unique / total streams)`})]}),value:`${h}%`})]}),l!==`tracks`&&(0,R.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,R.jsx)(i,{x:f.x,y:f.y,title:I(f.ts,o),rows:[`${f.distinct_count.toLocaleString()} distinct`,`${f.repeat_count.toLocaleString()} re-listens`,`${f.total_count>0?Math.round(f.distinct_count/f.total_count*100):0}% variety`,`${f.distinct_count>0?Math.round(f.total_count/f.distinct_count):0} avg listens/${G[l]}`]})]})};function Oe({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=H(e),[i,a]=(0,F.useState)(`tracks`),{data:o,isLoading:s}=h({query:we(e,r,i),year:e}),{data:c}=h({query:Ce(e,i),year:e}),l=c?.[0];return(0,R.jsx)(De,{data:o,stats:l,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,entity:i,onEntityChange:a,isLoading:s})}var ke=`with first_listen as (
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
`,Ae=`with first_listen as (
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
`,je={year:{periodTrunc:e=>`make_date(year(${e}), 1, 1)`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 1, 1)`,step:`interval 1 year`},month:{periodTrunc:e=>`make_date(year(${e}), month(${e}), 1)`,spineStart:(e,t)=>t?`make_date(year(${e}), 1, 1)`:`make_date(year(${e}), month(${e}), 1)`,spineEnd:(e,t)=>t?`make_date(year(${e}), 12, 1)`:`make_date(year(${e}), month(${e}), 1)`,step:`interval 1 month`},week:{periodTrunc:e=>`date_trunc('week', ${e})`,spineStart:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 1, 1))`:`date_trunc('week', ${e})`,spineEnd:(e,t)=>t?`date_trunc('week', make_date(year(${e}), 12, 31))`:`date_trunc('week', ${e})`,step:`interval 7 days`},day:{periodTrunc:e=>`${e}::date`,spineStart:e=>`make_date(year(${e}), 1, 1)`,spineEnd:e=>`make_date(year(${e}), 12, 31)`,step:`interval 1 day`}};function Me(e,t){let n=f(e),r=e===void 0?`true`:`year(f.first_date) = ${e}`;return Ae.replaceAll("${entity_column}",U[t]).replaceAll("${table}",d).replaceAll("${year_condition}",n).replaceAll("${new_condition}",r)}function Ne(e,t,n){let r=f(e),i=e!==void 0,{periodTrunc:a,spineStart:o,spineEnd:s,step:c}=je[t],l=`(select min(ts::date) from ${d} where ${r})`,u=`(select max(ts::date) from ${d} where ${r})`;return ke.replaceAll("${spineTimeTrunc}",a(`t.dt`)).replaceAll("${firstDateTrunc}",a(`first_date`)).replaceAll("${streamTimeTrunc}",a(`stream_date`)).replaceAll("${entity_column}",U[n]).replaceAll("${spineStart}",o(l,i)).replaceAll("${spineEnd}",s(u,i)).replaceAll("${step}",c).replaceAll("${table}",d).replaceAll("${year_condition}",r)}var Pe=({data:e,stats:r,year:a,granularity:o,availableGranularities:s,onGranularityChange:c,entity:l,onEntityChange:u,isLoading:d})=>{let[f,p]=(0,F.useState)(null),m=r?.total_new??0,h=(r?.total_distinct??0)>0?Math.round((r?.total_new??0)/(r?.total_distinct??0)*100):0,g=e?.length?Math.max(...e.map(e=>e.total_count)):0,_=o!==`month`||a===void 0;return(0,R.jsxs)(t,{title:`Stream Discovery`,emoji:`🔭`,isLoading:d,question:`How many new artists, tracks, or albums did I discover?`,headerActions:(0,R.jsx)(W,{value:l,onChange:u}),children:[(0,R.jsx)(z,{value:o,available:s,onChange:c}),!e?.length||(r?.total_distinct??0)===0?(0,R.jsx)(n,{message:a===void 0?`No data`:`No data for this year`}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)(`div`,{className:`overflow-x-auto mt-4`,children:[(0,R.jsx)(`div`,{className:`flex items-end gap-0.5 h-24 mb-1`,style:{minWidth:`${e.length*4}px`},onMouseLeave:()=>p(null),children:e.map(e=>(0,R.jsxs)(`div`,{className:`flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden`,style:{height:`${g>0?e.total_count/g*100:0}%`},onMouseEnter:t=>{if(e.total_count===0)return;let n=t.currentTarget.getBoundingClientRect();p({x:n.left+n.width/2,y:n.top,ts:e.ts,new_count:e.new_count,known_count:e.known_count,total_count:e.total_count})},children:[(0,R.jsx)(`div`,{className:`bg-rose-500`,style:{flex:e.known_count}}),(0,R.jsx)(`div`,{className:`bg-rose-800`,style:{flex:e.new_count}})]},e.ts))}),(0,R.jsx)(`div`,{className:`flex gap-0.5 mb-4`,style:{minWidth:`${e.length*4}px`},children:e.map((t,n)=>{let r=L(t.ts,e[n-1]?.ts,a,o);return(0,R.jsx)(`div`,{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${_?`overflow-visible whitespace-nowrap`:`text-center truncate`}`,children:r},t.ts)})})]}),(0,R.jsx)(Te,{items:[{color:`bg-rose-800`,label:`New`},{color:`bg-rose-500`,label:`Known`}]}),(0,R.jsxs)(V,{children:[(0,R.jsx)(B,{label:`New ${G[l]}s discovered`,value:m.toLocaleString()}),(0,R.jsx)(B,{label:(0,R.jsxs)(R.Fragment,{children:[`Discovery rate`,(0,R.jsx)(`span`,{className:`ml-1 text-xs font-normal text-gray-400 dark:text-gray-500`,children:`(new / total distinct)`})]}),value:`${h}%`})]}),l!==`tracks`&&(0,R.jsx)(`p`,{className:`mt-2 text-xs italic text-gray-400 dark:text-gray-500`,children:`Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one.`})]}),f&&(0,R.jsx)(i,{x:f.x,y:f.y,title:I(f.ts,o),rows:[`${f.new_count.toLocaleString()} new`,`${f.known_count.toLocaleString()} known`,`${f.total_count>0?Math.round(f.new_count/f.total_count*100):0}% discovery`]})]})};function Fe({year:e}){let{setGranularity:t,availableGranularities:n,effectiveGranularity:r}=H(e),[i,a]=(0,F.useState)(`tracks`),{data:o,isLoading:s}=h({query:Ne(e,r,i),year:e}),{data:c}=h({query:Me(e,i),year:e}),l=c?.[0];return(0,R.jsx)(Pe,{data:o,stats:l,year:e,granularity:r,availableGranularities:n,onGranularityChange:t,entity:i,onEntityChange:a,isLoading:s})}var Ie=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function Le(e){return Ie.replaceAll("${table}",d).replaceAll("${year_condition}",f(e))}var Re=3,ze=24,Be=Array.from({length:7},(e,t)=>t%2==0?``:new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`}));function K(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r)}function q(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function Ve(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}var J=e=>e.streak>0,Y=e=>e.streak===0&&e.prevStreak>0&&e.inRange,He=e=>J(e)||Y(e);function Ue(e,t){return J(e)?`rgba(34,197,94,${Math.max(.2,e.streak/t)})`:Y(e)?`rgba(239,68,68,0.45)`:e.inRange?null:`transparent`}function X(e){return new Date(e+`T00:00:00`).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`})}function We({data:e,year:r,isLatestYear:a,isLoading:o}){let s=(0,F.useRef)(null),[c,l]=(0,F.useState)(null),{cells:u,maxStreak:d,bestStreakEnd:f,bestStreakStart:p,currentStreak:m}=(0,F.useMemo)(()=>{if(!e||e.length===0)return{cells:[],maxStreak:0,bestStreakEnd:``,bestStreakStart:``,currentStreak:0};let t=new Set(e.map(e=>e.stream_date)),n=[...t].sort(),i=n[0],a=n[n.length-1],o=r===void 0?i:`${r}-01-01`,s=r===void 0?a:`${r}-12-31`,c=[],l=K(o),u=K(s),d=0,f=0,p=``,m=0;for(;l<=u;){let e=q(l),n=d;d=t.has(e)?n+1:0;let o=r===void 0||e>=i&&e<=a;c.push({day:e,streak:d,prevStreak:n,inRange:o}),d>f&&(f=d,p=e),t.has(e)&&(m=d),l.setDate(l.getDate()+1)}let h=``;return p&&f>0&&(h=q(Ve(K(p),-(f-1)))),{cells:c,maxStreak:f,bestStreakEnd:p,bestStreakStart:h,currentStreak:m}},[e,r]),{weeks:h,monthLabels:g,weekCount:_}=(0,F.useMemo)(()=>{if(u.length===0)return{weeks:[],monthLabels:[],weekCount:0};let e=new Map(u.map(e=>[e.day,e])),t=K(u[0].day),n=K(u[u.length-1].day),r=new Date(t);r.setDate(r.getDate()-r.getDay());let i=new Date(n);i.setDate(i.getDate()+(6-i.getDay()));let a=(Math.round((i.getTime()-r.getTime())/864e5)+1)/7,o=[];for(let t=0;t<a;t++){let n=[];for(let i=0;i<7;i++){let a=q(Ve(r,t*7+i));n.push(e.get(a)??null)}o.push(n)}let s=[],c=-1,l=-1;for(let e=0;e<o.length;e++){let t=o[e].find(e=>e!==null);if(!t)continue;let n=K(t.day),r=n.getMonth(),i=n.getFullYear();if(r!==c){let t=i!==l,a=n.toLocaleDateString(void 0,{month:`short`});s.push({weekIdx:e,label:t?`${a} '${String(i).slice(2)}`:a}),c=r,l=i}}return{weeks:o,monthLabels:s,weekCount:a}},[u]);(0,F.useEffect)(()=>{let e=s.current;e&&(r===void 0?e.scrollLeft=e.scrollWidth:e.scrollLeft=0)},[r,u]);let v=!e||e.length===0,y=ze+_*13,b=`${ze}px repeat(${_}, 1fr)`;return(0,R.jsxs)(t,{title:`Listening Streaks`,emoji:`🔥`,question:`How consistent is your listening?`,isLoading:o,children:[v?(0,R.jsx)(n,{}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`div`,{ref:s,className:`overflow-x-auto pb-4`,onMouseLeave:()=>l(null),children:(0,R.jsxs)(`div`,{style:{minWidth:`${y}px`},children:[(0,R.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,marginBottom:2},children:[(0,R.jsx)(`div`,{}),Array.from({length:_},(e,t)=>(0,R.jsx)(`div`,{className:`text-[9px] text-gray-400 dark:text-gray-600`,children:g.find(e=>e.weekIdx===t)?.label??``},t))]}),(0,R.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:b,gridTemplateRows:`repeat(7, auto)`,gap:`${Re}px`},children:[Be.map((e,t)=>(0,R.jsx)(`div`,{style:{gridColumn:1,gridRow:t+1},className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:e},`label-${t}`)),h.flatMap((e,t)=>e.map((e,n)=>{let r=e?J(e)?`streak-cell-active`:Y(e)?`streak-cell-break`:void 0:void 0,i=e?Ue(e,d):`transparent`;return(0,R.jsx)(`div`,{"data-testid":r,style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`,backgroundColor:i??void 0},className:`rounded-xs ${i===null?`bg-gray-100 dark:bg-slate-700/50`:``}`,onMouseEnter:e&&He(e)?t=>{let n=t.currentTarget.getBoundingClientRect();l({cell:e,x:n.left+n.width/2,y:n.top})}:void 0},`${t}-${n}`)}))]})]})}),(0,R.jsxs)(V,{children:[(0,R.jsx)(B,{label:`Best streak`,value:(0,R.jsxs)(R.Fragment,{children:[d,` day`,d===1?``:`s`,p&&f&&(0,R.jsxs)(`span`,{className:`font-normal text-gray-500 dark:text-gray-400`,children:[` `,`·`,` `,X(p),` `,`–`,` `,X(f)]})]})}),a&&(0,R.jsx)(B,{label:`Current streak`,value:`${m} day${m===1?``:`s`}`})]})]}),c&&(0,R.jsx)(i,{x:c.x,y:c.y,title:X(c.cell.day),rows:[c.cell.streak>0?`Day ${c.cell.streak} of streak`:`Streak broken`]})]})}function Ge({year:e,isLatestYear:t}){let{data:n,isLoading:r}=h({query:Le(e),year:e});return(0,R.jsx)(We,{data:n,year:e,isLatestYear:t,isLoading:r})}var Ke=`with artist_yearly_play_counts as (
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
`;function qe(){return Ke.replaceAll("${table}",d)}function Je({data:e}){let t=(0,F.useRef)(null);return(0,F.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.artist===t.artist?e.stream_year-t.stream_year:e.artist.localeCompare(t.artist)),r=[...Array.from(new Set(n.map(e=>e.artist))).map(e=>{let t=n.filter(t=>t.artist===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=O({title:`Global Top 10 Artists Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[j(n,{x:`stream_year`,y:`stream_rank`,stroke:`artist`,strokeWidth:2.5}),P(n,{x:`stream_year`,y:`stream_rank`,fill:`artist`,r:4}),A(i,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),A(a,{x:`stream_year`,y:`stream_rank`,text:`artist`,fill:`artist`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),x(n,M({x:`stream_year`,y:`stream_rank`,title:e=>`${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,R.jsx)(`div`,{ref:t})}function Ye(){let[e,t]=(0,F.useState)([]);return(0,F.useEffect)(()=>{(async()=>{let e=await a(qe());t(e)})()},[]),e.length===0?null:(0,R.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,R.jsx)(Je,{data:e})})}var Xe=`with
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
`;function Ze(){return Xe.replaceAll("${table}",d)}function Qe({data:e}){let t=(0,F.useRef)(null);return(0,F.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.album===t.album?e.stream_year-t.stream_year:e.album.localeCompare(t.album)),r=[...Array.from(new Set(n.map(e=>e.album))).map(e=>{let t=n.filter(t=>t.album===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=O({title:`Global Top 10 Albums Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[j(n,{x:`stream_year`,y:`stream_rank`,stroke:`album`,strokeWidth:2.5}),P(n,{x:`stream_year`,y:`stream_rank`,fill:`album`,r:4}),A(i,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),A(a,{x:`stream_year`,y:`stream_rank`,text:`album`,fill:`album`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),x(n,M({x:`stream_year`,y:`stream_rank`,title:e=>`${e.album} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,R.jsx)(`div`,{ref:t})}function $e(){let[e,t]=(0,F.useState)([]);return(0,F.useEffect)(()=>{(async()=>{let e=await a(Ze());t(e)})()},[]),e.length===0?null:(0,R.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,R.jsx)(Qe,{data:e})})}var et=`with track_yearly_play_counts as (
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
`;function tt(){return et.replaceAll("${table}",d)}function nt({data:e}){let t=(0,F.useRef)(null);return(0,F.useEffect)(()=>{if(!e||e.length===0||!t.current)return;let n=[...e].sort((e,t)=>e.track===t.track?e.stream_year-t.stream_year:e.track.localeCompare(t.track)),r=[...Array.from(new Set(n.map(e=>e.track))).map(e=>{let t=n.filter(t=>t.track===e);return t[t.length-1]})].sort((e,t)=>e.stream_rank-t.stream_rank),i=r.filter((e,t)=>t%2==0),a=r.filter((e,t)=>t%2==1),o=O({title:`Global Top 10 Track Evolution`,width:1200,height:700,marginLeft:60,marginRight:200,style:{background:`transparent`,fontSize:`12px`},y:{label:`Rank`,type:`log`,reverse:!0,grid:!0},x:{label:`Year`,tickFormat:`d`},color:{legend:!1},marks:[j(n,{x:`stream_year`,y:`stream_rank`,stroke:`track`,strokeWidth:2.5}),P(n,{x:`stream_year`,y:`stream_rank`,fill:`track`,r:4}),A(i,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:-8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),A(a,{x:`stream_year`,y:`stream_rank`,text:`track`,fill:`track`,dx:10,dy:8,textAnchor:`start`,fontSize:11,fontWeight:`bold`}),x(n,M({x:`stream_year`,y:`stream_rank`,title:e=>`${e.track} - ${e.artist}\nRank: ${e.stream_rank}\nYear: ${e.stream_year}\nCount: ${e.play_count}`}))]});return t.current.replaceChildren(o),()=>o.remove()},[e]),(0,R.jsx)(`div`,{ref:t})}function rt(){let[e,t]=(0,F.useState)([]);return(0,F.useEffect)(()=>{(async()=>{let e=await a(tt());t(e)})()},[]),e.length===0?null:(0,R.jsx)(`div`,{className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:(0,R.jsx)(nt,{data:e})})}var it=`with daily as (
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
`;function at(e){let t=f(e);return it.replaceAll("${table}",d).replaceAll("${year_condition}",t)}function Z({frameCount:e,startTs:t,endTs:n,currentFrameIdx:r,speedMultiplier:i,isPlaying:a,onFrameChange:o,onSpeedChange:s,onPlayPause:c}){let l=r>=e-1;return(0,R.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30`,children:[(0,R.jsxs)(`div`,{className:`flex items-center gap-2 flex-1 min-w-0 px-1`,children:[(0,R.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(t).toLocaleDateString(void 0,{year:`numeric`,month:`short`})}),(0,R.jsx)(`input`,{type:`range`,"aria-label":`Animation timeline`,min:0,max:e-1,value:r,onChange:e=>o(Number(e.target.value)),className:`flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-w-0`}),(0,R.jsx)(`span`,{className:`text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0`,children:new Date(n).toLocaleDateString(void 0,{year:`numeric`,month:`short`})})]}),(0,R.jsxs)(`div`,{className:`flex items-center shrink-0 self-center sm:self-auto`,children:[[.5,1,2,4].map(e=>(0,R.jsxs)(`button`,{type:`button`,onClick:()=>s(e),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${i===e?`bg-blue-500 text-white shadow-sm`:`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}`,children:[e,`x`]},e)),(0,R.jsx)(`div`,{className:`w-px h-4 bg-gray-300/50 dark:bg-slate-600/50 mx-1`}),(0,R.jsx)(`button`,{type:`button`,onClick:c,"aria-label":a?`Pause`:l?`Replay`:`Play`,title:a?`Pause`:l?`Replay`:`Play`,className:`p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-all`,children:a?(0,R.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,R.jsx)(`rect`,{x:`3`,y:`2`,width:`4`,height:`12`,rx:`1`}),(0,R.jsx)(`rect`,{x:`9`,y:`2`,width:`4`,height:`12`,rx:`1`})]}):l?(0,R.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:[(0,R.jsx)(`path`,{d:`M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z`}),(0,R.jsx)(`path`,{d:`M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z`})]}):(0,R.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`currentColor`,children:(0,R.jsx)(`path`,{d:`M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z`})})})]})]})}function Q({frameCount:e,baseSpeed:t,entityType:n}){let[r,i]=(0,F.useState)(0),[a,o]=(0,F.useState)(!1),[s,c]=(0,F.useState)(1),[l,u]=(0,F.useState)(!1),d=(0,F.useRef)(null);(0,F.useEffect)(()=>{let e=new IntersectionObserver(([e])=>{u(e.isIntersecting)},{threshold:.1}),t=d.current;return t&&e.observe(t),()=>{t&&e.unobserve(t)}},[]);let f=(0,F.useRef)(!1);return(0,F.useEffect)(()=>{if(!f.current){f.current=!0;return}i(0),o(!0)},[n]),(0,F.useEffect)(()=>{if(!a||!l||e===0)return;let n=setInterval(()=>{i(t=>t>=e-1?(o(!1),t):t+1)},t/s);return()=>clearInterval(n)},[a,l,e,t,s]),{containerRef:d,currentFrameIdx:r,isPlaying:a,speedMultiplier:s,onFrameChange:e=>{o(!1),i(e)},onSpeedChange:c,onPlayPause:()=>{r>=e-1?(i(0),o(!0)):o(e=>!e)}}}var ot=3,st=24,ct=40,lt=120,ut=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`long`,timeZone:`UTC`})),dt=Array.from({length:7},(e,t)=>new Date(Date.UTC(2025,0,5+t)).toLocaleDateString(void 0,{weekday:`short`,timeZone:`UTC`})),ft=Array.from({length:24},(e,t)=>t%6==0?String(t):``);function pt({data:e,year:n,isLoading:r}){let{frames:a,maxCount:o,topDay:s,topHour:c,firstPlayedByCell:l,firstCompleteHourFrame:u,firstCompleteHourLabel:d,firstCompleteDayFrame:f,firstCompleteDayLabel:p,bingoFrame:m,uncoveredCells:h}=(0,F.useMemo)(()=>{if(!e||e.length===0)return{frames:[],maxCount:1,topDay:-1,topHour:-1,firstPlayedByCell:new Map,firstCompleteHourFrame:null,firstCompleteHourLabel:``,firstCompleteDayFrame:null,firstCompleteDayLabel:``,bingoFrame:null,uncoveredCells:168};let t=[...new Set(e.map(e=>e.stream_date_ts))].sort((e,t)=>e-t),n=new Map;for(let t of e)n.has(t.stream_date_ts)||n.set(t.stream_date_ts,[]),n.get(t.stream_date_ts).push(t);let r=new Map,i=[],a=new Map,o=new Map,s=new Map,c=0,l=null,u=``,d=null,f=``,p=null;for(let e=0;e<t.length;e++){let m=t[e],h=n.get(m)??[];for(let e of h){let t=`${e.day_of_week},${e.play_hour}`;if(!r.has(t)){a.set(t,m),c++;let n=e.day_of_week,r=e.play_hour;o.has(r)||o.set(r,new Set),o.get(r).add(n),s.has(n)||s.set(n,new Set),s.get(n).add(r)}r.set(t,e.cumulative_count)}if(i.push({dateTs:m,cells:new Map(r)}),l===null){for(let[t,n]of o)if(n.size===7){l=e,u=`${t}h · ${new Date(m).toLocaleDateString()}`;break}}if(d===null){for(let[t,n]of s)if(n.size===24){d=e,f=`${ut[t]} · ${new Date(m).toLocaleDateString()}`;break}}p===null&&c===168&&(p=e)}let m=168-c,h=i[i.length-1].cells,g=Math.max(1,...h.values()),_=Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=h.get(`${t},${e}`)??0;return n}),v=Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=h.get(`${e},${t}`)??0;return n});return{frames:i,maxCount:g,topDay:_.indexOf(Math.max(..._)),topHour:v.indexOf(Math.max(...v)),firstPlayedByCell:a,firstCompleteHourFrame:l,firstCompleteHourLabel:u,firstCompleteDayFrame:d,firstCompleteDayLabel:f,bingoFrame:p,uncoveredCells:m}},[e]),{containerRef:g,currentFrameIdx:_,isPlaying:v,speedMultiplier:y,onFrameChange:b,onSpeedChange:ee,onPlayPause:x}=Q({frameCount:a.length,baseSpeed:lt,entityType:String(n)}),S=(0,F.useMemo)(()=>a[_]?.cells??new Map,[a,_]),{dayTotals:C,hourTotals:w}=(0,F.useMemo)(()=>({dayTotals:Array.from({length:7},(e,t)=>{let n=0;for(let e=0;e<24;e++)n+=S.get(`${t},${e}`)??0;return n}),hourTotals:Array.from({length:24},(e,t)=>{let n=0;for(let e=0;e<7;e++)n+=S.get(`${e},${t}`)??0;return n})}),[S]),[T,E]=(0,F.useState)(null),D=null;return m!==null&&_>=m?D=(0,R.jsx)(`span`,{className:`font-bold text-sm`,children:new Date(a[m].dateTs).toLocaleDateString()}):m===null&&a.length>0&&_>=a.length-1&&(D=(0,R.jsxs)(`span`,{className:`text-sm text-gray-500`,children:[h,` cells uncovered`]})),(0,R.jsx)(`div`,{ref:g,children:(0,R.jsxs)(t,{title:`Listening Bingo`,emoji:`🎰`,question:`Have you listened at every hour of every day?`,isLoading:r,children:[(0,R.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,R.jsx)(`div`,{className:`md:hidden`,"data-testid":`bingo-grid-mobile`,children:(0,R.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`${st}px repeat(7, 1fr) ${ct}px`,gap:`${ot}px`},onMouseLeave:()=>E(null),children:[(0,R.jsx)(`div`,{}),dt.map((e,t)=>(0,R.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,R.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),Array.from({length:24},(e,t)=>(0,R.jsxs)(F.Fragment,{children:[(0,R.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:ft[t]}),Array.from({length:7},(e,n)=>{let r=S.get(`${n},${t}`)??0,i=r>0;return(0,R.jsx)(`div`,{style:{height:12,...i&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/o)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${i?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let a=e.currentTarget.getBoundingClientRect();E({x:a.left+a.width/2,y:a.top,day:n,hour:t,count:r,firstPlayedTs:i?l.get(`${n},${t}`)??null:null})}},`${n}-${r}`)}),(0,R.jsx)(`div`,{className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===c?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:w[t]>0?w[t]:``})]},t)),(0,R.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),C.map((e,t)=>(0,R.jsx)(`div`,{className:`text-[8px] text-center font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,R.jsx)(`div`,{})]})}),(0,R.jsx)(`div`,{className:`hidden md:block overflow-x-auto`,children:(0,R.jsxs)(`div`,{"data-testid":`bingo-grid-desktop`,style:{display:`grid`,gridTemplateColumns:`${st}px repeat(24, 1fr) ${ct}px`,gap:`${ot}px`,minWidth:`376px`},onMouseLeave:()=>E(null),children:[(0,R.jsx)(`div`,{}),ft.map((e,t)=>(0,R.jsx)(`div`,{className:`text-[8px] text-center text-gray-400 dark:text-gray-600`,children:e},t)),(0,R.jsx)(`div`,{className:`text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700`,children:`TOTAL`}),dt.map((e,t)=>(0,R.jsxs)(F.Fragment,{children:[(0,R.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:t===1||t===3||t===5?e:``}),Array.from({length:24},(e,n)=>{let r=S.get(`${t},${n}`)??0,i=r>0;return(0,R.jsx)(`div`,{style:{aspectRatio:`1`,...i&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,r/o)})`,animation:`cellPop 0.2s ease-out`}},className:`rounded-xs ${i?``:`bg-slate-200/50 dark:bg-slate-700/30`}`,onMouseEnter:e=>{let a=e.currentTarget.getBoundingClientRect();E({x:a.left+a.width/2,y:a.top,day:t,hour:n,count:r,firstPlayedTs:i?l.get(`${t},${n}`)??null:null})}},`${n}-${r}`)}),(0,R.jsx)(`div`,{"data-testid":`day-total-${t}`,className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${t===s?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:C[t]>0?C[t]:``})]},t)),(0,R.jsx)(`div`,{className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:`TOT`}),w.map((e,t)=>(0,R.jsx)(`div`,{"data-testid":`hour-total-${t}`,className:`text-[8px] text-center font-medium ${t===c?`text-teal-500`:`text-gray-500 dark:text-gray-400`}`,children:e>0?e:``},t)),(0,R.jsx)(`div`,{})]})}),a.length>1&&(0,R.jsx)(Z,{frameCount:a.length,startTs:a[0].dateTs,endTs:a[a.length-1].dateTs,currentFrameIdx:_,speedMultiplier:y,isPlaying:v,onFrameChange:b,onSpeedChange:ee,onPlayPause:x}),(0,R.jsxs)(V,{children:[(0,R.jsx)(B,{label:`First complete hour`,value:u!==null&&_>=u?d:null}),(0,R.jsx)(B,{label:`First complete day`,value:f!==null&&_>=f?p:null}),(0,R.jsx)(B,{label:`Bingo`,value:D})]})]}),T&&(0,R.jsx)(i,{x:T.x,y:T.y,title:`${ut[T.day]} ${T.hour}h`,rows:[`${T.count.toLocaleString()} streams`,T.firstPlayedTs===null?null:`first played ${new Date(T.firstPlayedTs).toLocaleDateString()}`]})]})})}function mt({year:e}){let{data:t,isLoading:n}=h({query:at(e),year:e});return(0,R.jsx)(pt,{data:t,year:e,isLoading:n})}var ht={artists:`with daily_streams as (
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
`};function gt(e,t=`artists`){let n=ht[t].replaceAll("${table}",d);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function _t(e,t){let n=(0,F.useRef)(e),[r,i]=(0,F.useState)(t);return(0,F.useEffect)(()=>{e!==n.current&&(n.current=e,i(t))},[e,t]),r}var $=[`bg-blue-500`,`bg-red-500`,`bg-green-500`,`bg-yellow-500`,`bg-purple-500`,`bg-pink-500`,`bg-indigo-500`,`bg-teal-500`,`bg-orange-500`,`bg-cyan-500`],vt=120,yt=44,bt=60;function xt({data:e,entityType:t}){let{frames:n,entityColors:r}=(0,F.useMemo)(()=>{let t=Array.from(new Set(e.map(e=>e.stream_date_ts))).sort((e,t)=>e-t),n=new Map,r=[],i=new Map,a=0,o=new Map;for(let t of e)o.has(t.stream_date_ts)||o.set(t.stream_date_ts,[]),o.get(t.stream_date_ts).push(t);for(let e of t){let t=o.get(e)||[];for(let e of t)n.set(e.entity_name,e.play_count),i.has(e.entity_name)||(i.set(e.entity_name,$[a%$.length]),a++);let s=Array.from(n.entries()).sort((e,t)=>t[1]-e[1]).slice(0,10);r.push({dateTs:e,top10:s.map(([e,t])=>({label:e,play_count:t})),maxScore:Math.max(1,s[0]?.[1]||1)})}return{frames:r,entityColors:i}},[e]),{containerRef:i,currentFrameIdx:a,isPlaying:o,speedMultiplier:s,onFrameChange:c,onSpeedChange:l,onPlayPause:u}=Q({frameCount:n.length,baseSpeed:vt,entityType:t}),d=n[a];return d?(0,R.jsxs)(`div`,{ref:i,className:`flex flex-col gap-4 w-full`,children:[(0,R.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[new Date(d.dateTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,R.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· daily`})]}),(0,R.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:bt},children:(0,R.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`streams`})}),(0,R.jsx)(`div`,{className:`relative w-full`,style:{height:d.top10.length*yt},children:d.top10.map((e,t)=>{let n=e.play_count/d.maxScore*100;return(0,R.jsxs)(`div`,{className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${t*yt}px`,zIndex:10-t},children:[(0,R.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,R.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,R.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,R.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,R.jsx)(`div`,{className:`ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:bt},children:e.play_count.toLocaleString()})]},e.label)})}),n.length>1&&(0,R.jsx)(Z,{frameCount:n.length,startTs:n[0].dateTs,endTs:n[n.length-1].dateTs,currentFrameIdx:a,speedMultiplier:s,isPlaying:o,onFrameChange:c,onSpeedChange:l,onPlayPause:u})]}):null}function St({year:e}){let[r,i]=(0,F.useState)(`artists`),{data:a,isLoading:o}=h({query:gt(e,r),year:e}),s=a??[],c=_t(a,r);return(0,R.jsx)(t,{title:`Top 10 Race`,emoji:`🏎️`,className:`md:col-span-2 lg:col-span-3`,isLoading:o&&s.length===0,question:`Who dominated my listening, and when did they rise?`,headerActions:(0,R.jsx)(W,{value:r,onChange:i}),children:s.length===0?(0,R.jsx)(n,{}):(0,R.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,R.jsx)(xt,{data:s,entityType:c})})})}var Ct={artists:`select
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
`};function wt(e,t=`artists`){let n=Ct[t].replaceAll("${table}",d);return n=e?n.replace("${yearFilter}",`AND year(ts::datetime) = ${e}`):n.replace("${yearFilter}",``),n}function Tt({ranking:e,activeLabels:t}){return(0,R.jsxs)(`div`,{className:`flex flex-col`,children:[(0,R.jsx)(`span`,{className:`text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3`,children:`Longevity Leaderboard`}),(0,R.jsx)(`div`,{className:`flex flex-col gap-0.5`,children:e.map((e,n)=>(0,R.jsxs)(`div`,{className:`flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors`,children:[(0,R.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono`,children:n+1}),(0,R.jsx)(`span`,{className:`text-sm truncate flex-1 min-w-0 ${t.has(e.label)?`font-bold text-gray-900 dark:text-white`:`font-normal text-gray-500 dark:text-gray-400`}`,children:e.label}),(0,R.jsxs)(`span`,{className:`text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0`,children:[e.periodsInTop10,`w`]}),(0,R.jsx)(`span`,{className:`text-xs font-mono shrink-0 w-8 text-right`,children:e.rankDelta===null?(0,R.jsx)(`span`,{className:`text-blue-400`,children:`new`}):e.rankDelta>0?(0,R.jsxs)(`span`,{className:`text-emerald-400`,children:[`↑`,e.rankDelta]}):e.rankDelta<0?(0,R.jsxs)(`span`,{className:`text-red-400`,children:[`↓`,Math.abs(e.rankDelta)]}):(0,R.jsx)(`span`,{className:`text-gray-400 opacity-40`,children:`—`})})]},e.label))})]})}var Et=240,Dt=44,Ot=62;function kt({data:e,entityType:t}){let{frames:n,entityColors:r,streakRecord:i}=(0,F.useMemo)(()=>{let t=[...new Set(e.map(e=>e.period_ts))].sort((e,t)=>e-t),n=Math.exp(-.2),r=new Map;for(let t of e)r.has(t.period_ts)||r.set(t.period_ts,[]),r.get(t.period_ts).push({label:t.entity_name,plays:t.period_plays});let i=new Map,a=new Map,o=new Map,s=new Map,c=new Map,l=0,u=[];for(let e of t){for(let[e,t]of i)i.set(e,t*n);for(let{label:t,plays:n}of r.get(e)??[])i.set(t,(i.get(t)??0)+n),c.has(t)||(c.set(t,$[l%$.length]),l++);let t=[...i.entries()].filter(([,e])=>e>.01).sort((e,t)=>t[1]-e[1]).slice(0,10),d=new Set(t.map(([e])=>e));for(let[e]of t){a.set(e,(a.get(e)??0)+1),o.set(e,(o.get(e)??0)+1);let t=o.get(e);t>(s.get(e)??0)&&s.set(e,t)}for(let[e]of i)!d.has(e)&&(o.get(e)??0)>0&&o.set(e,0);let f=t[0]?.[1]??1,p=u.length>0?u[u.length-1].ghostRanking:[],m=new Map(p.map((e,t)=>[e.label,t])),h=[...a.entries()].sort((e,t)=>t[1]-e[1]).slice(0,10).map(([e,t],n)=>({label:e,periodsInTop10:t,rankDelta:p.length===0?null:m.has(e)?m.get(e)-n:null}));u.push({periodTs:e,top10:t.map(([e,t])=>({label:e,score:t,periodsInTop10:a.get(e)??0})),maxScore:f,ghostRanking:h})}let d={label:``,weeks:0};for(let[e,t]of s)t>d.weeks&&(d={label:e,weeks:t});return{frames:u,entityColors:c,streakRecord:d}},[e]),{containerRef:a,currentFrameIdx:o,isPlaying:s,speedMultiplier:l,onFrameChange:u,onSpeedChange:d,onPlayPause:f}=Q({frameCount:n.length,baseSpeed:Et,entityType:t}),p=n[o],m=(0,F.useMemo)(()=>new Set(p?.top10.map(e=>e.label)??[]),[p]);return p?(0,R.jsxs)(`div`,{ref:a,className:`flex flex-col gap-4 w-full`,children:[(0,R.jsxs)(`h4`,{className:`text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100`,children:[`Week of `+new Date(p.periodTs).toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),(0,R.jsx)(`span`,{className:`text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans`,children:`· weekly`})]}),(0,R.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-3 gap-6`,children:[(0,R.jsxs)(`div`,{className:`md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4`,children:[(0,R.jsx)(Tt,{ranking:p.ghostRanking,activeLabels:m}),i.weeks>0&&(0,R.jsxs)(c,{children:[(0,R.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 mb-0.5`,children:`🔥 Longest streak`}),o>=n.length-1?(0,R.jsxs)(`div`,{children:[(0,R.jsx)(`span`,{className:`font-bold`,children:i.label}),(0,R.jsxs)(`span`,{className:`text-xs font-normal text-gray-500 dark:text-gray-400 ml-1`,children:[i.weeks,` consecutive weeks`]})]}):(0,R.jsx)(`div`,{className:`text-xs text-gray-400 dark:text-gray-500 italic`,children:`Watch till the end to find out…`})]})]}),(0,R.jsxs)(`div`,{className:`md:col-span-2 flex flex-col`,children:[(0,R.jsx)(`div`,{className:`flex justify-end`,style:{paddingRight:Ot},children:(0,R.jsx)(`span`,{className:`text-xs text-gray-400 dark:text-gray-500 font-mono`,children:`score`})}),(0,R.jsx)(`div`,{className:`relative w-full mt-4`,style:{height:p.top10.length*Dt},children:p.top10.map((e,t)=>{let n=e.score/p.maxScore*100,i=t*Dt;return(0,R.jsxs)(`div`,{title:`${e.periodsInTop10} weeks in top 10`,className:`absolute left-0 flex items-center w-full transition-all duration-300 ease-linear`,style:{top:`${i}px`,zIndex:10-t},children:[(0,R.jsxs)(`div`,{className:`w-full relative h-9`,children:[(0,R.jsx)(`div`,{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(e.label)}`,style:{width:`${n}%`,opacity:.8}}),(0,R.jsxs)(`div`,{className:`absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis`,style:{width:`calc(100% - 16px)`},children:[(0,R.jsxs)(`span`,{className:`font-bold w-6 text-right mr-2 opacity-70`,children:[`#`,t+1]}),e.label]})]}),(0,R.jsx)(`div`,{className:`ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear`,style:{minWidth:Ot},children:Math.round(e.score).toLocaleString()})]},e.label)})}),(0,R.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2`,children:`Score = Σ streams × e^(−0.2×Δweeks)`})]})]}),n.length>1&&(0,R.jsx)(Z,{frameCount:n.length,startTs:n[0].periodTs,endTs:n[n.length-1].periodTs,currentFrameIdx:o,speedMultiplier:l,isPlaying:s,onFrameChange:u,onSpeedChange:d,onPlayPause:f})]}):null}function At({year:e}){let[r,i]=(0,F.useState)(`artists`),{data:a,isLoading:o}=h({query:wt(e,r),year:e}),s=a??[],c=_t(a,r);return(0,R.jsx)(t,{title:`Top 10 Billboard`,emoji:`🏆`,className:`md:col-span-2 lg:col-span-3`,isLoading:o&&s.length===0,question:`Who stayed in the charts the longest week after week?`,headerActions:(0,R.jsx)(W,{value:r,onChange:i}),children:s.length===0?(0,R.jsx)(n,{}):(0,R.jsx)(`div`,{className:`transition-opacity duration-150`,style:{opacity:o?.4:1},children:(0,R.jsx)(kt,{data:s,entityType:c})})})}function jt(e){return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${u}
        WHERE ${f(e,`year(session_start::date)`)}
        ORDER BY session_start
    `}var Mt=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];function Nt(e,t=!1){let n=`#7c3aed`,r={background:`transparent`,color:t?`#e5e7eb`:`#1f2937`},i=O({title:`Session duration distribution`,width:600,height:220,style:r,x:{label:`Duration (min)`,nice:!0},y:{label:`Sessions`,grid:!0},color:{range:[`#ede9fe`,n]},marks:[re(e,{...ae({y:`count`,fill:`count`},{x:e=>e.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),k([0])]}),a=O({title:`Sessions over time`,width:600,height:260,style:r,x:{label:`Date`,type:`time`,nice:!0},y:{label:`Start hour`,domain:[0,23],tickFormat:e=>`${e}h`},r:{range:[2,20]},marks:[P(e,{x:e=>new Date(e.session_start),y:e=>e.start_hour,r:e=>e.duration_ms/6e4,fill:n,fillOpacity:.6,tip:!0})]}),o=e.reduce((e,t)=>(e[t.day_of_week]++,e),[0,0,0,0,0,0,0]),s=Mt.map((e,t)=>({day:e,count:o[t]})),c=O({title:`Sessions by day of week`,width:400,height:200,style:r,x:{label:`Day`,domain:Mt},y:{label:`Sessions`,grid:!0},marks:[ne(s,{x:`day`,y:`count`,fill:n,tip:!0}),k([0])]}),l=document.createElement(`div`);return l.className=`space-y-4 p-4`,l.append(i,a,c),l}function Pt({query:e,buildPlot:t}){let[n,i]=(0,F.useState)(),{effectiveTheme:o}=(0,F.useContext)(r),s=(0,F.useRef)(null);return(0,F.useEffect)(()=>{(async()=>{let t=await a(e);i(t)})()},[e]),(0,F.useEffect)(()=>{if(!n)return;let e=t(n,o===`dark`);return s.current&&s.current.replaceChildren(e),()=>{e.remove()}},[n,t,o]),(0,R.jsx)(`div`,{ref:s,className:`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`})}function Ft({year:e}){let t=(0,F.useCallback)((e,t)=>Nt(e,t),[]);return(0,R.jsxs)(`div`,{children:[(0,R.jsx)(`p`,{className:`text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2`,children:`How have my listening sessions evolved over time?`}),(0,R.jsx)(Pt,{query:jt(e),buildPlot:t})]})}function It(){let[e,t]=(0,F.useState)(2006),[n,r]=(0,F.useState)(),i=g(e,250),o=(0,F.useCallback)(async()=>{try{let e=await a(p);r(e[0]||void 0)}catch{}},[]);(0,F.useEffect)(()=>{o()},[o]),(0,F.useEffect)(()=>(window.addEventListener(s,o),()=>window.removeEventListener(s,o)),[o]),(0,F.useEffect)(()=>{n&&t(new Date(Number(n.max_datetime)).getFullYear())},[n]);let c=n?new Date(Number(n.max_datetime)).getFullYear():void 0,l=i===void 0||c!==void 0&&i===c;return(0,R.jsxs)(R.Fragment,{children:[n&&(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(m,{value:e,onChange:t,min:new Date(Number(n.min_datetime)).getFullYear(),max:new Date(Number(n.max_datetime)).getFullYear()}),(0,R.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,R.jsx)(ye,{year:i}),(0,R.jsx)(Oe,{year:i}),(0,R.jsx)(Fe,{year:i}),(0,R.jsx)(St,{year:i}),(0,R.jsx)(Ge,{year:i,isLatestYear:l}),(0,R.jsx)(mt,{year:i})]})]}),(0,R.jsxs)(`section`,{className:`p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg`,children:[(0,R.jsxs)(`div`,{className:`relative mb-12`,children:[(0,R.jsx)(`div`,{className:`border-t border-gray-300`}),(0,R.jsx)(`span`,{className:`absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border`,children:`🚧 Work in Progress`})]}),(0,R.jsx)(`p`,{className:`mb-4 text-gray-900 dark:text-gray-100`,children:`Experimental section: the graphs below are currently under development and may contain errors.`}),(0,R.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,R.jsx)(Ye,{}),(0,R.jsx)(rt,{}),(0,R.jsx)($e,{}),(0,R.jsx)(At,{year:i}),(0,R.jsx)(Ft,{year:i})]})]})]})}export{It as LabView};