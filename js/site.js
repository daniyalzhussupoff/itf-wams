/* ============================================================
   НАГН — shared site engine (vanilla, zero deps)
   Drives every public page. Branches on <body data-page="...">.
   ============================================================ */
(function(){
"use strict";
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const root=document.documentElement;
const PAGE=document.body.dataset.page||"home";

/* ---------------- content store ---------------- */
const LS_CONTENT="kn_content", LS_APPS="kn_apps", LS_LANG="kn_lang";
function deepMerge(base,over){
  if(Array.isArray(over)) return over.slice();
  if(over&&typeof over==="object"){
    const out=Array.isArray(base)?[]:Object.assign({},base);
    for(const k in over) out[k]=deepMerge(base?base[k]:undefined,over[k]);
    return out;
  }
  return over===undefined?base:over;
}
const Store={
  get(){
    const def=window.SITE_DEFAULTS||{};
    let over={};
    try{over=JSON.parse(localStorage.getItem(LS_CONTENT)||"{}");}catch(e){}
    return deepMerge(def,over);
  },
  saveOverlay(obj){ localStorage.setItem(LS_CONTENT,JSON.stringify(obj)); },
  reset(){ localStorage.removeItem(LS_CONTENT); },
  apps(){ try{return JSON.parse(localStorage.getItem(LS_APPS)||"[]");}catch(e){return[];} },
  addApp(a){ const l=Store.apps(); l.unshift(a); localStorage.setItem(LS_APPS,JSON.stringify(l)); },
  setApps(l){ localStorage.setItem(LS_APPS,JSON.stringify(l)); }
};
window.KN_Store=Store;
const C=Store.get();
let NEWS=C.news.slice().filter(n=>!/[іїєґІЇЄҐ]/.test((n.en?.title||n.ru?.title||"")));
function langNews(){return NEWS.filter(n=>!n.lang||(lang==="en"?n.lang==="en":n.lang==="ru"));}

/* ---------------- i18n ---------------- */
let lang=localStorage.getItem(LS_LANG)||"ru";
if(!window.I18N[lang]) lang="ru";
function t(key){ const d=window.I18N; return (d[lang]&&d[lang][key])||(d.ru&&d.ru[key])||(d.en&&d.en[key])||key; }
function locale(){return lang==="kz"?"kk-KZ":lang==="en"?"en-US":"ru-RU";}
window.KN_lang=()=>lang;

/* ---------------- shared header / footer ---------------- */
const NAVLINKS=[
  {href:"about.html",key:"nav.about"},
  {href:"structure.html",key:"nav.structure"},
  {href:"members.html",key:"nav.members"},
  {href:"documents.html",key:"nav.docs"},
  {href:"vestnik.html",key:"nav.vestnik"},
  {href:"news.html",key:"nav.news"},
  {href:"contacts.html",key:"nav.contacts"}
];
/* homepage in-page sections for the core-log rail (home only) */
const HOME_SECTIONS=[
  {href:"#about",key:"nav.about"},
  {href:"#membership",key:"mem.kicker"},
  {href:"#directions",key:"dir.kicker"},
  {href:"#news",key:"nav.news"},
  {href:"#vestnik",key:"nav.vestnik"},
  {href:"#contacts",key:"nav.contacts"}
];
const here=(location.pathname.split("/").pop()||"index.html");
function navHTML(mobile){
  return NAVLINKS.map(l=>`<a href="${l.href}" data-i18n="${l.key}"${l.href===here?' class="active"':""}>${t(l.key)}</a>`).join("");
}
function renderHeader(){
  const el=$("#kn-header"); if(!el) return;
  el.innerHTML=`
  <div class="scrollbar" aria-hidden="true"><span id="scrollbarFill"></span></div>
  <header class="nav" id="nav">
    <div class="nav__inner">
      <a class="brand" href="index.html" aria-label="НАГН">
        <svg class="brand__mark" viewBox="0 0 100 100" aria-hidden="true"><g><ellipse cx="50" cy="50" rx="44" ry="18"/><ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(120 50 50)"/><circle cx="50" cy="50" r="6"/></g></svg>
        <span class="brand__word">НАГН<small>горные науки</small></span>
      </a>
      <nav class="links" aria-label="Navigation">${navHTML()}</nav>
      <div class="nav__right">
        <div class="lang" role="group" aria-label="Language">
          <button class="lang__btn" data-lang-btn="kz">KZ</button>
          <button class="lang__btn" data-lang-btn="ru">RU</button>
          <button class="lang__btn" data-lang-btn="en">EN</button>
          <span class="lang__pill" aria-hidden="true"></span>
        </div>
        <button class="themed" id="themeToggle" aria-label="${t("theme.toggle")}" title="${t("theme.toggle")}">
          <svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M19.4 4.6l-1.9 1.9M6.5 17.5l-1.9 1.9"/></g></svg>
          <svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" fill="currentColor"/></svg>
        </button>
        <a class="pill" href="#contacts" data-i18n="hero.cta2">${t("hero.cta2")}</a>
        <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="drawer" id="drawer" aria-hidden="true">
    ${navHTML(true)}
  </div>`;
}
function renderFooter(){
  const el=$("#kn-footer"); if(!el) return;
  const ct=C.settings.contact;
  const tel=ct.phone.replace(/[^+\d]/g,"");
  el.innerHTML=`
  <footer class="footer">
    <div class="wrap footer__inner">
      <div class="footer__brandcol">
        <a class="brand" href="index.html">
          <svg class="brand__mark" viewBox="0 0 100 100" aria-hidden="true"><g><ellipse cx="50" cy="50" rx="44" ry="18"/><ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(120 50 50)"/><circle cx="50" cy="50" r="6"/></g></svg>
          <span class="brand__word">НАГН<small>горные науки</small></span>
        </a>
        <p class="footer__tag" data-i18n="footer.tag">${t("footer.tag")}</p>
        <p class="footer__legalname" data-i18n="footer.company">${t("footer.company")}</p>
        <p class="footer__addr" data-contact="address">${ct.address[lang]||ct.address.ru}</p>
      </div>
      <nav class="footer__col">
        <h4 data-i18n="footer.c1">${t("footer.c1")}</h4>
        <a href="about.html" data-i18n="nav.about">${t("nav.about")}</a>
        <a href="structure.html" data-i18n="nav.structure">${t("nav.structure")}</a>
        <a href="members.html" data-i18n="nav.members">${t("nav.members")}</a>
      </nav>
      <nav class="footer__col">
        <h4 data-i18n="footer.c2">${t("footer.c2")}</h4>
        <a href="documents.html" data-i18n="nav.docs">${t("nav.docs")}</a>
        <a href="vestnik.html" data-i18n="nav.vestnik">${t("nav.vestnik")}</a>
        <a href="news.html" data-i18n="nav.news">${t("nav.news")}</a>
      </nav>
      <nav class="footer__col">
        <h4 data-i18n="footer.c3">${t("footer.c3")}</h4>
        <a href="mailto:${ct.email}" data-contact="email">${ct.email}</a>
        <a href="tel:${tel}" data-contact="phone">${ct.phone}</a>
        <a href="contacts.html" data-i18n="nav.contacts">${t("nav.contacts")}</a>
      </nav>
    </div>
    <div class="wrap footer__bottom">
      <span>© 2026 <span data-i18n="footer.company">${t("footer.company")}</span>. <span data-i18n="footer.rights">${t("footer.rights")}</span></span>
      <span class="footer__disc" data-i18n="footer.disc">${t("footer.disc")}</span>
    </div>
  </footer>
  <a href="#top" class="totop" id="totop" aria-label="top">
    <svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>`;
}

/* ---------------- theme toggle (light default + dark) ---------------- */
function wireTheme(){
  const KEY="nagn_theme";
  root.dataset.theme=localStorage.getItem(KEY)||"light";
  const btn=$("#themeToggle"); if(!btn) return;
  btn.addEventListener("click",()=>{
    const next=root.dataset.theme==="dark"?"light":"dark";
    root.dataset.theme=next; localStorage.setItem(KEY,next);
  });
}

/* ---------------- core-log signature rail (section index) ---------------- */
function wireCorelog(){
  const box=$("#corelog"); if(!box) return;
  box.innerHTML=HOME_SECTIONS.map(l=>`<a class="corelog__l" data-target="${l.href}"><i class="corelog__t"></i><span data-i18n="${l.key}">${t(l.key)}</span></a>`).join("");
  const links=$$(".corelog__l",box);
  links.forEach(a=>a.addEventListener("click",()=>{const tg=$(a.dataset.target);if(!tg)return;
    scrollTo({top:tg.getBoundingClientRect().top+scrollY-80,behavior:reduce?"auto":"smooth"});}));
  function upd(){
    let idx=0;
    HOME_SECTIONS.forEach((l,i)=>{const tg=$(l.href);if(tg&&tg.getBoundingClientRect().top<=140)idx=i;});
    links.forEach((a,i)=>a.classList.toggle("on",i===idx));
  }
  addEventListener("scroll",upd,{passive:true}); upd();
}

/* ---------------- apply translations to DOM ---------------- */
function applyText(){
  root.lang=lang==="kz"?"kk":lang; root.dataset.lang=lang;
  $$("[data-i18n]").forEach(el=>{ const v=t(el.getAttribute("data-i18n")); if(v!=null) el.textContent=v; });
  $$("[data-i18n-ph]").forEach(el=>{ el.setAttribute("placeholder",t(el.getAttribute("data-i18n-ph"))); });
  // contact + price hooks
  const ct=C.settings.contact;
  $$('[data-contact="address"]').forEach(e=>e.textContent=ct.address[lang]||ct.address.ru);
  $$('[data-contact="email"]').forEach(e=>{e.textContent=ct.email; if(e.tagName==="A")e.href="mailto:"+ct.email;});
  $$('[data-contact="phone"]').forEach(e=>{e.textContent=ct.phone; if(e.tagName==="A")e.href="tel:"+ct.phone.replace(/[^+\d]/g,"");});
  $$('[data-price="share"]').forEach(e=>e.innerHTML="$"+C.settings.share.price);
  $$('[data-price="shareChange"]').forEach(e=>e.textContent=C.settings.share.change);
  $$('[data-price="lme"]').forEach(e=>e.innerHTML="$"+C.settings.lme.price+'<span class="quote__unit">'+(C.settings.lme.unit||"")+"</span>");
  $$('[data-price="lmeChange"]').forEach(e=>e.textContent=C.settings.lme.change);
  if(C.settings.cobalt){
    $$('[data-price="cobalt"]').forEach(e=>e.innerHTML="$"+C.settings.cobalt.price+'<span class="quote__unit">'+(C.settings.cobalt.unit||"")+"</span>");
    $$('[data-price="cobaltChange"]').forEach(e=>e.textContent=C.settings.cobalt.change);
  }
}

/* ---------------- language switch ---------------- */
function positionPill(){
  $$("[data-lang-btn]").forEach(b=>b.classList.toggle("on",b.dataset.langBtn===lang));
  const pill=$(".lang__pill"), act=$(`[data-lang-btn="${lang}"]`);
  if(pill&&act){pill.style.left=act.offsetLeft+"px";pill.style.width=act.offsetWidth+"px";}
}
function wireLang(){
  $$("[data-lang-btn]").forEach(b=>b.addEventListener("click",()=>{
    lang=b.dataset.langBtn; localStorage.setItem(LS_LANG,lang);
    applyText(); positionPill();
    if(PAGE==="home") startRotator();
    if(PAGE==="home"||PAGE==="news") buildNews(); if(PAGE==="news") renderNewsGrid();
  }));
}

/* ---------------- nav scroll / progress / drawer ---------------- */
function wireChrome(){
  const nav=$("#nav"), fill=$("#scrollbarFill"), totop=$("#totop");
  function onScroll(){
    const y=scrollY, h=document.body.scrollHeight-innerHeight;
    if(nav) nav.classList.toggle("scrolled",y>30);
    if(totop) totop.classList.toggle("show",y>700);
    if(fill) fill.style.width=(h>0?(y/h*100):0)+"%";
  }
  addEventListener("scroll",onScroll,{passive:true}); onScroll();
  const burger=$("#burger"), drawer=$("#drawer");
  if(burger&&drawer){
    burger.addEventListener("click",()=>{const o=!drawer.classList.contains("open");drawer.classList.toggle("open",o);burger.setAttribute("aria-expanded",o);});
    $$("a",drawer).forEach(a=>a.addEventListener("click",()=>{drawer.classList.remove("open");burger.setAttribute("aria-expanded",false);}));
  }
  // smooth scroll w/ nav offset for in-page anchors
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",e=>{
      const id=a.getAttribute("href"); if(id.length<2) {window.scrollTo({top:0,behavior:reduce?"auto":"smooth"});return;}
      const tg=$(id); if(!tg) return;
      e.preventDefault();
      const y=tg.getBoundingClientRect().top+scrollY-72;
      window.scrollTo({top:y,behavior:reduce?"auto":"smooth"});
    });
  });
}

