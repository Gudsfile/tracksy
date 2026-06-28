const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/LabView.C2w0VzVG.js","_astro/react-dom.673hvCjg.js","_astro/InsightCard.DZ85Q9lC.js","_astro/getDB.COZ4IwAq.js","_astro/devBus.DRONl0Hn.js","_astro/constants.th95jnuK.js","_astro/useDebouncedValue.DpUZQaLZ.js","_astro/src.IxFFejw-.js","_astro/ChatView.Bluo11zD.js","_astro/preload-helper.DEpHVZgP.js","_astro/deviceDetection.DfyxKe7U.js","_astro/QueryView.RlWYM_Dz.js"])))=>i.map(i=>d[i]);
import{n as e}from"./react-dom.673hvCjg.js";import{a as t,c as n,d as r,f as i,h as a,i as o,l as s,m as c,o as l,p as u,t as d,u as f}from"./InsightCard.DZ85Q9lC.js";import{n as p,r as m,t as h}from"./getDB.COZ4IwAq.js";import{t as g}from"./devBus.DRONl0Hn.js";import{a as ee,i as te,n as ne,o as _,r as v,t as re}from"./constants.th95jnuK.js";import{_ as ie,a as ae,c as oe,d as se,f as ce,g as le,h as ue,i as de,l as fe,m as pe,n as me,o as he,p as ge,r as _e,s as ve,t as y,u as ye,v as b,y as be}from"./preload-helper.DEpHVZgP.js";import{n as xe,r as Se,t as Ce}from"./useDebouncedValue.DpUZQaLZ.js";var x=e();function we(e){return Te(e)&&typeof e.ts==`string`&&typeof e.ms_played==`number`&&typeof e.track_name==`string`&&typeof e.artist_name==`string`&&typeof e.album_name==`string`}function Te(e){return typeof e.track_uri==`string`}function Ee(e){return e.ms_played>=3e4}var S=class{experimental=!1;validateFile(e){return this.filePattern.test(e.name)}validate(e){return e.filter(we)}filter(e){return e.filter(Ee)}async processFile(e){let t=performance.now(),n=await this.readFile(e),r=this.transform(n),i=this.validate(r),a=this.filter(i);return g.emit(`stream:parsed`,{provider:this.name,recordCount:a.length,durationMs:performance.now()-t}),a}},C=`_apple_music_tmp.csv`,De=class extends S{name=`apple-music`;displayName=`Apple Music`;acceptedFormats=`ZIP/CSV`;filePattern=/^Apple Music Play Activity\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await h();await n.registerFileBuffer(C,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${C}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(C)}}transform(e){return e.filter(e=>e[`Media Type`]===`AUDIO`&&e[`Container Origin Type`]!==`STREAM_RADIO_STATION`).map(e=>{let t=e[`Event Start Timestamp`],n=t instanceof Date?t.toISOString():typeof t==`number`||typeof t==`bigint`?new Date(Number(t)).toISOString():String(t??``),r=Number(e[`Play Duration Milliseconds`])||0;return{track_uri:`apple-music:${String(e[`Song Name`]??``)}`,track_name:String(e[`Song Name`]??``),artist_name:`Unknown Artist`,album_name:e[`Album Name`]==null?`Unknown Album`:String(e[`Album Name`]),ts:n,ms_played:Math.max(0,r),platform:e[`Device Type`]==null?`Unknown Device`:String(e[`Device Type`])}})}},w=`_custom_tmp.csv`,Oe=class extends S{name=`custom`;displayName=`Custom`;acceptedFormats=`CSV`;filePattern=/^tracksy-custom\.csv$/i;fileContentType=`text/csv`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await h();await n.registerFileBuffer(w,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${w}', header=true, all_varchar=true)`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to parse custom CSV. Check that the file has all required columns: ts, track_name, artist_name, album_name, ms_played, track_uri, platform.`,{cause:e})}finally{await n.dropFile(w)}}transform(e){return e.flatMap(e=>{let t=e.ts==null?void 0:String(e.ts),n=e.track_uri==null?void 0:String(e.track_uri);return t===void 0||n===void 0?[]:[{ts:t,track_uri:n,track_name:String(e.track_name??`Unknown Track`),artist_name:String(e.artist_name??`Unknown Artist`),album_name:String(e.album_name??`Unknown Album`),ms_played:Math.max(0,Number(e.ms_played)||0),platform:String(e.platform??`Unknown Device`)}]})}},T=`10_listeningHistory`,E=`_deezer_tmp.xlsx`,ke=class extends S{name=`deezer`;displayName=`Deezer`;acceptedFormats=`XLSX`;filePattern=/^deezer-data_\d+\.xlsx$/i;fileContentType=`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await h();await n.registerFileBuffer(E,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_xlsx('${E}', sheet='${T}')`)).toArray().map(e=>e.toJSON())}catch(e){throw Error(`Failed to read Deezer export: sheet "${T}" not found. Make sure the file is a valid Deezer listening history export.`,{cause:e})}finally{await n.dropFile(E)}}transform(e){return e.map(e=>{let t=Number(e[`Listening Time`])||0,n=t>0?t*1e3:0;return{track_uri:e.ISRC,track_name:e[`Song Title`],artist_name:e.Artist,album_name:e[`Album Title`],ts:e.Date.replace(` `,`T`)+`Z`,ms_played:n,ip_addr:e[`IP Address`],platform:e[`Platform Name`]}})}},D=`_jellyfin_tmp.csv`,Ae=class extends S{name=`jellyfin`;displayName=`JellyFin`;acceptedFormats=`CSV`;filePattern=/^playback_report\.csv$/i;fileContentType=`text/csv`;experimental=!0;async readFile(e){let t=await e.arrayBuffer(),{db:n,conn:r}=await h();await n.registerFileBuffer(D,new Uint8Array(t));try{return(await r.query(`SELECT * FROM read_csv('${D}', header=true)`)).toArray().map(e=>e.toJSON())}finally{await n.dropFile(D)}}transform(e){return e.filter(e=>e.ItemType===`Audio`).map(e=>{let t=Number(e.PlayDuration);return{track_uri:`jellyfin:${e.ItemId}`,track_name:e.ItemName,artist_name:``,album_name:``,ts:e.DateCreated instanceof Date?e.DateCreated.toISOString():typeof e.DateCreated==`number`||typeof e.DateCreated==`bigint`?new Date(Number(e.DateCreated)).toISOString():String(e.DateCreated).replace(` `,`T`)+`Z`,ms_played:t>0?t*1e3:0,platform:e.ClientName}})}},O=[new class extends S{name=`spotify`;displayName=`Spotify`;acceptedFormats=`ZIP/JSON`;filePattern=/^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i;fileContentType=`application/json`;async readFile(e){let t=await e.text(),n=JSON.parse(t);if(!Array.isArray(n))throw Error(`Expected JSON array of streaming records`);return n}transform(e){return e.map(({spotify_track_uri:e,master_metadata_track_name:t,master_metadata_album_artist_name:n,master_metadata_album_album_name:r,...i})=>({...i,track_uri:e,track_name:t,artist_name:n,album_name:r}))}},new ke,new De,new Oe,new Ae],k=O.map(e=>e.fileContentType);function A(e){for(let t of O)if(t.validateFile(e))return t}var je=e=>k.some(t=>t===e.type);function j(){return O.filter(e=>!e.experimental).map(e=>`${e.displayName} (${e.acceptedFormats})`)}var M=`application/zip`,N=e=>e.type===M,P=m();function Me({handleDrop:e,handleDragOver:t,handleFileUpload:n,contentTypeAccepted:r,contentTypeAcceptedMessage:i}){return(0,P.jsx)(`div`,{children:(0,P.jsxs)(`div`,{className:`flex flex-col items-center justify-center p-6 border border-2 border-dashed border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-200 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-all cursor-pointer`,onDrop:e,"aria-label":`dropzone`,onDragOver:t,children:[(0,P.jsx)(`input`,{type:`file`,className:`hidden`,id:`fileInput`,"aria-label":`upload file`,onChange:n,accept:r}),(0,P.jsxs)(`label`,{htmlFor:`fileInput`,className:`text-sm cursor-pointer text-center`,children:[`Drag and drop or click to upload your music streaming data files`,(0,P.jsx)(`br`,{}),i]})]})})}var Ne=e=>{let t=new DataTransfer;return e.forEach(e=>t.items.add(e)),t.files},Pe=Symbol(`Comlink.proxy`),Fe=Symbol(`Comlink.endpoint`),Ie=Symbol(`Comlink.releaseProxy`),F=Symbol(`Comlink.finalizer`),I=Symbol(`Comlink.thrown`),Le=e=>typeof e==`object`&&!!e||typeof e==`function`,Re=new Map([[`proxy`,{canHandle:e=>Le(e)&&e[Pe],serialize(e){let{port1:t,port2:n}=new MessageChannel;return ze(e,t),[n,[n]]},deserialize:e=>(e.start(),Ve(e))}],[`throw`,{canHandle:e=>Le(e)&&I in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(Error(e.value.message),e.value):e.value}}]]);function ze(e,t=globalThis,n=[`*`]){t.addEventListener(`message`,(function r(i){if(!i||!i.data)return;if(!function(e,t){for(let n of e)if(t===n||n===`*`||n instanceof RegExp&&n.test(t))return!0;return!1}(n,i.origin))return void console.warn(`Invalid origin '${i.origin}' for comlink proxy`);let{id:a,type:o,path:s}=Object.assign({path:[]},i.data),c=(i.data.argumentList||[]).map(W),l;try{let t=s.slice(0,-1).reduce(((e,t)=>e[t]),e),n=s.reduce(((e,t)=>e[t]),e);switch(o){case`GET`:l=n;break;case`SET`:t[s.slice(-1)[0]]=W(i.data.value),l=!0;break;case`APPLY`:l=n.apply(t,c);break;case`CONSTRUCT`:l=H(new n(...c));break;case`ENDPOINT`:{let{port1:t,port2:n}=new MessageChannel;ze(e,n),l=function(e,t){return Ue.set(e,t),e}(t,[t])}break;case`RELEASE`:l=void 0;break;default:return}}catch(e){l={value:e,[I]:0}}Promise.resolve(l).catch((e=>({value:e,[I]:0}))).then((n=>{let[i,s]=U(n);t.postMessage(Object.assign(Object.assign({},i),{id:a}),s),o===`RELEASE`&&(t.removeEventListener(`message`,r),Be(t),F in e&&typeof e[F]==`function`&&e[F]())})).catch((e=>{let[n,r]=U({value:TypeError(`Unserializable return value`),[I]:0});t.postMessage(Object.assign(Object.assign({},n),{id:a}),r)}))})),t.start&&t.start()}function Be(e){(function(e){return e.constructor.name===`MessagePort`})(e)&&e.close()}function Ve(e,t){return B(e,[],t)}function L(e){if(e)throw Error(`Proxy has been released and is not useable`)}function He(e){return G(e,{type:`RELEASE`}).then((()=>{Be(e)}))}var R=new WeakMap,z=`FinalizationRegistry`in globalThis&&new FinalizationRegistry((e=>{let t=(R.get(e)||0)-1;R.set(e,t),t===0&&He(e)}));function B(e,t=[],n=function(){}){let r=!1,i=new Proxy(n,{get(n,a){if(L(r),a===Ie)return()=>{(function(e){z&&z.unregister(e)})(i),He(e),r=!0};if(a===`then`){if(t.length===0)return{then:()=>i};let n=G(e,{type:`GET`,path:t.map((e=>e.toString()))}).then(W);return n.then.bind(n)}return B(e,[...t,a])},set(n,i,a){L(r);let[o,s]=U(a);return G(e,{type:`SET`,path:[...t,i].map((e=>e.toString())),value:o},s).then(W)},apply(n,i,a){L(r);let o=t[t.length-1];if(o===Fe)return G(e,{type:`ENDPOINT`}).then(W);if(o===`bind`)return B(e,t.slice(0,-1));let[s,c]=V(a);return G(e,{type:`APPLY`,path:t.map((e=>e.toString())),argumentList:s},c).then(W)},construct(n,i){L(r);let[a,o]=V(i);return G(e,{type:`CONSTRUCT`,path:t.map((e=>e.toString())),argumentList:a},o).then(W)}});return function(e,t){let n=(R.get(t)||0)+1;R.set(t,n),z&&z.register(e,t,e)}(i,e),i}function V(e){let t=e.map(U);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}var Ue=new WeakMap;function H(e){return Object.assign(e,{[Pe]:!0})}function U(e){for(let[t,n]of Re)if(n.canHandle(e)){let[r,i]=n.serialize(e);return[{type:`HANDLER`,name:t,value:r},i]}return[{type:`RAW`,value:e},Ue.get(e)||[]]}function W(e){switch(e.type){case`HANDLER`:return Re.get(e.name).deserialize(e.value);case`RAW`:return e.value}}function G(e,t,n){return new Promise((r=>{let i=[,,,,].fill(0).map((()=>Math.floor(Math.random()*(2**53-1)).toString(16))).join(`-`);e.addEventListener(`message`,(function t(n){n.data&&n.data.id&&n.data.id===i&&(e.removeEventListener(`message`,t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:i},t),n)}))}var K=class{constructor(e,t,n,r,i){this._name=e,this._size=t,this._path=n,this._lastModified=r,this._archiveRef=i}get name(){return this._name}get size(){return this._size}get lastModified(){return this._lastModified}extract(){return this._archiveRef.extractSingleFile(this._path)}};function q(e){if(e instanceof File||e instanceof K||e===null)return e;let t={};for(let n of Object.keys(e))t[n]=q(e[n]);return t}function We(e,t=``){let n=[];for(let r of Object.keys(e))e[r]instanceof File||e[r]instanceof K||e[r]===null?n.push({file:e[r]||r,path:t}):n.push(...We(e[r],`${t}${r}/`));return n}function Ge(e,t){let n=t.split(`/`);n[n.length-1]===``&&n.pop();let r=e,i=null;for(let e of n)r[e]=r[e]||{},i=r,r=r[e];return[i,n[n.length-1]]}var Ke=class{constructor(e,t,n){this._content={},this._processed=0,this.file=e,this.client=t,this.worker=n}open(){return this._content={},this._processed=0,new Promise(((e,t)=>{this.client.open(this.file,H((()=>{e(this)})))}))}async close(){var e;(e=this.worker)==null||e.terminate(),this.worker=null,this.client=null,this.file=null}async hasEncryptedData(){return await this.client.hasEncryptedData()}async usePassword(e){await this.client.usePassword(e)}async setLocale(e){await this.client.setLocale(e)}async getFilesObject(){return this._processed>0?Promise.resolve().then((()=>this._content)):((await this.client.listFiles()).forEach((e=>{let[t,n]=Ge(this._content,e.path);e.type===`FILE`&&(t[n]=new K(e.fileName,e.size,e.path,e.lastModified,this))})),this._processed=1,q(this._content))}getFilesArray(){return this.getFilesObject().then((e=>We(e)))}async extractSingleFile(e){if(this.worker===null)throw Error(`Archive already closed`);let t=await this.client.extractSingleFile(e);return new File([t.fileData],t.fileName,{type:`application/octet-stream`,lastModified:t.lastModified/1e6})}async extractFiles(e=void 0){var t;return this._processed>1?Promise.resolve().then((()=>this._content)):((await this.client.extractFiles()).forEach((t=>{let[n,r]=Ge(this._content,t.path);t.type===`FILE`&&(n[r]=new File([t.fileData],t.fileName,{type:`application/octet-stream`}),e!==void 0&&setTimeout(e.bind(null,{file:n[r],path:t.path})))})),this._processed=2,(t=this.worker)==null||t.terminate(),q(this._content))}},qe,Je;(function(e){e.SEVEN_ZIP=`7zip`,e.AR=`ar`,e.ARBSD=`arbsd`,e.ARGNU=`argnu`,e.ARSVR4=`arsvr4`,e.BIN=`bin`,e.BSDTAR=`bsdtar`,e.CD9660=`cd9660`,e.CPIO=`cpio`,e.GNUTAR=`gnutar`,e.ISO=`iso`,e.ISO9660=`iso9660`,e.MTREE=`mtree`,e.MTREE_CLASSIC=`mtree-classic`,e.NEWC=`newc`,e.ODC=`odc`,e.OLDTAR=`oldtar`,e.PAX=`pax`,e.PAXR=`paxr`,e.POSIX=`posix`,e.PWB=`pwb`,e.RAW=`raw`,e.RPAX=`rpax`,e.SHAR=`shar`,e.SHARDUMP=`shardump`,e.USTAR=`ustar`,e.V7TAR=`v7tar`,e.V7=`v7`,e.WARC=`warc`,e.XAR=`xar`,e.ZIP=`zip`})(qe||={}),function(e){e.B64ENCODE=`b64encode`,e.BZIP2=`bzip2`,e.COMPRESS=`compress`,e.GRZIP=`grzip`,e.GZIP=`gzip`,e.LRZIP=`lrzip`,e.LZ4=`lz4`,e.LZIP=`lzip`,e.LZMA=`lzma`,e.LZOP=`lzop`,e.UUENCODE=`uuencode`,e.XZ=`xz`,e.ZSTD=`zstd`,e.NONE=`none`}(Je||={});var J=class e{static init(t=null){return e._options=t||{},e._options}static async open(t){let n=e.getWorker(e._options);return await new Ke(t,await e.getClient(n,e._options),n).open()}static async write({files:t,outputFileName:n,compression:r,format:i,passphrase:a=null}){let o=e.getWorker(e._options),s=await(await e.getClient(o,e._options)).writeArchive(t,r,i,a);return o.terminate(),new File([s],n,{type:`application/octet-stream`})}static getWorker(e){return e.getWorker?e.getWorker():new Worker(e.workerUrl||new URL(`/tracksy/pr-preview/pr-536/_astro/worker-bundle.Dx5mKZOL.js`,``+import.meta.url),{type:`module`})}static async getClient(e,t){let n=t.createClient?.call(t,e)||Ve(e),{promise:r,resolve:i}=Promise.withResolvers(),a=await new n(H((()=>{i()})));return await r,a}};J._options={},Promise.withResolvers||(Promise.withResolvers=function(){var e,t,n=new this((function(n,r){e=n,t=r}));return{resolve:e,reject:t,promise:n}});var Ye=`/tracksy/pr-preview/pr-536/_astro/worker-bundle.Dx5mKZOL.js`;async function Xe(e){return J.init({workerUrl:Ye}),await J.open(e)}var Ze=[`__MACOSX`];function Qe(e){return Ze.some(t=>e.startsWith(t))}function $e(e){return e.name.toLowerCase().endsWith(`.zip`)}async function et(e){let t=await(await Xe(e)).extractFiles(),n=Object.entries(t).filter(([e])=>!Qe(e)).flatMap(([,e])=>e instanceof File?[e]:Object.values(e)).filter(e=>!Qe(e.name)),r=[];for(let e of n)if($e(e)){let t=await et(e);r.push(...t)}else r.push(e);return r}var Y={UNSUPPORTED_CONTENT_TYPE:`One or more files have an unsupported content type`,NO_FILES_IN_ARCHIVE:`No files found in the archive`,NO_VALID_RECORDS:`No valid stream records found`,NO_FILE_TO_PROCESS:`No file to process`};function tt(e){let t=e instanceof Error?e.message:``;return t===Y.UNSUPPORTED_CONTENT_TYPE?`Unsupported file type. Supported: ${j().join(`, `)}.`:t===Y.NO_FILES_IN_ARCHIVE?`The ZIP archive is empty or unreadable.`:t===Y.NO_VALID_RECORDS?`No streaming export recognized. Supported: ${j().join(`, `)}.`:t===Y.NO_FILE_TO_PROCESS?`No file received. Try again.`:`Upload failed. Check the file and try again.`}function nt({onSuccess:e,onFail:t}){let n=e=>{if(Array.from(e).filter(e=>je(e)||N(e)).length!==e.length)throw Error(Y.UNSUPPORTED_CONTENT_TYPE)},r=async e=>{let t=await et(e);if(t.length===0)throw Error(Y.NO_FILES_IN_ARCHIVE);return Ne(t)};return{uploadFiles:async i=>{try{n(i),e(i.length===1&&N(i[0])?await r(i[0]):i)}catch(e){console.error(`Error while processing files:`,e),t(e)}}}}function rt({handleValidatedFiles:e,onFail:t=()=>{}}){let{uploadFiles:n}=nt({onSuccess:t=>e(t),onFail:t});return(0,P.jsx)(Me,{handleDrop:async e=>{e.preventDefault();let t=e.dataTransfer.files;console.debug(`Dragged in files:`,Array.from(t)),await n(t)},handleDragOver:e=>{e.preventDefault()},handleFileUpload:async e=>{let t=e.target.files;t!==null&&(console.debug(`Uploaded files:`,Array.from(t)),await n(t))},contentTypeAccepted:[...k,M].join(`,`),contentTypeAcceptedMessage:(0,P.jsxs)(P.Fragment,{children:[`Only `,(0,P.jsx)(`strong`,{children:j().join(`, `)}),` are accepted`]})})}var it=[[ne,`select
    ts::date as stream_date,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from \${table}
where ts is not null
group by ts::date
order by stream_date
`],[re,`select
    artist_name,
    min(year(ts::date))::integer as first_year
from \${table}
where
    artist_name is not null
    and ts is not null
group by artist_name
`],[te,`with ordered as (
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
`],[ee,`select
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from \${table}
`]];async function at(e,t=Intl.DateTimeFormat().resolvedOptions().timeZone){await e.query(`DROP VIEW IF EXISTS ${_}`),await e.query(`DROP TABLE IF EXISTS ${_}`),await e.query(`CREATE TABLE ${_} AS SELECT * EXCLUDE (ts), (ts::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${t}') AS ts FROM ${v}`);for(let[t,n]of it)await e.query(`DROP TABLE IF EXISTS ${t}`),await e.query(`CREATE TABLE ${t} AS\n${n.replaceAll("${table}",_)}`)}async function ot(e){if(e.length<1)throw console.error(`No file to process`),Error(`No file to process`);let t=[];for(let n of Array.from(e)){console.debug(`File ${n.name} is being processed.`);let e=A(n);if(!e){console.warn(`File ${n.name} does not match any known provider. Skipping.`);continue}console.debug(`File ${n.name} detected as ${e.displayName} format.`);let r=await e.processFile(n);t.push(...r)}if(t.length===0)throw console.error(`No valid stream records found`),Error(`No valid stream records found`);let n=p(t),{conn:r}=await h();await r.query(`DROP TABLE IF EXISTS ${v}`),console.debug(`Table ${v} dropped.`),await r.insertArrowTable(n,{name:v,create:!0}),console.debug(`Table ${v} created with ${t.length} records.`),await at(r),i()}function st(){return(0,P.jsxs)(`svg`,{width:`50`,height:`50`,viewBox:`0 0 50 50`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,P.jsx)(`defs`,{children:(0,P.jsxs)(`linearGradient`,{id:`spinner-gradient`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,P.jsx)(`stop`,{offset:`0%`,style:{stopColor:`#3498db`,stopOpacity:1}}),(0,P.jsx)(`stop`,{offset:`100%`,style:{stopColor:`#e74c3c`,stopOpacity:1}})]})}),(0,P.jsx)(`circle`,{cx:`25`,cy:`25`,r:`20`,fill:`none`,strokeWidth:`5`,stroke:`url(#spinner-gradient)`,strokeLinecap:`round`,children:(0,P.jsx)(`animateTransform`,{attributeName:`transform`,type:`rotate`,dur:`1s`,from:`0 25 25`,to:`360 25 25`,repeatCount:`indefinite`})})]})}function ct({label:e,tooltip:t,handleClick:n}){return(0,P.jsx)(`button`,{type:`button`,title:t,className:`px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,onClick:n,children:(0,P.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}function lt({label:e,tooltip:t}){return(0,P.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy?tab=readme-ov-file#%EF%B8%8F-download-your-data`,title:t,target:`_blank`,rel:`noopener noreferrer`,className:`flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200`,children:(0,P.jsx)(`span`,{className:`whitespace-nowrap`,children:e})})}async function ut(e){let t=await fetch(e.toString());if(!t.ok)throw Error(`Failed to fetch demo data: ${t.statusText}`);let n=await t.blob(),r=e.pathname.split(`/`).pop()||`streaming_data.json`,a=new File([n],r,{type:`application/json`}),o=A(a);if(!o)throw Error(`No provider found for the demo data URL`);let s=await o.processFile(a);if(s.length===0)throw Error(`No valid stream records found in demo data`);let c=p(s),{conn:l}=await h();await l.query(`DROP TABLE IF EXISTS ${v}`),await l.insertArrowTable(c,{name:v,create:!0}),await at(l),i()}function dt(){let[e,t]=(0,x.useState)(!1),n=(()=>{let e=`https://huggingface.co/datasets/tracksy/synthetic-datasets/resolve/main/datasets/spotify/Streaming_History_Audio_2006_25000.json`;try{return new URL(e)}catch{console.warn(`Invalid PUBLIC_DEMO_JSON_URL environment variable:`,{url:e});return}})();return{isDemoReady:e,handleDemoButtonClick:async()=>{if(t(!1),n)try{await ut(n),t(!0)}catch{t(!1)}},demoJsonUrl:n}}var ft=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 6 and hour(ts::datetime) < 12)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,pt=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 12 and hour(ts::datetime) < 18)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,mt=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    (hour(ts::datetime) >= 18 and hour(ts::datetime) < 24)
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,ht=`select
    artist_name as entity,
    count(*)::integer as metric
from \${table}
where
    hour(ts::datetime) < 6
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
`,gt=`select
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
`,_t=`with
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
`,vt=`with
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
`,yt=`with
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
`,bt=`select
    artist_name as entity,
    count(distinct strftime(ts::date, '%Y-%m'))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric desc
limit 1
`,xt=`with
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
`,St=`select
    artist_name as entity,
    min(year(ts::date))::integer as metric
from \${table}
where artist_name is not null
group by artist_name
order by metric asc
limit 1
`,Ct=`with
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
`,wt=`with
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
`,Tt=`with
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
`,Et=`with
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
`,Dt=`select
    track_name as entity,
    artist_name as parent_entity
from \${table}
where track_name is not null
USING SAMPLE 1
`,Ot=`with max_date as (
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
`,X=e=>e.replaceAll("${table}",_),Z=[{fact_type:`morning_favorite`,title:`🌅 Musical Breakfast`,emoji:`🥐`,unit:`streams`,context:`between 6am and 12pm`,sql:X(ft)},{fact_type:`afternoon_favorite`,title:`🏞️ Afternoon Boost`,emoji:`⚡️`,unit:`streams`,context:`between 12pm and 6pm`,sql:X(pt)},{fact_type:`evening_favorite`,title:`🌆 Calm Return`,emoji:`🛋️`,unit:`streams`,context:`between 6pm and 0am`,sql:X(mt)},{fact_type:`night_favorite`,title:`🌌 Musical Insomnia`,emoji:`💤`,unit:`streams`,context:`between 0am and 6am`,sql:X(ht)},{fact_type:`weekend_favorite`,title:`🧉 Weekend Vibes`,emoji:`🕺`,unit:`streams`,context:`on weekends`,sql:X(gt)},{fact_type:`nostalgic_return`,title:`📻 Signal Found`,emoji:`🛰️`,unit:`days`,context:`later, it's back`,sql:X(_t)},{fact_type:`forgotten_artist`,title:`🥀 Fading Away`,emoji:`🌫️`,unit:`days`,context:`off your radar`,sql:X(vt)},{fact_type:`absolute_loyalty`,title:`💎 Absolute Loyalty`,emoji:`💍`,unit:`%`,context:`of your plays went all the way`,sql:X(yt)},{fact_type:`subscribed_artist`,title:`🎟️ Monthly Subscription`,emoji:`📬`,unit:`months`,context:`in your rotation`,sql:X(bt)},{fact_type:`musical_anniversary`,title:`🎉 Musical Anniversary`,emoji:`🎂`,unit:`years`,context:`strong`,sql:X(xt)},{fact_type:`first_artist`,title:`1️⃣ The Very First`,emoji:`🦖`,unit:void 0,context:`still in your rotation today?`,sql:X(St)},{fact_type:`one_hit_wonder`,title:`⭐ One Hit Wonder`,emoji:`📼`,unit:`%`,context:`of your streams of`,sql:X(Ct)},{fact_type:`current_obsession`,title:`🔁 Current Obsession`,emoji:`🎯`,unit:`streams`,context:`in the last 30 days`,sql:X(wt)},{fact_type:`recent_discovery`,title:`🔍 Recent Discovery`,emoji:`✨`,unit:`streams`,context:`discovered in the last 3 months`,sql:X(Tt)},{fact_type:`marathon`,title:`🏃 Marathon`,emoji:`☄️`,unit:`streams in a row`,context:`one uninterrupted run on`,sql:X(Et)},{fact_type:`track_proposition`,title:`▶️ Up Next`,emoji:`🔮`,unit:void 0,context:`your next listen is already waiting`,sql:X(Dt)},{fact_type:`cozy_album`,title:`💿 Cozy Album`,emoji:`☁️`,unit:void 0,context:`the album that wraps your Sundays in musical coziness`,sql:X(Ot)}],kt=()=>(0,P.jsx)(`p`,{className:`text-lg text-gray-600 dark:text-gray-300 italic`,children:`Not enough data for this fun fact — keep listening!`}),At=({fact:e,error:t,isLoading:n})=>{if(n&&!e?.entity)return(0,P.jsxs)(`div`,{className:`space-y-2 animate-pulse`,children:[(0,P.jsx)(`div`,{className:`h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4`}),(0,P.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-full`}),(0,P.jsx)(`div`,{className:`h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6`})]});if(t)return(0,P.jsx)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:`Something went wrong while loading fun facts`});if(!e?.entity)return(0,P.jsx)(kt,{});let{entity:r,parent_entity:i,metric:a,unit:o,context:s}=e;return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(`div`,{className:`text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 break-words text-balance`,children:r}),i&&(0,P.jsx)(`div`,{className:`text-base text-gray-500 dark:text-gray-400 mb-1`,children:i}),a!==void 0&&(0,P.jsxs)(`div`,{className:`text-lg text-gray-600 dark:text-gray-300`,children:[(0,P.jsxs)(`span`,{className:`font-bold text-blue-600 dark:text-blue-400`,children:[a.toLocaleString(),o===`%`?o:``]}),o&&o!==`%`&&` ${o}`]}),s&&(0,P.jsx)(`div`,{className:`text-sm text-gray-600 dark:text-gray-400 mt-1 italic`,children:s})]})},jt=({fact:e,error:t,onRefresh:n,isLoading:r})=>(0,P.jsxs)(`div`,{className:`col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl shadow border border-purple-100 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in`,children:[(0,P.jsx)(`div`,{className:`absolute top-0 right-0 p-4 transition-opacity`,children:(0,P.jsx)(`button`,{onClick:n,disabled:r,className:`p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`,title:`New fact`,children:(0,P.jsx)(`span`,{className:`block text-xl ${r?`animate-spin`:``}`,children:`🔄`})})}),(0,P.jsxs)(`div`,{className:`flex flex-col md:flex-row items-center gap-6`,"data-fact-type":e?.fact_type,children:[(0,P.jsx)(`div`,{className:`text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow`,children:e?.emoji}),(0,P.jsxs)(`div`,{className:`flex-1 text-center md:text-left`,children:[(0,P.jsx)(`div`,{className:`text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2`,children:e?.title}),(0,P.jsx)(At,{fact:e,error:t,isLoading:r})]})]})]}),Mt=e=>[...e].sort(()=>Math.random()-.5);function Nt(){let[e,t]=(0,x.useState)(void 0),[n,i]=(0,x.useState)(!0),[a,o]=(0,x.useState)(void 0),s=(0,x.useRef)(new Set),c=(0,x.useCallback)(async()=>{i(!0),o(void 0);try{s.current.size===Z.length&&s.current.clear();let e=Z.filter(e=>!s.current.has(e.fact_type)),[n]=Mt(e.length>0?e:Z);s.current.add(n.fact_type);let[r]=await f(n.sql);t({title:n.title,emoji:n.emoji,fact_type:n.fact_type,entity:r?.entity??void 0,parent_entity:r?.parent_entity,metric:r?.metric,unit:n.unit,context:[n.context,r?.context_suffix].filter(Boolean).join(` `)})}catch(e){console.error(`Error loading fun fact:`,e),o(e instanceof Error?e.message:`Failed to load fun fact`)}finally{i(!1)}},[]);return(0,x.useEffect)(()=>{c()},[c]),(0,x.useEffect)(()=>{let e=()=>{s.current.clear(),c()};return window.addEventListener(r,e),()=>window.removeEventListener(r,e)},[c]),(0,P.jsx)(jt,{fact:e,onRefresh:c,isLoading:n,error:a})}var Pt=`with
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
`;function Ft(e){let t=l(e);return Pt.replaceAll("${table}",_).replaceAll("${year_condition}",t)}var It=e=>{let t=t=>e.find(e=>e.stream_bin===t)?.share_of_total_streams||0,n=t(`1`),r=t(`2-10`),i=t(`11-100`),a=t(`101-1000`),o=t(`1000+`),s=n+r,c=i,l=a+o;return l>.6?{label:`Ultra Loyal`,emoji:`🔥`}:s>.6?{label:`Explorer`,emoji:`🔍`}:l>s?{label:`Favorites Driven`,emoji:`❤️`}:c>.4?{label:`Balanced Regular`,emoji:`⚖️`}:{label:`Curious`,emoji:`🧐`}},Lt=({data:e,isLoading:n})=>{let r=(e??[]).reduce((e,t)=>e+t.artist_count,0),i=It(e??[]),a=[{label:`1 stream`,value:(e?.[0]?.share_of_total_streams??0)*100,color:`bg-teal-400`,textColor:`text-teal-700 dark:text-teal-400`},{label:`2-10 streams`,value:(e?.[1]?.share_of_total_streams??0)*100,color:`bg-orange-400`,textColor:`text-orange-700 dark:text-orange-400`},{label:`11-100 streams`,value:(e?.[2]?.share_of_total_streams??0)*100,color:`bg-violet-400`,textColor:`text-violet-700 dark:text-violet-400`},{label:`101-1000 streams`,value:(e?.[3]?.share_of_total_streams??0)*100,color:`bg-blue-400`,textColor:`text-blue-700 dark:text-blue-400`},{label:`1000+ streams`,value:(e?.[4]?.share_of_total_streams??0)*100,color:`bg-rose-500`,textColor:`text-rose-700 dark:text-rose-400`}];return(0,P.jsx)(t,{title:`Artist Loyalty`,emoji:`🤝`,isLoading:n,question:`How loyal am I to my favorite artists?`,className:`h-full`,children:e?.length?(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(b,{label:i.label,sublabel:`${r.toLocaleString()} artists`,emoji:i.emoji}),(0,P.jsx)(`div`,{className:`space-y-2`,children:a.map(e=>(0,P.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,P.jsx)(`div`,{className:`w-3 h-3 rounded-full ${e.color} flex-shrink-0`}),(0,P.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,P.jsx)(`div`,{className:`flex justify-between items-center text-sm`,children:(0,P.jsx)(`span`,{className:`text-gray-600 dark:text-gray-400`,children:e.label})}),(0,P.jsx)(`div`,{className:`w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden`,children:(0,P.jsx)(`div`,{className:`${e.color} h-1.5 rounded-full`,style:{width:`${e.value}%`}})})]}),(0,P.jsxs)(`div`,{className:`text-sm font-medium ${e.textColor} w-14 text-right`,children:[e.value.toFixed(0),`%`]})]},e.label))})]}):(0,P.jsx)(o,{})})};function Rt({year:e}){let{data:t,isLoading:n}=s({query:Ft(e),year:e});return(0,P.jsx)(Lt,{data:t,isLoading:n})}var zt=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(sum(ms_played) / 3600000.0 as double) as hours_played
from \${table}
where \${year_condition}
group by cast(ts as date)
order by hours_played desc
limit 1
`;function Bt(e){let t=l(e);return zt.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function Vt(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}function Ht(e){let t=Math.floor(e),n=Math.round((e-t)*60);return n===0?`${t}h`:`${t}h ${n}min`}var Ut=({data:e,isLoading:n,year:r})=>(0,P.jsx)(t,{title:`Deep Dive`,emoji:`🎧`,isLoading:n,question:r===void 0?`What's my most immersive day ever?`:`What's my most immersive day in ${r}?`,children:e?.hours_played?(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(b,{label:Ht(e.hours_played),sublabel:`in a day`}),(0,P.jsx)(d,{children:Vt(e.stream_date)})]}):(0,P.jsx)(o,{})});function Wt({year:e}){let{data:t,isLoading:r}=n({query:Bt(e),year:e});return(0,P.jsx)(Ut,{data:t,isLoading:r,year:e})}var Gt=`select
    cast(cast(ts as date) as varchar) as stream_date,
    cast(count(distinct artist_name) as integer) as artist_count
from \${table}
where \${year_condition}
group by cast(ts as date)
order by artist_count desc
limit 1
`;function Kt(e){let t=l(e);return Gt.replaceAll("${table}",_).replaceAll("${year_condition}",t)}function qt(e){return new Date(e+`T00:00:00`).toLocaleDateString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}var Jt=({data:e,isLoading:n,year:r})=>(0,P.jsx)(t,{title:`Eclectic Day`,emoji:`🎨`,isLoading:n,question:r===void 0?`My most diverse listening day ever?`:`My most diverse listening day in ${r}?`,children:e?.artist_count?(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(b,{label:String(e.artist_count),sublabel:`different artists`}),(0,P.jsx)(d,{children:qt(e.stream_date)})]}):(0,P.jsx)(o,{})});function Yt({year:e}){let{data:t,isLoading:r}=n({query:Kt(e),year:e});return(0,P.jsx)(Jt,{data:t,isLoading:r,year:e})}function Xt(){let[e,t]=(0,x.useState)(void 0),[n,i]=(0,x.useState)(),a=Ce(e,250),o=(0,x.useCallback)(async()=>{try{i((await f(xe))[0]||void 0)}catch{}},[]);return(0,x.useEffect)(()=>{o()},[o]),(0,x.useEffect)(()=>(window.addEventListener(r,o),()=>window.removeEventListener(r,o)),[o]),(0,x.useEffect)(()=>{n&&t(new Date(Number(n.max_datetime)).getFullYear())},[n]),(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(`div`,{className:`mt-4 mb-6`,children:(0,P.jsx)(Nt,{})}),n&&(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(Se,{value:e,min:new Date(Number(n.min_datetime)).getFullYear(),max:new Date(Number(n.max_datetime)).getFullYear(),onChange:t}),(0,P.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`,children:[(0,P.jsx)(me,{year:a}),(0,P.jsx)(de,{year:a}),(0,P.jsx)(_e,{year:a}),(0,P.jsx)(`div`,{className:`md:col-span-3`,children:(0,P.jsx)(ve,{year:a})}),(0,P.jsx)(be,{year:a}),(0,P.jsx)(ie,{year:a}),(0,P.jsx)(le,{year:a}),(0,P.jsx)(`div`,{className:`md:col-span-2`,children:(0,P.jsx)(pe,{year:a})}),(0,P.jsx)(ue,{year:a}),(0,P.jsx)(ge,{year:a}),(0,P.jsx)(`div`,{className:`row-span-2`,children:(0,P.jsx)(Rt,{year:a})}),(0,P.jsx)(ce,{year:a}),(0,P.jsx)(`div`,{className:`row-span-2`,children:(0,P.jsx)(ae,{year:a})}),(0,P.jsx)(se,{year:a}),(0,P.jsx)(`div`,{className:`row-span-3 md:col-span-2`,children:(0,P.jsx)(he,{year:a})}),(0,P.jsx)(ye,{year:a}),(0,P.jsx)(fe,{year:a}),(0,P.jsx)(oe,{year:a}),(0,P.jsx)(Wt,{year:a}),(0,P.jsx)(Yt,{year:a})]})]})]})}var Zt=(0,x.lazy)(()=>y(()=>import(`./LabView.C2w0VzVG.js`).then(e=>({default:e.LabView})),__vite__mapDeps([0,1,2,3,4,5,6,7]))),Qt=(0,x.lazy)(()=>y(()=>import(`./ChatView.Bluo11zD.js`).then(e=>({default:e.ChatView})),__vite__mapDeps([8,1,2,3,4,5,9,10,7]))),$t=(0,x.lazy)(()=>y(()=>import(`./QueryView.RlWYM_Dz.js`).then(e=>({default:e.QueryView})),__vite__mapDeps([11,1,3]))),Q=[{id:`simple`,label:`✨ Simple`,tooltip:`Curated and guided overview of your listening data`},{id:`lab`,label:`🔬 Lab`,tooltip:`Experimental insights and advanced visualizations`},{id:`chat`,label:`💬 Chat (beta)`,tooltip:`Conversational exploration using a built-in LLM`},{id:`query`,label:`⌨️ Query`,tooltip:`Direct SQL-based exploration of the dataset`}];function en(){let[e,t]=(0,x.useState)(`simple`),n=Q.findIndex(t=>t.id===e);return(0,P.jsxs)(`div`,{className:`py-8 animate-slide-up`,children:[(0,P.jsxs)(`div`,{className:`relative mb-8 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-xl mx-auto`,children:[(0,P.jsx)(`div`,{className:`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] bg-gradient-brand rounded-xl shadow-glow transition-transform duration-300 ease-out`,style:{width:`calc(${(100/Q.length).toFixed(4)}% - 0.25rem)`,transform:`translateX(calc(${n} * (100% + 0.125rem)))`}}),(0,P.jsx)(`div`,{className:`relative flex gap-1`,role:`tablist`,children:Q.map(n=>(0,P.jsx)(`button`,{role:`tab`,"aria-selected":e===n.id,title:n.tooltip,onClick:()=>t(n.id),className:`relative z-10 flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${e===n.id?`text-white`:`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`}`,children:n.label},n.id))})]}),(0,P.jsx)(`div`,{children:(0,P.jsx)(x.Suspense,{fallback:(0,P.jsx)(`div`,{className:`flex justify-center py-12`,children:(0,P.jsx)(st,{})}),children:e===`simple`?(0,P.jsx)(Xt,{}):e===`lab`?(0,P.jsx)(Zt,{}):e===`query`?(0,P.jsx)($t,{}):(0,P.jsx)(Qt,{})})})]})}var $=8e3;function tn({message:e,onDismiss:t}){let[n,r]=(0,x.useState)(!1),i=(0,x.useRef)($),a=(0,x.useRef)(Date.now());return(0,x.useEffect)(()=>{i.current=$,a.current=Date.now()},[e]),(0,x.useEffect)(()=>{if(n){i.current=Math.max(0,i.current-(Date.now()-a.current));return}a.current=Date.now();let e=setTimeout(t,i.current);return()=>clearTimeout(e)},[n,e,t]),(0,P.jsxs)(`div`,{role:`alert`,"aria-live":`assertive`,"aria-atomic":`true`,onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),className:`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg`,children:[(0,P.jsx)(`span`,{className:`select-text`,children:e}),(0,P.jsx)(`button`,{type:`button`,onClick:t,className:`ml-1 rounded p-0.5 hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`,"aria-label":`Dismiss error`,children:`✕`})]})}function nn({initialDb:e=null,initialIsDataDropped:t=!1,initialIsDataReady:n=!1}){let[r,i]=(0,x.useState)(e),[a,o]=(0,x.useState)(t),[s,c]=(0,x.useState)(n),[l,u]=(0,x.useState)(null),d=(0,x.useCallback)(()=>u(null),[]),{isDemoReady:f,handleDemoButtonClick:p,demoJsonUrl:m}=dt();(0,x.useEffect)(()=>{(async()=>{i(await h())})()},[]);async function g(e){if(e){c(!1),o(!0);try{await ot(e),c(!0)}catch(e){console.error(`Failed to upload files:`,e),c(!1),o(!1),u(tt(e))}}}return r?(0,P.jsxs)(P.Fragment,{children:[(!a||s)&&(0,P.jsxs)(`div`,{className:`flex flex-col md:flex-row gap-4 items-stretch`,children:[(0,P.jsx)(`div`,{className:`flex-grow transition-all duration-300`,children:(0,P.jsx)(rt,{handleValidatedFiles:g,onFail:e=>u(tt(e))})}),(0,P.jsxs)(`div`,{className:`flex flex-col justify-center gap-4`,children:[(0,P.jsx)(lt,{label:`?`,tooltip:`How do I get my data?`}),m&&(0,P.jsx)(ct,{label:`↓`,tooltip:`Load demo data`,handleClick:p})]})]}),a&&!s&&(0,P.jsx)(st,{}),(s||f)&&(0,P.jsx)(en,{}),l&&(0,P.jsx)(tn,{message:l,onDismiss:d})]}):(0,P.jsx)(P.Fragment,{children:(0,P.jsx)(`p`,{className:`dark:text-white`,children:`Initializing the database engine (DuckDB-WASM)...`})})}var rn={system:{icon:`M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z`,label:e=>`System (${e})`},dark:{icon:`M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z`,label:()=>`Dark`},light:{icon:`M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z`,label:()=>`Light`}},an=({path:e})=>(0,P.jsx)(`svg`,{className:`w-5 h-5`,fill:`none`,stroke:`currentColor`,viewBox:`0 0 24 24`,children:(0,P.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:e})}),on=e=>a[(a.indexOf(e)+1)%a.length];function sn(){let{theme:e,setTheme:t,effectiveTheme:n}=(0,x.useContext)(u),r=rn[e],i=r.label(n);return(0,P.jsx)(`button`,{onClick:()=>t(on(e)),className:`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-md mx-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200`,"aria-label":`Current theme: ${i}. Click to change theme.`,title:i,children:(0,P.jsx)(an,{path:r.icon})})}function cn(){return(0,P.jsx)(c,{children:(0,P.jsxs)(`div`,{className:`min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300`,children:[(0,P.jsx)(`div`,{className:`absolute top-6 right-6 z-50`,children:(0,P.jsx)(sn,{})}),(0,P.jsx)(`div`,{className:`flex flex-1 items-center justify-center px-4 relative z-10`,children:(0,P.jsxs)(`div`,{className:`max-w-4xl w-full mx-auto py-12`,children:[(0,P.jsx)(`h1`,{className:`text-4xl md:text-5xl font-bold text-center mb-8 animate-fade-in`,children:(0,P.jsx)(`a`,{href:`/tracksy/pr-preview/pr-536`,className:`bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity drop-shadow-sm`,children:`Tracksy`})}),(0,P.jsx)(nn,{})]})}),(0,P.jsx)(`footer`,{className:`relative z-10 pb-6 text-center text-sm text-gray-400 dark:text-slate-500`,children:(0,P.jsx)(`a`,{href:`https://github.com/Gudsfile/tracksy`,target:`_blank`,rel:`noopener noreferrer`,className:`hover:text-gray-600 dark:hover:text-slate-300 transition-colors`,children:`Music stats made with ❤️ & 🔐 · View on GitHub`})})]})})}export{cn as App};