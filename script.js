document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function(){
  // Turvaverkko: tästä lähtien CSS saa piilottaa .reveal-elementit animaatiota varten.
  // Tämä lisätään ehdottomasti ensimmäisenä, ennen mitään muuta koodia, jotta yksikään
  // myöhempi virhe tässä tiedostossa ei voi jättää sivun sisältöä pysyvästi piiloon.
  document.documentElement.classList.add('reveal-ready');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if(reduce){
    reveals.forEach(function(el){ el.classList.add('in'); });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    // Ei IntersectionObserver-tukea: näytä sisältö suoraan sen sijaan, että se jäisi piiloon.
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  // Pehmeä sivunvaihto: häivytä ulos ennen navigointia
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a');
      if(!a) return;
      if(a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = a.getAttribute('href') || '';
      if(!href || href.charAt(0) === '#' || /^(mailto:|tel:|https?:)/i.test(href)) return;
      if(a.href.split('#')[0] === location.href.split('#')[0]) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function(){ location.href = a.href; }, 250);
    });
    window.addEventListener('pageshow', function(){ document.body.classList.remove('leaving'); });
  }

  // Hero video: two stacked copies, always forward, crossfaded at the seam.
  // (Reverse scrubbing stutters — the browser has to hunt keyframes backwards.)
  var heroVids = document.querySelectorAll('.hero-video video');
  if(heroVids.length === 2){
    var RATE = 1, FADE = 1.6, cur = 0, arming = false;
    var prime = function(v){ v.removeAttribute('loop'); try{ v.playbackRate = RATE; }catch(e){} };
    prime(heroVids[0]); prime(heroVids[1]);
    heroVids[0].addEventListener('loadedmetadata', function(){ prime(heroVids[0]); });
    heroVids[1].addEventListener('loadedmetadata', function(){ prime(heroVids[1]); });
    heroVids[0].addEventListener('play', function(){ prime(heroVids[0]); });
    heroVids[1].addEventListener('play', function(){ prime(heroVids[1]); });
    var p0 = heroVids[0].play(); if(p0 && p0.catch) p0.catch(function(){});

    var loop = function(){
      var a = heroVids[cur], b = heroVids[1 - cur], d = a.duration;
      // FADE is wall-clock; at playbackRate RATE the clip advances FADE*RATE seconds.
      if(!arming && d && isFinite(d) && a.currentTime >= d - FADE * RATE - 0.05){
        arming = true;
        b.currentTime = 0;
        prime(b);
        var p = b.play(); if(p && p.catch) p.catch(function(){});
        b.classList.remove('off');
        a.classList.add('off');
        var from = cur;
        setTimeout(function(){
          heroVids[from].pause();
          heroVids[from].currentTime = 0;
          cur = 1 - from;
          arming = false;
        }, FADE * 1000);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Sticky header
  var hdr = document.getElementById('hdr');
  if(hdr){
    var onScroll = function(){ hdr.classList.toggle('stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  // Scroll progress bar (left edge)
  var prog = document.createElement('div');
  prog.className = 'scrollprogress';
  var progFill = document.createElement('span');
  prog.appendChild(progFill);
  document.body.appendChild(prog);
  var updateProg = function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) : 0;
    progFill.style.height = (p * 100) + '%';
  };
  updateProg();
  window.addEventListener('scroll', updateProg, {passive:true});
  window.addEventListener('resize', updateProg);

  // Pause decorative SVG motion when reduced motion is preferred
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.hero-motif svg').forEach(function(svg){
      if(svg.pauseAnimations) svg.pauseAnimations();
    });
  }

  // Magnetic CTA buttons (desktop, motion allowed)
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
     !window.matchMedia('(hover: none)').matches){
    document.querySelectorAll('.nav-cta, .submit').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width/2);
        var my = e.clientY - (r.top + r.height/2);
        el.style.transform = 'translate(' + (mx*0.2).toFixed(1) + 'px,' + (my*0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = 'translate(0,0)'; });
    });
  }

  // Mobile menu toggle (hamburger ↔ X, panel + scroll lock)
  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');
  if(menuBtn && navLinks){
    var setMenu = function(open){
      navLinks.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    menuBtn.addEventListener('click', function(){ setMenu(!navLinks.classList.contains('open')); });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ setMenu(false); });
    });
  }

  // Dropdown (click on mobile, hover on desktop via CSS)
  document.querySelectorAll('.dropdown > button').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      btn.parentElement.classList.toggle('open');
    });
  });
  document.addEventListener('click', function(e){
    document.querySelectorAll('.dropdown.open').forEach(function(dd){
      if(!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  // Hero panel: scroll-linked parallax + subtle 3D tilt (home only, motion-safe)
  var heroPanel = document.querySelector('.hero-panel');
  var heroEl = document.querySelector('.hero');
  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
                 !window.matchMedia('(hover: none)').matches;
  if(heroPanel && heroEl && motionOK){
    var rows = heroPanel.querySelectorAll('.hp-row');
    var ticking = false;
    var applyHero = function(){
      ticking = false;
      var r = heroEl.getBoundingClientRect();
      var p = Math.min(Math.max(-r.top / (window.innerHeight * 0.85), 0), 1); // 0→1 as hero leaves
      heroPanel.style.transform =
        'perspective(1100px) translate3d(0,' + (-p*46).toFixed(1) + 'px,0)' +
        ' rotateX(' + (p*5).toFixed(2) + 'deg) rotateZ(' + (p*-0.6).toFixed(2) + 'deg)';
      heroPanel.style.boxShadow = '0 1px 0 rgba(16,27,45,.02),0 ' +
        (30 + p*26).toFixed(0) + 'px ' + (60 + p*30).toFixed(0) + 'px -30px rgba(16,27,45,' + (0.18 + p*0.12).toFixed(2) + ')';
      for(var i=0;i<rows.length;i++){
        rows[i].style.transform = 'translateX(' + (p * (i+1) * 3).toFixed(1) + 'px)';
      }
    };
    heroPanel.style.transition = 'box-shadow .2s ease';
    window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(applyHero); } }, {passive:true});
    window.addEventListener('resize', applyHero);
    applyHero();
  }

  // Count-up
  function animateCount(el){
    var to = parseInt(el.getAttribute('data-to'),10), dur = 1100, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(eased*to);
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll('.count');
  if(reduce){
    counts.forEach(function(el){ el.textContent = el.getAttribute('data-to'); });
  } else {
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    }, {threshold:0.6});
    counts.forEach(function(el){ cio.observe(el); });
  }

  // Subtle parallax on editorial imagery (motion-safe)
  if(!reduce){
    var pimgs = Array.prototype.slice.call(document.querySelectorAll('.photo-side img, .hero-overlay .bg img, .photo-wide img'));
    if(pimgs.length){
      var pticking = false;
      var applyParallax = function(){
        pticking = false;
        var vh = window.innerHeight;
        pimgs.forEach(function(el){
          var r = el.getBoundingClientRect();
          if(r.bottom < 0 || r.top > vh) return;
          var p = (r.top + r.height/2 - vh/2) / vh;
          el.style.transform = 'translateY(' + (p*-16).toFixed(1) + 'px) scale(1.06)';
        });
      };
      window.addEventListener('scroll', function(){ if(!pticking){ pticking = true; requestAnimationFrame(applyParallax); } }, {passive:true});
      window.addEventListener('resize', applyParallax);
      applyParallax();
    }
  }

  // Suurennettava kuva (lightbox) — informaatiopitoisille kuville (esim. Business Helsinki -kuvakaappaus)
  var zoomables = document.querySelectorAll('[data-zoomable]');
  if(zoomables.length){
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Suurennettu kuva');
    var overlayImg = document.createElement('img');
    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Sulje suurennettu kuva');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    overlay.appendChild(closeBtn);
    overlay.appendChild(overlayImg);
    document.body.appendChild(overlay);

    var lastFocused = null;
    var openLightbox = function(img){
      lastFocused = document.activeElement;
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };
    var closeLightbox = function(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if(lastFocused) lastFocused.focus();
    };
    zoomables.forEach(function(img){
      img.addEventListener('click', function(){ openLightbox(img); });
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.alt || 'Kuva') + ' — avaa suurempana');
      img.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(img); }
      });
    });
    overlay.addEventListener('click', function(e){ if(e.target === overlay || e.target === overlayImg) closeLightbox(); });
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox(); });
  }

  // Yhteydenottolomake: lähetys AJAXilla Formspreehen, ei uudelleenohjausta —
  // onnistumisnäkymä näytetään VASTA kun Formspree vahvistaa onnistuneen HTTP-vastauksen.
  var contactForm = document.getElementById('yhteydenotto');
  var successView = document.getElementById('yhteydenotto-success');
  if(contactForm && successView){
    var formSubmitting = false;
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(formSubmitting) return; // estä päällekkäiset lähetykset
      formSubmitting = true;

      var submitBtn = contactForm.querySelector('.submit');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Lähetetään…'; }
      var existingError = contactForm.querySelector('.form-error');
      if(existingError) existingError.remove();

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(res){
          // Formspreen oma sopimus: onnistunut lähetys = HTTP 2xx (res.ok).
          // Virhetilanteessa (esim. 422) Formspree palauttaa JSON-rungon, jossa on "errors".
          if(res.ok){
            contactForm.style.display = 'none';
            successView.hidden = false;
            successView.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'});
          } else {
            throw new Error('Formspree responded with status ' + res.status);
          }
        })
        .catch(function(){
          formSubmitting = false;
          if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
          var err = document.createElement('p');
          err.className = 'form-error';
          err.textContent = 'Viestin lähettäminen ei onnistunut. Yritä uudelleen tai ota yhteyttä sähköpostitse.';
          contactForm.appendChild(err);
          // Käyttäjän kirjoittamat tiedot jäävät tarkoituksella lomakkeeseen — ei form.reset()-kutsua.
        });
    });
  }

});
