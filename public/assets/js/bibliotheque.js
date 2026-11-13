(function(){
"use strict";
var C=window.PN_CFG||{},FILES="bibliotheque/polices/",CATS=["Modernes","Élégantes","Manuscrites","Calligraphiques","Graffiti","Futuristes","Serif","Sans-serif","Décoratives","Publicitaires","Africaines"];
var PER=12,S={q:"",cat:"",fmt:"",sort:"az",view:"list",size:56,page:1,text:"Palezza Network – Connectez votre monde"},DATA=[],STATS={},app=document.getElementById("bib-app");
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* --- en-tête : menu mobile et thème (la page n'utilise pas main.js) --- */
(function(){var mb=document.getElementById("menu-button"),mm=document.getElementById("mobile-menu");
if(mb&&mm)mb.addEventListener("click",function(){var o=mm.classList.toggle("hidden")===false;mb.setAttribute("aria-expanded",o)});
document.querySelectorAll("[data-theme-toggle]").forEach(function(b){b.addEventListener("click",function(){var d=document.documentElement.classList.toggle("dark");try{localStorage.setItem("theme",d?"dark":"light")}catch(e){}})});
document.querySelectorAll("[data-year]").forEach(function(e){e.textContent=new Date().getFullYear()});
var hd=document.getElementById("site-header");if(hd)addEventListener("scroll",function(){hd.classList.toggle("is-scrolled",scrollY>8)},{passive:true})})();
/* --- données --- */
function sbGet(path){return fetch(C.url+"/rest/v1/"+path,{headers:{apikey:C.key,Authorization:"Bearer "+C.key}}).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]})}
function fileUrl(f,fmt){var p=f.files&&f.files[fmt];if(!p)return"";return f.remote?C.url+"/storage/v1/object/public/bibliotheque-fonts/"+p:FILES+p}
function load(){
 var st=fetch("bibliotheque/catalogue.json").then(function(r){return r.json()}).catch(function(){return[]});
 var db=C.url&&C.key?sbGet("fonts?published=eq.true&select=*"):Promise.resolve([]);
 var ss=C.url&&C.key?sbGet("font_stats?select=slug,downloads"):Promise.resolve([]);
 return Promise.all([st,db,ss]).then(function(r){
  DATA=r[0].concat(r[1].filter(function(x){return x.redistribution}).map(function(x){x.remote=true;x.formats=x.formats||Object.keys(x.files||{});return x}));
  r[2].forEach(function(s){STATS[s.slug]=s.downloads});
 });
}
function dls(f){return STATS[f.slug]||0}
/* --- aperçu : la police est chargée seulement quand la carte devient visible --- */
var loaded={},io=("IntersectionObserver"in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);ensure(e.target.dataset.slug)}})},{rootMargin:"200px"}):null;
function ensure(slug){if(loaded[slug])return;loaded[slug]=1;var f=DATA.filter(function(x){return x.slug===slug})[0];if(!f)return;
 var fm=f.files.WOFF2?"WOFF2":f.formats[0],u=fileUrl(f,fm);if(!u)return;
 var st=document.createElement("style");st.textContent='@font-face{font-family:"pf-'+slug+'";src:url("'+u+'");font-display:swap}';document.head.appendChild(st)}
function watch(){document.querySelectorAll("[data-slug]").forEach(function(e){if(io)io.observe(e);else ensure(e.dataset.slug)})}
/* --- vues --- */
function filtered(){var q=S.q.toLowerCase();var r=DATA.filter(function(f){return(!S.cat||f.category===S.cat)&&(!S.fmt||f.formats.indexOf(S.fmt)>-1)&&(!q||(f.name+" "+f.author+" "+f.category+" "+(f.description||"")).toLowerCase().indexOf(q)>-1)});
 r.sort(function(a,b){return S.sort==="dl"?dls(b)-dls(a)||a.name.localeCompare(b.name):a.name.localeCompare(b.name)});return r}
