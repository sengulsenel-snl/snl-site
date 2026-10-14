/* Kapı sayfaları: bir modele tıklayınca ekranın sağ yarısında açılan panel */
(function(){
  var srcs=[].slice.call(document.querySelectorAll('main article.card, main article.fmodel'));
  if(!srcs.length) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T=window.SNL_T||function(s){ return s; };
  var data=srcs.map(function(el){
    var img=el.querySelector('img'), h=el.querySelector('h3'), p=el.querySelector('.tx p'), dd=el.querySelector('dd'), em=el.querySelector('.empty');
    return { src:img?img.getAttribute('src'):'', alt:img?(img.getAttribute('alt')||''):'', name:h?h.textContent.trim():'', desc:p?p.textContent.trim():(dd?dd.textContent.trim():''), empty:em?em.textContent.trim():'' };
  });
  var box=document.createElement('div'); box.className='mdp'; box.hidden=true;
  box.innerHTML='<div class="mdp-back"></div>'+
    '<aside class="mdp-box" role="dialog" aria-modal="true" aria-label="'+T('Model detayı')+'">'+
      '<div class="mdp-top"><span class="mdp-n"></span><button type="button" class="mdp-x" aria-label="'+T('Kapat')+'">&times;</button></div>'+
      '<div class="mdp-media"><img alt=""><div class="mdp-empty"></div></div>'+
      '<div class="mdp-info"><h3></h3><p></p><a class="mdp-link" href="iletisim.html">'+((document.querySelector('.colornote a')||{}).textContent||T('Renk seçenekleri için iletişime geçin'))+'</a></div>'+
      '<div class="mdp-nav"><button type="button" class="mdp-b mdp-prev" aria-label="'+T('Önceki model')+'">&larr;</button><button type="button" class="mdp-b mdp-next" aria-label="'+T('Sonraki model')+'">&rarr;</button></div>'+
    '</aside>';
  document.body.appendChild(box);
  var img=box.querySelector('.mdp-media img'), emp=box.querySelector('.mdp-empty'), nm=box.querySelector('.mdp-info h3'), ds=box.querySelector('.mdp-info p'), cnt=box.querySelector('.mdp-n');
  var cur=0, lastFocus=null, n=data.length;
  function set(i,anim){
    cur=((i%n)+n)%n; var d=data[cur];
    var apply=function(){
      if(d.src){ img.style.display='block'; emp.style.display='none'; img.src=d.src; img.alt=d.alt; }
      else { img.style.display='none'; emp.style.display='flex'; emp.textContent=d.empty||T('Görsel eklenecek'); }
      nm.textContent=d.name; ds.textContent=d.desc; cnt.textContent=('0'+(cur+1)).slice(-2)+' / '+('0'+n).slice(-2);
    };
    if(anim&&!reduce){ box.classList.add('swap'); setTimeout(function(){ apply(); box.classList.remove('swap'); },160); } else apply();
  }
  function open(i){
    lastFocus=document.activeElement; set(i,false);
    box.hidden=false; document.documentElement.style.overflow='hidden';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ box.classList.add('show'); }); });
    box.querySelector('.mdp-x').focus();
  }
  function close(){
    box.classList.remove('show'); document.documentElement.style.overflow='';
    setTimeout(function(){ box.hidden=true; },reduce?0:600);
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  srcs.forEach(function(el,i){
    el.setAttribute('tabindex','0'); el.setAttribute('role','button'); el.setAttribute('data-mdp','');
    el.addEventListener('click',function(){ open(i); });
    el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(i); } });
  });
  box.querySelector('.mdp-x').addEventListener('click',close);
  box.querySelector('.mdp-back').addEventListener('click',close);
  box.querySelector('.mdp-prev').addEventListener('click',function(){ set(cur-1,true); });
  box.querySelector('.mdp-next').addEventListener('click',function(){ set(cur+1,true); });
  window.addEventListener('keydown',function(e){
    if(box.hidden) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowRight') set(cur+1,true);
    if(e.key==='ArrowLeft') set(cur-1,true);
  });
})();
