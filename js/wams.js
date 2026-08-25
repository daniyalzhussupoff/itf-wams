/* ============================================================
   ВАГН / WAMS — site engine (vanilla, zero deps).
   Светлая стилистика семейства ITF: разметка собирается из классов
   слоя css/family.css (листы секций, кнопки, карточки, реестры, галерея,
   шапка, подвал). Header/footer inject · i18n (kz/ru/en) · sticky chrome +
   progress · направления · академии · документы · новости · счётчики ·
   reveal (+FAIL-SAFE) · форма. Ветвление по <body data-page>.
   ============================================================ */
(function(){
"use strict";
/* .js ставится скриптом, а не в разметке: если скрипт не отработал,
   фолбэк слоя html:not(.js) .reveal оставит контент видимым */
document.documentElement.classList.add("js");
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- data (real content from worldacademyms.com · client proofreads kz/en) ---------- */
var NAV=[["about","about.html","nav.about"],["academies","academies.html","nav.academies"],
 ["documents","documents.html","nav.docs"],["gallery","gallery.html","nav.gallery"],["news","news.html","nav.news"],["contacts","contacts.html","nav.contacts"]];
var DIRS=["1","2","3","4"];
var C=window.CONTENT||{};
function normalizeContent(){
  C=window.CONTENT||{};
  /* Portrait supplied for the president of the Kyrgyz Academy of Mining Sciences. */
  if(C.academies){
  C.academies.forEach(function(a){
    if(a&&a.president==="Кожогулов Камчибек Чонмурунович"){
      a.photo="assets/media/2023/01/kozhogulov-kamchibek.jpg";
    }
    if(a&&a.president==="П. Очирбат"){
      a.photo="assets/media/2023/01/ochirbat-p.jpg";
    }
  });
  /* Keep the member-academy registry in alphabetical order by the
     displayed Russian country name (the site's default language).  The
     same array feeds the home-page register, the full directory and the
     country ticker, so every presentation stays in sync. */
  C.academies.sort(function(a,b){
    var aa=String(a.country_ru||"").toLocaleUpperCase("ru");
    var bb=String(b.country_ru||"").toLocaleUpperCase("ru");
    return aa<bb?-1:(aa>bb?1:0);
  });
  }
}
normalizeContent();
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
function LL(o,base){ var en=curLang()==="en"; return (en&&o[base+"_en"])||o[base+"_ru"]||o[base]||""; }
function paras(arr){ return (arr||[]).map(function(p){ return '<p>'+esc(p)+'</p>'; }).join(""); }
function flagEmoji(cc){ return (cc||"").toUpperCase().replace(/[A-Z]/g,function(c){ return String.fromCodePoint(127397+c.charCodeAt(0)); }); }
function more(){ return curLang()==="en"?"Read more →":"Подробнее →"; }
var ACADEMY_PAGES={KZ:"academy-kazakhstan.html",RU:"academy-russia.html",UA:"academy-ukraine.html",KG:"academy-kyrgyzstan.html",MN:"academy-mongolia.html",GE:"academy-georgia.html",BY:"academy-belarus.html",UZ:"academy-uzbekistan.html"};
var LEADER_PAGES={"Раимжанов Бахадиржан Раимжанович":"leader-raimzhanov.html","Войтов Игорь Витальевич":"leader-voytov.html"};
function academyPage(a){ return a&&ACADEMY_PAGES[a.code]||"academies.html"; }
function leaderPage(v){ return v&&LEADER_PAGES[v.name_ru]||"about.html#leadership"; }

/* ---------- i18n ---------- */
var LANGS=["ru","en","kz"];
function curLang(){ return localStorage.getItem("wams_lang")||"ru"; }
function dict(){ return (window.I18N&&window.I18N[curLang()])||{}; }
function T(k){ var d=dict(); return (k in d)?d[k]:((window.I18N&&window.I18N.ru[k])||k); }
function applyText(root){
  $$("[data-i18n]",root).forEach(function(el){ el.textContent=T(el.getAttribute("data-i18n")); });
  $$("[data-i18n-ph]",root).forEach(function(el){ el.setAttribute("placeholder",T(el.getAttribute("data-i18n-ph"))); });
}
var _booted=false;
function setLang(l){
  if(LANGS.indexOf(l)<0) l="ru";
  localStorage.setItem("wams_lang",l);
  document.documentElement.setAttribute("lang",l);
  if(_booted){ renderContent(); $$(".reveal").forEach(function(i){ i.classList.add("in"); }); }
  applyText(document);
  $$(".lang button").forEach(function(b){ b.classList.toggle("on", b.dataset.l===l); });
}
function wireLang(){ $$(".lang button").forEach(function(b){ b.addEventListener("click",function(){ setLang(b.dataset.l); }); }); }

/* ---------- header / footer ---------- */
function renderHeader(){
  var host=$("#site-header"); if(!host) return;
  var page=document.body.dataset.page||"home";
  var links=NAV.map(function(n){ return '<a href="'+n[1]+'" data-page="'+n[0]+'" data-i18n="'+n[2]+'"'+(n[0]===page?' class="on"':'')+'></a>'; }).join("");
  var drawer=NAV.map(function(n){ return '<a href="'+n[1]+'" data-i18n="'+n[2]+'"></a>'; }).join("");
  host.innerHTML=
   '<div class="prog" id="prog"></div>'+
   '<header class="hdr" id="hdr"><div class="wrap hdr__in">'+
     '<a class="brand" href="index.html"><img src="img/logo.png" alt="">'+
       '<span><b data-i18n="brand.name"></b><small data-i18n="brand.tag"></small></span></a>'+
     '<nav class="nav">'+links+'</nav>'+
     '<div class="hdr__r">'+
       '<div class="lang">'+LANGS.map(function(l){return '<button data-l="'+l+'">'+l.toUpperCase()+'</button>';}).join("")+'</div>'+
       '<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>'+
     '</div>'+
   '</div></header>'+
   '<div class="drawer" id="drawer">'+drawer+'<a class="btn" href="contacts.html" data-i18n="cta.join"></a></div>';
}
function renderFooter(){
  var host=$("#site-footer"); if(!host) return;
  var contact=(C.settings&&C.settings.contact)||{};
  var phone=contact.phone||"+7 (7172) 78-88-33",phoneHref=contact.phoneHref||"+77172788833",email=contact.email||"nbr21@mail.ru";
  var nav=NAV.map(function(n){ return '<a href="'+n[1]+'" data-i18n="'+n[2]+'"></a>'; }).join("");
  host.innerHTML=
   '<footer class="foot"><div class="wrap">'+
    '<div class="foot__top">'+
     '<div class="foot__b"><img class="foot__logo" src="img/logo.png" alt="">'+
       '<b data-i18n="brand.name"></b><p data-i18n="foot.tagline"></p></div>'+
     '<div class="foot__col"><p class="foot__h" data-i18n="foot.nav"></p>'+nav+'</div>'+
     '<div class="foot__col"><p class="foot__h" data-i18n="foot.contact"></p><p data-i18n="con.addr.v"></p>'+
       '<a href="tel:'+esc(phoneHref)+'">'+esc(phone)+'</a><a href="mailto:'+esc(email)+'">'+esc(email)+'</a></div>'+
    '</div><div class="foot__bot"><span data-i18n="foot.rights"></span><span>Astana · KZ</span></div>'+
   '</div></footer>';
}

function applySettings(){
  var contact=(C.settings&&C.settings.contact)||{},pres=C.leadership&&C.leadership.president||{},sec=C.leadership&&C.leadership.secretary||{};
  function link(id,text,href){ var el=$(id); if(!el)return; el.textContent=text||el.textContent; el.href=href||el.href; }
  link("#contact-phone",contact.phone,"tel:"+(contact.phoneHref||"+77172788833"));
  link("#president-email",pres.email,"mailto:"+(pres.email||"nbr21@mail.ru"));
  link("#president-phone",pres.phone,"tel:"+(pres.phoneHref||"+77017942677"));
  link("#secretary-email",sec.email,"mailto:"+(sec.email||"aimsabir54@gmail.com"));
  link("#secretary-phone",sec.phone,"tel:"+(sec.phoneHref||"+77772611773"));
}

/* ---------- направления деятельности ---------- */
function renderDirs(){
  var box=$("#dirs"); if(!box) return;
  box.innerHTML=DIRS.map(function(n,i){
    return '<div class="card card--txt reveal" style="transition-delay:'+(i*60)+'ms"><div class="card__b">'+
      '<span class="card__n">0'+(i+1)+'</span>'+
      '<h3 class="card__t" data-i18n="dir.'+n+'"></h3>'+
      '<p class="card__p" data-i18n="dir.'+n+'d"></p></div></div>';
  }).join("");
}

/* ---------- бегущая строка стран-участниц (реальные данные, бесшовный тройной цикл) ---------- */
function renderTicker(id){
  var box=$(id); if(!box||!C.academies) return;
  var unit=C.academies.map(function(a){ return '<span class="ticker__item">'+flagEmoji(a.code)+' '+esc(LL(a,"country"))+'</span><span class="ticker__dot">·</span>'; }).join("");
  box.innerHTML='<div class="ticker__track">'+unit+unit+unit+'</div>';
}

/* ---------- числа в герое: считаются от реальных данных ---------- */
function renderHeroNums(){
  var box=$("#hero-nums"); if(!box) return;
  var photos=(C.galleryGroups||[]).reduce(function(n,g){return n+(g.photos||[]).length},0);
  /* год выводится как есть: накручивать 2018 от нуля — считать дату
     количеством. Считаются только величины. */
  var items=[[(C.academies||[]).length,"hero.n1",true],[2018,"hero.n2",false],[photos,"hero.n3",true]];
  box.innerHTML=items.map(function(it,i){
    var v=it[2] ? '<b class="wnum__v mono" data-count="'+it[0]+'">0</b>'
                : '<b class="wnum__v mono">'+it[0]+'</b>';
    return '<div class="wnum" style="transition-delay:'+(i*90)+'ms">'+v+
      '<span class="wnum__l" data-i18n="'+it[1]+'"></span></div>';
  }).join("");
}

/* ---------- цитата миссии ---------- */
function renderMission(id){
  var el=$(id); if(!el) return;
  el.textContent=T("mission.p");
}

/* ---------- академии-члены: реестр на главной ---------- */
/* ---------- РЕЕСТР СТРАН-УЧАСТНИЦ — главный блок ВАГН ----------
   Академия и есть этот реестр: восемь стран, их академии и президенты.
   Раньше здесь был плоский список из флага и названия. Теперь —
   протокольный реестр с графами, номером записи и пометкой о наличии
   свидетельства о регистрации. Такого блока нет ни на одном другом
   сайте семейства. */
function renderAcad(){
  var box=$("#acad"); if(!box||!C.academies) return;
  var head='<div class="reg__head">'+
    '<span>№</span><span>'+T("reg.country")+'</span><span>'+T("reg.academy")+'</span>'+
    '<span>'+T("reg.head")+'</span><span>'+T("reg.doc")+'</span></div>';
  box.innerHTML='<div class="reg reg--rich">'+head+C.academies.map(function(a,i){
    var files=(a.files||[]);
    var doc=files.length
      ? '<a class="reg__doc" href="'+esc(files[0].file||files[0].href||"#")+'" target="_blank" rel="noopener" title="'+esc(T("reg.doc"))+'">PDF</a>'
      : '<span class="reg__doc reg__doc--none" aria-hidden="true">—</span>';
    /* строка — div: внутри уже есть ссылка на свидетельство, а вложенные
       <a> недопустимы. Кликабельны две независимые ссылки: страна и документ.
       Портрет президента есть у пяти академий из восьми — там, где нет,
       ставится флаг страны, а не пустой кружок. */
    /* нет портрета — ставим код страны, а не флаг: флаг уже стоит в графе
       «Страна», и второй такой же рядом читается как дубль */
    var av=a.photo
      ? '<img class="reg__av" src="'+esc(a.photo)+'" alt="" loading="lazy">'
      : '<span class="reg__av reg__av--code">'+esc(a.code)+'</span>';
    return '<div class="reg__row" style="transition-delay:'+(i*45)+'ms">'+
      '<span class="reg__n mono">'+String(i+1).padStart(2,"0")+'</span>'+
      av+
      '<span class="reg__c"><i class="reg__fl">'+flagEmoji(a.code)+'</i>'+
        '<a href="academies.html">'+esc(LL(a,"country"))+'</a></span>'+
      '<span class="reg__a">'+esc(LL(a,"name"))+'</span>'+
      '<span class="reg__p">'+esc(a.president||"—")+'</span>'+
      doc+
    '</div>';
  }).join("")+'</div>'+
  '<p class="reg__note">'+T("reg.note").replace("%d",C.academies.length)+'</p>';
}

/* ---------- generic reader modal (native <dialog>; used by academies + leadership + news) ---------- */
function ensureReaderModal(){
  var dlg=$("#rmodal");
  if(!dlg){
    dlg=document.createElement("dialog"); dlg.id="rmodal"; dlg.className="rmodal";
    dlg.innerHTML='<button class="rmodal__x" aria-label="Close">✕</button><div class="rmodal__in"></div>';
    document.body.appendChild(dlg);
    var close=function(){ if(dlg.close) dlg.close(); else dlg.removeAttribute("open"); document.body.style.overflow=""; };
    dlg.addEventListener("click",function(e){ var c=dlg.querySelector(".rmodal__in"); if(!c.contains(e.target)&&e.target!==dlg.querySelector(".rmodal__x")) close(); });
    dlg.querySelector(".rmodal__x").addEventListener("click",close);
    dlg.addEventListener("close",function(){ document.body.style.overflow=""; });
  }
  return dlg;
}
function openReaderModal(coverUrl,metaLine,title,bodyHtml,opts){
  opts=opts||{};
  var dlg=ensureReaderModal(),html;
  if(opts.portrait&&coverUrl){
    html='<div class="rmodal__portrait"><div class="rmodal__pph"><img src="'+esc(coverUrl)+'" alt=""></div>'+
      '<div class="rmodal__ptext">'+(metaLine?'<span class="tag">'+esc(metaLine)+'</span>':'')+
      '<h2 class="rmodal__title">'+esc(title)+'</h2></div></div>'+
      '<div class="rmodal__body prose">'+bodyHtml+'</div>';
  } else {
    var cover=coverUrl?'<div class="rmodal__cover"><img src="'+esc(coverUrl)+'" alt=""></div>':'';
    html=cover+'<div class="rmodal__body prose">'+(metaLine?'<time class="rmodal__date">'+esc(metaLine)+'</time>':'')+
      '<h2 class="rmodal__title">'+esc(title)+'</h2>'+bodyHtml+'</div>';
  }
  dlg.querySelector(".rmodal__in").innerHTML=html;
  dlg.querySelector(".rmodal__in").scrollTop=0;
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
  document.body.style.overflow="hidden";
}
function wireReaderCards(box,openFn){
  $$("[data-ri]",box).forEach(function(c){
    c.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("a")) return; openFn(+c.dataset.ri); });
    c.addEventListener("keydown",function(e){ if(e.target.closest&&e.target.closest("a")) return; if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openFn(+c.dataset.ri); } });
  });
}
/* приложенные документы внутри модалки — реестр слоя */
function modalFiles(list,urlKey,nameFn){
  if(!list||!list.length) return "";
  return '<div class="ledger">'+list.map(function(f){
    return '<a class="lrow" href="'+esc(f[urlKey])+'" target="_blank" rel="noopener"><span class="tag">PDF</span>'+
      '<b>'+esc(nameFn(f))+'</b><span class="meta">↓</span></a>';
  }).join("")+'</div>';
}

