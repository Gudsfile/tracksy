import{T as q,b as z,j as e,C as H,a as U,c as xt,u as Y,q as W,I as St,S as $t,d as jt,e as Tt,s as Dt,D as st,Y as Et}from"./App.BXrTOYqb.js";import{E as ft,G as Nt,f as At,C as Ct,I as bt,a as O,b as ot,c as Rt,d as K,u as Lt,M as Mt,s as lt,m as qt,p as Ft,e as It,g as Bt,h as Pt,i as Yt,j as Wt,k as Gt,t as Ot,l as G,n as Vt,o as it,q as zt,r as Ht,v as Ut,w as B,x as Z,y as P,z as tt,A as et,B as kt,R as wt,D as Qt,F as Xt,H as ct,J as Jt,S as Kt,K as Zt,L as te}from"./index.s1uaWxQ6.js";import{b as _}from"./index.CAZYztLa.js";const ee=`with spine as (
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
`,ne={year:{periodTrunc:t=>`make_date(year(${t}), 1, 1)`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 1, 1)`,step:"interval 1 year"},month:{periodTrunc:t=>`make_date(year(${t}), month(${t}), 1)`,spineStart:(t,n)=>n?`make_date(year(${t}), 1, 1)`:`make_date(year(${t}), month(${t}), 1)`,spineEnd:(t,n)=>n?`make_date(year(${t}), 12, 1)`:`make_date(year(${t}), month(${t}), 1)`,step:"interval 1 month"},week:{periodTrunc:t=>`date_trunc('week', ${t})`,spineStart:(t,n)=>n?`date_trunc('week', make_date(year(${t}), 1, 1))`:`date_trunc('week', ${t})`,spineEnd:(t,n)=>n?`date_trunc('week', make_date(year(${t}), 12, 31))`:`date_trunc('week', ${t})`,step:"interval 7 days"},day:{periodTrunc:t=>`${t}::date`,spineStart:t=>`make_date(year(${t}), 1, 1)`,spineEnd:t=>`make_date(year(${t}), 12, 31)`,step:"interval 1 day"}};function re(t,n){const a=z(t);return ae.replaceAll("${entity_column}",ft[n]).replaceAll("${table}",q).replaceAll("${year_condition}",a)}function se(t,n,a){const o=z(t),l=t!==void 0,{periodTrunc:i,spineStart:u,spineEnd:y,step:r}=ne[n],s=`(select min(ts::date) from ${q} where ${o})`,d=`(select max(ts::date) from ${q} where ${o})`;return ee.replaceAll("${spineTimeTrunc}",i("t.dt")).replaceAll("${streamTimeTrunc}",i("ts::date")).replaceAll("${entity_column}",ft[a]).replaceAll("${spineStart}",u(s,l)).replaceAll("${spineEnd}",y(d,l)).replaceAll("${step}",r).replaceAll("${table}",q).replaceAll("${year_condition}",o)}const oe=({data:t,stats:n,year:a,granularity:o,availableGranularities:l,onGranularityChange:i,entity:u,onEntityChange:y,isLoading:r})=>{const[s,d]=_.useState(null),j=n?.total_distinct??0,f=(n?.total_streams??0)>0?Math.round((n?.total_distinct??0)/(n?.total_streams??0)*100):0,T=t?.length?Math.max(...t.map(h=>h.total_count)):0,k=o!=="month"||a===void 0;return e.jsxs(H,{title:"Stream Variety",emoji:"🔀",isLoading:r,question:"How varied was my listening?",headerActions:e.jsx(K,{value:u,onChange:y}),children:[e.jsx(Nt,{value:o,available:l,onChange:i}),!t?.length||(n?.total_streams??0)===0?e.jsx(U,{message:a!==void 0?"No data for this year":"No data"}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"overflow-x-auto mt-4",children:[e.jsx("div",{className:"flex items-end gap-0.5 h-24 mb-1",style:{minWidth:`${t.length*4}px`},onMouseLeave:()=>d(null),children:t.map(h=>{const S=T>0?h.total_count/T*100:0;return e.jsxs("div",{className:"flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden",style:{height:`${S}%`},onMouseEnter:w=>{if(h.total_count===0)return;const m=w.currentTarget.getBoundingClientRect();d({x:m.left+m.width/2,y:m.top,ts:h.ts,distinct_count:h.distinct_count,repeat_count:h.repeat_count,total_count:h.total_count})},children:[e.jsx("div",{className:"bg-yellow-400",style:{flex:h.repeat_count}}),e.jsx("div",{className:"bg-orange-400",style:{flex:h.distinct_count||(h.total_count>0?1:0)}})]},h.ts)})}),e.jsx("div",{className:"flex gap-0.5 mb-4",style:{minWidth:`${t.length*4}px`},children:t.map((h,S)=>{const w=At(h.ts,t[S-1]?.ts,a,o);return e.jsx("div",{className:`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${k?"overflow-visible whitespace-nowrap":"text-center truncate"}`,children:w},h.ts)})})]}),e.jsx(Ct,{items:[{color:"bg-orange-400",label:"Distinct"},{color:"bg-yellow-400",label:"Re-listens"}]}),e.jsxs(bt,{children:[e.jsx(O,{label:`Unique ${ot[u]}s listened`,value:j.toLocaleString()}),e.jsx(O,{label:e.jsxs(e.Fragment,{children:["Variety rate",e.jsx("span",{className:"ml-1 text-xs font-normal text-gray-400 dark:text-gray-500",children:"(unique / total streams)"})]}),value:`${f}%`})]}),u!=="tracks"&&e.jsx("p",{className:"mt-2 text-xs italic text-gray-400 dark:text-gray-500",children:"Artist and album counts rely on names, not unique IDs. Two different artists or albums sharing the same name are counted as one."})]}),s&&e.jsx(xt,{x:s.x,y:s.y,title:Rt(s.ts,o),rows:[`${s.distinct_count.toLocaleString()} distinct`,`${s.repeat_count.toLocaleString()} re-listens`,`${s.total_count>0?Math.round(s.distinct_count/s.total_count*100):0}% variety`,`${s.distinct_count>0?Math.round(s.total_count/s.distinct_count):0} avg listens/${ot[u]}`]})]})};function le({year:t}){const{setGranularity:n,availableGranularities:a,effectiveGranularity:o}=Lt(t),[l,i]=_.useState("tracks"),{data:u,isLoading:y}=Y({query:se(t,o,l),year:t}),{data:r}=Y({query:re(t,l),year:t}),s=r?.[0];return e.jsx(oe,{data:u,stats:s,year:t,granularity:o,availableGranularities:a,onGranularityChange:n,entity:l,onEntityChange:i,isLoading:y})}const ie=`select distinct ts::date::text as stream_date
from \${table}
where \${year_condition}
order by stream_date
`;function ce(t){return ie.replaceAll("${table}",q).replaceAll("${year_condition}",z(t))}const dt=3,mt=24,de=10,me=Array.from({length:7},(t,n)=>n%2===0?"":new Date(Date.UTC(2025,0,5+n)).toLocaleDateString(void 0,{weekday:"short",timeZone:"UTC"}));function I(t){const[n,a,o]=t.split("-").map(Number);return new Date(n,a-1,o)}function X(t){const n=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${n}-${a}-${o}`}function ut(t,n){const a=new Date(t);return a.setDate(a.getDate()+n),a}const at=t=>t.streak>0,nt=t=>t.streak===0&&t.prevStreak>0&&t.inRange,ue=t=>at(t)||nt(t);function ye(t,n){return at(t)?`rgba(34,197,94,${Math.max(.2,t.streak/n)})`:nt(t)?"rgba(239,68,68,0.45)":t.inRange?null:"transparent"}function J(t){return new Date(t+"T00:00:00").toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function pe({data:t,year:n,isLatestYear:a,isLoading:o}){const l=_.useRef(null),[i,u]=_.useState(null),{cells:y,maxStreak:r,bestStreakEnd:s,bestStreakStart:d,currentStreak:j}=_.useMemo(()=>{if(!t||t.length===0)return{cells:[],maxStreak:0,bestStreakEnd:"",bestStreakStart:"",currentStreak:0};const m=new Set(t.map(c=>c.stream_date)),b=[...m].sort(),v=b[0],g=b[b.length-1],p=n!==void 0?`${n}-01-01`:v,D=n!==void 0?`${n}-12-31`:g,C=[],x=I(p),N=I(D);let R=0,M=0,E="",L=0;for(;x<=N;){const c=X(x),$=R;R=m.has(c)?$+1:0;const F=n!==void 0?c>=v&&c<=g:!0;C.push({day:c,streak:R,prevStreak:$,inRange:F}),R>M&&(M=R,E=c),m.has(c)&&(L=R),x.setDate(x.getDate()+1)}let A="";return E&&M>0&&(A=X(ut(I(E),-(M-1)))),{cells:C,maxStreak:M,bestStreakEnd:E,bestStreakStart:A,currentStreak:L}},[t,n]),{weeks:f,monthLabels:T,weekCount:k}=_.useMemo(()=>{if(y.length===0)return{weeks:[],monthLabels:[],weekCount:0};const m=new Map(y.map(E=>[E.day,E])),b=I(y[0].day),v=I(y[y.length-1].day),g=new Date(b);g.setDate(g.getDate()-g.getDay());const p=new Date(v);p.setDate(p.getDate()+(6-p.getDay()));const C=(Math.round((p.getTime()-g.getTime())/864e5)+1)/7,x=[];for(let E=0;E<C;E++){const L=[];for(let A=0;A<7;A++){const c=X(ut(g,E*7+A));L.push(m.get(c)??null)}x.push(L)}const N=[];let R=-1,M=-1;for(let E=0;E<x.length;E++){const L=x[E].find(F=>F!==null);if(!L)continue;const A=I(L.day),c=A.getMonth(),$=A.getFullYear();if(c!==R){const F=$!==M,rt=A.toLocaleDateString(void 0,{month:"short"});N.push({weekIdx:E,label:F?`${rt} '${String($).slice(2)}`:rt}),R=c,M=$}}return{weeks:x,monthLabels:N,weekCount:C}},[y]);_.useEffect(()=>{const m=l.current;m&&(n===void 0?m.scrollLeft=m.scrollWidth:m.scrollLeft=0)},[n,y]);const h=!t||t.length===0,S=mt+k*(de+dt),w=`${mt}px repeat(${k}, 1fr)`;return e.jsxs(H,{title:"Listening Streaks",emoji:"🔥",question:"How consistent is your listening?",isLoading:o,children:[h?e.jsx(U,{}):e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:l,className:"overflow-x-auto pb-4",onMouseLeave:()=>u(null),children:e.jsxs("div",{style:{minWidth:`${S}px`},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:w,marginBottom:2},children:[e.jsx("div",{}),Array.from({length:k},(m,b)=>{const v=T.find(g=>g.weekIdx===b);return e.jsx("div",{className:"text-[9px] text-gray-400 dark:text-gray-600",children:v?.label??""},b)})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:w,gridTemplateRows:"repeat(7, auto)",gap:`${dt}px`},children:[me.map((m,b)=>e.jsx("div",{style:{gridColumn:1,gridRow:b+1},className:"text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600",children:m},`label-${b}`)),f.flatMap((m,b)=>m.map((v,g)=>{const p=v?at(v)?"streak-cell-active":nt(v)?"streak-cell-break":void 0:void 0,D=v?ye(v,r):"transparent";return e.jsx("div",{"data-testid":p,style:{gridColumn:b+2,gridRow:g+1,aspectRatio:"1",backgroundColor:D??void 0},className:`rounded-xs ${D===null?"bg-gray-100 dark:bg-slate-700/50":""}`,onMouseEnter:v&&ue(v)?C=>{const x=C.currentTarget.getBoundingClientRect();u({cell:v,x:x.left+x.width/2,y:x.top})}:void 0},`${b}-${g}`)}))]})]})}),e.jsxs(bt,{children:[e.jsx(O,{label:"Best streak",value:e.jsxs(e.Fragment,{children:[r," day",r===1?"":"s",d&&s&&e.jsxs("span",{className:"font-normal text-gray-500 dark:text-gray-400",children:[" ","·"," ",J(d)," ","–"," ",J(s)]})]})}),a&&e.jsx(O,{label:"Current streak",value:`${j} day${j===1?"":"s"}`})]})]}),i&&e.jsx(xt,{x:i.x,y:i.y,title:J(i.cell.day),rows:[i.cell.streak>0?`Day ${i.cell.streak} of streak`:"Streak broken"]})]})}function _e({year:t,isLatestYear:n}){const{data:a,isLoading:o}=Y({query:ce(t),year:t});return e.jsx(pe,{data:a,year:t,isLatestYear:n,isLoading:o})}const he=`with artist_yearly_play_counts as (
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
`;function ge(){return he.replaceAll("${table}",q)}const xe={ariaLabel:"dot",fill:"none",stroke:"currentColor",strokeWidth:1.5};function fe(t){return t.sort===void 0&&t.reverse===void 0?Ht({channel:"-r"},t):t}class be extends Mt{constructor(n,a={}){const{x:o,y:l,r:i,rotate:u,symbol:y=lt,frameAnchor:r}=a,[s,d]=it(u,0),[j,f]=qt(y),[T,k]=it(i,j==null?3:4.5);super(n,{x:{value:o,scale:"x",optional:!0},y:{value:l,scale:"y",optional:!0},r:{value:T,scale:"r",filter:Ft,optional:!0},rotate:{value:s,optional:!0},symbol:{value:j,scale:"auto",optional:!0}},fe(a),xe),this.r=k,this.rotate=d,this.symbol=f,this.frameAnchor=It(r);const{channels:h}=this,{symbol:S}=h;if(S){const{fill:w,stroke:m}=h;S.hint={fill:w?w.value===S.value?"color":"currentColor":this.fill??"currentColor",stroke:m?m.value===S.value?"color":"currentColor":this.stroke??"none"}}}render(n,a,o,l,i){const{x:u,y}=a,{x:r,y:s,r:d,rotate:j,symbol:f}=o,{r:T,rotate:k,symbol:h}=this,[S,w]=Bt(this,l),m=h===lt,b=d?void 0:T*T*Math.PI;return zt(T)&&(n=[]),Pt("svg:g",i).call(Yt,this,l,i).call(Wt,this,{x:r&&u,y:s&&y}).call(v=>v.selectAll().data(n).enter().append(m?"circle":"path").call(Gt,this).call(m?g=>{g.attr("cx",r?p=>r[p]:S).attr("cy",s?p=>s[p]:w).attr("r",d?p=>d[p]:T)}:g=>{g.attr("transform",Ot`translate(${r?p=>r[p]:S},${s?p=>s[p]:w})${j?p=>` rotate(${j[p]})`:k?` rotate(${k})`:""}`).attr("d",d&&f?p=>{const D=G();return f[p].draw(D,d[p]*d[p]*Math.PI),D}:d?p=>{const D=G();return h.draw(D,d[p]*d[p]*Math.PI),D}:f?p=>{const D=G();return f[p].draw(D,b),D}:(()=>{const p=G();return h.draw(p,b),p})())}).call(Vt,this,o)).node()}}function Q(t,{x:n,y:a,...o}={}){return o.frameAnchor===void 0&&([n,a]=Ut(n,a)),new be(t,{...o,x:n,y:a})}function ke({data:t}){const n=_.useRef(null);return _.useEffect(()=>{if(!t||t.length===0||!n.current)return;const a=[...t].sort((r,s)=>r.artist!==s.artist?r.artist.localeCompare(s.artist):r.stream_year-s.stream_year),l=[...Array.from(new Set(a.map(r=>r.artist))).map(r=>{const s=a.filter(d=>d.artist===r);return s[s.length-1]})].sort((r,s)=>r.stream_rank-s.stream_rank),i=l.filter((r,s)=>s%2===0),u=l.filter((r,s)=>s%2===1),y=B({title:"Global Top 10 Artists Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[Z(a,{x:"stream_year",y:"stream_rank",stroke:"artist",strokeWidth:2.5}),Q(a,{x:"stream_year",y:"stream_rank",fill:"artist",r:4}),P(i,{x:"stream_year",y:"stream_rank",text:"artist",fill:"artist",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),P(u,{x:"stream_year",y:"stream_rank",text:"artist",fill:"artist",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),tt(a,et({x:"stream_year",y:"stream_rank",title:r=>`${r.artist}
Rank: ${r.stream_rank}
Year: ${r.stream_year}`}))]});return n.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:n})}function we(){const[t,n]=_.useState([]);return _.useEffect(()=>{(async()=>{const o=await W(ge());n(o)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx(ke,{data:t})})}const ve=`with
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
`;function Se(){return ve.replaceAll("${table}",q)}function $e({data:t}){const n=_.useRef(null);return _.useEffect(()=>{if(!t||t.length===0||!n.current)return;const a=[...t].sort((r,s)=>r.album!==s.album?r.album.localeCompare(s.album):r.stream_year-s.stream_year),l=[...Array.from(new Set(a.map(r=>r.album))).map(r=>{const s=a.filter(d=>d.album===r);return s[s.length-1]})].sort((r,s)=>r.stream_rank-s.stream_rank),i=l.filter((r,s)=>s%2===0),u=l.filter((r,s)=>s%2===1),y=B({title:"Global Top 10 Albums Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[Z(a,{x:"stream_year",y:"stream_rank",stroke:"album",strokeWidth:2.5}),Q(a,{x:"stream_year",y:"stream_rank",fill:"album",r:4}),P(i,{x:"stream_year",y:"stream_rank",text:"album",fill:"album",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),P(u,{x:"stream_year",y:"stream_rank",text:"album",fill:"album",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),tt(a,et({x:"stream_year",y:"stream_rank",title:r=>`${r.album} - ${r.artist}
Rank: ${r.stream_rank}
Year: ${r.stream_year}
Count: ${r.play_count}`}))]});return n.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:n})}function je(){const[t,n]=_.useState([]);return _.useEffect(()=>{(async()=>{const o=await W(Se());n(o)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx($e,{data:t})})}const Te=`with track_yearly_play_counts as (
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
`;function De(){return Te.replaceAll("${table}",q)}function Ee({data:t}){const n=_.useRef(null);return _.useEffect(()=>{if(!t||t.length===0||!n.current)return;const a=[...t].sort((r,s)=>r.track!==s.track?r.track.localeCompare(s.track):r.stream_year-s.stream_year),l=[...Array.from(new Set(a.map(r=>r.track))).map(r=>{const s=a.filter(d=>d.track===r);return s[s.length-1]})].sort((r,s)=>r.stream_rank-s.stream_rank),i=l.filter((r,s)=>s%2===0),u=l.filter((r,s)=>s%2===1),y=B({title:"Global Top 10 Track Evolution",width:1200,height:700,marginLeft:60,marginRight:200,style:{background:"transparent",fontSize:"12px"},y:{label:"Rank",type:"log",reverse:!0,grid:!0},x:{label:"Year",tickFormat:"d"},color:{legend:!1},marks:[Z(a,{x:"stream_year",y:"stream_rank",stroke:"track",strokeWidth:2.5}),Q(a,{x:"stream_year",y:"stream_rank",fill:"track",r:4}),P(i,{x:"stream_year",y:"stream_rank",text:"track",fill:"track",dx:10,dy:-8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),P(u,{x:"stream_year",y:"stream_rank",text:"track",fill:"track",dx:10,dy:8,textAnchor:"start",fontSize:11,fontWeight:"bold"}),tt(a,et({x:"stream_year",y:"stream_rank",title:r=>`${r.track} - ${r.artist}
Rank: ${r.stream_rank}
Year: ${r.stream_year}
Count: ${r.play_count}`}))]});return n.current.replaceChildren(y),()=>y.remove()},[t]),e.jsx("div",{ref:n})}function Ne(){const[t,n]=_.useState([]);return _.useEffect(()=>{(async()=>{const o=await W(De());n(o)})()},[]),t.length===0?null:e.jsx("div",{className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in",children:e.jsx(Ee,{data:t})})}const Ae=`with daily_streams as (
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
`,Ce=`with daily_streams as (
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
`,Re=`with daily_streams as (
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
`,Le={artists:Ae,tracks:Ce,albums:Re};function Me(t,n="artists"){let a=Le[n].replaceAll("${table}",q);return a=t?a.replace("${yearFilter}",`AND year(ts::datetime) = ${t}`):a.replace("${yearFilter}",""),a}function vt(t,n){const a=_.useRef(t),[o,l]=_.useState(n);return _.useEffect(()=>{t!==a.current&&(a.current=t,l(n))},[t,n]),o}const V=["bg-blue-500","bg-red-500","bg-green-500","bg-yellow-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-teal-500","bg-orange-500","bg-cyan-500"],qe=120,yt=44,pt=60;function Fe({data:t,entityType:n}){const{frames:a,entityColors:o}=_.useMemo(()=>{const f=Array.from(new Set(t.map(m=>m.stream_date_ts))).sort((m,b)=>m-b),T=new Map,k=[],h=new Map;let S=0;const w=new Map;for(const m of t)w.has(m.stream_date_ts)||w.set(m.stream_date_ts,[]),w.get(m.stream_date_ts).push(m);for(const m of f){const b=w.get(m)||[];for(const g of b)T.set(g.entity_name,g.play_count),h.has(g.entity_name)||(h.set(g.entity_name,V[S%V.length]),S++);const v=Array.from(T.entries()).sort((g,p)=>p[1]-g[1]).slice(0,10);k.push({dateTs:m,top10:v.map(([g,p])=>({label:g,play_count:p})),maxScore:Math.max(1,v[0]?.[1]||1)})}return{frames:k,entityColors:h}},[t]),{containerRef:l,currentFrameIdx:i,isPlaying:u,speedMultiplier:y,onFrameChange:r,onSpeedChange:s,onPlayPause:d}=kt({frameCount:a.length,baseSpeed:qe,entityType:n}),j=a[i];return j?e.jsxs("div",{ref:l,className:"flex flex-col gap-4 w-full",children:[e.jsxs("h4",{className:"text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100",children:[new Date(j.dateTs).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"}),e.jsx("span",{className:"text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans",children:"· daily"})]}),e.jsx("div",{className:"flex justify-end",style:{paddingRight:pt},children:e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 font-mono",children:"streams"})}),e.jsx("div",{className:"relative w-full",style:{height:j.top10.length*yt},children:j.top10.map((f,T)=>{const k=f.play_count/j.maxScore*100,h=T*yt;return e.jsxs("div",{className:"absolute left-0 flex items-center w-full transition-all duration-300 ease-linear",style:{top:`${h}px`,zIndex:10-T},children:[e.jsxs("div",{className:"w-full relative h-9",children:[e.jsx("div",{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${o.get(f.label)}`,style:{width:`${k}%`,opacity:.8}}),e.jsxs("div",{className:"absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis",style:{width:"calc(100% - 16px)"},children:[e.jsxs("span",{className:"font-bold w-6 text-right mr-2 opacity-70",children:["#",T+1]}),f.label]})]}),e.jsx("div",{className:"ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear",style:{minWidth:pt},children:f.play_count.toLocaleString()})]},f.label)})}),a.length>1&&e.jsx(wt,{frameCount:a.length,startTs:a[0].dateTs,endTs:a[a.length-1].dateTs,currentFrameIdx:i,speedMultiplier:y,isPlaying:u,onFrameChange:r,onSpeedChange:s,onPlayPause:d})]}):null}function Ie({year:t}){const[n,a]=_.useState("artists"),{data:o,isLoading:l}=Y({query:Me(t,n),year:t}),i=o??[],u=vt(o,n),y=l&&i.length===0;return e.jsx(H,{title:"Top 10 Race",emoji:"🏎️",className:"md:col-span-2 lg:col-span-3",isLoading:y,question:"Who dominated my listening, and when did they rise?",headerActions:e.jsx(K,{value:n,onChange:a}),children:i.length===0?e.jsx(U,{}):e.jsx("div",{className:"transition-opacity duration-150",style:{opacity:l?.4:1},children:e.jsx(Fe,{data:i,entityType:u})})})}const Be=`select
    artist_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,Pe=`select
    count(*)::int as period_plays,
    track_name || ' — ' || artist_name as entity_name,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where track_name is not null and artist_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,Ye=`select
    album_name as entity_name,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from \${table}
where album_name is not null
\${yearFilter}
group by period_ts, entity_name
order by period_ts asc
`,We={artists:Be,tracks:Pe,albums:Ye};function Ge(t,n="artists"){let a=We[n].replaceAll("${table}",q);return a=t?a.replace("${yearFilter}",`AND year(ts::datetime) = ${t}`):a.replace("${yearFilter}",""),a}function Oe({ranking:t,activeLabels:n}){return e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3",children:"Longevity Leaderboard"}),e.jsx("div",{className:"flex flex-col gap-0.5",children:t.map((a,o)=>e.jsxs("div",{className:"flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors",children:[e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono",children:o+1}),e.jsx("span",{className:`text-sm truncate flex-1 min-w-0 ${n.has(a.label)?"font-bold text-gray-900 dark:text-white":"font-normal text-gray-500 dark:text-gray-400"}`,children:a.label}),e.jsxs("span",{className:"text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0",children:[a.periodsInTop10,"w"]}),e.jsx("span",{className:"text-xs font-mono shrink-0 w-8 text-right",children:a.rankDelta===null?e.jsx("span",{className:"text-blue-400",children:"new"}):a.rankDelta>0?e.jsxs("span",{className:"text-emerald-400",children:["↑",a.rankDelta]}):a.rankDelta<0?e.jsxs("span",{className:"text-red-400",children:["↓",Math.abs(a.rankDelta)]}):e.jsx("span",{className:"text-gray-400 opacity-40",children:"—"})})]},a.label))})]})}const Ve=240,_t=44,ht=62;function ze({data:t,entityType:n}){const{frames:a,entityColors:o,streakRecord:l}=_.useMemo(()=>{const k=[...new Set(t.map(x=>x.period_ts))].sort((x,N)=>x-N),h=Math.exp(-.2),S=new Map;for(const x of t)S.has(x.period_ts)||S.set(x.period_ts,[]),S.get(x.period_ts).push({label:x.entity_name,plays:x.period_plays});const w=new Map,m=new Map,b=new Map,v=new Map,g=new Map;let p=0;const D=[];for(const x of k){for(const[c,$]of w)w.set(c,$*h);for(const{label:c,plays:$}of S.get(x)??[])w.set(c,(w.get(c)??0)+$),g.has(c)||(g.set(c,V[p%V.length]),p++);const N=[...w.entries()].filter(([,c])=>c>.01).sort((c,$)=>$[1]-c[1]).slice(0,10),R=new Set(N.map(([c])=>c));for(const[c]of N){m.set(c,(m.get(c)??0)+1),b.set(c,(b.get(c)??0)+1);const $=b.get(c);$>(v.get(c)??0)&&v.set(c,$)}for(const[c]of w)!R.has(c)&&(b.get(c)??0)>0&&b.set(c,0);const M=N[0]?.[1]??1,E=D.length>0?D[D.length-1].ghostRanking:[],L=new Map(E.map((c,$)=>[c.label,$])),A=[...m.entries()].sort((c,$)=>$[1]-c[1]).slice(0,10).map(([c,$],F)=>({label:c,periodsInTop10:$,rankDelta:E.length===0?null:L.has(c)?L.get(c)-F:null}));D.push({periodTs:x,top10:N.map(([c,$])=>({label:c,score:$,periodsInTop10:m.get(c)??0})),maxScore:M,ghostRanking:A})}let C={label:"",weeks:0};for(const[x,N]of v)N>C.weeks&&(C={label:x,weeks:N});return{frames:D,entityColors:g,streakRecord:C}},[t]),{containerRef:i,currentFrameIdx:u,isPlaying:y,speedMultiplier:r,onFrameChange:s,onSpeedChange:d,onPlayPause:j}=kt({frameCount:a.length,baseSpeed:Ve,entityType:n}),f=a[u],T=_.useMemo(()=>new Set(f?.top10.map(k=>k.label)??[]),[f]);return f?e.jsxs("div",{ref:i,className:"flex flex-col gap-4 w-full",children:[e.jsxs("h4",{className:"text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100",children:["Week of "+new Date(f.periodTs).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"}),e.jsx("span",{className:"text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans",children:"· weekly"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4",children:[e.jsx(Oe,{ranking:f.ghostRanking,activeLabels:T}),l.weeks>0&&e.jsxs(St,{children:[e.jsx("div",{className:"text-xs text-gray-400 dark:text-gray-500 mb-0.5",children:"🔥 Longest streak"}),u>=a.length-1?e.jsxs("div",{children:[e.jsx("span",{className:"font-bold",children:l.label}),e.jsxs("span",{className:"text-xs font-normal text-gray-500 dark:text-gray-400 ml-1",children:[l.weeks," consecutive weeks"]})]}):e.jsx("div",{className:"text-xs text-gray-400 dark:text-gray-500 italic",children:"Watch till the end to find out…"})]})]}),e.jsxs("div",{className:"md:col-span-2 flex flex-col",children:[e.jsx("div",{className:"flex justify-end",style:{paddingRight:ht},children:e.jsx("span",{className:"text-xs text-gray-400 dark:text-gray-500 font-mono",children:"score"})}),e.jsx("div",{className:"relative w-full mt-4",style:{height:f.top10.length*_t},children:f.top10.map((k,h)=>{const S=k.score/f.maxScore*100,w=h*_t;return e.jsxs("div",{title:`${k.periodsInTop10} weeks in top 10`,className:"absolute left-0 flex items-center w-full transition-all duration-300 ease-linear",style:{top:`${w}px`,zIndex:10-h},children:[e.jsxs("div",{className:"w-full relative h-9",children:[e.jsx("div",{className:`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${o.get(k.label)}`,style:{width:`${S}%`,opacity:.8}}),e.jsxs("div",{className:"absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis",style:{width:"calc(100% - 16px)"},children:[e.jsxs("span",{className:"font-bold w-6 text-right mr-2 opacity-70",children:["#",h+1]}),k.label]})]}),e.jsx("div",{className:"ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear",style:{minWidth:ht},children:Math.round(k.score).toLocaleString()})]},k.label)})}),e.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2",children:"Score = Σ streams × e^(−0.2×Δweeks)"})]})]}),a.length>1&&e.jsx(wt,{frameCount:a.length,startTs:a[0].periodTs,endTs:a[a.length-1].periodTs,currentFrameIdx:u,speedMultiplier:r,isPlaying:y,onFrameChange:s,onSpeedChange:d,onPlayPause:j})]}):null}function He({year:t}){const[n,a]=_.useState("artists"),{data:o,isLoading:l}=Y({query:Ge(t,n),year:t}),i=o??[],u=vt(o,n),y=l&&i.length===0;return e.jsx(H,{title:"Top 10 Billboard",emoji:"🏆",className:"md:col-span-2 lg:col-span-3",isLoading:y,question:"Who stayed in the charts the longest week after week?",headerActions:e.jsx(K,{value:n,onChange:a}),children:i.length===0?e.jsx(U,{}):e.jsx("div",{className:"transition-opacity duration-150",style:{opacity:l?.4:1},children:e.jsx(ze,{data:i,entityType:u})})})}function Ue(t){const n=z(t,"year(session_start::date)");return`
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week,
            hour(session_start::timestamp)::INTEGER          AS start_hour
        FROM ${$t}
        WHERE ${n}
        ORDER BY session_start
    `}const gt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function Qe(t,n=!1){const a="#7c3aed",o={background:"transparent",color:n?"#e5e7eb":"#1f2937"},l=B({title:"Session duration distribution",width:600,height:220,style:o,x:{label:"Duration (min)",nice:!0},y:{label:"Sessions",grid:!0},color:{range:["#ede9fe",a]},marks:[Qt(t,{...Xt({y:"count",fill:"count"},{x:d=>d.duration_ms/6e4,thresholds:[0,10,20,40,60,90,120]}),tip:!0}),ct([0])]}),i=B({title:"Sessions over time",width:600,height:260,style:o,x:{label:"Date",type:"time",nice:!0},y:{label:"Start hour",domain:[0,23],tickFormat:d=>`${d}h`},r:{range:[2,20]},marks:[Q(t,{x:d=>new Date(d.session_start),y:d=>d.start_hour,r:d=>d.duration_ms/6e4,fill:a,fillOpacity:.6,tip:!0})]}),u=t.reduce((d,j)=>(d[j.day_of_week]++,d),[0,0,0,0,0,0,0]),y=gt.map((d,j)=>({day:d,count:u[j]})),r=B({title:"Sessions by day of week",width:400,height:200,style:o,x:{label:"Day",domain:gt},y:{label:"Sessions",grid:!0},marks:[Jt(y,{x:"day",y:"count",fill:a,tip:!0}),ct([0])]}),s=document.createElement("div");return s.className="space-y-4 p-4",s.append(l,i,r),s}function Xe({query:t,buildPlot:n}){const[a,o]=_.useState(),{effectiveTheme:l}=_.useContext(jt),i=_.useRef(null);return _.useEffect(()=>{(async()=>{const y=await W(t);o(y)})()},[t]),_.useEffect(()=>{if(!a)return;const u=n(a,l==="dark");return i.current&&i.current.replaceChildren(u),()=>{u.remove()}},[a,n,l]),e.jsx("div",{ref:i,className:"group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in"})}function Je({year:t}){const n=_.useCallback((a,o)=>Qe(a,o),[]);return e.jsxs("div",{children:[e.jsx("p",{className:"text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 mb-2",children:"How have my listening sessions evolved over time?"}),e.jsx(Xe,{query:Ue(t),buildPlot:n})]})}function ea(){const[t,n]=_.useState(2006),[a,o]=_.useState(),l=Tt(t,250),i=_.useCallback(async()=>{try{const r=await W(Dt);o(r[0]||void 0)}catch{}},[]);_.useEffect(()=>{i()},[i]),_.useEffect(()=>(window.addEventListener(st,i),()=>window.removeEventListener(st,i)),[i]),_.useEffect(()=>{a&&n(new Date(Number(a.max_datetime)).getFullYear())},[a]);const u=a?new Date(Number(a.max_datetime)).getFullYear():void 0,y=l===void 0||u!==void 0&&l===u;return e.jsxs(e.Fragment,{children:[a&&e.jsxs(e.Fragment,{children:[e.jsx(Et,{value:t,onChange:n,min:new Date(Number(a.min_datetime)).getFullYear(),max:new Date(Number(a.max_datetime)).getFullYear()}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(Kt,{year:l}),e.jsx(le,{year:l}),e.jsx(Zt,{year:l}),e.jsx(Ie,{year:l}),e.jsx(_e,{year:l,isLatestYear:y}),e.jsx(te,{year:l})]})]}),e.jsxs("section",{className:"p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg",children:[e.jsxs("div",{className:"relative mb-12",children:[e.jsx("div",{className:"border-t border-gray-300"}),e.jsx("span",{className:"absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border",children:"🚧 Work in Progress"})]}),e.jsx("p",{className:"mb-4 text-gray-900 dark:text-gray-100",children:"Experimental section: the graphs below are currently under development and may contain errors."}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(we,{}),e.jsx(Ne,{}),e.jsx(je,{}),e.jsx(He,{year:l}),e.jsx(Je,{year:l})]})]})]})}export{ea as LabView};
