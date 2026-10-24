/* =====================================================================
   DEMO · the left-hand menu (24 Oct 2026)
   One script, loaded by every page in /demo/ except board.html (the
   room screen stays clean). It draws a fixed sidebar on wide screens
   and a "☰ Menu" button that slides it in on narrow ones. Links are
   absolute, so the same list works from /demo/ and /demo/course/.
   The page underneath is not edited: on wide screens the body gets a
   left padding, and the sticky top bars of lesson.css / homework.css
   sit inside the body, so they move with it.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__demoMenu)return; window.__demoMenu=true;

  var B='/demo/', C=B+'course/';
  var WEEKS=[
    [1,'Introduction to sustainable investing'],
    [2,'Building a sustainable financial system'],
    [3,'Regulatory & policy environment'],
    [4,'Risk management & measurement'],
    [5,'The sustainable debt market'],
    [6,'The sustainable equity market',true],
    [7,'Sustainable derivatives & impact investing'],
    [8,'Carbon, biodiversity credits & crowdfunding']
  ];
  var GROUPS=[
    ['The demo',[
      ['Overview · how to present it', B+'index.html','🎬']
    ]],
    ['Student view',[
      ['Course hub', C+'index.html','🏠'],
      'WEEKS',
      ['Written assignment', C+'assignment.html','✍️'],
      ['Running glossary', C+'glossary.html','📖'],
      ['Weekly feedback', C+'feedback.html','💬']
    ]],
    ['Instructor view',[
      ['Dashboard · today', B+'admin.html#today','📋'],
      ['The cohort', B+'admin.html#cohort','📈'],
      ['The roster', B+'admin.html#roster','👥'],
      ['Feedback board', B+'admin.html#feedback','🗳️'],
      ['Messages', B+'admin.html#messages','✉️'],
      ['Handed in', B+'admin.html#subs','📥'],
      ['Room screen · week 5', B+'board.html?w=5','📺'],
      ['Suggested final exam', B+'exam.html','🎓']
    ]]
  ];

  var path=location.pathname.replace(/\/index(\.html)?$/,'/');
  function norm(u){ return u.replace(/[?#].*$/,'').replace(/\/index\.html$/,'/'); }
  function here(u){
    if(norm(u)!==norm(path))return false;
    var h=(u.split('#')[1]||'');
    if(!h)return true;
    var cur=(location.hash||'').slice(1)||'today';
    return h===cur;
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function link(t,u,ic,cls){
    return '<a class="dm-a'+(cls?' '+cls:'')+(here(u)?' on':'')+'" href="'+u+'"><span class="dm-ic">'+(ic||'')+'</span><span>'+esc(t)+'</span></a>';
  }
  function weeks(){
    return WEEKS.map(function(w){
      var n=w[0], L=C+'week'+n+'.html', H=C+'week'+n+'-homework.html', Q=C+'week'+n+'-quiz.html';
      var open=here(L)||here(H)||(w[2]&&here(Q));
      return '<div class="dm-wk'+(open?' on':'')+'">'+
        '<a class="dm-wt" href="'+L+'"><b>W'+n+'</b><span>'+esc(w[1])+'</span></a>'+
        '<div class="dm-sub">'+
          '<a href="'+L+'"'+(here(L)?' class="on"':'')+'>Lesson</a>'+
          '<a href="'+H+'"'+(here(H)?' class="on"':'')+'>Homework</a>'+
          (w[2]?'<a href="'+Q+'"'+(here(Q)?' class="on"':'')+'>Checkpoint quiz</a>':'')+
        '</div></div>';
    }).join('');
  }

  var css=''+
  ':root{--dm-w:256px}'+
  '#dm-nav{position:fixed;top:0;left:0;bottom:0;width:var(--dm-w);z-index:90;background:#14201A;color:#D8E4DC;'+
    'font:13px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow-y:auto;overscroll-behavior:contain;'+
    'border-right:1px solid rgba(255,255,255,.06);transition:transform .22s ease;-webkit-font-smoothing:antialiased}'+
  '#dm-nav *{box-sizing:border-box}'+
  '#dm-nav .dm-hd{padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.07)}'+
  '#dm-nav .dm-k{font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#8FBF9C;font-weight:700}'+
  '#dm-nav .dm-tt{font-size:15px;font-weight:700;color:#fff;margin-top:4px}'+
  '#dm-nav .dm-st{font-size:11.5px;color:#93A69A;margin-top:3px}'+
  '#dm-nav .dm-g{padding:12px 10px 4px}'+
  '#dm-nav .dm-gh{font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#7E9486;font-weight:700;padding:0 8px 6px}'+
  '#dm-nav a{color:inherit;text-decoration:none}'+
  '#dm-nav .dm-a{display:flex;gap:9px;align-items:center;padding:7px 8px;border-radius:8px}'+
  '#dm-nav .dm-a:hover,#dm-nav .dm-wt:hover{background:rgba(255,255,255,.06)}'+
  '#dm-nav .dm-a.on{background:#2C5530;color:#fff;font-weight:600}'+
  '#dm-nav .dm-ic{width:18px;text-align:center;flex:none;font-size:13px}'+
  '#dm-nav .dm-wk{border-radius:8px;margin:1px 0}'+
  '#dm-nav .dm-wt{display:flex;gap:9px;align-items:baseline;padding:6px 8px;border-radius:8px}'+
  '#dm-nav .dm-wt b{width:18px;flex:none;text-align:center;font-size:11px;color:#8FBF9C}'+
  '#dm-nav .dm-wt span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#dm-nav .dm-sub{display:none;padding:0 0 6px 35px;gap:4px;flex-wrap:wrap}'+
  '#dm-nav .dm-wk.on{background:rgba(44,85,48,.45)}'+
  '#dm-nav .dm-wk.on .dm-wt{color:#fff;font-weight:600}'+
  '#dm-nav .dm-wk.on .dm-sub,#dm-nav .dm-wk:hover .dm-sub{display:flex}'+
  '#dm-nav .dm-sub a{font-size:11.5px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.07);color:#C9D6CE}'+
  '#dm-nav .dm-sub a:hover{background:rgba(255,255,255,.14)}'+
  '#dm-nav .dm-sub a.on{background:#8FBF9C;color:#14201A;font-weight:700}'+
  '#dm-nav .dm-ft{padding:14px 18px 22px;font-size:11px;color:#7E9486;border-top:1px solid rgba(255,255,255,.07);margin-top:10px}'+
  '#dm-nav .dm-x{position:absolute;top:12px;right:10px;background:none;border:0;color:#93A69A;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:6px}'+
  '#dm-nav .dm-x:hover{background:rgba(255,255,255,.08);color:#fff}'+
  '#dm-btn{position:fixed;left:14px;bottom:14px;z-index:89;display:none;align-items:center;gap:7px;padding:9px 14px;border-radius:99px;border:0;'+
    'background:#14201A;color:#fff;font:600 13px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}'+
  '#dm-scrim{position:fixed;inset:0;z-index:88;background:rgba(10,16,12,.4);display:none}'+
  /* wide: sidebar in place, page pushed right; can be folded away */
  '@media (min-width:1080px){'+
    'html.dm-open body{padding-left:var(--dm-w)}'+
    'html:not(.dm-open) #dm-nav{transform:translateX(-100%)}'+
    'html:not(.dm-open) #dm-btn{display:flex}'+
  '}'+
  /* narrow: hidden until asked for, over the page */
  '@media (max-width:1079.98px){'+
    '#dm-nav{transform:translateX(-100%);width:min(300px,86vw);box-shadow:10px 0 40px rgba(0,0,0,.3)}'+
    'html.dm-slide #dm-nav{transform:none}'+
    'html.dm-slide #dm-scrim{display:block}'+
    '#dm-btn{display:flex}'+
    'html.dm-slide #dm-btn{display:none}'+
  '}'+
  '@media print{#dm-nav,#dm-btn,#dm-scrim{display:none!important}html.dm-open body{padding-left:0!important}}';

  function store(v){ try{ if(v==null)return localStorage.getItem('demo_menu'); localStorage.setItem('demo_menu',v); }catch(e){ return null; } }

  function build(){
    var st=document.createElement('style'); st.id='dm-css'; st.textContent=css; document.head.appendChild(st);
    var html='<button class="dm-x" type="button" aria-label="Hide the menu" title="Hide the menu">«</button>'+
      '<div class="dm-hd"><div class="dm-k">Demonstration</div><div class="dm-tt">OMBAFR455 · demo</div><div class="dm-st">Sustainable Financial Markets · a fictional cohort</div></div>';
    GROUPS.forEach(function(g){
      html+='<div class="dm-g"><div class="dm-gh">'+esc(g[0])+'</div>';
      g[1].forEach(function(it){ html+= it==='WEEKS'?weeks():link(it[0],it[1],it[2]); });
      html+='</div>';
    });
    html+='<div class="dm-ft">Students, numbers and messages in this demo are invented.</div>';
    var nav=document.createElement('nav'); nav.id='dm-nav'; nav.setAttribute('aria-label','Demo menu'); nav.innerHTML=html;
    var btn=document.createElement('button'); btn.id='dm-btn'; btn.type='button'; btn.innerHTML='☰ Menu';
    var scrim=document.createElement('div'); scrim.id='dm-scrim';
    document.body.appendChild(scrim); document.body.appendChild(nav); document.body.appendChild(btn);

    var root=document.documentElement, wide=window.matchMedia('(min-width:1080px)');
    if(store()!=='closed')root.classList.add('dm-open');
    btn.onclick=function(){ if(wide.matches){root.classList.add('dm-open');store('open');} else root.classList.add('dm-slide'); };
    nav.querySelector('.dm-x').onclick=function(){ if(wide.matches){root.classList.remove('dm-open');store('closed');} else root.classList.remove('dm-slide'); };
    scrim.onclick=function(){ root.classList.remove('dm-slide'); };
    document.addEventListener('keydown',function(e){ if(e.key==='Escape')root.classList.remove('dm-slide'); });

    /* admin.html reads its tab from the hash only at load, so a link to
       another tab of the page already open must reload it */
    nav.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a'); if(!a)return;
      var u=new URL(a.href,location.href);
      if(u.pathname===location.pathname&&u.search===location.search&&u.hash&&u.hash!==location.hash){
        e.preventDefault(); location.hash=u.hash; location.reload();
      } else root.classList.remove('dm-slide');
    });
    var on=nav.querySelector('.on'); if(on&&on.scrollIntoView)on.scrollIntoView({block:'center'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build); else build();
})();
