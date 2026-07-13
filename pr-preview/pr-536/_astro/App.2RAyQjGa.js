const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/LabView.ClmZmE7r.js","_astro/react.CD6hyuMb.js","_astro/InsightCard.C7QBFosX.js","_astro/getDB.CWPj6BJq.js","_astro/devBus.DRONl0Hn.js","_astro/constants.th95jnuK.js","_astro/react-dom.BkUwaInR.js","_astro/useDebouncedValue.BALRxe3v.js","_astro/src.Cl0Plcwj.js","_astro/ChatView.S8iNU8MB.js","_astro/preload-helper.D2uXM9kz.js","_astro/deviceDetection.DfyxKe7U.js","_astro/types.DZzuE3ID.js","_astro/QueryView.C6wjggvY.js"])))=>i.map(i=>d[i]);
import{t as e}from"./react.CD6hyuMb.js";import{a as t,c as n,d as r,f as i,h as a,i as o,l as s,m as c,o as l,p as u,t as d,u as f}from"./InsightCard.C7QBFosX.js";import{$ as ee,A as te,B as p,C as ne,D as re,E as m,F as ie,G as ae,H as oe,I as se,J as ce,K as le,L as ue,M as de,N as fe,O as pe,P as me,Q as he,R as ge,S as _e,T as ve,U as ye,V as be,W as xe,X as Se,Y as Ce,Z as we,_ as Te,a as h,b as Ee,c as De,d as Oe,et as ke,f as Ae,g as je,h as Me,i as Ne,j as Pe,k as Fe,l as Ie,m as Le,n as Re,nt as ze,o as Be,p as Ve,q as He,r as Ue,rt as We,s as Ge,t as g,tt as Ke,u as qe,v as Je,w as Ye,x as Xe,y as Ze,z as Qe}from"./getDB.CWPj6BJq.js";import{t as $e}from"./devBus.DRONl0Hn.js";import{a as et,i as tt,n as nt,o as _,r as v,t as rt}from"./constants.th95jnuK.js";import{_ as it,a as at,b as ot,c as st,d as ct,f as lt,g as ut,h as dt,i as ft,l as pt,m as mt,n as ht,o as gt,p as _t,s as vt,t as yt,u as bt,v as xt,x as St,y as Ct}from"./preload-helper.D2uXM9kz.js";import{n as wt,r as Tt,t as Et}from"./useDebouncedValue.BALRxe3v.js";function Dt(e){if(!e||e.length<=0)return function(e){return!0};let t=``,n=e.filter(e=>e===e);return n.length>0&&(t=`
    switch (x) {${n.map(e=>`
        case ${Ot(e)}:`).join(``)}
            return false;
    }`),e.length!==n.length&&(t=`if (x !== x) return false;\n${t}`),Function(`x`,`${t}\nreturn true;`)}function Ot(e){return typeof e==`bigint`?`${ee(e)}n`:ee(e)}function kt(e,t){let n=Math.ceil(e)*t-1;return(n-n%64+64||64)/t}function At(e,t=0){return e.length>=t?e.subarray(0,t):ke(new e.constructor(t),e,0)}var y=class{constructor(e,t=0,n=1){this.length=Math.ceil(t/n),this.buffer=new e(this.length),this.stride=n,this.BYTES_PER_ELEMENT=e.BYTES_PER_ELEMENT,this.ArrayType=e}get byteLength(){return Math.ceil(this.length*this.stride)*this.BYTES_PER_ELEMENT}get reservedLength(){return this.buffer.length/this.stride}get reservedByteLength(){return this.buffer.byteLength}set(e,t){return this}append(e){return this.set(this.length,e)}reserve(e){if(e>0){this.length+=e;let t=this.stride,n=this.length*t,r=this.buffer.length;n>=r&&this._resize(kt(r===0?n*1:n*2,this.BYTES_PER_ELEMENT))}return this}flush(e=this.length){e=kt(e*this.stride,this.BYTES_PER_ELEMENT);let t=At(this.buffer,e);return this.clear(),t}clear(){return this.length=0,this.buffer=new this.ArrayType,this}_resize(e){return this.buffer=At(this.buffer,e)}},b=class extends y{last(){return this.get(this.length-1)}get(e){return this.buffer[e]}set(e,t){return this.reserve(e-this.length+1),this.buffer[e*this.stride]=t,this}},jt=class extends b{constructor(){super(Uint8Array,0,1/8),this.numValid=0}get numInvalid(){return this.length-this.numValid}get(e){return this.buffer[e>>3]>>e%8&1}set(e,t){let{buffer:n}=this.reserve(e-this.length+1),r=e>>3,i=e%8,a=n[r]>>i&1;return t?a===0&&(n[r]|=1<<i,++this.numValid):a===1&&(n[r]&=~(1<<i),--this.numValid),this}clear(){return this.numValid=0,super.clear()}},Mt=class extends b{constructor(e){super(e.OffsetArrayType,1,1)}append(e){return this.set(this.length-1,e)}set(e,t){let n=this.length-1,r=this.reserve(e-n+1).buffer;return n<e++&&n>=0&&r.fill(r[n],n,e),r[e]=r[e-1]+t,this}flush(e=this.length-1){return e>this.length&&this.set(e-1,this.BYTES_PER_ELEMENT>4?BigInt(0):0),super.flush(e+1)}},x=class{static throughNode(e){throw Error(`"throughNode" not available in this environment`)}static throughDOM(e){throw Error(`"throughDOM" not available in this environment`)}constructor({type:e,nullValues:t}){this.length=0,this.finished=!1,this.type=e,this.children=[],this.nullValues=t,this.stride=he(e),this._nulls=new jt,t&&t.length>0&&(this._isValid=Dt(t))}toVector(){return new Ge([this.flush()])}get ArrayType(){return this.type.ArrayType}get nullCount(){return this._nulls.numInvalid}get numChildren(){return this.children.length}get byteLength(){let e=0,{_offsets:t,_values:n,_nulls:r,_typeIds:i,children:a}=this;return t&&(e+=t.byteLength),n&&(e+=n.byteLength),r&&(e+=r.byteLength),i&&(e+=i.byteLength),a.reduce((e,t)=>e+t.byteLength,e)}get reservedLength(){return this._nulls.reservedLength}get reservedByteLength(){let e=0;return this._offsets&&(e+=this._offsets.reservedByteLength),this._values&&(e+=this._values.reservedByteLength),this._nulls&&(e+=this._nulls.reservedByteLength),this._typeIds&&(e+=this._typeIds.reservedByteLength),this.children.reduce((e,t)=>e+t.reservedByteLength,e)}get valueOffsets(){return this._offsets?this._offsets.buffer:null}get values(){return this._values?this._values.buffer:null}get nullBitmap(){return this._nulls?this._nulls.buffer:null}get typeIds(){return this._typeIds?this._typeIds.buffer:null}append(e){return this.set(this.length,e)}isValid(e){return this._isValid(e)}set(e,t){return this.setValid(e,this.isValid(t))&&this.setValue(e,t),this}setValue(e,t){this._setValue(this,e,t)}setValid(e,t){return this.length=this._nulls.set(e,+t).length,t}addChild(e,t=`${this.numChildren}`){throw Error(`Cannot append children to non-nested type "${this.type}"`)}getChildAt(e){return this.children[e]||null}flush(){let e,t,n,r,{type:i,length:a,nullCount:o,_typeIds:s,_offsets:c,_values:l,_nulls:u}=this;(t=s?.flush(a))?r=c?.flush(a):e=(r=c?.flush(a))?l?.flush(c.last()):l?.flush(a),o>0&&(n=u?.flush(a));let d=this.children.map(e=>e.flush());return this.clear(),qe({type:i,length:a,nullCount:o,children:d,child:d[0],data:e,typeIds:t,nullBitmap:n,valueOffsets:r})}finish(){this.finished=!0;for(let e of this.children)e.finish();return this}clear(){var e,t,n,r;this.length=0,(e=this._nulls)==null||e.clear(),(t=this._values)==null||t.clear(),(n=this._offsets)==null||n.clear(),(r=this._typeIds)==null||r.clear();for(let e of this.children)e.clear();return this}};x.prototype.length=1,x.prototype.stride=1,x.prototype.children=null,x.prototype.finished=!1,x.prototype.nullValues=null,x.prototype._isValid=()=>!0;var S=class extends x{constructor(e){super(e),this._values=new b(this.ArrayType,0,this.stride)}setValue(e,t){let n=this._values;return n.reserve(e-n.length+1),super.setValue(e,t)}},C=class extends x{constructor(e){super(e),this._pendingLength=0,this._offsets=new Mt(e.type)}setValue(e,t){let n=this._pending||=new Map,r=n.get(e);r&&(this._pendingLength-=r.length),this._pendingLength+=t instanceof Oe?t[Ae].length:t.length,n.set(e,t)}setValid(e,t){return super.setValid(e,t)?!0:((this._pending||=new Map).set(e,void 0),!1)}clear(){return this._pendingLength=0,this._pending=void 0,super.clear()}flush(){return this._flush(),super.flush()}finish(){return this._flush(),super.finish()}_flush(){let e=this._pending,t=this._pendingLength;return this._pendingLength=0,this._pending=void 0,e&&e.size>0&&this._flushPending(e,t),this}},Nt=class extends C{constructor(e){super(e),this._values=new y(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,Ke(t))}_flushPending(e,t){let n=this._offsets,r=this._values.reserve(t).buffer,i=0;for(let[t,a]of e)if(a===void 0)n.set(t,0);else{let e=a.length;r.set(a,i),n.set(t,e),i+=e}}},Pt=class extends C{constructor(e){super(e),this._values=new y(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,Ke(t))}_flushPending(e,t){let n=this._offsets,r=this._values.reserve(t).buffer,i=0;for(let[t,a]of e)if(a===void 0)n.set(t,BigInt(0));else{let e=a.length;r.set(a,i),n.set(t,BigInt(e)),i+=e}}},Ft=class extends x{constructor(e){super(e),this._values=new jt}setValue(e,t){this._values.set(e,+t)}},w=class extends S{};w.prototype._setValue=Ve;var It=class extends w{};It.prototype._setValue=Le;var Lt=class extends w{};Lt.prototype._setValue=Me;var Rt=class extends S{};Rt.prototype._setValue=je;var zt=class extends x{constructor({type:e,nullValues:t,dictionaryHashFunction:n}){super({type:new p(e.dictionary,e.indices,e.id,e.isOrdered)}),this._nulls=null,this._dictionaryOffset=0,this._keysToIndices=Object.create(null),this.indices=j({type:this.type.indices,nullValues:t}),this.dictionary=j({type:this.type.dictionary,nullValues:null}),typeof n==`function`&&(this.valueToKey=n)}get values(){return this.indices.values}get nullCount(){return this.indices.nullCount}get nullBitmap(){return this.indices.nullBitmap}get byteLength(){return this.indices.byteLength+this.dictionary.byteLength}get reservedLength(){return this.indices.reservedLength+this.dictionary.reservedLength}get reservedByteLength(){return this.indices.reservedByteLength+this.dictionary.reservedByteLength}isValid(e){return this.indices.isValid(e)}setValid(e,t){let n=this.indices;return t=n.setValid(e,t),this.length=n.length,t}setValue(e,t){let n=this._keysToIndices,r=this.valueToKey(t),i=n[r];return i===void 0&&(n[r]=i=this._dictionaryOffset+this.dictionary.append(t).length-1),this.indices.setValue(e,i)}flush(){let e=this.type,t=this._dictionary,n=this.dictionary.toVector(),r=this.indices.flush().clone(e);return r.dictionary=t?t.concat(n):n,this.finished||(this._dictionaryOffset+=n.length),this._dictionary=r.dictionary,this.clear(),r}finish(){return this.indices.finish(),this.dictionary.finish(),this._dictionaryOffset=0,this._keysToIndices=Object.create(null),super.finish()}clear(){return this.indices.clear(),this.dictionary.clear(),super.clear()}valueToKey(e){return typeof e==`string`?e:`${e}`}},Bt=class extends S{};Bt.prototype._setValue=_e;var Vt=class extends x{setValue(e,t){let[n]=this.children,r=e*this.stride;for(let e=-1,i=t.length;++e<i;)n.set(r+e,t[e])}addChild(e,t=`0`){if(this.numChildren>0)throw Error(`FixedSizeListBuilder can only have one child.`);let n=this.children.push(e);return this.type=new be(this.type.listSize,new h(t,e.type,!0)),n}},T=class extends S{setValue(e,t){this._values.set(e,t)}},Ht=class extends T{setValue(e,t){super.setValue(e,se(t))}},Ut=class extends T{},Wt=class extends T{},E=class extends S{};E.prototype._setValue=Ye;var Gt=class extends E{};Gt.prototype._setValue=ne;var Kt=class extends E{};Kt.prototype._setValue=ve;var D=class extends S{};D.prototype._setValue=Te;var qt=class extends D{};qt.prototype._setValue=Xe;var Jt=class extends D{};Jt.prototype._setValue=Ze;var Yt=class extends D{};Yt.prototype._setValue=Je;var Xt=class extends D{};Xt.prototype._setValue=Ee;var O=class extends S{setValue(e,t){this._values.set(e,t)}},Zt=class extends O{},Qt=class extends O{},$t=class extends O{},en=class extends O{},tn=class extends O{},nn=class extends O{},rn=class extends O{},an=class extends O{},on=class extends C{constructor(e){super(e),this._offsets=new Mt(e.type)}addChild(e,t=`0`){if(this.numChildren>0)throw Error(`ListBuilder can only have one child.`);return this.children[this.numChildren]=e,this.type=new ae(new h(t,e.type,!0)),this.numChildren-1}_flushPending(e){let t=this._offsets,[n]=this.children;for(let[r,i]of e)if(i===void 0)t.set(r,0);else{let e=i,a=e.length,o=t.set(r,a).buffer[r];for(let t=-1;++t<a;)n.set(o+t,e[t])}}},sn=class extends C{set(e,t){return super.set(e,t)}setValue(e,t){let n=t instanceof Map?t:new Map(Object.entries(t)),r=this._pending||=new Map,i=r.get(e);i&&(this._pendingLength-=i.size),this._pendingLength+=n.size,r.set(e,n)}addChild(e,t=`${this.numChildren}`){if(this.numChildren>0)throw Error(`ListBuilder can only have one child.`);return this.children[this.numChildren]=e,this.type=new le(new h(t,e.type,!0),this.type.keysSorted),this.numChildren-1}_flushPending(e){let t=this._offsets,[n]=this.children;for(let[r,i]of e)if(i===void 0)t.set(r,0);else{let{[r]:e,[r+1]:a}=t.set(r,i.size).buffer;for(let t of i.entries())if(n.set(e,t),++e>=a)break}}},cn=class extends x{setValue(e,t){}setValid(e,t){return this.length=Math.max(e+1,this.length),t}},ln=class extends x{setValue(e,t){let{children:n,type:r}=this;switch(Array.isArray(t)||t.constructor){case!0:return r.children.forEach((r,i)=>n[i].set(e,t[i]));case Map:return r.children.forEach((r,i)=>n[i].set(e,t.get(r.name)));default:return r.children.forEach((r,i)=>n[i].set(e,t[r.name]))}}setValid(e,t){return super.setValid(e,t)||this.children.forEach(n=>n.setValid(e,t)),t}addChild(e,t=`${this.numChildren}`){let n=this.children.push(e);return this.type=new ce([...this.type.children,new h(t,e.type,!0)]),n}},k=class extends S{};k.prototype._setValue=Pe;var un=class extends k{};un.prototype._setValue=ie;var dn=class extends k{};dn.prototype._setValue=fe;var fn=class extends k{};fn.prototype._setValue=de;var pn=class extends k{};pn.prototype._setValue=me;var A=class extends S{};A.prototype._setValue=m;var mn=class extends A{};mn.prototype._setValue=te;var hn=class extends A{};hn.prototype._setValue=pe;var gn=class extends A{};gn.prototype._setValue=re;var _n=class extends A{};_n.prototype._setValue=Fe;var vn=class extends x{constructor(e){super(e),this._typeIds=new b(Int8Array,0,1),typeof e.valueToChildTypeId==`function`&&(this._valueToChildTypeId=e.valueToChildTypeId)}get typeIdToChildIndex(){return this.type.typeIdToChildIndex}append(e,t){return this.set(this.length,e,t)}set(e,t,n){return n===void 0&&(n=this._valueToChildTypeId(this,t,e)),this.setValue(e,t,n),this}setValue(e,t,n){this._typeIds.set(e,n);let r=this.type.typeIdToChildIndex[n];this.children[r]?.set(e,t)}addChild(e,t=`${this.children.length}`){let n=this.children.push(e),{type:{children:r,mode:i,typeIds:a}}=this,o=[...r,new h(t,e.type)];return this.type=new Se(i,[...a,n],o),n}_valueToChildTypeId(e,t,n){throw Error("Cannot map UnionBuilder value to child typeId. Pass the `childTypeId` as the second argument to unionBuilder.append(), or supply a `valueToChildTypeId` function as part of the UnionBuilder constructor options.")}},yn=class extends vn{},bn=class extends vn{constructor(e){super(e),this._offsets=new b(Int32Array)}setValue(e,t,n){let r=this._typeIds.set(e,n).buffer[e],i=this.getChildAt(this.type.typeIdToChildIndex[r]),a=this._offsets.set(e,i.length).buffer[e];i?.set(a,t)}},xn=class extends C{constructor(e){super(e),this._values=new y(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,ze(t))}_flushPending(e,t){}};xn.prototype._flushPending=Nt.prototype._flushPending;var Sn=class extends C{constructor(e){super(e),this._values=new y(Uint8Array)}get byteLength(){let e=this._pendingLength+this.length*4;return this._offsets&&(e+=this._offsets.byteLength),this._values&&(e+=this._values.byteLength),this._nulls&&(e+=this._nulls.byteLength),e}setValue(e,t){return super.setValue(e,ze(t))}_flushPending(e,t){}};Sn.prototype._flushPending=Pt.prototype._flushPending;var Cn=new class extends ue{visitNull(){return cn}visitBool(){return Ft}visitInt(){return O}visitInt8(){return Zt}visitInt16(){return Qt}visitInt32(){return $t}visitInt64(){return en}visitUint8(){return tn}visitUint16(){return nn}visitUint32(){return rn}visitUint64(){return an}visitFloat(){return T}visitFloat16(){return Ht}visitFloat32(){return Ut}visitFloat64(){return Wt}visitUtf8(){return xn}visitLargeUtf8(){return Sn}visitBinary(){return Nt}visitLargeBinary(){return Pt}visitFixedSizeBinary(){return Bt}visitDate(){return w}visitDateDay(){return It}visitDateMillisecond(){return Lt}visitTimestamp(){return k}visitTimestampSecond(){return un}visitTimestampMillisecond(){return dn}visitTimestampMicrosecond(){return fn}visitTimestampNanosecond(){return pn}visitTime(){return A}visitTimeSecond(){return mn}visitTimeMillisecond(){return hn}visitTimeMicrosecond(){return gn}visitTimeNanosecond(){return _n}visitDecimal(){return Rt}visitList(){return on}visitStruct(){return ln}visitUnion(){return vn}visitDenseUnion(){return bn}visitSparseUnion(){return yn}visitDictionary(){return zt}visitInterval(){return E}visitIntervalDayTime(){return Gt}visitIntervalYearMonth(){return Kt}visitDuration(){return D}visitDurationSecond(){return qt}visitDurationMillisecond(){return Jt}visitDurationMicrosecond(){return Yt}visitDurationNanosecond(){return Xt}visitFixedSizeList(){return Vt}visitMap(){return sn}};function j(e){let t=e.type,n=new(Cn.getVisitFn(t)())(e);if(t.children&&t.children.length>0){let r=e.children||[],i={nullValues:e.nullValues},a=Array.isArray(r)?((e,t)=>r[t]||i):(({name:e})=>r[e]||i);for(let[e,r]of t.children.entries()){let{type:t}=r,i=a(r,e);n.children.push(j(Object.assign(Object.assign({},i),{type:t})))}}return n}function wn(e,t){if(e instanceof Ie||e instanceof Ge||e.type instanceof Qe||ArrayBuffer.isView(e))return De(e);let n=[...En({type:t??M(e),nullValues:[null]})(e)],r=n.length===1?n[0]:n.reduce((e,t)=>e.concat(t));return Qe.isDictionary(r.type)?r.memoize():r}function Tn(e){let t=wn(e);return new Ue(new Re(new Be(t.type.children),t.data[0]))}function M(e){if(e.length===0)return new He;let t=0,n=0,r=0,i=0,a=0,o=0,s=0,c=0;for(let l of e){if(l==null){++t;continue}switch(typeof l){case`bigint`:++o;continue;case`boolean`:++s;continue;case`number`:++i;continue;case`string`:++a;continue;case`object`:Array.isArray(l)?++n:Object.prototype.toString.call(l)===`[object Date]`?++c:++r;continue}throw TypeError(`Unable to infer Vector type from input values, explicit type declaration expected.`)}if(i+t===e.length)return new oe;if(a+t===e.length)return new p(new we,new ye);if(o+t===e.length)return new xe;if(s+t===e.length)return new ge;if(c+t===e.length)return new Ce;if(n+t===e.length){let t=e,n=M(t[t.findIndex(e=>e!=null)]);if(t.every(e=>e==null||Ne(n,M(e))))return new ae(new h(``,n,!0))}else if(r+t===e.length){let t=new Map;for(let n of e)for(let e of Object.keys(n))!t.has(e)&&n[e]!=null&&t.set(e,new h(e,M([n[e]]),!0));return new ce([...t.values()])}throw TypeError(`Unable to infer Vector type from input values, explicit type declaration expected.`)}function En(e){let{queueingStrategy:t=`count`}=e,{highWaterMark:n=t===`bytes`?2**14:1/0}=e,r=t===`bytes`?`byteLength`:`length`;return function*(t){let i=0,a=j(e);for(let e of t)a.append(e)[r]>=n&&++i&&(yield a.toVector());(a.finish().length>0||i===0)&&(yield a.toVector())}}var N=e();function Dn(e){return On(e)&&typeof e.ts==`string`&&typeof e.ms_played==`number`&&typeof e.track_name==`string`&&typeof e.artist_name==`string`&&typeof e.album_name==`string`}function On(e){return typeof e.track_uri==`string`}function kn(e){return e.ms_played>=3e4}var P=class{experimental=!1;validateFile(e){return this.filePattern.test(e.name)}validate(e){return e.filter(Dn)}filter(e){return e.filter(kn)}async processFile(e){let t=performance.now(),n=await this.readFile(e),r=this.transform(n),i=this.validate(r),a=this.filter(i);return $e.emit(`stream:parsed`,{provider:this.name,recordCount:a.length,durationMs:performance.now()-t}),a}},F=`_apple_music_tmp.csv`,An=class extends P{name=`apple-music`;displayName=`Apple Music`;acceptedFormats=`ZIP/CSV`;filePattern=/^Apple Music Play Activity\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(F,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${F}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(F)}}transform(e){return e.filter(e=>e[`Media Type`]===`AUDIO`&&e[`Container Origin Type`]!==`STREAM_RADIO_STATION`).map(e=>{let t=e[`Event Start Timestamp`],n=t instanceof Date?t.toISOString():typeof t==`number`||typeof t==`bigint`?new Date(Number(t)).toISOString():String(t??``),r=Number(e[`Play Duration Milliseconds`])||0;return{track_uri:`apple-music:${String(e[`Song Name`]??``)}`,track_name:String(e[`Song Name`]??``),artist_name:`Unknown Artist`,album_name:e[`Album Name`]==null?`Unknown Album`:String(e[`Album Name`]),ts:n,ms_played:Math.max(0,r),platform:e[`Device Type`]==null?`Unknown Device`:String(e[`Device Type`])}})}},I=`_custom_tmp.csv`,jn=class extends P{name=`custom`;displayName=`Custom`;acceptedFormats=`CSV`;filePattern=/^tracksy-custom\.csv$/i;fileContentType=`text/csv`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(I,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${I}', header=true, all_varchar=true)`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to parse custom CSV. Check that the file has all required columns: ts, track_name, artist_name, album_name, ms_played, track_uri, platform.`,{cause:e})}finally{await n.dropFile(I)}}transform(e){return e.flatMap(e=>{let t=e.ts==null?void 0:String(e.ts),n=e.track_uri==null?void 0:String(e.track_uri);return t===void 0||n===void 0?[]:[{ts:t,track_uri:n,track_name:String(e.track_name??`Unknown Track`),artist_name:String(e.artist_name??`Unknown Artist`),album_name:String(e.album_name??`Unknown Album`),ms_played:Math.max(0,Number(e.ms_played)||0),platform:String(e.platform??`Unknown Device`)}]})}},Mn=`10_listeningHistory`,L=`_deezer_tmp.xlsx`,Nn=class extends P{name=`deezer`;displayName=`Deezer`;acceptedFormats=`XLSX`;filePattern=/^deezer-data_\d+\.xlsx$/i;fileContentType=`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(L,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_xlsx('${L}', sheet='${Mn}')`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to read Deezer export: sheet "${Mn}" not found. Make sure the file is a valid Deezer listening history export.`,{cause:e})}finally{await n.dropFile(L)}}transform(e){return e.map(e=>{let t=Number(e[`Listening Time`])||0,n=t>0?t*1e3:0;return{track_uri:e.ISRC,track_name:e[`Song Title`],artist_name:e.Artist,album_name:e[`Album Title`],ts:e.Date.replace(` `,`T`)+`Z`,ms_played:n,ip_addr:e[`IP Address`],platform:e[`Platform Name`]}})}},R=`_jellyfin_tmp.csv`,Pn=class extends P{name=`jellyfin`;displayName=`JellyFin`;acceptedFormats=`CSV`;filePattern=/^playback_report\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await g();await n.registerFileBuffer(R,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${R}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(R)}}transform(e){return e.filter(e=>e.ItemType===`Audio`).map(e=>{let t=Number(e.PlayDuration);return{track_uri:`jellyfin:${e.ItemId}`,track_name:e.ItemName,artist_name:``,album_name:``,ts:e.DateCreated instanceof Date?e.DateCreated.toISOString():typeof e.DateCreated==`number`||typeof e.DateCreated==`bigint`?new Date(Number(e.DateCreated)).toISOString():String(e.DateCreated).replace(` `,`T`)+`Z`,ms_played:t>0?t*1e3:0,platform:e.ClientName}})}},z=[new class extends P{name=`spotify`;displayName=`Spotify`;acceptedFormats=`ZIP/JSON`;filePattern=/^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i;fileContentType=`application/json`;async readFile(e){let t=await e.text(),n=JSON.parse(t);if(!Array.isArray(n))throw Error(`Expected JSON array of streaming records`);return n}transform(e){return e.map(({spotify_track_uri:e,master_metadata_track_name:t,master_metadata_album_artist_name:n,master_metadata_album_album_name:r,...i})=>({...i,track_uri:e,track_name:t,artist_name:n,album_name:r}))}},new Nn,new An,new jn,new Pn],Fn=z.map(e=>e.fileContentType);function In(e){for(let t of z)if(t.validateFile(e))return t}var Ln=e=>Fn.some(t=>t===e.type);function B(){return z.filter(e=>!e.experimental).map(e=>`${e.displayName} (${e.acceptedFormats})`)}var Rn=`application/zip`,zn=e=>e.type===Rn,V=We();function Bn({handleDrop:e,handleDragOver:t,handleFileUpload:n,contentTypeAccepted:r,contentTypeAcceptedMessage:i}){return(0,V.jsx)(`div`,{children:(0,V.jsxs)(`div`,{className:`flex flex-col items-center justify-center p-6 border border-2 border-dashed border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-200 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-all cursor-pointer`,onDrop:e,"aria-label":`dropzone`,onDragOver:t,children:[(0,V.jsx)(`input`,{type:`file`,className:`hidden`,id:`fileInput`,"aria-label":`upload file`,onChange:n,accept:r}),(0,V.jsxs)(`label`,{htmlFor:`fileInput`,className:`text-sm cursor-pointer text-center`,children:[`Drag and drop or click to upload your music streaming data files`,(0,V.jsx)(`br`,{}),i]})]})})}var Vn=e=>{let t=new DataTransfer;return e.forEach(e=>t.items.add(e)),t.files},Hn=Symbol(`Comlink.proxy`),Un=Symbol(`Comlink.endpoint`),Wn=Symbol(`Comlink.releaseProxy`),H=Symbol(`Comlink.finalizer`),U=Symbol(`Comlink.thrown`),Gn=e=>typeof e==`object`&&!!e||typeof e==`function`,Kn=new Map([[`proxy`,{canHandle:e=>Gn(e)&&e[Hn],serialize(e){let{port1:t,port2:n}=new MessageChannel;return qn(e,t),[n,[n]]},deserialize:e=>(e.start(),Yn(e))}],[`throw`,{canHandle:e=>Gn(e)&&U in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(Error(e.value.message),e.value):e.value}}]]);function qn(e,t=globalThis,n=[`*`]){t.addEventListener(`message`,(function r(i){if(!i||!i.data)return;if(!function(e,t){for(let n of e)if(t===n||n===`*`||n instanceof RegExp&&n.test(t))return!0;return!1}(n,i.origin))return void console.warn(`Invalid origin '${i.origin}' for comlink proxy`);let{id:a,type:o,path:s}=Object.assign({path:[]},i.data),c=(i.data.argumentList||[]).map(X),l;try{let t=s.slice(0,-1).reduce(((e,t)=>e[t]),e),n=s.reduce(((e,t)=>e[t]),e);switch(o){case`GET`:l=n;break;case`SET`:t[s.slice(-1)[0]]=X(i.data.value),l=!0;break;case`APPLY`:l=n.apply(t,c);break;case`CONSTRUCT`:l=J(new n(...c));break;case`ENDPOINT`:{let{port1:t,port2:n}=new MessageChannel;qn(e,n),l=function(e,t){return Qn.set(e,t),e}(t,[t])}break;case`RELEASE`:l=void 0;break;default:return}}catch(e){l={value:e,[U]:0}}Promise.resolve(l).catch((e=>({value:e,[U]:0}))).then((n=>{let[i,s]=Y(n);t.postMessage(Object.assign(Object.assign({},i),{id:a}),s),o===`RELEASE`&&(t.removeEventListener(`message`,r),Jn(t),H in e&&typeof e[H]==`function`&&e[H]())})).catch((e=>{let[n,r]=Y({value:TypeError(`Unserializable return value`),[U]:0});t.postMessage(Object.assign(Object.assign({},n),{id:a}),r)}))})),t.start&&t.start()}function Jn(e){(function(e){return e.constructor.name===`MessagePort`})(e)&&e.close()}function Yn(e,t){return q(e,[],t)}function W(e){if(e)throw Error(`Proxy has been released and is not useable`)}function Xn(e){return Z(e,{type:`RELEASE`}).then((()=>{Jn(e)}))}var G=new WeakMap,K=`FinalizationRegistry`in globalThis&&new FinalizationRegistry((e=>{let t=(G.get(e)||0)-1;G.set(e,t),t===0&&Xn(e)}));function q(e,t=[],n=function(){}){let r=!1,i=new Proxy(n,{get(n,a){if(W(r),a===Wn)return()=>{(function(e){K&&K.unregister(e)})(i),Xn(e),r=!0};if(a===`then`){if(t.length===0)return{then:()=>i};let n=Z(e,{type:`GET`,path:t.map((e=>e.toString()))}).then(X);return n.then.bind(n)}return q(e,[...t,a])},set(n,i,a){W(r);let[o,s]=Y(a);return Z(e,{type:`SET`,path:[...t,i].map((e=>e.toString())),value:o},s).then(X)},apply(n,i,a){W(r);let o=t[t.length-1];if(o===Un)return Z(e,{type:`ENDPOINT`}).then(X);if(o===`bind`)return q(e,t.slice(0,-1));let[s,c]=Zn(a);return Z(e,{type:`APPLY`,path:t.map((e=>e.toString())),argumentList:s},c).then(X)},construct(n,i){W(r);let[a,o]=Zn(i);return Z(e,{type:`CONSTRUCT`,path:t.map((e=>e.toString())),argumentList:a},o).then(X)}});return function(e,t){let n=(G.get(t)||0)+1;G.set(t,n),K&&K.register(e,t,e)}(i,e),i}function Zn(e){let t=e.map(Y);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}var Qn=new WeakMap;function J(e){return Object.assign(e,{[Hn]:!0})}function Y(e){for(let[t,n]of Kn)if(n.canHandle(e)){let[r,i]=n.serialize(e);return[{type:`HANDLER`,name:t,value:r},i]}return[{type:`RAW`,value:e},Qn.get(e)||[]]}function X(e){switch(e.type){case`HANDLER`:return Kn.get(e.name).deserialize(e.value);case`RAW`:return e.value}}function Z(e,t,n){return new Promise((r=>{let i=[,,,,].fill(0).map((()=>Math.floor(Math.random()*(2**53-1)).toString(16))).join(`-`);e.addEventListener(`message`,(function t(n){n.data&&n.data.id&&n.data.id===i&&(e.removeEventListener(`message`,t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:i},t),n)}))}var $n=class{constructor(e,t,n,r,i){this._name=e,this._size=t,this._path=n,this._lastModified=r,this._archiveRef=i}get name(){return this._name}get size(){return this._size}get lastModified(){return this._lastModified}extract(){return this._archiveRef.extractSingleFile(this._path)}};function er(e){if(e instanceof File||e instanceof $n||e===null)return e;let t={};for(let n of Object.keys(e))t[n]=er(e[n]);return t}function tr(e,t=``){let n=[];for(let r of Object.keys(e))e[r]instanceof File||e[r]instanceof $n||e[r]===null?n.push({file:e[r]||r,path:t}):n.push(...tr(e[r],`${t}${r}/`));return n}function nr(e,t){let n=t.split(`/`);n[n.length-1]===``&&n.pop();let r=e,i=null;for(let e of n)r[e]=r[e]||{},i=r,r=r[e];return[i,n[n.length-1]]}var rr=class{constructor(e,t,n){this._content={},this._processed=0,this.file=e,this.client=t,this.worker=n}open(){return this._content={},this._processed=0,new Promise(((e,t)=>{this.client.open(this.file,J((()=>{e(this)})))}))}async close(){var e;(e=this.worker)==null||e.terminate(),this.worker=null,this.client=null,this.file=null}async hasEncryptedData(){return await this.client.hasEncryptedData()}async usePassword(e){await this.client.usePassword(e)}async setLocale(e){await this.client.setLocale(e)}async getFilesObject(){return this._processed>0?Promise.resolve().then((()=>this._content)):((await this.client.listFiles()).forEach((e=>{let[t,n]=nr(this._content,e.path);e.type===`FILE`&&(t[n]=new $n(e.fileName,e.size,e.path,e.lastModified,this))})),this._processed=1,er(this._content))}getFilesArray(){return this.getFilesObject().then((e=>tr(e)))}async extractSingleFile(e){if(this.worker===null)throw Error(`Archive already closed`);let t=await this.client.extractSingleFile(e);return new File([t.fileData],t.fileName,{type:`application/octet-stream`,lastModified:t.lastModified/1e6})}async extractFiles(e=void 0){var t;return this._processed>1?Promise.resolve().then((()=>this._content)):((await this.client.extractFiles()).forEach((t=>{let[n,r]=nr(this._content,t.path);t.type===`FILE`&&(n[r]=new File([t.fileData],t.fileName,{type:`application/octet-stream`}),e!==void 0&&setTimeout(e.bind(null,{file:n[r],path:t.path})))})),this._processed=2,(t=this.worker)==null||t.terminate(),er(this._content))}},ir,ar;(function(e){e.SEVEN_ZIP=`7zip`,e.AR=`ar`,e.ARBSD=`arbsd`,e.ARGNU=`argnu`,e.ARSVR4=`arsvr4`,e.BIN=`bin`,e.BSDTAR=`bsdtar`,e.CD9660=`cd9660`,e.CPIO=`cpio`,e.GNUTAR=`gnutar`,e.ISO=`iso`,e.ISO9660=`iso9660`,e.MTREE=`mtree`,e.MTREE_CLASSIC=`mtree-classic`,e.NEWC=`newc`,e.ODC=`odc`,e.OLDTAR=`oldtar`,e.PAX=`pax`,e.PAXR=`paxr`,e.POSIX=`posix`,e.PWB=`pwb`,e.RAW=`raw`,e.RPAX=`rpax`,e.SHAR=`shar`,e.SHARDUMP=`shardump`,e.USTAR=`ustar`,e.V7TAR=`v7tar`,e.V7=`v7`,e.WARC=`warc`,e.XAR=`xar`,e.ZIP=`zip`})(ir||={}),function(e){e.B64ENCODE=`b64encode`,e.BZIP2=`bzip2`,e.COMPRESS=`compress`,e.GRZIP=`grzip`,e.GZIP=`gzip`,e.LRZIP=`lrzip`,e.LZ4=`lz4`,e.LZIP=`lzip`,e.LZMA=`lzma`,e.LZOP=`lzop`,e.UUENCODE=`uuencode`,e.XZ=`xz`,e.ZSTD=`zstd`,e.NONE=`none`}(ar||={});var or=class e{static init(t=null){return e._options=t||{},e._options}static async open(t){let n=e.getWorker(e._options);return await new rr(t,await e.getClient(n,e._options),n).open()}static async write({files:t,outputFileName:n,compression:r,format:i,passphrase:a=null}){let o=e.getWorker(e._options),s=await(await e.getClient(o,e._options)).writeArchive(t,r,i,a);return o.terminate(),new File([s],n,{type:`application/octet-stream`})}static getWorker(e){return e.getWorker?e.getWorker():new Worker(e.workerUrl||new URL(`/tracksy/pr-preview/pr-536/_astro/worker-bundle.Dx5mKZOL.js`,``+import.meta.url),{type:`module`})}static async getClient(e,t){let n=t.createClient?.call(t,e)||Yn(e),{promise:r,resolve:i}=Promise.withResolvers(),a=await new n(J((()=>{i()})));return await r,a}};or._options={},Promise.withResolvers||(Promise.withResolvers=function(){var e,t,n=new this((function(n,r){e=n,t=r}));return{resolve:e,reject:t,promise:n}});var sr=`/tracksy/pr-preview/pr-536/_astro/worker-bundle.Dx5mKZOL.js`;async function cr(e){return or.init({workerUrl:sr}),await or.open(e)}var lr=[`__MACOSX`];function ur(e){return lr.some(t=>e.startsWith(t))}function dr(e){return e.name.toLowerCase().endsWith(`.zip`)}async function fr(e){let t=await(await cr(e)).extractFiles(),n=Object.entries(t).filter(([e])=>!ur(e)).flatMap(([,e])=>e instanceof File?[e]:Object.values(e)).filter(e=>!ur(e.name)),r=[];for(let e of n)if(dr(e)){let t=await fr(e);r.push(...t)}else r.push(e);return r}var Q={UNSUPPORTED_CONTENT_TYPE:`One or more files have an unsupported content type`,NO_FILES_IN_ARCHIVE:`No files found in the archive`,NO_VALID_RECORDS:`No valid stream records found`,NO_FILE_TO_PROCESS:`No file to process`};function pr(e){let t=e instanceof Error?e.message:``;return t===Q.UNSUPPORTED_CONTENT_TYPE?`Unsupported file type. Supported: ${B().join(`, `)}.`:t===Q.NO_FILES_IN_ARCHIVE?`The ZIP archive is empty or unreadable.`:t===Q.NO_VALID_RECORDS?`No streaming export recognized. Supported: ${B().join(`, `)}.`:t===Q.NO_FILE_TO_PROCESS?`No file received. Try again.`:`Upload failed. Check the file and try again.`}function mr({onSuccess:e,onFail:t}){let n=e=>{if(Array.from(e).filter(e=>Ln(e)||zn(e)).length!==e.length)throw Error(Q.UNSUPPORTED_CONTENT_TYPE)},r=async e=>{let t=await fr(e);if(t.length===0)throw Error(Q.NO_FILES_IN_ARCHIVE);return Vn(t)};return{uploadFiles:async i=>{try{n(i),e(i.length===1&&zn(i[0])?await r(i[0]):i)}catch(e){console.error(`Error while processing files:`,e),t(e)}}}}function hr({handleValidatedFiles:e,onFail:t=()=>{}}){let{uploadFiles:n}=mr({onSuccess:t=>e(t),onFail:t});return(0,V.jsx)(Bn,{handleDrop:async e=>{e.preventDefault();let t=e.dataTransfer.files;console.debug(`Dragged in files:`,Array.from(t)),await n(t)},handleDragOver:e=>{e.preventDefault()},handleFileUpload:async e=>{let t=e.target.files;t!==null&&(console.debug(`Uploaded files:`,Array.from(t)),await n(t))},contentTypeAccepted:[...Fn,Rn].join(`,`),contentTypeAcceptedMessage:(0,V.jsxs)(V.Fragment,{children:[`Only `,(0,V.jsx)(`strong`,{children:B().join(`, `)}),` are accepted`]})})}var gr=[[nt,`select
    ts::date as stream_date,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from \${table}
where ts is not null
group by ts::date
order by stream_date
`],[rt,`select
    artist_name,
    min(year(ts::date))::integer as first_year
from \${table}
where
    artist_name is not null
    and ts is not null
group by artist_name
`],[tt,`with ordered as (
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
`],[et,`select
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from \${table}
`]],_r=1+gr.length;async function vr(e,t=Intl.DateTimeFormat().resolvedOptions().timeZone,n){await e.query(`DROP VIEW IF EXISTS ${_}`),await e.query(`DROP TABLE IF EXISTS ${_}`),await e.query(`CREATE TABLE ${_} AS SELECT * EXCLUDE (ts), (ts::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${t}') AS ts FROM ${v}`),n?.(`Computing statistics…`,Math.round(1/_r*100));for(let[t,[r,i]]of gr.entries())await e.query(`DROP TABLE IF EXISTS ${r}`),await e.query(`CREATE TABLE ${r} AS\n${i.replaceAll("${table}",_)}`),n?.(`Computing statistics…`,Math.round((t+2)/_r*100))}async function yr(e,t){if(e.length<1)throw console.error(`No file to process`),Error(`No file to process`);let n=[],r=Array.from(e);for(let[e,i]of r.entries()){console.debug(`File ${i.name} is being processed.`),t?.(`Parsing records…`,Math.round(e/r.length*50));let a=In(i);if(!a){console.warn(`File ${i.name} does not match any known provider. Skipping.`);continue}console.debug(`File ${i.name} detected as ${a.displayName} format.`);let o=await a.processFile(i);n.push(...o)}if(t?.(`Parsing records…`,50),n.length===0)throw console.error(`No valid stream records found`),Error(`No valid stream records found`);let a=Tn(n),{conn:o}=await g();t?.(`Loading into database…`,50),await o.query(`DROP TABLE IF EXISTS ${v}`),console.debug(`Table ${v} dropped.`),await o.insertArrowTable(a,{name:v,create:!0}),console.debug(`Table ${v} created with ${n.length} records.`),t?.(`Loading into database…`,70),await vr(o,void 0,(e,n)=>t?.(`Computing statistics…`,70+Math.round(n*.3))),i()}function br({stage:e,percent:t}){return(0,V.jsxs)(`div`,{className:`w-full max-w-sm mx-auto flex flex-col gap-2`,children:[(0,V.jsx)(`p`,{className:`text-sm text-center text-gray-500 dark:text-slate-400`,children:e}),(0,V.jsx)(`div`,{className:`h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden`,children:(0,V.jsx)(`div`,{className:`h-full rounded-full bg-gradient-brand transition-all duration-300 ease-out`,style:{width:`${t}%`}})})]})}function xr({label:e,tooltip:t,handleClick:n}){return(0,V.jsx)(`button`,{type:`button`,title:t,className:`px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,onClick:n,children:(0,V.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}function Sr({label:e,tooltip:t}){return(0,V.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy?tab=readme-ov-file#%EF%B8%8F-download-your-data`,title:t,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,children:(0,V.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}async function Cr(e,t){t?.(`Fetching demo data…`,0);let n=await fetch(e.toString());if(!n.ok)throw Error(`Failed to fetch demo data: ${n.statusText}`);let r=await n.blob(),a=e.pathname.split(`/`).pop()||`streaming_data.json`,o=new File([r],a,{type:`application/json`});t?.(`Fetching demo data…`,25);let s=In(o);if(!s)throw Error(`No provider found for the demo data URL`);t?.(`Parsing records…`,25);let c=await s.processFile(o);if(c.length===0)throw Error(`No valid stream records found in demo data`);t?.(`Parsing records…`,50);let l=Tn(c),{conn:u}=await g();t?.(`Loading into database…`,50),await u.query(`DROP TABLE IF EXISTS ${v}`),await u.insertArrowTable(l,{name:v,create:!0}),t?.(`Loading into database…`,70),await vr(u,void 0,(e,n)=>t?.(`Computing statistics…`,70+Math.round(n*.3))),i()}function wr(){let[e,t]=(0,N.useState)(!1),[n,r]=(0,N.useState)(null),i=(()=>{let e=`https://huggingface.co/datasets/tracksy/synthetic-datasets/resolve/main/datasets/spotify/Streaming_History_Audio_2006_25000.json`;try{return new URL(e)}catch{console.warn(`Invalid PUBLIC_DEMO_JSON_URL environment variable:`,{url:e});return}})();return{isDemoReady:e,handleDemoButtonClick:async()=>{if(t(!1),r(null),i)try{await Cr(i,(e,t)=>r({stage:e,percent:t})),t(!0)}catch{t(!1)}finally{r(null)}},demoJsonUrl:i,demoProgress:n}}var Tr=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 6 and hour(ts::datetime) < 12)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,Er=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 12 and hour(ts::datetime) < 18)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,Dr=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 18 and hour(ts::datetime) < 24)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,Or=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    hour(ts::datetime) < 6
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,kr=`select
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
`,Ar=`with
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
`,jr=`with
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
`,Mr=`with
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
`,Nr=`select
    artist_name as entity,
    count(distinct strftime(ts::date, '%Y-%m'))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric desc
limit 1
`,Pr=`with
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
`,Fr=`select
    artist_name as entity,
    min(year(ts::date))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric asc
limit 1
`,Ir=`with
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
`,Lr=`with
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
`,Rr=`with
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
`,zr=`with
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
`,Br=`select
    track_name as entity,
    artist_name as parent_entity
from \${table}
where track_name is not null
USING SAMPLE 1
`,Vr=`with max_date as (
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
`,$=e=>e.replaceAll("${table}",_),Hr=[{fact_type:`morning_favorite`,title:`🌅 Musical Breakfast`,emoji:`🥐`,unit:`streams`,context:`between 6am and 12pm`,sql:$(Tr)},{fact_type:`afternoon_favorite`,title:`🏞️ Afternoon Boost`,emoji:`⚡️`,unit:`streams`,context:`between 12pm and 6pm`,sql:$(Er)},{fact_type:`evening_favorite`,title:`🌆 Calm Return`,emoji:`🛋️`,unit:`streams`,context:`between 6pm and 0am`,sql:$(Dr)},{fact_type:`night_favorite`,title:`🌌 Musical Insomnia`,emoji:`💤`,unit:`streams`,context:`between 0am and 6am`,sql:$(Or)},{fact_type:`weekend_favorite`,title:`🧉 Weekend Vibes`,emoji:`🕺`,unit:`streams`,context:`on weekends`,sql:$(kr)},{fact_type:`nostalgic_return`,title:`📻 Signal Found`,emoji:`🛰️`,unit:`days`,context:`later, it's back`,sql:$(Ar)},{fact_type:`forgotten_artist`,title:`🥀 Fading Away`,emoji:`🌫️`,unit:`days`,context:`off your radar`,sql:$(jr)},{fact_type:`absolute_loyalty`,title:`💎 Absolute Loyalty`,emoji:`💍`,unit:`%`,context:`of your plays went all the way`,sql:$(Mr)},{fact_type:`subscribed_artist`,title:`🎟️ Monthly Subscription`,emoji:`📬`,unit:`months`,context:`in your rotation`,sql:$(Nr)},{fact_type:`musical_anniversary`,title:`🎉 Musical Anniversary`,emoji:`🎂`,unit:`years`,context:`strong`,sql:$(Pr)},{fact_type:`first_artist`,title:`1️⃣ The Very First`,emoji:`🦖`,unit:void 0,context:`still in your rotation today?`,sql:$(Fr)},{fact_type:`one_hit_wonder`,title:`⭐ One Hit Wonder`,emoji:`📼`,unit:`%`,context:`of your streams of`,sql:$(Ir)},{fact_type:`current_obsession`,title:`🔁 Current Obsession`,emoji:`🎯`,unit:`streams`,context:`in the last 30 days`,sql:$(Lr)},{fact_type:`recent_discovery`,title:`🔍 Recent Discovery`,emoji:`✨`,unit:`streams`,context:`discovered in the last 3 months`,sql:$(Rr)},{fact_type:`marathon`,title:`🏃 Marathon`,emoji:`☄️`,unit:`streams in a row`,context:`one uninterrupted run on`,sql:$(zr)},{fact_type:`track_proposition`,title:`▶️ Up Next`,emoji:`🔮`,unit:void 0,context:`your next listen is already waiting`,sql:$(Br)},{fact_type:`cozy_album`,title:`💿 Cozy Album`,emoji:`☁️`,unit:void 0,context:`the album that wraps your Sundays in musical coziness`,sql:$(Vr)}],Ur=()=>(0,V.jsx)(`p`,{className:`text-lg text-gray-600 dark:text-gray-300 italic`,children:`Not enough data for this fun fact — keep listening!`}),Wr=({fact:e,error:t,isLoading:n})=>{if(n&&!e?.entity)return(0,V.jsxs)(`div`,{className:`space-y-2 animate-pulse`,children:[(0,V.jsx)(`div`,{className:`h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4`}),(0,V.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-full`}),(0,V.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6`})]});if(t)return(0,V.jsx)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:`Something went wrong while loading fun facts`});if(!e?.entity)return(0,V.jsx)(Ur,{});let{entity:r,parent_entity:i,metric:a,unit:o,context:s}=e;return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`div`,{className:`text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 break-words text-balance`,children:r}),i&&(0,V.jsx)(`div`,{className:`text-base text-gray-500 dark:text-gray-400 mb-1`,children:i}),a!==void 0&&(0,V.jsxs)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:[(0,V.jsxs)(`span`,{className:`font-bold text-blue-600 dark:text-blue-400`,children:[a.toLocaleString(),o===`%`?o:``]}),o&&o!==`%`&&` ${o}`]}),s&&(0,V.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400 mt-1 italic`,children:s})]})},Gr=({fact:e,error:t,onRefresh:n,isLoading:r})=>(0,V.jsxs)(`div`,{className:`col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl shadow border border-purple-100 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:[(0,V.jsx)(`div`,{className:`absolute top-0 right-0 p-4 transition-opacity`,children:(0,V.jsx)(`button`,{onClick:n,disabled:r,className:`p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`,title:`New fact`,children:(0,V.jsx)(`span`,{className:`block text-xl ${r?`animate-spin`:``}`,children:`🔄`})})}),(0,V.jsxs)(`div`,{className:`flex flex-col md:flex-row items-center gap-6`,"data-fact-type":e?.fact_type,children:[(0,V.jsx)(`div`,{className:`text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow`,children:e?.emoji}),(0,V.jsxs)(`div`,{className:`flex-1 text-center md:text-left`,children:[(0,V.jsx)(`div`,{className:`text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2`,children:e?.title}),(0,V.jsx)(Wr,{fact:e,error:t,isLoading:r})]})]})]}),Kr=e=>[...e].sort(()=>Math.random()-.5);function qr(){let[e,t]=(0,N.useState)(void 0),[n,i]=(0,N.useState)(!0),[a,o]=(0,N.useState)(void 0),s=(0,N.useRef)(new Set),c=(0,N.useCallback)(async()=>{i(!0),o(void 0);try{s.current.size===Hr.length&&s.current.clear();let e=Hr.filter(e=>!s.current.has(e.fact_type)),[n]=Kr(e.length>0?e:Hr);s.current.add(n.fact_type);let[r]=await f(n.sql);t({title:n.title,emoji:n.emoji,fact_type:n.fact_type,entity:r?.entity??void 0,parent_entity:r?.parent_entity,metric:r?.metric,unit:n.unit,context:[n.context,r?.context_suffix].filter(Boolean).join(` `)})}catch(e){console.error(`Error loading fun fact:`,e),o(e instanceof Error?e.message:`Failed to load fun fact`)}finally{i(!1)}},[]);return(0,N.useEffect)(()=>{c()},[c]),(0,N.useEffect)(()=>{let e=()=>{s.current.clear(),c()};return window.addEventListener(r,e),()=>window.removeEventListener(r,e)},[c]),(0,V.jsx)(Gr,{fact:e,onRefresh:c,isLoading:n,error:a})}var Jr=`with
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
`;function Yr(e){let t=l(e);return Jr.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var Xr=e=>{let t=t=>e.find(e=>e.stream_bin===t)?.share_of_total_streams||0,n=t(`1`),r=t(`2-10`),i=t(`11-100`),a=t(`101-1000`),o=t(`1000+`),s=n+r,c=i,l=a+o;return l>.6?{label:`Ultra Loyal`,emoji:`🔥`}:s>.6?{label:`Explorer`,emoji:`🔍`}:l>s?{label:`Favorites Driven`,emoji:`❤️`}:c>.4?{label:`Balanced Regular`,emoji:`⚖️`}:{label:`Curious`,emoji:`🧐`}},Zr=({data:e,isLoading:n})=>{let r=(e??[]).reduce((e,t)=>e+t.artist_count,0),i=Xr(e??[]),a=[{label:`1 stream`,value:(e?.[0]?.share_of_total_streams??0)*100,color:`bg-teal-400`,textColor:`text-teal-700 dark:text-teal-400`},{label:`2-10 streams`,value:(e?.[1]?.share_of_total_streams??0)*100,color:`bg-orange-400`,textColor:`text-orange-700 dark:text-orange-400`},{label:`11-100 streams`,value:(e?.[2]?.share_of_total_streams??0)*100,color:`bg-violet-400`,textColor:`text-violet-700 dark:text-violet-400`},{label:`101-1000 streams`,value:(e?.[3]?.share_of_total_streams??0)*100,color:`bg-blue-400`,textColor:`text-blue-700 dark:text-blue-400`},{label:`1000+ streams`,value:(e?.[4]?.share_of_total_streams??0)*100,color:`bg-rose-500`,textColor:`text-rose-700 dark:text-rose-400`}];return(0,V.jsx)(t,{title:`Artist Loyalty`,emoji:`🤝`,isLoading:n,question:`How loyal am I to my favorite artists?`,className:`h-full`,children:e?.length?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(ot,{label:i.label,sublabel:`${r.toLocaleString()} artists`,emoji:i.emoji}),(0,V.jsx)(`div`,{className:`space-y-2`,children:a.map(e=>(0,V.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,V.jsx)(`div`,{className:`w-3 h-3 rounded-full ${e.color} flex-shrink-0`}),(0,V.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,V.jsx)(`div`,{className:`flex justify-between items-center text-sm`,children:(0,V.jsx)(`span`,{className:`text-gray-600 dark:text-gray-400`,children:e.label})}),(0,V.jsx)(`div`,{className:`w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden`,children:(0,V.jsx)(`div`,{className:`${e.color} h-1.5 rounded-full`,style:{width:`${e.value}%`}})})]}),(0,V.jsxs)(`div`,{className:`text-sm font-medium ${e.textColor} w-14 text-right`,children:[e.value.toFixed(0),`%`]})]},e.label))})]}):(0,V.jsx)(o,{})})};function Qr({year:e}){let{data:t,isLoading:n}=s({query:Yr(e),year:e});return(0,V.jsx)(Zr,{data:t,isLoading:n})}var $r=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(sum(ms_played) / 3600000.0 as double) as hours_played
from \${table}
where \${year_condition}
group by cast(ts as date)
order by hours_played desc
limit 1
`;function ei(e){let t=l(e);return $r.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function ti(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}function ni(e){let t=Math.floor(e),n=Math.round((e-t)*60);return n===0?`${t}h`:`${t}h ${n}min`}var ri=({data:e,isLoading:n,year:r})=>(0,V.jsx)(t,{title:`Deep Dive`,emoji:`🎧`,isLoading:n,question:r===void 0?`What's my most immersive day ever?`:`What's my most immersive day in ${r}?`,children:e?.hours_played?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(ot,{label:ni(e.hours_played),sublabel:`in a day`}),(0,V.jsx)(d,{children:ti(e.stream_date)})]}):(0,V.jsx)(o,{})});function ii({year:e}){let{data:t,isLoading:r}=n({query:ei(e),year:e});return(0,V.jsx)(ri,{data:t,isLoading:r,year:e})}var ai=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(count(distinct artist_name) as integer) as artist_count
from \${table}
where \${year_condition}
group by cast(ts as date)
order by artist_count desc
limit 1
`;function oi(e){let t=l(e);return ai.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function si(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}var ci=({data:e,isLoading:n,year:r})=>(0,V.jsx)(t,{title:`Eclectic Day`,emoji:`🎨`,isLoading:n,question:r===void 0?`My most diverse listening day ever?`:`My most diverse listening day in ${r}?`,children:e?.artist_count?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(ot,{label:String(e.artist_count),sublabel:`different artists`}),(0,V.jsx)(d,{children:si(e.stream_date)})]}):(0,V.jsx)(o,{})});function li({year:e}){let{data:t,isLoading:r}=n({query:oi(e),year:e});return(0,V.jsx)(ci,{data:t,isLoading:r,year:e})}function ui(){let[e,t]=(0,N.useState)(void 0),[n,i]=(0,N.useState)(),a=Et(e,250),o=(0,N.useCallback)(async()=>{try{let e=await f(wt);i(e[0]||void 0)}catch{}},[]);return(0,N.useEffect)(()=>{o()},[o]),(0,N.useEffect)(()=>(window.addEventListener(r,o),()=>window.removeEventListener(r,o)),[o]),(0,N.useEffect)(()=>{n&&t(new Date(Number(n.max_datetime)).getFullYear())},[n]),(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`div`,{className:`mt-4 mb-6`,children:(0,V.jsx)(qr,{})}),n&&(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(Tt,{value:e,min:new Date(Number(n.min_datetime)).getFullYear(),max:new Date(Number(n.max_datetime)).getFullYear(),onChange:t}),(0,V.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`,children:[(0,V.jsx)(ft,{year:a}),(0,V.jsx)(gt,{year:a}),(0,V.jsx)(at,{year:a}),(0,V.jsx)(`div`,{className:`md:col-span-3`,children:(0,V.jsx)(pt,{year:a})}),(0,V.jsx)(St,{year:a}),(0,V.jsx)(Ct,{year:a}),(0,V.jsx)(xt,{year:a}),(0,V.jsx)(`div`,{className:`md:col-span-2`,children:(0,V.jsx)(ut,{year:a})}),(0,V.jsx)(it,{year:a}),(0,V.jsx)(dt,{year:a}),(0,V.jsx)(`div`,{className:`row-span-2`,children:(0,V.jsx)(Qr,{year:a})}),(0,V.jsx)(mt,{year:a}),(0,V.jsx)(`div`,{className:`row-span-2`,children:(0,V.jsx)(vt,{year:a})}),(0,V.jsx)(_t,{year:a}),(0,V.jsx)(`div`,{className:`row-span-3 md:col-span-2`,children:(0,V.jsx)(st,{year:a})}),(0,V.jsx)(lt,{year:a}),(0,V.jsx)(ct,{year:a}),(0,V.jsx)(bt,{year:a}),(0,V.jsx)(ii,{year:a}),(0,V.jsx)(li,{year:a})]})]})]})}function di(){return(0,V.jsxs)(`svg`,{width:`50`,height:`50`,viewBox:`0 0 50 50`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,V.jsx)(`defs`,{children:(0,V.jsxs)(`linearGradient`,{id:`spinner-gradient`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,V.jsx)(`stop`,{offset:`0%`,style:{stopColor:`#3498db`,stopOpacity:1}}),(0,V.jsx)(`stop`,{offset:`100%`,style:{stopColor:`#e74c3c`,stopOpacity:1}})]})}),(0,V.jsx)(`circle`,{cx:`25`,cy:`25`,r:`20`,fill:`none`,strokeWidth:`5`,stroke:`url(#spinner-gradient)`,strokeLinecap:`round`,children:(0,V.jsx)(`animateTransform`,{attributeName:`transform`,type:`rotate`,dur:`1s`,from:`0 25 25`,to:`360 25 25`,repeatCount:`indefinite`})})]})}var fi=(0,N.lazy)(()=>yt(()=>import(`./LabView.ClmZmE7r.js`).then(e=>({default:e.LabView})),__vite__mapDeps([0,1,2,3,4,5,6,7,8]))),pi=(0,N.lazy)(()=>yt(()=>import(`./ChatView.S8iNU8MB.js`).then(e=>({default:e.ChatView})),__vite__mapDeps([9,1,2,3,4,5,6,10,11,12,8]))),mi=(0,N.lazy)(()=>yt(()=>import(`./QueryView.C6wjggvY.js`).then(e=>({default:e.QueryView})),__vite__mapDeps([13,1,3]))),hi=[{id:`simple`,label:`✨ Simple`,tooltip:`Curated and guided overview of your listening data`},{id:`lab`,label:`🔬 Lab`,tooltip:`Experimental insights and advanced visualizations`},{id:`chat`,label:`💬 Chat (beta)`,tooltip:`Conversational exploration using a built-in LLM`},{id:`query`,label:`⌨️ Query`,tooltip:`Direct SQL-based exploration of the dataset`}];function gi(){let[e,t]=(0,N.useState)(`simple`),[n,r]=(0,N.useState)(0),i=(0,N.useRef)(void 0),a=hi.findIndex(t=>t.id===e),o=(0,N.useCallback)(e=>{i.current=e,t(`query`),r(e=>e+1)},[]);return(0,V.jsx)(ht.Provider,{value:o,children:(0,V.jsxs)(`div`,{className:`py-8 animate-slide-up`,children:[(0,V.jsxs)(`div`,{className:`relative mb-8 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-xl mx-auto`,children:[(0,V.jsx)(`div`,{className:`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] bg-gradient-brand rounded-xl shadow-glow transition-transform duration-300 ease-out`,style:{width:`calc(${(100/hi.length).toFixed(4)}% - 0.25rem)`,transform:`translateX(calc(${a} * (100% + 0.125rem)))`}}),(0,V.jsx)(`div`,{className:`relative flex gap-1`,role:`tablist`,children:hi.map(n=>(0,V.jsx)(`button`,{role:`tab`,"aria-selected":e===n.id,title:n.tooltip,onClick:()=>t(n.id),className:`relative z-10 flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${e===n.id?`text-white`:`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`}`,children:n.label},n.id))})]}),(0,V.jsx)(`div`,{children:(0,V.jsx)(N.Suspense,{fallback:(0,V.jsx)(`div`,{className:`flex justify-center py-12`,children:(0,V.jsx)(di,{})}),children:e===`simple`?(0,V.jsx)(ui,{}):e===`lab`?(0,V.jsx)(fi,{}):e===`query`?(0,V.jsx)(mi,{initialQuery:i.current,onQueryConsumed:()=>{i.current=void 0}},n):(0,V.jsx)(pi,{})})})]})})}var _i=8e3;function vi({message:e,onDismiss:t}){let[n,r]=(0,N.useState)(!1),i=(0,N.useRef)(_i),a=(0,N.useRef)(Date.now());return(0,N.useEffect)(()=>{i.current=_i,a.current=Date.now()},[e]),(0,N.useEffect)(()=>{if(n){i.current=Math.max(0,i.current-(Date.now()-a.current));return}a.current=Date.now();let e=setTimeout(t,i.current);return()=>clearTimeout(e)},[n,e,t]),(0,V.jsxs)(`div`,{role:`alert`,"aria-live":`assertive`,"aria-atomic":`true`,onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),className:`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg`,children:[(0,V.jsx)(`span`,{className:`select-text`,children:e}),(0,V.jsx)(`button`,{type:`button`,onClick:t,className:`ml-1 rounded p-0.5 hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`,"aria-label":`Dismiss error`,children:`✕`})]})}function yi({initialDb:e=null,initialIsDataDropped:t=!1,initialIsDataReady:n=!1}){let[r,i]=(0,N.useState)(e),[a,o]=(0,N.useState)(t),[s,c]=(0,N.useState)(n),[l,u]=(0,N.useState)(null),[d,f]=(0,N.useState)(null),ee=(0,N.useCallback)(()=>u(null),[]),{isDemoReady:te,handleDemoButtonClick:p,demoJsonUrl:ne,demoProgress:re}=wr(),m=d??re;(0,N.useEffect)(()=>{(async()=>{let e=await g();i(e)})()},[]);async function ie(e){if(e){c(!1),o(!0),f(null);try{await yr(e,(e,t)=>f({stage:e,percent:t})),c(!0)}catch(e){console.error(`Failed to upload files:`,e),c(!1),o(!1),u(pr(e))}finally{f(null)}}}return r?(0,V.jsxs)(V.Fragment,{children:[(!a||s)&&!m&&(0,V.jsxs)(`div`,{className:`flex flex-col md:flex-row gap-4 items-stretch`,children:[(0,V.jsx)(`div`,{className:`flex-grow transition-all duration-300`,children:(0,V.jsx)(hr,{handleValidatedFiles:ie,onFail:e=>u(pr(e))})}),(0,V.jsxs)(`div`,{className:`flex flex-col justify-center gap-4`,children:[(0,V.jsx)(Sr,{label:`?`,tooltip:`How do I get my data?`}),ne&&(0,V.jsx)(xr,{label:`↓`,tooltip:`Load demo data`,handleClick:p})]})]}),m&&(0,V.jsx)(br,{stage:m.stage,percent:m.percent}),(s||te)&&(0,V.jsx)(gi,{}),l&&(0,V.jsx)(vi,{message:l,onDismiss:ee})]}):(0,V.jsx)(V.Fragment,{children:(0,V.jsx)(`p`,{className:`dark:text-white`,children:`Initializing the database engine (DuckDB-WASM)...`})})}var bi={system:{icon:`M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z`,label:e=>`System (${e})`},dark:{icon:`M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z`,label:()=>`Dark`},light:{icon:`M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z`,label:()=>`Light`}},xi=({path:e})=>(0,V.jsx)(`svg`,{className:`w-5 h-5`,fill:`none`,stroke:`currentColor`,viewBox:`0 0 24 24`,children:(0,V.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:e})}),Si=e=>a[(a.indexOf(e)+1)%a.length];function Ci(){let{theme:e,setTheme:t,effectiveTheme:n}=(0,N.useContext)(u),r=bi[e],i=r.label(n);return(0,V.jsx)(`button`,{onClick:()=>t(Si(e)),className:`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-md mx-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200`,"aria-label":`Current theme: ${i}. Click to change theme.`,title:i,children:(0,V.jsx)(xi,{path:r.icon})})}function wi(){return(0,V.jsx)(c,{children:(0,V.jsxs)(`div`,{className:`min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300`,children:[(0,V.jsx)(`div`,{className:`absolute top-6 right-6 z-50`,children:(0,V.jsx)(Ci,{})}),(0,V.jsx)(`div`,{className:`flex flex-1 items-center justify-center px-4 relative z-10`,children:(0,V.jsxs)(`div`,{className:`max-w-4xl w-full mx-auto py-12`,children:[(0,V.jsx)(`h1`,{className:`text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in`,children:(0,V.jsx)(`a`,{href:`/tracksy/pr-preview/pr-536`,className:`bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity drop-shadow-sm`,children:`Tracksy`})}),(0,V.jsx)(yi,{})]})}),(0,V.jsx)(`footer`,{className:`relative z-10 pb-6 text-center text-sm text-gray-400 dark:text-slate-500`,children:(0,V.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy`,target:`_blank`,rel:`noopener noreferrer`,className:`hover:text-gray-600 dark:hover:text-slate-300 transition-colors`,children:`Music stats made with ❤️ & 🔐 · View on GitHub`})})]})})}export{wi as App};