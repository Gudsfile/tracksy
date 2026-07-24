const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/LabView.BOUkAiqo.js","_astro/react.DJx7QJrC.js","_astro/InsightCard.WMLvYmNe.js","_astro/getDB.CfjvM8HM.js","_astro/devBus.DRONl0Hn.js","_astro/react-dom.Bt9cPic3.js","_astro/constants.th95jnuK.js","_astro/useDebouncedValue.CdIeQSZ7.js","_astro/src.NSZrhzKy.js","_astro/ChatView.Be3zHBVs.js","_astro/preload-helper.Bc14-Gtt.js","_astro/engine.DriLWjqL.js","_astro/types.DZzuE3ID.js","_astro/askChartConfig._wPexHAh.js","_astro/QueryView.CzfpiSb0.js"])))=>i.map(i=>d[i]);
import{t as e}from"./react.DJx7QJrC.js";import{a as t,c as n,d as r,f as i,i as a,m as o,n as s,o as c,p as l,r as u,t as d,u as f}from"./InsightCard.WMLvYmNe.js";import{$ as p,A as ee,B as te,C as ne,D as re,E as m,F as ie,G as ae,H as oe,I as se,J as ce,K as le,L as ue,M as de,N as fe,O as pe,P as me,Q as he,R as ge,S as _e,T as ve,U as ye,V as be,W as xe,X as Se,Y as Ce,Z as we,_ as Te,a as h,b as Ee,c as De,d as Oe,et as ke,f as Ae,g as je,h as Me,i as Ne,j as Pe,k as Fe,l as Ie,m as Le,n as Re,nt as ze,o as Be,p as Ve,q as He,r as Ue,rt as We,s as Ge,t as g,tt as Ke,u as qe,v as Je,w as Ye,x as Xe,y as Ze,z as Qe}from"./getDB.CfjvM8HM.js";import{a as $e,i as et,n as tt,o as _,r as v,t as nt}from"./constants.th95jnuK.js";import{t as rt}from"./devBus.DRONl0Hn.js";import{a as it,i as y,n as at,o as b,r as ot,s as x,t as st}from"./useDebouncedValue.CdIeQSZ7.js";import{a as ct,c as S,i as lt,l as C,n as ut,o as dt,s as ft,t as pt,u as mt}from"./preload-helper.Bc14-Gtt.js";var w=e(),ht=`tracksy-timezone`,gt=()=>localStorage.getItem(`tracksy-timezone`)??Intl.DateTimeFormat().resolvedOptions().timeZone;function _t(e){if(!e||e.length<=0)return function(e){return!0};let t=``,n=e.filter(e=>e===e);return n.length>0&&(t=`
    switch (x) {${n.map(e=>`
        case ${vt(e)}:`).join(``)}
            return false;
    }`),e.length!==n.length&&(t=`if (x !== x) return false;\n${t}`),Function(`x`,`${t}\nreturn true;`)}function vt(e){return typeof e==`bigint`?`${p(e)}n`:p(e)}function yt(e,t){let n=Math.ceil(e)*t-1;return(n-n%64+64||64)/t}function bt(e,t=0){return e.length>=t?e.subarray(0,t):ke(new e.constructor(t),e,0)}var T=class{constructor(e,t=0,n=1){this.length=Math.ceil(t/n),this.buffer=new e(this.length),this.stride=n,this.BYTES_PER_ELEMENT=e.BYTES_PER_ELEMENT,this.ArrayType=e}get byteLength(){return Math.ceil(this.length*this.stride)*this.BYTES_PER_ELEMENT}get reservedLength(){return this.buffer.length/this.stride}get reservedByteLength(){return this.buffer.byteLength}set(e,t){return this}append(e){return this.set(this.length,e)}reserve(e){if(e>0){this.length+=e;let t=this.stride,n=this.length*t,r=this.buffer.length;n>=r&&this._resize(yt(r===0?n*1:n*2,this.BYTES_PER_ELEMENT))}return this}flush(e=this.length){e=yt(e*this.stride,this.BYTES_PER_ELEMENT);let t=bt(this.buffer,e);return this.clear(),t}clear(){return this.length=0,this.buffer=new this.ArrayType,this}_resize(e){return this.buffer=bt(this.buffer,e)}},E=class extends T{last(){return this.get(this.length-1)}get(e){return this.buffer[e]}set(e,t){return this.reserve(e-this.length+1),this.buffer[e*this.stride]=t,this}},xt=class extends E{constructor(){super(Uint8Array,0,1/8),this.numValid=0}get numInvalid(){return this.length-this.numValid}get(e){return this.buffer[e>>3]>>e%8&1}set(e,t){let{buffer:n}=this.reserve(e-this.length+1),r=e>>3,i=e%8,a=n[r]>>i&1;return t?a===0&&(n[r]|=1<<i,++this.numValid):a===1&&(n[r]&=~(1<<i),--this.numValid),this}clear(){return this.numValid=0,super.clear()}},St=class extends E{constructor(e){super(e.OffsetArrayType,1,1)}append(e){return this.set(this.length-1,e)}set(e,t){let n=this.length-1,r=this.reserve(e-n+1).buffer;return n<e++&&n>=0&&r.fill(r[n],n,e),r[e]=r[e-1]+t,this}flush(e=this.length-1){return e>this.length&&this.set(e-1,this.BYTES_PER_ELEMENT>4?BigInt(0):0),super.flush(e+1)}},D=class{static throughNode(e){throw Error(`"throughNode" not available in this environment`)}static throughDOM(e){throw Error(`"throughDOM" not available in this environment`)}constructor({type:e,nullValues:t}){this.length=0,this.finished=!1,this.type=e,this.children=[],this.nullValues=t,this.stride=he(e),this._nulls=new xt,t&&t.length>0&&(this._isValid=_t(t))}toVector(){return new Ge([this.flush()])}get ArrayType(){return this.type.ArrayType}get nullCount(){return this._nulls.numInvalid}get numChildren(){return this.children.length}get byteLength(){let e=0,{_offsets:t,_values:n,_nulls:r,_typeIds:i,children:a}=this;return t&&(e+=t.byteLength),n&&(e+=n.byteLength),r&&(e+=r.byteLength),i&&(e+=i.byteLength),a.reduce((e,t)=>e+t.byteLength,e)}get reservedLength(){return this._nulls.reservedLength}get reservedByteLength(){let e=0;return this._offsets&&(e+=this._offsets.reservedByteLength),this._values&&(e+=this._values.reservedByteLength),this._nulls&&(e+=this._nulls.reservedByteLength),this._typeIds&&(e+=this._typeIds.reservedByteLength),this.children.reduce((e,t)=>e+t.reservedByteLength,e)}get valueOffsets(){return this._offsets?this._offsets.buffer:null}get values(){return this._values?this._values.buffer:null}get nullBitmap(){return this._nulls?this._nulls.buffer:null}get typeIds(){return this._typeIds?this._typeIds.buffer:null}append(e){return this.set(this.length,e)}isValid(e){return this._isValid(e)}set(e,t){return this.setValid(e,this.isValid(t))&&this.setValue(e,t),this}setValue(e,t){this._setValue(this,e,t)}setValid(e,t){return this.length=this._nulls.set(e,+t).length,t}addChild(e,t=`${this.numChildren}`){throw Error(`Cannot append children to non-nested type "${this.type}"`)}getChildAt(e){return this.children[e]||null}flush(){let e,t,n,r,{type:i,length:a,nullCount:o,_typeIds:s,_offsets:c,_values:l,_nulls:u}=this;(t=s?.flush(a))?r=c?.flush(a):e=(r=c?.flush(a))?l?.flush(c.last()):l?.flush(a),o>0&&(n=u?.flush(a));let d=this.children.map(e=>e.flush());return this.clear(),qe({type:i,length:a,nullCount:o,children:d,child:d[0],data:e,typeIds:t,nullBitmap:n,valueOffsets:r})}finish(){this.finished=!0;for(let e of this.children)e.finish();return this}clear(){var e,t,n,r;this.length=0,(e=this._nulls)==null||e.clear(),(t=this._values)==null||t.clear(),(n=this._offsets)==null||n.clear(),(r=this._typeIds)==null||r.clear();for(let e of this.children)e.clear();return this}};D.prototype.length=1,D.prototype.stride=1,D.prototype.children=null,D.prototype.finished=!1,D.prototype.nullValues=null,D.prototype._isValid=()=>!0;var O=class extends D{constructor(e){super(e),this._values=new E(this.ArrayType,0,this.stride)}setValue(e,t){let n=this._values;return n.reserve(e-n.length+1),super.setValue(e,t)}},k=class extends D{constructor(e){super(e),this._pendingLength=0,this._offsets=new St(e.type)}setValue(e,t){let n=this._pending||=new Map,r=n.get(e);r&&(this._pendingLength-=r.length),this._pendingLength+=t instanceof Oe?t[Ae].length:t.length,n.set(e,t)}setValid(e,t){return super.setValid(e,t)?!0:((this._pending||=new Map).set(e,void 0),!1)}clear(){return this._pendingLength=0,this._pending=void 0,super.clear()}flush(){return this._flush(),super.flush()}finish(){return this._flush(),super.finish()}_flush(){let e=this._pending,t=this._pendingLength;return this._pendingLength=0,this._pending=void 0,e&&e.size>0&&this._flushPending(e,t),this}},Ct=class extends k{constructor(e){super(e),this._values=new T(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,Ke(t))}_flushPending(e,t){let n=this._offsets,r=this._values.reserve(t).buffer,i=0;for(let[t,a]of e)if(a===void 0)n.set(t,0);else{let e=a.length;r.set(a,i),n.set(t,e),i+=e}}},wt=class extends k{constructor(e){super(e),this._values=new T(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,Ke(t))}_flushPending(e,t){let n=this._offsets,r=this._values.reserve(t).buffer,i=0;for(let[t,a]of e)if(a===void 0)n.set(t,BigInt(0));else{let e=a.length;r.set(a,i),n.set(t,BigInt(e)),i+=e}}},Tt=class extends D{constructor(e){super(e),this._values=new xt}setValue(e,t){this._values.set(e,+t)}},A=class extends O{};A.prototype._setValue=Ve;var Et=class extends A{};Et.prototype._setValue=Le;var Dt=class extends A{};Dt.prototype._setValue=Me;var Ot=class extends O{};Ot.prototype._setValue=je;var kt=class extends D{constructor({type:e,nullValues:t,dictionaryHashFunction:n}){super({type:new te(e.dictionary,e.indices,e.id,e.isOrdered)}),this._nulls=null,this._dictionaryOffset=0,this._keysToIndices=Object.create(null),this.indices=L({type:this.type.indices,nullValues:t}),this.dictionary=L({type:this.type.dictionary,nullValues:null}),typeof n==`function`&&(this.valueToKey=n)}get values(){return this.indices.values}get nullCount(){return this.indices.nullCount}get nullBitmap(){return this.indices.nullBitmap}get byteLength(){return this.indices.byteLength+this.dictionary.byteLength}get reservedLength(){return this.indices.reservedLength+this.dictionary.reservedLength}get reservedByteLength(){return this.indices.reservedByteLength+this.dictionary.reservedByteLength}isValid(e){return this.indices.isValid(e)}setValid(e,t){let n=this.indices;return t=n.setValid(e,t),this.length=n.length,t}setValue(e,t){let n=this._keysToIndices,r=this.valueToKey(t),i=n[r];return i===void 0&&(n[r]=i=this._dictionaryOffset+this.dictionary.append(t).length-1),this.indices.setValue(e,i)}flush(){let e=this.type,t=this._dictionary,n=this.dictionary.toVector(),r=this.indices.flush().clone(e);return r.dictionary=t?t.concat(n):n,this.finished||(this._dictionaryOffset+=n.length),this._dictionary=r.dictionary,this.clear(),r}finish(){return this.indices.finish(),this.dictionary.finish(),this._dictionaryOffset=0,this._keysToIndices=Object.create(null),super.finish()}clear(){return this.indices.clear(),this.dictionary.clear(),super.clear()}valueToKey(e){return typeof e==`string`?e:`${e}`}},At=class extends O{};At.prototype._setValue=_e;var jt=class extends D{setValue(e,t){let[n]=this.children,r=e*this.stride;for(let e=-1,i=t.length;++e<i;)n.set(r+e,t[e])}addChild(e,t=`0`){if(this.numChildren>0)throw Error(`FixedSizeListBuilder can only have one child.`);let n=this.children.push(e);return this.type=new be(this.type.listSize,new h(t,e.type,!0)),n}},j=class extends O{setValue(e,t){this._values.set(e,t)}},Mt=class extends j{setValue(e,t){super.setValue(e,se(t))}},Nt=class extends j{},Pt=class extends j{},M=class extends O{};M.prototype._setValue=Ye;var Ft=class extends M{};Ft.prototype._setValue=ne;var It=class extends M{};It.prototype._setValue=ve;var N=class extends O{};N.prototype._setValue=Te;var Lt=class extends N{};Lt.prototype._setValue=Xe;var Rt=class extends N{};Rt.prototype._setValue=Ze;var zt=class extends N{};zt.prototype._setValue=Je;var Bt=class extends N{};Bt.prototype._setValue=Ee;var P=class extends O{setValue(e,t){this._values.set(e,t)}},Vt=class extends P{},Ht=class extends P{},Ut=class extends P{},Wt=class extends P{},Gt=class extends P{},Kt=class extends P{},qt=class extends P{},Jt=class extends P{},Yt=class extends k{constructor(e){super(e),this._offsets=new St(e.type)}addChild(e,t=`0`){if(this.numChildren>0)throw Error(`ListBuilder can only have one child.`);return this.children[this.numChildren]=e,this.type=new ae(new h(t,e.type,!0)),this.numChildren-1}_flushPending(e){let t=this._offsets,[n]=this.children;for(let[r,i]of e)if(i===void 0)t.set(r,0);else{let e=i,a=e.length,o=t.set(r,a).buffer[r];for(let t=-1;++t<a;)n.set(o+t,e[t])}}},Xt=class extends k{set(e,t){return super.set(e,t)}setValue(e,t){let n=t instanceof Map?t:new Map(Object.entries(t)),r=this._pending||=new Map,i=r.get(e);i&&(this._pendingLength-=i.size),this._pendingLength+=n.size,r.set(e,n)}addChild(e,t=`${this.numChildren}`){if(this.numChildren>0)throw Error(`ListBuilder can only have one child.`);return this.children[this.numChildren]=e,this.type=new le(new h(t,e.type,!0),this.type.keysSorted),this.numChildren-1}_flushPending(e){let t=this._offsets,[n]=this.children;for(let[r,i]of e)if(i===void 0)t.set(r,0);else{let{[r]:e,[r+1]:a}=t.set(r,i.size).buffer;for(let t of i.entries())if(n.set(e,t),++e>=a)break}}},Zt=class extends D{setValue(e,t){}setValid(e,t){return this.length=Math.max(e+1,this.length),t}},Qt=class extends D{setValue(e,t){let{children:n,type:r}=this;switch(Array.isArray(t)||t.constructor){case!0:return r.children.forEach((r,i)=>n[i].set(e,t[i]));case Map:return r.children.forEach((r,i)=>n[i].set(e,t.get(r.name)));default:return r.children.forEach((r,i)=>n[i].set(e,t[r.name]))}}setValid(e,t){return super.setValid(e,t)||this.children.forEach(n=>n.setValid(e,t)),t}addChild(e,t=`${this.numChildren}`){let n=this.children.push(e);return this.type=new ce([...this.type.children,new h(t,e.type,!0)]),n}},F=class extends O{};F.prototype._setValue=Pe;var $t=class extends F{};$t.prototype._setValue=ie;var en=class extends F{};en.prototype._setValue=fe;var tn=class extends F{};tn.prototype._setValue=de;var nn=class extends F{};nn.prototype._setValue=me;var I=class extends O{};I.prototype._setValue=m;var rn=class extends I{};rn.prototype._setValue=ee;var an=class extends I{};an.prototype._setValue=pe;var on=class extends I{};on.prototype._setValue=re;var sn=class extends I{};sn.prototype._setValue=Fe;var cn=class extends D{constructor(e){super(e),this._typeIds=new E(Int8Array,0,1),typeof e.valueToChildTypeId==`function`&&(this._valueToChildTypeId=e.valueToChildTypeId)}get typeIdToChildIndex(){return this.type.typeIdToChildIndex}append(e,t){return this.set(this.length,e,t)}set(e,t,n){return n===void 0&&(n=this._valueToChildTypeId(this,t,e)),this.setValue(e,t,n),this}setValue(e,t,n){this._typeIds.set(e,n);let r=this.type.typeIdToChildIndex[n];this.children[r]?.set(e,t)}addChild(e,t=`${this.children.length}`){let n=this.children.push(e),{type:{children:r,mode:i,typeIds:a}}=this,o=[...r,new h(t,e.type)];return this.type=new Se(i,[...a,n],o),n}_valueToChildTypeId(e,t,n){throw Error("Cannot map UnionBuilder value to child typeId. Pass the `childTypeId` as the second argument to unionBuilder.append(), or supply a `valueToChildTypeId` function as part of the UnionBuilder constructor options.")}},ln=class extends cn{},un=class extends cn{constructor(e){super(e),this._offsets=new E(Int32Array)}setValue(e,t,n){let r=this._typeIds.set(e,n).buffer[e],i=this.getChildAt(this.type.typeIdToChildIndex[r]),a=this._offsets.set(e,i.length).buffer[e];i?.set(a,t)}},dn=class extends k{constructor(e){super(e),this._values=new T(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,ze(t))}_flushPending(e,t){}};dn.prototype._flushPending=Ct.prototype._flushPending;var fn=class extends k{constructor(e){super(e),this._values=new T(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,ze(t))}_flushPending(e,t){}};fn.prototype._flushPending=wt.prototype._flushPending;var pn=new class extends ue{visitNull(){return Zt}visitBool(){return Tt}visitInt(){return P}visitInt8(){return Vt}visitInt16(){return Ht}visitInt32(){return Ut}visitInt64(){return Wt}visitUint8(){return Gt}visitUint16(){return Kt}visitUint32(){return qt}visitUint64(){return Jt}visitFloat(){return j}visitFloat16(){return Mt}visitFloat32(){return Nt}visitFloat64(){return Pt}visitUtf8(){return dn}visitLargeUtf8(){return fn}visitBinary(){return Ct}visitLargeBinary(){return wt}visitFixedSizeBinary(){return At}visitDate(){return A}visitDateDay(){return Et}visitDateMillisecond(){return Dt}visitTimestamp(){return F}visitTimestampSecond(){return $t}visitTimestampMillisecond(){return en}visitTimestampMicrosecond(){return tn}visitTimestampNanosecond(){return nn}visitTime(){return I}visitTimeSecond(){return rn}visitTimeMillisecond(){return an}visitTimeMicrosecond(){return on}visitTimeNanosecond(){return sn}visitDecimal(){return Ot}visitList(){return Yt}visitStruct(){return Qt}visitUnion(){return cn}visitDenseUnion(){return un}visitSparseUnion(){return ln}visitDictionary(){return kt}visitInterval(){return M}visitIntervalDayTime(){return Ft}visitIntervalYearMonth(){return It}visitDuration(){return N}visitDurationSecond(){return Lt}visitDurationMillisecond(){return Rt}visitDurationMicrosecond(){return zt}visitDurationNanosecond(){return Bt}visitFixedSizeList(){return jt}visitMap(){return Xt}};function L(e){let t=e.type,n=new(pn.getVisitFn(t)())(e);if(t.children&&t.children.length>0){let r=e.children||[],i={nullValues:e.nullValues},a=Array.isArray(r)?((e,t)=>r[t]||i):(({name:e})=>r[e]||i);for(let[e,r]of t.children.entries()){let{type:t}=r,i=a(r,e);n.children.push(L(Object.assign(Object.assign({},i),{type:t})))}}return n}function mn(e,t){if(e instanceof Ie||e instanceof Ge||e.type instanceof Qe||ArrayBuffer.isView(e))return De(e);let n=[...gn({type:t??R(e),nullValues:[null]})(e)],r=n.length===1?n[0]:n.reduce((e,t)=>e.concat(t));return Qe.isDictionary(r.type)?r.memoize():r}function hn(e){let t=mn(e);return new Ue(new Re(new Be(t.type.children),t.data[0]))}function R(e){if(e.length===0)return new He;let t=0,n=0,r=0,i=0,a=0,o=0,s=0,c=0;for(let l of e){if(l==null){++t;continue}switch(typeof l){case`bigint`:++o;continue;case`boolean`:++s;continue;case`number`:++i;continue;case`string`:++a;continue;case`object`:Array.isArray(l)?++n:Object.prototype.toString.call(l)===`[object Date]`?++c:++r;continue}throw TypeError(`Unable to infer Vector type from input values, explicit type declaration expected.`)}if(i+t===e.length)return new oe;if(a+t===e.length)return new te(new we,new ye);if(o+t===e.length)return new xe;if(s+t===e.length)return new ge;if(c+t===e.length)return new Ce;if(n+t===e.length){let t=e,n=R(t[t.findIndex(e=>e!=null)]);if(t.every(e=>e==null||Ne(n,R(e))))return new ae(new h(``,n,!0))}else if(r+t===e.length){let t=new Map;for(let n of e)for(let e of Object.keys(n))!t.has(e)&&n[e]!=null&&t.set(e,new h(e,R([n[e]]),!0));return new ce([...t.values()])}throw TypeError(`Unable to infer Vector type from input values, explicit type declaration expected.`)}function gn(e){let{queueingStrategy:t=`count`}=e,{highWaterMark:n=t===`bytes`?2**14:1/0}=e,r=t===`bytes`?`byteLength`:`length`;return function*(t){let i=0,a=L(e);for(let e of t)a.append(e)[r]>=n&&++i&&(yield a.toVector());(a.finish().length>0||i===0)&&(yield a.toVector())}}var _n=[[tt,`select
    ts::date as stream_date,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from \${table}
where ts is not null
group by ts::date
order by stream_date
`],[nt,`select
    artist_name,
    min(year(ts::date))::integer as first_year
from \${table}
where
    artist_name is not null
    and ts is not null
group by artist_name
`],[et,`with ordered as (
    select
        ts,
        ms_played,
        lag(ts) over (order by ts) as prev_ts
    from \${table}
    where ts is not null
),

session_starts as (
    select
        ts,
        ms_played,
        case
            when
                prev_ts is null
                or date_diff('minute', prev_ts::timestamp, ts::timestamp) > 15
                then 1
            else 0
        end as is_new_session
    from ordered
),

session_ids as (
    select
        ts,
        ms_played,
        sum(is_new_session)
            over (order by ts rows unbounded preceding)
        as session_id
    from session_starts
)

select
    session_id,
    count(*)::double as track_count,
    sum(ms_played)::double as duration_ms,
    min(ts) as session_start,
    max(ts) as session_end
from session_ids
group by session_id
having count(*) > 1
order by session_start
`],[$e,`select
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from \${table}
`]],vn=1+_n.length;async function yn(e,t=gt(),n){await e.query(`DROP VIEW IF EXISTS ${_}`),await e.query(`DROP TABLE IF EXISTS ${_}`),await e.query(`CREATE TABLE ${_} AS SELECT * EXCLUDE (ts), (ts::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${t}') AS ts FROM ${v}`),n?.(`Computing statistics…`,Math.round(1/vn*100));for(let[t,[r,i]]of _n.entries())await e.query(`DROP TABLE IF EXISTS ${r}`),await e.query(`CREATE TABLE ${r} AS\n${i.replaceAll("${table}",_)}`),n?.(`Computing statistics…`,Math.round((t+2)/vn*100))}function bn(){let[e,t]=(0,w.useState)(gt);return{timezone:e,setTimezone:async e=>{t(e),localStorage.setItem(ht,e);try{let{conn:t}=await g();await yn(t,e),r()}catch{}}}}var z=We(),xn=(0,w.createContext)({timezone:gt(),setTimezone:async()=>{}});function Sn({children:e}){let t=bn();return(0,z.jsx)(xn.Provider,{value:t,children:e})}function Cn(e){return wn(e)&&typeof e.ts==`string`&&typeof e.ms_played==`number`&&typeof e.track_name==`string`&&typeof e.artist_name==`string`&&typeof e.album_name==`string`}function wn(e){return typeof e.track_uri==`string`}function Tn(e){return e.ms_played>=3e4}var B=class{experimental=!1;validateFile(e){return this.filePattern.test(e.name)}validate(e){return e.filter(Cn)}filter(e){return e.filter(Tn)}async processFile(e){let t=performance.now(),n=await this.readFile(e),r=this.transform(n),i=this.validate(r),a=this.filter(i);return rt.emit(`stream:parsed`,{provider:this.name,recordCount:a.length,durationMs:performance.now()-t}),a}},En=`_apple_music_tmp.csv`,Dn=class extends B{name=`apple-music`;displayName=`Apple Music`;acceptedFormats=`ZIP/CSV`;filePattern=/^Apple Music Play Activity\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(En,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${En}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(En)}}transform(e){return e.filter(e=>e[`Media Type`]===`AUDIO`&&e[`Container Origin Type`]!==`STREAM_RADIO_STATION`).map(e=>{let t=e[`Event Start Timestamp`],n=t instanceof Date?t.toISOString():typeof t==`number`||typeof t==`bigint`?new Date(Number(t)).toISOString():String(t??``),r=Number(e[`Play Duration Milliseconds`])||0;return{track_uri:`apple-music:${String(e[`Song Name`]??``)}`,track_name:String(e[`Song Name`]??``),artist_name:`Unknown Artist`,album_name:e[`Album Name`]==null?`Unknown Album`:String(e[`Album Name`]),ts:n,ms_played:Math.max(0,r),platform:e[`Device Type`]==null?`Unknown Device`:String(e[`Device Type`])}})}},On=`_custom_tmp.csv`,kn=class extends B{name=`custom`;displayName=`Custom`;acceptedFormats=`CSV`;filePattern=/^tracksy-custom\.csv$/i;fileContentType=`text/csv`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(On,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${On}', header=true, all_varchar=true)`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to parse custom CSV. Check that the file has all required columns: ts, track_name, artist_name, album_name, ms_played, track_uri, platform.`,{cause:e})}finally{await n.dropFile(On)}}transform(e){return e.flatMap(e=>{let t=e.ts==null?void 0:String(e.ts),n=e.track_uri==null?void 0:String(e.track_uri);return t===void 0||n===void 0?[]:[{ts:t,track_uri:n,track_name:String(e.track_name??`Unknown Track`),artist_name:String(e.artist_name??`Unknown Artist`),album_name:String(e.album_name??`Unknown Album`),ms_played:Math.max(0,Number(e.ms_played)||0),platform:String(e.platform??`Unknown Device`)}]})}},An=`10_listeningHistory`,jn=`_deezer_tmp.xlsx`,Mn=class extends B{name=`deezer`;displayName=`Deezer`;acceptedFormats=`XLSX`;filePattern=/^deezer-data_\d+\.xlsx$/i;fileContentType=`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(jn,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_xlsx('${jn}', sheet='${An}')`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to read Deezer export: sheet "${An}" not found. Make sure the file is a valid Deezer listening history export.`,{cause:e})}finally{await n.dropFile(jn)}}transform(e){return e.map(e=>{let t=Number(e[`Listening Time`])||0,n=t>0?t*1e3:0;return{track_uri:e.ISRC,track_name:e[`Song Title`],artist_name:e.Artist,album_name:e[`Album Title`],ts:e.Date.replace(` `,`T`)+`Z`,ms_played:n,ip_addr:e[`IP Address`],platform:e[`Platform Name`]}})}},V=`_jellyfin_tmp.csv`,Nn=class extends B{name=`jellyfin`;displayName=`JellyFin`;acceptedFormats=`CSV`;filePattern=/^playback_report\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(V,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${V}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(V)}}transform(e){return e.filter(e=>e.ItemType===`Audio`).map(e=>{let t=Number(e.PlayDuration);return{track_uri:`jellyfin:${e.ItemId}`,track_name:e.ItemName,artist_name:``,album_name:``,ts:e.DateCreated instanceof Date?e.DateCreated.toISOString():typeof e.DateCreated==`number`||typeof e.DateCreated==`bigint`?new Date(Number(e.DateCreated)).toISOString():String(e.DateCreated).replace(` `,`T`)+`Z`,ms_played:t>0?t*1e3:0,platform:e.ClientName}})}},H=[new class extends B{name=`spotify`;displayName=`Spotify`;acceptedFormats=`ZIP/JSON`;filePattern=/^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i;fileContentType=`application/json`;async readFile(e){let t=await e.text(),n=JSON.parse(t);if(!Array.isArray(n))throw Error(`Expected JSON array of streaming records`);return n}transform(e){return e.map(({spotify_track_uri:e,master_metadata_track_name:t,master_metadata_album_artist_name:n,master_metadata_album_album_name:r,...i})=>({...i,track_uri:e,track_name:t,artist_name:n,album_name:r}))}},new Mn,new Dn,new kn,new Nn],Pn=H.map(e=>e.fileContentType);function Fn(e){for(let t of H)if(t.validateFile(e))return t}var In=e=>Pn.some(t=>t===e.type);function U(){return H.filter(e=>!e.experimental).map(e=>`${e.displayName} (${e.acceptedFormats})`)}var Ln=`application/zip`,Rn=e=>e.type===Ln;function zn({handleDrop:e,handleDragOver:t,handleFileUpload:n,contentTypeAccepted:r,contentTypeAcceptedMessage:i}){return(0,z.jsx)(`div`,{children:(0,z.jsxs)(`div`,{className:`flex flex-col items-center justify-center p-6 border border-2 border-dashed border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-200 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-all cursor-pointer`,onDrop:e,"aria-label":`dropzone`,onDragOver:t,children:[(0,z.jsx)(`input`,{type:`file`,className:`hidden`,id:`fileInput`,"aria-label":`upload file`,onChange:n,accept:r}),(0,z.jsxs)(`label`,{htmlFor:`fileInput`,className:`text-sm cursor-pointer text-center`,children:[`Drag and drop or click to upload your music streaming data files`,(0,z.jsx)(`br`,{}),i]})]})})}var Bn=e=>{let t=new DataTransfer;return e.forEach(e=>t.items.add(e)),t.files},Vn=Symbol(`Comlink.proxy`),Hn=Symbol(`Comlink.endpoint`),Un=Symbol(`Comlink.releaseProxy`),Wn=Symbol(`Comlink.finalizer`),W=Symbol(`Comlink.thrown`),Gn=e=>typeof e==`object`&&!!e||typeof e==`function`,Kn=new Map([[`proxy`,{canHandle:e=>Gn(e)&&e[Vn],serialize(e){let{port1:t,port2:n}=new MessageChannel;return qn(e,t),[n,[n]]},deserialize:e=>(e.start(),Yn(e))}],[`throw`,{canHandle:e=>Gn(e)&&W in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(Error(e.value.message),e.value):e.value}}]]);function qn(e,t=globalThis,n=[`*`]){t.addEventListener(`message`,(function r(i){if(!i||!i.data)return;if(!function(e,t){for(let n of e)if(t===n||n===`*`||n instanceof RegExp&&n.test(t))return!0;return!1}(n,i.origin))return void console.warn(`Invalid origin '${i.origin}' for comlink proxy`);let{id:a,type:o,path:s}=Object.assign({path:[]},i.data),c=(i.data.argumentList||[]).map(Y),l;try{let t=s.slice(0,-1).reduce(((e,t)=>e[t]),e),n=s.reduce(((e,t)=>e[t]),e);switch(o){case`GET`:l=n;break;case`SET`:t[s.slice(-1)[0]]=Y(i.data.value),l=!0;break;case`APPLY`:l=n.apply(t,c);break;case`CONSTRUCT`:l=er(new n(...c));break;case`ENDPOINT`:{let{port1:t,port2:n}=new MessageChannel;qn(e,n),l=function(e,t){return $n.set(e,t),e}(t,[t])}break;case`RELEASE`:l=void 0;break;default:return}}catch(e){l={value:e,[W]:0}}Promise.resolve(l).catch((e=>({value:e,[W]:0}))).then((n=>{let[i,s]=J(n);t.postMessage(Object.assign(Object.assign({},i),{id:a}),s),o===`RELEASE`&&(t.removeEventListener(`message`,r),Jn(t),Wn in e&&typeof e[Wn]==`function`&&e[Wn]())})).catch((e=>{let[n,r]=J({value:TypeError(`Unserializable return value`),[W]:0});t.postMessage(Object.assign(Object.assign({},n),{id:a}),r)}))})),t.start&&t.start()}function Jn(e){(function(e){return e.constructor.name===`MessagePort`})(e)&&e.close()}function Yn(e,t){return Zn(e,[],t)}function G(e){if(e)throw Error(`Proxy has been released and is not useable`)}function Xn(e){return X(e,{type:`RELEASE`}).then((()=>{Jn(e)}))}var K=new WeakMap,q=`FinalizationRegistry`in globalThis&&new FinalizationRegistry((e=>{let t=(K.get(e)||0)-1;K.set(e,t),t===0&&Xn(e)}));function Zn(e,t=[],n=function(){}){let r=!1,i=new Proxy(n,{get(n,a){if(G(r),a===Un)return()=>{(function(e){q&&q.unregister(e)})(i),Xn(e),r=!0};if(a===`then`){if(t.length===0)return{then:()=>i};let n=X(e,{type:`GET`,path:t.map((e=>e.toString()))}).then(Y);return n.then.bind(n)}return Zn(e,[...t,a])},set(n,i,a){G(r);let[o,s]=J(a);return X(e,{type:`SET`,path:[...t,i].map((e=>e.toString())),value:o},s).then(Y)},apply(n,i,a){G(r);let o=t[t.length-1];if(o===Hn)return X(e,{type:`ENDPOINT`}).then(Y);if(o===`bind`)return Zn(e,t.slice(0,-1));let[s,c]=Qn(a);return X(e,{type:`APPLY`,path:t.map((e=>e.toString())),argumentList:s},c).then(Y)},construct(n,i){G(r);let[a,o]=Qn(i);return X(e,{type:`CONSTRUCT`,path:t.map((e=>e.toString())),argumentList:a},o).then(Y)}});return function(e,t){let n=(K.get(t)||0)+1;K.set(t,n),q&&q.register(e,t,e)}(i,e),i}function Qn(e){let t=e.map(J);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}var $n=new WeakMap;function er(e){return Object.assign(e,{[Vn]:!0})}function J(e){for(let[t,n]of Kn)if(n.canHandle(e)){let[r,i]=n.serialize(e);return[{type:`HANDLER`,name:t,value:r},i]}return[{type:`RAW`,value:e},$n.get(e)||[]]}function Y(e){switch(e.type){case`HANDLER`:return Kn.get(e.name).deserialize(e.value);case`RAW`:return e.value}}function X(e,t,n){return new Promise((r=>{let i=[,,,,].fill(0).map((()=>Math.floor(Math.random()*(2**53-1)).toString(16))).join(`-`);e.addEventListener(`message`,(function t(n){n.data&&n.data.id&&n.data.id===i&&(e.removeEventListener(`message`,t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:i},t),n)}))}var Z=class{constructor(e,t,n,r,i){this._name=e,this._size=t,this._path=n,this._lastModified=r,this._archiveRef=i}get name(){return this._name}get size(){return this._size}get lastModified(){return this._lastModified}extract(){return this._archiveRef.extractSingleFile(this._path)}};function tr(e){if(e instanceof File||e instanceof Z||e===null)return e;let t={};for(let n of Object.keys(e))t[n]=tr(e[n]);return t}function nr(e,t=``){let n=[];for(let r of Object.keys(e))e[r]instanceof File||e[r]instanceof Z||e[r]===null?n.push({file:e[r]||r,path:t}):n.push(...nr(e[r],`${t}${r}/`));return n}function rr(e,t){let n=t.split(`/`);n[n.length-1]===``&&n.pop();let r=e,i=null;for(let e of n)r[e]=r[e]||{},i=r,r=r[e];return[i,n[n.length-1]]}var ir=class{constructor(e,t,n){this._content={},this._processed=0,this.file=e,this.client=t,this.worker=n}open(){return this._content={},this._processed=0,new Promise(((e,t)=>{this.client.open(this.file,er((()=>{e(this)})))}))}async close(){var e;(e=this.worker)==null||e.terminate(),this.worker=null,this.client=null,this.file=null}async hasEncryptedData(){return await this.client.hasEncryptedData()}async usePassword(e){await this.client.usePassword(e)}async setLocale(e){await this.client.setLocale(e)}async getFilesObject(){return this._processed>0?Promise.resolve().then((()=>this._content)):((await this.client.listFiles()).forEach((e=>{let[t,n]=rr(this._content,e.path);e.type===`FILE`&&(t[n]=new Z(e.fileName,e.size,e.path,e.lastModified,this))})),this._processed=1,tr(this._content))}getFilesArray(){return this.getFilesObject().then((e=>nr(e)))}async extractSingleFile(e){if(this.worker===null)throw Error(`Archive already closed`);let t=await this.client.extractSingleFile(e);return new File([t.fileData],t.fileName,{type:`application/octet-stream`,lastModified:t.lastModified/1e6})}async extractFiles(e=void 0){var t;return this._processed>1?Promise.resolve().then((()=>this._content)):((await this.client.extractFiles()).forEach((t=>{let[n,r]=rr(this._content,t.path);t.type===`FILE`&&(n[r]=new File([t.fileData],t.fileName,{type:`application/octet-stream`}),e!==void 0&&setTimeout(e.bind(null,{file:n[r],path:t.path})))})),this._processed=2,(t=this.worker)==null||t.terminate(),tr(this._content))}},ar,or;(function(e){e.SEVEN_ZIP=`7zip`,e.AR=`ar`,e.ARBSD=`arbsd`,e.ARGNU=`argnu`,e.ARSVR4=`arsvr4`,e.BIN=`bin`,e.BSDTAR=`bsdtar`,e.CD9660=`cd9660`,e.CPIO=`cpio`,e.GNUTAR=`gnutar`,e.ISO=`iso`,e.ISO9660=`iso9660`,e.MTREE=`mtree`,e.MTREE_CLASSIC=`mtree-classic`,e.NEWC=`newc`,e.ODC=`odc`,e.OLDTAR=`oldtar`,e.PAX=`pax`,e.PAXR=`paxr`,e.POSIX=`posix`,e.PWB=`pwb`,e.RAW=`raw`,e.RPAX=`rpax`,e.SHAR=`shar`,e.SHARDUMP=`shardump`,e.USTAR=`ustar`,e.V7TAR=`v7tar`,e.V7=`v7`,e.WARC=`warc`,e.XAR=`xar`,e.ZIP=`zip`})(ar||={}),function(e){e.B64ENCODE=`b64encode`,e.BZIP2=`bzip2`,e.COMPRESS=`compress`,e.GRZIP=`grzip`,e.GZIP=`gzip`,e.LRZIP=`lrzip`,e.LZ4=`lz4`,e.LZIP=`lzip`,e.LZMA=`lzma`,e.LZOP=`lzop`,e.UUENCODE=`uuencode`,e.XZ=`xz`,e.ZSTD=`zstd`,e.NONE=`none`}(or||={});var sr=class e{static init(t=null){return e._options=t||{},e._options}static async open(t){let n=e.getWorker(e._options);return await new ir(t,await e.getClient(n,e._options),n).open()}static async write({files:t,outputFileName:n,compression:r,format:i,passphrase:a=null}){let o=e.getWorker(e._options),s=await(await e.getClient(o,e._options)).writeArchive(t,r,i,a);return o.terminate(),new File([s],n,{type:`application/octet-stream`})}static getWorker(e){return e.getWorker?e.getWorker():new Worker(e.workerUrl||new URL(`/tracksy/pr-preview/pr-520/_astro/worker-bundle.Dx5mKZOL.js`,``+import.meta.url),{type:`module`})}static async getClient(e,t){let n=t.createClient?.call(t,e)||Yn(e),{promise:r,resolve:i}=Promise.withResolvers(),a=await new n(er((()=>{i()})));return await r,a}};sr._options={},Promise.withResolvers||(Promise.withResolvers=function(){var e,t,n=new this((function(n,r){e=n,t=r}));return{resolve:e,reject:t,promise:n}});var cr=`/tracksy/pr-preview/pr-520/_astro/worker-bundle.Dx5mKZOL.js`;async function lr(e){return sr.init({workerUrl:cr}),await sr.open(e)}var ur=[`__MACOSX`];function dr(e){return ur.some(t=>e.startsWith(t))}function fr(e){return e.name.toLowerCase().endsWith(`.zip`)}async function pr(e){let t=await(await lr(e)).extractFiles(),n=Object.entries(t).filter(([e])=>!dr(e)).flatMap(([,e])=>e instanceof File?[e]:Object.values(e)).filter(e=>!dr(e.name)),r=[];for(let e of n)if(fr(e)){let t=await pr(e);r.push(...t)}else r.push(e);return r}var Q={UNSUPPORTED_CONTENT_TYPE:`One or more files have an unsupported content type`,NO_FILES_IN_ARCHIVE:`No files found in the archive`,NO_VALID_RECORDS:`No valid stream records found`,NO_FILE_TO_PROCESS:`No file to process`};function mr(e){let t=e instanceof Error?e.message:``;return t===Q.UNSUPPORTED_CONTENT_TYPE?`Unsupported file type. Supported: ${U().join(`, `)}.`:t===Q.NO_FILES_IN_ARCHIVE?`The ZIP archive is empty or unreadable.`:t===Q.NO_VALID_RECORDS?`No streaming export recognized. Supported: ${U().join(`, `)}.`:t===Q.NO_FILE_TO_PROCESS?`No file received. Try again.`:`Upload failed. Check the file and try again.`}function hr({onSuccess:e,onFail:t}){let n=e=>{if(Array.from(e).filter(e=>In(e)||Rn(e)).length!==e.length)throw Error(Q.UNSUPPORTED_CONTENT_TYPE)},r=async e=>{let t=await pr(e);if(t.length===0)throw Error(Q.NO_FILES_IN_ARCHIVE);return Bn(t)};return{uploadFiles:async i=>{try{n(i),e(i.length===1&&Rn(i[0])?await r(i[0]):i)}catch(e){console.error(`Error while processing files:`,e),t(e)}}}}function gr({handleValidatedFiles:e,onFail:t=()=>{}}){let{uploadFiles:n}=hr({onSuccess:t=>e(t),onFail:t});return(0,z.jsx)(zn,{handleDrop:async e=>{e.preventDefault();let t=e.dataTransfer.files;console.debug(`Dragged in files:`,Array.from(t)),await n(t)},handleDragOver:e=>{e.preventDefault()},handleFileUpload:async e=>{let t=e.target.files;t!==null&&(console.debug(`Uploaded files:`,Array.from(t)),await n(t))},contentTypeAccepted:[...Pn,Ln].join(`,`),contentTypeAcceptedMessage:(0,z.jsxs)(z.Fragment,{children:[`Only `,(0,z.jsx)(`strong`,{children:U().join(`, `)}),` are accepted`]})})}async function _r(e,t){if(e.length<1)throw console.error(`No file to process`),Error(`No file to process`);let n=[],r=Array.from(e);for(let[e,i]of r.entries()){console.debug(`File ${i.name} is being processed.`),t?.(`Parsing records…`,Math.round(e/r.length*50));let a=Fn(i);if(!a){console.warn(`File ${i.name} does not match any known provider. Skipping.`);continue}console.debug(`File ${i.name} detected as ${a.displayName} format.`);let o=await a.processFile(i);n.push(...o)}if(t?.(`Parsing records…`,50),n.length===0)throw console.error(`No valid stream records found`),Error(`No valid stream records found`);let i=hn(n),{conn:a}=await g();t?.(`Loading into database…`,50),await a.query(`DROP TABLE IF EXISTS ${v}`),console.debug(`Table ${v} dropped.`),await a.insertArrowTable(i,{name:v,create:!0}),console.debug(`Table ${v} created with ${n.length} records.`),t?.(`Loading into database…`,70),await yn(a,void 0,(e,n)=>t?.(`Computing statistics…`,70+Math.round(n*.3))),f()}function vr({stage:e,percent:t}){return(0,z.jsxs)(`div`,{className:`w-full max-w-sm mx-auto flex flex-col gap-2`,children:[(0,z.jsx)(`p`,{className:`text-sm text-center text-gray-500 dark:text-slate-400`,children:e}),(0,z.jsx)(`div`,{className:`h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden`,children:(0,z.jsx)(`div`,{className:`h-full rounded-full bg-gradient-brand transition-all duration-300 ease-out`,style:{width:`${t}%`}})})]})}function yr({label:e,tooltip:t,handleClick:n}){return(0,z.jsx)(`button`,{type:`button`,title:t,className:`px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,onClick:n,children:(0,z.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}function br({label:e,tooltip:t}){return(0,z.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy?tab=readme-ov-file#%EF%B8%8F-download-your-data`,title:t,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,children:(0,z.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}async function xr(e,t){t?.(`Fetching demo data…`,0);let n=await fetch(e.toString());if(!n.ok)throw Error(`Failed to fetch demo data: ${n.statusText}`);let r=await n.blob(),i=e.pathname.split(`/`).pop()||`streaming_data.json`,a=new File([r],i,{type:`application/json`});t?.(`Fetching demo data…`,25);let o=Fn(a);if(!o)throw Error(`No provider found for the demo data URL`);t?.(`Parsing records…`,25);let s=await o.processFile(a);if(s.length===0)throw Error(`No valid stream records found in demo data`);t?.(`Parsing records…`,50);let c=hn(s),{conn:l}=await g();t?.(`Loading into database…`,50),await l.query(`DROP TABLE IF EXISTS ${v}`),await l.insertArrowTable(c,{name:v,create:!0}),t?.(`Loading into database…`,70),await yn(l,void 0,(e,n)=>t?.(`Computing statistics…`,70+Math.round(n*.3))),f()}function Sr(){let[e,t]=(0,w.useState)(!1),[n,r]=(0,w.useState)(null),i=(()=>{let e=`https://huggingface.co/datasets/tracksy/synthetic-datasets/resolve/main/datasets/spotify/Streaming_History_Audio_2006_25000.json`;try{return new URL(e)}catch{console.warn(`Invalid PUBLIC_DEMO_JSON_URL environment variable:`,{url:e});return}})();return{isDemoReady:e,handleDemoButtonClick:async()=>{if(t(!1),r(null),i)try{await xr(i,(e,t)=>r({stage:e,percent:t})),t(!0)}catch{t(!1)}finally{r(null)}},demoJsonUrl:i,demoProgress:n}}var Cr=`with artist_streams as (
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
`;function wr(e){let t=y(e);return Cr.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Tr=({data:e,isLoading:n})=>(0,z.jsx)(t,{title:`Focus Mode`,emoji:`🎯`,isLoading:n,question:`Is my listening concentrated on just a few artists?`,children:e?.top5_pct?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400 mb-4`,children:`Share of listening time for your top artists`}),(0,z.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:[{label:`Top 5`,value:e.top5_pct},{label:`Top 10`,value:e.top10_pct},{label:`Top 20`,value:e.top20_pct}].map(e=>(0,z.jsx)(`li`,{role:`listitem`,children:(0,z.jsx)(C,{label:e.label,value:`${e.value.toFixed(1)}%`,valueColor:`text-brand-blue`,pct:e.value,barColor:`bg-brand-blue`})},e.label))})]}):(0,z.jsx)(a,{})});function Er({year:e}){let{data:t,isLoading:n}=b({query:wr(e),year:e});return(0,z.jsx)(Tr,{data:t,isLoading:n})}var Dr=`select
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
`;function Or(e){let t=y(e);return Dr.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var kr=({data:e,isLoading:n})=>{let r=e?[{label:`Morning`,value:e.morning,emoji:`🥣`,time:`6‑11h`},{label:`Afternoon`,value:e.afternoon,emoji:`🧃`,time:`12‑17h`},{label:`Evening`,value:e.evening,emoji:`🫒`,time:`18‑21h`},{label:`Night`,value:e.night,emoji:`🫐`,time:`22‑5h`}]:[],i=e?.total??0,o=e=>i?e/i*100:0,s=r.length?r.reduce((e,t)=>e.value>t.value?e:t):null;return(0,z.jsx)(t,{title:`Daily Vibes`,emoji:`⏰`,isLoading:n,question:`What time of day do I listen the most?`,children:e?.total?(0,z.jsxs)(z.Fragment,{children:[s&&(0,z.jsx)(S,{label:s.label,sublabel:`${s.value?.toLocaleString()} streams`,emoji:s.emoji}),(0,z.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:r.map(e=>(0,z.jsx)(`li`,{role:`listitem`,children:(0,z.jsx)(C,{label:`${e.label} (${e.time})`,value:`${o(e.value).toFixed(1)}%`,pct:o(e.value),barColor:`bg-brand-purple`})},e.label))})]}):(0,z.jsx)(a,{})})};function Ar({year:e}){let{data:t,isLoading:n}=b({query:Or(e),year:e});return(0,z.jsx)(kr,{data:t,isLoading:n})}var jr=`with
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
`;function Mr(e){let t=y(e),n=jr.replaceAll("${table}",_).replaceAll("${year_condition}",t);return n=e===void 0?n.replaceAll("'${ year}-12-31'::date",`(select max(ts::date) from ${_})`).replaceAll("'${ year}-01-01'::date",`(select min(ts::date) from ${_})`):n.replaceAll("${ year}",String(e)),n}function Nr(e){return e>=80?{label:`Constant`,color:`text-green-600 dark:text-green-400`,strokeColor:`stroke-green-500`,emoji:`🔥`}:e>=40?{label:`Regular`,color:`text-yellow-600 dark:text-yellow-400`,strokeColor:`stroke-yellow-500`,emoji:`✨`}:{label:`Occasional`,color:`text-gray-600 dark:text-gray-400`,strokeColor:`stroke-gray-500`,emoji:`🌙`}}var Pr=({data:e,isLoading:n})=>{let r=e?.days_with_streams??0,i=e?.total_days??1,o=e?.longest_pause_days??0,s=r/i*100,{label:c,color:l,strokeColor:u,emoji:d}=Nr(s),f=2*Math.PI*55,p=f-s/100*f;return(0,z.jsx)(t,{title:`Consistency Meter`,emoji:`⏳`,className:`flex flex-col h-full relative`,isLoading:n,question:`Do I listen to music regularly?`,children:e?.days_with_streams?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:c,sublabel:`${r} / ${i} days`,emoji:d}),(0,z.jsx)(`div`,{className:`flex-1 flex items-center justify-center mb-4`,children:(0,z.jsxs)(`div`,{className:`relative`,children:[(0,z.jsxs)(`svg`,{width:120,height:120,className:`transform -rotate-90`,children:[(0,z.jsx)(`circle`,{cx:120/2,cy:120/2,r:55,fill:`none`,stroke:`currentColor`,strokeWidth:10,className:`text-gray-200 dark:text-gray-700`}),(0,z.jsx)(`circle`,{cx:120/2,cy:120/2,r:55,fill:`none`,strokeWidth:10,strokeDasharray:f,strokeDashoffset:p,strokeLinecap:`round`,className:`${u} transition-all duration-500`})]}),(0,z.jsxs)(`div`,{className:`absolute inset-0 flex flex-col items-center justify-center`,children:[(0,z.jsx)(`div`,{className:`text-2xl mb-1`,children:d}),(0,z.jsxs)(`div`,{className:`text-xl font-bold ${l}`,children:[s.toFixed(0),`%`]})]})]})}),(0,z.jsxs)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:[`Longest pause:`,` `,(0,z.jsxs)(`span`,{className:`font-medium text-gray-700 dark:text-gray-300`,children:[o,`d`]})]})]}):(0,z.jsx)(a,{})})};function Fr({year:e}){let{data:t,isLoading:n}=b({query:Mr(e),year:e});return(0,z.jsx)(Pr,{data:t,isLoading:n})}var Ir=`select
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
`;function Lr(e){let t=y(e);return Ir.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Rr=({data:e,isLoading:n})=>{let r=e?.total??0,i=e=>r?e/r*100:0,o=[{name:`Winter`,value:e?.winter??0,color:`bg-blue-400`,emoji:`❄️`},{name:`Spring`,value:e?.spring??0,color:`bg-green-400`,emoji:`🌸`},{name:`Summer`,value:e?.summer??0,color:`bg-yellow-400`,emoji:`☀️`},{name:`Fall`,value:e?.fall??0,color:`bg-orange-400`,emoji:`🍂`}],s=o.reduce((e,t)=>e.value>t.value?e:t);return(0,z.jsx)(t,{title:`Seasonal Mood`,emoji:`🌺`,isLoading:n,question:`Which season do I listen the most?`,children:e?.total?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:s.name,sublabel:`${s.value?.toLocaleString()} streams`,emoji:s.emoji}),(0,z.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:o.map(e=>(0,z.jsx)(`li`,{role:`listitem`,children:(0,z.jsx)(C,{label:e.name,value:`${i(e.value).toFixed(1)}%`,valueColor:`text-gray-600 dark:text-gray-400`,pct:i(e.value),barColor:e.color})},e.name))})]}):(0,z.jsx)(a,{})})};function zr({year:e}){let{data:t,isLoading:n}=b({query:Lr(e),year:e});return(0,z.jsx)(Rr,{data:t,isLoading:n})}var Br=`select
    year(ts::date)::integer as stream_year,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from \${table}
group by year(ts::date)
order by year(ts::date)
`;function Vr(){return Br.replaceAll("${table}",_)}var Hr=({data:e,year:n,isLoading:r})=>{let[i,o]=(0,w.useState)(null),c=e?.length?Math.max(...e.map(e=>e.stream_count)):0,l=e?.find(e=>e.stream_year===n),d=e?.reduce((e,t)=>e+t.stream_count,0)??0,f=e?.reduce((e,t)=>e+t.ms_played,0)??0,p=e?.length?Math.min(...e.map(e=>e.stream_year)):0;return(0,z.jsxs)(t,{title:`Soundtrack Growth`,emoji:`📈`,className:`flex flex-col justify-between h-full`,isLoading:r,question:`How has my listening evolved over the years?`,children:[e?.length?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`div`,{className:`flex items-end gap-1 h-24 mt-4 mb-2`,onMouseLeave:()=>o(null),children:e.map(e=>(0,z.jsx)(`div`,{className:`flex-1 bg-brand-blue dark:bg-brand-blue rounded-t relative`,style:{height:`${e.stream_count/c*100}%`},onMouseEnter:t=>{let n=t.currentTarget.getBoundingClientRect();o({x:n.left+n.width/2,y:n.top,year:e.stream_year,count:e.stream_count,ms_played:e.ms_played})},children:(0,z.jsx)(`div`,{className:`absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t transition-all duration-300 ${e.stream_year===n?`bg-brand-purple`:``}`,style:{height:`100%`}})},e.stream_year))}),(0,z.jsxs)(`div`,{className:`flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1`,children:[(0,z.jsx)(`span`,{children:p}),(0,z.jsx)(`span`,{children:Math.max(...e.map(e=>e.stream_year))})]}),(0,z.jsxs)(`ul`,{className:`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700`,role:`list`,children:[(0,z.jsxs)(`li`,{className:`flex justify-between items-center`,role:`listitem`,children:[(0,z.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:`Total streams`}),(0,z.jsx)(`span`,{className:`font-bold`,children:d.toLocaleString()})]}),l&&(0,z.jsxs)(`li`,{className:`flex justify-between items-center mt-1`,role:`listitem`,children:[(0,z.jsx)(`span`,{className:`text-sm text-gray-600 dark:text-gray-400`,children:`This year`}),(0,z.jsx)(`span`,{className:`font-bold text-brand-purple dark:text-brand-purple`,children:l.stream_count.toLocaleString()})]})]})]}):(0,z.jsx)(a,{}),i&&(0,z.jsx)(s,{x:i.x,y:i.y,title:String(i.year),rows:[`${i.count.toLocaleString()} streams`,u(i.ms_played)],secondaryRows:[`${d.toLocaleString()} total streams`,`${u(f)} total listening`]})]})};function Ur({year:e}){let{data:t,isLoading:n}=x({query:Vr(),year:e});return(0,z.jsx)(Hr,{data:t,year:e,isLoading:n})}var Wr=`with artist_first_listen as (
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
`;function Gr(e){let t=y(e),n=it(e);return Wr.replaceAll("${table}",_).replaceAll("${year_condition}",t).replaceAll("${year_for_new}",n)}function Kr(){return`SELECT count(distinct artist_name)::int as total_artists FROM ${_} WHERE artist_name IS NOT NULL`}var qr=({data:e,isLoading:n,year:r,totalArtists:i})=>{if(r===void 0)return(0,z.jsxs)(t,{title:`Fresh vs Familiar`,emoji:`🆕`,isLoading:n,question:`Do I listen more to new or familiar artists?`,children:[(0,z.jsx)(`p`,{className:`text-sm text-gray-400 dark:text-gray-500 italic text-center py-6`,children:`Select a year to see your Fresh vs Familiar split`}),i!==void 0&&(0,z.jsxs)(d,{children:[i.toLocaleString(),` artists discovered all time`]})]});let o=e?.total?e.new_artists_streams/e.total*100:0,s=e?.total?e.old_artists_streams/e.total*100:0,c=s>o?`Comfort Listener`:s<o?`Trend Hunter`:`Balanced Taste`;return(0,z.jsx)(t,{title:`Fresh vs Familiar`,emoji:`🆕`,isLoading:n,question:`Do I listen more to new or familiar artists?`,children:e?.total?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:c}),(0,z.jsx)(`div`,{className:`flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400`,children:(0,z.jsxs)(`div`,{role:`list`,className:`flex-1 text-center contents`,children:[(0,z.jsxs)(`div`,{role:`listitem`,className:`flex-1 text-center`,children:[(0,z.jsxs)(`div`,{className:`text-2xl font-bold text-brand-purple`,children:[o.toFixed(0),`%`]}),(0,z.jsx)(`div`,{children:`Fresh`})]}),(0,z.jsx)(`div`,{className:`text-2xl`,role:`separator`,children:`|`}),(0,z.jsxs)(`div`,{role:`listitem`,className:`flex-1 text-center`,children:[(0,z.jsxs)(`div`,{className:`text-2xl font-bold text-brand-blue`,children:[s.toFixed(0),`%`]}),(0,z.jsx)(`div`,{children:`Familiar`})]})]})}),(0,z.jsxs)(`div`,{className:`w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden flex`,children:[(0,z.jsx)(`div`,{className:`bg-brand-purple h-full`,style:{width:`${o}%`}}),(0,z.jsx)(`div`,{className:`bg-brand-blue h-full`,style:{width:`${s}%`}})]}),(0,z.jsxs)(d,{children:[e.new_artists_count.toLocaleString(),` new artists discovered this year!`]})]}):(0,z.jsx)(a,{})})};function Jr({year:e}){let{data:t,isLoading:n}=b({query:Gr(e),year:e});return(0,z.jsx)(qr,{data:t,isLoading:n,year:e})}function Yr(){let{data:e,isLoading:t}=b({query:Kr()});return(0,z.jsx)(qr,{data:void 0,isLoading:t,year:void 0,totalArtists:e?.total_artists})}function Xr({year:e}){return e===void 0?(0,z.jsx)(Yr,{}):(0,z.jsx)(Jr,{year:e})}var Zr=`select
    count(*) filter (
        where reason_end = 'trackdone'
    )::double as complete_listens,
    count(*) filter (
        where reason_end in ('fwdbtn', 'click-row', 'clickrow')
    )::double as skipped_listens
from \${table}
where \${year_condition}
`;function Qr(e){let t=y(e);return Zr.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var $r=({data:e,isLoading:n})=>{let r=e?.complete_listens??0,i=e?.skipped_listens??0,o=e?r/(r+i)*100:0,{classification:s,emoji:c,message:l}=ft(o);return(0,z.jsx)(t,{title:`Skip Mood`,emoji:`⏭️`,isLoading:n,question:`Do I skip tracks often?`,children:e?.complete_listens?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:s,sublabel:`${o.toFixed(1)}% are full listens`,emoji:c}),(0,z.jsx)(mt,{pct:o,color:`bg-green-500`}),(0,z.jsxs)(`ul`,{className:`flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3`,role:`list`,children:[(0,z.jsxs)(`li`,{role:`listitem`,children:[`Skipped (`,i.toLocaleString(),`)`]}),(0,z.jsxs)(`li`,{role:`listitem`,children:[`Completed (`,r.toLocaleString(),`)`]})]}),(0,z.jsx)(d,{children:l})]}):(0,z.jsx)(a,{})})};function ei({year:e}){let{data:t,isLoading:n}=b({query:Qr(e),year:e});return(0,z.jsx)($r,{data:t,isLoading:n})}var ti=`with ordered_streams as (
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
`;function ni(e){let t=y(e);return ti.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function ri(e){return e>50?{classification:`Obsessive`,emoji:`🔥`}:e<10?{classification:`Variated`,emoji:`🔀`}:{classification:`Moderate`,emoji:`🔁`}}var ii=({data:e,isLoading:n})=>{let{total_repeat_sequences:r=0,max_consecutive:i=0,most_repeated_track:o=``,avg_repeat_length:s=0}=e??{},{classification:c,emoji:l}=ri(r);return(0,z.jsx)(t,{title:`Replay Style`,emoji:`🔁`,isLoading:n,question:`Do I replay the same tracks over and over?`,children:e?.total_repeat_sequences?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:c,sublabel:`${r} repeated sequences`,emoji:l}),(0,z.jsxs)(`div`,{className:`space-y-3`,children:[(0,z.jsxs)(`div`,{className:`bg-gray-200 dark:bg-slate-700/50 p-3 rounded-lg`,children:[(0,z.jsx)(`div`,{className:`text-xs text-gray-600 dark:text-gray-400 mb-1`,children:`Repeat Record`}),(0,z.jsxs)(`div`,{className:`font-medium text-brand-purple dark:text-brand-purple line-clamp-1`,children:[`"`,o,`"`]}),(0,z.jsxs)(`div`,{className:`text-sm font-bold mt-1`,children:[i,` times in a row 🎸`]})]}),(0,z.jsx)(`ul`,{className:`mb-1`,role:`list`,children:(0,z.jsxs)(`li`,{className:`flex justify-between items-center text-sm`,role:`listitem`,children:[(0,z.jsx)(`span`,{className:`text-gray-600 dark:text-gray-400`,children:`Repeat average`}),(0,z.jsxs)(`span`,{className:`font-bold`,children:[s.toFixed(1),` times`]})]})})]})]}):(0,z.jsx)(a,{})})};function ai({year:e}){let{data:t,isLoading:n}=b({query:ni(e),year:e});return(0,z.jsx)(ii,{data:t,isLoading:n})}var oi=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 6 and hour(ts::datetime) < 12)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,si=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 12 and hour(ts::datetime) < 18)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,ci=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 18 and hour(ts::datetime) < 24)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,li=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    hour(ts::datetime) < 6
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,ui=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (
        dayofweek(ts::date) in (0, 6)
        or (dayofweek(ts::date) = 5 and hour(ts::datetime) >= 18)
    )
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,di=`with
recent_date as (
    select max(ts::date) as max_date
    from \${table}
),

recent_artists as (
    select
        t.artist_name as artist,
        min(t.ts::date) as last_listen
    from \${table} as t, recent_date
    where
        t.ts::date >= recent_date.max_date - interval 90 day
        and t.artist_name is not null
    group by t.artist_name
),

threshold as (
    select approx_quantile(total_streams, 0.5) as limit_streams
    from (
        select count(*) as total_streams
        from \${table}
        group by artist_name
    )
),

previous_listens as (
    select
        t.artist_name as artist,
        max(t.ts::date) as previous_listen
    from \${table} as t, recent_date
    where
        t.artist_name is not null
        and t.ts::date < recent_date.max_date - interval 90 day
        and t.artist_name in (select artist from recent_artists)
    group by t.artist_name
    having count(*) > (select limit_streams from threshold)
),

artist_gaps as (
    select
        artist,
        date_diff(
            'day', previous_listens.previous_listen, recent_artists.last_listen
        ) as gap
    from recent_artists
    inner join previous_listens using (artist)
    order by gap desc
    limit 20
)

select
    artist as entity,
    gap::integer as metric
from artist_gaps
USING SAMPLE 1
`,fi=`with
recent_date as (
    select max(ts::date) as max_date
    from \${table}
),

recent_artists as (
    select distinct t.artist_name as artist
    from \${table} as t, recent_date
    where
        t.artist_name is not null
        and t.ts::date >= recent_date.max_date - interval 90 day
),

forgotten as (
    select
        t.artist_name as artist,
        t.ts::date as listen_date
    from \${table} as t, recent_date
    where
        t.artist_name is not null
        and t.ts::date < recent_date.max_date - interval 90 day
        and t.artist_name not in (select artist from recent_artists)
),

counts as (
    select
        artist,
        count(*) as total_streams
    from forgotten
    group by artist
),

threshold as (
    select approx_quantile(total_streams, 0.995) as limit_streams
    from counts
),

artist_stats as (
    select
        artist,
        count(*) as total_streams,
        max(listen_date) as last_listen
    from forgotten
    group by artist
    having count(*) >= (select limit_streams from threshold)
    order by max(listen_date)
    limit 20
)

select
    artist as entity,
    date_diff(
        'day', last_listen, (select max_date from recent_date)
    )::integer as metric
from artist_stats
USING SAMPLE 1
`,pi=`with
threshold as (
    select approx_quantile(total_streams, 0.995) as limit_streams
    from (
        select count(*) as total_streams
        from \${table}
        group by artist_name
    )
),

artist_counts as (
    select
        artist_name,
        count(*) filter (where reason_end = 'trackdone') as completed_count,
        count(*) as total_events
    from \${table}
    where artist_name is not null
    group by artist_name
    having count(*) >= (select limit_streams from threshold)
),

artist_loyalty as (
    select
        artist_name,
        total_events,
        completed_count::double precision
        / nullif(total_events, 0) as loyalty_ratio
    from artist_counts
)

select
    artist_name as entity,
    (loyalty_ratio * 100)::integer as metric
from artist_loyalty
order by metric desc
limit 1
`,mi=`select
    artist_name as entity,
    count(distinct strftime(ts::date, '%Y-%m'))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric desc
limit 1
`,hi=`with
recent_date as (
    select max(ts::date) as max_date
    from \${table}
),

threshold as (
    select approx_quantile(total_streams, 0.99) as limit_streams
    from (
        select count(*) as total_streams
        from \${table}
        group by artist_name
    )
),

recent_artists as (
    select distinct t.artist_name as artist
    from \${table} as t, recent_date
    where
        t.artist_name is not null
        and t.ts::date >= recent_date.max_date - interval 90 day
),

artist_years as (
    select
        artist_name,
        min(year(ts::date)) as first_year
    from \${table}
    where
        artist_name in (select artist from recent_artists)
    group by artist_name
    having count(*) >= (select limit_streams from threshold)
    order by first_year
    limit 20
)

select
    artist_years.artist_name as entity,
    year(recent_date.max_date) - artist_years.first_year as metric
from artist_years, recent_date
USING SAMPLE 1
`,gi=`select
    artist_name as entity,
    min(year(ts::date))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric asc
limit 1
`,_i=`with
track_streams as (
    select
        artist_name,
        track_name,
        count(*) as track_count,
        sum(count(*)) over (partition by artist_name) as total_streams
    from \${table}
    where
        artist_name is not null
        and track_name is not null
    group by artist_name, track_name
),

track_stats as (
    select
        artist_name,
        track_name,
        cast(
            (
                cast(track_count as double)
                / cast(total_streams as double)
                * 100
            ) as int
        ) as percentage
    from track_streams
    order by percentage desc, total_streams desc
    limit 20
)

select
    track_name as entity,
    percentage as metric,
    artist_name as context_suffix
from track_stats
USING SAMPLE 1
`,vi=`with
recent_date as (
    select max(ts::date) as max_date
    from \${table}
)

select
    t.track_name as entity,
    count(*)::integer as metric
from \${table} as t, recent_date
where
    t.ts::date >= recent_date.max_date - interval 30 day
    and t.track_name is not null
group by t.track_name
order by metric desc
limit 1
`,yi=`with
recent_date as (
    select max(ts::date) as max_date
    from \${table}
),

artist_first_listen as (
    select
        artist_name,
        min(ts::date) as first_listen
    from \${table}
    where artist_name is not null
    group by artist_name
)

select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
inner join artist_first_listen using (artist_name)
where
    artist_first_listen.first_listen
    >= (select max_date - interval 90 day from recent_date)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,bi=`with
