/* ============================================================
   FILMTAILOR · prototype engine
   ============================================================ */
const ACTS = {1:"Act I · The film",2:"Act II · The pitch",3:"Act III · The package",4:"Act IV · Your deck"};
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* ---------- state ---------- */
const START = { stage:null, genre:null, budget:null, rooms:[], heard:[], title:null, logline:null,
  comps:[], team:null, hardest:[], want:[], commit:null, plan:"solo" };
let S = JSON.parse(JSON.stringify(START));
let idx = 0;

/* ---------- derivation: everything the copy can reference ---------- */
function derive(s){
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(v)));
  const opt=(id,v)=>{ const sc=SCREENS.find(x=>x.id===id); return ((sc&&sc.opts)||[]).find(o=>o.v===v)||{}; };
  const WORD=["No","One","Two","Three","Four","Five","Six","Seven"];
  const joinList=arr=>arr.length<2?(arr[0]||""):arr.slice(0,-1).join(", ")+" and "+arr[arr.length-1];
  const fmtX=x=>x>=10?String(Math.round(x)):String(Math.round(x*10)/10);

  /* the film */
  const genre=s.genre||"comedy", g=opt("genre",genre);
  const kws=(g.kw||"").split(" ").filter(Boolean);
  const title=(s.title!=null?s.title:DEMO.title).trim();
  const logline=(s.logline!=null?s.logline:DEMO.logline).trim();

  /* the logline read: the five things an executive looks for */
  const words=logline?logline.split(/\s+/).filter(Boolean).length:0;
  const L=" "+logline.toLowerCase()+" ";
  const ROLES="woman|man|girl|boy|mother|father|mom|dad|widow|widower|detective|cop|teacher|dentist|nurse|doctor|surgeon|lawyer|student|teenager|teen|soldier|priest|nun|chef|pilot|thief|writer|musician|singer|boxer|farmer|scientist|astronaut|nanny|daughter|son|sister|brother|wife|husband|couple|family|kid|orphan|stranger|killer|agent|spy|journalist|reporter|actor|actress|comedian|waitress|driver|hacker|banker|accountant|athlete|dancer|artist|inventor|mayor|sheriff|ranger|hitman|grandmother|grandfather|twin|friend|coach|janitor|clerk|salesman|immigrant|refugee|veteran|monk|witch|vampire|executive|ceo|robot";
  const hits={
    lead:  new RegExp("\\b(a|an|two|three|four|five)\\s+([\\w'-]+\\s+){0,3}?("+ROLES+")s?\\b").test(L),
    goal:  /\b(must|has to|have to|tries to|try to|sets out to|set out to|needs to|need to|wants to|fights to|races to|plans to|decides to|attempts to|vows to|is forced to|are forced to|scrambles to|struggles to)\b/.test(L),
    stakes:/\b(before|or else|or lose|or risk|until|at the cost of|in time|forever|lose|losing|die|dies|death|kill|killed|destroy|save|saving|from the|hide|ruin|prison|jail|custody|everything)\b/.test(L),
    hook:  /\b(but|only to|same (day|week|night|month|year)|turns out|discovers|finds out|secretly|just as|the one person|even though|despite|unless)\b/.test(L),
    genre: kws.some(k=>new RegExp("\\b"+k).test(L))
  };
  const ORDER=["lead","goal","stakes","hook","genre"];
  const hitList=ORDER.map(k=>hits[k]), hitCount=hitList.filter(Boolean).length;
  const PRIORITY=["lead","goal","stakes","genre","hook"];
  const loglineVerdict = words>40 ? "long" : (PRIORITY.find(k=>!hits[k]) || "good");

  /* comps: reported figures, median so one breakout can't skew it */
  const pool=COMPS[genre]||[];
  const picked=(s.comps||[]).map(v=>pool.find(c=>c.v===v)).filter(Boolean);
  const use=picked.length?picked:pool.slice(0,3);
  const ms=use.map(c=>c.g/c.b).sort((x,y)=>x-y);
  const median=ms.length?(ms.length%2?ms[(ms.length-1)/2]:(ms[ms.length/2-1]+ms[ms.length/2])/2):0;

  /* rooms: one film, a version per room */
  const rooms=s.rooms||[];
  const roomNames=rooms.map(r=>opt("rooms",r).room).filter(Boolean);
  const n=roomNames.length||1;

  /* readiness: five dimensions, today and after this week */
  const has=(k,v)=>(s[k]||[]).includes(v);
  const pLogline=clamp(hitCount*17+(words>=18&&words<=38?12:0),8,97);
  const pComps=[10,35,52,64][Math.min(picked.length,3)];
  const pMarket=clamp((s.budget==="unknown"||!s.budget?22:50)+(rooms.length>1?8:0)-(has("heard","whofor")?12:0),8,95);
  const pLook=clamp((has("hardest","look")?20:46)-(has("heard","tone")?10:0),8,95);
  const pTeam={solo:18,producer:60,director:52,cast:68,company:72}[s.team]||18;
  const rate={hour:.45,evening:.62,weekend:.74,asap:.5}[s.commit]||.62;
  /* the app can build the look and the comps; it can only suggest a team */
  const proj=(v,mult)=>Math.min(97,Math.max(Math.round(v+(100-v)*rate*mult),v+3));
  const dims=[["Logline",pLogline,proj(pLogline,1)],["Comps",pComps,proj(pComps,1.1)],
              ["Market",pMarket,proj(pMarket,.9)],["Look",pLook,proj(pLook,1.3)],["Team",pTeam,proj(pTeam,.8)]];
  const avg=arr=>Math.round(arr.reduce((x,y)=>x+y,0)/arr.length);
  const weak=dims.slice().sort((x,y)=>x[2]-y[2])[0][0].toLowerCase();

  return {
    genreLabel:g.label||"Comedy", genrePhrase:g.phrase||"a comedy", genreNoun:g.noun||"comedy",
    genreKw1:kws[0]||"", genreKw2:kws[1]||"",
    title, titleShown:title||"Untitled", logline, words, readSecs:Math.max(2,Math.round(words/3.5)),
    hitList, hitCount, loglineVerdict,
    compRows:use.map(c=>({t:c.t,y:c.y,b:c.b,g:c.g,x:fmtX(c.g/c.b)})),
    compsMultiple:fmtX(median), comp1:(use[0]||{}).t||"", comp2:(use[1]||use[0]||{}).t||"",
    budgetPhrase:opt("budget",s.budget).phrase||"$1M to $5M",
    roomCount:rooms.length, roomList:joinList(roomNames)||"the rooms you picked",
    roomOne:roomNames[0]||"your first room", roomMode:rooms.length>1?"many":"one",
    roomChips:roomNames.map(r=>r.charAt(0).toUpperCase()+r.slice(1)),
    versionsCount:n===1?"One version":WORD[n]+" versions",
    versionsLine:n===1?"One version, built for "+(roomNames[0]||"your first room")+".":WORD[n]+" versions, one for each room you picked.",
    readyBy:{hour:"Today",evening:"Tonight",weekend:"Sunday",asap:"Tomorrow"}[s.commit]||"Tonight",
    dims, scoreNow:avg(dims.map(x=>x[1])), scoreAfter:avg(dims.map(x=>x[2])), weakKey:weak,
    heardPrimary:(s.heard||[]).filter(x=>x!=="none")[0]||(s.heard||[])[0]||"none",
    hardestPrimary:(s.hardest||[])[0]||"comps",
    wantPrimary:(s.want||[])[0]||"meeting"
  };
}
const esc=str=>String(str==null?"":str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const T = (str,d) => (str||"").replace(/\{(\w+)\}/g,(m,k)=> d[k]!==undefined ? d[k] : m);

/* ---------- chrome ---------- */
const sb = () => `<div class="statusbar"><span>9:41</span><span class="sb-icons">
<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
<svg width="16" height="11" viewBox="0 0 16 12" fill="currentColor"><path d="M8 11.5l2.2-2.7a3.5 3.5 0 0 0-4.4 0L8 11.5zM8 6a6.3 6.3 0 0 1 4 1.4l1.3-1.6a8.4 8.4 0 0 0-10.6 0L4 7.4A6.3 6.3 0 0 1 8 6zM8 2.2c2.4 0 4.7.8 6.5 2.3L16 2.9A12.2 12.2 0 0 0 8 0C5 0 2.2 1 0 2.9l1.5 1.6A10.2 10.2 0 0 1 8 2.2z"/></svg>
<svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor"/><path d="M23 4v4a2.2 2.2 0 0 0 0-4z" fill="currentColor" opacity=".5"/></svg>
</span></div>`;

function navrow(scr, pos){
  if(scr.chrome===false) return "";
  const act = ACTS[scr.act] || "";
  return `<div class="navrow"><div class="nav-top">
    <button class="back" data-act="back"><svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 1L1 7l5.5 6M1 7h14"/></svg></button>
    <div class="progress-wrap">
      <div class="act-label"><span>${act}</span><span>${pos.n} / ${pos.total}</span></div>
      <div class="progress"><i style="width:${Math.round(pos.pct*100)}%"></i></div>
    </div></div></div>`;
}
const dock = (inner) => `<div class="cta-dock">${inner}</div>`;
const ctaBtn = (label,on=true,cls="") => `<button class="cta ${cls}" data-act="next" ${on?"":"disabled"}>${label}</button>`;
const ind = `<div class="home-ind"></div>`;

/* ---------- small art ---------- */
const art = {
  ring(inner){ return `<svg viewBox="0 0 220 220" width="180" height="180">
    <circle cx="110" cy="110" r="86" fill="none" stroke="#E4D9C8" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/>
    <circle cx="110" cy="110" r="70" fill="#F6EDE1"/>${inner}</svg>`; },
  mic(){ return this.ring(`<g stroke="#030909" stroke-width="4.5" fill="none" stroke-linecap="round">
    <rect x="97" y="72" width="26" height="44" rx="13"/><path d="M86 106a24 24 0 0 0 48 0"/><path d="M110 130v14"/><path d="M98 148h24"/></g>
    <circle cx="146" cy="80" r="5" fill="#FF0099"/>`); },
  bell(){ return this.ring(`<g stroke="#030909" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M84 128c6-6 8-12 8-24a18 18 0 0 1 36 0c0 12 2 18 8 24z"/><path d="M102 138a9 9 0 0 0 16 0"/></g>
    <circle cx="140" cy="78" r="5" fill="#FF0099"/>`); },
  lock(){ return this.ring(`<g stroke="#030909" stroke-width="4.5" fill="none" stroke-linecap="round">
    <rect x="88" y="104" width="44" height="34" rx="8"/><path d="M97 104V93a13 13 0 0 1 26 0v11"/></g>
    <circle cx="110" cy="121" r="4" fill="#FF0099"/>`); },
  check(){ return this.ring(`<g stroke="#030909" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M88 110l16 16 30-32"/></g><circle cx="150" cy="82" r="5" fill="#FF0099"/>`); },
  wave(n=42,seed=1,live=false){
    let out="";
    for(let i=0;i<n;i++){
      const t=(i+seed)*0.7;
      const h=8+Math.abs(Math.sin(t))*22+Math.abs(Math.sin(t*2.3))*20;
      out+=`<i style="height:${h.toFixed(0)}px${live?`;animation:pulse .7s ${(i*0.035).toFixed(2)}s infinite alternate ease-in-out`:""}"></i>`;
    }
    return `<div class="wave">${out}</div>`;
  },
  gauge(wpm){
    const min=90,max=230, p=Math.max(0,Math.min(1,(wpm-min)/(max-min)));
    const A=Math.PI*(1-p), cx=130,cy=118,r=96;
    const x=cx+r*Math.cos(A), y=cy-r*Math.sin(A);
    const z1=(135-min)/(max-min), z2=(150-min)/(max-min);
    const pt=(f)=>{const a=Math.PI*(1-f);return [cx+r*Math.cos(a),cy-r*Math.sin(a)];};
    const [ax,ay]=pt(z1),[bx,by]=pt(z2);
    return `<svg viewBox="0 0 260 150" width="100%">
      <path d="M34 118A96 96 0 0 1 226 118" fill="none" stroke="#E4DED4" stroke-width="10" stroke-linecap="round"/>
      <path d="M${ax} ${ay}A96 96 0 0 1 ${bx} ${by}" fill="none" stroke="#0FA89C" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="10" fill="#FF0099" stroke="#FEFEFE" stroke-width="4"/>
      <text x="34" y="142" font-size="11" fill="#7F7F7F" font-family="Figtree">90</text>
      <text x="${ax-14}" y="${ay-14}" font-size="11" fill="#0FA89C" font-family="Figtree" font-weight="600">135</text>
      <text x="${bx-2}" y="${by-14}" font-size="11" fill="#0FA89C" font-family="Figtree" font-weight="600">150</text>
      <text x="212" y="142" font-size="11" fill="#7F7F7F" font-family="Figtree">230</text></svg>`;
  },
  beats(active=-1){
    const pts=[[16,74],[62,52],[110,60],[158,24],[204,66]];
    let d="M"+pts.map(p=>p.join(" ")).join(" L ");
    let dots=pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===active?7:5}" fill="${i===active?"#FF0099":"#030909"}" ${i===active?'stroke="#F6DAD6" stroke-width="5"':""}/>`).join("");
    return `<svg viewBox="0 0 220 96" width="100%"><path d="${d}" fill="none" stroke="#030909" stroke-width="2" opacity=".25" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
  },
  stars(){ return "★★★★★"; },
  /* the five-beat thread. Filled beats are the ones they hit. */
  thread(hit){
    const pts=[[18,86],[74,64],[130,70],[186,30],[242,54]];
    const seg=(a,b)=>`M${a[0]} ${a[1]} C${(a[0]+b[0])/2} ${a[1]}, ${(a[0]+b[0])/2} ${b[1]}, ${b[0]} ${b[1]}`;
    let out="";
    for(let i=0;i<4;i++){
      const on = i+1 < hit;
      out += `<path d="${seg(pts[i],pts[i+1])}" fill="none" stroke="${on?"#030909":"#D9CDBA"}"
        stroke-width="${on?2.4:2}" stroke-linecap="round" ${on?"":'stroke-dasharray="3 6"'}/>`;
    }
    pts.forEach((p,i)=>{
      const on = i < hit;
      out += on
        ? `<circle cx="${p[0]}" cy="${p[1]}" r="6.5" fill="#030909"/>`
        : `<circle cx="${p[0]}" cy="${p[1]}" r="5.5" fill="#FEFEFE" stroke="#C9BCA6" stroke-width="2"/>`;
    });
    return `<svg viewBox="0 0 260 110" width="100%">${out}</svg>`;
  },
  meter(pct){
    return `<div class="meter"><i style="width:${pct}%"></i></div>`;
  },
  meterDual(now, proj){
    return `<div class="meter" style="display:flex">
      <i style="flex:0 0 auto;width:${now}%"></i>
      <b style="flex:0 0 auto;width:${Math.max(0,proj-now)}%;background:#4DF6EC"></b></div>`;
  }
};


const BICONS=[
`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FF0099" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h4"/></svg>`,
`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF0099" stroke-width="1.9" stroke-linecap="round"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21.5 12h.5"/></svg>`,
`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FF0099" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`];

/* ---------- the coach: our version of Duo's speech bubble ---------- */
const MICMARK = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FEFEFE" stroke-width="1.9" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="10.5" rx="3"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0"/><path d="M12 17v3.5"/></svg>`;
function coachHTML(scr, d){
  const line = T(scr.coach, d);
  const sub = scr.lede ? `<p class="coach-lede">${T(scr.lede,d)}</p>` : "";
  return `<div class="coachrow"><div class="coach-mark">${MICMARK}</div><div class="bubble">${line}</div></div>${sub}`;
}
/* every question screen leads with either a bubble or a headline, never both */
function head(scr, d, cls){
  if(scr.coach) return coachHTML(scr, d);
  return `<h1 class="h1 ${cls||""}">${T(scr.h1,d)}</h1>${scr.lede?`<p class="lede">${T(scr.lede,d)}</p>`:""}`;
}

/* ---------- option markup ---------- */
function optionsHTML(scr, s, d){
  let opts = scr.opts || [];
  if(scr.optsFrom==="comps") opts = (COMPS[s.genre||"comedy"]||[]).map(c=>({v:c.v,label:c.t,sub:c.y+" · $"+(c.b<1?Math.round(c.b*1000)+"K":c.b+"M")+" budget"}));
  const cur = s[scr.key];
  const isSel = v => scr.multi ? (cur||[]).includes(v) : cur===v;
  const check = `<svg width="11" height="9" viewBox="0 0 11 9" fill="none" stroke="#030909" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4.6L4 7.6 10 1.4"/></svg>`;
  return `<div class="opts ${opts.length>5?"tight":""}">`+opts.map(o=>{
    const sel = isSel(o.v)?"sel":"";
    if(scr.style==="quote") return `<button class="opt quote ${sel}" data-v="${o.v}">
      <div class="opt-txt"><div class="qt">“${o.qt.replace(/^“|”$/g,"")}”</div><div class="diag">${o.diag}</div></div>
      <div class="opt-mark">${isSel(o.v)?check:""}</div></button>`;
    return `<button class="opt ${sel}" data-v="${o.v}">
      ${o.rec?`<span class="rec-chip">RECOMMENDED</span>`:""}
      <div class="opt-txt"><div>${T(o.label,d)}</div>${o.sub?`<div class="opt-sub">${T(o.sub,d)}</div>`:""}</div>
      ${o.tag?`<div class="opt-tag">${o.tag}</div>`:""}
      ${scr.multi?`<div class="opt-mark">${isSel(o.v)?check:""}</div>`:""}</button>`;
  }).join("")+`</div>`;
}

/* ---------- occasion + timeline overrides ----------
   Some copy has to change tone by occasion. "26 days is plenty of time"
   is wrong for a eulogy written in four, and competitive framing is
   wrong at a funeral full stop. */
function variantFor(scr, s, d){ return scr; }

/* ---------- screen bodies ---------- */
function renderBody(scr, s, d, live){
  scr = variantFor(scr, s, d);
  const K = scr.kind;

  if(K==="splash") return {cls:"", html:`<div class="body center" style="align-items:center;justify-content:center;position:relative">
    <div class="spot" style="top:26%"></div>
    <div style="text-align:center;position:relative">
      <div class="splash-name">Logline</div>
      <div class="splash-by">by <img class="splash-ft" src="logo.svg" alt="FilmTailor"></div>
    </div></div>`, dock:""};

  if(K==="hero"){
    const dd=derive(Object.assign({},START,DEMO));
    return {html:`<div class="body center" style="position:relative">
    <div class="spot" style="top:6%;opacity:.6"></div>
    <div style="position:relative;margin:0 auto 34px;width:300px">
      <div class="slide" style="padding:16px 17px"><div class="sk"></div>
        <div class="st" style="font-size:28px">${esc(dd.titleShown)}</div>
        <div class="sg">${dd.genreLabel} · ${dd.budgetPhrase}</div>
        <div class="sl" style="font-size:9.5px">${esc(dd.logline.slice(0,118))}…</div>
      </div>
      <div style="position:absolute;right:-14px;bottom:-16px;background:var(--paper);border:1px solid var(--paper-line);border-radius:12px;padding:8px 12px;box-shadow:0 10px 22px rgba(0,0,0,.14);text-align:left">
        <div style="font-family:var(--serif);font-size:19px;font-weight:600;color:#FF0099;line-height:1">${dd.compsMultiple}x</div>
        <div style="font-size:9.5px;color:var(--muted);margin-top:2px">median comp return</div></div>
    </div>
    <h1 class="h1 lg" style="text-align:center">${scr.h1}</h1>
    <p class="lede" style="text-align:center;margin:10px auto 0">${scr.lede}</p></div>`,
    dock: ctaBtn(scr.cta)+`<div class="cta-sub">${scr.subcta}</div>`};
  }

  if(K==="select"){
    const cur=s[scr.key]; const ok = scr.multi ? (cur||[]).length>0 : !!cur;
    return {cls:"scroll", html:`<div class="body scroll">
      ${head(scr,d,"sm")}
      ${optionsHTML(scr,s,d)}<div style="height:8px"></div></div>`,
      dock: ctaBtn(scr.ctaLabel||"Continue", ok)};
  }

  if(K==="reflect"){
    const showBig = !!scr.big;
    return {html:`<div class="body center" style="position:relative">
      ${scr.art?`<div class="spot" style="top:6%"></div>`:""}
      <div style="position:relative">
      ${scr.art?`<div style="text-align:center;margin-bottom:24px">${scr.art==="privacy"?art.lock():art.check()}</div>`:""}
      ${scr.eyebrow?`<div class="eyebrow" ${scr.art?'style="text-align:center"':""}>${T(scr.eyebrow,d)}</div>`:""}
      ${showBig?`<div class="stat-huge accent ${T(scr.big,d).length>7?"long":""}">${T(scr.big,d)}</div><div class="stat-lab" style="margin-bottom:26px">${T(scr.bigUnit,d)}</div>`:""}
      <h1 class="h1 ${scr.art?"":"sm"}" ${scr.art?'style="text-align:center"':""}>${T(scr.h1,d)}</h1>
      <p class="lede" ${scr.art?'style="text-align:center;margin:0 auto"':""} style="max-width:320px">${T(scr.body,d)}</p>
      ${scr.footnote?`<div class="rule"></div><div class="mini-note">${T(scr.footnote,d)}</div>`:""}
      ${scr.privacy?`<div class="card" style="margin-top:26px;text-align:center"><div class="mini-note">${T(scr.privacy,d)}</div></div>`:""}
      </div></div>`, dock: ctaBtn(scr.cta||"Continue")};
  }

  if(K==="reflectVar"){
    /* multi-select questions get every answer diagnosed, not just the first */
    if(scr.stackKey){
      const sel = (s[scr.stackKey]||[]).filter(v => v !== "none");
      if(sel.length > 1) return {html:`<div class="body scroll">
        <div class="eyebrow">You said</div>
        <h1 class="h1 sm">${T(scr.stackTitle,d)}</h1>
        <div class="stack">${sel.map(v=>{
          const vr = scr.variants[v]; if(!vr) return "";
          return `<div class="srow"><div class="sq">${T(vr.quote||v,d)}</div>
            <div class="ss">${T(vr.short||vr.body,d)}</div></div>`;
        }).join("")}</div><div style="height:6px"></div></div>`,
        dock: ctaBtn("Continue")};
    }
    const key = d[scr.varKey] !== undefined ? d[scr.varKey] : s[scr.varKey];
    const v = scr.variants[key] || scr.variants[Object.keys(scr.variants)[0]];
    return {html:`<div class="body center">
      ${v.quote?`<div class="eyebrow">You said</div><div class="pull accent" style="margin-bottom:22px">${T(v.quote,d)}</div>`:""}
      ${v.eyebrow&&!v.quote?`<div class="eyebrow">${T(v.eyebrow,d)}</div>`:""}
      ${v.big?`<div class="stat-huge accent ${T(v.big,d).length>7?"long":""}">${T(v.big,d)}</div>
      <div class="stat-lab" style="margin-bottom:26px">${T(v.bigUnit,d)}</div>`:""}
      <h1 class="h1 sm">${T(v.h1,d)}</h1>
      <p class="lede" style="max-width:320px;margin-top:12px">${T(v.body,d)}</p></div>`,
      dock: ctaBtn("Continue")};
  }

  if(K==="slider"){
    const val=s.nerves;
    const lab = scr.labels.reduce((a,b)=> Math.abs(b[0]-val)<Math.abs(a[0]-val)?b:a)[1];
    return {html:`<div class="body">
      ${head(scr,d,"sm")}
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center">
        <div class="slide-wrap">
          <div class="slide-val">${lab}</div>
          <div class="sl-faces">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7F7F7F" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M8 16c1-1.6 2.3-2.4 4-2.4s3 .8 4 2.4" stroke-linecap="round"/><path d="M9 9.5h.01M15 9.5h.01" stroke-linecap="round" stroke-width="2.2"/></svg>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF0099" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.6 2.3 2.4 4 2.4s3-.8 4-2.4" stroke-linecap="round"/><path d="M9 9.5h.01M15 9.5h.01" stroke-linecap="round" stroke-width="2.2"/></svg>
          </div>
          <input type="range" class="sl" min="0" max="100" value="${val}" ${live?"":"disabled"}>
          <div class="sl-ends"><span>${scr.ends[0]}</span><span>${scr.ends[1]}</span></div>
        </div></div></div>`, dock: ctaBtn("Continue")};
  }

  if(K==="wheel"){
    const t=new Date(); t.setDate(t.getDate()+ (s.days||26));
    return {html:`<div class="body">
      ${head(scr,d)}
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center">
      <div class="wheelrow" data-wheel>
        <div class="wheel-sel"></div>
        ${wheelCol("month", MONTHS, t.getMonth())}
        ${wheelCol("day", Array.from({length:31},(_,i)=>String(i+1)), t.getDate()-1)}
        ${wheelCol("year", ["2026","2027"], 0)}
        <div class="wheel-fade t"></div><div class="wheel-fade b"></div>
      </div>
      <div style="text-align:center;margin-top:26px" class="mini-note">${DAYS[t.getDay()]}</div>
      </div></div>`,
      dock: ctaBtn("Continue")+`<div class="cta-sub"><b data-act="nodate">${scr.subcta}</b></div>`};
  }

  if(K==="record"){
    const on = !!s._rec;
    return {html:`<div class="body">
      ${head(scr,d)}
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center;gap:22px">
        <div class="script">${scr.script}</div>
        <div>${art.wave(40,2,on)}</div>
      </div>
      <div style="padding-bottom:6px">
        <div class="rec-btn ${on?"on":""}" data-act="rec"><div class="rec-inner"></div></div>
        <div class="rec-hint">${on?"Listening… keep going":scr.cta}</div>
      </div></div>`,
      dock:`<div class="cta-sub" style="margin-top:0">${scr.hint}</div>`};
  }

  if(K==="text"){
    const title = s.title!=null ? s.title : DEMO.title;
    const logline = s.logline!=null ? s.logline : DEMO.logline;
    const wc = logline.trim().split(/\s+/).filter(Boolean).length;
    return {html:`<div class="body scroll">
      ${head(scr,d,"sm")}
      <div class="field-lab">${scr.titleLabel}</div>
      <input class="field" data-field="title" value="${esc(title)}" ${live?"":"disabled"}>
      <div class="field-lab">${scr.loglineLabel}<span class="wordcount ${wc>35?"long":(wc>=20?"good":"")}">${wc} ${wc>35?scr.countLong:scr.countOk}</span></div>
      <textarea class="field" data-field="logline" rows="5" ${live?"":"disabled"}>${esc(logline)}</textarea>
      <div class="field-note">${scr.fieldNote}</div>
      </div>`, dock: ctaBtn(scr.cta, !!logline.trim())};
  }

  if(K==="logline"){
    return {html:`<div class="body scroll">
      <div class="eyebrow">${scr.eyebrow}</div>
      <h1 class="h1 sm">${T(scr.h1,d)}</h1>
      <div class="quoteline">${esc(d.logline)}</div>
      <div class="elrow">${scr.elements.map((e,i)=>`<div class="el ${d.hitList[i]?"on":""}"><i></i><span>${e}</span></div>`).join("")}</div>
      <div class="tiles">
        <div class="tile"><div class="tv">${d.words}</div><div class="tl">${scr.tileWords}</div></div>
        <div class="tile"><div class="tv">${d.hitCount}</div><div class="tl">${scr.tileHits}</div></div>
        <div class="tile"><div class="tv">${d.readSecs}</div><div class="tl">${scr.tileRead}</div></div>
      </div></div>`, dock: ctaBtn(scr.cta)};
  }

  if(K==="compsTable"){
    const fm=v=>v<1?"$"+Math.round(v*1000)+"K":"$"+(v%1?v.toFixed(1):v)+"M";
    return {html:`<div class="body scroll">
      <div class="eyebrow">${scr.eyebrow}</div>
      <div class="stat-huge accent">${T(scr.big,d)}</div>
      <div class="stat-lab">${T(scr.bigUnit,d)}</div>
      <table class="ctable"><tr><th>${scr.colFilm}</th><th>${scr.colBudget}</th><th>${scr.colGross}</th><th>${scr.colX}</th></tr>
        ${d.compRows.map(c=>`<tr><td>${c.t}<small>${c.y}</small></td><td>${fm(c.b)}</td><td>${fm(c.g)}</td><td class="x">${c.x}x</td></tr>`).join("")}
      </table>
      <p class="lede" style="margin-top:16px;max-width:none">${T(scr.body,d)}</p>
      <div class="mini-note" style="margin-top:6px">${scr.medianNote}</div>
      </div>`, dock: ctaBtn("Continue")};
  }

  if(K==="gauge") return {html:`<div class="body center">
      <div class="eyebrow">Your pace</div>
      <h1 class="h1 sm">${T(scr.h1,d)}</h1>
      <div style="margin:22px 0 8px">${art.gauge(d.wpm)}</div>
      <p class="lede" style="max-width:320px">${T(scr.body,d)}</p>
      <div class="card" style="margin-top:22px;display:flex;align-items:center;gap:14px">
        <div style="font-family:var(--serif);font-size:34px;font-weight:600;color:#FF0099;line-height:1">${d.words}</div>
        <div style="font-size:13.5px;line-height:1.45">words for your ${d.mins} minutes<div class="mini-note" style="margin-top:2px">That's the number I'll write to.</div></div>
      </div></div>`, dock: ctaBtn("Continue")};

  if(K==="social") return {html:`<div class="body scroll center-txt">
      <div class="card" style="text-align:center;padding:18px">
        <div style="font-family:var(--serif);font-size:30px;font-weight:600;letter-spacing:-.02em">${scr.rating} <span class="stars">${art.stars()}</span></div>
        <div class="mini-note" style="margin-top:4px">${scr.ratingSub}</div>
      </div>
      <h1 class="h1 sm" style="margin:26px 0 16px;text-align:center">${scr.h1}</h1>
      <div class="avatars">${["#D0CBEF","#C9B49E","#E0D2C0"].map(c=>`<i style="background:${c}"></i>`).join("")}</div>
      <div class="mini-note" style="margin-top:10px">${scr.users}</div>
      <div class="tcard" style="text-align:left">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;gap:10px;align-items:center">
            <i style="width:36px;height:36px;border-radius:50%;background:#D0CBEF;display:block"></i>
            <div><div class="tname">${scr.testimonial.name}</div><div class="trole">${scr.testimonial.role}</div></div>
          </div><div class="stars" style="font-size:12px">${art.stars()}</div>
        </div>
        <div class="tbody">${scr.testimonial.body}</div>
      </div></div>`, dock: ctaBtn("Continue")};

  if(K==="chart") return {html:`<div class="body">
      <h1 class="h1 sm">${scr.h1}</h1>
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center">
        <div class="card" style="padding:22px 20px">
          <div class="bars">${scr.bars.map((b,i)=>`<div class="bar-col">
            ${b.v<30?`<div class="bar-val">${b.txt}</div>`:""}
            <div class="bar ${i?"b":"a"}" style="height:${b.v}%">${b.v<30?"":b.txt}</div>
            <div class="bar-lab">${b.lab}</div></div>`).join("")}</div>
        </div>
        <p class="lede" style="text-align:center;margin:20px auto 0">${scr.caption}</p>
      </div></div>`, dock: ctaBtn("Continue")};

  if(K==="permission") return {html:`<div class="body center">
      <div style="position:relative">
      <div class="spot" style="top:-16%"></div>
        <div style="text-align:center;margin-bottom:22px">${scr.art==="mic"?art.mic():art.bell()}</div>
        ${coachHTML(scr,d)}
      </div>
      ${(live && !s._alert)?"":`<div class="dim"></div><div class="ios-alert"><h4>${scr.alert.title}</h4><p>${scr.alert.body}</p>
        <div class="ios-btns"><button data-act="deny">${scr.alert.no}</button><button data-act="allow">${scr.alert.yes}</button></div></div>`}
      </div>`,
      dock: ctaBtn(scr.cta)+(scr.subcta2?`<div class="cta-sub"><b>${scr.subcta2}</b></div>`:"")};

  if(K==="loading"){
    const pct = s._pct||0;
    return {html:`<div class="body center">
      <div>
        <div class="load-pct">${pct}%</div>
        <h1 class="h1 sm" style="margin-top:14px">${T(scr.h1,d)}</h1>
        <div class="load-bar"><i style="width:${pct}%"></i></div>
        <div class="mini-note">${T(scr.steps[Math.min(3,Math.floor(pct/26))],d)}…</div>
      </div>
      <div class="card" style="margin-top:30px">
        <div style="font-size:11px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)">${scr.listTitle}</div>
        <div class="load-list">${scr.list.map((l,i)=>`<div class="load-item ${pct>i*25+8?"on":""}">
          <div class="load-dot">${pct>i*25+8?`<svg width="9" height="7" viewBox="0 0 11 9" fill="none" stroke="#FEFEFE" stroke-width="2.4" stroke-linecap="round"><path d="M1 4.6L4 7.6 10 1.4"/></svg>`:""}</div>
          <div>${T(l,d)}</div></div>`).join("")}</div>
      </div>
      ${scr.social?`<p class="lede" style="text-align:center;margin:20px auto 0;font-size:13px">${T(scr.social,d)}</p>`:""}
      </div>`, dock:""};
  }

  if(K==="phases") return {html:`<div class="body">
      <h1 class="h1 sm">${T(scr.h1,d)}</h1>
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center;gap:10px">
        ${scr.phases.map((p,i)=>`<div class="card" style="${i===0?"background:var(--ink);color:var(--paper)":""}">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div style="font-family:var(--serif);font-size:19px;font-weight:600">${p.n}. ${p.t}</div>
            <div style="font-size:11px;letter-spacing:.06em;${i===0?"color:rgba(254,254,254,.6)":"color:var(--muted)"}">${T(p.d,d)}</div></div>
          <div style="font-size:13px;line-height:1.5;margin-top:8px;${i===0?"color:rgba(254,254,254,.75)":"color:var(--ink-soft)"}">${T(p.b,d)}</div>
        </div>`).join("")}
      </div></div>`, dock: ctaBtn(scr.cta)};

  if(K==="projection"){
    return {html:`<div class="body">
      ${coachHTML(scr,d)}
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center">
        <div class="pcard hero" style="display:flex;align-items:flex-end;gap:18px;justify-content:center">
          <div style="text-align:center"><div class="plab">${scr.labelNow}</div>
            <div class="pval" style="font-size:30px">${d.scoreNow}</div></div>
          <div style="font-size:19px;opacity:.45;padding-bottom:9px">&rarr;</div>
          <div style="text-align:center"><div class="plab">${scr.labelAfter}</div>
            <div class="stat-huge accent" style="font-size:44px;line-height:1;margin-top:5px">${d.scoreAfter}</div></div>
        </div>
        <div class="prof">
          <div class="prof-head"><span>${scr.headLeft}</span><span>${scr.headRight}</span></div>
          ${d.dims.map(([nm,v,q])=>`<div class="prow"><span class="pn">${nm}</span>${art.meterDual(v,q)}
            <span class="pp" style="width:auto;flex:0 0 48px;font-size:11px">${v}&rarr;${q}</span></div>`).join("")}
        </div>
        <div class="mini-note" style="text-align:center;margin-top:14px">${T(scr.caption,d)}</div>
      </div></div>`, dock: ctaBtn(scr.cta)};
  }

  if(K==="paywall"){
    const cur = s.plan || "solo";
    return {html:`<div class="body scroll">
      <div class="eyebrow">${scr.eyebrow}</div>
      <h1 class="h1 sm">${scr.h1}</h1>
      <div style="margin-top:20px">${scr.plans.map(p=>`
        <button class="plan ${cur===p.v?"sel":""}" data-v="${p.v}">
          ${p.rec?`<span class="pl-chip">${p.rec}</span>`:""}
          <div class="pl-top"><span class="pl-name">${p.label}</span>
            <span class="pl-price">${p.price}${p.per?`<small>${p.per}</small>`:""}</span></div>
          <div class="pl-sub">${T(p.sub,d)}</div>
        </button>`).join("")}</div>
      <div class="fine">${scr.fine}</div>
      </div>`, dock: ctaBtn(scr.ctaByPlan[cur]||"Continue")};
  }

  if(K==="deck"){
    return {html:`<div class="body scroll">
      <div style="text-align:center">
        <div style="width:42px;height:42px;border-radius:50%;background:var(--ink);margin:0 auto 12px;display:flex;align-items:center;justify-content:center">
          <svg width="17" height="13" viewBox="0 0 11 9" fill="none" stroke="#FEFEFE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4.6L4 7.6 10 1.4"/></svg></div>
        <h1 class="h1 sm">${T(scr.h1,d)}</h1>
      </div>
      <div class="slide" style="margin-top:16px"><div class="sk"></div>
        <div class="st">${esc(d.titleShown)}</div>
        <div class="sg">${d.genreLabel} · ${d.budgetPhrase}</div>
        <div class="sl">${esc(d.logline)}</div>
      </div>
      <div class="mini-note" style="margin-top:10px;text-align:center">${T(scr.tradition,d)}</div>
      <div class="thumbs">${scr.slides.map((nm,i)=>`<div style="animation-delay:${(0.14+i*0.03).toFixed(2)}s">${nm}</div>`).join("")}</div>
      <div class="field-lab" style="margin-top:16px">${scr.versionsLabel}</div>
      <div class="chips">${d.roomChips.map((r,i)=>`<span class="chip ${i===0?"on":""}">${r}</span>`).join("")}</div>
      </div>`, dock: ctaBtn(scr.cta)};
  }

  if(K==="home") return {html:`<div class="body" style="padding-bottom:0">
      <div class="home-top">
        <img class="home-logo" src="logo.svg" alt="FilmTailor">
        <div class="streak">${d.scoreNow}% ${scr.readyLabel}</div>
      </div>
      <div class="field-lab" style="margin-top:20px">${scr.slateLabel}</div>
      <div class="hcard" style="background:var(--ink);color:var(--paper);margin-top:0">
        <div style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:rgba(254,254,254,.55);font-weight:600">${d.genreLabel} · ${d.budgetPhrase}</div>
        <div style="font-family:var(--serif);font-size:28px;font-weight:600;letter-spacing:-.02em;margin-top:6px">${esc(d.titleShown)}</div>
        <div class="chips">${d.roomChips.map(r=>`<span class="chip" style="background:rgba(254,254,254,.12);color:var(--paper)">${r}</span>`).join("")}</div>
        <div style="height:4px;border-radius:2px;background:rgba(254,254,254,.18);margin-top:14px">
          <div style="width:${d.scoreNow}%;height:100%;background:#FF0099;border-radius:2px"></div></div>
      </div>
      <div class="hcard" style="display:flex;align-items:center;gap:12px">
        <div style="flex:1"><div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--muted);text-transform:uppercase">${scr.nextLabel}</div>
          <div style="font-size:14.5px;font-weight:600;margin-top:4px">${scr.nextActions[d.weakKey]||""}</div></div>
        <div style="background:var(--ink);color:var(--paper);border-radius:99px;padding:9px 16px;font-size:13px;font-weight:600">${scr.goLabel}</div>
      </div>
      <div class="hcard" style="background:transparent;border:1.5px dashed var(--paper-line);text-align:center;color:var(--muted);font-weight:600;font-size:14px">+ ${scr.newLabel}</div>
      <div class="fab">+</div>
      <div class="tabbar">${scr.tabs.map((t,i)=>`<div class="tab ${i===0?"on":""}"><span class="ti">${["▦","▭","◈","○"][i]}</span>${t}</div>`).join("")}</div>
      </div>`, dock:""};

  if(K==="coachOnly") return {html:`<div class="body center" style="position:relative">
      <div class="spot" style="top:14%;opacity:.6"></div>
      <div style="position:relative">${coachHTML(scr,d)}
      ${scr.sub?`<p class="coach-lede" style="margin-top:14px">${scr.sub}</p>`:""}</div></div>`,
      dock: ctaBtn(scr.cta)};

  if(K==="benefits") return {html:`<div class="body">
      ${coachHTML(scr,d)}
      <div class="grow" style="display:flex;flex-direction:column;justify-content:center">
        <div class="blist">${scr.items.map(([t,b],i)=>`<div class="brow">
          <div class="bic">${BICONS[i]}</div>
          <div><div class="bt">${T(t,d)}</div><div class="bb">${T(b,d)}</div></div></div>`).join("")}</div>
      </div></div>`, dock: ctaBtn(scr.cta)};

  return {html:`<div class="body"></div>`, dock:""};
}

function wheelCol(name, items, sel){
  return `<div class="wheel" data-col="${name}"><div class="wheel-pad"></div>
    ${items.map((it,i)=>`<div class="wheel-item ${i===sel?"on":""}">${it}</div>`).join("")}
    <div class="wheel-pad"></div></div>`;
}

/* ---------- conditional screens ----------
   Reassurance aimed at someone who isn't worried reads as canned. */
const none1 = a => !a || a.filter(x => x !== "none").length === 0;
const SKIP = {};
const skipped = (scr, s) => !!(scr.skip && SKIP[scr.skip] && SKIP[scr.skip](s));

/* ---------- position / progress ---------- */
const chromed = SCREENS.filter(x=>x.chrome!==false);
function posFor(scr){
  const n = chromed.indexOf(scr)+1;
  return {n, total:chromed.length, pct:n/chromed.length};
}

function renderScreen(scr, s, live){
  const d = derive(s);
  const b = renderBody(scr, s, d, live);
  return `<div class="screen">${sb()}${navrow(scr,posFor(scr))}${b.html}${b.dock?dock(b.dock):""}${ind}</div>`;
}

/* ---------- filmstrip ---------- */
function buildStrip(){
  const strip = document.getElementById("filmstrip");
  strip.innerHTML = SCREENS.map((scr,i)=>{
    const demo = Object.assign({}, START, DEMO, {_pct:64});
    return `<div class="thumb" data-i="${i}">
      <div class="thumb-frame"><div class="thumb-scale">${renderScreen(scr, demo, false)}</div></div>
      <div class="thumb-cap"><b>${scr.name||scr.id}</b><span class="thumb-num">${String(i+1).padStart(2,"0")}</span></div>
    </div>`;
  }).join("");
  strip.querySelectorAll(".thumb").forEach(t=>t.addEventListener("click",()=>go(+t.dataset.i)));
}

/* ---------- live stage ---------- */
let timers=[];
function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }

