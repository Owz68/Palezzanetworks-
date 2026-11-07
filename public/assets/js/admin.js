(function(){
var $=function(s){return document.querySelector(s)},C=window.PN_CFG||{},D=window.PN_DEFAULTS,S,sb,T='home',AE=null,dirty=false;
var OS=[['android','Android'],['ios','iOS'],['windows','Windows'],['macos','macOS']];
var TT={home:'Tableau de bord',panels:'Panneaux d’affichage',apps:'Logiciels et applications',works:'Réalisations',logos:'Ils nous font confiance',sections:'Découverte, innovation, formation',contact:'Contact'};
var IC={home:'M3 11l9-8 9 8v10h-6v-6H9v6H3z',panels:'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6',apps:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',works:'M3 8h18v12H3zM8 8V5h8v3',logos:'M3 6h18v12H3zM7 12h4M13 10h4M13 14h4',sections:'M4 5h16M4 12h16M4 19h10',contact:'M3 5h18v14H3zM3 6l9 7 9-7'};
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function show(w){['#setup','#login','#app'].forEach(function(x){$(x).hidden=x!==w})}
function msg(t,k){var m=$('#sm');m.className=k||'';m.textContent=t}
if(!C.url||!C.key||!window.supabase){show('#setup');return}
sb=window.supabase.createClient(C.url,C.key);
var NL={home:'Accueil',panels:'Panneaux',works:'Projets',apps:'Logiciels',sections:'Sections',logos:'Logos',contact:'Contact'},NG=[['Pilotage',['home']],['Contenu du site',['panels','works','apps','sections','logos']],['Réglages',['contact']]];
$('#nav').insertAdjacentHTML('beforeend',NG.map(function(g){return '<div class="ng"><span class="gl">'+g[0]+'</span>'+g[1].map(function(k){return '<button class="nv" data-t="'+k+'"><svg viewBox="0 0 24 24"><path d="'+IC[k]+'"/></svg><span>'+NL[k]+'</span></button>'}).join('')+'</div>'}).join(''));
/* ---- données ---- */
function norm(){S.panels=S.panels||[];if(!S.panels.length)S.panels.push({eyebrow:'',title:'',text:'',image:''});S.panels=S.panels.slice(0,20);S.apps=S.apps||[];S.projects=S.projects||[];S.logos=S.logos||[];var ds=D.sections,vs=S.sections||{};S.sections={};Object.keys(ds).forEach(function(k){S.sections[k]=Object.assign(JSON.parse(JSON.stringify(ds[k])),vs[k]||{});S.sections[k].items=S.sections[k].items||[];S.sections[k].tabs=S.sections[k].tabs||[]})}
function ap(a){a.pl=a.pl||{};OS.forEach(function(o){a.pl[o[0]]=a.pl[o[0]]||{on:false,download:'',install:''}});a.shots=a.shots||[];return a}
function setp(path,val){var a=path.split('.'),o=S;for(var i=0;i<a.length-1;i++)o=o[a[i]];o[a[a.length-1]]=val}
/* ---- images : réduites avant envoi (connexion limitée) ---- */
function shrink(f,max,png){return new Promise(function(res,rej){var u=URL.createObjectURL(f),im=new Image();im.onerror=function(){rej(new Error('image illisible'))};
im.onload=function(){var r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);var x=c.getContext('2d');if(!png){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(res,png?'image/png':'image/jpeg',.85)};im.src=u})}
function up(f,max,png){return shrink(f,max,png).then(function(b){var p='img/'+Date.now()+Math.random().toString(36).slice(2,7)+(png?'.png':'.jpg');
return sb.storage.from('site-images').upload(p,b,{contentType:png?'image/png':'image/jpeg'}).then(function(r){if(r.error)throw r.error;return sb.storage.from('site-images').getPublicUrl(p).data.publicUrl})})}
function pick(o){var f=$('#fi');f.value='';f.multiple=!!o.multi;f.onchange=function(){var fl=[].slice.call(f.files);if(!fl.length)return;msg('Envoi en cours…');
Promise.all(fl.map(function(x){return up(x,o.max,o.png)})).then(function(u){o.done(u);dirty=true;render();msg('Image ajoutée — pensez à enregistrer.','w')}).catch(function(e){msg('Échec de l’envoi : '+(e&&e.message||'exécutez le SQL Supabase'),'e')})};f.click()}
/* ---- composants ---- */
function F(p,l,v,o){var i='<input class="in" data-b="'+p+'" value="'+esc(v)+'">';if(o==='ta')i='<textarea class="in" rows="4" data-b="'+p+'">'+esc(v)+'</textarea>';return '<div class="f"><label>'+l.toUpperCase()+'</label>'+i+'</div>'}
function SW(p,l,v,h){return '<label class="sw"><input type="checkbox" data-b="'+p+'"'+(v?' checked':'')+'><i></i><span><b>'+l+'</b>'+(h?'<small>'+h+'</small>':'')+'</span></label>'}
function SEL(p,l,v,opts){return '<div class="f"><label>'+l.toUpperCase()+'</label><select class="in" data-b="'+p+'">'+opts.map(function(o){return '<option'+(o===v?' selected':'')+'>'+o+'</option>'}).join('')+'</select></div>'}
var CT=['Site web','Application','Réseau','Logiciel'];
function stat(n,l){return '<div class="st"><b>'+n+'</b><span>'+l+'</span></div>'}
function ico(a){return a.icon?'<img class="ico" src="'+esc(a.icon)+'" alt="">':'<span class="ico">'+esc((a.name||'?').charAt(0).toUpperCase())+'</span>'}
var V={
home:function(){var n=S.panels.filter(function(p){return p.image}).length;
return '<div class="g4">'+stat(n+'/'+S.panels.length,'Panneaux avec image')+stat(S.apps.length,'Logiciels et applications')+stat(S.projects.length,'Réalisations')+stat(S.whatsapp?'Oui':'Non','WhatsApp configuré')+'</div>'+
'<div class="cd"><h2>Que souhaitez-vous faire ?</h2><p class="sub">Les modifications apparaissent sur le site dès que vous cliquez sur Enregistrer.</p><div class="rw"><button class="bs" data-go="panels">Modifier les panneaux</button><button class="bs" data-go="apps">Gérer les logiciels</button><button class="bs" data-go="works">Ajouter un projet</button><button class="bs" data-go="contact">Changer le contact</button></div></div>'},
panels:function(){return '<div class="rw sp" style="margin-bottom:1rem"><p class="sub">'+S.panels.length+' panneau(x) manuel(s). Les éléments « Panneau d’affichage » activés ailleurs s’y ajoutent automatiquement. L’image occupe tout le panneau ; le texte s’affiche par-dessus. Format conseillé : paysage. Astuce : entourez des mots avec {{ }} pour l’effet de tracé animé (ex. {{connectez votre monde}}) ; cela marche aussi dans les titres et textes des sections et des projets.</p>'+(S.panels.length<20?'<button class="bt" data-ap>+ Ajouter un panneau</button>':'')+'</div><div class="g2">'+S.panels.map(function(p,i){
return '<div class="cd"><div class="rw sp"><h2>Panneau '+(i+1)+'</h2><div class="rw"><span class="chip">'+(p.image?'Image':'Sans image')+'</span>'+(S.panels.length>1?'<button class="bd" data-dpn="'+i+'">Supprimer</button>':'')+'</div></div><div class="iz" data-pk="'+i+'">'+(p.image?'<img src="'+esc(p.image)+'" alt="">':'<span>+ Ajouter une image</span>')+'<div class="ov"><b data-ov="'+i+'">'+esc(p.title||'Titre du panneau')+'</b></div></div>'+
(p.image?'<div class="rw"><button class="bs" data-pk="'+i+'">Changer l’image</button><button class="bd" data-rp="'+i+'">Retirer</button></div>':'')+
F('panels.'+i+'.eyebrow','Rubrique',p.eyebrow)+F('panels.'+i+'.title','Titre',p.title)+F('panels.'+i+'.text','Texte',p.text,'ta')+'</div>'}).join('')+'</div>'},
apps:function(){if(AE!==null)return editor();
return '<div class="rw sp" style="margin-bottom:1rem"><p class="sub">Fiches affichées dans la section « Logiciels et applications » du site.</p><button class="bt" data-na>+ Nouvelle fiche</button></div>'+(S.apps.length?'<div class="g2">'+S.apps.map(function(a,i){
return '<div class="cd"><div class="rw">'+ico(a)+'<div style="flex:1;min-width:0"><b>'+esc(a.name||'Sans nom')+'</b><div class="sub">'+esc(a.cat||'')+(a.ver?' · v'+esc(a.ver):'')+'</div></div></div><div class="rw">'+OS.filter(function(o){return a.pl&&a.pl[o[0]]&&a.pl[o[0]].on}).map(function(o){return '<span class="chip">'+o[1]+'</span>'}).join('')+'</div><div class="rw sp"><button class="bs" data-ea="'+i+'">Modifier</button><button class="bd" data-da="'+i+'">Supprimer</button></div></div>'}).join('')+'</div>':'<div class="cd"><h2>Aucune fiche pour le moment</h2><p class="sub">Cliquez sur « Nouvelle fiche » pour ajouter votre premier logiciel ou application.</p></div>')},
works:function(){var all=CT.concat(S.projects.map(function(p){return p.type}).filter(function(t){return t&&CT.indexOf(t)<0}));all=all.filter(function(t,i){return all.indexOf(t)===i});
return '<div class="rw sp hd"><p class="sub">Chaque catégorie devient un écran qui défile sur le site. Ajoutez autant de projets que nécessaire.</p></div>'+all.map(function(c){var l=S.projects.map(function(p,i){return [p,i]}).filter(function(x){return (x[0].type||'Site web')===c});
return '<section class="ct"><div class="rw sp"><h2>'+esc(c)+' <span class="chip">'+l.length+'</span></h2><button class="bt" data-np="'+esc(c)+'">+ Ajouter</button></div>'+(l.length?'<div class="g2">'+l.map(function(x){var p=x[0],i=x[1],sw=(p.type||'Site web')==='Site web',dl=p.type==='Application'||p.type==='Logiciel';
return '<div class="cd"><div class="rw sp"><h3>'+esc(p.title||'Sans titre')+'</h3><button class="bd" data-dp="'+i+'">Supprimer</button></div><div class="iz" style="aspect-ratio:16/7" data-pj="'+i+'">'+(p.image?'<img src="'+esc(p.image)+'" alt="">':'<span>+ Image</span>')+'</div>'+(p.image?'<button class="bd" data-rj="'+i+'" style="justify-self:start">Retirer l’image</button>':'')+
SEL('projects.'+i+'.type','Catégorie',p.type||'Site web',CT.concat(CT.indexOf(p.type)<0&&p.type?[p.type]:[]))+F('projects.'+i+'.title','Titre',p.title)+F('projects.'+i+'.text','Description',p.text,'ta')+
(sw?F('projects.'+i+'.link','Lien du site — bouton « Visiter » (https://…)',p.link):'')+(dl?F('projects.'+i+'.dl','Lien de téléchargement — bouton « Télécharger » (https://…)',p.dl)+F('projects.'+i+'.link','Page de présentation (facultatif)',p.link):'')+
SW('projects.'+i+'.board','Panneau d’affichage',p.board,'Fait défiler ce projet dans la bannière du site')+'</div>'}).join('')+'</div>':'<p class="sub empty">Aucun projet dans cette catégorie.</p>')+'</section>'}).join('')},
logos:function(){return '<div class="rw sp" style="margin-bottom:1rem"><p class="sub">Bande défilante « Ils nous font confiance » : les logos s’affichent automatiquement en noir et blanc (24 maximum).</p><button class="bt" data-nl>+ Ajouter un logo</button></div>'+(S.logos.length?'<div class="g2">'+S.logos.map(function(l,i){return '<div class="cd"><div class="rw sp"><h2>Logo '+(i+1)+'</h2><button class="bd" data-dl="'+i+'">Supprimer</button></div><div class="iz" style="aspect-ratio:16/7;background:#fff" data-lg="'+i+'">'+(l.image?'<img src="'+esc(l.image)+'" alt="" style="object-fit:contain;padding:.6rem;filter:grayscale(1)">':'<span>+ Choisir le logo</span>')+'</div>'+F('logos.'+i+'.name','Nom de l’entreprise',l.name)+F('logos.'+i+'.link','Site web (facultatif, https://…)',l.link)+'</div>'}).join('')+'</div>':'<div class="cd"><h2>Aucun logo pour le moment</h2><p class="sub">Ajoutez les logos de vos clients : la bande se met à jour toute seule.</p></div>')},
sections:function(){var N={decouverte:'Découverte',innovation:'Innovation',formation:'Formation'};return '<p class="sub hd">Chaque rubrique peut avoir plusieurs onglets (ex. Programme de formation). Activez « Panneau d’affichage » pour diffuser un contenu dans la bannière.</p>'+Object.keys(N).map(function(k){var d=S.sections[k],b='sections.'+k+'.';
return '<section class="ct"><div class="rw sp"><h2>'+N[k]+'</h2>'+SW(b+'board','Panneau d’affichage',d.board)+'</div><div class="cd">'+F(b+'eyebrow','Rubrique',d.eyebrow)+F(b+'title','Titre',d.title)+F(b+'text','Texte',d.text,'ta')+F(b+'cta','Texte du bouton (vide = pas de bouton)',d.cta)+
'<div class="rw sp"><h3>Onglet principal</h3><button class="bs" data-ns="'+k+'">+ Ajouter une carte</button></div>'+F(b+'tabname','Nom de l’onglet principal',d.tabname||'Présentation')+'<div class="g2">'+d.items.map(function(it,i){return '<div class="pl"><div class="rw sp"><b>Carte '+(i+1)+'</b><button class="bd" data-ds="'+k+'.'+i+'">Supprimer</button></div>'+F(b+'items.'+i+'.title','Titre',it.title)+F(b+'items.'+i+'.text','Texte',it.text,'ta')+'</div>'}).join('')+'</div></div>'+
d.tabs.map(function(t,ti){var p=b+'tabs.'+ti+'.';return '<div class="cd tab"><div class="rw sp"><h3>Onglet : '+esc(t.name||'Sans nom')+'</h3><button class="bd" data-dt="'+k+'.'+ti+'">Supprimer l’onglet</button></div>'+F(p+'name','Nom de l’onglet',t.name)+F(p+'title','Titre',t.title)+F(p+'text','Texte',t.text,'ta')+SW(p+'board','Panneau d’affichage',t.board,'Diffuse cet onglet dans la bannière')+
'<div class="rw sp"><b>Cartes</b><button class="bs" data-nti="'+k+'.'+ti+'">+ Ajouter une carte</button></div><div class="g2">'+(t.items=t.items||[]).map(function(it,i){return '<div class="pl"><div class="rw sp"><b>Carte '+(i+1)+'</b><button class="bd" data-dti="'+k+'.'+ti+'.'+i+'">Supprimer</button></div>'+F(p+'items.'+i+'.title','Titre',it.title)+F(p+'items.'+i+'.text','Texte',it.text,'ta')+'</div>'}).join('')+'</div></div>'}).join('')+
'<button class="bs add-tab" data-nt="'+k+'">+ Nouvel onglet '+N[k].toLowerCase()+'</button></section>'}).join('')},
contact:function(){return '<div class="cd" style="max-width:32rem"><h2>Coordonnées publiques</h2>'+F('whatsapp','Numéro WhatsApp (indicatif sans +, sans espaces)',S.whatsapp)+F('email','E-mail public',S.email)+'</div>'}
};
function editor(){var a=ap(S.apps[AE]),b='apps.'+AE+'.';
return '<button class="bg" data-bk style="margin:0 0 1rem -.7rem">← Retour à la liste</button><div class="g2"><div class="cd"><h2>Informations</h2><div class="rw">'+ico(a)+'<div class="rw"><button class="bs" data-ic>Choisir l’icône</button>'+(a.icon?'<button class="bd" data-ri>Retirer</button>':'')+'</div></div>'+F(b+'name','Nom',a.name)+
'<div class="f"><label>TYPE</label><select class="in" data-b="'+b+'cat"><option'+(a.cat==='Logiciel'?' selected':'')+'>Logiciel</option><option'+(a.cat!=='Logiciel'?' selected':'')+'>Application</option></select></div>'+F(b+'ver','Version',a.ver)+SW(b+'board','Panneau d’affichage',a.board,'Fait défiler cette fiche dans la bannière')+F(b+'short','Description courte (carte)',a.short)+F(b+'desc','Description complète',a.desc,'ta')+'</div>'+
'<div class="cd"><h2>Captures d’écran</h2><p class="sub">Comme sur le Play Store : elles défilent sur la fiche. Format portrait ou paysage.</p><div class="ths">'+a.shots.map(function(u,k){return '<div class="th"><img src="'+esc(u)+'" alt=""><button data-rs="'+k+'" aria-label="Retirer">×</button></div>'}).join('')+'<button class="add" data-as aria-label="Ajouter des captures">+</button></div></div></div>'+
'<div class="cd" style="margin-top:1rem"><h2>Plateformes et liens</h2><p class="sub">Cochez les plateformes disponibles. Le bouton n’apparaît que si son lien est rempli.</p><div class="g2">'+OS.map(function(o){var d=a.pl[o[0]],q=b+'pl.'+o[0]+'.';
return '<div class="pl"><label class="k"><input type="checkbox" data-b="'+q+'on"'+(d.on?' checked':'')+'>'+o[1]+'</label><div class="r2">'+F(q+'download','Lien Télécharger (fichier)',d.download)+F(q+'install','Lien Installer (boutique, PWA…)',d.install)+'</div></div>'}).join('')+'</div></div>'}
function render(){[].forEach.call(document.querySelectorAll('.nv'),function(b){b.classList.toggle('on',b.dataset.t===T)});$('#tt').textContent=TT[T];$('#v').innerHTML=V[T]()}
/* ---- événements ---- */
$('#nav').onclick=function(e){var b=e.target.closest('.nv');if(!b)return;T=b.dataset.t;AE=null;render()};
$('#v').oninput=$('#v').onchange=function(e){var el=e.target,p=el.dataset&&el.dataset.b;if(!p)return;setp(p,el.type==='checkbox'?el.checked:el.value);dirty=true;msg('Modifications non enregistrées','w');
if(/^projects\.\d+\.type$/.test(p)&&e.type==='change')render();var m=p.match(/^panels\.(\d)\.title$/);if(m){var o=document.querySelector('[data-ov="'+m[1]+'"]');if(o)o.textContent=el.value||'Titre du panneau'}};
$('#v').onclick=function(e){var el=e.target.closest('button,.iz');if(!el)return;var d=el.dataset;
if(d.go){T=d.go;render();return}
if(d.pk!==undefined){var i=+d.pk;pick({max:1920,done:function(u){S.panels[i].image=u[0]}})}
else if(d.rp!==undefined){S.panels[+d.rp].image='';dirty=true;render()}
else if('na' in d){S.apps.push(ap({name:'',cat:'Application',ver:'',short:'',desc:'',icon:''}));AE=S.apps.length-1;dirty=true;render()}
else if(d.ea!==undefined){AE=+d.ea;render()}
else if(d.da!==undefined){if(confirm('Supprimer cette fiche ?')){S.apps.splice(+d.da,1);dirty=true;render()}}
else if('bk' in d){AE=null;render()}
else if('ic' in d){var a=S.apps[AE];pick({max:256,png:true,done:function(u){a.icon=u[0]}})}
else if('ri' in d){S.apps[AE].icon='';dirty=true;render()}
else if('as' in d){var a2=S.apps[AE];pick({max:1280,multi:true,done:function(u){a2.shots=a2.shots.concat(u)}})}
else if(d.rs!==undefined){S.apps[AE].shots.splice(+d.rs,1);dirty=true;render()}
else if('nl' in d){if(S.logos.length>=24)return;S.logos.push({name:'',image:'',link:''});dirty=true;render()}
else if(d.dl!==undefined){S.logos.splice(+d.dl,1);dirty=true;render()}
else if(d.lg!==undefined){var li=+d.lg;pick({max:400,png:true,done:function(u){S.logos[li].image=u[0]}})}
else if(d.ns!==undefined){var it=S.sections[d.ns].items;if(it.length<6){it.push({title:'',text:''});dirty=true;render()}}
else if(d.ds!==undefined){var q=d.ds.split('.');S.sections[q[0]].items.splice(+q[1],1);dirty=true;render()}
else if(d.pj!==undefined){var j=+d.pj;pick({max:1200,done:function(u){S.projects[j].image=u[0]}})}
else if(d.rj!==undefined){S.projects[+d.rj].image='';dirty=true;render()}
else if('ap' in d){if(S.panels.length>=20)return;S.panels.push({eyebrow:'',title:'',text:'',image:''});dirty=true;render()}
else if(d.dpn!==undefined){if(S.panels.length>1&&confirm('Supprimer ce panneau ?')){S.panels.splice(+d.dpn,1);dirty=true;render()}}
else if('np' in d){if(S.projects.length>=40)return;S.projects.push({type:d.np||'Site web',title:'',text:'',link:'',dl:'',image:'',board:false});dirty=true;render()}
else if(d.nt!==undefined){S.sections[d.nt].tabs.push({name:'',title:'',text:'',board:false,items:[]});dirty=true;render()}
else if(d.dt!==undefined){var z=d.dt.split('.');if(confirm('Supprimer cet onglet ?')){S.sections[z[0]].tabs.splice(+z[1],1);dirty=true;render()}}
else if(d.nti!==undefined){var y=d.nti.split('.');S.sections[y[0]].tabs[+y[1]].items.push({title:'',text:''});dirty=true;render()}
else if(d.dti!==undefined){var x=d.dti.split('.');S.sections[x[0]].tabs[+x[1]].items.splice(+x[2],1);dirty=true;render()}
else if(d.dp!==undefined){S.projects.splice(+d.dp,1);dirty=true;render()}};
function save(){S.whatsapp=String(S.whatsapp||'').replace(/\D/g,'');S.panels=S.panels.filter(function(p){return p.title||p.text||p.image});if(!S.panels.length)S.panels=JSON.parse(JSON.stringify(D.panels.slice(0,1)));S.projects=S.projects.filter(function(p){return p.title||p.text});Object.keys(S.sections).forEach(function(k){S.sections[k].tabs=S.sections[k].tabs.filter(function(t){return t.name||t.title||(t.items&&t.items.length)});S.sections[k].tabs.forEach(function(t){t.items=(t.items||[]).filter(function(i){return i.title||i.text})})});S.apps=S.apps.filter(function(a){return a.name&&a.name.trim()});S.logos=S.logos.filter(function(l){return l.image});Object.keys(S.sections).forEach(function(k){S.sections[k].items=S.sections[k].items.filter(function(i){return i.title||i.text})});if(AE!==null&&AE>=S.apps.length)AE=null;
msg('Enregistrement…');sb.from('site_settings').upsert({key:'site',value:S,updated_at:new Date().toISOString()}).then(function(r){if(r.error){msg('Échec : accès refusé ou connexion impossible.','e');return}dirty=false;msg('Enregistré — le site est à jour.','o');render()})}
$('#sv').onclick=save;
window.onbeforeunload=function(){return dirty?'Modifications non enregistrées':undefined};
function open(){sb.from('site_settings').select('value').eq('key','site').maybeSingle().then(function(r){var v=r.data&&r.data.value||{};S=JSON.parse(JSON.stringify(D));Object.keys(v).forEach(function(k){if(v[k]!=null&&k!=='sections')S[k]=v[k]});S.sections=v.sections||{};norm();T='home';AE=null;msg('');render();show('#app')})}
$('#lf').onsubmit=function(e){e.preventDefault();$('#le').textContent='';sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value}).then(function(r){if(r.error){$('#le').textContent='E-mail ou mot de passe incorrect.';return}$('#pw').value='';open()})};
$('#out').onclick=function(){sb.auth.signOut().then(function(){show('#login')})};
sb.auth.getSession().then(function(r){r.data&&r.data.session?open():show('#login')});
})();