ordered_streams as (
    select
        artist_name,
        ts,
        lag(artist_name) over (order by ts) as prev_artist
    from \${table}
    where artist_name is not null
),

group_ids as (
    select
        artist_name,
        ts,
        sum(case when artist_name = prev_artist then 0 else 1 end)
            over (order by ts)
        as group_id
    from ordered_streams
),

group_sizes as (
    select
        artist_name,
        count(*) as stream_count,
        min(ts::date) as listen_date
    from group_ids
    group by group_id, artist_name
)

select
    artist_name as entity,
    stream_count::integer as metric,
    listen_date::text as context_suffix
from group_sizes
order by stream_count desc
limit 1
`,xi=`select
    track_name as entity,
    artist_name as parent_entity
from \${table}
where track_name is not null
USING SAMPLE 1
`,Si=`with max_date as (
    select max(ts::date) as last_date
    from \${table}
),

sunday_album_listening as (
    select
        t.album_name,
        t.artist_name,
        sum(t.ms_played) as total_ms_played
    from \${table} as t, max_date
    where
        (
            dayofweek(t.ts::date) = 0
            or (dayofweek(t.ts::date) = 1 and hour(t.ts::datetime) <= 4)
        )
        and t.ts::date >= (max_date.last_date - interval 1 YEARS)
    group by t.album_name, t.artist_name
    having count(distinct t.track_name) >= 7
    order by total_ms_played desc
    limit 1
)

