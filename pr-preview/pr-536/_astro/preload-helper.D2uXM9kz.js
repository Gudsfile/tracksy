import{t as e}from"./react.CD6hyuMb.js";import{a as t,c as n,i as r,l as i,n as a,o,r as s,s as c,t as l}from"./InsightCard.C7QBFosX.js";import{rt as u}from"./getDB.CWPj6BJq.js";import{i as d,n as f,o as p}from"./constants.th95jnuK.js";var m=`with artist_streams as (
    select
        artist_name as artist,
        count(*) as stream_count
    from \${table}
    where
        artist_name is not null
        and \${year_condition}
    group by artist_name
),

ranked_artists as (
    select
        artist,
        stream_count,
        row_number() over (order by stream_count desc) as rank
    from artist_streams
),

totals as (
    select
        sum(stream_count) as total,
        sum(stream_count) filter (where rank <= 5) as top5,
        sum(stream_count) filter (where rank <= 10) as top10,
        sum(stream_count) filter (where rank <= 20) as top20
    from ranked_artists
)

select
    coalesce(top5::double / nullif(total, 0) * 100, 0) as top5_pct,
    coalesce(top10::double / nullif(total, 0) * 100, 0) as top10_pct,
    coalesce(top20::double / nullif(total, 0) * 100, 0) as top20_pct
from totals
`;function ee(e){let t=o(e);return m.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var h=u(),g=({pct:e,color:t,height:n=`h-2`})=>{let r=Math.min(Math.max(e,0),100);return(0,h.jsx)(`div`,{className:`w-full bg-gray-200 dark:bg-slate-700/50 rounded-full overflow-hidden mb-1.5`,children:(0,h.jsx)(`div`,{className:`${t} ${n} rounded-full`,style:{width:`${r}%`}})})},_=({label:e,value:t,valueColor:n,pct:r,barColor:i})=>(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`div`,{className:`flex justify-between text-xs font-medium mb-1.5`,children:[(0,h.jsx)(`span`,{children:e}),(0,h.jsx)(`span`,{className:n,children:t})]}),(0,h.jsx)(g,{pct:r,color:i})]}),v=({data:e,isLoading:n})=>(0,h.jsx)(t,{title:`Focus Mode`,emoji:`🎯`,isLoading:n,question:`Is my listening concentrated on just a few artists?`,children:e?.top5_pct?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400 mb-4`,children:`Share of listening time for your top artists`}),(0,h.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:[{label:`Top 5`,value:e.top5_pct},{label:`Top 10`,value:e.top10_pct},{label:`Top 20`,value:e.top20_pct}].map(e=>(0,h.jsx)(`li`,{role:`listitem`,children:(0,h.jsx)(_,{label:e.label,value:`${e.value.toFixed(1)}%`,valueColor:`text-brand-blue`,pct:e.value,barColor:`bg-brand-blue`})},e.label))})]}):(0,h.jsx)(r,{})});function y({year:e}){let{data:t,isLoading:r}=n({query:ee(e),year:e});return(0,h.jsx)(v,{data:t,isLoading:r})}var te=`select
    count(*) filter (
        where hour(ts::timestamp) >= 6 and hour(ts::timestamp) < 12
    )::double as morning,
    count(*) filter (
        where hour(ts::timestamp) >= 12 and hour(ts::timestamp) < 18
    )::double as afternoon,
    count(*) filter (
        where hour(ts::timestamp) >= 18 and hour(ts::timestamp) < 22
    )::double as evening,
    count(*) filter (
        where hour(ts::timestamp) >= 22 or hour(ts::timestamp) < 6
    )::double as night,
    count(*)::double as total
from \${table}
where \${year_condition}
`;function ne(e){let t=o(e);return te.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var b=({label:e,sublabel:t,emoji:n,labelColor:r})=>(0,h.jsxs)(`div`,{className:`flex items-center justify-between mb-4`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`div`,{className:`text-2xl font-bold ${r}`,children:e}),t&&(0,h.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:t})]}),n&&(0,h.jsx)(`div`,{className:`text-4xl`,children:n})]}),re=({data:e,isLoading:n})=>{let i=e?[{label:`Morning`,value:e.morning,emoji:`🥣`,time:`6‑11h`},{label:`Afternoon`,value:e.afternoon,emoji:`🧃`,time:`12‑17h`},{label:`Evening`,value:e.evening,emoji:`🫒`,time:`18‑21h`},{label:`Night`,value:e.night,emoji:`🫐`,time:`22‑5h`}]:[],a=e?.total??0,o=e=>a?e/a*100:0,s=i.length?i.reduce((e,t)=>e.value>t.value?e:t):null;return(0,h.jsx)(t,{title:`Daily Vibes`,emoji:`⏰`,isLoading:n,question:`What time of day do I listen the most?`,children:e?.total?(0,h.jsxs)(h.Fragment,{children:[s&&(0,h.jsx)(b,{label:s.label,sublabel:`${s.value?.toLocaleString()} streams`,emoji:s.emoji}),(0,h.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:i.map(e=>(0,h.jsx)(`li`,{role:`listitem`,children:(0,h.jsx)(_,{label:`${e.label} (${e.time})`,value:`${o(e.value).toFixed(1)}%`,pct:o(e.value),barColor:`bg-brand-purple`})},e.label))})]}):(0,h.jsx)(r,{})})};function ie({year:e}){let{data:t,isLoading:r}=n({query:ne(e),year:e});return(0,h.jsx)(re,{data:t,isLoading:r})}var ae=`with
max_date as (
    select min(ts) as max_date
    from (
        select max(ts::date) as ts
        from \${table}
        union
        (select '\${ year}-12-31'::date as ts)
    )
),

selected_tracks as (
    select *
    from \${table}
    where \${year_condition}
),

date_range as (
    select count(*) as total_days
    from
        generate_series(
            '\${ year}-01-01'::date,
            (select max_date from max_date),
            interval 1 day
        ) as t (d)
),

listening_days_count as (
    select count(distinct ts::date) as days_with_streams
    from selected_tracks
),

listening_days as (
    (select distinct ts::date as stream_date from selected_tracks)
    union
    (select '\${ year}-01-01'::date - 1 as stream_date)
    union
    (select max_date + 1 as stream_date from max_date)
),

gaps as (
    select
        date_diff(
            'day',
            lag(stream_date) over (order by stream_date),
            stream_date
        ) - 1 as gap
    from listening_days
),

max_gap as (
    select max(gap) as longest_pause_days
    from gaps
)

select
    listening_days_count.days_with_streams::double as days_with_streams,
    date_range.total_days::double as total_days,
    coalesce(max_gap.longest_pause_days, 0)::double as longest_pause_days
from listening_days_count, date_range, max_gap
`;function oe(e){let t=o(e),n=ae.replaceAll("${table}",p).replaceAll("${year_condition}",t);return n=e===void 0?n.replaceAll("'${ year}-12-31'::date",`(select max(ts::date) from ${p})`).replaceAll("'${ year}-01-01'::date",`(select min(ts::date) from ${p})`):n.replaceAll("${ year}",String(e)),n}function se(e){return e>=80?{label:`Constant`,color:`text-green-600 dark:text-green-400`,strokeColor:`stroke-green-500`,emoji:`🔥`}:e>=40?{label:`Regular`,color:`text-yellow-600 dark:text-yellow-400`,strokeColor:`stroke-yellow-500`,emoji:`✨`}:{label:`Occasional`,color:`text-gray-600 dark:text-gray-400`,strokeColor:`stroke-gray-500`,emoji:`🌙`}}var ce=({data:e,isLoading:n})=>{let i=e?.days_with_streams??0,a=e?.total_days??1,o=e?.longest_pause_days??0,s=i/a*100,{label:c,color:l,strokeColor:u,emoji:d}=se(s),f=2*Math.PI*55,p=f-s/100*f;return(0,h.jsx)(t,{title:`Consistency Meter`,emoji:`⏳`,className:`flex flex-col h-full relative`,isLoading:n,question:`Do I listen to music regularly?`,children:e?.days_with_streams?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:c,sublabel:`${i} / ${a} days`,emoji:d}),(0,h.jsx)(`div`,{className:`flex-1 flex items-center justify-center mb-4`,children:(0,h.jsxs)(`div`,{className:`relative`,children:[(0,h.jsxs)(`svg`,{width:120,height:120,className:`transform -rotate-90`,children:[(0,h.jsx)(`circle`,{cx:120/2,cy:120/2,r:55,fill:`none`,stroke:`currentColor`,strokeWidth:10,className:`text-gray-200 dark:text-gray-700`}),(0,h.jsx)(`circle`,{cx:120/2,cy:120/2,r:55,fill:`none`,strokeWidth:10,strokeDasharray:f,strokeDashoffset:p,strokeLinecap:`round`,className:`${u} transition-all duration-500`})]}),(0,h.jsxs)(`div`,{className:`absolute inset-0 flex flex-col items-center justify-center`,children:[(0,h.jsx)(`div`,{className:`text-2xl mb-1`,children:d}),(0,h.jsxs)(`div`,{className:`text-xl font-bold ${l}`,children:[s.toFixed(0),`%`]})]})]})}),(0,h.jsxs)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:[`Longest pause:`,` `,(0,h.jsxs)(`span`,{className:`font-medium text-gray-700 dark:text-gray-300`,children:[o,`d`]})]})]}):(0,h.jsx)(r,{})})};function le({year:e}){let{data:t,isLoading:r}=n({query:oe(e),year:e});return(0,h.jsx)(ce,{data:t,isLoading:r})}var ue=`select
    sum(
        case when month(ts::date) in (12, 1, 2) then 1 else 0 end
    )::double as winter,
    sum(
        case when month(ts::date) in (3, 4, 5) then 1 else 0 end
    )::double as spring,
    sum(
        case when month(ts::date) in (6, 7, 8) then 1 else 0 end
    )::double as summer,
    sum(
        case when month(ts::date) in (9, 10, 11) then 1 else 0 end
    )::double as fall,
    count(*)::double as total
from \${table}
where \${year_condition}
`;function de(e){let t=o(e);return ue.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var x=({data:e,isLoading:n})=>{let i=e?.total??0,a=e=>i?e/i*100:0,o=[{name:`Winter`,value:e?.winter??0,color:`bg-blue-400`,emoji:`❄️`},{name:`Spring`,value:e?.spring??0,color:`bg-green-400`,emoji:`🌸`},{name:`Summer`,value:e?.summer??0,color:`bg-yellow-400`,emoji:`☀️`},{name:`Fall`,value:e?.fall??0,color:`bg-orange-400`,emoji:`🍂`}],s=o.reduce((e,t)=>e.value>t.value?e:t);return(0,h.jsx)(t,{title:`Seasonal Mood`,emoji:`🌺`,isLoading:n,question:`Which season do I listen the most?`,children:e?.total?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:s.name,sublabel:`${s.value?.toLocaleString()} streams`,emoji:s.emoji}),(0,h.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:o.map(e=>(0,h.jsx)(`li`,{role:`listitem`,children:(0,h.jsx)(_,{label:e.name,value:`${a(e.value).toFixed(1)}%`,valueColor:`text-gray-600 dark:text-gray-400`,pct:a(e.value),barColor:e.color})},e.name))})]}):(0,h.jsx)(r,{})})};function S({year:e}){let{data:t,isLoading:r}=n({query:de(e),year:e});return(0,h.jsx)(x,{data:t,isLoading:r})}var C=`select
    year(ts::date)::integer as stream_year,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from \${table}
group by year(ts::date)
order by year(ts::date)
`;function w(){return C.replaceAll("${table}",p)}var T=e(),E=({data:e,year:n,isLoading:i})=>{let[o,c]=(0,T.useState)(null),l=e?.length?Math.max(...e.map(e=>e.stream_count)):0,u=e?.find(e=>e.stream_year===n),d=e?.reduce((e,t)=>e+t.stream_count,0)??0,f=e?.reduce((e,t)=>e+t.ms_played,0)??0,p=e?.length?Math.min(...e.map(e=>e.stream_year)):0;return(0,h.jsxs)(t,{title:`Soundtrack Growth`,emoji:`📈`,className:`flex flex-col justify-between h-full`,isLoading:i,question:`How has my listening evolved over the years?`,children:[e?.length?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`div`,{className:`flex items-end gap-1 h-24 mt-4 mb-2`,onMouseLeave:()=>c(null),children:e.map(e=>(0,h.jsx)(`div`,{className:`flex-1 bg-brand-blue dark:bg-brand-blue rounded-t relative`,style:{height:`${e.stream_count/l*100}%`},onMouseEnter:t=>{let n=t.currentTarget.getBoundingClientRect();c({x:n.left+n.width/2,y:n.top,year:e.stream_year,count:e.stream_count,ms_played:e.ms_played})},children:(0,h.jsx)(`div`,{className:`absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t transition-all duration-300 ${e.stream_year===n?`bg-brand-purple`:``}`,style:{height:`100%`}})},e.stream_year))}),(0,h.jsxs)(`div`,{className:`flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1`,children:[(0,h.jsx)(`span`,{children:p}),(0,h.jsx)(`span`,{children:Math.max(...e.map(e=>e.stream_year))})]}),(0,h.jsxs)(`ul`,{className:`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700`,role:`list`,children:[(0,h.jsxs)(`li`,{className:`flex justify-between items-center`,role:`listitem`,children:[(0,h.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:`Total streams`}),(0,h.jsx)(`span`,{className:`font-bold`,children:d.toLocaleString()})]}),u&&(0,h.jsxs)(`li`,{className:`flex justify-between items-center mt-1`,role:`listitem`,children:[(0,h.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:`This year`}),(0,h.jsx)(`span`,{className:`font-bold text-brand-purple dark:text-brand-purple`,children:u.stream_count.toLocaleString()})]})]})]}):(0,h.jsx)(r,{}),o&&(0,h.jsx)(a,{x:o.x,y:o.y,title:String(o.year),rows:[`${o.count.toLocaleString()} streams`,s(o.ms_played)],secondaryRows:[`${d.toLocaleString()} total streams`,`${s(f)} total listening`]})]})};function D({year:e}){let{data:t,isLoading:n}=i({query:w(),year:e});return(0,h.jsx)(E,{data:t,year:e,isLoading:n})}var O=`with artist_first_listen as (
    select
        artist_name,
        min(year(ts::date)) as first_year
    from \${table}
    where artist_name is not null
    group by artist_name
),

streams_classified as (
    select
        artist_name as artist,
        case
            when artist_first_listen.first_year = \${year_for_new} then 'new'
            else 'old'
        end as category
    from \${table}
    inner join artist_first_listen using (artist_name)
    where
        \${year_condition}
        and artist_name is not null
)

select
    count(*) filter (where category = 'new')::double as new_artists_streams,
    count(*) filter (where category = 'old')::double as old_artists_streams,
    count(
        distinct case when category = 'new' then artist end
    )::double as new_artists_count,
    count(*)::double as total
from streams_classified
`;function k(e){let t=o(e),n=c(e);return O.replaceAll("${table}",p).replaceAll("${year_condition}",t).replaceAll("${year_for_new}",n)}function A(){return`SELECT count(distinct artist_name)::int as total_artists FROM ${p} WHERE artist_name IS NOT NULL`}var j=({data:e,isLoading:n,year:i,totalArtists:a})=>{if(i===void 0)return(0,h.jsxs)(t,{title:`Fresh vs Familiar`,emoji:`🆕`,isLoading:n,question:`Do I listen more to new or familiar artists?`,children:[(0,h.jsx)(`p`,{className:`text-sm text-gray-400 dark:text-gray-500 italic text-center py-6`,children:`Select a year to see your Fresh vs Familiar split`}),a!==void 0&&(0,h.jsxs)(l,{children:[a.toLocaleString(),` artists discovered all time`]})]});let o=e?.total?e.new_artists_streams/e.total*100:0,s=e?.total?e.old_artists_streams/e.total*100:0,c=s>o?`Comfort Listener`:s<o?`Trend Hunter`:`Balanced Taste`;return(0,h.jsx)(t,{title:`Fresh vs Familiar`,emoji:`🆕`,isLoading:n,question:`Do I listen more to new or familiar artists?`,children:e?.total?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:c}),(0,h.jsx)(`div`,{className:`flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400`,children:(0,h.jsxs)(`div`,{role:`list`,className:`flex-1 text-center contents`,children:[(0,h.jsxs)(`div`,{role:`listitem`,className:`flex-1 text-center`,children:[(0,h.jsxs)(`div`,{className:`text-2xl font-bold text-brand-purple`,children:[o.toFixed(0),`%`]}),(0,h.jsx)(`div`,{children:`Fresh`})]}),(0,h.jsx)(`div`,{className:`text-2xl`,role:`separator`,children:`|`}),(0,h.jsxs)(`div`,{role:`listitem`,className:`flex-1 text-center`,children:[(0,h.jsxs)(`div`,{className:`text-2xl font-bold text-brand-blue`,children:[s.toFixed(0),`%`]}),(0,h.jsx)(`div`,{children:`Familiar`})]})]})}),(0,h.jsxs)(`div`,{className:`w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden flex`,children:[(0,h.jsx)(`div`,{className:`bg-brand-purple h-full`,style:{width:`${o}%`}}),(0,h.jsx)(`div`,{className:`bg-brand-blue h-full`,style:{width:`${s}%`}})]}),(0,h.jsxs)(l,{children:[e.new_artists_count.toLocaleString(),` new artists discovered this year!`]})]}):(0,h.jsx)(r,{})})};function M({year:e}){let{data:t,isLoading:r}=n({query:k(e),year:e});return(0,h.jsx)(j,{data:t,isLoading:r,year:e})}function N(){let{data:e,isLoading:t}=n({query:A()});return(0,h.jsx)(j,{data:void 0,isLoading:t,year:void 0,totalArtists:e?.total_artists})}function P({year:e}){return e===void 0?(0,h.jsx)(N,{}):(0,h.jsx)(M,{year:e})}var F=`select
    count(*) filter (
        where reason_end = 'trackdone'
    )::double as complete_listens,
    count(*) filter (
        where reason_end in ('fwdbtn', 'click-row', 'clickrow')
    )::double as skipped_listens
from \${table}
where \${year_condition}
`;function I(e){let t=o(e);return F.replaceAll("${table}",p).replaceAll("${year_condition}",t)}function L(e){return e<50?{classification:`Impatient`,emoji:`🏃`,message:`You skip often!`}:e>75?{classification:`Patient`,emoji:`🧘`,message:`You savor every note!`}:{classification:`Normal`,emoji:`⚖️`,message:`You have an equilibrated listening.`}}var R=({data:e,isLoading:n})=>{let i=e?.complete_listens??0,a=e?.skipped_listens??0,o=e?i/(i+a)*100:0,{classification:s,emoji:c,message:u}=L(o);return(0,h.jsx)(t,{title:`Skip Mood`,emoji:`⏭️`,isLoading:n,question:`Do I skip tracks often?`,children:e?.complete_listens?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:s,sublabel:`${o.toFixed(1)}% are full listens`,emoji:c}),(0,h.jsx)(g,{pct:o,color:`bg-green-500`}),(0,h.jsxs)(`ul`,{className:`flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3`,role:`list`,children:[(0,h.jsxs)(`li`,{role:`listitem`,children:[`Skipped (`,a.toLocaleString(),`)`]}),(0,h.jsxs)(`li`,{role:`listitem`,children:[`Completed (`,i.toLocaleString(),`)`]})]}),(0,h.jsx)(l,{children:u})]}):(0,h.jsx)(r,{})})};function z({year:e}){let{data:t,isLoading:r}=n({query:I(e),year:e});return(0,h.jsx)(R,{data:t,isLoading:r})}var B=`with ordered_streams as (
    select
        track_uri,
        track_name,
        ts,
        lag(track_uri) over (order by ts) as prev_track
    from \${table}
    where
        track_uri is not null
        and \${year_condition}
),

repeat_groups as (
    select
        track_uri,
        track_name,
        ts,
        case when track_uri = prev_track then 0 else 1 end as is_new_group
    from ordered_streams
),

group_ids as (
    select
        *,
        sum(is_new_group) over (order by ts) as group_id
    from repeat_groups
),

group_sizes as (
    select
        group_id,
        track_uri,
        track_name,
        count(*) as repeat_count
    from group_ids
    group by group_id, track_uri, track_name
    having count(*) > 1
)

select
    count(*)::double as total_repeat_sequences,
    coalesce(max(repeat_count)::double, 0) as max_consecutive,
    coalesce(
        (
            select track_name
            from group_sizes
            order by repeat_count desc, track_name asc
            limit 1
        ),
        ''
    ) as most_repeated_track,
    coalesce(avg(repeat_count)::double, 0) as avg_repeat_length
from group_sizes
`;function V(e){let t=o(e);return B.replaceAll("${table}",p).replaceAll("${year_condition}",t)}function H(e){return e>50?{classification:`Obsessive`,emoji:`🔥`}:e<10?{classification:`Variated`,emoji:`🔀`}:{classification:`Moderate`,emoji:`🔁`}}var fe=({data:e,isLoading:n})=>{let{total_repeat_sequences:i=0,max_consecutive:a=0,most_repeated_track:o=``,avg_repeat_length:s=0}=e??{},{classification:c,emoji:l}=H(i);return(0,h.jsx)(t,{title:`Replay Style`,emoji:`🔁`,isLoading:n,question:`Do I replay the same tracks over and over?`,children:e?.total_repeat_sequences?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:c,sublabel:`${i} repeated sequences`,emoji:l}),(0,h.jsxs)(`div`,{className:`space-y-3`,children:[(0,h.jsxs)(`div`,{className:`bg-gray-200 dark:bg-slate-700/50 p-3 rounded-lg`,children:[(0,h.jsx)(`div`,{className:`text-xs text-gray-600 dark:text-gray-400 mb-1`,children:`Repeat Record`}),(0,h.jsxs)(`div`,{className:`font-medium text-brand-purple dark:text-brand-purple line-clamp-1`,children:[`"`,o,`"`]}),(0,h.jsxs)(`div`,{className:`text-sm font-bold mt-1`,children:[a,` times in a row 🎸`]})]}),(0,h.jsx)(`ul`,{className:`mb-1`,role:`list`,children:(0,h.jsxs)(`li`,{className:`flex justify-between items-center text-sm`,role:`listitem`,children:[(0,h.jsx)(`span`,{className:`text-gray-600 dark:text-gray-400`,children:`Repeat average`}),(0,h.jsxs)(`span`,{className:`font-bold`,children:[s.toFixed(1),` times`]})]})})]})]}):(0,h.jsx)(r,{})})};function pe({year:e}){let{data:t,isLoading:r}=n({query:V(e),year:e});return(0,h.jsx)(fe,{data:t,isLoading:r})}var me=`with
selected_streams as (
    select *
    from \${table}
    where \${year_condition}
),

normalized_platforms as (
    select
        case
            when
                lower(platform) like 'android%'
                and lower(platform) not like '%tv%'
                then 'Android OS'
            when
                lower(platform) like '%android_tv%'
                or lower(platform) like '%android tv%'
                then 'Android TV'
            when
                lower(platform) like '%google cast%'
                or lower(platform) like '%chromecast%'
                then 'Chromecast'
            when
                lower(platform) like 'ios%'
                or lower(platform) like '%partner ios%'
                or lower(platform) = 'iphone'
                then 'iOS'
            when
                lower(platform) like 'osx%'
                or lower(platform) like 'os x%'
                or lower(platform) = 'macintosh'
                then 'MacOS'
            when lower(platform) = 'homepod' then 'HomePod'
            when
                lower(platform) like 'sonos_%'
                or lower(platform) like '%partner sonos%'
                then 'Sonos'
            when
                lower(platform) like '%webos_tv%'
                or lower(platform) like '%webos tv%'
                then 'WebOS TV'
            when
                lower(platform) like 'webplayer%'
                or lower(platform) like 'web_player%'
                or lower(platform) like '%spotify web_player%'
                then 'WebPlayer'
            when lower(platform) like 'windows%' then 'Windows'
            else 'Others'
        end as platform
    from selected_streams
    where platform is not null
),

platform_counts as (
    select
        platform,
        count(*) as stream_count,
        count(*)::double / (
            select count(*)
            from selected_streams
            where platform is not null
        )::double * 100 as pct
    from normalized_platforms
    group by platform
),

top_platforms as (
    select
        platform,
        stream_count,
        pct,
        row_number()
            over (order by stream_count desc, platform desc)
        as stream_rank
    from platform_counts
    where platform != 'Others'
),

other_platforms as (
    select
        'Others' as platform,
        sum(stream_count) as stream_count,
        sum(pct) as pct
    from (
        select *
        from top_platforms
        where stream_rank > 3
        union all
        select
            platform,
            stream_count,
            pct,
            999 as stream_rank
        from platform_counts
        where platform = 'Others'
    )
)

select
    platform,
    stream_count::double as stream_count,
    pct
from (
    select
        platform,
        stream_count,
        pct
    from top_platforms
    where stream_rank <= 3
    union all
    select
        platform,
        stream_count,
        pct
    from other_platforms
    where stream_count > 0
)
order by
    case when platform = 'Others' then 1 else 0 end,
    stream_count desc,
    platform desc
`;function he(e){let t=o(e);return me.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var ge=({data:e,isLoading:n})=>(0,h.jsx)(t,{title:`Your Sound Machine`,emoji:`📱`,isLoading:n,question:`Which platform do I use the most for listening?`,children:e?.length?e.length===1?(0,h.jsxs)(`p`,{className:`text-sm text-gray-400 dark:text-gray-500 italic text-center py-6`,children:[`All streams are on `,e[0].platform]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:e[0].platform,sublabel:`${e[0].stream_count.toLocaleString()} streams`,labelColor:`text-brand-purple`}),(0,h.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:e.map(e=>(0,h.jsx)(`li`,{role:`listitem`,children:(0,h.jsx)(_,{label:e.platform,value:`${e.pct.toFixed(1)}%`,valueColor:`text-gray-600 dark:text-gray-400`,pct:e.pct,barColor:`bg-brand-purple`})},e.platform))})]}):(0,h.jsx)(r,{})});function _e({year:e}){let{data:t,isLoading:n}=i({query:he(e),year:e});return(0,h.jsx)(ge,{data:t,isLoading:n})}var ve=`with
daily_stats as (
    select
        dayname(ts::date) as day_name,
        count(*) as stream_count,
        coalesce(sum(ms_played), 0)::double as ms_played,
        (
            select count(*)
            from \${table}
            where \${year_condition}
        ) as total_count
    from \${table}
    where \${year_condition}
    group by dayname(ts::date)
)

select
    day_name,
    ms_played,
    stream_count::double as stream_count,
    stream_count::double / total_count * 100 as pct
from daily_stats
order by
    case day_name
        when 'Monday' then 1
        when 'Tuesday' then 2
        when 'Wednesday' then 3
        when 'Thursday' then 4
        when 'Friday' then 5
        when 'Saturday' then 6
        when 'Sunday' then 7
    end
`;function ye(e){let t=o(e);return ve.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var be={Monday:`Mon`,Tuesday:`Tue`,Wednesday:`Wed`,Thursday:`Thu`,Friday:`Fri`,Saturday:`Sat`,Sunday:`Sun`},xe=({data:e,isLoading:n})=>{let[i,o]=(0,T.useState)(null),c=e?e.reduce((e,t)=>t.pct>e.pct?t:e,e[0]):void 0,l=e?Math.max(...e.map(e=>e.pct)):0;return(0,h.jsxs)(t,{title:`Your Power Day`,emoji:`📅`,isLoading:n,question:`Which day of the week do I listen the most?`,children:[e?.length?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:c.day_name,sublabel:`${c.stream_count.toLocaleString()} streams`,labelColor:`text-orange-400`}),(0,h.jsx)(`div`,{className:`grid grid-cols-7 gap-1`,onMouseLeave:()=>o(null),children:e.map(e=>{let t=e.day_name===c.day_name,n=e.pct/l*100;return(0,h.jsxs)(`div`,{className:`flex flex-col items-center gap-1`,children:[(0,h.jsx)(`div`,{className:`text-[10px] font-medium text-gray-600 dark:text-gray-400`,children:be[e.day_name]}),(0,h.jsx)(`div`,{className:`w-full h-16 bg-gray-200 dark:bg-slate-700/50 rounded-sm flex items-end overflow-hidden`,onMouseEnter:t=>{let n=t.currentTarget.getBoundingClientRect();o({x:n.left+n.width/2,y:n.top,day_name:e.day_name,stream_count:e.stream_count,ms_played:e.ms_played})},children:(0,h.jsx)(`div`,{className:`w-full rounded-sm transition-all duration-300 ${t?`bg-orange-400`:`bg-yellow-400`}`,style:{height:`${n}%`}})}),(0,h.jsxs)(`div`,{className:`text-[9px] text-gray-600 dark:text-gray-400`,children:[e.pct.toFixed(0),`%`]})]},e.day_name)})})]}):(0,h.jsx)(r,{}),i&&(0,h.jsx)(a,{x:i.x,y:i.y,title:i.day_name,rows:[`${i.stream_count.toLocaleString()} streams`,s(i.ms_played)]})]})};function Se({year:e}){let{data:t,isLoading:n}=i({query:ye(e),year:e});return(0,h.jsx)(xe,{data:t,isLoading:n})}var Ce=`with
daily_streams as (
    select distinct ts::date as stream_date
    from \${table}
    where \${year_condition}
    order by ts::date
),

date_diffs as (
    select
        stream_date,
        date_diff(
            'day',
            lag(stream_date) over (order by stream_date),
            stream_date
        ) as day_diff
    from daily_streams
),

streak_groups as (
    select
        stream_date,
        sum(
            case when day_diff = 1 or day_diff is null then 0 else 1 end
        ) over (order by stream_date)
        as streak_id
    from date_diffs
),

streak_lengths as (
    select
        streak_id,
        count(*) as streak_length,
        min(stream_date) as start_date,
        max(stream_date) as end_date
    from streak_groups
    group by streak_id
)

select
    streak_length::integer as streak_days,
    start_date::varchar as start_date,
    end_date::varchar as end_date
from streak_lengths
order by streak_length desc
limit 1
`;function we(e){let t=o(e);return Ce.replaceAll("${table}",p).replaceAll("${year_condition}",t)}function U(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}var Te=({data:e,isLoading:n,year:i})=>(0,h.jsx)(t,{title:`On a Roll`,emoji:`🔥`,isLoading:n,question:i===void 0?`What's my longest listening run ever?`:`What's my longest listening run in ${i}?`,children:e?.streak_days?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:String(e.streak_days),sublabel:`days in a row`}),(0,h.jsxs)(l,{children:[U(e.start_date),` –`,` `,U(e.end_date)]})]}):(0,h.jsx)(r,{})});function Ee({year:e}){let{data:t,isLoading:r}=n({query:we(e),year:e});return(0,h.jsx)(Te,{data:t,isLoading:r,year:e})}var De=`select
    stream_date::varchar as stream_date,
    stream_count::double as stream_count
from \${table}
where \${year_condition}
order by stream_date
`;function Oe(e){let t=o(e,`year(stream_date)`);return De.replaceAll("${table}",f).replaceAll("${year_condition}",t)}function ke(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function Ae(e,t){let n=new Map(e.map(e=>[e.stream_date,e.stream_count])),r=new Date(t,0,1).getDay(),i=[],a=new Date(t,0,1),o=0;for(;a.getFullYear()===t;){let e=ke(a);i.push({date:e,week:Math.floor((o+r)/7),dayOfWeek:a.getDay(),stream_count:n.get(e)??0}),a.setDate(a.getDate()+1),o++}return i}var W=24,je=3,Me=[``,`Mon`,``,`Wed`,``,`Fri`,``];function Ne(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r).toLocaleDateString(void 0,{month:`short`,day:`numeric`})}var G=({data:e,year:n,isLoading:i})=>{let[o,s]=(0,T.useState)(null);if(n===void 0)return(0,h.jsx)(t,{title:`Listening activity`,emoji:`🗓️`,children:(0,h.jsx)(`p`,{className:`text-sm text-gray-400 dark:text-gray-500 italic text-center py-6`,children:`Select a year to view the calendar`})});if(!e)return(0,h.jsx)(t,{title:`Listening activity`,emoji:`🗓️`,isLoading:i,children:(0,h.jsx)(r,{})});let c=Ae(e,n),l=Math.max(1,...c.map(e=>e.stream_count)),u=c.length>0?c[c.length-1].week+1:53,d=c.reduce((e,t)=>{let n=e.get(t.week)??[];return n.push(t),e.set(t.week,n),e},new Map),f=Array.from({length:u},(e,t)=>{let n=Array(7).fill(null);return d.get(t)?.forEach(e=>{n[e.dayOfWeek]=e}),n}),p=(e,t)=>{let n=e.currentTarget.getBoundingClientRect();s({cell:t,x:n.left+n.width/2,y:n.top})},m=W+u*13;return(0,h.jsxs)(t,{title:`Listening activity`,emoji:`🗓️`,isLoading:i,children:[e&&(0,h.jsx)(`div`,{className:`overflow-x-auto`,children:(0,h.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`${W}px repeat(${u}, 1fr)`,gridTemplateRows:`repeat(7, auto)`,gap:`${je}px`,minWidth:`${m}px`},onMouseLeave:()=>s(null),children:[Me.map((e,t)=>(0,h.jsx)(`div`,{style:{gridColumn:1,gridRow:t+1},className:`text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600`,children:e},`label-${t}`)),f.flatMap((e,t)=>e.map((e,n)=>e===null?(0,h.jsx)(`div`,{style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`}},`${t}-${n}`):(0,h.jsx)(`div`,{style:{gridColumn:t+2,gridRow:n+1,aspectRatio:`1`,...e.stream_count>0&&{backgroundColor:`rgba(124, 58, 237, ${Math.max(.15,e.stream_count/l)})`}},className:`rounded-xs ${e.stream_count===0?`bg-gray-100 dark:bg-slate-700/50`:``}`,onMouseEnter:t=>p(t,e)},`${t}-${n}`)))]})}),o&&(0,h.jsx)(a,{x:o.x,y:o.y,title:Ne(o.cell.date),rows:[`${o.cell.stream_count} streams`]})]})};function Pe({year:e}){let{data:t,isLoading:n}=i({query:Oe(e),year:e});return(0,h.jsx)(G,{data:t,year:e,isLoading:n})}function Fe({year:e}){return e===void 0?(0,h.jsx)(G,{data:void 0,year:void 0}):(0,h.jsx)(Pe,{year:e})}var Ie=`select
    play_hour::int as play_hour,
    coalesce(count_streams, 0)::double as count_streams,
    coalesce(ms_played, 0)::double as ms_played
from (select unnest(range(24)) as play_hour)
left join (
    select
        hour(ts::datetime) as play_hour,
        count(*) as count_streams,
        sum(ms_played) as ms_played
    from \${table}
    where \${year_condition}
    group by hour(ts::datetime)
) using (play_hour)
order by play_hour
`;function Le(e){let t=o(e);return Ie.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var Re=[`🕛`,`🕐`,`🕑`,`🕒`,`🕓`,`🕔`,`🕕`,`🕖`,`🕗`,`🕘`,`🕙`,`🕚`];function ze(e){return Re[e%12]}var K=150,q=150,J=110,Y=4,Be=new Set([0,3,6,9,12,15,18,21]);function Ve(e,t,n,r){let i=e/24*2*Math.PI-Math.PI/2,a=(e+1)/24*2*Math.PI-Math.PI/2,o=n+t*Math.cos(i),s=r+t*Math.sin(i),c=n+t*Math.cos(a),l=r+t*Math.sin(a);return`M ${n} ${r} L ${o} ${s} A ${t} ${t} 0 ${+(a-i>Math.PI)} 1 ${c} ${l} Z`}function He(e,t,n,r){let i=(e+.5)/24*2*Math.PI-Math.PI/2;return{x:n+t*Math.cos(i),y:r+t*Math.sin(i)}}var Ue=({data:e,maxHourlyCount:n,isLoading:i})=>{let[o,c]=(0,T.useState)(null),l=n??(e?Math.max(...e.map(e=>e.count_streams),Y):1),u=e&&e.length>0?e.reduce((e,t)=>t.count_streams>e.count_streams?t:e):void 0,d=u?.play_hour??-1;return(0,h.jsxs)(t,{title:`Around the Clock`,emoji:u?ze(u.play_hour):`🕐`,isLoading:i,question:`When do you listen to music?`,className:`h-full w-full`,children:[e?(0,h.jsxs)(h.Fragment,{children:[u&&(0,h.jsx)(b,{label:`${String(u.play_hour).padStart(2,`0`)}h`,sublabel:`${u.count_streams.toLocaleString()} streams`,labelColor:`text-teal-600`}),(0,h.jsxs)(`svg`,{viewBox:`0 0 300 300`,className:`w-full h-auto`,onMouseLeave:()=>c(null),children:[[.25,.5,.75,1].map(e=>(0,h.jsx)(`circle`,{cx:K,cy:q,r:J*e,fill:`none`,className:`stroke-gray-200 dark:stroke-slate-600`,strokeWidth:.5},e)),e.map(e=>{let t=e.count_streams>0?Math.max(Y,e.count_streams/l*J):0;if(t===0)return null;let n=o?.hour===e.play_hour,r=e.play_hour===d;return(0,h.jsx)(`path`,{d:Ve(e.play_hour,t,K,q),className:n?`fill-teal-300 stroke-white dark:stroke-slate-900`:r?`fill-teal-600 stroke-white dark:stroke-slate-900`:`fill-teal-400 stroke-white dark:stroke-slate-900`,strokeWidth:.75,onMouseEnter:n=>{let r=n.currentTarget.closest(`svg`).getBoundingClientRect(),i=(e.play_hour+.5)/24*2*Math.PI-Math.PI/2,a=t/2,o=r.width,s=r.height;c({x:r.left+(K+a*Math.cos(i))*(o/300),y:r.top+(q+a*Math.sin(i))*(s/300),hour:e.play_hour,count:e.count_streams,ms:e.ms_played})}},e.play_hour)}),Array.from({length:24},(e,t)=>{let n=He(t,126,K,q);return Be.has(t)?(0,h.jsx)(`text`,{x:n.x,y:n.y,textAnchor:`middle`,dominantBaseline:`central`,fontSize:9,fontWeight:500,className:`fill-gray-900 dark:fill-gray-100`,children:String(t).padStart(2,`0`)},t):(0,h.jsx)(`circle`,{cx:n.x,cy:n.y,r:1.5,className:`fill-gray-400 dark:fill-gray-500`},t)})]})]}):(0,h.jsx)(r,{}),o&&(0,h.jsx)(a,{x:o.x,y:o.y,title:`${String(o.hour).padStart(2,`0`)}h`,rows:[`${o.count} streams`,s(o.ms)]})]})};function We({year:e,maxHourlyCount:t}){let{data:n,isLoading:r}=i({query:Le(e),year:e});return(0,h.jsx)(Ue,{data:n,maxHourlyCount:t,isLoading:r})}var Ge=`select
    count(*)::double as session_count,
    max(duration_ms)::double as longest_session_ms,
    max(track_count)::double as longest_session_track_count,
    mode(hour(session_start::timestamp))::integer as peak_start_hour,
    avg(duration_ms) as avg_duration_ms,
    median(track_count) as median_tracks,
    max_by(session_start, duration_ms) as longest_session_date
from \${table}
where \${year_condition}
`;function Ke(e){let t=o(e,`year(session_start::date)`);return Ge.replaceAll("${table}",d).replaceAll("${year_condition}",t)}function qe(e){return e<12e5?{label:`Express`,emoji:`🏃`,color:`text-green-400`}:e<36e5?{label:`Balanced`,emoji:`🎧`,color:`text-blue-400`}:{label:`Marathon`,emoji:`🏔️`,color:`text-purple-400`}}var Je=({data:e,isLoading:n})=>{let i=e?qe(e.avg_duration_ms):null;return(0,h.jsx)(t,{title:`Listening sessions`,emoji:`🎛️`,isLoading:n,question:`How are my listening sessions structured?`,className:`h-full`,children:e?.session_count?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(b,{label:i.label,sublabel:`${e.session_count.toLocaleString()} sessions`,emoji:i.emoji,labelColor:i.color}),(0,h.jsxs)(`div`,{className:`space-y-3`,children:[(0,h.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 text-sm`,children:[(0,h.jsxs)(`div`,{className:`text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg`,children:[(0,h.jsx)(`div`,{className:`font-semibold text-gray-800 dark:text-gray-200`,children:s(Math.round(e.avg_duration_ms))}),(0,h.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-gray-400`,children:`average duration`})]}),(0,h.jsxs)(`div`,{className:`text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg`,children:[(0,h.jsxs)(`div`,{className:`font-semibold text-gray-800 dark:text-gray-200`,children:[Math.round(e.median_tracks),` tracks`]}),(0,h.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-gray-400`,children:`median per session`})]})]}),(0,h.jsxs)(l,{children:[`Longest:`,` `,s(Math.round(e.longest_session_ms)),` `,`— `,e.longest_session_track_count,` tracks on`,` `,new Date(e.longest_session_date).toLocaleDateString()]}),(0,h.jsxs)(l,{children:[`Favorite start time:`,` `,String(e.peak_start_hour).padStart(2,`0`),`h`]}),(0,h.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center`,children:`A session = consecutive streams with gaps ≤ 15 min`})]})]}):(0,h.jsx)(r,{})})};function Ye({year:e}){let{data:t,isLoading:r}=n({query:Ke(e),year:e});return(0,h.jsx)(Je,{data:t,isLoading:r})}var Xe=`select
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from \${table}
where
    artist_name is not null
    and \${year_condition}
group by artist_name
order by count_streams desc
limit 5
`;function Ze(e){let t=o(e);return Xe.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var Qe=[`🥇`,`🥈`,`🥉`,`4️⃣`,`5️⃣`],X=({items:e})=>(0,h.jsx)(`ul`,{className:`space-y-2`,role:`list`,children:e.map((e,t)=>(0,h.jsxs)(`li`,{className:`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`,role:`listitem`,children:[(0,h.jsx)(`span`,{className:`text-xl flex-shrink-0`,children:Qe[t]}),(0,h.jsxs)(`div`,{className:`flex-1 min-w-0`,title:e.primary,children:[(0,h.jsx)(`div`,{className:`font-medium truncate`,children:e.primary}),e.secondary&&(0,h.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-gray-400 truncate`,children:e.secondary})]}),(0,h.jsx)(`div`,{className:`text-sm font-bold text-brand-purple dark:text-brand-purple flex-shrink-0`,children:e.score})]},`${e.primary}-${e.secondary??t}`))}),$e=(0,T.memo)(function({data:e,isLoading:n}){let i=(e??[]).map(e=>({primary:e.artist_name,secondary:s(e.ms_played).split(` `)[0],score:e.count_streams.toLocaleString()}));return(0,h.jsx)(t,{title:`Top Artists`,emoji:`🎤`,isLoading:n,children:e?.length?(0,h.jsx)(X,{items:i}):(0,h.jsx)(r,{})})});function et({year:e}){let{data:t,isLoading:n}=i({query:Ze(e),year:e});return(0,h.jsx)($e,{data:t,isLoading:n})}var tt=`select
    album_name,
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from \${table}
where
    album_name is not null
    and artist_name is not null
    and \${year_condition}
group by album_name, artist_name
order by count_streams desc
limit 5
`;function nt(e){let t=o(e);return tt.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var rt=(0,T.memo)(function({data:e,isLoading:n}){let i=(e??[]).map(e=>({primary:e.album_name,secondary:e.artist_name,score:e.count_streams.toLocaleString()}));return(0,h.jsx)(t,{title:`Top Albums`,emoji:`💿`,isLoading:n,children:e?.length?(0,h.jsx)(X,{items:i}):(0,h.jsx)(r,{})})});function Z({year:e}){let{data:t,isLoading:n}=i({query:nt(e),year:e});return(0,h.jsx)(rt,{data:t,isLoading:n})}var it=`select
    track_name,
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from \${table}
where
    track_name is not null
    and artist_name is not null
    and \${year_condition}
group by track_name, artist_name
order by count_streams desc
limit 5
`;function at(e){let t=o(e);return it.replaceAll("${table}",p).replaceAll("${year_condition}",t)}var ot=(0,T.memo)(function({data:e,isLoading:n}){let i=(e??[]).map(e=>({primary:e.track_name,secondary:e.artist_name,score:e.count_streams.toLocaleString()}));return(0,h.jsx)(t,{title:`Top Tracks`,emoji:`🎵`,isLoading:n,children:e?.length?(0,h.jsx)(X,{items:i}):(0,h.jsx)(r,{})})});function st({year:e}){let{data:t,isLoading:n}=i({query:at(e),year:e});return(0,h.jsx)(ot,{data:t,isLoading:n})}var Q=(0,T.createContext)(()=>{}),ct=()=>(0,T.useContext)(Q),lt=(function(){let e=typeof document<`u`&&document.createElement(`link`).relList;return e&&e.supports&&e.supports(`modulepreload`)?`modulepreload`:`preload`})(),ut=function(e){return`/tracksy/pr-preview/pr-536/`+e},$={},dt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=ut(t,n),t=s(t),t in $)return;$[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:lt,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};export{S as _,Z as a,b,We as c,Se as d,_e as f,D as g,P as h,st as i,Fe as l,z as m,Q as n,et as o,pe as p,ct as r,Ye as s,dt as t,Ee as u,le as v,y as x,ie as y};