function chips(){return'<div class="bib-chips"><button class="bib-chip'+(S.cat?"":" on")+'" data-c="">Toutes</button>'+CATS.map(function(c){return'<button class="bib-chip'+(S.cat===c?" on":"")+'" data-c="'+c+'">'+c+'</button>'}).join("")+"</div>"}
var CC={"Modernes":"#4f8cff","Élégantes":"#d6a85c","Manuscrites":"#ff8a5b","Calligraphiques":"#e879b9","Graffiti":"#b7f34a","Futuristes":"#22d3ee","Serif":"#f5c542","Sans-serif":"#8b9cff","Décoratives":"#c084fc","Publicitaires":"#ff5a5f","Africaines":"#34d399"};
function pill(c){return'<span class="bib-pill" style="--c:'+(CC[c]||"#8b9cff")+'">'+esc(c)+"</span>"}
function card(f){var dl=fileUrl(f,f.formats[0]),fam="font-family:'pf-"+esc(f.slug)+"',system-ui";
 var acts='<a class="bib-btn alt" href="#police/'+encodeURIComponent(f.slug)+'">Détails</a><a class="bib-btn" href="'+esc(dl)+'" download data-dl="'+esc(f.slug)+'">Télécharger</a>';
 if(S.view==="grid")return'<article class="bib-tile"><div class="bib-aa" data-slug="'+esc(f.slug)+'" style="'+fam+'">Aa</div><div class="bib-name">'+esc(f.name)+'</div>'+pill(f.category)+'<div class="bib-meta">'+esc(f.author)+" · "+dls(f)+' téléch.</div><div class="bib-act">'+acts+"</div></article>";
 return'<article class="bib-item"><div class="bib-head"><a class="bib-name" href="#police/'+encodeURIComponent(f.slug)+'">'+esc(f.name)+"</a>"+pill(f.category)+'<span class="bib-meta">'+esc(f.author)+" · "+f.formats.join(" / ")+" · "+dls(f)+' téléch.</span><span class="bib-act">'+acts+'</span></div><div class="bib-prev" data-slug="'+esc(f.slug)+'" style="'+fam+'">'+esc(S.text)+"</div></article>"}