select
    album_name as entity,
    artist_name as parent_entity
from sunday_album_listening
`,$=e=>e.replaceAll("${table}",_),Ci=[{fact_type:`morning_favorite`,title:`🌅 Musical Breakfast`,emoji:`🥐`,unit:`streams`,context:`between 6am and 12pm`,sql:$(oi)},{fact_type:`afternoon_favorite`,title:`🏞️ Afternoon Boost`,emoji:`⚡️`,unit:`streams`,context:`between 12pm and 6pm`,sql:$(si)},{fact_type:`evening_favorite`,title:`🌆 Calm Return`,emoji:`🛋️`,unit:`streams`,context:`between 6pm and 0am`,sql:$(ci)},{fact_type:`night_favorite`,title:`🌌 Musical Insomnia`,emoji:`💤`,unit:`streams`,context:`between 0am and 6am`,sql:$(li)},{fact_type:`weekend_favorite`,title:`🧉 Weekend Vibes`,emoji:`🕺`,unit:`streams`,context:`on weekends`,sql:$(ui)},{fact_type:`nostalgic_return`,title:`📻 Signal Found`,emoji:`🛰️`,unit:`days`,context:`later, it's back`,sql:$(di)},{fact_type:`forgotten_artist`,title:`🥀 Fading Away`,emoji:`🌫️`,unit:`days`,context:`off your radar`,sql:$(fi)},{fact_type:`absolute_loyalty`,title:`💎 Absolute Loyalty`,emoji:`💍`,unit:`%`,context:`of your plays went all the way`,sql:$(pi)},{fact_type:`subscribed_artist`,title:`🎟️ Monthly Subscription`,emoji:`📬`,unit:`months`,context:`in your rotation`,sql:$(mi)},{fact_type:`musical_anniversary`,title:`🎉 Musical Anniversary`,emoji:`🎂`,unit:`years`,context:`strong`,sql:$(hi)},{fact_type:`first_artist`,title:`1️⃣ The Very First`,emoji:`🦖`,unit:void 0,context:`still in your rotation today?`,sql:$(gi)},{fact_type:`one_hit_wonder`,title:`⭐ One Hit Wonder`,emoji:`📼`,unit:`%`,context:`of your streams of`,sql:$(_i)},{fact_type:`current_obsession`,title:`🔁 Current Obsession`,emoji:`🎯`,unit:`streams`,context:`in the last 30 days`,sql:$(vi)},{fact_type:`recent_discovery`,title:`🔍 Recent Discovery`,emoji:`✨`,unit:`streams`,context:`discovered in the last 3 months`,sql:$(yi)},{fact_type:`marathon`,title:`🏃 Marathon`,emoji:`☄️`,unit:`streams in a row`,context:`one uninterrupted run on`,sql:$(bi)},{fact_type:`track_proposition`,title:`▶️ Up Next`,emoji:`🔮`,unit:void 0,context:`your next listen is already waiting`,sql:$(xi)},{fact_type:`cozy_album`,title:`💿 Cozy Album`,emoji:`☁️`,unit:void 0,context:`the album that wraps your Sundays in musical coziness`,sql:$(Si)}],wi=()=>(0,z.jsx)(`p`,{className:`text-lg text-gray-600 dark:text-gray-300 italic`,children:`Not enough data for this fun fact — keep listening!`}),Ti=({fact:e,error:t,isLoading:n})=>{if(n&&!e?.entity)return(0,z.jsxs)(`div`,{className:`space-y-2 animate-pulse`,children:[(0,z.jsx)(`div`,{className:`h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4`}),(0,z.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-full`}),(0,z.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6`})]});if(t)return(0,z.jsx)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:`Something went wrong while loading fun facts`});if(!e?.entity)return(0,z.jsx)(wi,{});let{entity:r,parent_entity:i,metric:a,unit:o,context:s}=e;return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`div`,{className:`text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 break-words text-balance`,children:r}),i&&(0,z.jsx)(`div`,{className:`text-base text-gray-500 dark:text-gray-400 mb-1`,children:i}),a!==void 0&&(0,z.jsxs)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:[(0,z.jsxs)(`span`,{className:`font-bold text-blue-600 dark:text-blue-400`,children:[a.toLocaleString(),o===`%`?o:``]}),o&&o!==`%`&&` ${o}`]}),s&&(0,z.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400 mt-1 italic`,children:s})]})},Ei=({fact:e,error:t,onRefresh:n,isLoading:r})=>(0,z.jsxs)(`div`,{className:`col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl shadow border border-purple-100 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:[(0,z.jsx)(`div`,{className:`absolute top-0 right-0 p-4 transition-opacity`,children:(0,z.jsx)(`button`,{onClick:n,disabled:r,className:`p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`,title:`New fact`,children:(0,z.jsx)(`span`,{className:`block text-xl ${r?`animate-spin`:``}`,children:`🔄`})})}),(0,z.jsxs)(`div`,{className:`flex flex-col md:flex-row items-center gap-6`,"data-fact-type":e?.fact_type,children:[(0,z.jsx)(`div`,{className:`text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow`,children:e?.emoji}),(0,z.jsxs)(`div`,{className:`flex-1 text-center md:text-left`,children:[(0,z.jsx)(`div`,{className:`text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2`,children:e?.title}),(0,z.jsx)(Ti,{fact:e,error:t,isLoading:r})]})]})]}),Di=e=>[...e].sort(()=>Math.random()-.5);function Oi(){let[e,t]=(0,w.useState)(void 0),[r,i]=(0,w.useState)(!0),[a,o]=(0,w.useState)(void 0),s=(0,w.useRef)(new Set),l=(0,w.useCallback)(async()=>{i(!0),o(void 0);try{s.current.size===Ci.length&&s.current.clear();let e=Ci.filter(e=>!s.current.has(e.fact_type)),[n]=Di(e.length>0?e:Ci);s.current.add(n.fact_type);let[r]=await c(n.sql);t({title:n.title,emoji:n.emoji,fact_type:n.fact_type,entity:r?.entity??void 0,parent_entity:r?.parent_entity,metric:r?.metric,unit:n.unit,context:[n.context,r?.context_suffix].filter(Boolean).join(` `)})}catch(e){console.error(`Error loading fun fact:`,e),o(e instanceof Error?e.message:`Failed to load fun fact`)}finally{i(!1)}},[]);return(0,w.useEffect)(()=>{l()},[l]),(0,w.useEffect)(()=>{let e=()=>{s.current.clear(),l()};return window.addEventListener(n,e),()=>window.removeEventListener(n,e)},[l]),(0,z.jsx)(Ei,{fact:e,onRefresh:l,isLoading:r,error:a})}var ki=`with
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
`;function Ai(e){let t=y(e);return ki.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var ji=({data:e,isLoading:n})=>(0,z.jsx)(t,{title:`Your Sound Machine`,emoji:`📱`,isLoading:n,question:`Which platform do I use the most for listening?`,children:e?.length?e.length===1?(0,z.jsxs)(`p`,{className:`text-sm text-gray-400 dark:text-gray-500 italic text-center py-6`,children:[`All streams are on `,e[0].platform]}):(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:e[0].platform,sublabel:`${e[0].stream_count.toLocaleString()} streams`,labelColor:`text-brand-purple`}),(0,z.jsx)(`ul`,{className:`space-y-3`,role:`list`,children:e.map(e=>(0,z.jsx)(`li`,{role:`listitem`,children:(0,z.jsx)(C,{label:e.platform,value:`${e.pct.toFixed(1)}%`,valueColor:`text-gray-600 dark:text-gray-400`,pct:e.pct,barColor:`bg-brand-purple`})},e.platform))})]}):(0,z.jsx)(a,{})});function Mi({year:e}){let{data:t,isLoading:n}=x({query:Ai(e),year:e});return(0,z.jsx)(ji,{data:t,isLoading:n})}var Ni=`with
artist_total as (
    select
        artist_name as artist,
        count(*) as total_streams
    from \${table}
    where artist_name is not null and \${year_condition}
    group by artist
),

