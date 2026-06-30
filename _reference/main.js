/* IM Wealth Select® — main.js V6 */

/* ── LANGUAGE ROUTING (runs before DOMContentLoaded) ── */
(function () {
  'use strict';

  var VALID_LANGS = ['EN', 'FR', 'DE', 'IT'];

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var prefix = name + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(prefix) === 0) return decodeURIComponent(c.slice(prefix.length));
    }
    return '';
  }

  /* Detect current page language from folder prefix */
  function detectPageLang() {
    var segments = window.location.pathname.split('/').filter(Boolean);
    var first = (segments[0] || '').toLowerCase();
    if (first === 'fr') return 'FR';
    if (first === 'de') return 'DE';
    if (first === 'it') return 'IT';
    return 'EN';
  }

  /* Build URL for given lang on current page, preserving the page name */
  function urlForLang(lang) {
    var segments = window.location.pathname.split('/').filter(Boolean);
    var first = (segments[0] || '').toLowerCase();
    var isLangFolder = first === 'fr' || first === 'de' || first === 'it';
    var page = isLangFolder ? (segments[1] || 'index.html') : (segments[0] || 'index.html');

    if (lang === 'EN') return '/' + page;
    return '/' + lang.toLowerCase() + '/' + page;
  }

  /* Update visible lang label and active states */
  function syncLangUI(lang) {
    var label = document.querySelector('.nav__lang-label');
    if (label) label.textContent = lang;
    document.querySelectorAll('.nav__lang-option[data-lang]').forEach(function (opt) {
      var active = opt.dataset.lang === lang;
      opt.classList.toggle('is-active', active);
      opt.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.overlay__lang-item[data-lang]').forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.lang === lang);
    });
  }

  var currentLang = detectPageLang();
  var savedLang   = getCookie('imws_lang');

  if (savedLang && VALID_LANGS.indexOf(savedLang) !== -1) {
    if (savedLang !== currentLang) {
      window.location.replace(urlForLang(savedLang));
      return;
    }
    document.addEventListener('DOMContentLoaded', function () { syncLangUI(savedLang); });
  } else {
    var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    var detected = 'FR'; /* Default: French (marché suisse) */
    if (browserLang.startsWith('de'))      detected = 'DE';
    else if (browserLang.startsWith('it')) detected = 'IT';
    else if (browserLang.startsWith('en')) detected = 'EN';

    setCookie('imws_lang', detected, 365);

    if (detected !== currentLang) {
      window.location.replace(urlForLang(detected));
      return;
    }
    document.addEventListener('DOMContentLoaded', function () { syncLangUI(detected); });
  }

  /* Wire up lang option clicks to navigate + set cookie */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav__lang-option[data-lang], .overlay__lang-item[data-lang]').forEach(function (el) {
      el.addEventListener('click', function () {
        var lang = el.dataset.lang;
        if (VALID_LANGS.indexOf(lang) === -1) return;
        setCookie('imws_lang', lang, 365);
        window.location.href = el.dataset.href || urlForLang(lang);
      });
    });
  });

})();