/* ---------- academies directory (full page) ---------- */
function renderAcademiesFull(id){
  var box=$(id); if(!box||!C.academies) return;
  var withProfile=C.academies.filter(function(a){return a.hasProfile;});
  var rest=C.academies.filter(function(a){return !a.hasProfile;});
  var cards=withProfile.length?'<div class="cards">'+withProfile.map(function(a){
    var idx=C.academies.indexOf(a);
    var av=a.photo?'<div class="acad__av"><img src="'+esc(a.photo)+'" alt="" loading="lazy"></div>'
                  :'<div class="acad__av acad__av--none"><span class="flagbig">'+flagEmoji(a.code)+'</span></div>';
    return '<article class="card card--txt pcard reveal" data-ri="'+idx+'" tabindex="0" role="button" aria-label="'+esc(LL(a,"name"))+'"><div class="card__b">'+
      '<div class="pcard__top">'+av+'<div><span class="tag">'+esc(LL(a,"country"))+'</span>'+
      '<h3 class="card__t" style="margin-top:8px">'+esc(LL(a,"name"))+'</h3></div></div>'+
      (a.president?'<p class="card__p"><b>'+esc(a.president)+'</b></p>':'')+
      '<a class="card__more" href="'+esc(academyPage(a))+'">'+more()+'</a></div></article>';
  }).join("")+'</div>':'';
  var rows=rest.length?'<div class="ledger" style="margin-top:'+(withProfile.length?'clamp(28px,4vw,48px)':'0')+'">'+rest.map(function(a){
    return '<div class="lrow"><span class="flagbig">'+flagEmoji(a.code)+'</span>'+
      '<b>'+esc(LL(a,"name"))+(a.president?' — '+esc(a.president):'')+'</b>'+
      '<span class="meta">'+esc(LL(a,"country"))+'</span></div>';
  }).join("")+'</div>':'';
  box.innerHTML=cards+rows;
  wireReaderCards(box,function(i){
    var a=C.academies[i]; if(!a) return;
    var link=a.link?'<p class="rmodal__link"><a href="'+esc(a.link)+'" target="_blank" rel="noopener">'+esc(a.link.replace(/^https?:\/\//,''))+' ↗</a></p>':'';
    /* приложенные документы академии — свидетельства о регистрации, письма */
    var files=modalFiles(a.files,"u",function(f){ return curLang()==="en"&&f.t_en?f.t_en:f.t; });
    openReaderModal(a.photo,LL(a,"country"),LL(a,"name"),
      (a.president?'<p class="brmeta"><b>'+(curLang()==="en"?"President":"Президент")+':</b> '+esc(a.president)+'</p>':'')+
      paras(LL(a,"bio")&&LL(a,"bio").length?LL(a,"bio"):[])+files+link,{portrait:true});
  });
}

/* ---------- отдельная страница академии-члена ---------- */
function renderAcademyProfile(id,code){
  var box=$(id); if(!box||!C.academies) return;
  var a=C.academies.filter(function(x){return x.code===code;})[0];
  if(!a) { box.innerHTML='<p class="empty-state">'+esc(curLang()==="en"?"Academy not found":"Академия не найдена")+'</p>'; return; }
  var name=LL(a,"name"), country=LL(a,"country"), bio=LL(a,"bio")||[];
  var portrait=a.photo
    ? '<div class="profile-card__avatar"><img src="'+esc(a.photo)+'" alt="'+esc(a.president||name)+'"></div>'
    : '<div class="profile-card__avatar profile-card__avatar--flag"><span>'+flagEmoji(a.code)+'</span></div>';
  var files=modalFiles(a.files,"u",function(f){ return curLang()==="en"&&f.t_en?f.t_en:f.t; });
  box.innerHTML='<article class="profile-card reveal">'+
    '<div class="profile-card__head">'+portrait+'<div><span class="tag">'+esc(country)+'</span><h2>'+esc(name)+'</h2>'+
    (a.president?'<p class="profile-card__role">'+esc(curLang()==="en"?"President":"Президент")+': '+esc(a.president)+'</p>':'')+'</div></div>'+
    '<div class="profile-card__body prose">'+paras(bio)+files+'</div>'+
    '<a class="btn" href="academies.html">'+(curLang()==="en"?"All member academies →":"Все академии-члены →")+'</a>'+
    '</article>';
}

/* ---------- leadership (about page): president + secretary + vice presidents ---------- */
function renderLeadershipFull(id){
  var box=$(id); if(!box||!C.leadership) return;
  var L=C.leadership,out="";
  function leadPhoto(person){
    return person&&person.photo?'<div class="person__av"><img src="'+esc(person.photo)+'" alt="'+esc(LL(person,"name"))+'" loading="lazy"></div>':'';
  }
  out+='<div class="people-grid">'+
    '<div class="person person--lead reveal"><div class="person__head">'+leadPhoto(L.president)+'<div><h3>'+esc(LL(L.president,"name"))+'</h3><p class="role">'+esc(LL(L.president,"role"))+'</p></div></div>'+
    '<a href="mailto:nbr21@mail.ru">nbr21@mail.ru</a><a href="tel:+77017942677">+7 701 794-26-77</a></div>'+
    '<div class="person person--lead reveal" style="transition-delay:.06s"><div class="person__head">'+leadPhoto(L.secretary)+'<div><h3>'+esc(LL(L.secretary,"name"))+'</h3><p class="role">'+esc(LL(L.secretary,"role"))+'</p></div></div>'+
    '<a href="mailto:aimsabir54@gmail.com">aimsabir54@gmail.com</a><a href="tel:+77772611773">+7 777 261-17-73</a></div></div>';
  if(L.vicePresidents&&L.vicePresidents.length){
    out+='<div class="cards cards--2" style="margin-top:var(--gap)">'+L.vicePresidents.map(function(vp,i){
      var av=vp.photo?'<div class="acad__av"><img src="'+esc(vp.photo)+'" alt="" loading="lazy"></div>'
                     :'<div class="acad__av acad__av--none"><span class="mono">VP</span></div>';
      return '<article class="card card--txt pcard reveal" data-ri="'+i+'" tabindex="0" role="button" aria-label="'+esc(LL(vp,"name"))+'"><div class="card__b">'+
        '<div class="pcard__top">'+av+'<div><span class="tag">'+esc(LL(vp,"country"))+'</span>'+
        '<h3 class="card__t" style="margin-top:8px">'+esc(LL(vp,"name"))+'</h3></div></div>'+
        '<p class="card__p"><b>'+esc(LL(vp,"role"))+'</b></p>'+
        '<a class="card__more" href="'+esc(leaderPage(vp))+'">'+more()+'</a></div></article>';
    }).join("")+'</div>';
  }
  box.innerHTML=out;
  wireReaderCards(box,function(i){
    var vp=L.vicePresidents[i]; if(!vp) return;
    openReaderModal(vp.photo,LL(vp,"country"),LL(vp,"name"),
      '<p class="brmeta"><b>'+esc(LL(vp,"role"))+'</b></p>'+paras(LL(vp,"bio")),{portrait:true});
  });
}

/* ---------- отдельная страница руководителя ---------- */
function renderLeaderProfile(id,slug){
  var box=$(id), list=C.leadership&&C.leadership.vicePresidents||[]; if(!box) return;
  var vp=list.filter(function(v){ return (slug==="raimzhanov"&&v.name_ru.indexOf("Раимжанов")===0)||(slug==="voytov"&&v.name_ru.indexOf("Войтов")===0); })[0];
  if(!vp){ box.innerHTML='<p class="empty-state">'+esc(curLang()==="en"?"Profile not found":"Профиль не найден")+'</p>'; return; }
  var portrait=vp.photo?'<div class="profile-card__avatar"><img src="'+esc(vp.photo)+'" alt="'+esc(LL(vp,"name"))+'"></div>':'<div class="profile-card__avatar profile-card__avatar--flag"><span>'+flagEmoji(vp.country_ru)+'</span></div>';
  box.innerHTML='<article class="profile-card reveal"><div class="profile-card__head">'+portrait+'<div><span class="tag">'+esc(LL(vp,"country"))+'</span><h2>'+esc(LL(vp,"name"))+'</h2><p class="profile-card__role">'+esc(LL(vp,"role"))+'</p></div></div>'+
    '<div class="profile-card__body prose">'+paras(LL(vp,"bio")||[])+'</div>'+
    '<a class="btn" href="about.html#leadership">'+(curLang()==="en"?"Back to leadership →":"К руководству →")+'</a></article>';
}

/* ---------- history article (about page) ---------- */
function renderHistory(id){
  var box=$(id); if(!box||!C.history) return;
  box.innerHTML=paras(LL(C.history,"paragraphs"));
}
function renderFoundersList(fid,oid){
  var fb=$(fid),ob=$(oid);
  if(fb&&C['founders_'+(curLang()==="en"?"en":"ru")]) fb.innerHTML=C['founders_'+(curLang()==="en"?"en":"ru")].map(function(x){return '<li>'+esc(x)+'</li>';}).join("");
  if(ob&&C['observers_'+(curLang()==="en"?"en":"ru")]) ob.innerHTML=C['observers_'+(curLang()==="en"?"en":"ru")].map(function(x){return '<li>'+esc(x)+'</li>';}).join("");
}

/* ---------- documents (grouped, real hrefs) ---------- */
function renderDocs(){
  var box=$("#docs");
  var docs=(C.documents||[]).concat(C.extraDocuments||window.CONTENT_EXTRA_DOCS||[]);
  if(!box||!docs.length) return;
  var cats=[]; docs.forEach(function(d){ var c=LL(d,"cat"); if(cats.indexOf(c)<0)cats.push(c); });
  box.innerHTML=cats.map(function(cat){
    var g=docs.filter(function(d){return LL(d,"cat")===cat;});
    var rows='<div class="ledger">'+
      g.map(function(d){
        var ext=(d.href||"").split("?")[0].split(".").pop().toUpperCase();
        var kind=d.external?"WEB":(ext==="DOC"||ext==="DOCX"?"DOC":ext==="MP4"?"VIDEO":ext==="ZIP"?"ZIP":"PDF");
        return '<a class="lrow reveal" href="'+esc(d.href)+'" target="_blank" rel="noopener"><span class="tag">'+kind+'</span>'+
          '<b>'+esc(LL(d,"title"))+'</b><span class="meta">'+(d.external?"↗":"↓")+'</span></a>';
      }).join("")+"</div>";
    if(g.some(function(d){return d.archive;})){
      return '<details class="docgroup docgroup--archive"><summary class="kick">'+esc(cat)+' <span class="doccount">'+g.length+'</span></summary>'+rows+'</details>';
    }
    return '<div class="docgroup"><h3 class="kick">'+esc(cat)+'</h3>'+rows+'</div>';
  }).join("");
}

/* ---------- news (сетка референса: первая карточка крупная, остальные обычные) ---------- */
function renderNews(){
  var box=$("#news"); if(!box||!C.news) return;
  box.innerHTML=C.news.map(function(n,i){
    var cover=n.img?'<div class="card__ph"><img src="'+esc(n.img)+'" alt="" loading="lazy"></div>':'';
    var ex=(LL(n,"paragraphs")&&LL(n,"paragraphs")[0])||"";
    /* обложек всего три на девять записей — карточка без фото остаётся честной текстовой */
    var cls='card reveal'+(i===0?' card--lead':'')+(n.img?'':' card--nophoto');
    return '<article class="'+cls+'" data-ri="'+i+'" tabindex="0" role="button" aria-label="'+esc(LL(n,"title"))+'" style="transition-delay:'+(i*40)+'ms">'+
      cover+'<div class="card__b"><span class="card__d">'+esc(n.date)+'</span>'+
      '<h3 class="card__t">'+esc(LL(n,"title"))+'</h3>'+
      (ex?'<p class="card__p">'+esc(ex.length>150?ex.slice(0,150)+'…':ex)+'</p>':'')+
      '<span class="card__more">'+more()+'</span></div></article>';
  }).join("");
  wireReaderCards(box,function(i){
    var n=C.news[i]; if(!n) return;
    var ps=LL(n,"paragraphs");
    var files=modalFiles(n.files,"file",function(f){ return curLang()==="en"&&f.name_en?f.name_en:f.name_ru; });
    var link=n.link?'<p style="margin-top:18px"><a class="btn" href="'+esc(n.link)+'" target="_blank" rel="noopener">'+
      (curLang()==="en"?"Open website":"Открыть сайт")+'</a></p>':'';
    openReaderModal(n.img,n.date,LL(n,"title"),(ps&&ps.length?paras(ps):'')+files+link);
  });
}

/* ---------- photo gallery ---------- */
function renderGallery(id){
  var box=$(id); if(!box||!C.galleryGroups) return;
  var flat=[]; /* сквозной индекс снимка по всем группам, чтобы лайтбокс открывал любой */
  box.innerHTML=C.galleryGroups.map(function(g){
    var loc=curLang()==="en"?g.loc_en:g.loc_ru, note=curLang()==="en"?g.note_en:g.note_ru;
    var photosHtml=g.photos.map(function(u){
      var gi=flat.length; flat.push(u);
      return '<button class="gal__i" data-gi="'+gi+'" aria-label="'+esc(loc)+'"><img src="'+esc(u)+'" alt="" loading="lazy"></button>';
    }).join("");
    return '<div class="ggroup reveal"><div class="ggroup__cap"><b>'+esc(loc)+'</b><p>'+esc(note)+'</p></div>'+
      '<div class="gal">'+photosHtml+'</div></div>';
  }).join("");
  wireLightbox(box,flat);
}

/* ---------- полный архив перенесённых медиафайлов ---------- */
function renderArchive(id){
  var box=$(id),files=window.WAMS_ARCHIVE||[]; if(!box||!files.length) return;
  var groups={};
  files.forEach(function(file){ var ext=(file.split(".").pop()||"FILE").toUpperCase(); (groups[ext]||(groups[ext]=[])).push(file); });
  var order=Object.keys(groups).sort(function(a,b){return a.localeCompare(b);});
  var lang=curLang(), total=files.length;
  var summary='<div class="archive-toolbar"><span class="kick">'+(lang==="en"?"TRANSFERRED MEDIA ARCHIVE":"ПЕРЕНЕСЁННЫЙ МЕДИААРХИВ")+'</span><b>'+total+' '+(lang==="en"?"files":"файлов")+'</b></div>';
  box.innerHTML=summary+order.map(function(ext){
    var rows=groups[ext].map(function(file){
      var name=file.split("/").pop();
      return '<a class="lrow reveal" href="'+esc(file)+'" target="_blank" rel="noopener"><span class="tag">'+esc(ext)+'</span><b>'+esc(name)+'</b><span class="meta">↓</span></a>';
    }).join("");
    return '<details class="docgroup docgroup--archive" open><summary class="kick">'+esc(ext)+' <span class="doccount">'+groups[ext].length+'</span></summary><div class="ledger">'+rows+'</div></details>';
  }).join("");
}
function wireLightbox(box,flat){
  var dlg=$("#lbmodal");
  if(!dlg){
    dlg=document.createElement("dialog"); dlg.id="lbmodal"; dlg.className="rmodal rmodal--lb";
    dlg.innerHTML='<button class="rmodal__x" aria-label="Close">✕</button><div class="rmodal__in"></div>';
    document.body.appendChild(dlg);
    var close=function(){ if(dlg.close) dlg.close(); else dlg.removeAttribute("open"); document.body.style.overflow=""; };
    dlg.addEventListener("click",function(e){ if(e.target===dlg||e.target===dlg.querySelector(".rmodal__x")) close(); });
    dlg.querySelector(".rmodal__x").addEventListener("click",close);
    dlg.addEventListener("close",function(){ document.body.style.overflow=""; });
  }
  function open(i){
    var u=flat[i]; if(!u) return;
    dlg.querySelector(".rmodal__in").innerHTML='<img src="'+esc(u)+'" alt="">';
    if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
    document.body.style.overflow="hidden";
  }
  $$(".gal__i",box).forEach(function(c){
    c.addEventListener("click",function(){ open(+c.dataset.gi); });
  });
}

/* ---------- chrome (sticky header + progress + burger) ---------- */
function wireChrome(){
  var hdr=$("#hdr"),prog=$("#prog"),burger=$("#burger"),drawer=$("#drawer"),tick=false;
  function onScroll(){ if(tick)return; tick=true; requestAnimationFrame(function(){
    var y=window.pageYOffset||0,h=document.documentElement.scrollHeight-window.innerHeight;
    if(prog) prog.style.width=(h>0?(y/h*100):0)+"%";
    if(hdr) hdr.classList.toggle("hdr--stuck",y>10);
    tick=false; }); }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  if(burger&&drawer){
    burger.addEventListener("click",function(){
      var o=drawer.classList.toggle("on"); burger.classList.toggle("on",o);
      document.body.style.overflow=o?"hidden":"";
    });
    $$("a",drawer).forEach(function(a){ a.addEventListener("click",function(){
      drawer.classList.remove("on"); burger.classList.remove("on"); document.body.style.overflow="";
    }); });
  }
}
/* ---------- hero motion (subtle scroll morph, 21st.dev-inspired) ---------- */
function wireHeroMotion(){
  var hero=$(".whero__collage"); if(!hero||RM) return;
  var tiles=$$(".whero__tile",hero),ticking=false,depth=[-16,8,-6,12];
  function update(){
    var r=hero.getBoundingClientRect(),p=((window.innerHeight-r.top)/(window.innerHeight+r.height))-.5;
    tiles.forEach(function(tile,i){ tile.style.setProperty("--hero-shift",(p*depth[i]).toFixed(2)+"px"); });
    ticking=false;
  }
  function onScroll(){ if(ticking)return; ticking=true; requestAnimationFrame(update); }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll,{passive:true});
  update();
}

/* ---------- reveal (IO + FAIL-SAFE) ---------- */
function wireReveal(){
  var items=$$(".reveal");
  function showAll(){ items.forEach(function(i){ i.classList.add("in"); }); }
  if(!("IntersectionObserver" in window)||RM){ showAll(); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); },{rootMargin:"0px 0px -8% 0px",threshold:.06});
  items.forEach(function(i){ io.observe(i); });
  setTimeout(showAll,2600);
}