artist_bins as (
    select
        case
            when total_streams = 1 then '1'
            when total_streams between 2 and 10 then '2-10'
            when total_streams between 11 and 100 then '11-100'
            when total_streams between 101 and 1000 then '101-1000'
            else '1000+'
        end as stream_bin,
        count(*) as artist_count,
        sum(total_streams) as streams_in_bin
    from artist_total
    group by stream_bin
)

select
    stream_bin,
    coalesce(artist_count, 0)::double as artist_count,
    coalesce(streams_in_bin, 0)::double as streams_in_bin,
    coalesce(
        round(streams_in_bin / sum(streams_in_bin) over (), 4), 0
    )::double as share_of_total_streams
from artist_bins
order by
    case stream_bin
        when '1' then 1
        when '2-10' then 2
        when '11-100' then 3
        when '101-1000' then 4
        when '1000+' then 5
    end
`;function Pi(e){let t=y(e);return Ni.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Fi=e=>{let t=t=>e.find(e=>e.stream_bin===t)?.share_of_total_streams||0,n=t(`1`),r=t(`2-10`),i=t(`11-100`),a=t(`101-1000`),o=t(`1000+`),s=n+r,c=i,l=a+o;return l>.6?{label:`Ultra Loyal`,emoji:`🔥`}:s>.6?{label:`Explorer`,emoji:`🔍`}:l>s?{label:`Favorites Driven`,emoji:`❤️`}:c>.4?{label:`Balanced Regular`,emoji:`⚖️`}:{label:`Curious`,emoji:`🧐`}},Ii=({data:e,isLoading:n})=>{let r=(e??[]).reduce((e,t)=>e+t.artist_count,0),i=Fi(e??[]),o=[{label:`1 stream`,value:(e?.[0]?.share_of_total_streams??0)*100,color:`bg-teal-400`,textColor:`text-teal-700 dark:text-teal-400`},{label:`2-10 streams`,value:(e?.[1]?.share_of_total_streams??0)*100,color:`bg-orange-400`,textColor:`text-orange-700 dark:text-orange-400`},{label:`11-100 streams`,value:(e?.[2]?.share_of_total_streams??0)*100,color:`bg-violet-400`,textColor:`text-violet-700 dark:text-violet-400`},{label:`101-1000 streams`,value:(e?.[3]?.share_of_total_streams??0)*100,color:`bg-blue-400`,textColor:`text-blue-700 dark:text-blue-400`},{label:`1000+ streams`,value:(e?.[4]?.share_of_total_streams??0)*100,color:`bg-rose-500`,textColor:`text-rose-700 dark:text-rose-400`}];return(0,z.jsx)(t,{title:`Artist Loyalty`,emoji:`🤝`,isLoading:n,question:`How loyal am I to my favorite artists?`,className:`h-full`,children:e?.length?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:i.label,sublabel:`${r.toLocaleString()} artists`,emoji:i.emoji}),(0,z.jsx)(`div`,{className:`space-y-2`,children:o.map(e=>(0,z.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,z.jsx)(`div`,{className:`w-3 h-3 rounded-full ${e.color} flex-shrink-0`}),(0,z.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,z.jsx)(`div`,{className:`flex justify-between items-center text-sm`,children:(0,z.jsx)(`span`,{className:`text-gray-600 dark:text-gray-400`,children:e.label})}),(0,z.jsx)(`div`,{className:`w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden`,children:(0,z.jsx)(`div`,{className:`${e.color} h-1.5 rounded-full`,style:{width:`${e.value}%`}})})]}),(0,z.jsxs)(`div`,{className:`text-sm font-medium ${e.textColor} w-14 text-right`,children:[e.value.toFixed(0),`%`]})]},e.label))})]}):(0,z.jsx)(a,{})})};function Li({year:e}){let{data:t,isLoading:n}=x({query:Pi(e),year:e});return(0,z.jsx)(Ii,{data:t,isLoading:n})}var Ri=`with
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
`;function zi(e){let t=y(e);return Ri.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Bi={Monday:`Mon`,Tuesday:`Tue`,Wednesday:`Wed`,Thursday:`Thu`,Friday:`Fri`,Saturday:`Sat`,Sunday:`Sun`},Vi=({data:e,isLoading:n})=>{let[r,i]=(0,w.useState)(null),o=e?e.reduce((e,t)=>t.pct>e.pct?t:e,e[0]):void 0,c=e?Math.max(...e.map(e=>e.pct)):0;return(0,z.jsxs)(t,{title:`Your Power Day`,emoji:`📅`,isLoading:n,question:`Which day of the week do I listen the most?`,children:[e?.length?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:o.day_name,sublabel:`${o.stream_count.toLocaleString()} streams`,labelColor:`text-orange-400`}),(0,z.jsx)(`div`,{className:`grid grid-cols-7 gap-1`,onMouseLeave:()=>i(null),children:e.map(e=>{let t=e.day_name===o.day_name,n=e.pct/c*100;return(0,z.jsxs)(`div`,{className:`flex flex-col items-center gap-1`,children:[(0,z.jsx)(`div`,{className:`text-[10px] font-medium text-gray-600 dark:text-gray-400`,children:Bi[e.day_name]}),(0,z.jsx)(`div`,{className:`w-full h-16 bg-gray-200 dark:bg-slate-700/50 rounded-sm flex items-end overflow-hidden`,onMouseEnter:t=>{let n=t.currentTarget.getBoundingClientRect();i({x:n.left+n.width/2,y:n.top,day_name:e.day_name,stream_count:e.stream_count,ms_played:e.ms_played})},children:(0,z.jsx)(`div`,{className:`w-full rounded-sm transition-all duration-300 ${t?`bg-orange-400`:`bg-yellow-400`}`,style:{height:`${n}%`}})}),(0,z.jsxs)(`div`,{className:`text-[9px] text-gray-600 dark:text-gray-400`,children:[e.pct.toFixed(0),`%`]})]},e.day_name)})})]}):(0,z.jsx)(a,{}),r&&(0,z.jsx)(s,{x:r.x,y:r.y,title:r.day_name,rows:[`${r.stream_count.toLocaleString()} streams`,u(r.ms_played)]})]})};function Hi({year:e}){let{data:t,isLoading:n}=x({query:zi(e),year:e});return(0,z.jsx)(Vi,{data:t,isLoading:n})}var Ui=`with
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
`;function Wi(e){let t=y(e);return Ui.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function Gi(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}var Ki=({data:e,isLoading:n,year:r})=>(0,z.jsx)(t,{title:`On a Roll`,emoji:`🔥`,isLoading:n,question:r===void 0?`What's my longest listening run ever?`:`What's my longest listening run in ${r}?`,children:e?.streak_days?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:String(e.streak_days),sublabel:`days in a row`}),(0,z.jsxs)(d,{children:[Gi(e.start_date),` –`,` `,Gi(e.end_date)]})]}):(0,z.jsx)(a,{})});function qi({year:e}){let{data:t,isLoading:n}=b({query:Wi(e),year:e});return(0,z.jsx)(Ki,{data:t,isLoading:n,year:e})}var Ji=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(sum(ms_played) / 3600000.0 as double) as hours_played
from \${table}
where \${year_condition}
group by cast(ts as date)
order by hours_played desc
limit 1
`;function Yi(e){let t=y(e);return Ji.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function Xi(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}function Zi(e){let t=Math.floor(e),n=Math.round((e-t)*60);return n===0?`${t}h`:`${t}h ${n}min`}var Qi=({data:e,isLoading:n,year:r})=>(0,z.jsx)(t,{title:`Deep Dive`,emoji:`🎧`,isLoading:n,question:r===void 0?`What's my most immersive day ever?`:`What's my most immersive day in ${r}?`,children:e?.hours_played?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:Zi(e.hours_played),sublabel:`in a day`}),(0,z.jsx)(d,{children:Xi(e.stream_date)})]}):(0,z.jsx)(a,{})});function $i({year:e}){let{data:t,isLoading:n}=b({query:Yi(e),year:e});return(0,z.jsx)(Qi,{data:t,isLoading:n,year:e})}var ea=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(count(distinct artist_name) as integer) as artist_count
from \${table}
where \${year_condition}
group by cast(ts as date)
order by artist_count desc
limit 1
`;function ta(e){let t=y(e);return ea.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function na(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}var ra=({data:e,isLoading:n,year:r})=>(0,z.jsx)(t,{title:`Eclectic Day`,emoji:`🎨`,isLoading:n,question:r===void 0?`My most diverse listening day ever?`:`My most diverse listening day in ${r}?`,children:e?.artist_count?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:String(e.artist_count),sublabel:`different artists`}),(0,z.jsx)(d,{children:na(e.stream_date)})]}):(0,z.jsx)(a,{})});function ia({year:e}){let{data:t,isLoading:n}=b({query:ta(e),year:e});return(0,z.jsx)(ra,{data:t,isLoading:n,year:e})}var aa=`select
    stream_date::varchar as stream_date,
    stream_count::double as stream_count
