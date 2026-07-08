/* ============================================================
   Branded preloader — shown on every page load.
   Loaded as a render-blocking <script> right after <body> so it
   paints before the page content. Self-injects + self-removes.
   ============================================================ */
(function(){
"use strict";
if(!document.body) return;
var word="НАГН", html='<div class="loader-wrapper">', idx=0;
for(var i=0;i<word.length;i++){
  var ch=word.charAt(i);
  if(ch===" ") html+='<span class="loader-space"></span>';
  else { html+='<span class="loader-letter" style="--i:'+idx+'">'+ch+'</span>'; idx++; }
}
html+='<div class="loader"></div></div>';

var pre=document.createElement("div");
pre.className="preloader"; pre.id="preloader"; pre.setAttribute("aria-hidden","true");
pre.innerHTML=html;
document.body.insertBefore(pre, document.body.firstChild);

var firstEntry=!sessionStorage.getItem("nagn_entered");
if(firstEntry) sessionStorage.setItem("nagn_entered","1");
var minWait=firstEntry?1700:800;
var shown=Date.now(), done=false;
function hide(){
  if(done) return; done=true;
  var wait=Math.max(0, minWait-(Date.now()-shown));
  setTimeout(function(){
    pre.classList.add("hide");
    setTimeout(function(){ if(pre.parentNode) pre.remove(); }, 550);
  }, wait);
}
window.addEventListener("load", hide);
setTimeout(hide, 5000);
})();
