/* ------------------------------------------------------------ Lumi's look --
   The firefly can be chosen: Classic, which is the one Samajh has always
   drawn and the one everyone starts with, or one of two new looks, Graduate
   and Glossy. `auto` picks by age band: Classic to ten, Graduate from
   eleven to seventeen, Glossy for adults. The colour of the light is chosen
   separately. Both choices live in S.set (lumi, lumiGlow), so they are
   saved with the theme and the paper and are no part of a child's material.

   A look is either a picture or a drawing. A picture is cut into layers,
   back to front (wings, body, and what sits on top), so its wings can beat;
   a layer with light in it has a mask of those pixels, and a second copy,
   recoloured and shown only through the mask, is how the lantern changes
   colour without the body changing with it. A drawing is vector art whose
   light is three known colours, swapped for the chosen ones. How the parts
   move is in the styles at the foot of this block. */
const LUMI_ART=__LUMI_ART__;
/* Classic, the firefly Samajh has always drawn, is what everyone starts with. */
const LUMI_LOOKS=[['classic','Classic'],['auto','Auto'],['professor','Graduate'],['glass','Glossy']];
/* an age that is not listed, or no age at all, keeps Classic */
const LUMI_BY_AGE={'11-13':'professor','14-17':'professor','18+':'glass'};
/* id, name, the light, its pale centre */
const LUMI_GLOWS=[['yellow','Yellow','#F5C542','#FFF6D2'],['orange','Orange','#FF8A3D','#FFE9D6'],['pink','Pink','#FF6FAE','#FFE3EF'],
  ['green','Green','#5FD97A','#E4FBE9'],['blue','Blue','#4FB8FF','#E1F3FF'],['purple','Purple','#A98BFF','#EEE7FF'],['white','White','#F3F6FF','#FFFFFF']];
function lumiAuto(){const p=S.set.profile;return (p&&LUMI_BY_AGE[p.age])||'classic';}
function lumiLook(){const k=S.set.lumi;return k==='auto'?lumiAuto():LUMI_ART[k]?k:'classic';}
function lumiGlow(){const k=S.set.lumiGlow;for(let i=0;i<LUMI_GLOWS.length;i++)if(LUMI_GLOWS[i][0]===k)return LUMI_GLOWS[i];return LUMI_GLOWS[0];}
/* Brightness kept, colour replaced: what the lantern's pixels become. */
function lumiTint(hex){
  const c=[1,3,5].map(function(i){return parseInt(hex.slice(i,i+2),16)/255*.9+.1;});
  return c.map(function(v){return [.30,.59,.11].map(function(w){return (v*w*1.25).toFixed(3);}).join(' ')+' 0 0';}).join(' ')+' 0 0 0 1 0';
}
function lumiShade(hex,f){return '#'+[1,3,5].map(function(i){return ('0'+Math.round(parseInt(hex.slice(i,i+2),16)*f).toString(16)).slice(-2);}).join('');}
/* The look, placed. A drawing: its ids made this copy's own (the same drawing
   is on the page more than once) and its light recoloured. A picture: each
   layer, and over it the recoloured copy when the light is not yellow. */
