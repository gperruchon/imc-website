/* IM Consulting Services SA — consent.js
   Google Consent Mode v2 banner. No external dependency.

   The consent DEFAULT (everything denied) is declared inline in <head>, before
   gtag.js is requested — this file must never be responsible for that. It only
   renders the banner, sends the 'update' signal, and exposes withdrawal.
   Loaded on every page, including those that do not load main.js. */

(function () {
  'use strict';

  var KEY = 'imc-consent';

  function read()  { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v);     } catch (e) {} }
  function wipe()  { try { localStorage.removeItem(KEY);      } catch (e) {} }

  function update(state) {
    var v = state === 'granted' ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage:         v,
        ad_user_data:       v,
        ad_personalization: v,
        analytics_storage:  v
      });
    }
  }

  var banner = document.getElementById('cookie-banner');
  var accept = document.getElementById('cookie-accept');
  var reject = document.getElementById('cookie-reject');

  /* Status line on the privacy policy page. */
  function render() {
    var el = document.getElementById('consent-state');
    if (!el) return;
    var v = read();
    el.textContent =
      v === 'granted' ? 'Accepted — analytics and advertising cookies are active.' :
      v === 'denied'  ? 'Rejected — only essential storage is used.' :
                        'No choice recorded — analytics and advertising cookies are inactive.';
  }

  function decide(state) {
    save(state);
    update(state);
    if (banner) banner.hidden = true;
    render();
  }

  if (banner && !read()) banner.hidden = false;
  if (accept) accept.addEventListener('click', function () { decide('granted'); });
  if (reject) reject.addEventListener('click', function () { decide('denied'); });

  /* Withdrawal — clears the stored choice, reverts to denied, re-opens the banner. */
  window.imcWithdrawConsent = function () {
    wipe();
    update('denied');
    if (banner) banner.hidden = false;
    render();
  };

  var withdraw = document.getElementById('consent-withdraw');
  if (withdraw) withdraw.addEventListener('click', window.imcWithdrawConsent);

  render();
})();
