/* Root to Rise — standalone site behaviour (no framework, no login). */
(function () {
  'use strict';
  var d = document;
  var cfg = {
    formEmail: typeof RTR_FORM_EMAIL === 'string' ? RTR_FORM_EMAIL.trim() : '',
    donateUrl: typeof RTR_SQUARE_DONATE_URL === 'string' ? RTR_SQUARE_DONATE_URL.trim() : '',
    phone: typeof RTR_PHONE === 'string' ? RTR_PHONE.trim() : '',
    email: typeof RTR_EMAIL === 'string' ? RTR_EMAIL.trim() : ''
  };
  var formReady = !!cfg.formEmail && !/REPLACE_ME|example\.com/i.test(cfg.formEmail);
  var scriptEl = d.currentScript || d.querySelector('script[src*="rtr.js"]');
  var BASE = scriptEl ? scriptEl.src.replace(/assets\/rtr\.js.*$/, '') : '/';
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var btn = $('[data-rtr-menu-btn]'), panel = $('[data-rtr-menu]');
    if (!btn || !panel) return;
    var openIcon = btn.innerHTML;
    var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
    function set(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.innerHTML = open ? closeIcon : openIcon;
    }
    btn.setAttribute('aria-controls', panel.id);
    set(false);
    btn.addEventListener('click', function () { set(panel.hidden); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
  }

  /* ---------- contact placeholders ---------- */
  function initContact() {
    $$('[data-rtr-phone]').forEach(function (el) {
      if (!cfg.phone) { el.hidden = true; return; }
      var a = el.querySelector('a') || el;
      a.textContent = cfg.phone;
      var tel = cfg.phone.replace(/[^\d+]/g, '');
      if (/^\d{10}$/.test(tel)) tel = '+1' + tel; /* US number -> E.164 */
      if (a.tagName === 'A') a.href = 'tel:' + tel;
      el.hidden = false;
    });
    $$('[data-rtr-email]').forEach(function (el) {
      if (!cfg.email) { el.hidden = true; return; }
      var a = el.querySelector('a') || el;
      a.textContent = cfg.email;
      if (a.tagName === 'A') a.href = 'mailto:' + cfg.email;
      el.hidden = false;
    });
    $$('[data-rtr-if-contact]').forEach(function (el) { el.hidden = !(cfg.phone || cfg.email); });
  }

  /* ---------- donate ---------- */
  function initDonate() {
    $$('[data-rtr-donate]').forEach(function (el) {
      if (cfg.donateUrl) {
        el.setAttribute('href', cfg.donateUrl);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
        el.removeAttribute('aria-disabled');
        el.classList.remove('rtr-disabled');
        el.textContent = el.getAttribute('data-rtr-donate') || 'Donate online';
      } else {
        el.setAttribute('aria-disabled', 'true');
        el.classList.add('rtr-disabled');
        el.textContent = 'Online giving coming soon — call or email us';
        el.setAttribute('href', BASE + 'contact/');
      }
    });
    $$('[data-rtr-donate-ready]').forEach(function (el) { el.hidden = !cfg.donateUrl; });
    $$('[data-rtr-donate-soon]').forEach(function (el) { el.hidden = !!cfg.donateUrl; });
  }

  /* ---------- gift tiers (pledge fallback) ---------- */
  function initTiers() {
    var form = $('[data-rtr-pledge]');
    if (!form) return;
    var amount = form.querySelector('input[name="amount"]');
    var custom = form.querySelector('#custom-amount');
    var on = 'border-moss bg-moss text-cream', off = 'border-sand bg-paper text-ink hover:border-moss/40';
    function paint(group, active) {
      $$('[data-' + group + ']', form).forEach(function (b) {
        var is = b === active;
        b.setAttribute('aria-pressed', is ? 'true' : 'false');
        (is ? off : on).split(' ').forEach(function (c) { b.classList.remove(c); });
        (is ? on : off).split(' ').forEach(function (c) { b.classList.add(c); });
      });
    }
    $$('[data-tier]', form).forEach(function (b) {
      if (b.classList.contains('bg-moss')) b.setAttribute('aria-pressed', 'true'); else b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { amount.value = b.getAttribute('data-tier'); if (custom) custom.value = ''; paint('tier', b); });
    });
    if (custom) custom.addEventListener('input', function () { if (custom.value) { amount.value = custom.value; paint('tier', null); } });
    var freq = form.querySelector('input[name="frequency"]');
    $$('[data-freq]', form).forEach(function (b) {
      b.setAttribute('aria-pressed', b.classList.contains('bg-moss') ? 'true' : 'false');
      b.addEventListener('click', function () { freq.value = b.getAttribute('data-freq'); paint('freq', b); });
    });
  }

  /* ---------- forms -> FormSubmit ---------- */
  function initForms() {
    $$('form[data-rtr-form]').forEach(function (form) {
      var status = form.querySelector('[data-rtr-status]') || (form.nextElementSibling && form.nextElementSibling.hasAttribute('data-rtr-status') ? form.nextElementSibling : null);
      if (!formReady) {
        var n = d.createElement('p');
        n.className = 'rtr-notice';
        n.setAttribute('role', 'note');
        n.textContent = 'This form is not yet connected. Please come to Recovery Breakfast at Cape Island Cafe, or check back soon.';
        form.insertBefore(n, form.firstChild);
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!formReady) { say('This form is not yet connected, so nothing was sent.', true); return; }
        if (form.querySelector('input[name="_honey"]') && form.querySelector('input[name="_honey"]').value) return;
        var data = {};
        $$('input, select, textarea', form).forEach(function (el) {
          if (!el.name || el.name === '_honey') return;
          if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
          data[el.name] = data[el.name] ? data[el.name] + ', ' + el.value : el.value;
        });
        data._subject = 'Root to Rise website — ' + (form.getAttribute('data-rtr-form') || 'message') + (data.name ? ' from ' + data.name : '');
        data._template = 'table';
        data._captcha = 'false';
        data.page = location.href;
        if (data.email) data._replyto = data.email;
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.setAttribute('data-label', btn.textContent); btn.textContent = 'Sending…'; }
        say('', false);
        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(cfg.formEmail), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (j) {
            if (j && (j.success === true || j.success === 'true')) {
              var ok = form.getAttribute('data-rtr-ok') || 'Thank you — we have it. Expect a human reply.';
              var box = d.createElement('div');
              box.className = 'rtr-success';
              box.setAttribute('role', 'status');
              box.setAttribute('tabindex', '-1');
              box.innerHTML = '<p class="font-display text-xl text-ink">Thank you.</p><p class="mt-2 text-sm text-sage">' + esc(ok) + '</p>';
              form.parentNode.replaceChild(box, form);
              box.focus();
            } else { fail(); }
          }).catch(fail);
        function fail() {
          if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-label'); }
          say('We could not send that just now. ' + (cfg.email ? 'Please email ' + cfg.email + ', or ' : 'Please ') + 'try again in a moment. In a crisis, call or text 988.', true);
        }
      });
      function say(msg, err) {
        if (!status) return;
        status.textContent = msg;
        status.className = err ? 'rtr-status rtr-err' : 'rtr-status';
      }
    });
  }

  /* ---------- resources directory filter ---------- */
  function initResources() {
    var list = $('[data-rtr-res-list]');
    if (!list) return;
    var q = $('[data-rtr-res-search]'), cat = 'all';
    var on = 'border-moss bg-moss text-cream', off = 'border-sand bg-paper text-ink hover:border-moss/40';
    var btns = $$('[data-rtr-cat]');
    var count = $('[data-rtr-res-count]');
    function apply() {
      var t = (q && q.value || '').trim().toLowerCase(), shown = 0;
      $$('li[data-cat]', list).forEach(function (li) {
        var ok = (cat === 'all' || li.getAttribute('data-cat') === cat) && (!t || li.textContent.toLowerCase().indexOf(t) !== -1);
        li.hidden = !ok; if (ok) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' resource' : ' resources') + ' shown';
    }
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-rtr-cat') === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-rtr-cat');
        btns.forEach(function (x) {
          var is = x === b; x.setAttribute('aria-pressed', is ? 'true' : 'false');
          (is ? off : on).split(' ').forEach(function (c) { x.classList.remove(c); });
          (is ? on : off).split(' ').forEach(function (c) { x.classList.add(c); });
        });
        apply();
      });
    });
    if (q) q.addEventListener('input', apply);
    var guide = $('[data-rtr-guide]');
    if (guide) guide.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = guide.querySelector('textarea').value.trim();
      if (v && window.RTR_CHAT) window.RTR_CHAT.ask(v);
    });
  }

  /* ---------- FAQ deep links ---------- */
  function initFaq() {
    if (location.hash) {
      var el = d.getElementById(location.hash.slice(1));
      if (el && el.tagName === 'DETAILS') el.open = true;
    }
  }

  /* ---------- chat helper ---------- */
  var STOP = 'a an the is are am do does did i me my we you your our of to in on at for and or be can how what when where who why will with it this that there have has get about if any just'.split(' ');
  function words(s) {
    return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(function (w) { return w.length > 1 && STOP.indexOf(w) === -1; })
      .map(function (w) { return w.length > 4 ? w.replace(/(ing|ers|er|es|s)$/, '') : w; });
  }
  function match(q) {
    var faq = window.RTR_FAQ || [], qw = words(q), best = null, bestScore = 0;
    if (!qw.length) return null;
    faq.forEach(function (f) {
      var kw = words(f.keywords.join(' ')), qs = words(f.q), score = 0;
      qw.forEach(function (w) {
        if (kw.indexOf(w) !== -1) score += 3;
        else if (kw.some(function (k) { return k.length > 3 && (k.indexOf(w) === 0 || w.indexOf(k) === 0); })) score += 2;
        if (qs.indexOf(w) !== -1) score += 1;
      });
      if (f.priority && score > 0) score += f.priority;
      if (score > bestScore) { bestScore = score; best = f; }
    });
    return bestScore >= 2 ? best : null;
  }

  function initChat() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var canSpeak = 'speechSynthesis' in window;
    var faq = window.RTR_FAQ || [];
    var wrap = d.createElement('div');
    wrap.className = 'rtr-chat';
    wrap.innerHTML =
      '<button type="button" class="rtr-chat-fab" aria-expanded="false" aria-controls="rtr-chat-panel">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span>Ask us</span></button>' +
      '<section id="rtr-chat-panel" class="rtr-chat-panel" role="dialog" aria-modal="false" aria-labelledby="rtr-chat-title" hidden>' +
        '<header class="rtr-chat-head"><div><h2 id="rtr-chat-title">Ask Root to Rise</h2><p>Answers from our FAQ. In a crisis, call or text <a href="tel:988">988</a>.</p></div>' +
          '<div class="rtr-chat-tools">' +
            (canSpeak ? '<button type="button" class="rtr-icon-btn" data-rtr-speak aria-pressed="false" aria-label="Read answers aloud" title="Read answers aloud"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg></button>' : '') +
            '<button type="button" class="rtr-icon-btn" data-rtr-close aria-label="Close chat" title="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
          '</div></header>' +
        '<div class="rtr-chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
        '<div class="rtr-chat-chips" aria-label="Common questions"></div>' +
        '<form class="rtr-chat-form" autocomplete="off">' +
          '<label for="rtr-chat-input" class="sr-only">Type your question</label>' +
          '<input id="rtr-chat-input" type="text" placeholder="Type a question…" maxlength="300" enterkeyhint="send">' +
          (SR ? '<button type="button" class="rtr-icon-btn" data-rtr-mic aria-pressed="false" aria-label="Ask with your voice" title="Ask with your voice"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/></svg></button>' : '') +
          '<button type="submit" class="rtr-send" aria-label="Send question">Send</button>' +
        '</form>' +
      '</section>';
    d.body.appendChild(wrap);
    var fab = $('.rtr-chat-fab', wrap), panel = $('.rtr-chat-panel', wrap), log = $('.rtr-chat-log', wrap);
    var input = $('#rtr-chat-input', wrap), chips = $('.rtr-chat-chips', wrap), form = $('.rtr-chat-form', wrap);
    var speakBtn = $('[data-rtr-speak]', wrap), micBtn = $('[data-rtr-mic]', wrap);
    var speaking = false, greeted = false;

    faq.filter(function (f) { return f.chip; }).forEach(function (f) {
      var b = d.createElement('button'); b.type = 'button'; b.textContent = f.chip;
      b.addEventListener('click', function () { ask(f.q); });
      chips.appendChild(b);
    });

    function add(who, html, plain) {
      var m = d.createElement('div');
      m.className = 'rtr-msg rtr-' + who;
      m.innerHTML = html;
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      if (who === 'bot' && speaking && canSpeak && plain) {
        try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(plain); u.lang = 'en-US'; u.rate = 1; speechSynthesis.speak(u); } catch (e) {}
      }
    }
    function open() {
      panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); wrap.classList.add('is-open');
      if (!greeted) { greeted = true; add('bot', '<p>Hi — ask anything about Root to Rise: breakfast, coaching, volunteering, giving. Tap a question below or type your own.</p>', 'Hi. Ask anything about Root to Rise.'); }
      input.focus();
    }
    function close() {
      panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); wrap.classList.remove('is-open');
      if (canSpeak) try { speechSynthesis.cancel(); } catch (e) {}
      stopMic(); fab.focus();
    }
    function link(path, label) { return '<a href="' + BASE + path + '">' + esc(label) + '</a>'; }
    function ask(q) {
      q = String(q || '').trim(); if (!q) return;
      if (panel.hidden) open();
      add('user', '<p>' + esc(q) + '</p>');
      var crisis = /\b(suicid\w*|kill (my)?self|end (my|it)|overdos\w*|od\b|hurt (my)?self|self.?harm|emergenc\w*|crisis|die|dying|want to die)\b/i.test(q);
      var f = match(q);
      if (crisis && (!f || f.id !== 'crisis')) f = faq.filter(function (x) { return x.id === 'crisis'; })[0] || f;
      if (f) {
        var more = f.link ? '<p class="rtr-more">' + link(f.link[0], f.link[1]) + '</p>' : '';
        var body = String(f.html).replace(/href="(?!https?:|tel:|sms:|mailto:|#|\/)/g, 'href="' + BASE);
        add('bot', '<p>' + body + '</p>' + more, f.a);
      } else {
        add('bot', '<p>I don\'t have an answer for that one yet. A real person can help: ' + link('contact/', 'send us a message') + '.</p><p>If you are in crisis, call or text <a href="tel:988">988</a> any time, or 911 in an emergency.</p>',
          'I don\'t have an answer for that one yet. Please send us a message through the contact form. If you are in crisis, call or text 9 8 8.');
      }
    }
    fab.addEventListener('click', function () { panel.hidden ? open() : close(); });
    $('[data-rtr-close]', wrap).addEventListener('click', close);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
    if (speakBtn) speakBtn.addEventListener('click', function () {
      speaking = !speaking; speakBtn.setAttribute('aria-pressed', speaking ? 'true' : 'false');
      speakBtn.setAttribute('aria-label', speaking ? 'Stop reading answers aloud' : 'Read answers aloud');
      if (!speaking) try { speechSynthesis.cancel(); } catch (e) {}
      else { var last = $$('.rtr-bot', log).pop(); if (last) { try { var u = new SpeechSynthesisUtterance(last.textContent); u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) {} } }
    });
    var rec = null;
    function stopMic() { if (rec) { try { rec.stop(); } catch (e) {} } }
    if (micBtn && SR) micBtn.addEventListener('click', function () {
      if (rec) { stopMic(); return; }
      try {
        rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
        micBtn.setAttribute('aria-pressed', 'true'); micBtn.classList.add('is-live'); input.placeholder = 'Listening…';
        var finalText = '';
        rec.onresult = function (ev) {
          var t = ''; for (var i = 0; i < ev.results.length; i++) { t += ev.results[i][0].transcript; if (ev.results[i].isFinal) finalText = t; }
          input.value = t;
        };
        rec.onerror = function (ev) { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') add('bot', '<p>Microphone access was blocked. You can type your question instead.</p>'); };
        rec.onend = function () {
          micBtn.setAttribute('aria-pressed', 'false'); micBtn.classList.remove('is-live'); input.placeholder = 'Type a question…'; rec = null;
          var v = (finalText || input.value).trim(); if (v) { input.value = ''; ask(v); }
        };
        rec.start();
      } catch (e) { rec = null; micBtn.setAttribute('aria-pressed', 'false'); micBtn.classList.remove('is-live'); }
    });
    $$('[data-rtr-open-chat]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    window.RTR_CHAT = { open: open, close: close, ask: ask, match: match };
  }

  function boot() { initMenu(); initContact(); initDonate(); initTiers(); initForms(); initResources(); initFaq(); initChat(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
