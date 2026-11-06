/* Charge les réglages du gestionnaire (Supabase) et met à jour la page publique.
   Si Supabase n'est pas configuré ou injoignable, la page garde ses textes par défaut. */
(function(){
var C=window.PN_CFG||{};if(!C.url||!C.key)return;
function ok(u){return typeof u==='string'&&/^https:\/\//i.test(u)}
var OSN={android:'Android',ios:'iOS',windows:'Windows',macos:'macOS'};
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function img(u,c,eager){var i=new Image();i.src=u;i.alt='';if(!eager)i.loading='lazy';if(c)i.className=c;return i}
function plats(a){return Object.keys(OSN).filter(function(k){return a.pl&&a.pl[k]&&a.pl[k].on})}
function icon(a){return ok(a.icon)?img(a.icon,'app-ico'):h('span','app-ico',(a.name||'?').charAt(0).toUpperCase())}
function chips(a){var c=h('div','chips');plats(a).forEach(function(k){c.appendChild(h('span','chip',OSN[k]))});return c}
function modal(a){
var o=h('div','am'),p=h('div','am-p'),x=h('button','am-x','×'),prev=document.activeElement;
o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');x.setAttribute('aria-label','Fermer');
function close(){document.body.style.overflow='';document.removeEventListener('keydown',kd);o.remove();if(prev&&prev.focus)prev.focus()}
function kd(e){if(e.key==='Escape')close()}
x.onclick=close;o.onclick=function(e){if(e.target===o)close()};document.addEventListener('keydown',kd);
p.appendChild(x);
var hd=h('div','am-h'),tx=h('div');tx.appendChild(h('h2','',a.name));
tx.appendChild(h('p','app-c',[a.cat,a.ver?'Version '+a.ver:''].filter(Boolean).join(' · ')));tx.appendChild(chips(a));
hd.appendChild(icon(a));hd.appendChild(tx);p.appendChild(hd);
var sh=(a.shots||[]).filter(ok);if(sh.length){var s=h('div','shots');sh.forEach(function(u){s.appendChild(img(u))});p.appendChild(s)}
if(a.desc||a.short)p.appendChild(h('p','am-d',a.desc||a.short));
var rows=plats(a);if(rows.length){var t=h('h3','',"Télécharger ou installer");t.style.cssText='font-weight:800;margin:1.4rem 0 .2rem';p.appendChild(t);
rows.forEach(function(k){var d=a.pl[k],r=h('div','am-r');r.appendChild(h('b','',OSN[k]));
if(ok(d.download)){var l=h('a','dl','Télécharger');l.href=d.download;l.target='_blank';l.rel='noopener';r.appendChild(l)}
if(ok(d.install)){var n=h('a','ins','Installer');n.href=d.install;n.target='_blank';n.rel='noopener';r.appendChild(n)}
if(!ok(d.download)&&!ok(d.install))r.appendChild(h('span','app-c','Bientôt disponible'));p.appendChild(r)})}
o.appendChild(p);document.body.appendChild(o);document.body.style.overflow='hidden';x.focus()}
fetch(C.url.replace(/\/$/,'')+'/rest/v1/site_settings?key=eq.site&select=value',{headers:(C.key.indexOf('sb_')===0?{apikey:C.key}:{apikey:C.key,Authorization:'Bearer '+C.key}),cache:'no-store'})
.then(function(r){return r.ok?r.json():[]}).then(function(rows){
var v=rows&&rows[0]&&rows[0].value;if(!v)return;
if(typeof CFG!=='undefined'){if(typeof v.whatsapp==='string')CFG.whatsapp=v.whatsapp.replace(/\D/g,'');if(v.email)CFG.email=String(v.email);
var fm=document.getElementById('fmail');if(fm){fm.textContent='';if(CFG.email){var a=document.createElement('a');a.href='mailto:'+CFG.email;a.textContent=CFG.email;fm.appendChild(a)}}}
var bd=document.querySelector('.board'),ok=function(u){return typeof u==='string'&&/^https:\/\//i.test(u)};
if(bd&&Array.isArray(v.panels)&&v.panels.length){var any=false,sl=[].slice.call(bd.querySelectorAll('.board-slide')),tpl=sl[0].cloneNode(true),ctl=bd.querySelector('.board-ctl');
v.panels.slice(0,7).forEach(function(p,i){var s=sl[i];if(!s){s=tpl.cloneNode(true);s.classList.remove('on');bd.insertBefore(s,ctl);sl.push(s)}if(!p)return;
[['.board-eyebrow','eyebrow'],['.board-title','title'],['.board-text','text']].forEach(function(m){var el=s.querySelector(m[0]);if(el&&p[m[1]])el.textContent=p[m[1]]});
if(ok(p.image)){var w=document.createElement('div');w.className='board-bg';var im=new Image();im.src=p.image;im.alt='';if(i)im.loading='lazy';w.appendChild(im);s.insertBefore(w,s.firstChild);s.classList.add('has-img');any=true}});
if(any){bd.classList.add('board-full');document.documentElement.classList.add('bfull')}
for(var q=sl.length-1;q>=Math.min(v.panels.length,7);q--)sl[q].remove();
if(window.PN_boardRefresh)window.PN_boardRefresh()}
if(window.PN_apply)window.PN_apply(v);
/* Logiciels et applications */
var box=document.getElementById('apps'),sec=document.getElementById('logiciels');
if(box&&sec&&Array.isArray(v.apps)&&v.apps.length){v.apps.forEach(function(a){if(!a||!a.name)return;
var c=h('button','app-card');c.type='button';var tp=h('div','app-top'),tx=h('div');
tx.appendChild(h('div','app-n',a.name));tx.appendChild(h('div','app-c',[a.cat,a.ver?'v'+a.ver:''].filter(Boolean).join(' · ')));
tp.appendChild(icon(a));tp.appendChild(tx);c.appendChild(tp);c.appendChild(h('p','app-s',a.short||''));c.appendChild(chips(a));c.appendChild(h('span','app-more','Voir les détails et télécharger →'));
c.onclick=function(){modal(a)};box.appendChild(c)});
if(box.children.length)sec.hidden=false}
}).catch(function(){});
})();