/* draw(anim). "fwd" / "back" play the entrance, undefined is a silent
   re-render (used when an answer changes something on the same screen). */
function draw(anim){
  const scr = SCREENS[idx];
  const el = document.getElementById("livePhone");
  el.innerHTML = renderScreen(scr, S, true);
  /* entrance motion only when someone can see it: a hidden tab pauses
     animations on their first keyframe, which is opacity 0, so a screen
     rendered in the background would otherwise stay blank */
  if(anim && !document.hidden){
    const sc = el.querySelector(".screen");
    if(sc) sc.classList.add("enter", anim==="back" ? "rev" : "fwd");
    countUp(el);
  }
  document.getElementById("counter").textContent = (idx+1)+" / "+SCREENS.length;

  document.querySelectorAll(".thumb").forEach(t=>t.classList.toggle("active", +t.dataset.i===idx));
  const act = document.querySelector(".thumb.active");
  if(act){ const strip=document.getElementById("filmstrip");
    strip.scrollTo({left: act.offsetLeft - strip.clientWidth/2 + act.clientWidth/2, behavior:"smooth"}); }

  wire(variantFor(scr, S, derive(S)), el);
}

/* big stat numbers tick up on arrival */
function countUp(el){
  const n = el.querySelector(".stat-huge");
  if(!n) return;
  const m = n.textContent.trim().match(/^(\d+)(%?)$/);
  if(!m) return;
  const target = +m[1], suffix = m[2];
  if(target < 4) return;
  /* start the clock on the first real frame, and never blank the number
     before it: requestAnimationFrame does not fire in a hidden tab, and
     pre-zeroing would strand the figure at 0 if the user switches away. */
  const dur = 620; let t0 = 0;
  const step = now => {
    if(!t0) t0 = now;
    const p = Math.min(1,(now-t0)/dur), e = 1-Math.pow(1-p,3);
    n.textContent = Math.round(target*e) + suffix;
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function wire(scr, el){
  clearTimers();
  el.querySelectorAll("[data-act='next']").forEach(b=>b.addEventListener("click",()=>{
    if(scr.kind==="permission" && !S._alert){ S._alert=true; draw(); return; }
    go(idx+1);
  }));
  el.querySelectorAll("[data-act='allow'],[data-act='deny']").forEach(b=>b.addEventListener("click",()=>go(idx+1)));
  el.querySelectorAll("[data-act='back']").forEach(b=>b.addEventListener("click",()=>go(idx-1)));
  el.querySelectorAll("[data-act='nodate']").forEach(b=>b.addEventListener("click",()=>{
    S.days=45; S.noDate=true; go(idx+1); }));

  // options: mutate in place so the color transition plays
  const CHECK = `<svg width="11" height="9" viewBox="0 0 11 9" fill="none" stroke="#030909" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4.6L4 7.6 10 1.4"/></svg>`;
  el.querySelectorAll(".opt").forEach(b=>b.addEventListener("click",()=>{
    const v=b.dataset.v;
    if(scr.multi){
      const cur=S[scr.key]||[];
      S[scr.key] = cur.includes(v) ? cur.filter(x=>x!==v) : (v==="none"?["none"]:cur.filter(x=>x!=="none").concat(v));
    } else { S[scr.key]=v; if(scr.key==="genre") S.comps=[]; }
    b.classList.remove("tapped"); void b.offsetWidth; b.classList.add("tapped");
    const cur=S[scr.key];
    el.querySelectorAll(".opt").forEach(o=>{
      const on = scr.multi ? (cur||[]).includes(o.dataset.v) : cur===o.dataset.v;
      o.classList.toggle("sel", on);
      const mark=o.querySelector(".opt-mark");
      if(mark) mark.innerHTML = on ? CHECK : "";
    });
    const cta = el.querySelector(".cta[data-act='next']");
    if(cta) cta.disabled = scr.multi ? !(cur||[]).length : !cur;
  }));

  // binary
  if(scr.kind==="binary") el.querySelectorAll(".cta[data-v]").forEach(b=>b.addEventListener("click",()=>{
    S[scr.key]=b.dataset.v; draw(); timers.push(setTimeout(()=>go(idx+1),260));
  }));

  // slider
  // plan cards: select in place, and the button says what the choice means
  el.querySelectorAll(".plan").forEach(b=>b.addEventListener("click",()=>{
    S.plan=b.dataset.v;
    el.querySelectorAll(".plan").forEach(o=>o.classList.toggle("sel", o.dataset.v===S.plan));
    const cta=el.querySelector(".cta[data-act='next']"); if(cta) cta.textContent=scr.ctaByPlan[S.plan]||"Continue";
  }));

  // text fields: mutate state in place so the cursor never jumps
  el.querySelectorAll("[data-field]").forEach(f=>f.addEventListener("input",()=>{
    S[f.dataset.field]=f.value;
    if(f.dataset.field==="logline"){
      const wc=f.value.trim().split(/\s+/).filter(Boolean).length, lab=el.querySelector(".wordcount");
      if(lab){ lab.textContent=wc+" "+(wc>35?scr.countLong:scr.countOk);
        lab.className="wordcount "+(wc>35?"long":(wc>=20?"good":"")); }
      const cta=el.querySelector(".cta[data-act='next']"); if(cta) cta.disabled=!f.value.trim();
    }
  }));

  const sl = el.querySelector("input.sl");
  if(sl) sl.addEventListener("input",e=>{
    S[scr.key||"nerves"] = +e.target.value;
    const d2 = derive(S), val = el.querySelector(".slide-val"), note = el.querySelector(".mini-note");
    if(scr.kind==="cutoffSlider"){
      const n=S.cutoffDays;
      if(val) val.textContent = n+" day"+(n>1?"s":"")+" before";
      if(note) note.textContent = "You'll stop editing on "+d2.cutoffDate+", day "+d2.cutoffDay+" of "+d2.days;
      const fill = el.querySelector(".card div div");
      if(fill){ const pct=Math.round(((d2.days-n)/d2.days)*100);
        fill.style.width=pct+"%"; fill.nextElementSibling.style.width=(100-pct)+"%"; }
    } else if(val){
      const lab = scr.labels.reduce((x,y)=> Math.abs(y[0]-S.nerves)<Math.abs(x[0]-S.nerves)?y:x)[1];
      val.textContent = lab;
    }
  });

  // wheel
  el.querySelectorAll(".wheel").forEach(w=>{
    const items=[...w.querySelectorAll(".wheel-item")];
    const on=items.findIndex(i=>i.classList.contains("on"));
    w.scrollTop = Math.max(0,on)*44;
    w.addEventListener("scroll",()=>{
      const i=Math.round(w.scrollTop/44);
      items.forEach((it,j)=>it.classList.toggle("on",j===i));
      clearTimeout(w._t); w._t=setTimeout(()=>syncDate(el),120);
    });
  });

  // record
  const rec = el.querySelector("[data-act='rec']");
  if(rec) rec.addEventListener("click",()=>{
    if(S._rec) return;
    S._rec=true; draw();
    timers.push(setTimeout(()=>{ S._rec=false;
      S.wpm = 158 + Math.floor(Math.random()*26);
      S.stakesSec = 11 + Math.floor(Math.random()*13);
      S.beats = 3 + (Math.random()<0.35 ? 1 : 0);
      go(idx+1); },3400));
  });

  // loading
  if(scr.kind==="loading"){
    S._pct=0; draw2();
    function draw2(){
      const tick=()=>{ S._pct=Math.min(100,S._pct+Math.ceil(Math.random()*7)+2);
        const cur=SCREENS[idx]; if(cur.kind!=="loading") return;
        document.getElementById("livePhone").innerHTML=renderScreen(cur,S,true);
        if(S._pct<100) timers.push(setTimeout(tick,210)); else timers.push(setTimeout(()=>go(idx+1),620)); };
      timers.push(setTimeout(tick,260));
    }
  }
}

function syncDate(el){
  const cols=[...el.querySelectorAll(".wheel")];
  if(cols.length<2) return;
  const val=c=>Math.round(c.scrollTop/44);
  const mo=val(cols[0]), dy=val(cols[1])+1, yr=2026+val(cols[2]);
  const t=new Date(); t.setHours(0,0,0,0);
  const target=new Date(yr,mo,dy);
  const days=Math.max(1,Math.round((target-t)/86400000));
  S.days=days; S.noDate=false;
  const note=el.querySelector(".mini-note");
  if(note) note.textContent = DAYS[target.getDay()]+" · "+days+" days away";
}

function go(i){
  const from = idx;
  const dir = i >= idx ? 1 : -1;
  while(i>=0 && i<SCREENS.length && skipped(SCREENS[i], S)) i += dir;
  if(i<0||i>=SCREENS.length) return;
  idx=i; S._rec=false; S._alert=false; draw(i>=from?"fwd":"back");
}

/* ---------- controls ---------- */
document.getElementById("nextBtn").addEventListener("click",()=>go(idx+1));
document.getElementById("prevBtn").addEventListener("click",()=>go(idx-1));
document.getElementById("restartBtn").addEventListener("click",()=>{ S=JSON.parse(JSON.stringify(START)); go(0); });
/* the strip starts collapsed so the prototype owns the window */
function stripLabel(){
  const w=document.getElementById("stripWrap"), open=!w.classList.contains("collapsed");
  document.getElementById("stripToggle").setAttribute("aria-expanded", open);
  document.getElementById("stripToggle").setAttribute("aria-label", open?"Collapse screens":"Show all screens");
  document.getElementById("stripMeta").textContent =
    open ? SCREENS.length+" screens" : "Show all "+SCREENS.length+" screens";
}
document.getElementById("stripToggle").addEventListener("click",()=>{
  document.getElementById("stripWrap").classList.toggle("collapsed");
  stripLabel();
  setTimeout(fit, 340);
});
document.addEventListener("keydown",e=>{
  if(/input|textarea/i.test((e.target&&e.target.tagName)||"")) return;
  if(e.key==="ArrowRight") go(idx+1);
  if(e.key==="ArrowLeft") go(idx-1);
});

/* ---------- fit the live phone to the viewport ---------- */
function fit(){
  const strip = document.querySelector(".strip-wrap");
  const avail = window.innerHeight - (strip?strip.offsetHeight:0) - 84;
  const scale = Math.max(.55, Math.min(1, avail/844));
  document.documentElement.style.setProperty("--pscale", scale.toFixed(3));
  document.querySelector(".phone-col").style.height = (844*scale+62)+"px";
}
window.addEventListener("resize", fit);

/* ---------- boot ---------- */
if("scrollRestoration" in history) history.scrollRestoration="manual";
window.scrollTo(0,0);
buildStrip();
stripLabel();
draw("fwd");
fit();
