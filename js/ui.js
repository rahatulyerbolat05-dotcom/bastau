/* Мелкие UI-помощники: h(), иконки, шторка, тост, вибро. Пользовательский текст — только через textContent. */
(function () {
  'use strict';

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'disabled' || k === 'checked' || k === 'readOnly' || k === 'hidden') el[k] = !!v;
        else if (k === 'value') el.value = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  var ICONS = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    review: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    sandbox: '<path d="M4 6l6 6-6 6"/><path d="M12 19h8"/>',
    progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2 2 2 0-3-1-5 1-8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    book: '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>'
  };
  function icon(name, size) {
    var s = size || 24;
    var span = document.createElement('span');
    span.className = 'ico';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
    return span;
  }

  function haptic(ms) {
    try {
      // без жеста пользователя Chrome пишет ошибку в консоль — не вызываем
      var active = !navigator.userActivation || navigator.userActivation.hasBeenActive;
      if (navigator.vibrate && active) navigator.vibrate(ms || 8);
    } catch (e) { /* ignore */ }
  }
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---------- шторка ---------- */
  var sheetCount = 0;
  function sheet(opts) {
    var prevFocus = document.activeElement;
    var titleId = 'sh-t-' + (++sheetCount);
    var closed = false;
    var backdrop = h('div', { class: 'sheet-backdrop' });
    var closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Закрыть', onclick: function () { close(); } }, icon('close', 20));
    var body = h('div', { class: 'sheet-body' }, opts.body);
    var foot = opts.actions && opts.actions.length ? h('div', { class: 'sheet-foot' }, opts.actions.map(function (a) {
      return h('button', { class: 'btn ' + (a.kind || 'secondary'), onclick: function () { if (a.onClick) a.onClick(close); else close(); } }, a.label);
    })) : null;
    var panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' },
      h('div', { class: 'grabber', 'aria-hidden': 'true' }),
      h('div', { class: 'sheet-head' }, h('h2', { id: titleId, class: 'sheet-title', text: opts.title }), closeBtn),
      body, foot);
    backdrop.appendChild(panel);
    backdrop.addEventListener('pointerdown', function (e) { if (e.target === backdrop) close(); });
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(backdrop);
    document.body.classList.add('has-sheet');
    void backdrop.offsetWidth;
    backdrop.classList.add('open');
    panel.focus();
    function close() {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey, true);
      backdrop.classList.remove('open');
      var done = function () { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); if (!document.querySelector('.sheet-backdrop')) document.body.classList.remove('has-sheet'); };
      if (reduceMotion.matches) done(); else setTimeout(done, 280);
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) { /* ignore */ }
      if (opts.onClose) opts.onClose();
    }
    return { close: close, el: panel };
  }

  function confirmSheet(opts) {
    return sheet({
      title: opts.title,
      body: h('p', { class: 'sheet-text', text: opts.text }),
      actions: [
        { label: opts.confirm, kind: opts.danger ? 'danger' : 'primary', onClick: function (close) { close(); opts.onConfirm(); } },
        { label: 'Отмена', kind: 'secondary' }
      ]
    });
  }

  /* ---------- тост ---------- */
  var toastEl = null, toastTimer = null;
  function toast(text) {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function downloadText(name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
  }

  window.UI = { h: h, clear: clear, icon: icon, haptic: haptic, sheet: sheet, confirmSheet: confirmSheet, toast: toast, downloadText: downloadText, reduceMotion: reduceMotion };
})();
