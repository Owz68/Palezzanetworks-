/* Palezza v3 : effets (texte tracé, loader, boutons, écrans), cartes, bande de logos, sections, bouton bas de page */
(function(){
var D=window.PN_DEFAULTS||{};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function web(u){return /^https?:\/\//i.test(u||'')}
function clone(o){return JSON.parse(JSON.stringify(o))}
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,NS='http://www.w3.org/2000/svg';

/* ---------- Texte tracé : {{mots}} ou [[mots]] dans n'importe quel texte, ou attribut data-fx ---------- */
var cv=document.createElement('canvas').getContext('2d'),fxs=[];
function measure(f){var cs=getComputedStyle(f.span.parentNode||document.body);cv.font=(cs.fontStyle==='italic'?'italic ':'')+(cs.fontWeight||'700')+' 40px '+cs.fontFamily;
 var w=Math.ceil(cv.measureText(f.word).width)+8;f.svg.setAttribute('viewBox','0 0 '+w+' 52');f.svg.style.height='1.25em';f.svg.style.width=(w/52*1.25).toFixed(3)+'em';f.span.classList.add('ok')}
function fxWord(word,i){var sp=el('span','fxw'),tx=el('span','fxt',word),svg=document.createElementNS(NS,'svg'),t=document.createElementNS(NS,'text');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');t.setAttribute('x','4');t.setAttribute('y','40');t.setAttribute('font-size','40');t.style.animationDelay=(i*0.15)+'s';t.textContent=word;
 svg.appendChild(t);sp.appendChild(tx);sp.appendChild(svg);var f={span:sp,svg:svg,word:word};fxs.push(f);return sp}
function remeasure(){fxs=fxs.filter(function(f){return f.span.isConnected});fxs.forEach(measure)}
function text(e,str){str=String(str==null?'':str);e.textContent='';
 if(!/\{\{|\[\[/.test(str)){e.textContent=str;return}
 str.split(/(\{\{[^}]+\}\}|\[\[[^\]]+\]\])/).forEach(function(p){if(!p)return;
  if(/^(\{\{[^}]+\}\}|\[\[[^\]]+\]\])$/.test(p)){var words=p.slice(2,-2).trim().split(/\s+/).filter(Boolean);
   words.forEach(function(w,i){e.appendChild(fxWord(w,i));if(i<words.length-1)e.appendChild(document.createTextNode(' '))})}
  else e.appendChild(document.createTextNode(p))});
 remeasure();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure)}
window.PN_text=text;
[].forEach.call(document.querySelectorAll('[data-fx]'),function(e){text(e,'{{'+e.textContent.trim()+'}}')});

/* ---------- Loader (rectangles animés) pendant le chargement d'une image ---------- */
window.PN_loader=function(img,holder){
 if(img.complete&&img.naturalWidth){img.classList.add('is-in');return}
 var l=el('div','pn-ld');l.setAttribute('aria-hidden','true');l.innerHTML='<i></i><i></i><i></i>';holder.appendChild(l);img.classList.add('pn-wait');
 function done(){l.remove();img.classList.remove('pn-wait');img.classList.add('is-in');if(holder.classList.contains('shot'))holder.classList.add('ok')}
 img.addEventListener('load',done);img.addEventListener('error',done)};

/* ---------- Bouton « texte qui glisse » ---------- */
window.PN_slide=function(e,t){if(e.querySelector('.bs-in'))return;t=t!=null?t:e.textContent;e.textContent='';
 var w=el('span','bs-in'),a=el('span','',t),b=el('span','',t);b.setAttribute('aria-hidden','true');w.appendChild(a);w.appendChild(b);e.appendChild(w);e.classList.add('btn-slide')};
[].forEach.call(document.querySelectorAll('.btn-primary'),function(b){if(!b.children.length&&b.textContent.trim())window.PN_slide(b)});

/* ---------- Bouton de téléchargement (icône + infobulle) ---------- */
window.PN_dl=function(url,label,tip){var a=el('a','dlbtn');a.href=url;a.target='_blank';a.rel='noopener';a.dataset.tooltip=tip||'Téléchargement direct';
 var t=el('span','t',label||'Télécharger'),i=el('span','i');i.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';a.appendChild(t);a.appendChild(i);return a};

/* ---------- Écrans qui défilent : vos captures dans les cadres animés ---------- */
window.PN_stage=function(urls){urls=(urls||[]).filter(web);
 if(urls.length<2){var s=el('div','shots');urls.forEach(function(u){var w=el('div','shot'),im=new Image();im.src=u;im.alt='';w.appendChild(im);window.PN_loader(im,w);s.appendChild(w)});return s}
 var box=el('div','stage-w'),st=el('div','stage'),dots=el('div','sdots'),idx=0,cells=[0,1,2].map(function(){var c=el('i');st.appendChild(c);return c});
 st.setAttribute('role','img');st.setAttribute('aria-label','Captures d’écran');
 function paint(){cells.forEach(function(c,n){var u=urls[(idx+n)%urls.length],im=c.firstChild;if(!im){im=new Image();im.alt='';c.appendChild(im)}
  if(im.getAttribute('src')!==u){im.className='pn-wait';im.onload=function(){im.className='is-in'};im.src=u}});
  [].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===idx)})}
 urls.forEach(function(u,k){var b=el('button');b.type='button';b.setAttribute('aria-label','Capture '+(k+1));b.onclick=function(){idx=k;paint()};dots.appendChild(b)});
 cells[0].addEventListener('animationiteration',function(){idx=(idx+1)%urls.length;paint()});
 paint();box.appendChild(st);box.appendChild(dots);return box};