/* ---------------- reveal + count-up ---------------- */
function fmt(n,dec){return dec?n.toFixed(dec):Math.round(n).toLocaleString(locale());}
function countUp(el){
  const target=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,dur=1400,t0=performance.now();
  if(reduce){el.textContent=fmt(target,dec);return;}
  (function tick(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=fmt(target*e,dec); if(p<1)requestAnimationFrame(tick); else el.textContent=fmt(target,dec);})(t0);
}
function wireReveal(){
  const io=new IntersectionObserver((es)=>{es.forEach(en=>{
    if(!en.isIntersecting)return;
    en.target.classList.add("in");
    $$("[data-count]",en.target).forEach(c=>{if(!c._d){c._d=1;countUp(c);}});
    io.unobserve(en.target);
  });},{threshold:.14});
  $$(".reveal").forEach(el=>io.observe(el));
}

/* ---------------- hero rotator (home) ---------------- */
let rotI=0,rotTimer=null;
function paintRotator(){
  const el=$("#rotator"); if(!el) return;
  const arr=window.I18N[lang].titles||window.I18N.ru.titles, text=arr[rotI%arr.length];
  el.innerHTML=text.split(" ").map(w=>{const acc=/^\*.*\*$/.test(w),clean=w.replace(/\*/g,"");
    return `<span class="w${acc?" accent":""}">${clean}</span>`;}).join(" ");
  $$(".w",el).forEach((w,i)=>{if(reduce){w.classList.add("show");return;}setTimeout(()=>w.classList.add("show"),90+i*70);});
}
function startRotator(){
  clearInterval(rotTimer); rotI=0; paintRotator(); if(reduce)return;
  rotTimer=setInterval(()=>{const el=$("#rotator");if(!el)return;
    $$(".w",el).forEach((w,i)=>setTimeout(()=>w.classList.remove("show"),i*28));
    setTimeout(()=>{rotI++;paintRotator();},460);},4400);
}

