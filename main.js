/* IM Consulting Services SA — main.js */

(function () {
  'use strict';

  /* ── Hero video autoplay ─────────────────────── */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(() => {});
  }

  /* ── Scroll nav shadow ────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger / overlay mobile ───────────────── */
  const hamburger   = document.querySelector('.nav__hamburger');
  const overlay     = document.querySelector('.nav__overlay');
  const overlayClose = document.querySelector('.overlay-close');

  const openOverlay = () => {
    hamburger && hamburger.classList.add('is-open');
    overlay   && overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  const closeOverlay = () => {
    hamburger && hamburger.classList.remove('is-open');
    overlay   && overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  hamburger    && hamburger.addEventListener('click', () =>
    overlay && overlay.classList.contains('is-open') ? closeOverlay() : openOverlay()
  );
  overlayClose && overlayClose.addEventListener('click', closeOverlay);
  overlay && overlay.querySelectorAll('.nav__link').forEach(l =>
    l.addEventListener('click', closeOverlay)
  );

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

  document.querySelectorAll('.stagger-grid').forEach(grid => {
    grid.querySelectorAll('.stagger-item').forEach(item => {
      const staggerItemObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); staggerItemObserver.unobserve(e.target); }
        });
      }, ioOptions);
      staggerItemObserver.observe(item);
    });
  });

  /* ── Cookie banner ────────────────────────────── */
  const cookie    = document.getElementById('cookie-banner');
  const cookieBtn = document.getElementById('cookie-accept');
  if (cookie && cookieBtn) {
    cookieBtn.addEventListener('click', () => {
      cookie.style.display = 'none';
      try { localStorage.setItem('cookie-ok', '1'); } catch (_) {}
    });
    try { if (localStorage.getItem('cookie-ok')) cookie.style.display = 'none'; } catch (_) {}
  }

  /* ── IMC MODAL: Swiss Investor Map ─────────────── */
  window.openModal = function () {
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeModal = function () {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  const modalEl = document.getElementById('modal');
  if (modalEl) {
    modalEl.addEventListener('click', e => { if (e.target === modalEl) window.closeModal(); });
    const modalForm = document.getElementById('modal-form');
    if (modalForm) {
      modalForm.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData();
        ['name','function','company','email','strategy','aum','domicile'].forEach(k => {
          if (e.target[k]) fd.append(k, e.target[k].value);
        });
        fd.append('_subject', 'Swiss Investor Map Request — IM Consulting Services');
        fd.append('_captcha', 'false');
        fetch('https://formsubmit.co/ajax/gp@im-consultingservices.ch', {
          method: 'POST', body: fd, headers: { Accept: 'application/json' }
        }).catch(() => {});
        modalEl.querySelector('.modal-ttl').textContent = 'Thank you.';
        modalEl.querySelector('.modal-desc').textContent = 'We will contact you within 24 hours.';
        modalEl.querySelector('.mf-grid').style.display = 'none';
        const fine = modalEl.querySelector('.mfine');
        if (fine) fine.style.display = 'none';
      });
    }
  }

  /* ── IMC MODAL: Download ────────────────────────── */
  window.openDownloadModal = function (doc) {
    const dlDoc = document.getElementById('dl-doc-field');
    const dlTtl = document.getElementById('dl-modal-ttl');
    const dlForm = document.getElementById('dl-form');
    const dlSuccess = document.getElementById('dl-success');
    if (dlDoc) dlDoc.value = doc;
    if (dlTtl) dlTtl.textContent = 'Request: ' + doc;
    if (dlForm) dlForm.style.display = '';
    if (dlSuccess) dlSuccess.style.display = 'none';
    document.getElementById('dl-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeDownloadModal = function () {
    document.getElementById('dl-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  const dlModal = document.getElementById('dl-modal');
  if (dlModal) {
    dlModal.addEventListener('click', e => { if (e.target === dlModal) window.closeDownloadModal(); });
    const dlForm = document.getElementById('dl-form');
    if (dlForm) {
      dlForm.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData();
        const form = e.target;
        ['name','function','company','email','document'].forEach(k => {
          if (form[k]) fd.append(k, form[k].value);
        });
        fd.append('_subject', 'Document Request: ' + (form.document ? form.document.value : '') + ' — IM Consulting Services');
        fd.append('_captcha', 'false');
        fetch('https://formsubmit.co/ajax/gp@im-consultingservices.ch', {
          method: 'POST', body: fd, headers: { Accept: 'application/json' }
        }).catch(() => {});
        form.style.display = 'none';
        const s = document.getElementById('dl-success');
        if (s) s.style.display = 'block';
        setTimeout(() => window.closeDownloadModal(), 2500);
      });
    }
  }

  /* ── IMC MODAL: Contact ─────────────────────────── */
  window.openContactModal = function () {
    document.getElementById('contact-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeContactModal = function () {
    document.getElementById('contact-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  const contactModal = document.getElementById('contact-modal');
  if (contactModal) {
    contactModal.addEventListener('click', e => { if (e.target === contactModal) window.closeContactModal(); });
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('_subject', 'New Enquiry — IM Consulting Services');
        fd.append('_captcha', 'false');
        fetch('https://formsubmit.co/ajax/gp@im-consultingservices.ch', {
          method: 'POST', body: fd, headers: { Accept: 'application/json' }
        }).catch(() => {});
        contactModal.querySelector('.modal-ttl').textContent = 'Thank you.';
        contactModal.querySelector('.modal-desc').textContent = 'We will respond within 24 hours.';
        contactForm.style.display = 'none';
        const fine = contactModal.querySelector('.mfine');
        if (fine) fine.style.display = 'none';
      });
    }
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['modal','dl-modal','contact-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.classList.contains('open')) {
          el.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  });

})();
