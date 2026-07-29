/*==================================================
  MEMORY WEBSITE — SCRIPT.JS
  Parts 1–10 interactions & animations
==================================================*/

(function () {
  'use strict';

  /*==================================================
    UTILITIES
  ==================================================*/
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*==================================================
    PART 1 — INTRO SEQUENCE
  ==================================================*/
  const intro = $('#intro');
  const story = $('#story');

  function startIntro() {
    if (prefersReduced) { revealStory(); return; }
    // After lines finish (~4.6s), trigger the heart burst then reveal story
    setTimeout(() => {
      intro.classList.add('is-bursting');
      // burst particles from the heart
      spawnBurst();
    }, 4600);
    setTimeout(() => {
      intro.classList.add('is-done');
      revealStory();
    }, 5600);
  }

  function revealStory() {
    story.setAttribute('aria-hidden', 'false');
    story.classList.add('is-visible');
    // kick off observer now that story is visible
    initRevealObserver();
    // lock scroll at top
    window.scrollTo(0, 0);
  }

  // burst particles for the intro explosion
  function spawnBurst() {
    const layer = $('#floating-layer');
    const heartRect = $('.intro__heart').getBoundingClientRect();
    const cx = heartRect.left + heartRect.width / 2;
    const cy = heartRect.top + heartRect.height / 2;
    const count = 40;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'float-item';
      const size = rand(6, 16);
      el.style.cssText = `
        left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;
        background:radial-gradient(circle,#FFD9E4,#FF7BA9);
        box-shadow:0 0 ${size}px rgba(255,123,169,0.8);
        animation-duration:${rand(1,2)}s;animation-iteration-count:1;
      `;
      const angle = (Math.PI * 2 * i) / count;
      const dist = rand(120, 360);
      el.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ],
        { duration: 1400, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
      );
      layer.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  /*==================================================
    GLOBAL — PARTICLE CANVAS (soft floating motes)
  ==================================================*/
  const pCanvas = $('#particle-canvas');
  const pCtx = pCanvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function initParticles() {
    if (prefersReduced) return;
    const count = Math.floor(window.innerWidth / 18);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        r: rand(0.6, 2.6),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.25, -0.05),
        a: rand(0.1, 0.5),
        hue: rand(320, 280) // pink -> purple range
      });
    }
  }
  initParticles();

  function drawParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = pCanvas.height + 10; p.x = Math.random() * pCanvas.width; }
      if (p.x < -10) p.x = pCanvas.width + 10;
      if (p.x > pCanvas.width + 10) p.x = -10;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = `hsla(${p.hue},80%,80%,${p.a})`;
      pCtx.shadowBlur = 8;
      pCtx.shadowColor = `hsla(${p.hue},80%,80%,0.6)`;
      pCtx.fill();
    }
    pCtx.shadowBlur = 0;
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /*==================================================
    GLOBAL — FLOATING HEARTS / PETALS / SPARKLES
  ==================================================*/
  const floatLayer = $('#floating-layer');
  const floatShapes = ['heart', 'petal', 'sparkle', 'butterfly'];

  function spawnFloater() {
    if (prefersReduced) return;
    const el = document.createElement('span');
    const shape = floatShapes[Math.floor(Math.random() * floatShapes.length)];
    const size = rand(14, 30);
    const left = Math.random() * 100;
    const duration = rand(14, 26);
    el.className = 'float-item';
    el.style.left = left + 'vw';
    el.style.animationDuration = duration + 's';

    const colors = ['#FFB3CC', '#E0C3FC', '#C9A7F5', '#FFD9E4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (shape === 'heart') {
      el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${color}" opacity="0.7"/></svg>`;
    } else if (shape === 'petal') {
      el.style.width = size + 'px';
      el.style.height = (size * 1.4) + 'px';
      el.style.borderRadius = '50% 0 50% 0';
      el.style.background = `linear-gradient(135deg,${color},transparent)`;
      el.style.opacity = '0.6';
    } else if (shape === 'sparkle') {
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = `radial-gradient(circle,${color},transparent 70%)`;
      el.style.borderRadius = '50%';
    } else {
      el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 12c2-3 5-4 5-7 0-1.5-1-2.5-2.5-2.5C13 2.5 12 4 12 5c0-1-1-2.5-2.5-2.5C8 2.5 7 3.5 7 5c0 3 3 4 5 7zm0 0c-2 3-5 4-5 7 0 1.5 1 2.5 2.5 2.5 1.5 0 2.5-1.5 2.5-2.5 0 1 1 2.5 2.5 2.5 1.5 0 2.5-1 2.5-2.5 0-3-3-4-5-7z" fill="${color}" opacity="0.6"/></svg>`;
    }
    floatLayer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 500);
  }

  let floatTimer;
  function startFloaters() {
    if (prefersReduced) return;
    spawnFloater();
    floatTimer = setInterval(spawnFloater, 1400);
  }
  // start after intro so they don't show on black screen
  setTimeout(startFloaters, 5600);

  /*==================================================
    GLOBAL — CURSOR GLOW
  ==================================================*/
  const glow = $('#cursor-glow');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let glowX = mouseX, glowY = mouseY;

  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  function moveGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = `translate(${glowX}px,${glowY}px) translate(-50%,-50%)`;
    requestAnimationFrame(moveGlow);
  }
  if (!window.matchMedia('(pointer:coarse)').matches) moveGlow();

  /*==================================================
    GLOBAL — SMOOTH SCROLL FOR DATA-SCROLL LINKS
  ==================================================*/
  $$('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /*==================================================
    GLOBAL — REVEAL ON SCROLL (IntersectionObserver)
  ==================================================*/
  function initRevealObserver() {
    const reveals = $$('.reveal');
    if (!('IntersectionObserver' in window) || prefersReduced) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // stagger children inside grids
            if (entry.target.parentElement && entry.target.parentElement.classList.contains('reasons__grid')) {
              const idx = $$('.reason', entry.target.parentElement).indexOf(entry.target);
              entry.target.style.transitionDelay = (idx % 3) * 0.1 + 's';
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /*==================================================
    PART 2 — HERO MOUSE PARALLAX
  ==================================================*/
  const heroCard = $('.hero__card');
  const heroPhoto = $('.hero__photo');
  if (heroCard && !prefersReduced && !window.matchMedia('(pointer:coarse)').matches) {
    heroCard.addEventListener('mousemove', (e) => {
      const r = heroCard.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroPhoto.style.transform = `scale(1.12) translate(${px * -18}px,${py * -18}px)`;
      heroCard.style.transform = `perspective(1200px) rotateY(${px * 4}deg) rotateX(${py * -4}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroPhoto.style.transform = '';
      heroCard.style.transform = '';
    });
  }

  /*==================================================
    PART 3 — TIMELINE GLOWING LINE PROGRESS
  ==================================================*/
  const timelineLine = $('.timeline__line');
  const timelineTrack = $('.timeline__track');
  function updateTimelineLine() {
    if (!timelineTrack || !timelineLine) return;
    const r = timelineTrack.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const progress = clamp((viewportH / 2 - r.top) / r.height, 0, 1);
    timelineLine.style.height = (progress * 100) + '%';
  }
  window.addEventListener('scroll', updateTimelineLine, { passive: true });
  updateTimelineLine();

  /*==================================================
    PART 4 — GALLERY LIGHTBOX
  ==================================================*/
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');
  const polaroids = $$('.polaroid');
  let currentPolaroid = 0;

  function openLightbox(index) {
    currentPolaroid = index;
    const p = polaroids[index];
    const img = $('img', p);
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = p.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  function navLightbox(dir) {
    currentPolaroid = (currentPolaroid + dir + polaroids.length) % polaroids.length;
    openLightbox(currentPolaroid);
  }

  polaroids.forEach((p, i) => p.addEventListener('click', () => openLightbox(i)));
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxNext').addEventListener('click', () => navLightbox(1));
  $('#lightboxPrev').addEventListener('click', () => navLightbox(-1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navLightbox(1);
    if (e.key === 'ArrowLeft') navLightbox(-1);
  });

  /*==================================================
    PART 5 — MEMORY NOTES POPUP
  ==================================================*/
  const notePopup = $('#notePopup');
  const notePopupText = $('#notePopupText');
  const notes = $$('.note');

  function openNote(note) {
    notePopupText.textContent = note.dataset.note || '';
    notePopup.classList.add('is-open');
    notePopup.setAttribute('aria-hidden', 'false');
  }
  function closeNote() {
    notePopup.classList.remove('is-open');
    notePopup.setAttribute('aria-hidden', 'true');
  }
  notes.forEach((n) => n.addEventListener('click', () => openNote(n)));
  $('#notePopupClose').addEventListener('click', closeNote);
  notePopup.addEventListener('click', (e) => { if (e.target === notePopup) closeNote(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notePopup.classList.contains('is-open')) closeNote();
  });

  /*==================================================
    PART 6 — VIDEO PLAYER (autoplay when visible, pause offscreen)
  ==================================================*/
  const video = $('#memoryVideo');
  const videoPlayer = $('#videoPlayer');
  const videoFallback = $('#videoFallback');
  const videoPlayBtn = $('#videoPlay');
  const videoFill = $('#videoFill');
  const videoTime = $('#videoTime');
  const videoFullscreenBtn = $('#videoFullscreen');
  let videoLoadedSrc = false;

  function fmtTime(t) {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  video.addEventListener('loadeddata', () => {
    videoPlayer.classList.add('has-video');
    videoFallback.style.display = 'none';
    videoLoadedSrc = true;
  });
  video.addEventListener('error', () => {
    // keep fallback visible if no video file present
    videoPlayer.classList.remove('has-video');
  });

  function togglePlay() {
    if (!videoLoadedSrc) return;
    if (video.paused) video.play(); else video.pause();
  }
  videoPlayBtn.addEventListener('click', togglePlay);
  video.addEventListener('play', () => {
    $('.icon-play', videoPlayBtn).style.display = 'none';
    $('.icon-pause', videoPlayBtn).style.display = 'block';
  });
  video.addEventListener('pause', () => {
    $('.icon-play', videoPlayBtn).style.display = 'block';
    $('.icon-pause', videoPlayBtn).style.display = 'none';
  });
  video.addEventListener('timeupdate', () => {
    const pct = (video.currentTime / video.duration) * 100 || 0;
    videoFill.style.width = pct + '%';
    videoTime.textContent = fmtTime(video.currentTime) + ' / ' + fmtTime(video.duration);
  });
  $('#videoProgress').addEventListener('click', (e) => {
    if (!videoLoadedSrc || !video.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
  });
  videoFullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });

  // autoplay when visible, pause when offscreen
  if ('IntersectionObserver' in window) {
    const vIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoLoadedSrc) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.5, 1] }
    );
    vIO.observe(videoPlayer);
  }

  /*==================================================
    PART 7 — LETTER INK WRITING REVEAL
  ==================================================*/
  const letterPaper = $('#letterPaper');
  const letterBody = $('#letterBody');
  const letterSection = $('#letter');

  // wrap each word in a span for sequential fade-in
  function wrapWords() {
    const text = letterBody.textContent.trim();
    const words = text.split(/\s+/);
    letterBody.innerHTML = words
      .map((w) => `<span class="word">${w}</span>`)
      .join(' ');
  }
  wrapWords();

  function revealLetter() {
    const words = $$('.word', letterBody);
    if (prefersReduced) {
      words.forEach((w) => (w.style.opacity = 1));
      return;
    }
    let i = 0;
    const step = () => {
      const batch = 4;
      for (let k = 0; k < batch && i < words.length; k++, i++) {
        words[i].style.opacity = 1;
      }
      if (i < words.length) setTimeout(step, 60);
    };
    step();
  }

  if ('IntersectionObserver' in window) {
    const lIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealLetter();
            lIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    lIO.observe(letterSection);
  } else {
    revealLetter();
  }

  /*==================================================
    PART 9 — MUSIC PLAYER
  ==================================================*/
  const audio = $('#musicAudio');
  const musicPlay = $('#musicPlay');
  const musicPrev = $('#musicPrev');
  const musicNext = $('#musicNext');
  const musicFill = $('#musicFill');
  const musicCurrent = $('#musicCurrent');
  const musicDuration = $('#musicDuration');
  const musicTitle = $('#musicTitle');
  const musicArtist = $('#musicArtist');
  const musicDisc = $('.music__disc');

  // Easy to edit: add your songs here (paths relative to index.html)
  const playlist = [
    { src: 'music/Madhuvaramae - NaaSongs.mp3', title: 'Our Song', artist: 'Add your track to music/' },
    { src: 'music/song2.mp3', title: 'The Sunset Track', artist: 'Add your track to music/' },
    { src: 'music/song3.mp3', title: 'Coffee at Midnight', artist: 'Add your track to music/' }
  ];
  let trackIndex = 0;
  let playlistActive = false;

  function loadTrack(i) {
    trackIndex = (i + playlist.length) % playlist.length;
    const t = playlist[trackIndex];
    audio.src = t.src;
    musicTitle.textContent = t.title;
    musicArtist.textContent = t.artist;
    musicFill.style.width = '0%';
    musicCurrent.textContent = '0:00';
    musicDuration.textContent = '0:00';
  }
  loadTrack(0);

  function toggleMusic() {
    if (audio.paused) {
      audio.play().then(() => { playlistActive = true; }).catch(() => {
        // file missing — keep UI ready but show hint in artist line
        musicArtist.textContent = 'No file found — add ' + playlist[trackIndex].src;
      });
    } else {
      audio.pause();
    }
  }
  musicPlay.addEventListener('click', toggleMusic);
  musicPrev.addEventListener('click', () => { loadTrack(trackIndex - 1); if (playlistActive) audio.play(); });
  musicNext.addEventListener('click', () => { loadTrack(trackIndex + 1); if (playlistActive) audio.play(); });

  audio.addEventListener('play', () => {
    $('.icon-play', musicPlay).style.display = 'none';
    $('.icon-pause', musicPlay).style.display = 'block';
    musicDisc.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    $('.icon-play', musicPlay).style.display = 'block';
    $('.icon-pause', musicPlay).style.display = 'none';
    musicDisc.classList.remove('playing');
  });
  audio.addEventListener('loadedmetadata', () => {
    musicDuration.textContent = fmtTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    musicFill.style.width = pct + '%';
    musicCurrent.textContent = fmtTime(audio.currentTime);
  });
 audio.addEventListener("ended", () => {

    audio.currentTime = 0;

    audio.play();

});
  $('#musicProgress').addEventListener('click', (e) => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  /*==================================================
    PART 10 — FINAL SCENE STARRY SKY
  ==================================================*/
  const starCanvas = $('#star-canvas');
  const sCtx = starCanvas.getContext('2d');
  let stars = [];
  let finalHearts = [];

  function resizeStarCanvas() {
    const r = $('.final').getBoundingClientRect();
    starCanvas.width = r.width;
    starCanvas.height = r.height;
  }
  function initStars() {
    if (prefersReduced) return;
    resizeStarCanvas();
    const count = Math.floor((starCanvas.width * starCanvas.height) / 6000);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: rand(0.4, 1.8),
        tw: rand(0, Math.PI * 2),
        twSpeed: rand(0.01, 0.04)
      });
    }
    finalHearts = [];
  }

  function spawnFinalHeart() {
    if (prefersReduced) return;
    finalHearts.push({
      x: Math.random() * starCanvas.width,
      y: starCanvas.height + 20,
      r: rand(6, 14),
      vy: rand(-0.6, -1.2),
      vx: rand(-0.2, 0.2),
      a: rand(0.5, 0.9),
      rot: rand(-0.3, 0.3)
    });
  }

  function drawStarScene() {
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    // stars
    for (const s of stars) {
      s.tw += s.twSpeed;
      const alpha = 0.4 + Math.sin(s.tw) * 0.4;
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sCtx.fillStyle = `rgba(255,240,250,${alpha})`;
      sCtx.shadowBlur = 6;
      sCtx.shadowColor = 'rgba(201,167,245,0.8)';
      sCtx.fill();
    }
    sCtx.shadowBlur = 0;
    // floating hearts
    for (let i = finalHearts.length - 1; i >= 0; i--) {
      const h = finalHearts[i];
      h.y += h.vy;
      h.x += h.vx;
      sCtx.save();
      sCtx.translate(h.x, h.y);
      sCtx.rotate(h.rot);
      sCtx.scale(h.r / 12, h.r / 12);
      sCtx.beginPath();
      // symmetric heart path (scaled to a 12-unit frame, tip at bottom)
      const k = h.r / 12;
      sCtx.moveTo(0, 6 * k);
      sCtx.bezierCurveTo(0, 3 * k, -8 * k, 0, -8 * k, -4 * k);
      sCtx.bezierCurveTo(-8 * k, -9 * k, -3 * k, -10 * k, 0, -5 * k);
      sCtx.bezierCurveTo(3 * k, -10 * k, 8 * k, -9 * k, 8 * k, -4 * k);
      sCtx.bezierCurveTo(8 * k, 0, 0, 3 * k, 0, 6 * k);
      sCtx.fillStyle = `rgba(255,123,169,${h.a})`;
      sCtx.shadowBlur = 12;
      sCtx.shadowColor = 'rgba(255,123,169,0.7)';
      sCtx.fill();
      sCtx.restore();
      if (h.y < -30) finalHearts.splice(i, 1);
    }
    requestAnimationFrame(drawStarScene);
  }

  // only animate the star scene when the final section is on screen
  let finalActive = false;
  let heartSpawner;
  if ('IntersectionObserver' in window) {
    const fIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!finalActive) {
              finalActive = true;
              initStars();
              drawStarScene();
              if (!prefersReduced) heartSpawner = setInterval(spawnFinalHeart, 700);
            }
          } else {
            finalActive = false;
            if (heartSpawner) clearInterval(heartSpawner);
          }
        });
      },
      { threshold: 0.1 }
    );
    fIO.observe($('.final'));
  } else {
    initStars(); drawStarScene();
  }
  window.addEventListener('resize', () => { if (finalActive) initStars(); });

  /*==================================================
    KICKOFF
  ==================================================*/
  // start intro once DOM + fonts are ready
  if (document.readyState === 'complete') {
    startIntro();
  } else {
    window.addEventListener('load', startIntro);
  }
})();
