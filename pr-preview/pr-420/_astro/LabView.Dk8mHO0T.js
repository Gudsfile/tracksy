import{T as I,b as W,j as e,C as V,a as Z,f as Et,c as J,u as G,q as K,I as te,S as ee,d as ae,e as ne,s as re,D as Lt,Y as se}from"./App.MfyeeHE1.js";import{b as p}from"./index.CAZYztLa.js";import{M as oe,s as Rt,m as le,p as ie,a as ce,b as de,c as me,d as ue,e as ye,f as pe,t as xe,g as nt,h as ge,i as Mt,n as he,j as _e,k as fe,l as Q,o as ht,q as X,r as _t,u as ft,v as be,w as ke,x as Ft,y as we}from"./index.Bltjrryl.js";const ve=`with spine as (
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
`,$e={year:{periodTrunc:t=>`make_date(year(${t}), 1, 1)`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 1, 1)`,step:"interval 1 year"},month:{periodTrunc:t=>`make_date(year(${t}), month(${t}), 1)`,spineStart:(t,a)=>a?`make_date(year(${t}), 1, 1)`:`make_date(year(${t}), month(${t}), 1)`,spineEnd:(t,a)=>a?`make_date(year(${t}), 12, 1)`:`make_date(year(${t}), month(${t}), 1)`,step:"interval 1 month"},week:{periodTrunc:t=>`date_trunc('week', ${t})`,spineStart:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 1, 1))`:`date_trunc('week', ${t})`,spineEnd:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 12, 31))`:`date_trunc('week', ${t})`,step:"interval 7 days"},day:{periodTrunc:t=>`${t}::date`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 12, 31)`,step:"interval 1 day"}};function je(t,a){const n=W(t),r=t!==void 0,{periodTrunc:l,spineStart:i,spineEnd:d,step:y}=$e[a],o=`(select min(ts::date) from ${I} where ${n})`,s=`(select max(ts::date) from ${I} where ${n})`;return ve.replaceAll("${spineTimeTrunc}",l("t.dt")).replaceAll("${streamTimeTrunc}",l("ts::date")).replaceAll("${spineStart}",i(o,r)).replaceAll("${spineEnd}",d(s,r)).replaceAll("${step}",y).replaceAll("${table}",I).replaceAll("${year_condition}",n)}function bt(t,a,n){const r=new Date(t);return a==="year"?r.toLocaleDateString(n,{year:"numeric"}):a==="month"?r.toLocaleDateString(n,{month:"long",year:"numeric"}):r.toLocaleDateString(n,{month:"short",day:"numeric",year:"numeric"})}function kt(t,a,n,r,l){const i=new Date(t);if(r==="year")return String(i.getUTCFullYear());if(r==="month")return n!==void 0?i.toLocaleDateString(l,{month:"short"}):i.getUTCMonth()===0?String(i.getUTCFullYear()):"";if(r==="week"){const d=a?new Date(a):null;return d?i.getUTCMonth()!==d.getUTCMonth()?i.toLocaleDateString(l,{month:"short"}):"":i.toLocaleDateString(l,{month:"short"})}return i.getUTCDate()===1?i.toLocaleDateString(l,{month:"short"}):""}const Se={year:"Year",month:"Month",week:"Week",day:"Day"};function wt({value:t,available:a,onChange:n}){return e.jsx("div",{className:"flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3",children:["year","month","week","day"].map(r=>{const l=a.includes(r),i=t===r;return e.jsx("button",{onClick:()=>l&&n(r),disabled:!l,className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${i?"bg-blue-500 text-white shadow-sm":l?"text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white":"text-gray-300 dark:text-gray-600 cursor-not-allowed"}`,children:Se[r]},r)})})}function Y({label:t,value:a}){return e.jsxs("li",{className:"flex justify-between items-center mt-1 first:mt-0",role:"listitem",children:[e.jsx("span",{className:"text-sm text-gray-600 dark:text-gray-400",children:t}),e.jsx("span",{className:"font-bold text-sm",children:a})]})}function tt({children:t}){return e.jsx("ul",{className:"mt-4 pt-4 border-t border-gray-100 dark:border-gray-700",role:"list",children:t})}const Te=({data:t,year:a,granularity:n,availableGranularities:r,onGranularityChange:l,isLoading:i})=>{const[d,y]=p.useState(null),o=t?.reduce((h,k)=>h+k.ms_played,0)??0,s=t?.reduce((h,k)=>h+k.count_streams,0)??0,u=t?.length?Math.max(...t.map(h=>h.ms_played)):0,S=u||1,b=n!=="month"||a===void 0;return e.jsxs(V,{title:"Stream Timeline",emoji:"📅",isLoading:i,question:"How did my listening evolve over time?",children:[e.jsx(wt,{value:n,available:r,onChange:l}),!t?.length||s===0?e.jsx(Z,{message:a!==void 0?"No data for this year":"No data"}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"overflow-x-auto mt-4",children:[e.jsx("div",{className:"flex items-end gap-0.5 h-24 mb-1",style:{minWidth:`${t.length*4}px`},onMouseLeave:()=>y(null),children:t.map(h=>{const k=h.ms_played/S*100,c=h.ms_played===u&&h.ms_played>0;return e.jsx("div",{className:`flex-1 min-w-[3px] rounded-t transition-colors duration-200 ${c?"bg-brand-purple":"bg-brand-blue"}`,style:{height:`${k}%`},onMouseEnter:f=>{if(h.ms_played===0)return;const w=f.currentTarget.getBoundingClientRect();y({x:w.left+w.width/2,y:w.top,ts:h.ts,ms_played:h.ms_played,count_streams:h.count_streams})}},h.ts)})}),e.jsx("div",{className:"flex gap-0.5 mb-4",style:{minWidth:`${t.length*4}px`},children:t.map((h,k)=>{const c=kt(h.ts,t[k-1]?.ts,a,n);return e.jsx("div",{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${b?"overflow-visible whitespace-nowrap":"text-center truncate"}`,children:c},h.ts)})})]}),e.jsxs(tt,{children:[e.jsx(Y,{label:"Total duration",value:Et(o)}),e.jsx(Y,{label:"Total streams",value:s.toLocaleString()})]})]}),d&&e.jsx(J,{x:d.x,y:d.y,title:bt(d.ts,n),rows:[Et(d.ms_played),`${d.count_streams.toLocaleString()} streams`]})]})},De=["year","month"],Ne=["month","week","day"];function vt(t){const[a,n]=p.useState("month"),r=t!==void 0?Ne:De,l=r.includes(a)?a:r[0];return{granularity:a,setGranularity:n,availableGranularities:r,effectiveGranularity:l}}function Ce({year:t}){const{setGranularity:a,availableGranularities:n,effectiveGranularity:r}=vt(t),{data:l,isLoading:i}=G({query:je(t,r),year:t});return e.jsx(Te,{data:l,year:t,granularity:r,availableGranularities:n,onGranularityChange:a,isLoading:i})}const Ae=`with spine as (
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
`,Ee=`select
    count(distinct \${entity_column})::int as total_distinct,
    (count(*) - count(distinct \${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from \${table}
where \${year_condition}
`,st={tracks:"track_uri",artists:"artist_name",albums:"album_name"},Le={year:{periodTrunc:t=>`make_date(year(${t}), 1, 1)`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 1, 1)`,step:"interval 1 year"},month:{periodTrunc:t=>`make_date(year(${t}), month(${t}), 1)`,spineStart:(t,a)=>a?`make_date(year(${t}), 1, 1)`:`make_date(year(${t}), month(${t}), 1)`,spineEnd:(t,a)=>a?`make_date(year(${t}), 12, 1)`:`make_date(year(${t}), month(${t}), 1)`,step:"interval 1 month"},week:{periodTrunc:t=>`date_trunc('week', ${t})`,spineStart:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 1, 1))`:`date_trunc('week', ${t})`,spineEnd:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 12, 31))`:`date_trunc('week', ${t})`,step:"interval 7 days"},day:{periodTrunc:t=>`${t}::date`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 12, 31)`,step:"interval 1 day"}};function Re(t,a){const n=W(t);return Ee.replaceAll("${entity_column}",st[a]).replaceAll("${table}",I).replaceAll("${year_condition}",n)}function Me(t,a,n){const r=W(t),l=t!==void 0,{periodTrunc:i,spineStart:d,spineEnd:y,step:o}=Le[a],s=`(select min(ts::date) from ${I} where ${r})`,u=`(select max(ts::date) from ${I} where ${r})`;return Ae.replaceAll("${spineTimeTrunc}",i("t.dt")).replaceAll("${streamTimeTrunc}",i("ts::date")).replaceAll("${entity_column}",st[n]).replaceAll("${spineStart}",d(s,l)).replaceAll("${spineEnd}",y(u,l)).replaceAll("${step}",o).replaceAll("${table}",I).replaceAll("${year_condition}",r)}function zt({items:t}){return e.jsx("div",{className:"mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400",children:t.map(({color:a,label:n})=>e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:`inline-block w-2 h-2 rounded-sm ${a}`}),n]},n))})}const Fe={artists:"Artists",tracks:"Tracks",albums:"Albums"};function ot({value:t,onChange:a}){return e.jsx("div",{className:"flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30",children:["artists","tracks","albums"].map(n=>e.jsx("button",{onClick:()=>a(n),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${t===n?"bg-blue-500 text-white shadow-sm":"text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`,children:Fe[n]},n))})}const gt={tracks:"track",artists:"artist",albums:"album"},Ie=({data:t,stats:a,year:n,granularity:r,availableGranularities:l,onGranularityChange:i,entity:d,onEntityChange:y,isLoading:o})=>{const[s,u]=p.useState(null),S=a?.total_distinct??0,b=(a?.total_streams??0)>0?Math.round((a?.total_distinct??0)/(a?.total_streams??0)*100):0,h=t?.length?Math.max(...t.map(c=>c.total_count)):0,k=r!=="month"||n===void 0;return e.jsxs(V,{title:"Stream Variety",emoji:"🔀",isLoading:o,question:"How varied was my listening?",headerActions:e.jsx(ot,{value:d,onChange:y}),children:[e.jsx(wt,{value:r,available:l,onChange:i}),!t?.length||(a?.total_streams??0)===0?e.jsx(Z,{message:n!==void 0?"No data for this year":"No data"}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"overflow-x-auto mt-4",children:[e.jsx("div",{className:"flex items-end gap-0.5 h-24 mb-1",style:{minWidth:`${t.length*4}px`},onMouseLeave:()=>u(null),children:t.map(c=>{const f=h>0?c.total_count/h*100:0;return e.jsxs("div",{className:"flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden",style:{height:`${f}%`},onMouseEnter:w=>{if(c.total_count===0)return;const g=w.currentTarget.getBoundingClientRect();u({x:g.left+g.width/2,y:g.top,ts:c.ts,distinct_count:c.distinct_count,repeat_count:c.repeat_count,total_count:c.total_count})},children:[e.jsx("div",{className:"bg-yellow-400",style:{flex:c.repeat_count}}),e.jsx("div",{className:"bg-orange-400",style:{flex:c.distinct_count||(c.total_count>0?1:0)}})]},c.ts)})}),e.jsx("div",{className:"flex gap-0.5 mb-4",style:{minWidth:`${t.length*4}px`},children:t.map((c,f)=>{const w=kt(c.ts,t[f-1]?.ts,n,r);return e.jsx("div",{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${k?"overflow-visible whitespace-nowrap":"text-center truncate"}`,children:w},c.ts)})})]}),e.jsx(zt,{items:[{color:"bg-orange-400",label:"Distinct"},{color:"bg-yellow-400",label:"Re-listens"}]}),e.jsxs(tt,{children:[e.jsx(Y,{label:`Unique ${gt[d]}s listened`,value:S.toLocaleString()}),e.jsx(Y,{label:e.jsxs(e.Fragment,{children:["Variety rate",e.jsx("span",{className:"ml-1 text-xs font-normal text-gray-400 dark:text-gray-500",children:"(unique / total streams)"})]}),value:`${b}%`})]}),d!=="tracks"&&e.jsx("p",{className:"mt-2 text-xs italic text-gray-400 dark:text-gray-500",children:"Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one."})]}),s&&e.jsx(J,{x:s.x,y:s.y,title:bt(s.ts,r),rows:[`${s.distinct_count.toLocaleString()} distinct`,`${s.repeat_count.toLocaleString()} re-listens`,`${s.total_count>0?Math.round(s.distinct_count/s.total_count*100):0}% variety`,`${s.distinct_count>0?Math.round(s.total_count/s.distinct_count):0} avg listens/${gt[d]}`]})]})};function Pe({year:t}){const{setGranularity:a,availableGranularities:n,effectiveGranularity:r}=vt(t),[l,i]=p.useState("tracks"),{data:d,isLoading:y}=G({query:Me(t,r,l),year:t}),{data:o}=G({query:Re(t,l),year:t}),s=o?.[0];return e.jsx(Ie,{data:d,stats:s,year:t,granularity:r,availableGranularities:n,onGranularityChange:a,entity:l,onEntityChange:i,isLoading:y})}const Be=`with first_listen as (
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
`,qe=`with first_listen as (
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
`,Ye={year:{periodTrunc:t=>`make_date(year(${t}), 1, 1)`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 1, 1)`,step:"interval 1 year"},month:{periodTrunc:t=>`make_date(year(${t}), month(${t}), 1)`,spineStart:(t,a)=>a?`make_date(year(${t}), 1, 1)`:`make_date(year(${t}), month(${t}), 1)`,spineEnd:(t,a)=>a?`make_date(year(${t}), 12, 1)`:`make_date(year(${t}), month(${t}), 1)`,step:"interval 1 month"},week:{periodTrunc:t=>`date_trunc('week', ${t})`,spineStart:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 1, 1))`:`date_trunc('week', ${t})`,spineEnd:(t,a)=>a?`date_trunc('week', make_date(year(${t}), 12, 31))`:`date_trunc('week', ${t})`,step:"interval 7 days"},day:{periodTrunc:t=>`${t}::date`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 12, 31)`,step:"interval 1 day"}};function Ge(t,a){const n=W(t),r=t!==void 0?`year(f.first_date) = ${t}`:"true";return qe.replaceAll("${entity_column}",st[a]).replaceAll("${table}",I).replaceAll("${year_condition}",n).replaceAll("${new_condition}",r)}function We(t,a,n){const r=W(t),l=t!==void 0,{periodTrunc:i,spineStart:d,spineEnd:y,step:o}=Ye[a],s=`(select min(ts::date) from ${I} where ${r})`,u=`(select max(ts::date) from ${I} where ${r})`;return Be.replaceAll("${spineTimeTrunc}",i("t.dt")).replaceAll("${firstDateTrunc}",i("first_date")).replaceAll("${streamTimeTrunc}",i("stream_date")).replaceAll("${entity_column}",st[n]).replaceAll("${spineStart}",d(s,l)).replaceAll("${spineEnd}",y(u,l)).replaceAll("${step}",o).replaceAll("${table}",I).replaceAll("${year_condition}",r)}const Oe=({data:t,stats:a,year:n,granularity:r,availableGranularities:l,onGranularityChange:i,entity:d,onEntityChange:y,isLoading:o})=>{const[s,u]=p.useState(null),S=a?.total_new??0,b=(a?.total_distinct??0)>0?Math.round((a?.total_new??0)/(a?.total_distinct??0)*100):0,h=t?.length?Math.max(...t.map(c=>c.total_count)):0,k=r!=="month"||n===void 0;return e.jsxs(V,{title:"Stream Discovery",emoji:"🔭",isLoading:o,question:"How many new artists, tracks, or albums did I discover?",headerActions:e.jsx(ot,{value:d,onChange:y}),children:[e.jsx(wt,{value:r,available:l,onChange:i}),!t?.length||(a?.total_distinct??0)===0?e.jsx(Z,{message:n!==void 0?"No data for this year":"No data"}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"overflow-x-auto mt-4",children:[e.jsx("div",{className:"flex items-end gap-0.5 h-24 mb-1",style:{minWidth:`${t.length*4}px`},onMouseLeave:()=>u(null),children:t.map(c=>{const f=h>0?c.total_count/h*100:0;return e.jsxs("div",{className:"flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden",style:{height:`${f}%`},onMouseEnter:w=>{if(c.total_count===0)return;const g=w.currentTarget.getBoundingClientRect();u({x:g.left+g.width/2,y:g.top,ts:c.ts,new_count:c.new_count,known_count:c.known_count,total_count:c.total_count})},children:[e.jsx("div",{className:"bg-rose-500",style:{flex:c.known_count}}),e.jsx("div",{className:"bg-rose-800",style:{flex:c.new_count}})]},c.ts)})}),e.jsx("div",{className:"flex gap-0.5 mb-4",style:{minWidth:`${t.length*4}px`},children:t.map((c,f)=>{const w=kt(c.ts,t[f-1]?.ts,n,r);return e.jsx("div",{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${k?"overflow-visible whitespace-nowrap":"text-center truncate"}`,children:w},c.ts)})})]}),e.jsx(zt,{items:[{color:"bg-rose-800",label:"New"},{color:"bg-rose-500",label:"Known"}]}),e.jsxs(tt,{children:[e.jsx(Y,{label:`New ${gt[d]}s discovered`,value:S.toLocaleString()}),e.jsx(Y,{label:e.jsxs(e.Fragment,{children:["Discovery rate",e.jsx("span",{className:"ml-1 text-xs font-normal text-gray-400 dark:text-gray-500",children:"(new / total distinct)"})]}),value:`${b}%`})]}),d!=="tracks"&&e.jsx("p",{className:"mt-2 text-xs italic text-gray-400 dark:text-gray-500",children:"Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one."})]}),s&&e.jsx(J,{x:s.x,y:s.y,title:bt(s.ts,r),rows:[`${s.new_count.toLocaleString()} new`,`${s.known_count.toLocaleString()} known`,`${s.total_count>0?Math.round(s.new_count/s.total_count*100):0}% discovery`]})]})};function He({year:t}){const{setGranularity:a,availableGranularities:n,effectiveGranularity:r}=vt(t),[l,i]=p.useState("tracks"),{data:d,isLoading:y}=G({query:We(t,r,l),year:t}),{data:o}=G({query:Ge(t,l),year:t}),s=o?.[0];return e.jsx(Oe,{data:d,stats:s,year:t,granularity:r,availableGranularities:n,onGranularityChange:a,entity:l,onEntityChange:i,isLoading:y})}const Ve=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function Ue(t){return Ve.replaceAll("${table}",I).replaceAll("${year_condition}",W(t))}const It=3,Pt=24,ze=10,Qe=Array.from({length:7},(t,a)=>a%2===0?"":new Date(Date.UTC(2025,0,5+a)).toLocaleDateString(void 0,{weekday:"short",timeZone:"UTC"}));function z(t){const[a,n,r]=t.split("-").map(Number);return new Date(a,n-1,r)}function mt(t){const a=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${a}-${n}-${r}`}function Bt(t,a){const n=new Date(t);return n.setDate(n.getDate()+a),n}const $t=t=>t.streak>0,jt=t=>t.streak===0&&t.prevStreak>0&&t.inRange,Xe=t=>$t(t)||jt(t);function Ze(t,a){return $t(t)?`rgba(34,197,94,${Math.max(.2,t.streak/a)})`:jt(t)?"rgba(239,68,68,0.45)":t.inRange?null:"transparent"}function ut(t){return new Date(t+"T00:00:00").toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Je({data:t,year:a,isLatestYear:n,isLoading:r}){const l=p.useRef(null),[i,d]=p.useState(null),{cells:y,maxStreak:o,bestStreakEnd:s,bestStreakStart:u,currentStreak:S}=p.useMemo(()=>{if(!t||t.length===0)return{cells:[],maxStreak:0,bestStreakEnd:"",bestStreakStart:"",currentStreak:0};const g=new Set(t.map(m=>m.stream_date)),N=[...g].sort(),E=N[0],v=N[N.length-1],_=a!==void 0?`${a}-01-01`:E,L=a!==void 0?`${a}-12-31`:v,R=[],$=z(_),F=z(L);let C=0,x=0,A="",D=0;for(;$<=F;){const m=mt($),j=C;C=g.has(m)?j+1:0;const M=a!==void 0?m>=E&&m<=v:!0;R.push({day:m,streak:C,prevStreak:j,inRange:M}),C>x&&(x=C,A=m),g.has(m)&&(D=C),$.setDate($.getDate()+1)}let T="";return A&&x>0&&(T=mt(Bt(z(A),-(x-1)))),{cells:R,maxStreak:x,bestStreakEnd:A,bestStreakStart:T,currentStreak:D}},[t,a]),{weeks:b,monthLabels:h,weekCount:k}=p.useMemo(()=>{if(y.length===0)return{weeks:[],monthLabels:[],weekCount:0};const g=new Map(y.map(A=>[A.day,A])),N=z(y[0].day),E=z(y[y.length-1].day),v=new Date(N);v.setDate(v.getDate()-v.getDay());const _=new Date(E);_.setDate(_.getDate()+(6-_.getDay()));const R=(Math.round((_.getTime()-v.getTime())/864e5)+1)/7,$=[];for(let A=0;A<R;A++){const D=[];for(let T=0;T<7;T++){const m=mt(Bt(v,A*7+T));D.push(g.get(m)??null)}$.push(D)}const F=[];let C=-1,x=-1;for(let A=0;A<$.length;A++){const D=$[A].find(M=>M!==null);if(!D)continue;const T=z(D.day),m=T.getMonth(),j=T.getFullYear();if(m!==C){const M=j!==x,U=T.toLocaleDateString(void 0,{month:"short"});F.push({weekIdx:A,label:M?`${U} '${String(j).slice(2)}`:U}),C=m,x=j}}return{weeks:$,monthLabels:F,weekCount:R}},[y]);p.useEffect(()=>{const g=l.current;g&&(a===void 0?g.scrollLeft=g.scrollWidth:g.scrollLeft=0)},[a,y]);const c=!t||t.length===0,f=Pt+k*(ze+It),w=`${Pt}px repeat(${k}, 1fr)`;return e.jsxs(V,{title:"Listening Streaks",emoji:"🔥",question:"How consistent is your listening?",isLoading:r,children:[c?e.jsx(Z,{}):e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:l,className:"overflow-x-auto pb-4",onMouseLeave:()=>d(null),children:e.jsxs("div",{style:{minWidth:`${f}px`},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:w,marginBottom:2},children:[e.jsx("div",{}),Array.from({length:k},(g,N)=>{const E=h.find(v=>v.weekIdx===N);return e.jsx("div",{className:"text-[9px] text-gray-400 dark:text-gray-600",children:E?.label??""},N)})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:w,gridTemplateRows:"repeat(7, auto)",gap:`${It}px`},children:[Qe.map((g,N)=>e.jsx("div",{style:{gridColumn:1,gridRow:N+1},className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:g},`label-${N}`)),b.flatMap((g,N)=>g.map((E,v)=>{const _=E?$t(E)?"streak-cell-active":jt(E)?"streak-cell-break":void 0:void 0,L=E?Ze(E,o):"transparent";return e.jsx("div",{"data-testid":_,style:{gridColumn:N+2,gridRow:v+1,aspectRatio:"1",backgroundColor:L??void 0},className:`rounded-xs ${L===null?"bg-gray-100 dark:bg-slate-700/50":""}`,onMouseEnter:E&&Xe(E)?R=>{const $=R.currentTarget.getBoundingClientRect();d({cell:E,x:$.left+$.width/2,y:$.top})}:void 0},`${N}-${v}`)}))]})]})}),e.jsxs(tt,{children:[e.jsx(Y,{label:"Best streak",value:e.jsxs(e.Fragment,{children:[o," day",o===1?"":"s",u&&s&&e.jsxs("span",{className:"font-normal text-gray-500 dark:text-gray-400",children:[" ","·"," ",ut(u)," ","–"," ",ut(s)]})]})}),n&&e.jsx(Y,{label:"Current streak",value:`${S} day${S===1?"":"s"}`})]})]}),i&&e.jsx(J,{x:i.x,y:i.y,title:ut(i.cell.day),rows:[i.cell.streak>0?`Day ${i.cell.streak} of streak`:"Streak broken"]})]})}function Ke({year:t,isLatestYear:a}){const{data:n,isLoading:r}=G({query:Ue(t),year:t});return e.jsx(Je,{data:n,year:t,isLatestYear:a,isLoading:r})}const ta=`with artist_yearly_play_counts as (
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
`;function ea(){return ta.replaceAll("${table}",I)}const aa={ariaLabel:"dot",fill:"none",stroke:"currentColor",strokeWidth:1.5};function na(t){return t.sort===void 0&&t.reverse===void 0?_e({channel:"-r"},t):t}class ra extends oe{constructor(a,n={}){const{x:r,y:l,r:i,rotate:d,symbol:y=Rt,frameAnchor:o}=n,[s,u]=Mt(d,0),[S,b]=le(y),[h,k]=Mt(i,S==null?3:4.5);super(a,{x:{value:r,scale:"x",optional:!0},y:{value:l,scale:"y",optional:!0},r:{value:h,scale:"r",filter:ie,optional:!0},rotate:{value:s,optional:!0},symbol:{value:S,scale:"auto",optional:!0}},na(n),aa),this.r=k,this.rotate=u,this.symbol=b,this.frameAnchor=ce(o);const{channels:c}=this,{symbol:f}=c;if(f){const{fill:w,stroke:g}=c;f.hint={fill:w?w.value===f.value?"color":"currentColor":this.fill??"currentColor",stroke:g?g.value===f.value?"color":"currentColor":this.stroke??"none"}}}render(a,n,r,l,i){const{x:d,y}=n,{x:o,y:s,r:u,rotate:S,symbol:b}=r,{r:h,rotate:k,symbol:c}=this,[f,w]=de(this,l),g=c===Rt,N=u?void 0:h*h*Math.PI;return he(h)&&(a=[]),me("svg:g",i).call(ue,this,l,i).call(ye,this,{x:o&&d,y:s&&y}).call(E=>E.selectAll().data(a).enter().append(g?"circle":"path").call(pe,this).call(g?v=>{v.attr("cx",o?_=>o[_]:f).attr("cy",s?_=>s[_]:w).attr("r",u?_=>u[_]:h)}:v=>{v.attr("transform",xe`translate(${o?_=>o[_]:f},${s?_=>s[_]:w})${S?_=>` rotate(${S[_]})`:k?` rotate(${k})`:""}`).attr("d",u&&b?_=>{const L=nt();return b[_].draw(L,u[_]*u[_]*Math.PI),L}:u?_=>{const L=nt();return c.draw(L,u[_]*u[_]*Math.PI),L}:b?_=>{const L=nt();return b[_].draw(L,N),L}:(()=>{const _=nt();return c.draw(_,N),_})())}).call(ge,this,r)).node()}}function lt(t,{x:a,y:n,...r}={}){return r.frameAnchor===void 0&&([a,n]=fe(a,n)),new ra(t,{...r,x:a,y:n})}function sa({data:t}){const a=p.useRef(null);return p.useEffect(()=>{if(!t||t.length===0||!a.current)return;const n=[...t].sort((o,s)=>o.artist!==s.artist?o.artist.localeCompare(s.artist):o.stream_year-s.stream_year),l=[...Array.from(new Set(n.map(o=>o.artist))).map(o=>{const s=n.filter(u=>u.artist===o);return s[s.length-1]})].sort((o,s)=>o.stream_rank-s.stream_rank),i=l.filter((o,s)=>s%2===0),d=l.filter((o,s)=>s%2===1),y=Q({title:"Global Top 10 Artists Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[ht(n,{x:"stream_year",y:"stream_rank",stroke:"artist",strokeWidth:2.5}),lt(n,{x:"stream_year",y:"stream_rank",fill:"artist",r:4}),X(i,{x:"stream_year",y:"stream_rank",text:"artist",fill:"artist",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),X(d,{x:"stream_year",y:"stream_rank",text:"artist",fill:"artist",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),_t(n,ft({x:"stream_year",y:"stream_rank",title:o=>`${o.artist}
Rank: ${o.stream_rank}
Year: ${o.stream_year}`}))]});return a.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:a})}function oa(){const[t,a]=p.useState([]);return p.useEffect(()=>{(async()=>{const r=await K(ea());a(r)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx(sa,{data:t})})}const la=`with
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
`;function ia(){return la.replaceAll("${table}",I)}function ca({data:t}){const a=p.useRef(null);return p.useEffect(()=>{if(!t||t.length===0||!a.current)return;const n=[...t].sort((o,s)=>o.album!==s.album?o.album.localeCompare(s.album):o.stream_year-s.stream_year),l=[...Array.from(new Set(n.map(o=>o.album))).map(o=>{const s=n.filter(u=>u.album===o);return s[s.length-1]})].sort((o,s)=>o.stream_rank-s.stream_rank),i=l.filter((o,s)=>s%2===0),d=l.filter((o,s)=>s%2===1),y=Q({title:"Global Top 10 Albums Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[ht(n,{x:"stream_year",y:"stream_rank",stroke:"album",strokeWidth:2.5}),lt(n,{x:"stream_year",y:"stream_rank",fill:"album",r:4}),X(i,{x:"stream_year",y:"stream_rank",text:"album",fill:"album",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),X(d,{x:"stream_year",y:"stream_rank",text:"album",fill:"album",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),_t(n,ft({x:"stream_year",y:"stream_rank",title:o=>`${o.album} - ${o.artist}
Rank: ${o.stream_rank}
Year: ${o.stream_year}
Count: ${o.play_count}`}))]});return a.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:a})}function da(){const[t,a]=p.useState([]);return p.useEffect(()=>{(async()=>{const r=await K(ia());a(r)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx(ca,{data:t})})}const ma=`with track_yearly_play_counts as (
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
`;function ua(){return ma.replaceAll("${table}",I)}function ya({data:t}){const a=p.useRef(null);return p.useEffect(()=>{if(!t||t.length===0||!a.current)return;const n=[...t].sort((o,s)=>o.track!==s.track?o.track.localeCompare(s.track):o.stream_year-s.stream_year),l=[...Array.from(new Set(n.map(o=>o.track))).map(o=>{const s=n.filter(u=>u.track===o);return s[s.length-1]})].sort((o,s)=>o.stream_rank-s.stream_rank),i=l.filter((o,s)=>s%2===0),d=l.filter((o,s)=>s%2===1),y=Q({title:"Global Top 10 Track Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[ht(n,{x:"stream_year",y:"stream_rank",stroke:"track",strokeWidth:2.5}),lt(n,{x:"stream_year",y:"stream_rank",fill:"track",r:4}),X(i,{x:"stream_year",y:"stream_rank",text:"track",fill:"track",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),X(d,{x:"stream_year",y:"stream_rank",text:"track",fill:"track",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),_t(n,ft({x:"stream_year",y:"stream_rank",title:o=>`${o.track} - ${o.artist}
Rank: ${o.stream_rank}
Year: ${o.stream_year}
Count: ${o.play_count}`}))]});return a.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:a})}function pa(){const[t,a]=p.useState([]);return p.useEffect(()=>{(async()=>{const r=await K(ua());a(r)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx(ya,{data:t})})}const xa=`with daily as (
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
`;function ga(t){const a=W(t);return xa.replaceAll("${table}",I).replaceAll("${year_condition}",a)}function St({frameCount:t,startTs:a,endTs:n,currentFrameIdx:r,speedMultiplier:l,isPlaying:i,onFrameChange:d,onSpeedChange:y,onPlayPause:o}){const s=r>=t-1;return e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-1 min-w-0 px-1",children:[e.jsx("span",{className:"text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0",children:new Date(a).toLocaleDateString(void 0,{year:"numeric",month:"short"})}),e.jsx("input",{type:"range","aria-label":"Animation timeline",min:0,max:t-1,value:r,onChange:u=>d(Number(u.target.value)),className:"flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-w-0"}),e.jsx("span",{className:"text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0",children:new Date(n).toLocaleDateString(void 0,{year:"numeric",month:"short"})})]}),e.jsxs("div",{className:"flex items-center shrink-0 self-center sm:self-auto",children:[[.5,1,2,4].map(u=>e.jsxs("button",{type:"button",onClick:()=>y(u),className:`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${l===u?"bg-blue-500 text-white shadow-sm":"text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`,children:[u,"x"]},u)),e.jsx("div",{className:"w-px h-4 bg-gray-300/50 dark:bg-slate-600/50 mx-1"}),e.jsx("button",{type:"button",onClick:o,"aria-label":i?"Pause":s?"Replay":"Play",title:i?"Pause":s?"Replay":"Play",className:"p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-all",children:i?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"currentColor",children:[e.jsx("rect",{x:"3",y:"2",width:"4",height:"12",rx:"1"}),e.jsx("rect",{x:"9",y:"2",width:"4",height:"12",rx:"1"})]}):s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"currentColor",children:[e.jsx("path",{d:"M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"}),e.jsx("path",{d:"M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"})]}):e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"currentColor",children:e.jsx("path",{d:"M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"})})})]})]})}function Tt({frameCount:t,baseSpeed:a,entityType:n}){const[r,l]=p.useState(0),[i,d]=p.useState(!1),[y,o]=p.useState(1),[s,u]=p.useState(!1),S=p.useRef(null);p.useEffect(()=>{const c=new IntersectionObserver(([w])=>{u(w.isIntersecting)},{threshold:.1}),f=S.current;return f&&c.observe(f),()=>{f&&c.unobserve(f)}},[]);const b=p.useRef(!1);return p.useEffect(()=>{if(!b.current){b.current=!0;return}l(0),d(!0)},[n]),p.useEffect(()=>{if(!i||!s||t===0)return;const c=setInterval(()=>{l(f=>f>=t-1?(d(!1),f):f+1)},a/y);return()=>clearInterval(c)},[i,s,t,a,y]),{containerRef:S,currentFrameIdx:r,isPlaying:i,speedMultiplier:y,onFrameChange:c=>{d(!1),l(c)},onSpeedChange:o,onPlayPause:()=>{r>=t-1?(l(0),d(!0)):d(c=>!c)}}}const yt=3,pt=24,ha=10,xt=40,_a=120,qt=Array.from({length:7},(t,a)=>new Date(Date.UTC(2025,0,5+a)).toLocaleDateString(void 0,{weekday:"long",timeZone:"UTC"})),Yt=Array.from({length:7},(t,a)=>new Date(Date.UTC(2025,0,5+a)).toLocaleDateString(void 0,{weekday:"short",timeZone:"UTC"})),Gt=Array.from({length:24},(t,a)=>a%6===0?String(a):"");function fa({data:t,year:a,isLoading:n}){const{frames:r,maxCount:l,topDay:i,topHour:d,firstPlayedByCell:y,firstCompleteHourFrame:o,firstCompleteHourLabel:s,firstCompleteDayFrame:u,firstCompleteDayLabel:S,bingoFrame:b,uncoveredCells:h}=p.useMemo(()=>{if(!t||t.length===0)return{frames:[],maxCount:1,topDay:-1,topHour:-1,firstPlayedByCell:new Map,firstCompleteHourFrame:null,firstCompleteHourLabel:"",firstCompleteDayFrame:null,firstCompleteDayLabel:"",bingoFrame:null,uncoveredCells:168};const C=[...new Set(t.map(P=>P.stream_date_ts))].sort((P,q)=>P-q),x=new Map;for(const P of t)x.has(P.stream_date_ts)||x.set(P.stream_date_ts,[]),x.get(P.stream_date_ts).push(P);const A=new Map,D=[],T=new Map,m=new Map,j=new Map;let M=0,U=null,Dt="",it=null,Nt="",ct=null;for(let P=0;P<C.length;P++){const q=C[P],O=x.get(q)??[];for(const B of O){const H=`${B.day_of_week},${B.play_hour}`;if(!A.has(H)){T.set(H,q),M++;const et=B.day_of_week,at=B.play_hour;m.has(at)||m.set(at,new Set),m.get(at).add(et),j.has(et)||j.set(et,new Set),j.get(et).add(at)}A.set(H,B.cumulative_count)}if(D.push({dateTs:q,cells:new Map(A)}),U===null){for(const[B,H]of m)if(H.size===7){U=P,Dt=`${B}h · ${new Date(q).toLocaleDateString()}`;break}}if(it===null){for(const[B,H]of j)if(H.size===24){it=P,Nt=`${qt[B]} · ${new Date(q).toLocaleDateString()}`;break}}ct===null&&M===168&&(ct=P)}const Xt=168-M,dt=D[D.length-1].cells,Zt=Math.max(1,...dt.values()),Ct=Array.from({length:7},(P,q)=>{let O=0;for(let B=0;B<24;B++)O+=dt.get(`${q},${B}`)??0;return O}),At=Array.from({length:24},(P,q)=>{let O=0;for(let B=0;B<7;B++)O+=dt.get(`${B},${q}`)??0;return O}),Jt=Ct.indexOf(Math.max(...Ct)),Kt=At.indexOf(Math.max(...At));return{frames:D,maxCount:Zt,topDay:Jt,topHour:Kt,firstPlayedByCell:T,firstCompleteHourFrame:U,firstCompleteHourLabel:Dt,firstCompleteDayFrame:it,firstCompleteDayLabel:Nt,bingoFrame:ct,uncoveredCells:Xt}},[t]),{containerRef:k,currentFrameIdx:c,isPlaying:f,speedMultiplier:w,onFrameChange:g,onSpeedChange:N,onPlayPause:E}=Tt({frameCount:r.length,baseSpeed:_a,entityType:String(a)}),v=p.useMemo(()=>r[c]?.cells??new Map,[r,c]),{dayTotals:_,hourTotals:L}=p.useMemo(()=>{const C=Array.from({length:7},(A,D)=>{let T=0;for(let m=0;m<24;m++)T+=v.get(`${D},${m}`)??0;return T}),x=Array.from({length:24},(A,D)=>{let T=0;for(let m=0;m<7;m++)T+=v.get(`${m},${D}`)??0;return T});return{dayTotals:C,hourTotals:x}},[v]),[R,$]=p.useState(null);let F=null;return b!==null&&c>=b?F=e.jsx("span",{className:"font-bold text-sm",children:new Date(r[b].dateTs).toLocaleDateString()}):b===null&&r.length>0&&c>=r.length-1&&(F=e.jsxs("span",{className:"text-sm text-gray-500",children:[h," cells uncovered"]})),e.jsx("div",{ref:k,children:e.jsxs(V,{title:"Listening Bingo",emoji:"🎰",question:"Have you listened at every hour of every day?",isLoading:n,children:[e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("div",{className:"md:hidden","data-testid":"bingo-grid-mobile",children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:`${pt}px repeat(7, 1fr) ${xt}px`,gap:`${yt}px`},onMouseLeave:()=>$(null),children:[e.jsx("div",{}),Yt.map((C,x)=>e.jsx("div",{className:"text-[8px] text-center text-gray-400 dark:text-gray-600",children:C},x)),e.jsx("div",{className:"text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700",children:"TOTAL"}),Array.from({length:24},(C,x)=>e.jsxs(p.Fragment,{children:[e.jsx("div",{className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:Gt[x]}),Array.from({length:7},(A,D)=>{const T=v.get(`${D},${x}`)??0,m=T>0;return e.jsx("div",{style:{height:12,...m&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,T/l)})`,animation:"cellPop 0.2s ease-out"}},className:`rounded-xs ${m?"":"bg-slate-200/50 dark:bg-slate-700/30"}`,onMouseEnter:j=>{const M=j.currentTarget.getBoundingClientRect();$({x:M.left+M.width/2,y:M.top,day:D,hour:x,count:T,firstPlayedTs:m?y.get(`${D},${x}`)??null:null})}},`${D}-${T}`)}),e.jsx("div",{className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${x===d?"text-teal-500":"text-gray-500 dark:text-gray-400"}`,children:L[x]>0?L[x]:""})]},x)),e.jsx("div",{className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:"TOT"}),_.map((C,x)=>e.jsx("div",{className:`text-[8px] text-center font-medium ${x===i?"text-teal-500":"text-gray-500 dark:text-gray-400"}`,children:C>0?C:""},x)),e.jsx("div",{})]})}),e.jsx("div",{className:"hidden md:block overflow-x-auto",children:e.jsxs("div",{"data-testid":"bingo-grid-desktop",style:{display:"grid",gridTemplateColumns:`${pt}px repeat(24, 1fr) ${xt}px`,gap:`${yt}px`,minWidth:`${pt+24*(yt+ha)+xt}px`},onMouseLeave:()=>$(null),children:[e.jsx("div",{}),Gt.map((C,x)=>e.jsx("div",{className:"text-[8px] text-center text-gray-400 dark:text-gray-600",children:C},x)),e.jsx("div",{className:"text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700",children:"TOTAL"}),Yt.map((C,x)=>e.jsxs(p.Fragment,{children:[e.jsx("div",{className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:x===1||x===3||x===5?C:""}),Array.from({length:24},(A,D)=>{const T=v.get(`${x},${D}`)??0,m=T>0;return e.jsx("div",{style:{aspectRatio:"1",...m&&{backgroundColor:`rgba(20, 184, 166, ${Math.max(.15,T/l)})`,animation:"cellPop 0.2s ease-out"}},className:`rounded-xs ${m?"":"bg-slate-200/50 dark:bg-slate-700/30"}`,onMouseEnter:j=>{const M=j.currentTarget.getBoundingClientRect();$({x:M.left+M.width/2,y:M.top,day:x,hour:D,count:T,firstPlayedTs:m?y.get(`${x},${D}`)??null:null})}},`${D}-${T}`)}),e.jsx("div",{"data-testid":`day-total-${x}`,className:`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${x===i?"text-teal-500":"text-gray-500 dark:text-gray-400"}`,children:_[x]>0?_[x]:""})]},x)),e.jsx("div",{className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:"TOT"}),L.map((C,x)=>e.jsx("div",{"data-testid":`hour-total-${x}`,className:`text-[8px] text-center font-medium ${x===d?"text-teal-500":"text-gray-500 dark:text-gray-400"}`,children:C>0?C:""},x)),e.jsx("div",{})]})}),r.length>1&&e.jsx(St,{frameCount:r.length,startTs:r[0].dateTs,endTs:r[r.length-1].dateTs,currentFrameIdx:c,speedMultiplier:w,isPlaying:f,onFrameChange:g,onSpeedChange:N,onPlayPause:E}),e.jsxs(tt,{children:[e.jsx(Y,{label:"First complete hour",value:o!==null&&c>=o?s:null}),e.jsx(Y,{label:"First complete day",value:u!==null&&c>=u?S:null}),e.jsx(Y,{label:"Bingo",value:F})]})]}),R&&e.jsx(J,{x:R.x,y:R.y,title:`${qt[R.day]} ${R.hour}h`,rows:[`${R.count.toLocaleString()} streams`,R.firstPlayedTs!==null?`first played ${new Date(R.firstPlayedTs).toLocaleDateString()}`:null]})]})})}function ba({year:t}){const{data:a,isLoading:n}=G({query:ga(t),year:t});return e.jsx(fa,{data:a,year:t,isLoading:n})}const ka=`with daily_streams as (
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
`,wa=`with daily_streams as (
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
`,va=`with daily_streams as (
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
`,$a={artists:ka,tracks:wa,albums:va};function ja(t,a="artists"){let n=$a[a].replaceAll("${table}",I);return n=t?n.replace("${yearFilter}",`AND year(ts::datetime) = ${t}`):n.replace("${yearFilter}",""),n}function Qt(t,a){const n=p.useRef(t),[r,l]=p.useState(a);return p.useEffect(()=>{t!==n.current&&(n.current=t,l(a))},[t,a]),r}const rt=["bg-blue-500","bg-red-500","bg-green-500","bg-yellow-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-teal-500","bg-orange-500","bg-cyan-500"],Sa=120,Wt=44,Ot=60;function Ta({data:t,entityType:a}){const{frames:n,entityColors:r}=p.useMemo(()=>{const b=Array.from(new Set(t.map(g=>g.stream_date_ts))).sort((g,N)=>g-N),h=new Map,k=[],c=new Map;let f=0;const w=new Map;for(const g of t)w.has(g.stream_date_ts)||w.set(g.stream_date_ts,[]),w.get(g.stream_date_ts).push(g);for(const g of b){const N=w.get(g)||[];for(const v of N)h.set(v.entity_name,v.play_count),c.has(v.entity_name)||(c.set(v.entity_name,rt[f%rt.length]),f++);const E=Array.from(h.entries()).sort((v,_)=>_[1]-v[1]).slice(0,10);k.push({dateTs:g,top10:E.map(([v,_])=>({label:v,play_count:_})),maxScore:Math.max(1,E[0]?.[1]||1)})}return{frames:k,entityColors:c}},[t]),{containerRef:l,currentFrameIdx:i,isPlaying:d,speedMultiplier:y,onFrameChange:o,onSpeedChange:s,onPlayPause:u}=Tt({frameCount:n.length,baseSpeed:Sa,entityType:a}),S=n[i];return S?e.jsxs("div",{ref:l,className:"flex flex-col gap-4 w-full",children:[e.jsxs("h4",{className:"text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100",children:[new Date(S.dateTs).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"}),e.jsx("span",{className:"text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans",children:"· daily"})]}),e.jsx("div",{className:"flex justify-end",style:{paddingRight:Ot},children:e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 font-mono",children:"streams"})}),e.jsx("div",{className:"relative w-full",style:{height:S.top10.length*Wt},children:S.top10.map((b,h)=>{const k=b.play_count/S.maxScore*100,c=h*Wt;return e.jsxs("div",{className:"absolute left-0 flex items-center w-full transition-all duration-300 ease-linear",style:{top:`${c}px`,zIndex:10-h},children:[e.jsxs("div",{className:"w-full relative h-9",children:[e.jsx("div",{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(b.label)}`,style:{width:`${k}%`,opacity:.8}}),e.jsxs("div",{className:"absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis",style:{width:"calc(100% - 16px)"},children:[e.jsxs("span",{className:"font-bold w-6 text-right mr-2 opacity-70",children:["#",h+1]}),b.label]})]}),e.jsx("div",{className:"ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear",style:{minWidth:Ot},children:b.play_count.toLocaleString()})]},b.label)})}),n.length>1&&e.jsx(St,{frameCount:n.length,startTs:n[0].dateTs,endTs:n[n.length-1].dateTs,currentFrameIdx:i,speedMultiplier:y,isPlaying:d,onFrameChange:o,onSpeedChange:s,onPlayPause:u})]}):null}function Da({year:t}){const[a,n]=p.useState("artists"),{data:r,isLoading:l}=G({query:ja(t,a),year:t}),i=r??[],d=Qt(r,a),y=l&&i.length===0;return e.jsx(V,{title:"Top 10 Race",emoji:"🏎️",className:"md:col-span-2 lg:col-span-3",isLoading:y,question:"Who dominated my listening, and when did they rise?",headerActions:e.jsx(ot,{value:a,onChange:n}),children:i.length===0?e.jsx(Z,{}):e.jsx("div",{className:"transition-opacity duration-150",style:{opacity:l?.4:1},children:e.jsx(Ta,{data:i,entityType:d})})})}const Na=`select
    artist_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,Ca=`select
    count(*)::int as period_plays,
    track_name || ' — ' || artist_name as entity_name,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where track_name is not null and artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,Aa=`select
    album_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where album_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,Ea={artists:Na,tracks:Ca,albums:Aa};function La(t,a="artists"){let n=Ea[a].replaceAll("${table}",I);return n=t?n.replace("${yearFilter}",`AND year(ts::datetime) = ${t}`):n.replace("${yearFilter}",""),n}function Ra({ranking:t,activeLabels:a}){return e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3",children:"Longevity Leaderboard"}),e.jsx("div",{className:"flex flex-col gap-0.5",children:t.map((n,r)=>e.jsxs("div",{className:"flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors",children:[e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono",children:r+1}),e.jsx("span",{className:`text-sm truncate flex-1 min-w-0 ${a.has(n.label)?"font-bold text-gray-900 dark:text-white":"font-normal text-gray-500 dark:text-gray-400"}`,children:n.label}),e.jsxs("span",{className:"text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0",children:[n.periodsInTop10,"w"]}),e.jsx("span",{className:"text-xs font-mono shrink-0 w-8 text-right",children:n.rankDelta===null?e.jsx("span",{className:"text-blue-400",children:"new"}):n.rankDelta>0?e.jsxs("span",{className:"text-emerald-400",children:["↑",n.rankDelta]}):n.rankDelta<0?e.jsxs("span",{className:"text-red-400",children:["↓",Math.abs(n.rankDelta)]}):e.jsx("span",{className:"text-gray-400 opacity-40",children:"—"})})]},n.label))})]})}const Ma=240,Ht=44,Vt=62;function Fa({data:t,entityType:a}){const{frames:n,entityColors:r,streakRecord:l}=p.useMemo(()=>{const k=[...new Set(t.map($=>$.period_ts))].sort(($,F)=>$-F),c=Math.exp(-.2),f=new Map;for(const $ of t)f.has($.period_ts)||f.set($.period_ts,[]),f.get($.period_ts).push({label:$.entity_name,plays:$.period_plays});const w=new Map,g=new Map,N=new Map,E=new Map,v=new Map;let _=0;const L=[];for(const $ of k){for(const[m,j]of w)w.set(m,j*c);for(const{label:m,plays:j}of f.get($)??[])w.set(m,(w.get(m)??0)+j),v.has(m)||(v.set(m,rt[_%rt.length]),_++);const F=[...w.entries()].filter(([,m])=>m>.01).sort((m,j)=>j[1]-m[1]).slice(0,10),C=new Set(F.map(([m])=>m));for(const[m]of F){g.set(m,(g.get(m)??0)+1),N.set(m,(N.get(m)??0)+1);const j=N.get(m);j>(E.get(m)??0)&&E.set(m,j)}for(const[m]of w)!C.has(m)&&(N.get(m)??0)>0&&N.set(m,0);const x=F[0]?.[1]??1,A=L.length>0?L[L.length-1].ghostRanking:[],D=new Map(A.map((m,j)=>[m.label,j])),T=[...g.entries()].sort((m,j)=>j[1]-m[1]).slice(0,10).map(([m,j],M)=>({label:m,periodsInTop10:j,rankDelta:A.length===0?null:D.has(m)?D.get(m)-M:null}));L.push({periodTs:$,top10:F.map(([m,j])=>({label:m,score:j,periodsInTop10:g.get(m)??0})),maxScore:x,ghostRanking:T})}let R={label:"",weeks:0};for(const[$,F]of E)F>R.weeks&&(R={label:$,weeks:F});return{frames:L,entityColors:v,streakRecord:R}},[t]),{containerRef:i,currentFrameIdx:d,isPlaying:y,speedMultiplier:o,onFrameChange:s,onSpeedChange:u,onPlayPause:S}=Tt({frameCount:n.length,baseSpeed:Ma,entityType:a}),b=n[d],h=p.useMemo(()=>new Set(b?.top10.map(k=>k.label)??[]),[b]);return b?e.jsxs("div",{ref:i,className:"flex flex-col gap-4 w-full",children:[e.jsxs("h4",{className:"text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100",children:["Week of "+new Date(b.periodTs).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"}),e.jsx("span",{className:"text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans",children:"· weekly"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4",children:[e.jsx(Ra,{ranking:b.ghostRanking,activeLabels:h}),l.weeks>0&&e.jsxs(te,{children:[e.jsx("div",{className:"text-xs text-gray-400 dark:text-gray-500 mb-0.5",children:"🔥 Longest streak"}),d>=n.length-1?e.jsxs("div",{children:[e.jsx("span",{className:"font-bold",children:l.label}),e.jsxs("span",{className:"text-xs font-normal text-gray-500 dark:text-gray-400 ml-1",children:[l.weeks," consecutive weeks"]})]}):e.jsx("div",{className:"text-xs text-gray-400 dark:text-gray-500 italic",children:"Watch till the end to find out…"})]})]}),e.jsxs("div",{className:"md:col-span-2 flex flex-col",children:[e.jsx("div",{className:"flex justify-end",style:{paddingRight:Vt},children:e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 font-mono",children:"score"})}),e.jsx("div",{className:"relative w-full mt-4",style:{height:b.top10.length*Ht},children:b.top10.map((k,c)=>{const f=k.score/b.maxScore*100,w=c*Ht;return e.jsxs("div",{title:`${k.periodsInTop10} weeks in top 10`,className:"absolute left-0 flex items-center w-full transition-all duration-300 ease-linear",style:{top:`${w}px`,zIndex:10-c},children:[e.jsxs("div",{className:"w-full relative h-9",children:[e.jsx("div",{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${r.get(k.label)}`,style:{width:`${f}%`,opacity:.8}}),e.jsxs("div",{className:"absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis",style:{width:"calc(100% - 16px)"},children:[e.jsxs("span",{className:"font-bold w-6 text-right mr-2 opacity-70",children:["#",c+1]}),k.label]})]}),e.jsx("div",{className:"ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear",style:{minWidth:Vt},children:Math.round(k.score).toLocaleString()})]},k.label)})}),e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2",children:"Score = Σ streams × e^(−0.2×Δweeks)"})]})]}),n.length>1&&e.jsx(St,{frameCount:n.length,startTs:n[0].periodTs,endTs:n[n.length-1].periodTs,currentFrameIdx:d,speedMultiplier:o,isPlaying:y,onFrameChange:s,onSpeedChange:u,onPlayPause:S})]}):null}function Ia({year:t}){const[a,n]=p.useState("artists"),{data:r,isLoading:l}=G({query:La(t,a),year:t}),i=r??[],d=Qt(r,a),y=l&&i.length===0;return e.jsx(V,{title:"Top 10 Billboard",emoji:"🏆",className:"md:col-span-2 lg:col-span-3",isLoading:y,question:"Who stayed in the charts the longest week after week?",headerActions:e.jsx(ot,{value:a,onChange:n}),children:i.length===0?e.jsx(Z,{}):e.jsx("div",{className:"transition-opacity duration-150",style:{opacity:l?.4:1},children:e.jsx(Fa,{data:i,entityType:d})})})}function Pa(t){const a=W(t,"year(session_start::date)");return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${ee}
        WHERE ${a}
        ORDER BY session_start
    `}const Ut=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function Ba(t,a=!1){const n="#7c3aed",r={background:"transparent",color:a?"#e5e7eb":"#1f2937"},l=Q({title:"Session duration distribution",width:600,height:220,style:r,x:{label:"Duration (min)",nice:!0},y:{label:"Sessions",grid:!0},color:{range:["#ede9fe",n]},marks:[be(t,{...ke({y:"count",fill:"count"},{x:u=>u.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),Ft([0])]}),i=Q({title:"Sessions over time",width:600,height:260,style:r,x:{label:"Date",type:"time",nice:!0},y:{label:"Start hour",domain:[0,23],tickFormat:u=>`${u}h`},r:{range:[2,20]},marks:[lt(t,{x:u=>new Date(u.session_start),y:u=>u.start_hour,r:u=>u.duration_ms/6e4,fill:n,fillOpacity:.6,tip:!0})]}),d=t.reduce((u,S)=>(u[S.day_of_week]++,u),[0,0,0,0,0,0,0]),y=Ut.map((u,S)=>({day:u,count:d[S]})),o=Q({title:"Sessions by day of week",width:400,height:200,style:r,x:{label:"Day",domain:Ut},y:{label:"Sessions",grid:!0},marks:[we(y,{x:"day",y:"count",fill:n,tip:!0}),Ft([0])]}),s=document.createElement("div");return s.className="space-y-4 p-4",s.append(l,i,o),s}function qa({query:t,buildPlot:a}){const[n,r]=p.useState(),{effectiveTheme:l}=p.useContext(ae),i=p.useRef(null);return p.useEffect(()=>{(async()=>{const y=await K(t);r(y)})()},[t]),p.useEffect(()=>{if(!n)return;const d=a(n,l==="dark");return i.current&&i.current.replaceChildren(d),()=>{d.remove()}},[n,a,l]),e.jsx("div",{ref:i,className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in"})}function Ya({year:t}){const a=p.useCallback((n,r)=>Ba(n,r),[]);return e.jsxs("div",{children:[e.jsx("p",{className:"text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2",children:"How have my listening sessions evolved over time?"}),e.jsx(qa,{query:Pa(t),buildPlot:a})]})}function Ha(){const[t,a]=p.useState(2006),[n,r]=p.useState(),l=ne(t,250),i=p.useCallback(async()=>{try{const o=await K(re);r(o[0]||void 0)}catch{}},[]);p.useEffect(()=>{i()},[i]),p.useEffect(()=>(window.addEventListener(Lt,i),()=>window.removeEventListener(Lt,i)),[i]),p.useEffect(()=>{n&&a(new Date(Number(n.max_datetime)).getFullYear())},[n]);const d=n?new Date(Number(n.max_datetime)).getFullYear():void 0,y=l===void 0||d!==void 0&&l===d;return e.jsxs(e.Fragment,{children:[n&&e.jsxs(e.Fragment,{children:[e.jsx(se,{value:t,onChange:a,min:new Date(Number(n.min_datetime)).getFullYear(),max:new Date(Number(n.max_datetime)).getFullYear()}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(Ce,{year:l}),e.jsx(Pe,{year:l}),e.jsx(He,{year:l}),e.jsx(Da,{year:l}),e.jsx(Ke,{year:l,isLatestYear:y}),e.jsx(ba,{year:l})]})]}),e.jsxs("section",{className:"p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg",children:[e.jsxs("div",{className:"relative mb-12",children:[e.jsx("div",{className:"border-t border-gray-300"}),e.jsx("span",{className:"absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border",children:"🚧 Work in Progress"})]}),e.jsx("p",{className:"mb-4 text-gray-900 dark:text-gray-100",children:"Experimental section: the graphs below are currently under development and may contain errors."}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(oa,{}),e.jsx(pa,{}),e.jsx(da,{}),e.jsx(Ia,{year:l}),e.jsx(Ya,{year:l})]})]})]})}export{Ha as LabView};
