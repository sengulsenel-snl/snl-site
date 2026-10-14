/* Melamin kapı yüzeyleri: ortada büyük, yanlarda açılı, yavaş yer değiştiren sunum (anasayfa ve yüzey sayfası) */
(function(){
  var stage=document.getElementById('sfc-stage'); if(!stage) return;
  var its=[].slice.call(stage.querySelectorAll('.sfc-it')), n=its.length;
  var dotsBox=document.getElementById('sfc-dots'), dots=[].slice.call(dotsBox.children);
  var prev=document.getElementById('sfc-prev'), next=document.getElementById('sfc-next');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lb=document.getElementById('sfc-lb');
  var pos=0, tween=null, started=false, t0=0, visible=false, running=false, hold=false, dragging=false, justDragged=false;
  var resumeAt=0, lastAuto=0, wheelT=null, h=400, shown=-1, hoverT=null;
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function ease(u){ return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2; }
  function outQuart(u){ return 1-Math.pow(1-u,4); }
  function wrap(i){ var r=((i-pos)%n+n)%n; return r>n/2?r-n:r; }
  function metrics(){ h=its[0].offsetHeight||400; }

  function render(now){
    var t=started?(now-t0)/1000:-1, sec=now/1000;
    for(var i=0;i<n;i++){
      var rel=wrap(i), ar=Math.abs(rel), sg=rel<0?-1:1, el=its[i];
      var a1=Math.min(ar,1), a2=clamp(ar-1,0,1), a3=Math.max(ar-2,0);
      var x=sg*(a1*h*.39+a2*h*.27+a3*h*.16);
      var sc=1-.28*a1-.20*a2-.10*Math.min(a3,1);
      var ry=sg*(a1*24+a2*7+Math.min(a3,1)*4);
      var z=-ar*70;
      var op=ar<.5?1:(ar<=1.2?.96:(ar<=2.2?.5:Math.max(0,.5-(ar-2.2)*.6)));
      if(ar>3) op=0;
      var fl=reduce?0:Math.sin(sec*.55+i*1.3)*3.2;
      var fr=reduce?0:Math.sin(sec*.4+i*.9)*.7;
      var e=1;
      if(!reduce){ e=started?outQuart(clamp((t-ar*.12)/1.2,0,1)):0; }
      x+=(1-e)*240; op*=e; sc*=(.94+.06*e);
      el.style.transform='translate3d('+x.toFixed(1)+'px,'+fl.toFixed(1)+'px,'+z.toFixed(0)+'px) scale('+sc.toFixed(4)+') rotateY('+(ry+fr).toFixed(2)+'deg)';
      el.style.opacity=op.toFixed(3);
      el.style.zIndex=String(100-Math.round(ar*10));
      el.style.setProperty('--sh',(a1*.34+a2*.3).toFixed(3));
      el.style.pointerEvents=op>.2?'auto':'none';
    }
    var a=((Math.round(pos)%n)+n)%n;
    if(a!==shown){ shown=a; dots.forEach(function(d,k){ d.classList.toggle('on',k===a); }); }
  }
  function frame(now){
    if(tween){
      var u=clamp((now-tween.t0)/tween.dur,0,1);
      pos=tween.from+(tween.to-tween.from)*ease(u);
      if(u>=1){ pos=tween.to; tween=null; lastAuto=now; }
    }
    render(now);
    if(!reduce && started && !tween && !dragging && visible && !hold && !document.hidden && now>resumeAt && now-lastAuto>2300) by(1,950);
    if(visible||tween||dragging||!started) requestAnimationFrame(frame); else running=false;
  }
  function start(){ if(!running){ running=true; requestAnimationFrame(frame); } }
  function by(d,dur){ tween={from:pos,to:pos+d,t0:performance.now(),dur:reduce?1:(dur||1300)}; start(); }
  function to(i,dur){ by(wrap(i),dur); }
  function pause(){ resumeAt=performance.now()+8000; }

  metrics(); render(performance.now());
  // görsellerin kendi oranını okur: yeni yüzey görseli konunca elle oran girmek gerekmez
  its.forEach(function(it){
    var im=it.querySelector('img'); if(!im) return;
    function setAr(){ if(im.naturalWidth&&im.naturalHeight){ it.style.setProperty('--ar',(im.naturalWidth/im.naturalHeight).toFixed(4)); metrics(); render(performance.now()); } }
    if(im.complete) setAr(); else im.addEventListener('load',setAr);
  });
  window.addEventListener('resize',function(){ metrics(); render(performance.now()); });
  its.forEach(function(it,i){
    it.addEventListener('click',function(){
      if(justDragged) return;
      if(lb && Math.abs(wrap(i))<.35){ openLb(i); } else { to(i,1200); pause(); }
    });
    it.addEventListener('mouseenter',function(){
      if(reduce||dragging) return;
      if(Math.abs(wrap(i))<.35) return;
      clearTimeout(hoverT); hoverT=setTimeout(function(){ if(!dragging && Math.abs(wrap(i))>=.35){ to(i,1300); pause(); } },420);
    });
    it.addEventListener('mouseleave',function(){ clearTimeout(hoverT); });
  });
  dots.forEach(function(d,i){ d.addEventListener('click',function(){ to(i,1200); pause(); }); });
  prev.addEventListener('click',function(){ by(-1,1100); pause(); });
  next.addEventListener('click',function(){ by(1,1100); pause(); });
  stage.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ e.preventDefault(); by(1,1100); pause(); }
    if(e.key==='ArrowLeft'){ e.preventDefault(); by(-1,1100); pause(); }
  });

  var lbImg=document.getElementById('sfc-lb-img'), lbIdx=0, lastFocus=null;
  function lbSet(i,anim){
    lbIdx=((i%n)+n)%n;
    var im=its[lbIdx].querySelector('img'), src=im.getAttribute('src');
    if(anim){ lbImg.classList.add('swap'); setTimeout(function(){ lbImg.src=src; lbImg.alt=im.alt; requestAnimationFrame(function(){ lbImg.classList.remove('swap'); }); },80); }
    else { lbImg.src=src; lbImg.alt=im.alt; }
  }
  function openLb(i){
    lastFocus=document.activeElement; hold=true; lbSet(i,false);
    lb.hidden=false; document.documentElement.style.overflow='hidden';
    requestAnimationFrame(function(){ lb.classList.add('show'); });
    document.getElementById('sfc-lb-x').focus();
  }
  function closeLb(){
    lb.classList.remove('show'); document.documentElement.style.overflow='';
    setTimeout(function(){ lb.hidden=true; },reduce?0:420);
    hold=false; to(lbIdx,900); pause(); if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  if(lb){
  document.getElementById('sfc-lb-x').addEventListener('click',closeLb);
  document.getElementById('sfc-lb-prev').addEventListener('click',function(){ lbSet(lbIdx-1,true); });
  document.getElementById('sfc-lb-next').addEventListener('click',function(){ lbSet(lbIdx+1,true); });
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.classList.contains('sfc-lb-in')) closeLb(); });
  }
  window.addEventListener('keydown',function(e){
    if(!lb||lb.hidden) return;
    if(e.key==='Escape') closeLb();
    if(e.key==='ArrowRight') lbSet(lbIdx+1,true);
    if(e.key==='ArrowLeft') lbSet(lbIdx-1,true);
  });

  var sx=0, sp=0, lastX=0, lastT=0, vel=0, down=false;
  stage.addEventListener('pointerdown',function(e){ down=true; dragging=false; sx=lastX=e.clientX; sp=pos; lastT=performance.now(); vel=0; clearTimeout(hoverT); });
  window.addEventListener('pointermove',function(e){
    if(!down) return;
    var dx=e.clientX-sx;
    if(!dragging && Math.abs(dx)>6){ dragging=true; tween=null; stage.classList.add('drag'); start(); }
    if(dragging){
      var now=performance.now(), dt=Math.max(1,now-lastT);
      vel=.8*vel+.2*((e.clientX-lastX)/dt); lastX=e.clientX; lastT=now;
      pos=sp-dx/(h*.38);
    }
  });
  function release(){
    if(!down) return; down=false;
    if(dragging){
      dragging=false; stage.classList.remove('drag');
      var target=Math.round(pos-vel*320/(h*.38)); target=clamp(target,Math.round(pos)-2,Math.round(pos)+2);
      tween={from:pos,to:target,t0:performance.now(),dur:reduce?1:1000}; start(); pause();
      justDragged=true; setTimeout(function(){ justDragged=false; },60);
    }
  }
  window.addEventListener('pointerup',release); window.addEventListener('pointercancel',release);
  stage.addEventListener('wheel',function(e){
    if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)) return;
    e.preventDefault(); tween=null; pos+=e.deltaX/(h*.9); pause(); start();
    clearTimeout(wheelT); wheelT=setTimeout(function(){ tween={from:pos,to:Math.round(pos),t0:performance.now(),dur:reduce?1:800}; start(); },140);
  },{passive:false});
  stage.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') hold=true; });
  stage.addEventListener('pointerleave',function(){ hold=false; lastAuto=performance.now(); });

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      visible=es[0].isIntersecting;
      if(visible){ if(!started){ started=true; t0=performance.now(); lastAuto=t0; } start(); }
    },{threshold:.25}).observe(stage);
  } else { visible=true; started=true; t0=performance.now(); start(); }
  if(reduce){ started=true; start(); }
})();