/* ---------- Cartes (réalisations, logiciels, applications) : une couleur par catégorie ---------- */
window.PN_card=function(o){
 var ty=slug(o.type)||'site-web',a=el(o.tag||'article','ucard');a.dataset.type=ty;
 var ts=el('div','ts'),im=el('div','ts-img');
 if(web(o.image)){var i=el('img');i.src=o.image;i.alt=o.title||'';i.loading='lazy';i.decoding='async';im.appendChild(i);window.PN_loader(i,im)}
 else im.appendChild(el('span','ts-ph',String(o.label||o.type||'P').charAt(0).toUpperCase()));
 ts.appendChild(im);ts.appendChild(el('div','nt'));
 var ic=el('div','icons');ic.appendChild(el('span','tag',o.label||o.type||''));
 if(web(o.href)){var x=el('a','ext');x.href=o.href;x.target='_blank';x.rel='noopener';x.setAttribute('aria-label','Ouvrir le projet');x.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';ic.appendChild(x)}
 ts.appendChild(ic);
 var b=el('div','bs2'),t=el('span','ttl');text(t,o.title||'');b.appendChild(t);
 if(o.text){var p=el('p','txt');text(p,o.text);b.appendChild(p)}
 var row=el('div','row');(o.stats||[]).forEach(function(s){var it=el('div','item');it.appendChild(el('span','big',s[0]));it.appendChild(el('span','reg',s[1]));row.appendChild(it)});b.appendChild(row);
 if(o.cta){var g=el(web(o.href)?'a':'span','go btn btn-primary');if(web(o.href)){g.href=o.href;g.target='_blank';g.rel='noopener'}window.PN_slide(g,o.cta);b.appendChild(g)}
 a.appendChild(ts);a.appendChild(b);return a};

function projects(list){
 var g=document.querySelector('#realisations .grid');if(!g||!Array.isArray(list)||!list.length)return;g.textContent='';
 list.forEach(function(p){var l=web(p.link);
  g.appendChild(window.PN_card({type:p.type||'Site web',label:p.type||'Projet',title:p.title,text:p.text,image:p.image,href:l?p.link:'',
   stats:[[l?'En ligne':'Sur demande','Accès'],[p.type||'Projet','Catégorie'],['Palezza','Réalisé par']],cta:l?'Voir le projet':''}))})}

/* ---------- Bande « Ils nous font confiance » ---------- */
function logos(list){
 var v=document.getElementById('trust-view');if(!v)return;v.textContent='';
 var items=(list||[]).filter(function(x){return x&&web(x.image)}),ph=!items.length;
 var base=ph?[1,2,3,4,5,6]:items.slice();while(!ph&&base.length<8)base=base.concat(items);
 function set(hide){var s=el('div','trust-set');if(hide)s.setAttribute('aria-hidden','true');
  base.forEach(function(x){var c;
   if(ph){c=el('div','trust-item ph','Votre logo ici')}
   else{var lk=x.link&&web(x.link);c=el(lk?'a':'div','trust-item');if(lk){c.href=x.link;c.target='_blank';c.rel='noopener'}
    var i=el('img');i.src=x.image;i.alt=x.name||'Logo partenaire';i.loading='lazy';i.decoding='async';c.appendChild(i)}
   s.appendChild(c)});return s}
 var t=el('div','trust-track');t.style.setProperty('--dur',(base.length*4.5)+'s');t.appendChild(set(false));t.appendChild(set(true));v.appendChild(t)}

/* ---------- Découverte / Innovation / Formation ---------- */
function sections(S){
 ['decouverte','innovation','formation'].forEach(function(k,n){
  var s=document.getElementById(k),d=S&&S[k];if(!s||!d)return;
  s.textContent='';s.className='sec py-20 sm:py-24 scroll-mt-20'+(n%2===0?' bg-zinc-50 dark:bg-white/[0.02]':'');
  var w=el('div','mx-auto max-w-7xl px-5 sm:px-6 lg:px-8'),h=el('div','max-w-2xl');
  var e1=el('p','eyebrow-s');text(e1,d.eyebrow||'');h.appendChild(e1);
  var h2=el('h2','mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white');text(h2,d.title||'');h.appendChild(h2);
  var p=el('p','mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400');text(p,d.text||'');h.appendChild(p);w.appendChild(h);
  var g=el('div','sec-grid');(d.items||[]).forEach(function(it,i){var c=el('article','sec-card');
   c.appendChild(el('div','sec-num',String(i+1)));var t=el('h3');text(t,it.title||'');c.appendChild(t);var q=el('p');text(q,it.text||'');c.appendChild(q);g.appendChild(c)});w.appendChild(g);
  if(d.cta){var a=el('a','btn btn-primary sec-cta');a.href='#contact';a.dataset.need=d.need||'Devis';window.PN_slide(a,d.cta);w.appendChild(a)}
  s.appendChild(w)})}

function apply(S){projects(S.projects);logos(S.logos);sections(S.sections)}
window.PN_apply=function(v){var S=clone(D);v=v||{};if(Array.isArray(v.projects)&&v.projects.length)S.projects=v.projects;
 if(Array.isArray(v.logos))S.logos=v.logos;
 if(v.sections)Object.keys(S.sections).forEach(function(k){if(v.sections[k])S.sections[k]=Object.assign({},S.sections[k],v.sections[k])});
 apply(S)};
apply(D);

/* le bouton « besoin » remplit le formulaire de contact (éléments créés après coup) */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-need]');if(!a)return;
 var b=document.getElementById('b');if(!b)return;var ok=[].some.call(b.options,function(o){return o.value===a.dataset.need});if(ok)b.value=a.dataset.need});

/* bouton bas de page */
(function(){var b=el('button','scroll-down');b.type='button';b.setAttribute('aria-label','Aller en bas de page');b.title='Bas de page';
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
 document.body.appendChild(b);var q=false;
 function up(){q=false;var max=document.documentElement.scrollHeight-window.innerHeight;b.classList.toggle('is-visible',max>window.innerHeight*0.6&&window.scrollY<max-window.innerHeight*0.5)}
 function sc(){if(!q){q=true;requestAnimationFrame(up)}}
 addEventListener('scroll',sc,{passive:true});addEventListener('resize',sc);addEventListener('load',up);up();
 b.onclick=function(){window.scrollTo({top:document.documentElement.scrollHeight,behavior:RM?'auto':'smooth'})}})();
})();