/* ── MAIN UI ── */
(function () {
  'use strict';

  /* ── Hero video autoplay ─────────────────────── */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(() => {});
  }

  /* ── Contact form — AJAX submit ─────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formModal   = document.getElementById('form-modal');
  const modalClose  = document.getElementById('modal-close');

  if (contactForm && formModal) {
    const openModal = () => {
      formModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      formModal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          contactForm.reset();
          openModal();
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = (data.errors || []).map(err => err.message).join(', ')
            || 'Submission failed. Please try again.';
          alert(msg);
        }
      } catch (_) {
        alert('Network error. Please check your connection and try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    modalClose && modalClose.addEventListener('click', closeModal);
    formModal.addEventListener('click', (e) => { if (e.target === formModal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && formModal.classList.contains('is-open')) closeModal();
    });
  }

  /* ── Scroll nav shadow ────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger / overlay mobile ───────────────── */
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay   = document.querySelector('.nav__overlay');
  const overlayClose = document.querySelector('.overlay-close');

  const openOverlay = () => {
    hamburger && hamburger.classList.add('is-open');
    overlay && overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  const closeOverlay = () => {
    hamburger && hamburger.classList.remove('is-open');
    overlay && overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  hamburger   && hamburger.addEventListener('click', () =>
    overlay && overlay.classList.contains('is-open') ? closeOverlay() : openOverlay()
  );
  overlayClose && overlayClose.addEventListener('click', closeOverlay);

  overlay && overlay.querySelectorAll('.nav__link').forEach(l =>
    l.addEventListener('click', closeOverlay)
  );

  /* ── Language dropdown — desktop (open/close toggle only) ── */
  const langWidget = document.querySelector('.nav__lang');
  const langBtn    = langWidget && langWidget.querySelector('.nav__lang-btn');

  if (langWidget && langBtn) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langWidget.classList.toggle('is-open');
    });
    document.addEventListener('click', (e) => {
      if (!langWidget.contains(e.target)) langWidget.classList.remove('is-open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') langWidget.classList.remove('is-open');
    });
  }

  /* ── IntersectionObserver — scroll reveal ─────── */
  const ioOptions = { threshold: 0.12 };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, ioOptions);

  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stagger-item').forEach(item => {
          staggerObserver.observe(item);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  const staggerItemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        staggerItemObserver.unobserve(entry.target);
      }
    });
  }, ioOptions);

  document.querySelectorAll('.stagger-grid').forEach(grid => {
    grid.querySelectorAll('.stagger-item').forEach(item => staggerItemObserver.observe(item));
  });

  /* ── Spotlight cards ──────────────────────────── */
  document.querySelectorAll('.has-spotlight, .usecase-card, .tool-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

  /* ── Use-case card accordion ─────────────────────── */
  const usecaseCards = document.querySelectorAll('.usecase-card');
  if (usecaseCards.length) {
    usecaseCards.forEach(card => {
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');

      const toggle = () => {
        const wasExpanded = card.classList.contains('is-expanded');
        usecaseCards.forEach(c => {
          c.classList.remove('is-expanded');
          c.setAttribute('aria-expanded', 'false');
        });
        if (!wasExpanded) {
          card.classList.add('is-expanded');
          card.setAttribute('aria-expanded', 'true');
        }
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ── Tool-item accordion (Team page) ─────────── */
  const toolItems = document.querySelectorAll('.tool-item');
  if (toolItems.length) {
    toolItems.forEach(item => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-expanded', 'false');

      const toggle = () => {
        const wasExpanded = item.classList.contains('is-expanded');
        toolItems.forEach(t => {
          t.classList.remove('is-expanded');
          t.setAttribute('aria-expanded', 'false');
        });
        if (!wasExpanded) {
          item.classList.add('is-expanded');
          item.setAttribute('aria-expanded', 'true');
        }
      };

      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ── Approach-card step toggle (index.html) ─── */
  const approachCards = document.querySelectorAll('.approach-card');
  if (approachCards.length) {
    approachCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const isOpen = card.classList.contains('is-expanded');
        approachCards.forEach(el => el.classList.remove('is-expanded'));
        if (!isOpen) card.classList.add('is-expanded');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isOpen = card.classList.contains('is-expanded');
          approachCards.forEach(el => el.classList.remove('is-expanded'));
          if (!isOpen) card.classList.add('is-expanded');
        }
      });
    });
  }

  /* ── Profile bio expand (Team page) ─────────── */
  const profileContent = document.querySelector('.profile__content');
  if (profileContent) {
    const toggle = () => {
      const expanded = profileContent.classList.toggle('is-expanded');
      profileContent.setAttribute('aria-expanded', String(expanded));
    };
    profileContent.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      toggle();
    });
    profileContent.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  /* ── Cookie banner ────────────────────────────── */
  const cookie = document.getElementById('cookie-banner');
  const cookieBtn = document.getElementById('cookie-accept');
  if (cookie && cookieBtn) {
    cookieBtn.addEventListener('click', () => {
      cookie.style.display = 'none';
      try { localStorage.setItem('cookie-ok', '1'); } catch (_) {}
    });
    try {
      if (localStorage.getItem('cookie-ok')) cookie.style.display = 'none';
    } catch (_) {}
  }

  /* ── Stat counter count-up ───────────────────── */
  const statValues = document.querySelectorAll('.stat-bar__value');
  if (statValues.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);

        const el     = entry.target;
        const suffix = el.querySelector('em');
        const suffixText = suffix ? suffix.textContent : '';
        const raw    = el.textContent.replace(/[^0-9]/g, '');
        const target = parseInt(raw, 10);
        if (!target) return;

        const duration = 1200;
        const start = performance.now();
        const tick  = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          const current  = Math.round(ease * target);
          el.textContent = current.toLocaleString('en-US');
          if (suffixText) {
            const em = document.createElement('em');
            em.textContent = suffixText;
            el.appendChild(em);
          }
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => countObserver.observe(el));
  }

  /* ── Anchor nav active link ───────────────────── */
  const anchorItems = document.querySelectorAll('.anchor-nav__item[href^="#"]');
  if (anchorItems.length) {
    const anchorObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          anchorItems.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    anchorItems.forEach(a => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) anchorObserver.observe(target);
    });
  }

  /* ── Stepper accordion (Approach page) ──────── */
  const stepperTriggers = document.querySelectorAll('.stepper__trigger');
  if (stepperTriggers.length) {
    const openStep = (trigger) => {
      const step = trigger.closest('.stepper__step');
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      trigger.setAttribute('aria-expanded', 'true');
      step && step.classList.add('is-open');
      panel && panel.classList.add('is-open');
    };
    const closeStep = (trigger) => {
      const step = trigger.closest('.stepper__step');
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      trigger.setAttribute('aria-expanded', 'false');
      step && step.classList.remove('is-open');
      panel && panel.classList.remove('is-open');
    };

    stepperTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        stepperTriggers.forEach(t => closeStep(t));
        if (!isOpen) openStep(trigger);
      });
      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });

    // Open first step by default
    openStep(stepperTriggers[0]);
  }
})();