function lumiPic(a,g,x,y,w,h,id){
  if(a.svg){
    let s=a.svg.replace(/id="/g,'id="'+id).replace(/url\(#/g,'url(#'+id);
    if(g[0]!=='yellow')s=s.replace(/#F5C542/gi,g[2]).replace(/#FFF6D2/gi,g[3]).replace(/#D99A1E/gi,lumiShade(g[2],.78));
    return {defs:'',body:'<g transform="translate('+x.toFixed(2)+' '+y.toFixed(2)+') scale('+(w/a.w).toFixed(4)+')">'+s+'</g>'};
  }
  const s=w/a.w,tint=g[0]!=='yellow';
  let defs=tint?'<filter id="'+id+'c" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="'+lumiTint(g[2])+'"/></filter>':'',body='';
  a.layers.forEach(function(L,i){
    const at=' x="'+(x+L.x*s).toFixed(2)+'" y="'+(y+L.y*s).toFixed(2)+'" width="'+(L.w*s).toFixed(2)+'" height="'+(L.h*s).toFixed(2)+'"';
    let b='<image href="'+L.img+'"'+at+'/>';
    if(tint&&L.mask){
      defs+='<mask id="'+id+'m'+i+'" maskUnits="userSpaceOnUse"'+at+'><image href="'+L.mask+'"'+at+'/></mask>';
      b+='<g mask="url(#'+id+'m'+i+')"><image href="'+L.img+'"'+at+' filter="url(#'+id+'c)"/></g>';
    }
    /* a layer that moves: its group carries the motion, and turns about the layer's own joint */
    body+=L.c?'<g class="'+L.c+'" style="transform-origin:'+L.o+(L.v?';'+L.v:'')+'">'+b+'</g>':b;
  });
  return {defs:defs,body:body};
}
function lumiStops(a,b,c){return '<stop offset="0" stop-color="'+a[0]+'" stop-opacity="'+a[1]+'"/><stop offset="'+b[2]+'" stop-color="'+b[0]+'" stop-opacity="'+b[1]+'"/><stop offset="100%" stop-color="'+c+'" stop-opacity="0"/>';}
/* The drawn firefly's own yellows, swapped for the chosen light. */
function lumiClassic(svg,g){
  if(g[0]==='yellow')return svg;
  return svg.replace(/#EFCE6B|#FBBF24|#F7B733/gi,g[2]).replace(/#FFF6D2|#FDE68A|#FFE9A8/gi,g[3]).replace(/#7A5B12/gi,'#2A2430');
}
/* The firefly that flies over the home screen. The site's CSS pulses .ffhalo
   and .fflamp around (60,70), so the picture hangs from its lantern there. */
function fireflySVG(){
  const k=lumiLook(),g=lumiGlow();
  if(k==='classic')return lumiClassic(fireflySVG__classic(),g);
  const a=LUMI_ART[k],ar=a.h/a.w;
  /* The lantern sits on (60,70) and the rest rises above it, but no higher than
     16 from the top of the box: at the top-left turn of its flight a taller
     firefly would leave a short window. */
  const w=Math.min(104,68/a.lx,68/(1-a.lx),54/(a.ly*ar),58/((1-a.ly)*ar)),h=w*ar;
  const p=lumiPic(a,g,60-a.lx*w,70-a.ly*h,w,h,'lf');
  return '<svg class="ffly" viewBox="0 0 120 130" aria-hidden="true"><defs>'+
    '<radialGradient id="ffg" cx="50%" cy="54%" r="50%">'+lumiStops([g[3],.95],[g[2],.5,'40%'],g[2])+'</radialGradient>'+
    '<radialGradient id="ffl" cx="50%" cy="50%" r="50%">'+lumiStops(['#FFFFFF',a.svg?.55:.9],[g[3],a.svg?.3:.45,'45%'],g[2])+'</radialGradient>'+p.defs+'</defs>'+
    '<g class="ffbody"><circle class="ffhalo" cx="60" cy="70" r="46" fill="url(#ffg)"/><g class="llean">'+p.body+'</g>'+
    '<circle class="fflamp" cx="60" cy="70" r="'+(a.svg?Math.max(4,a.lr*w*1.15):Math.max(7,a.lr*w*1.5)).toFixed(1)+'" fill="url(#ffl)"/></g></svg>';
}
/* The mascot beside sign-in, on the review screens and in Settings. Its SVG
   clips at the edge, so the picture is fitted to the box and the halo is
   carried to the lantern inside a moved group, where (60,70) is still the
   point the CSS pulses it around. `look` and `glow` are for the Settings
   thumbnails; left out, they are the ones chosen. */
function lumiMascot(look,glow){
  const k=look||lumiLook(),g=glow||lumiGlow();
  if(k==='classic')return lumiClassic(JUGNU_MASCOT,g);
  const a=LUMI_ART[k],ar=a.h/a.w,w=Math.min(108,108/ar),h=w*ar,x=60-w/2,y=60-h/2;
  const lx=x+a.lx*w,ly=y+a.ly*h,r=Math.min(40,lx-1,119-lx,ly-1,119-ly);
  const p=lumiPic(a,g,x,y,w,h,'lm'+k);
  return '<svg viewBox="0 0 120 120" aria-hidden="true"><defs>'+
    '<radialGradient id="lmh'+g[0]+'" cx="50%" cy="50%" r="50%">'+lumiStops([g[3],.85],[g[2],.32,'55%'],g[2])+'</radialGradient>'+p.defs+'</defs>'+
    '<g class="jm"><g transform="translate('+(lx-60).toFixed(2)+' '+(ly-70).toFixed(2)+')"><circle class="jm-halo" cx="60" cy="70" r="'+r.toFixed(1)+'" fill="url(#lmh'+g[0]+')"/></g>'+
    p.body+'</g></svg>';
}
/* The flying firefly is made once and never rebuilt, so it is redrawn here
   when the look, the light or the age band it follows has changed. */
function lumiSync(){
  const j=document.getElementById('jugnu');if(!j||!j.firstChild)return;
  const key=lumiLook()+'/'+lumiGlow()[0];
  if(j.getAttribute('data-lumi')===key)return;
  const v=j.firstChild;
  v.innerHTML=fireflySVG();j.setAttribute('data-lumi',key);
  /* the lean inside keeps time with the flight around the page, so both start again together */
  v.style.animation='none';void v.offsetWidth;v.style.animation='';
}
function setLumi(k){S.set.lumi=k;saveSet();lumiSync();render();}
function setLumiGlow(k){S.set.lumiGlow=k;saveSet();lumiSync();render();}
function lumiCard(){
  const cur=S.set.lumi||'classic',g=lumiGlow(),auto=lumiAuto();
  const nameOf=function(k){for(let i=0;i<LUMI_LOOKS.length;i++)if(LUMI_LOOKS[i][0]===k)return LUMI_LOOKS[i][1];return '';};
  return '<div class="card" id="lumilook"><h4>Jugnu’s look</h4>'+
    '<label class="lb">Firefly</label><div class="lumis">'+
      LUMI_LOOKS.map(function(l){
        return '<button class="lumib" aria-pressed="'+(cur===l[0])+'" onclick="setLumi(\''+l[0]+'\')">'+
          '<span class="lumit">'+lumiMascot(l[0]==='auto'?auto:l[0],g)+'</span>'+l[1]+'</button>';
      }).join('')+
    '</div>'+
    '<label class="lb" style="margin-top:16px">Light</label><div class="glows">'+
      LUMI_GLOWS.map(function(c){
        return '<button class="glow" style="--g:'+c[2]+'" aria-pressed="'+(g[0]===c[0])+'" onclick="setLumiGlow(\''+c[0]+'\')"><i></i>'+c[1]+'</button>';
      }).join('')+
    '</div>'+
    '<p class="note" style="margin-top:12px">Classic is the firefly you start with. Auto picks one by age: Classic up to 10, Graduate from 11 to 17, Glossy for 18 and over. Right now Auto is '+nameOf(auto)+'. The light is yellow until you choose another.</p>'+
  '</div>';
}
(function(){
  const s=document.createElement('style');
  s.textContent='.lumis{display:flex;flex-wrap:wrap;gap:12px 10px}'+
    '.lumib{display:flex;flex-direction:column;align-items:center;gap:6px;width:76px;font-size:.74rem;color:var(--ink2);border-radius:14px;padding:4px 0}'+
    '.lumit{width:64px;height:64px;border-radius:16px;display:block;background:var(--sunk);box-shadow:inset 0 0 0 1px var(--line2);padding:4px;box-sizing:border-box}'+
    '.lumit svg{width:100%;height:100%;display:block}'+
    '.lumib:hover .lumit{box-shadow:inset 0 0 0 1px var(--ink3)}'+
    '.lumib[aria-pressed="true"]{color:var(--ink);font-weight:600}'+
    '.lumib[aria-pressed="true"] .lumit{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--acc)}'+
    __LUMI_CSS__;
  document.head.appendChild(s);
})();