from \${table}
where \${year_condition}
order by stream_date
`;function oa(e){let t=y(e,`year(stream_date)`);return aa.replaceAll("${table}",tt).replaceAll("${year_condition}",t)}function sa({year:e}){let{data:t,isLoading:n}=x({query:oa(e),year:e});return(0,z.jsx)(dt,{data:t,year:e,isLoading:n})}function ca({year:e}){return e===void 0?(0,z.jsx)(dt,{data:void 0,year:void 0}):(0,z.jsx)(sa,{year:e})}var la=`select
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
`;function ua(e){let t=y(e);return la.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function da({year:e,maxHourlyCount:t}){let{data:n,isLoading:r}=x({query:ua(e),year:e});return(0,z.jsx)(ct,{data:n,maxHourlyCount:t,isLoading:r})}var fa=`select
    count(*)::double as session_count,
    max(duration_ms)::double as longest_session_ms,
    max(track_count)::double as longest_session_track_count,
    mode(hour(session_start::timestamp))::integer as peak_start_hour,
    avg(duration_ms) as avg_duration_ms,
    median(track_count) as median_tracks,
    max_by(session_start, duration_ms) as longest_session_date
from \${table}
where \${year_condition}
`;function pa(e){let t=y(e,`year(session_start::date)`);return fa.replaceAll("${table}",et).replaceAll("${year_condition}",t)}function ma(e){return e<12e5?{label:`Express`,emoji:`🏃`,color:`text-green-400`}:e<36e5?{label:`Balanced`,emoji:`🎧`,color:`text-blue-400`}:{label:`Marathon`,emoji:`🏔️`,color:`text-purple-400`}}var ha=({data:e,isLoading:n})=>{let r=e?ma(e.avg_duration_ms):null;return(0,z.jsx)(t,{title:`Listening sessions`,emoji:`🎛️`,isLoading:n,question:`How are my listening sessions structured?`,className:`h-full`,children:e?.session_count?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(S,{label:r.label,sublabel:`${e.session_count.toLocaleString()} sessions`,emoji:r.emoji,labelColor:r.color}),(0,z.jsxs)(`div`,{className:`space-y-3`,children:[(0,z.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 text-sm`,children:[(0,z.jsxs)(`div`,{className:`text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg`,children:[(0,z.jsx)(`div`,{className:`font-semibold text-gray-800 dark:text-gray-200`,children:u(Math.round(e.avg_duration_ms))}),(0,z.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-gray-400`,children:`average duration`})]}),(0,z.jsxs)(`div`,{className:`text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg`,children:[(0,z.jsxs)(`div`,{className:`font-semibold text-gray-800 dark:text-gray-200`,children:[Math.round(e.median_tracks),` tracks`]}),(0,z.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-gray-400`,children:`median per session`})]})]}),(0,z.jsxs)(d,{children:[`Longest:`,` `,u(Math.round(e.longest_session_ms)),` `,`— `,e.longest_session_track_count,` tracks on`,` `,new Date(e.longest_session_date).toLocaleDateString()]}),(0,z.jsxs)(d,{children:[`Favorite start time:`,` `,String(e.peak_start_hour).padStart(2,`0`),`h`]}),(0,z.jsx)(`p`,{className:`text-[10px] text-gray-400 dark:text-gray-600 text-center`,children:`A session = consecutive streams with gaps ≤ 15 min`})]})]}):(0,z.jsx)(a,{})})};function ga({year:e}){let{data:t,isLoading:n}=b({query:pa(e),year:e});return(0,z.jsx)(ha,{data:t,isLoading:n})}var _a=`select
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
`;function va(e){let t=y(e);return _a.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var ya=(0,w.memo)(function({data:e,isLoading:n}){let r=(e??[]).map(e=>({primary:e.artist_name,secondary:u(e.ms_played).split(` `)[0],score:e.count_streams.toLocaleString()}));return(0,z.jsx)(t,{title:`Top Artists`,emoji:`🎤`,isLoading:n,children:e?.length?(0,z.jsx)(lt,{items:r}):(0,z.jsx)(a,{})})});function ba({year:e}){let{data:t,isLoading:n}=x({query:va(e),year:e});return(0,z.jsx)(ya,{data:t,isLoading:n})}var xa=`select
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
`;function Sa(e){let t=y(e);return xa.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Ca=(0,w.memo)(function({data:e,isLoading:n}){let r=(e??[]).map(e=>({primary:e.album_name,secondary:e.artist_name,score:e.count_streams.toLocaleString()}));return(0,z.jsx)(t,{title:`Top Albums`,emoji:`💿`,isLoading:n,children:e?.length?(0,z.jsx)(lt,{items:r}):(0,z.jsx)(a,{})})});function wa({year:e}){let{data:t,isLoading:n}=x({query:Sa(e),year:e});return(0,z.jsx)(Ca,{data:t,isLoading:n})}var Ta=`select
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
`;function Ea(e){let t=y(e);return Ta.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Da=(0,w.memo)(function({data:e,isLoading:n}){let r=(e??[]).map(e=>({primary:e.track_name,secondary:e.artist_name,score:e.count_streams.toLocaleString()}));return(0,z.jsx)(t,{title:`Top Tracks`,emoji:`🎵`,isLoading:n,children:e?.length?(0,z.jsx)(lt,{items:r}):(0,z.jsx)(a,{})})});function Oa({year:e}){let{data:t,isLoading:n}=x({query:Ea(e),year:e});return(0,z.jsx)(Da,{data:t,isLoading:n})}function ka(){let{timezone:e}=(0,w.useContext)(xn),[t,r]=(0,w.useState)(void 0),[i,a]=(0,w.useState)(),o=st(t,250),s=(0,w.useCallback)(async()=>{try{let e=await c(at);a(e[0]||void 0)}catch{}},[]);return(0,w.useEffect)(()=>{s()},[s]),(0,w.useEffect)(()=>(window.addEventListener(n,s),()=>window.removeEventListener(n,s)),[s]),(0,w.useEffect)(()=>{i&&r(new Date(Number(i.max_datetime)).getFullYear())},[i]),(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`div`,{className:`mt-4 mb-6`,children:(0,z.jsx)(Oi,{})}),i&&(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(ot,{value:t,min:new Date(Number(i.min_datetime)).getFullYear(),max:new Date(Number(i.max_datetime)).getFullYear(),onChange:r}),(0,z.jsxs)(`p`,{className:`text-xs text-gray-400 dark:text-slate-500 text-right mb-2`,children:[`Time-based charts use timezone: `,e]}),(0,z.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`,children:[(0,z.jsx)(Oa,{year:o}),(0,z.jsx)(ba,{year:o}),(0,z.jsx)(wa,{year:o}),(0,z.jsx)(`div`,{className:`md:col-span-3`,children:(0,z.jsx)(ca,{year:o})}),(0,z.jsx)(Er,{year:o}),(0,z.jsx)(Ar,{year:o}),(0,z.jsx)(Fr,{year:o}),(0,z.jsx)(`div`,{className:`md:col-span-2`,children:(0,z.jsx)(Ur,{year:o})}),(0,z.jsx)(zr,{year:o}),(0,z.jsx)(Xr,{year:o}),(0,z.jsx)(`div`,{className:`row-span-2`,children:(0,z.jsx)(Li,{year:o})}),(0,z.jsx)(ei,{year:o}),(0,z.jsx)(`div`,{className:`row-span-2`,children:(0,z.jsx)(ga,{year:o})}),(0,z.jsx)(ai,{year:o}),(0,z.jsx)(`div`,{className:`row-span-3 md:col-span-2`,children:(0,z.jsx)(da,{year:o})}),(0,z.jsx)(Mi,{year:o}),(0,z.jsx)(Hi,{year:o}),(0,z.jsx)(qi,{year:o}),(0,z.jsx)($i,{year:o}),(0,z.jsx)(ia,{year:o})]})]})]})}function Aa(){return(0,z.jsxs)(`svg`,{width:`50`,height:`50`,viewBox:`0 0 50 50`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,z.jsx)(`defs`,{children:(0,z.jsxs)(`linearGradient`,{id:`spinner-gradient`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,z.jsx)(`stop`,{offset:`0%`,style:{stopColor:`#3498db`,stopOpacity:1}}),(0,z.jsx)(`stop`,{offset:`100%`,style:{stopColor:`#e74c3c`,stopOpacity:1}})]})}),(0,z.jsx)(`circle`,{cx:`25`,cy:`25`,r:`20`,fill:`none`,strokeWidth:`5`,stroke:`url(#spinner-gradient)`,strokeLinecap:`round`,children:(0,z.jsx)(`animateTransform`,{attributeName:`transform`,type:`rotate`,dur:`1s`,from:`0 25 25`,to:`360 25 25`,repeatCount:`indefinite`})})]})}var ja=(0,w.lazy)(()=>pt(()=>import(`./LabView.BOUkAiqo.js`).then(e=>({default:e.LabView})),__vite__mapDeps([0,1,2,3,4,5,6,7,8]))),Ma=(0,w.lazy)(()=>pt(()=>import(`./ChatView.Be3zHBVs.js`).then(e=>({default:e.ChatView})),__vite__mapDeps([9,1,2,3,4,5,6,10,11,12,8,13]))),Na=(0,w.lazy)(()=>pt(()=>import(`./QueryView.CzfpiSb0.js`).then(e=>({default:e.QueryView})),__vite__mapDeps([14,1,3]))),Pa=[{id:`simple`,label:`✨ Simple`,tooltip:`Curated and guided overview of your listening data`},{id:`lab`,label:`🔬 Lab`,tooltip:`Experimental insights and advanced visualizations`},{id:`chat`,label:`💬 Chat (beta)`,tooltip:`Conversational exploration using a built-in LLM`},{id:`query`,label:`⌨️ Query`,tooltip:`Direct SQL-based exploration of the dataset`}];function Fa(){let[e,t]=(0,w.useState)(`simple`),[n,r]=(0,w.useState)(0),i=(0,w.useRef)(void 0),a=Pa.findIndex(t=>t.id===e),o=(0,w.useCallback)(e=>{i.current=e,t(`query`),r(e=>e+1)},[]);return(0,z.jsx)(ut.Provider,{value:o,children:(0,z.jsxs)(`div`,{className:`py-8 animate-slide-up`,children:[(0,z.jsxs)(`div`,{className:`relative mb-8 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-xl mx-auto`,children:[(0,z.jsx)(`div`,{className:`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] bg-gradient-brand rounded-xl shadow-glow transition-transform duration-300 ease-out`,style:{width:`calc(${(100/Pa.length).toFixed(4)}% - 0.25rem)`,transform:`translateX(calc(${a} * (100% + 0.125rem)))`}}),(0,z.jsx)(`div`,{className:`relative flex gap-1`,role:`tablist`,children:Pa.map(n=>(0,z.jsx)(`button`,{role:`tab`,"aria-selected":e===n.id,title:n.tooltip,onClick:()=>t(n.id),className:`relative z-10 flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${e===n.id?`text-white`:`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`}`,children:n.label},n.id))})]}),(0,z.jsx)(`div`,{children:(0,z.jsx)(w.Suspense,{fallback:(0,z.jsx)(`div`,{className:`flex justify-center py-12`,children:(0,z.jsx)(Aa,{})}),children:e===`simple`?(0,z.jsx)(ka,{}):e===`lab`?(0,z.jsx)(ja,{}):e===`query`?(0,z.jsx)(Na,{initialQuery:i.current,onQueryConsumed:()=>{i.current=void 0}},n):(0,z.jsx)(Ma,{})})})]})})}var Ia=8e3;function La({message:e,onDismiss:t}){let[n,r]=(0,w.useState)(!1),i=(0,w.useRef)(Ia),a=(0,w.useRef)(Date.now());return(0,w.useEffect)(()=>{i.current=Ia,a.current=Date.now()},[e]),(0,w.useEffect)(()=>{if(n){i.current=Math.max(0,i.current-(Date.now()-a.current));return}a.current=Date.now();let e=setTimeout(t,i.current);return()=>clearTimeout(e)},[n,e,t]),(0,z.jsxs)(`div`,{role:`alert`,"aria-live":`assertive`,"aria-atomic":`true`,onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),className:`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg`,children:[(0,z.jsx)(`span`,{className:`select-text`,children:e}),(0,z.jsx)(`button`,{type:`button`,onClick:t,className:`ml-1 rounded p-0.5 hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`,"aria-label":`Dismiss error`,children:`✕`})]})}function Ra({initialDb:e=null,initialIsDataDropped:t=!1,initialIsDataReady:n=!1}){let[r,i]=(0,w.useState)(e),[a,o]=(0,w.useState)(t),[s,c]=(0,w.useState)(n),[l,u]=(0,w.useState)(null),[d,f]=(0,w.useState)(null),p=(0,w.useCallback)(()=>u(null),[]),{isDemoReady:ee,handleDemoButtonClick:te,demoJsonUrl:ne,demoProgress:re}=Sr(),m=d??re;(0,w.useEffect)(()=>{(async()=>{let e=await g();i(e)})()},[]);async function ie(e){if(e){c(!1),o(!0),f(null);try{await _r(e,(e,t)=>f({stage:e,percent:t})),c(!0)}catch(e){console.error(`Failed to upload files:`,e),c(!1),o(!1),u(mr(e))}finally{f(null)}}}return r?(0,z.jsxs)(z.Fragment,{children:[(!a||s)&&!m&&(0,z.jsxs)(`div`,{className:`flex flex-col md:flex-row gap-4 items-stretch`,children:[(0,z.jsx)(`div`,{className:`flex-grow transition-all duration-300`,children:(0,z.jsx)(gr,{handleValidatedFiles:ie,onFail:e=>u(mr(e))})}),(0,z.jsxs)(`div`,{className:`flex flex-col justify-center gap-4`,children:[(0,z.jsx)(br,{label:`?`,tooltip:`How do I get my data?`}),ne&&(0,z.jsx)(yr,{label:`↓`,tooltip:`Load demo data`,handleClick:te})]})]}),m&&(0,z.jsx)(vr,{stage:m.stage,percent:m.percent}),(s||ee)&&(0,z.jsx)(Fa,{}),l&&(0,z.jsx)(La,{message:l,onDismiss:p})]}):(0,z.jsx)(z.Fragment,{children:(0,z.jsx)(`p`,{className:`dark:text-white`,children:`Initializing the database engine (DuckDB-WASM)...`})})}var za={system:{icon:`M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z`,label:e=>`System (${e})`},dark:{icon:`M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z`,label:()=>`Dark`},light:{icon:`M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z`,label:()=>`Light`}},Ba=({path:e})=>(0,z.jsx)(`svg`,{className:`w-5 h-5`,fill:`none`,stroke:`currentColor`,viewBox:`0 0 24 24`,children:(0,z.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:e})}),Va=e=>o[(o.indexOf(e)+1)%o.length];function Ha(){let{theme:e,setTheme:t,effectiveTheme:n}=(0,w.useContext)(i),r=za[e],a=r.label(n);return(0,z.jsx)(`button`,{onClick:()=>t(Va(e)),className:`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-md mx-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200`,"aria-label":`Current theme: ${a}. Click to change theme.`,title:a,children:(0,z.jsx)(Ba,{path:r.icon})})}var Ua=typeof Intl.supportedValuesOf==`function`?Intl.supportedValuesOf(`timeZone`):[Intl.DateTimeFormat().resolvedOptions().timeZone];function Wa(){let{timezone:e,setTimezone:t}=(0,w.useContext)(xn);return(0,z.jsx)(`select`,{value:e,onChange:e=>void t(e.target.value),className:`text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md border border-gray-300/60 dark:border-slate-700/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none`,"aria-label":`Timezone for charts`,title:`Charts timezone: ${e}`,children:Ua.map(e=>(0,z.jsx)(`option`,{value:e,children:e},e))})}function Ga(){return(0,z.jsx)(l,{children:(0,z.jsx)(Sn,{children:(0,z.jsxs)(`div`,{className:`min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300`,children:[(0,z.jsxs)(`div`,{className:`absolute top-6 right-6 z-50 flex items-center gap-2`,children:[(0,z.jsx)(Wa,{}),(0,z.jsx)(Ha,{})]}),(0,z.jsx)(`div`,{className:`flex flex-1 items-center justify-center px-4 relative z-10`,children:(0,z.jsxs)(`div`,{className:`max-w-4xl w-full mx-auto py-12`,children:[(0,z.jsx)(`h1`,{className:`text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in`,children:(0,z.jsx)(`a`,{href:`/tracksy/pr-preview/pr-520`,className:`bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity drop-shadow-sm`,children:`Tracksy`})}),(0,z.jsx)(Ra,{})]})}),(0,z.jsx)(`footer`,{className:`relative z-10 pb-6 text-center text-sm text-gray-400 dark:text-slate-500`,children:(0,z.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy`,target:`_blank`,rel:`noopener noreferrer`,className:`hover:text-gray-600 dark:hover:text-slate-300 transition-colors`,children:`Music stats made with ❤️ & 🔐 · View on GitHub`})})]})})})}export{Ga as App};