function chips(){return'<div class="bib-chips"><button class="bib-chip'+(S.cat?"":" on")+'" data-c="">Toutes</button>'+CATS.map(function(c){return'<button class="bib-chip'+(S.cat===c?" on":"")+'" style="--c:'+CC[c]+'" data-c="'+c+'">'+c+"</button>"}).join("")+"</div>"}
function catalogue(){var r=filtered(),per=S.view==="grid"?PER*2:PER,pages=Math.max(1,Math.ceil(r.length/per));if(S.page>pages)S.page=pages;var sl=r.slice((S.page-1)*per,S.page*per);
 app.innerHTML='<div class="bib-bar"><input type="search" id="q" placeholder="Rechercher une police, un auteur…" value="'+esc(S.q)+'" aria-label="Rechercher"><input type="text" id="txt" placeholder="Écrivez votre texte d’aperçu" value="'+esc(S.text)+'" aria-label="Texte d’aperçu"><label class="bib-sz">Taille<input type="range" id="sz" min="20" max="120" value="'+S.size+'" aria-label="Taille de l’aperçu"></label>'+
 '<select id="fmt" aria-label="Format"><option value="">Tous formats</option>'+["TTF","OTF","WOFF","WOFF2"].map(function(x){return"<option"+(S.fmt===x?" selected":"")+">"+x+"</option>"}).join("")+'</select><select id="sort" aria-label="Tri"><option value="az">A → Z</option><option value="dl"'+(S.sort==="dl"?" selected":"")+'>Populaires</option></select>'+
 '<span class="bib-view"><button data-v="list" class="'+(S.view==="list"?"on":"")+'" aria-label="Vue liste" title="Liste">☰</button><button data-v="grid" class="'+(S.view==="grid"?"on":"")+'" aria-label="Vue grille" title="Grille">▦</button></span></div>'+chips()+'<div class="bib-count">'+r.length+" police(s)</div>"+
 (sl.length?'<div class="'+(S.view==="grid"?"bib-grid":"bib-list")+'" style="--sz:'+S.size+'px">'+sl.map(card).join("")+"</div>":'<p class="bib-empty">Aucune police dans cette sélection pour le moment.'+(S.cat==="Africaines"?" Cette catégorie sera alimentée dès que les droits de redistribution auront été vérifiés.":"")+"</p>")+
 '<div class="bib-pager">'+(pages>1?Array.apply(null,Array(pages)).map(function(_,i){return'<button class="'+(i+1===S.page?"on":"")+'" data-p="'+(i+1)+'" aria-label="Page '+(i+1)+'">'+(i+1)+"</button>"}).join(""):"")+'</div><p class="bib-note">Chaque police reste soumise à sa licence : consultez la fiche avant utilisation.</p>';
 var q=document.getElementById("q"),t;q.oninput=function(){S.q=q.value;S.page=1;clearTimeout(t);t=setTimeout(function(){catalogue();var n=document.getElementById("q");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)};
 document.getElementById("fmt").onchange=function(e){S.fmt=e.target.value;S.page=1;catalogue()};document.getElementById("sort").onchange=function(e){S.sort=e.target.value;S.page=1;catalogue()};
 document.getElementById("txt").oninput=function(e){S.text=e.target.value||" ";document.querySelectorAll(".bib-prev").forEach(function(p){p.textContent=S.text})};
 document.getElementById("sz").oninput=function(e){S.size=+e.target.value;var g=document.querySelector(".bib-list,.bib-grid");if(g)g.style.setProperty("--sz",S.size+"px")};
 document.querySelectorAll(".bib-view button").forEach(function(b){b.onclick=function(){S.view=b.dataset.v;S.page=1;catalogue()}});
 document.querySelectorAll(".bib-chip").forEach(function(b){b.onclick=function(){S.cat=b.dataset.c;S.page=1;catalogue()}});
 document.querySelectorAll(".bib-pager button").forEach(function(b){b.onclick=function(){S.page=+b.dataset.p;catalogue();scrollTo(0,0)}});watch()}
function detail(slug){var f=DATA.filter(function(x){return x.slug===slug})[0];if(!f)return catalogue();ensure(slug);
 app.innerHTML='<a class="bib-back" href="#">← Retour à la bibliothèque</a>'+pill(f.category)+'<h2 style="font-size:1.8rem;font-weight:800;margin:.4rem 0">'+esc(f.name)+'</h2>'+
 '<div class="bib-bar"><input type="text" id="t" value="'+esc(S.text)+'" aria-label="Texte d’aperçu"><input type="range" id="s" min="16" max="120" value="56" aria-label="Taille"></div>'+
 '<div class="bib-card"><div class="bib-big" id="pv" style="font-family:\'pf-'+esc(slug)+'\',system-ui;font-size:56px">'+esc(S.text)+'</div><div style="font-family:\'pf-'+esc(slug)+'\',system-ui;font-size:1.4rem;color:var(--txt)">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 !?&amp;€@</div></div>'+
 '<table class="bib-table"><tr><th>Auteur</th><td>'+esc(f.author)+'</td></tr><tr><th>Description</th><td>'+esc(f.description||"")+'</td></tr><tr><th>Source</th><td>'+esc(f.source||"Palezza Network")+'</td></tr><tr><th>Formats</th><td>'+f.formats.join(", ")+'</td></tr><tr><th>Licence</th><td>'+esc(f.license)+'</td></tr><tr><th>Redistribution</th><td>'+(f.redistribution?"Autorisée":"Non autorisée")+'</td></tr><tr><th>Usage</th><td>'+esc(f.usage||"Voir la licence")+'</td></tr><tr><th>Téléchargements</th><td id="dn">'+dls(f)+"</td></tr></table>"+
 '<div class="bib-row" style="margin-bottom:3rem">'+f.formats.map(function(x){return'<a class="bib-btn" href="'+esc(fileUrl(f,x))+'" download data-dl="'+esc(slug)+'">Télécharger '+x+"</a>"}).join("")+"</div>";
 document.getElementById("t").oninput=function(e){S.text=e.target.value||" ";document.getElementById("pv").textContent=S.text};document.getElementById("s").oninput=function(e){document.getElementById("pv").style.fontSize=e.target.value+"px"};scrollTo(0,0)}
document.addEventListener("click",function(e){var a=e.target.closest("[data-dl]");if(!a)return;var s=a.dataset.dl;STATS[s]=(STATS[s]||0)+1;var dn=document.getElementById("dn");if(dn)dn.textContent=STATS[s];
 if(C.url&&C.key)fetch(C.url+"/rest/v1/rpc/bib_increment",{method:"POST",headers:{apikey:C.key,Authorization:"Bearer "+C.key,"Content-Type":"application/json"},body:JSON.stringify({p_slug:s}),keepalive:true}).catch(function(){})});
function route(){var h=location.hash.replace(/^#\/?/,"");if(h.indexOf("police/")===0)detail(decodeURIComponent(h.slice(7)));else catalogue()}
addEventListener("hashchange",route);load().then(route);
})();
