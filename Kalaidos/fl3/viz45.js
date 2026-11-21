/* =====================================================================
   FL III · séances 4 and 5 — the visual widgets of the taught sections
   (21 Nov 2026). Jan Erik: "add at least 1 widget (interactive) that
   explains visually the principle the block currently is discussing (for
   each block)".

   A card holds <div class="vz" data-vz="NAME"></div>; this file draws the
   widget into it. NOTHING here counts in the progress bar: no .q, no
   .cl-row, no [data-work], no need() — never add one (bloc.js counts them).
   Nothing is stored. Every amount is an invented example in thousands of
   CHF ("KCHF"), labelled so on the widget; none is a figure of the cases.
   Names: restruct · scission · procedure · agio4 · transfert   (séance 4)
          diag · reeval · assain · emission · conversion · postpo (séance 5)
   ===================================================================== */
(function(){
'use strict';
var CSS='\
.vz{overflow:hidden;margin:16px 0 6px;border:2px solid #BFDDE1;border-radius:14px;background:#F4FAFB;padding:14px 16px 16px;}\
.vz-h{font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:#007A87;margin-bottom:4px;}\
.vz-t{font-weight:800;font-size:16px;color:#0B4F58;margin-bottom:4px;line-height:1.3;}\
.vz-i{font-size:13.5px;color:#3E565C;margin-bottom:10px;line-height:1.45;}\
.vz-btns{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px;}\
.vz-btns button{font:inherit;font-size:13px;font-weight:800;padding:7px 12px;border-radius:20px;border:2px solid #007A87;background:#fff;color:#007A87;cursor:pointer;}\
.vz-btns button.on{background:#007A87;color:#fff;}\
.vz-grp{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#5B7379;margin:8px 0 0;}\
.vz-scene{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch;}\
.vz-pan{background:#fff;border:1px solid #D5E3E6;border-radius:10px;padding:10px;}\
.vz-pan>b{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5B7379;margin-bottom:8px;}\
.vz-arrow{align-self:center;font-size:26px;color:#007A87;font-weight:800;}\
.vz-cos{display:flex;flex-wrap:wrap;gap:8px;}\
.vz-co{flex:1 1 130px;border:2px solid #0B4F58;border-radius:8px;padding:7px 8px;background:#fff;min-width:120px;}\
.vz-co.new{border-color:#C98A00;background:#FFF8E1;}\
.vz-co.gone{border-style:dashed;border-color:#B9C4C7;background:#F3F5F5;color:#8A9A9E;}\
.vz-co .nm{font-weight:800;font-size:13.5px;color:#0B4F58;}\
.vz-co.gone .nm{color:#8A9A9E;text-decoration:line-through;}\
.vz-co .st{font-size:11px;color:#8A5A00;font-weight:800;}\
.vz-co.gone .st{color:#9B2335;}\
.vz-as{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;}\
.vz-as span{font-size:12px;font-weight:800;padding:3px 7px;border-radius:5px;background:#DDEFF1;color:#0B4F58;}\
.vz-as span.mv{background:#FFD76A;color:#3A2A00;}\
.vz-sh{font-size:12px;color:#3E565C;border-top:1px dashed #C5D9DC;padding-top:5px;line-height:1.5;}\
.vz-sh i{font-style:normal;font-weight:800;color:#10262B;}\
.vz-sh .mv{background:#FFD76A;padding:0 4px;border-radius:3px;}\
.vz-say{margin-top:10px;background:#fff;border-left:5px solid #007A87;padding:8px 12px;font-size:14px;line-height:1.5;color:#10262B;border-radius:0 8px 8px 0;}\
.vz-say.warn{border-left-color:#C8372D;background:#FDF0EE;}\
.vz-say.ok{border-left-color:#1E8E5A;background:#EEF8F2;}\
.vz-sl{display:grid;grid-template-columns:minmax(150px,230px) 1fr 74px;gap:10px;align-items:center;margin:5px 0;font-size:13.5px;}\
.vz-sl input[type=range]{width:100%;accent-color:#007A87;}\
.vz-sl output{font-weight:800;text-align:right;font-variant-numeric:tabular-nums;color:#0B4F58;}\
.vz-bars{margin-top:10px;}\
.vz-bar{display:grid;grid-template-columns:minmax(96px,150px) 1fr;gap:10px;align-items:center;margin:6px 0;font-size:12.5px;font-weight:800;color:#3E565C;}\
.vz-track{position:relative;height:34px;background:#E6EEF0;border-radius:6px;display:flex;overflow:visible;}\
.vz-seg{height:100%;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;transition:width .25s;min-width:0;}\
.vz-seg:first-child{border-radius:6px 0 0 6px;} .vz-seg:last-child{border-radius:0 6px 6px 0;}\
.vz-mark{position:absolute;top:-5px;bottom:-5px;width:0;border-left:3px dashed #10262B;transition:left .25s;}\
.vz-mark span{position:absolute;top:-17px;left:-4px;font-size:10.5px;font-weight:800;color:#10262B;white-space:nowrap;background:#F4FAFB;padding:0 3px;}\
.vz-leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#3E565C;margin-top:8px;}\
.vz-leg span::before{content:"";display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var(--c);}\
.vz-steps{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0 8px;}\
.vz-steps button{flex:1 1 120px;font:inherit;font-size:12.5px;font-weight:800;text-align:left;padding:8px 9px;border-radius:8px;border:2px solid #BFDDE1;background:#fff;color:#0B4F58;cursor:pointer;line-height:1.25;}\
.vz-steps button b{display:block;font-size:11px;color:#007A87;letter-spacing:1px;}\
.vz-steps button.on{background:#0B4F58;border-color:#0B4F58;color:#fff;} .vz-steps button.on b{color:#FFD76A;}\
.vz-steps button.cr{border-color:#C98A00;background:#FFF8E1;} .vz-steps button.cr.on{background:#8A5A00;border-color:#8A5A00;}\
.vz-t2{display:grid;grid-template-columns:1fr 1fr;border:2px solid #0B4F58;border-radius:8px;background:#fff;margin-top:10px;font-size:13px;}\
.vz-t2>div{padding:8px 10px;min-height:92px;} .vz-t2>div+div{border-left:2px solid #0B4F58;}\
.vz-t2 h5{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5B7379;margin:0 0 5px;}\
.vz-t2 p{margin:2px 0;display:flex;justify-content:space-between;gap:8px;font-size:13px;} .vz-t2 p b{font-variant-numeric:tabular-nums;}\
.vz-t2 p.tot{border-top:2px solid #0B4F58;margin-top:5px;padding-top:4px;font-weight:800;}\
.vz-chk{display:grid;gap:5px;margin:8px 0;}\
.vz-chk label{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.4;background:#fff;border:1px solid #D5E3E6;border-radius:8px;padding:7px 10px;cursor:pointer;}\
.vz-chk input{margin-top:3px;accent-color:#007A87;width:17px;height:17px;flex:none;}\
.vz-note{font-size:11.5px;color:#6B8086;margin-top:8px;}\
@media(max-width:640px){.vz-scene{grid-template-columns:1fr;}.vz-arrow{transform:rotate(90deg);justify-self:center;}.vz-sl{grid-template-columns:1fr 64px;}.vz-sl span{grid-column:1/-1;}.vz-bar{grid-template-columns:1fr;gap:2px;}.vz-t2{grid-template-columns:1fr;}.vz-t2>div+div{border-left:none;border-top:2px solid #0B4F58;}}\
';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function f(n){var neg=n<0,s=String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g,"'");return (neg?'−':'')+s;}
function head(box,title,instr){box.appendChild(h('div','vz-h','Pour voir le principe · rien n’est enregistré'));box.appendChild(h('div','vz-t',title));box.appendChild(h('div','vz-i',instr));}
function btns(box,label,opts,cur,cb){
  if(label)box.appendChild(h('div','vz-grp',label));
  var w=h('div','vz-btns');box.appendChild(w);
  opts.forEach(function(o){var b=h('button',o[0]===cur?'on':'',o[1]);b.type='button';b.onclick=function(){[].forEach.call(w.children,function(x){x.classList.remove('on');});b.classList.add('on');cb(o[0]);};w.appendChild(b);});
}
function slider(box,label,min,max,step,val,cb){
  var r=h('label','vz-sl');var s=h('span','',label);var i=document.createElement('input');i.type='range';i.min=min;i.max=max;i.step=step;i.value=val;
  var o=h('output','',f(val));r.appendChild(s);r.appendChild(i);r.appendChild(o);box.appendChild(r);
  i.addEventListener('input',function(){o.textContent=f(+i.value);cb(+i.value);});
  return {set:function(fmt){o.textContent=fmt;}};
}
/* one horizontal bar: segs=[{v,c,t}], scale = value of the full width, marks=[{v,t}] */
function bar(label,segs,scale,marks){
  var row=h('div','vz-bar');row.appendChild(h('div','',label));var tr=h('div','vz-track');row.appendChild(tr);
  segs.forEach(function(s){if(s.v<=0)return;var d=h('div','vz-seg',s.t!=null?s.t:f(s.v));d.style.width=(s.v/scale*100)+'%';d.style.background=s.c;if(s.dark)d.style.color='#10262B';if(s.hatch)d.style.backgroundImage='repeating-linear-gradient(45deg,rgba(255,255,255,.45) 0 6px,transparent 6px 12px)';d.title=(s.n||'')+' '+f(s.v);tr.appendChild(d);});
  (marks||[]).forEach(function(m){var k=h('div','vz-mark','<span>'+m.t+'</span>');k.style.left=Math.min(100,m.v/scale*100)+'%';tr.appendChild(k);});
  return row;
}
function legend(items){var l=h('div','vz-leg');items.forEach(function(i){var s=h('span','',i[1]);s.style.setProperty('--c',i[0]);l.appendChild(s);});return l;}
var C={a:'#2E8FA0',d:'#6B7F8C',fp:'#1E8E5A',red:'#C8372D',cap:'#0B4F58',agio:'#C98A00',cash:'#3F7FBF',post:'#8A6FB0',rev:'#D98E2B'};

/* ---------- companies before / after ---------- */
function co(c){
  var e=h('div','vz-co'+(c.gone?' gone':'')+(c.isNew?' new':''));
  e.appendChild(h('div','nm',c.n));
  if(c.s)e.appendChild(h('div','st',c.s));
  if(c.a&&c.a.length){var a=h('div','vz-as');c.a.forEach(function(x){var mv=x.charAt(0)==='*';a.appendChild(h('span',mv?'mv':'',mv?x.slice(1):x));});e.appendChild(a);}
  if(c.h)e.appendChild(h('div','vz-sh','<span>Actionnaires : </span>'+c.h));
  return e;
}
function scene(host,before,after,say,cls){
  host.innerHTML='';
  var sc=h('div','vz-scene');
  [['Avant',before],['Après',after]].forEach(function(p,k){
    if(k)sc.appendChild(h('div','vz-arrow','→'));
    var pan=h('div','vz-pan','<b>'+p[0]+'</b>');var cs=h('div','vz-cos');p[1].forEach(function(c){cs.appendChild(co(c));});pan.appendChild(cs);sc.appendChild(pan);
  });
  host.appendChild(sc);host.appendChild(h('div','vz-say'+(cls?' '+cls:''),say));
  host.appendChild(h('div','vz-note','En jaune : ce qui a changé de place ou de propriétaire.'));
}
var AB='<i>Anne 60 %</i> · <i>Bruno 40 %</i>';

var W={};

/* 4.1 · the six operations */
W.restruct=function(box){
  head(box,'Six opérations, vues avant et après','Cliquez sur une opération. Le dessin montre les sociétés avant et après, ce que chacune possède, et qui en est actionnaire.');
  var host=h('div');
  var OPS={
    abs:{b:[{n:'Alpha SA',a:['Usine'],h:'<i>Anne 100 %</i>'},{n:'Bêta SA',a:['Atelier'],h:'<i>Bruno 100 %</i>'}],
         a:[{n:'Alpha SA',a:['Usine','*Atelier'],h:'<i>Anne 60 %</i> · <i class="mv">Bruno 40 %</i>'},{n:'Bêta SA',gone:1,s:'dissoute sans liquidation, radiée'}],
         t:'<b>Fusion par absorption (art. 3 al. 1 let. a LFus).</b> Alpha SA reprend tout le patrimoine de Bêta SA. Bêta SA disparaît. Bruno, son actionnaire, reçoit des actions d’Alpha SA.'},
    comb:{b:[{n:'Alpha SA',a:['Usine'],h:'<i>Anne 100 %</i>'},{n:'Bêta SA',a:['Atelier'],h:'<i>Bruno 100 %</i>'}],
         a:[{n:'Gamma SA',isNew:1,s:'société nouvelle',a:['*Usine','*Atelier'],h:'<i class="mv">Anne 60 %</i> · <i class="mv">Bruno 40 %</i>'},{n:'Alpha SA',gone:1,s:'dissoute, radiée'},{n:'Bêta SA',gone:1,s:'dissoute, radiée'}],
         t:'<b>Fusion par combinaison (art. 3 al. 1 let. b LFus).</b> Les deux sociétés fondent Gamma SA, qui reprend leurs deux patrimoines. Les deux anciennes sociétés disparaissent.'},
    div:{b:[{n:'Alpha SA',a:['Usine','Boutiques'],h:AB}],
         a:[{n:'Alpha SA',gone:1,s:'radiée sans liquidation'},{n:'Usine SA',isNew:1,s:'société reprenante',a:['*Usine'],h:AB},{n:'Boutiques SA',isNew:1,s:'société reprenante',a:['*Boutiques'],h:AB}],
         t:'<b>Scission par division (art. 29 let. a LFus).</b> Alpha SA répartit tout son patrimoine entre deux sociétés et disparaît. Ses actionnaires reçoivent les actions des deux sociétés reprenantes.'},
    sep:{b:[{n:'Alpha SA',a:['Usine','Boutiques'],h:AB}],
         a:[{n:'Alpha SA',s:'continue d’exister, plus petite',a:['Usine'],h:AB},{n:'Boutiques SA',isNew:1,s:'société reprenante',a:['*Boutiques'],h:'<i class="mv">Anne 60 %</i> · <i class="mv">Bruno 40 %</i>'}],
         t:'<b>Scission par séparation (art. 29 let. b LFus).</b> Alpha SA transmet une partie de son patrimoine, les boutiques, et continue d’exister. Ses actionnaires reçoivent les actions de Boutiques SA.'},
    tp:{b:[{n:'Alpha SA',a:['Usine','Boutiques'],h:AB},{n:'Zêta SA',a:['Magasins','Banque'],h:'<i>Zoé 100 %</i>'}],
         a:[{n:'Alpha SA',a:['Usine','*Banque : le prix reçu'],h:AB},{n:'Zêta SA',a:['Magasins','*Boutiques'],h:'<i>Zoé 100 %</i>'}],
         t:'<b>Transfert de patrimoine (art. 69 ss LFus).</b> Alpha SA transmet les boutiques à Zêta SA en un seul acte. <b>Alpha SA elle-même</b> reçoit la contrepartie, ici de l’argent. Anne et Bruno ne reçoivent rien : ils restent actionnaires d’Alpha SA seulement.'},
    tf:{b:[{n:'Alpha Sàrl',s:'société à responsabilité limitée',a:['Usine'],h:AB}],
         a:[{n:'Alpha SA',s:'*même société, autre forme juridique'.slice(1),a:['Usine'],h:AB}],
         t:'<b>Transformation (art. 53 ss LFus).</b> La société reste la même : même patrimoine, mêmes associés, mêmes contrats. Seule sa forme juridique change. Les parts sociales deviennent des actions.'}
  };
  btns(box,null,[['abs','Fusion par absorption'],['comb','Fusion par combinaison'],['div','Scission : division'],['sep','Scission : séparation'],['tp','Transfert de patrimoine'],['tf','Transformation']],'sep',function(k){scene(host,OPS[k].b,OPS[k].a,OPS[k].t);});
  box.appendChild(host);scene(host,OPS.sep.b,OPS.sep.a,OPS.sep.t);
};

/* 4.1 · division / séparation × symétrique / asymétrique */
W.scission=function(box){
  head(box,'Les quatre combinaisons d’une scission','Choisissez la forme de la scission, puis la répartition des actions. Regardez qui possède quelle société après la scission.');
  var S={f:'sep',r:'sym'},host=h('div');
  function draw(){
    var sym=S.r==='sym', hx=sym?AB:'<i class="mv">Anne 100 %</i>', hy=sym?AB:'<i class="mv">Bruno 100 %</i>';
    var after=S.f==='div'
      ?[{n:'Alpha SA',gone:1,s:'radiée sans liquidation'},{n:'Usine SA',isNew:1,s:'société reprenante',a:['*Usine'],h:hx},{n:'Boutiques SA',isNew:1,s:'société reprenante',a:['*Boutiques'],h:hy}]
      :[{n:'Alpha SA',s:'continue d’exister',a:['Usine'],h:hx},{n:'Boutiques SA',isNew:1,s:'société reprenante',a:['*Boutiques'],h:hy}];
    var t=(S.f==='div'?'<b>Division :</b> Alpha SA répartit tout son patrimoine et disparaît. ':'<b>Séparation :</b> Alpha SA transmet les boutiques et continue d’exister avec l’usine. ')+
      (sym?'<b>Symétrique :</b> Anne et Bruno gardent 60 % et 40 % dans chaque société. La décision demande la majorité qualifiée ordinaire (art. 43 al. 2 LFus).'
          :'<b>Asymétrique :</b> Anne prend la société de l’usine, Bruno celle des boutiques. Il faut l’accord d’au moins 90 % des voix (art. 43 al. 3 LFus). Si l’usine et les boutiques n’ont pas la même valeur, la répartition doit être rééquilibrée : c’est la partie B du cas 2.');
    scene(host,[{n:'Alpha SA',a:['Usine','Boutiques'],h:AB}],after,t);
  }
  btns(box,'1. La société qui se scinde continue-t-elle d’exister ?',[['sep','Séparation : oui'],['div','Division : non']],'sep',function(k){S.f=k;draw();});
  btns(box,'2. Comment les actions sont-elles réparties ?',[['sym','Symétrique'],['asy','Asymétrique']],'sym',function(k){S.r=k;draw();});
  box.appendChild(host);draw();
};

/* 4.1 · the procedure as a clickable line */
W.procedure=function(box){
  head(box,'La procédure, étape par étape','Cliquez sur chaque étape pour lire qui agit et quel document est produit. Passez ensuite de « Scission » à « Fusion » : une seule étape change de place.');
  var op='sc',cur=0,line=h('div','vz-steps'),say=h('div','vz-say');
  var ST={
    c:['Contrat ou projet','<b>Qui agit :</b> les organes de direction des sociétés. <b>Document :</b> le contrat de scission si la société reprenante existe déjà, le projet de scission si elle est fondée pour l’opération (art. 36–37 LFus). Il contient l’inventaire et le rapport d’échange.'],
    r:['Rapport et vérification','<b>Qui agit :</b> les organes de direction écrivent le rapport ; un expert-réviseur agréé le vérifie (art. 39–40 LFus). Une petite ou moyenne entreprise peut y renoncer si tous les associés sont d’accord.'],
    k:['Consultation','<b>Qui agit :</b> les associés. Ils peuvent consulter le contrat, le rapport et les comptes pendant deux mois avant la décision (art. 41 LFus).'],
    cr:['Appel aux créanciers','<b>Qui agit :</b> la société publie un appel dans la Feuille officielle suisse du commerce (FOSC). Les créanciers peuvent exiger des sûretés, c’est-à-dire des garanties de paiement.'],
    d:['Décision','<b>Qui agit :</b> l’assemblée générale de chaque société, à la majorité qualifiée, devant notaire (acte authentique, art. 43–44 LFus).'],
    i:['Inscription','<b>Qui agit :</b> le registre du commerce. La restructuration existe à partir du jour de l’inscription (art. 51 LFus). Dans une division, la société transférante est radiée.']
  };
  function order(){return op==='sc'?['c','r','k','cr','d','i']:['c','r','k','d','i','cr'];}
  function draw(){
    line.innerHTML='';var o=order();
    o.forEach(function(k,n){var b=h('button',(k==='cr'?'cr ':'')+(n===cur?'on':''),'<b>Étape '+(n+1)+'</b>'+ST[k][0]);b.type='button';b.onclick=function(){cur=n;draw();};line.appendChild(b);});
    var k=o[cur];
    say.innerHTML=ST[k][1]+(k==='cr'?(op==='sc'?' <b>Dans une scission, cet appel vient avant la décision</b> (art. 45–46 LFus) : le patrimoine qui garantit les dettes va être partagé.':' <b>Dans une fusion, cet appel vient après l’inscription</b> (art. 25 LFus) : le patrimoine qui garantit les dettes reste entier.'):'');
  }
  btns(box,null,[['sc','Scission'],['fu','Fusion']],'sc',function(k){op=k;cur=order().indexOf('cr');draw();});
  box.appendChild(line);box.appendChild(say);draw();
};

/* 4.1 · the agio of a scission */
W.agio4=function(box){
  head(box,'L’agio de scission dans le bilan de la société reprenante','Déplacez les trois curseurs. La barre du bas montre comment l’actif net repris se partage entre le capital-actions et la réserve légale issue du capital. Montants inventés, en milliers de CHF.');
  var v={a:900,d:400,n:300},out=h('div');
  function draw(){
    out.innerHTML='';var net=v.a-v.d,sc=1400,bars=h('div','vz-bars');
    bars.appendChild(bar('Actifs repris',[{v:v.a,c:C.a}],sc));
    if(net>=0)bars.appendChild(bar('Financés par',[{v:v.d,c:C.d,t:'dettes '+f(v.d)},{v:Math.min(v.n,net),c:C.cap,t:'capital '+f(Math.min(v.n,net))},{v:Math.max(0,net-v.n),c:C.agio,t:'agio '+f(Math.max(0,net-v.n))}],sc));
    else bars.appendChild(bar('Dettes reprises',[{v:v.d,c:C.red}],sc));
    out.appendChild(bars);out.appendChild(legend([[C.a,'actifs repris'],[C.d,'dettes reprises'],[C.cap,'capital-actions (valeur nominale)'],[C.agio,'agio → réserve légale issue du capital']]));
    var s,c='';
    if(net<=0){s='Les dettes reprises ('+f(v.d)+') atteignent ou dépassent les actifs repris ('+f(v.a)+'). La société reprenante ne reçoit aucun actif net : elle ne peut pas émettre d’actions en échange.';c='warn';}
    else if(v.n>net){s='La valeur nominale des actions ('+f(v.n)+') dépasse l’actif net repris ('+f(net)+'). Les actions seraient émises au-dessous de leur valeur nominale, ce que le Code des obligations interdit (art. 624 CO).';c='warn';}
    else s='Actif net repris = '+f(v.a)+' − '+f(v.d)+' = <b>'+f(net)+'</b>. Actions émises pour une valeur nominale de <b>'+f(v.n)+'</b>. Agio de scission = '+f(net)+' − '+f(v.n)+' = <b>'+f(net-v.n)+'</b>, porté à la réserve légale issue du capital (art. 671 CO).';
    out.appendChild(h('div','vz-say '+c,s));
  }
  slider(box,'Actifs repris',300,1400,10,v.a,function(x){v.a=x;draw();});
  slider(box,'Dettes reprises',0,1000,10,v.d,function(x){v.d=x;draw();});
  slider(box,'Valeur nominale des actions émises',50,800,10,v.n,function(x){v.n=x;draw();});
  box.appendChild(out);draw();
};

/* 4.2 · the transfer of assets and liabilities */
W.transfert=function(box){
  head(box,'Un transfert de patrimoine est une vente en bloc','Déplacez les trois curseurs. Le widget contrôle l’excédent d’actifs exigé par la loi, puis calcule le gain ou la perte de la société qui transfère. Montants inventés, en milliers de CHF.');
  var v={a:700,d:250,p:520},out=h('div');
  function draw(){
    out.innerHTML='';var net=v.a-v.d,sc=1200,bars=h('div','vz-bars');
    bars.appendChild(bar('Ce qui sort',[{v:v.d,c:C.d,t:'dettes cédées '+f(v.d)},{v:Math.max(0,net),c:C.a,t:'actif net cédé '+f(net)}],sc));
    bars.appendChild(bar('Ce qui entre',[{v:v.p,c:C.cash,t:'contrepartie '+f(v.p)}],sc,net>0?[{v:net,t:'actif net cédé '+f(net)}]:[]));
    out.appendChild(bars);
    if(net<=0){out.appendChild(h('div','vz-say warn','<b>Transfert refusé.</b> Les dettes cédées ('+f(v.d)+') ne sont pas inférieures aux actifs cédés ('+f(v.a)+'). L’inventaire doit montrer un excédent d’actifs (art. 71 al. 2 LFus) : une société ne peut pas transférer des dettes seules.'));return;}
    var r=v.p-net;
    out.appendChild(h('div','vz-say ok','<b>Excédent d’actifs :</b> '+f(v.a)+' − '+f(v.d)+' = '+f(net)+'. Il est positif : le transfert est admis.'));
    out.appendChild(h('div','vz-say'+(r<0?' warn':''),'<b>Résultat pour la société qui transfère :</b> contrepartie '+f(v.p)+' − actif net cédé '+f(net)+' = <b>'+(r===0?'0, ni gain ni perte':(r>0?'gain de '+f(r):'perte de '+f(-r)))+'</b>.'+(r>0?' Pour l’acheteur, ces '+f(r)+' payés en plus de l’actif net sont un goodwill.':'')+' La contrepartie entre dans la société ; ses actionnaires ne reçoivent rien.'));
    var t=h('div','vz-t2');
    t.innerHTML='<div><h5>Débit du compte « Transfert de patrimoine »</h5><p><span>Actifs sortis</span><b>'+f(v.a)+'</b></p>'+(r>0?'<p><span>Gain sur transfert</span><b>'+f(r)+'</b></p>':'')+'<p class="tot"><span>Total</span><b>'+f(v.a+Math.max(0,r))+'</b></p></div>'+
      '<div><h5>Crédit</h5><p><span>Contrepartie reçue</span><b>'+f(v.p)+'</b></p><p><span>Dettes sorties</span><b>'+f(v.d)+'</b></p>'+(r<0?'<p><span>Perte sur transfert</span><b>'+f(-r)+'</b></p>':'')+'<p class="tot"><span>Total</span><b>'+f(v.p+v.d+Math.max(0,-r))+'</b></p></div>';
    out.appendChild(t);out.appendChild(h('div','vz-note','Le compte « Transfert de patrimoine » est un compte de passage : ses deux côtés sont égaux à la fin.'));
  }
  slider(box,'Actifs cédés, à la valeur comptable',200,1200,10,v.a,function(x){v.a=x;draw();});
  slider(box,'Dettes cédées',0,900,10,v.d,function(x){v.d=x;draw();});
  slider(box,'Contrepartie reçue',100,1000,10,v.p,function(x){v.p=x;draw();});
  box.appendChild(out);draw();
};

/* 5.1 · healthy, capital loss, over-indebted */
W.diag=function(box){
  head(box,'Du bilan sain au surendettement','Le capital-actions est de 400, la réserve légale issue du capital de 60 et la réserve légale issue du bénéfice de 40 : le seuil de l’art. 725a est donc ½ × 500 = 250. Déplacez les deux curseurs et lisez le diagnostic. Montants inventés, en milliers de CHF.');
  var v={a:1000,d:700},out=h('div'),SEUIL=250;
  function draw(){
    out.innerHTML='';var fp=v.a-v.d,sc=1500,bars=h('div','vz-bars');
    bars.appendChild(bar('Actifs',[{v:v.a,c:C.a}],sc));
    bars.appendChild(bar('Dettes',[{v:Math.min(v.d,v.a),c:C.d,t:'dettes '+f(Math.min(v.d,v.a))},{v:Math.max(0,v.d-v.a),c:C.red,t:'non couvert '+f(v.d-v.a)}],sc));
    bars.appendChild(bar('Fonds propres',[{v:Math.max(0,fp),c:fp<SEUIL?C.rev:C.fp}],sc,[{v:SEUIL,t:'seuil 250'}]));
    out.appendChild(bars);
    var s,c;
    if(fp<0){s='<b>Surendettement (art. 725b CO).</b> Les dettes dépassent les actifs de '+f(-fp)+' : les fonds propres sont négatifs. Le conseil d’administration fait établir des bilans intermédiaires et doit aviser le tribunal, sauf postposition suffisante ou chance concrète d’assainissement dans les 90 jours.';c='warn';}
    else if(fp<SEUIL){s='<b>Perte de capital (art. 725a CO).</b> Fonds propres = '+f(v.a)+' − '+f(v.d)+' = '+f(fp)+', inférieurs au seuil de 250. Le conseil d’administration doit prendre des mesures d’assainissement.';c='warn';}
    else{s='<b>Aucun signal au bilan.</b> Fonds propres = '+f(v.a)+' − '+f(v.d)+' = '+f(fp)+', au moins égaux au seuil de 250.';c='ok';}
    out.appendChild(h('div','vz-say '+c,s));
    out.appendChild(h('div','vz-note','L’insolvabilité menaçante (art. 725 CO) ne se lit pas sur ce dessin : elle se juge sur le plan de trésorerie, pas sur le bilan.'));
  }
  slider(box,'Actifs',500,1400,10,v.a,function(x){v.a=x;draw();});
  slider(box,'Dettes',300,1400,10,v.d,function(x){v.d=x;draw();});
  box.appendChild(out);draw();
};

/* 5.1 · revaluation under art. 725c */
W.reeval=function(box){
  head(box,'La réévaluation augmente les fonds propres, et aussi le seuil','Une société a 120 de fonds propres pour un seuil de 250 : il y a perte de capital. Son immeuble est au bilan pour 300 et sa valeur réelle est de 600. Déplacez le curseur pour le réévaluer. Montants inventés, en milliers de CHF.');
  var r=0,out=h('div');
  function draw(){
    out.innerHTML='';var fp=120+r,seuil=250+r/2,sc=560,bars=h('div','vz-bars');
    bars.appendChild(bar('Fonds propres',[{v:120,c:C.fp,t:'avant 120'},{v:r,c:C.rev,t:'réserve de réévaluation '+f(r)}],sc,[{v:seuil,t:'seuil '+f(seuil)}]));
    out.appendChild(bars);out.appendChild(legend([[C.fp,'fonds propres avant'],[C.rev,'réserve de réévaluation (dans la réserve légale issue du bénéfice)']]));
    var ok=fp>=seuil;
    out.appendChild(h('div','vz-say '+(ok?'ok':'warn'),'Immeuble au bilan : 300 + '+f(r)+' = '+f(300+r)+'. Fonds propres : 120 + '+f(r)+' = <b>'+f(fp)+'</b>. Seuil : ½ × (400 + 60 + 40 + '+f(r)+') = <b>'+f(seuil)+'</b>. '+(ok?'La perte de capital est supprimée.':'Il y a toujours perte de capital.')));
    out.appendChild(h('div','vz-note','La réserve de réévaluation fait partie de la réserve légale issue du bénéfice : chaque franc réévalué augmente le seuil de 50 centimes. Il faut ici réévaluer d’au moins 260 pour supprimer la perte de capital. Aucun argent n’entre dans la société.'));
  }
  slider(box,'Réévaluation de l’immeuble',0,300,10,0,function(x){r=x;draw();});
  box.appendChild(out);draw();
};

/* 5.1 · the measures and the "Assainissement" account */
W.assain=function(box){
  head(box,'Quelles mesures passent par le compte « Assainissement » ?','Une société doit éliminer une perte reportée de 400 et corriger de 80 la valeur d’un stock surévalué : 480 au débit du compte Assainissement. Cochez des mesures jusqu’à ce que le crédit atteigne 480. Montants inventés, en milliers de CHF.');
  var M=[
    ['red','Les actionnaires acceptent de réduire le capital-actions de 400 à 200.',200,'c','Réduction du capital-actions'],
    ['abn','Un fournisseur abandonne 150 de sa créance.',150,'c','Abandon de créance'],
    ['afp','Un actionnaire verse 130 à fonds perdu : il donne cet argent à la société.',130,'c','Versement à fonds perdu'],
    ['aug','Un investisseur souscrit des actions nouvelles pour 200, payées en argent.',200,'x','Le montant va au capital-actions. Il ne passe pas par le compte Assainissement.'],
    ['pos','La banque postpose 200 de son prêt : elle accepte d’être payée après les autres.',200,'x','Aucune écriture : la dette reste au bilan.']
  ],on={},out=h('div');
  var chk=h('div','vz-chk');
  M.forEach(function(m){var l=h('label');var i=document.createElement('input');i.type='checkbox';i.onchange=function(){on[m[0]]=i.checked;draw();};l.appendChild(i);l.appendChild(h('span','',m[1]));chk.appendChild(l);});
  box.appendChild(chk);
  function draw(){
    out.innerHTML='';var cr=0,rows='',side='';
    M.forEach(function(m){if(!on[m[0]])return;if(m[3]==='c'){cr+=m[2];rows+='<p><span>'+m[4]+'</span><b>'+f(m[2])+'</b></p>';}else side+='<li><b>'+f(m[2])+' :</b> '+m[4]+'</li>';});
    var t=h('div','vz-t2');
    t.innerHTML='<div><h5>Débit du compte Assainissement</h5><p><span>Correction de valeur du stock</span><b>80</b></p><p><span>Élimination de la perte reportée</span><b>400</b></p><p class="tot"><span>Total</span><b>480</b></p></div>'+
      '<div><h5>Crédit</h5>'+(rows||'<p><span>Aucune mesure cochée</span><b>0</b></p>')+'<p class="tot"><span>Total</span><b>'+f(cr)+'</b></p></div>';
    out.appendChild(t);
    var s,c;
    if(cr<480){s='Il manque <b>'+f(480-cr)+'</b> au crédit : la perte n’est pas entièrement éliminée.';c='warn';}
    else if(cr===480){s='<b>Le compte est soldé :</b> 480 au débit, 480 au crédit. La perte reportée a disparu du bilan.';c='ok';}
    else{s='Le crédit dépasse le débit de <b>'+f(cr-480)+'</b>. Ce reste sert à des amortissements supplémentaires.';c='ok';}
    out.appendChild(h('div','vz-say '+c,s));
    if(side)out.appendChild(h('div','vz-say','<b>Cochées, mais hors du compte Assainissement :</b><ul style="margin:4px 0 0 18px">'+side+'</ul>'));
  }
  box.appendChild(out);draw();
};

/* 5.2 · issue above par */
W.emission=function(box){
  head(box,'L’argent reçu se partage entre le capital-actions et l’agio','Déplacez les deux curseurs : la valeur nominale des actions nouvelles, puis le prix d’émission en pour cent de cette valeur. Montants inventés, en milliers de CHF.');
  var v={n:500,p:120},out=h('div'),sp;
  function draw(){
    out.innerHTML='';sp.set(v.p+' %');var cash=v.n*v.p/100,ag=cash-v.n,sc=2000,bars=h('div','vz-bars');
    bars.appendChild(bar('La société reçoit',[{v:cash,c:C.cash,t:'liquidités '+f(cash)}],sc));
    bars.appendChild(bar('Elle inscrit',[{v:v.n,c:C.cap,t:'capital-actions '+f(v.n)},{v:ag,c:C.agio,t:'agio '+f(ag)}],sc));
    out.appendChild(bars);
    out.appendChild(h('div','vz-say','Produit de l’émission = '+f(v.n)+' × '+v.p+' % = <b>'+f(cash)+'</b>. Agio = '+f(cash)+' − '+f(v.n)+' = <b>'+f(ag)+'</b>, porté à la réserve légale issue du capital (art. 671 CO). '+(ag===0?'À 100 %, les actions sont émises au pair : il n’y a pas d’agio.':'L’agio ne passe pas par le compte Assainissement.')));
  }
  slider(box,'Valeur nominale des actions nouvelles',100,1000,50,v.n,function(x){v.n=x;draw();});
  sp=slider(box,'Prix d’émission, en % de la valeur nominale',100,200,5,v.p,function(x){v.p=x;draw();});
  box.appendChild(out);draw();
};

/* 5.2 · debt-to-equity conversion */
W.conversion=function(box){
  head(box,'La dette devient du capital, sans mouvement d’argent','Une société a 1 000 d’actifs, 900 de dettes dont 600 envers la banque, et 100 de fonds propres. Déplacez le curseur : c’est la part de la dette bancaire que la banque convertit en actions. Montants inventés, en milliers de CHF.');
  var x=0,out=h('div');
  function draw(){
    out.innerHTML='';var sc=1000,bars=h('div','vz-bars');
    bars.appendChild(bar('Actifs',[{v:1000,c:C.a,t:'actifs 1’000, inchangés'}],sc));
    bars.appendChild(bar('Passifs',[{v:300,c:C.d,t:'autres dettes 300'},{v:600-x,c:'#8FA1AC',t:'banque '+f(600-x)},{v:x,c:C.cap,t:'actions de la banque '+f(x)},{v:100,c:C.fp,t:'FP 100'}],sc));
    out.appendChild(bars);out.appendChild(legend([[C.d,'autres dettes'],['#8FA1AC','dette bancaire'],[C.cap,'capital créé par la conversion'],[C.fp,'fonds propres d’avant']]));
    out.appendChild(h('div','vz-say'+(x?' ok':''),x?'Écriture : <b>Dette bancaire à Capital-actions '+f(x)+'</b>. Dettes : 900 − '+f(x)+' = <b>'+f(900-x)+'</b>. Fonds propres : 100 + '+f(x)+' = <b>'+f(100+x)+'</b>. Les actifs ne bougent pas : aucun argent n’a circulé. La banque est devenue actionnaire (libération par compensation, art. 634a CO).':'Rien n’est encore converti : 900 de dettes, 100 de fonds propres.'));
  }
  slider(box,'Dette bancaire convertie en actions',0,600,50,0,function(v){x=v;draw();});
  box.appendChild(out);draw();
};

/* 5.2 · subordination */
W.postpo=function(box){
  head(box,'La postposition couvre le découvert, mais le bilan ne change pas','Une société a 800 d’actifs et 950 de dettes : il lui manque 150, c’est le découvert. Un actionnaire lui a prêté 250. Déplacez le curseur : c’est la part de ce prêt qu’il accepte de postposer. Montants inventés, en milliers de CHF.');
  var p=0,out=h('div');
  function draw(){
    out.innerHTML='';var sc=1000,bars=h('div','vz-bars');
    bars.appendChild(bar('Actifs',[{v:800,c:C.a,t:'actifs 800'}],sc));
    bars.appendChild(bar('Dettes',[{v:700,c:C.d,t:'autres dettes 700'},{v:250-p,c:'#8FA1AC',t:'prêt '+f(250-p)},{v:p,c:C.post,hatch:1,t:'postposé '+f(p)}],sc,[{v:800,t:'actifs 800'}]));
    out.appendChild(bars);out.appendChild(legend([[C.d,'autres dettes'],['#8FA1AC','prêt de l’actionnaire, rang normal'],[C.post,'prêt postposé : payé après tous les autres']]));
    var ok=p>=150;
    out.appendChild(h('div','vz-say '+(ok?'ok':'warn'),ok?'<b>Créances postposées '+f(p)+' ≥ découvert 150.</b> Le conseil d’administration n’a pas à aviser le tribunal (art. 725b al. 4 ch. 1 CO).':'<b>Créances postposées '+f(p)+' &lt; découvert 150.</b> La postposition ne couvre pas le découvert : le conseil d’administration doit aviser le tribunal, sauf chance concrète d’assainissement dans les 90 jours.'));
    out.appendChild(h('div','vz-say','<b>Ce qui ne change pas :</b> les dettes restent à 950, les fonds propres à −150. La société est toujours surendettée. La postposition ne demande aucune écriture.'));
  }
  slider(box,'Part du prêt d’actionnaire postposée',0,250,10,0,function(v){p=v;draw();});
  box.appendChild(out);draw();
};

function boot(){[].forEach.call(document.querySelectorAll('.vz[data-vz]'),function(b){var n=b.getAttribute('data-vz');if(W[n]&&!b.dataset.on){b.dataset.on='1';try{W[n](b);}catch(e){b.textContent='';}}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