/* ---------------- inside row (home news, Fortescue-style) ---------------- */
function newsImg(n){return n.image?`background-image:url('${n.image}')`:"";}
function catLabel(c){return{"Рынок":"Инвесторам","Market":"Investors","Нарық":"Инвесторам"}[c]||c;}
function stripHtml(s){if(!s)return"";const d=document.createElement("div");d.innerHTML=s;return(d.textContent||"").replace(/\s+/g," ").trim();}
function buildNews(){
  const row=$("#newsTrack"); if(!row) return;
  row.innerHTML="";
  langNews().forEach((n)=>{
    const origIdx=NEWS.indexOf(n),L=n[lang]||n.ru||n.en||{};
    const c=document.createElement("article");
    c.className="icard";
    c.innerHTML=`<div class="icard__img ${n.image?"":n.cls}" style="${newsImg(n)}"><div class="slide__hex"></div></div>
      <div class="icard__scrim"></div>
      <span class="icard__cat">${catLabel(L.cat)} · ${fmtDate(n.date)}</span>
      <h3 class="icard__title">${L.title}</h3>
      <button class="icard__go" aria-label="${t("news.read")}"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
    c.addEventListener("click",()=>openArticle(origIdx));
    row.appendChild(c);
  });
}
function wireInside(){
  const row=$("#newsTrack"); if(!row) return;
  const step=()=>{const c=row.querySelector(".icard");return c?c.offsetWidth+18:300;};
  const nx=$("#newsNext"),pv=$("#newsPrev");
  if(nx) nx.onclick=()=>row.scrollBy({left:step(),behavior:reduce?"auto":"smooth"});
  if(pv) pv.onclick=()=>row.scrollBy({left:-step(),behavior:reduce?"auto":"smooth"});
  let down=false,sx=0,sl=0,moved=0;
  row.addEventListener("pointerdown",e=>{if(e.button)return;down=true;sx=e.clientX;sl=row.scrollLeft;moved=0;});
  row.addEventListener("pointermove",e=>{
    if(!down)return;
    const dx=e.clientX-sx; if(Math.abs(dx)>moved) moved=Math.abs(dx);
    if(moved>4){ row.classList.add("dragging"); row.scrollLeft=sl-dx; }   // enter drag only after real movement
  });
  const end=()=>{down=false;row.classList.remove("dragging");};
  row.addEventListener("pointerup",end);row.addEventListener("pointercancel",end);row.addEventListener("pointerleave",end);
  row.addEventListener("click",e=>{if(moved>6){e.preventDefault();e.stopPropagation();moved=0;}},true); // swallow click after a drag
}

/* ---------------- news grid + modal (news page) ---------------- */
function fmtDate(iso){const d=new Date(iso+"T00:00");return isNaN(d)?iso:d.toLocaleDateString(locale(),{day:"2-digit",month:"long",year:"numeric"});}
function renderNewsGrid(){
  const grid=$("#newsGrid"); if(!grid) return;
  const visible=langNews();
  if(!visible.length){grid.innerHTML=`<p class="body">${t("news.empty")}</p>`;return;}
  grid.innerHTML=visible.map((n)=>{const origIdx=NEWS.indexOf(n),L=n[lang]||n.ru||n.en||{};
    return `<article class="ncard reveal" data-i="${origIdx}" tabindex="0" role="button">
      <div class="ncard__img ${n.image?"":n.cls}" style="${newsImg(n)}"><div class="slide__hex"></div></div>
      <div class="ncard__body"><div class="slide__cat">${catLabel(L.cat)}<span class="slide__date">${fmtDate(n.date)}</span></div>
      <h3 class="ncard__title">${L.title}</h3><p class="ncard__ex">${stripHtml(L.excerpt)}</p>
      <span class="link">${t("news.read")}<svg viewBox="0 0 24 24" class="ico"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div></article>`;
  }).join("");
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.1});
  $$(".ncard",grid).forEach((c,i)=>{io.observe(c);
    const open=()=>openArticle(i);
    c.addEventListener("click",open);
    c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
}
function openArticle(i){
  const n=NEWS[i]; if(!n) return;
  if(n.url){ window.open(n.url,"_blank","noopener noreferrer"); return; }
  const L=n[lang]||n.ru||n.en||{},m=$("#articleModal");if(!m)return;
  $("#amBody").innerHTML=`<div class="am__img ${n.image?"":n.cls}" style="${newsImg(n)}"></div>
    <div class="am__in"><div class="slide__cat">${L.cat||""}<span class="slide__date">${fmtDate(n.date)}</span></div>
    <h2 class="am__title">${L.title||""}</h2>${((L.body||L.excerpt)||"").split("\n\n").map(p=>`<p>${p}</p>`).join("")}</div>`;
  m.classList.add("open");document.body.style.overflow="hidden";
}
function wireModal(){
  const m=$("#articleModal");if(!m)return;
  const close=()=>{m.classList.remove("open");document.body.style.overflow="";};
  $("#amClose")&&$("#amClose").addEventListener("click",close);
  m.addEventListener("click",e=>{if(e.target===m)close();});
  addEventListener("keydown",e=>{if(e.key==="Escape")close();});
}

/* ---------------- forms (apply / contact) ---------------- */
function wireForms(){
  const form=$("#applyForm")||$("#contactForm");
  if(!form) return;
  const isApply=form.id==="applyForm";
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const note=$(".form__note",form);
    // required check
    const required=$$("[required]",form).filter(f=>!String(f.value).trim()|| (f.type==="checkbox"&&!f.checked));
    if(required.length){ required.forEach(f=>f.classList.add("invalid"));
      note.textContent=t("f.err"); note.className="form__note err"; required[0].focus(); return; }
    Store.addApp({type:isApply?"application":"message",date:new Date().toISOString(),lang,...data});
    note.textContent=t("f.ok"); note.className="form__note ok";
    form.reset();
    $$(".invalid",form).forEach(f=>f.classList.remove("invalid"));
  });
  $$("input,textarea,select",form).forEach(f=>f.addEventListener("input",()=>f.classList.remove("invalid")));
}

/* ---------------- boot ---------------- */
renderHeader(); renderFooter();
applyText(); positionPill(); wireLang(); wireChrome(); wireTheme(); wireCorelog();
wireReveal(); wireForms(); wireModal();
if(PAGE==="home"){ startRotator(); buildNews(); wireInside(); }
if(PAGE==="news"){ renderNewsGrid(); }
const hv=$(".hero__video video"); if(hv&&hv.play) hv.play().catch(()=>{});
addEventListener("resize",positionPill,{passive:true});

})();
