/* Charge les réglages du gestionnaire (Supabase) et met à jour la page publique.
   Si Supabase n'est pas configuré ou injoignable, la page garde ses textes par défaut. */
(function(){
var C=window.PN_CFG||{};if(!C.url||!C.key)return;
fetch(C.url.replace(/\/$/,'')+'/rest/v1/site_settings?key=eq.site&select=value',{headers:(C.key.indexOf('sb_')===0?{apikey:C.key}:{apikey:C.key,Authorization:'Bearer '+C.key}),cache:'no-store'})
.then(function(r){return r.ok?r.json():[]}).then(function(rows){
var v=rows&&rows[0]&&rows[0].value;if(!v)return;
if(typeof CFG!=='undefined'){if(typeof v.whatsapp==='string')CFG.whatsapp=v.whatsapp.replace(/\D/g,'');if(v.email)CFG.email=String(v.email);
var fm=document.getElementById('fmail');if(fm){fm.textContent='';if(CFG.email){var a=document.createElement('a');a.href='mailto:'+CFG.email;a.textContent=CFG.email;fm.appendChild(a)}}}
var bd=document.querySelector('.board'),ok=function(u){return typeof u==='string'&&/^https:\/\//i.test(u)};
if(bd&&Array.isArray(v.panels)&&v.panels.length){var sl=[].slice.call(bd.querySelectorAll('.board-slide')),tpl=sl[0].cloneNode(true),ctl=bd.querySelector('.board-ctl');
v.panels.slice(0,7).forEach(function(p,i){var s=sl[i];if(!s){s=tpl.cloneNode(true);s.classList.remove('on');bd.insertBefore(s,ctl);sl.push(s)}if(!p)return;
[['.board-eyebrow','eyebrow'],['.board-title','title'],['.board-text','text']].forEach(function(m){var el=s.querySelector(m[0]);if(el&&p[m[1]])el.textContent=p[m[1]]});
var a=s.querySelector('.board-art');if(a&&ok(p.image)){var im=document.createElement('img');im.className='board-art board-img';im.src=p.image;im.alt=p.title||'';im.loading='lazy';a.replaceWith(im)}});
for(var q=sl.length-1;q>=Math.min(v.panels.length,7);q--)sl[q].remove();
if(window.PN_boardRefresh)window.PN_boardRefresh()}
var g=document.querySelector('#realisations .grid');
if(g&&Array.isArray(v.projects)&&v.projects.length){g.textContent='';
v.projects.forEach(function(p){var art=document.createElement('article');art.className='card overflow-hidden';
var th=ok(p.image)?document.createElement('img'):document.createElement('div');if(ok(p.image)){th.src=p.image;th.alt=p.title||'';th.loading='lazy';th.className='h-36 w-full object-cover'}else th.className='grid h-36 place-content-center bg-gradient-to-br from-brand-900 to-brand-600 text-sm font-extrabold tracking-widest text-white uppercase';if(!ok(p.image))th.textContent=p.type||'Projet';
var b=document.createElement('div');b.className='p-5';
var h=document.createElement('h3');h.className='font-semibold text-zinc-950 dark:text-white';h.textContent=p.title||'';
var t=document.createElement('p');t.className='mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400';t.textContent=p.text||'';
b.appendChild(h);b.appendChild(t);
if(p.link&&/^https?:\/\//i.test(p.link)){var l=document.createElement('a');l.href=p.link;l.target='_blank';l.rel='noopener';l.className='mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300';l.textContent='Voir le projet';b.appendChild(l)}
art.appendChild(th);art.appendChild(b);g.appendChild(art)})}
}).catch(function(){});
})();
