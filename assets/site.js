// Ortak: mobil menü, açılır menü, kaydırma animasyonları
(function(){
  var burger=document.getElementById('burger'), mnav=document.getElementById('mnav');
  if(burger&&mnav){
    burger.onclick=function(){var o=mnav.classList.toggle('on');burger.setAttribute('aria-expanded',o);};
    mnav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mnav.classList.remove('on');burger.setAttribute('aria-expanded','false');});});
  }
  document.querySelectorAll('.dd').forEach(function(dd){
    var b=dd.querySelector('button');
    if(b){b.onclick=function(e){e.stopPropagation();dd.classList.toggle('open');};}
  });
  document.addEventListener('click',function(){document.querySelectorAll('.dd.open').forEach(function(d){d.classList.remove('open');});});


  // Menü: kayan şeffaf vurgu, aktif sayfaya geri dönüş, hafif mıknatıs etkisi, cam yoğunluğu
  (function(){
    var nav=document.querySelector('.nav'), hdr=document.querySelector('.hdr');
    function onScroll(){ if(hdr) hdr.classList.toggle('scrolled',window.scrollY>8); }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    if(nav && window.matchMedia('(hover:hover) and (min-width:1141px)').matches){
      nav.classList.add('pilled');
      var pill=document.createElement('span'); pill.className='nav-pill'; pill.setAttribute('aria-hidden','true'); nav.appendChild(pill);
      var items=[].slice.call(nav.querySelectorAll(':scope > a, :scope > .dd > button'));
      var active=nav.querySelector(':scope > a.on, :scope > .dd > button.on');
      function place(el){
        var nr=nav.getBoundingClientRect(), r=el.getBoundingClientRect();
        pill.style.width=(r.width+26)+'px'; pill.style.height=(r.height+10)+'px';
        pill.style.transform='translate('+(r.left-nr.left-13)+'px,'+(r.top-nr.top-5)+'px)';
      }
      function snap(el){ pill.classList.add('jump'); place(el); void pill.offsetWidth; pill.classList.remove('jump'); }
      function toActive(){ if(active){ place(active); pill.classList.add('on','rest'); } else { pill.classList.remove('on','rest'); } }
      if(active){ snap(active); pill.classList.add('on','rest'); }
      items.forEach(function(el){
        el.addEventListener('mouseenter',function(){
          if(!pill.classList.contains('on')){ snap(el); pill.classList.add('on'); }
          else place(el);
          pill.classList.toggle('rest',el===active);
        });
        el.addEventListener('mousemove',function(e){
          var r=el.getBoundingClientRect();
          var x=(e.clientX-r.left-r.width/2)/r.width, y=(e.clientY-r.top-r.height/2)/r.height;
          el.style.transform='translate('+(x*7).toFixed(1)+'px,'+(y*5).toFixed(1)+'px)';
        });
        el.addEventListener('mouseleave',function(){ el.style.transform=''; });
      });
      nav.addEventListener('mouseleave',toActive);
      window.addEventListener('resize',function(){ if(active) snap(active); });
      window.addEventListener('load',function(){ if(active) snap(active); });
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ if(active) snap(active); });
    }
  })();


  // Dil seçeneği: menüdeki gibi kayan şeffaf vurgu, seçili dile geri dönüş
  (function(){
    var lang=document.querySelector('.lang');
    if(!lang||!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var pill=document.createElement('span'); pill.className='nav-pill'; pill.setAttribute('aria-hidden','true'); lang.appendChild(pill);
    var items=[].slice.call(lang.querySelectorAll('.lang-b'));
    function act(){ return lang.querySelector('.lang-b.on'); }
    function place(el){
      var lr=lang.getBoundingClientRect(), r=el.getBoundingClientRect();
      pill.style.width=r.width+'px'; pill.style.height=r.height+'px';
      pill.style.transform='translate('+(r.left-lr.left)+'px,'+(r.top-lr.top)+'px)';
    }
    function snap(el){ pill.classList.add('jump'); place(el); void pill.offsetWidth; pill.classList.remove('jump'); }
    function toActive(){ var a=act(); if(a){ place(a); pill.classList.add('on','rest'); } }
    var a0=act(); if(a0){ snap(a0); pill.classList.add('on','rest'); }
    items.forEach(function(el){
      el.addEventListener('mouseenter',function(){ place(el); pill.classList.add('on'); pill.classList.toggle('rest',el===act()); });
    });
    lang.addEventListener('mouseleave',toActive);
    lang.addEventListener('langchange',toActive);
    window.addEventListener('resize',function(){ var a=act(); if(a) snap(a); });
  })();

  // Sayfa geçişi: içeriden bağlantıya basınca hafif sönüp açılır
  (function(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return;
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;
      if(a.target&&a.target!=='_self') return;
      var h=a.getAttribute('href');
      if(!h||h.charAt(0)==='#'||/^(mailto:|tel:|https?:|javascript:)/i.test(h)) return;
      if(a.hasAttribute('download')||/\.pdf($|#)/i.test(h)) return;
      var u=new URL(a.href,location.href);
      if(u.origin!==location.origin||(u.pathname===location.pathname&&u.hash)) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function(){ location.href=a.href; },230);
    });
    window.addEventListener('pageshow',function(e){ if(e.persisted) document.body.classList.remove('leaving'); });
  })();


  // SNL Door menüsü: satırın üzerine gelince sağda ürün görseli
  (function(){
    [].slice.call(document.querySelectorAll('.dd .menu')).forEach(function(menu){
      var pv=menu.querySelector('.menu-pv'); if(!pv) return;
      var img=pv.querySelector('img'), cache={};
      var links=[].slice.call(menu.querySelectorAll('a'));
      function preload(){ links.forEach(function(a){ var s=a.getAttribute('data-img'); if(s&&!cache[s]){ var im=new Image(); im.src=s; cache[s]=im; } }); }
      menu.parentNode.addEventListener('mouseenter',preload,{once:true});
      links.forEach(function(a){
        a.addEventListener('mouseenter',function(){
          var s=a.getAttribute('data-img');
          if(!s){ pv.classList.remove('show'); return; }
          if(img.getAttribute('src')!==s){ img.classList.remove('ready'); img.onload=function(){ img.classList.add('ready'); }; img.setAttribute('src',s); if(img.complete) img.classList.add('ready'); }
          else img.classList.add('ready');
          pv.classList.add('show');
        });
      });
      menu.addEventListener('mouseleave',function(){ pv.classList.remove('show'); });
      menu.parentNode.addEventListener('mouseleave',function(){ pv.classList.remove('show'); });
    });
  })();

  function initReveal(){
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(typeof gsap==='undefined'){
      document.querySelectorAll('[data-r]').forEach(function(el){el.style.opacity=1;el.style.transform='none';});
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Stagger groups: kart satırları ve why grid'i
    var staggerSelectors=['.why','.door-feat-row-top','.door-feat-row-bot','.grid'];
    var staggedEls=new Set();

    staggerSelectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(container){
        var children=container.querySelectorAll('[data-r]');
        if(!children.length) return;
        children.forEach(function(el){staggedEls.add(el);});
        if(reduce){gsap.set(children,{opacity:1,y:0});return;}
        gsap.to(children,{
          opacity:1,y:0,duration:1.3,ease:'power4.out',clearProps:'willChange',
          stagger:{amount:.55,from:'start'},
          scrollTrigger:{trigger:container,start:'top 88%'}
        });
      });
    });

    // Bireysel reveal - stagger grubuna girmeyenler
    gsap.utils.toArray('[data-r]').forEach(function(el){
      if(staggedEls.has(el)) return;
      if(reduce){gsap.set(el,{opacity:1,y:0});return;}
      gsap.to(el,{opacity:1,y:0,duration:1.25,ease:'power4.out',clearProps:'willChange',scrollTrigger:{trigger:el,start:'top 92%'}});
    });
  }
  if(document.readyState!=='loading') initReveal(); else document.addEventListener('DOMContentLoaded',initReveal);
})();

