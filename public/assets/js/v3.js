/* Palezza v3 : rendu projets (images nettes, couleurs), bande de logos, sections, bouton bas de page */
(function(){
var D=window.PN_DEFAULTS||{};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function web(u){return /^https?:\/\//i.test(u||'')}
function clone(o){return JSON.parse(JSON.stringify(o))}
function projects(list){
 var g=document.querySelector('#realisations .grid');if(!g||!Array.isArray(list)||!list.length)return;g.textContent='';
 list.forEach(function(p){
  var a=el('article','card project overflow-hidden');a.dataset.type=slug(p.type);
  var m=el('div','media');
  if(web(p.image)){var i=el('img');i.src=p.image;i.alt=p.title||'';i.loading='lazy';i.decoding='async';m.appendChild(i)}
  else m.appendChild(el('div','media-ph',p.type||'Projet'));
  var b=el('div','p-5');b.appendChild(el('span','pchip',p.type||'Projet'));
  b.appendChild(el('h3','mt-3 font-semibold text-zinc-950 dark:text-white',p.title||''));
  b.appendChild(el('p','mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400',p.text||''));
  if(web(p.link)){var l=el('a','plink mt-3 inline-block text-sm font-semibold hover:underline','Voir le projet');l.href=p.link;l.target='_blank';l.rel='noopener';b.appendChild(l)}
  a.appendChild(m);a.appendChild(b);g.appendChild(a)})}

function logos(list){
 var v=document.getElementById('trust-view');if(!v)return;v.textContent='';
 var items=(list||[]).filter(function(x){return x&&web(x.image)}),ph=!items.length;
 var base=ph?[1,2,3,4,5,6]:items;while(base.length<8&&!ph)base=base.concat(items);
 function set(hide){var s=el('div','trust-set');if(hide)s.setAttribute('aria-hidden','true');
  base.forEach(function(x){var c;
   if(ph){c=el('div','trust-item ph','Votre logo ici')}
   else{c=el(x.link&&web(x.link)?'a':'div','trust-item');if(x.link&&web(x.link)){c.href=x.link;c.target='_blank';c.rel='noopener'}
    var i=el('img');i.src=x.image;i.alt=x.name||'Logo partenaire';i.loading='lazy';c.appendChild(i)}
   s.appendChild(c)});return s}
 var t=el('div','trust-track');t.style.setProperty('--dur',(base.length*4)+'s');t.appendChild(set(false));t.appendChild(set(true));v.appendChild(t)}

function sections(S){
 ['decouverte','innovation','formation'].forEach(function(k,n){
  var s=document.getElementById(k),d=S&&S[k];if(!s||!d)return;
  s.textContent='';s.className='sec py-20 sm:py-24 scroll-mt-20'+(n%2===0?' bg-zinc-50 dark:bg-white/[0.02]':'');
  var w=el('div','mx-auto max-w-7xl px-5 sm:px-6 lg:px-8'),h=el('div','max-w-2xl');
  h.appendChild(el('p','eyebrow-s',d.eyebrow||''));
  h.appendChild(el('h2','mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white',d.title||''));
  h.appendChild(el('p','mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400',d.text||''));w.appendChild(h);
  var g=el('div','sec-grid');(d.items||[]).forEach(function(it,i){var c=el('article','sec-card');
   c.appendChild(el('div','sec-num',String(i+1)));c.appendChild(el('h3','',it.title||''));c.appendChild(el('p','',it.text||''));g.appendChild(c)});w.appendChild(g);
  if(d.cta){var a=el('a','btn btn-primary sec-cta',d.cta);a.href='#contact';a.dataset.need=d.need||'Devis';w.appendChild(a)}
  s.appendChild(w)})}

function apply(S){projects(S.projects);logos(S.logos);sections(S.sections)}


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
 b.onclick=function(){var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;window.scrollTo({top:document.documentElement.scrollHeight,behavior:rm?'auto':'smooth'})}})();

})();
