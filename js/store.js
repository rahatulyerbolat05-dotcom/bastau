/* Хранилище: localStorage с защитой от порчи, квот и приватного режима. */
(function () {
  'use strict';
  var KEY = 'bastau.v1';
  var BAD_KEY = 'bastau.v1.corrupt';
  var memoryOnly = false;
  var saveTimer = null;

  function fresh() {
    return { v: 1, lang: 'py', level: null, created: Date.now(), lessons: {}, cards: {}, days: [], minutes: {}, calib: [], notes: {}, plan: null, theme: 'auto', sandbox: {}, welcomed: false };
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { memoryOnly = true; return fresh(); }
    if (!raw) return fresh();
    try {
      var s = JSON.parse(raw);
      if (window.Core.validateState(s)) return Object.assign(fresh(), s);
    } catch (e) { /* падаем ниже */ }
    try { localStorage.setItem(BAD_KEY, raw); } catch (e) { /* ignore */ }
    return fresh();
  }

  var state = load();

  function flush() {
    clearTimeout(saveTimer); saveTimer = null;
    if (memoryOnly) return false;
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { memoryOnly = true; document.dispatchEvent(new CustomEvent('bastau:storage-failed')); return false; }
  }
  function save() { if (!saveTimer) saveTimer = setTimeout(flush, 120); }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

  function today() { return window.Core.dayKey(Date.now()); }

  var Store = {
    get: function () { return state; },
    save: save, flush: flush,
    isMemoryOnly: function () { return memoryOnly; },

    lesson: function (id) {
      if (!state.lessons[id]) state.lessons[id] = { done: false, doneSteps: [], results: {}, startedAt: null, doneAt: null };
      return state.lessons[id];
    },

    touchDay: function () {
      var k = today();
      if (state.days.indexOf(k) === -1) state.days.push(k);
      save();
    },
    addSeconds: function (sec) {
      var k = today();
      state.minutes[k] = Math.round(((state.minutes[k] || 0) + sec / 60) * 100) / 100;
      Store.touchDay();
    },
    minutesToday: function () { return state.minutes[today()] || 0; },
    minutesWeek: function () {
      var total = 0, now = Date.now();
      for (var i = 0; i < 7; i++) total += state.minutes[window.Core.dayKey(window.Core.addDays(now, -i))] || 0;
      return total;
    },

    ensureCard: function (id) {
      if (!state.cards[id]) { state.cards[id] = window.Core.newCard(id, Date.now()); save(); }
      return state.cards[id];
    },
    reviewCard: function (id, outcome) {
      var c = state.cards[id] || window.Core.newCard(id, Date.now());
      state.cards[id] = window.Core.schedule(c, outcome, Date.now());
      save();
      return state.cards[id];
    },
    logCalib: function (conf, correct) {
      state.calib.push({ c: conf, ok: !!correct, t: Date.now() });
      if (state.calib.length > 300) state.calib.splice(0, state.calib.length - 300);
      save();
    },
    calibration: function () {
      var out = { sure: { n: 0, ok: 0 }, maybe: { n: 0, ok: 0 }, guess: { n: 0, ok: 0 } };
      state.calib.forEach(function (r) { var b = out[r.c]; if (b) { b.n++; if (r.ok) b.ok++; } });
      return out;
    },

    exportJSON: function () { return JSON.stringify(state, null, 2); },
    importJSON: function (text) {
      var s;
      try { s = JSON.parse(text); } catch (e) { return { ok: false, msg: 'Файл не похож на сохранение Бастау: это не JSON.' }; }
      if (!window.Core.validateState(s)) return { ok: false, msg: 'Файл не похож на сохранение Бастау или повреждён.' };
      state = Object.assign(fresh(), s);
      flush();
      return { ok: true };
    },
    reset: function () {
      state = fresh();
      try { localStorage.removeItem(KEY); localStorage.removeItem(BAD_KEY); } catch (e) { /* ignore */ }
    }
  };

  window.Store = Store;
})();