/* ---------- counters ---------- */
function runCount(el){
  var t=+el.dataset.count,pre=el.dataset.pre||"",suf=el.dataset.suf||"";
  /* мелкие величины не накручиваем: пока «8» доедет от нуля, читатель
     успеет увидеть «1 страны-участницы» — это шум, а не движение */
  if(RM || t<25){ el.textContent=pre+t+suf; return; }
  var t0=null;
  function s(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1200,1),e=1-Math.pow(1-p,3); el.textContent=pre+Math.round(t*e)+suf; if(p<1) requestAnimationFrame(s); }
  requestAnimationFrame(s);
}
function wireCounters(){
  var els=$$("[data-count]"); if(!els.length) return;
  if(!("IntersectionObserver" in window)){ els.forEach(runCount); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ runCount(en.target); io.unobserve(en.target); } }); },{threshold:.4});
  els.forEach(function(e){ io.observe(e); });
  /* FAIL-SAFE: досчитать до конца принудительно (rAF замирает в фоновой вкладке) */
  setTimeout(function(){ els.forEach(function(e){ e.textContent=(e.dataset.pre||"")+e.dataset.count+(e.dataset.suf||""); }); },2600);
}

/* ---------- form ---------- */
function wireForm(){
  var f=$("#form"); if(!f) return;
  var msg=$(".form__msg",f);
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var name=$("[name=name]",f).value.trim(), email=$("[name=email]",f).value.trim();
    var ok=name.length>1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    msg.className="form__msg "+(ok?"ok":"err"); msg.textContent=T(ok?"f.ok":"f.err"); if(ok) f.reset();
  });
}

/* ---------- boot ---------- */
function renderContent(){
  renderAcad(); renderDocs(); renderNews();
  renderHistory("#history"); renderFoundersList("#founders","#observers");
  renderLeadershipFull("#leadership"); renderAcademiesFull("#acad-full");
  renderGallery("#gallery");
  renderArchive("#archive");
  renderAcademyProfile("#academy-profile",document.body.dataset.academy);
  renderLeaderProfile("#leader-profile",document.body.dataset.leader);
  renderHeroNums(); renderTicker("#ticker"); renderMission("#mission-p");
}
function boot(){
  normalizeContent();
  renderHeader(); renderFooter(); renderDirs(); renderContent(); applySettings();
  setLang(curLang()); wireLang();
  wireChrome(); wireHeroMotion(); wireReveal(); wireCounters(); wireForm();
  _booted=true;
}
function launch(){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot(); }
if(window.CMS_READY&&typeof window.CMS_READY.then==="function") window.CMS_READY.then(launch,launch); else launch();
})();
