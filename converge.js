/* SEO Sales — converge animation: two streams merge into one.
   Abstract, no text. Vanilla canvas, seamless loop, understated. */
(function () {
  'use strict';
  var canvas = document.getElementById('convergeCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 900, H = 720;
  var TURQ = '#3BE0D2', VIOLET = '#A08CFF', WHITE = '#F1EEFF';
  function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  function mix(c1,c2,t){var a=hx(c1),b=hx(c2);return 'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')';}
  function rgba(c,a){var v=hx(c);return 'rgba('+v[0]+','+v[1]+','+v[2]+','+a+')';}
  var clamp=function(v,a,b){return v<a?a:v>b?b:v;};

  var M = {x:560, y:360}, END = {x:900, y:360};
  var S = [
    {c:TURQ,   p0:{x:40,y:130}, p1:{x:290,y:130}, p2:{x:430,y:295}},
    {c:VIOLET, p0:{x:40,y:590}, p1:{x:290,y:590}, p2:{x:430,y:425}}
  ];
  function bez(s,t){
    var u=1-t;
    return {
      x:u*u*u*s.p0.x+3*u*u*t*s.p1.x+3*u*t*t*s.p2.x+t*t*t*M.x,
      y:u*u*u*s.p0.y+3*u*u*t*s.p1.y+3*u*t*t*s.p2.y+t*t*t*M.y
    };
  }
  var SPLIT = 0.66;
  function pos(s,t){
    if (t < SPLIT) return bez(s, t/SPLIT);
    var k=(t-SPLIT)/(1-SPLIT);
    return {x:M.x+(END.x-M.x)*k, y:M.y};
  }
  function pathAlpha(t){ return Math.min(clamp(t/0.07,0,1), clamp((1-t)/0.14,0,1)); }

  function render(time){
    ctx.clearRect(0,0,W,H);

    // Guide paths — the two inputs stay separate, the outcome is one
    S.forEach(function(s){
      ctx.strokeStyle = s.c; ctx.globalAlpha = 0.16; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.p0.x,s.p0.y);
      ctx.bezierCurveTo(s.p1.x,s.p1.y,s.p2.x,s.p2.y,M.x,M.y); ctx.stroke();
    });
    var lg = ctx.createLinearGradient(M.x,0,END.x,0);
    lg.addColorStop(0, rgba(WHITE,.34)); lg.addColorStop(1, rgba(WHITE,0));
    ctx.strokeStyle = lg; ctx.globalAlpha = 1; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(M.x,M.y); ctx.lineTo(END.x,M.y); ctx.stroke();
    ctx.lineWidth = 1;

    // Merge node
    var pulse = 0.5+0.5*Math.sin(time*1.3);
    var g = ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,86+22*pulse);
    g.addColorStop(0, rgba(WHITE, 0.24+0.12*pulse));
    g.addColorStop(1, rgba(WHITE, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(M.x,M.y,86+22*pulse,0,6.2832); ctx.fill();
    ctx.strokeStyle = rgba(WHITE,.28); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(M.x,M.y,26+5*pulse,0,6.2832); ctx.stroke();
    ctx.fillStyle = WHITE; ctx.globalAlpha = 0.92;
    ctx.beginPath(); ctx.arc(M.x,M.y,6+1.2*pulse,0,6.2832); ctx.fill();

    // Streams
    S.forEach(function(s,si){
      var n=22;
      for (var i=0;i<n;i++){
        var t=(time*0.075 + i/n + si*0.021)%1;
        var p=pos(s,t);
        var merged = t>=SPLIT;
        var k = merged ? clamp((t-SPLIT)/(1-SPLIT)*1.5,0,1) : 0;
        var col = merged ? mix(s.c, WHITE, k) : s.c;
        var a = pathAlpha(t)*(merged?0.95:0.7);
        if (a<=0.01) continue;
        var r = merged ? 3.2+1.6*k : 2.6;
        ctx.globalAlpha = a*0.3;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x,p.y,r*2.4,0,6.2832); ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832); ctx.fill();
      }
    });

    // Origin markers — two distinct sources
    S.forEach(function(s){
      ctx.globalAlpha = .55; ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.p0.x+8,s.p0.y,5,0,6.2832); ctx.fill();
      ctx.globalAlpha = .18; ctx.strokeStyle = s.c; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(s.p0.x+8,s.p0.y,15,0,6.2832); ctx.stroke();
    });
    ctx.globalAlpha=1;
  }

  function size(){
    var rect=canvas.getBoundingClientRect();
    var dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(rect.width*dpr);
    canvas.height=Math.round(rect.width*(H/W)*dpr);
    ctx.setTransform(canvas.width/W,0,0,canvas.width/W,0,0);
  }
  size();
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('resize',function(){size(); if(reduced) render(2.2);});
  if (reduced){ render(2.2); return; }
  var visible=true,start=performance.now();
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){visible=en[0].isIntersecting;},{threshold:0.05}).observe(canvas);
  }
  (function tick(now){
    if (visible && !document.hidden) render((now-start)/1000);
    requestAnimationFrame(tick);
  })(start);
})();