/* vit-par: model vitrini hafif paralaks */
(function(){
  var els=[].slice.call(document.querySelectorAll('.vit[data-par]'));
  if(!els.length||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches)) return;
  var vh=window.innerHeight,tick=false;
  function upd(){
    tick=false; vh=window.innerHeight;
    els.forEach(function(el){
      var r=el.getBoundingClientRect(), p=(r.top+r.height/2-vh/2)/vh;
      var k=parseFloat(el.getAttribute('data-par'))||0;
      el.style.setProperty('--py',(k*-p*1.6).toFixed(1)+'px');
    });
  }
  window.addEventListener('scroll',function(){ if(!tick){tick=true;requestAnimationFrame(upd);} },{passive:true});
  window.addEventListener('resize',upd); upd();
})();

/* reveal güvencesi: hızlı kaydırmada atlanan ya da takılı kalan öğeleri açar, boş alan kalmaz */
(function(){
  var tick=false;
  function sweep(){
    tick=false;
    var vh=window.innerHeight;
    [].forEach.call(document.querySelectorAll('[data-r]'),function(el){
      var cs=getComputedStyle(el);
      if(parseFloat(cs.opacity)>=.99) return;
      var r=el.getBoundingClientRect();
      if(r.top<vh*.9 && r.bottom>-40){ el.style.transition='opacity .6s ease, transform .6s ease'; el.style.opacity='1'; el.style.transform='none'; }
    });
  }
  function req(){ if(!tick){ tick=true; setTimeout(sweep,700); } }
  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('load',function(){ setTimeout(sweep,2500); });
})();

/* iç gezinti işareti: Anasayfa'ya tıklanınca giriş sahnesi tekrar çalışmaz */
document.addEventListener('click',function(e){ try{ var a=e.target.closest&&e.target.closest('a[href]'); if(a&&!a.target&&/(^|\/)(index\.html)?(#.*)?$/.test(a.getAttribute('href').split('?')[0])) sessionStorage.setItem('snl-nav',Date.now()); }catch(_){} },true);
