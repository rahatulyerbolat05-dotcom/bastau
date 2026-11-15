/* Хранилище: localStorage с защитой от порчи, квот и приватного режима.
   Прогресс гостя лежит под ключом bastau.v1, прогресс аккаунта — под bastau.v1.u.<uid> (см. js/account.js):
   так два человека на одном устройстве не смешивают прогресс, а выход из аккаунта возвращает гостевой. */
(function () {
  'use strict';
  var BASE = 'bastau.v1';
  var key = BASE;
  var memoryOnly = false;
  var saveTimer = null;
  var listeners = [];

  function fresh() {
    // epoch — момент последнего «стереть прогресс», prefsAt — момент последней смены настроек (нужны для слияния устройств)
    return { v: 1, lang: 'py', level: null, created: Date.now(), lessons: {}, cards: {}, days: [], minutes: {}, calib: [], notes: {}, plan: null, theme: 'auto', sandbox: {}, welcomed: false, epoch: 0, prefsAt: 0 };
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { memoryOnly = true; return fresh(); }
    if (!raw) return fresh();
    try {
      var s = JSON.parse(raw);
      if (window.Core.validateState(s)) return Object.assign(fresh(), s);
    } catch (e) { /* падаем ниже */ }
    try { localStorage.setItem(key + '.corrupt', raw); } catch (e) { /* ignore */ }
    return fresh();
  }

  var state = load();

  function write() {
    clearTimeout(saveTimer); saveTimer = null;
    if (memoryOnly) return false;
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch (e) { memoryOnly = true; document.dispatchEvent(new CustomEvent('bastau:storage-failed')); return false; }
  }
  function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* слушатель не должен ломать сохранение */ } }); }
  function flush() { var dirty = !!saveTimer; var ok = write(); if (dirty) notify(); return ok; }
  function save() { if (!saveTimer) saveTimer = setTimeout(flush, 120); }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

  function today() { return window.Core.dayKey(Date.now()); }

  var Store = {
    get: function () { return state; },
    save: save, flush: flush,
    isMemoryOnly: function () { return memoryOnly; },

    // слушатели вызываются после записи изменений (для облачного сохранения)
    onSave: function (fn) { listeners.push(fn); },
    // переключиться на прогресс аккаунта (uid) или гостя (null)
    use: function (uid) {
      flush();
      key = uid ? BASE + '.u.' + String(uid).replace(/[^A-Za-z0-9_-]/g, '') : BASE;
      state = load();
      return state;
    },
    account: function () { return key === BASE ? null : key.slice(BASE.length + 3); },
    // заменить прогресс целиком (результат слияния с облаком). silent: не будить слушателей — иначе пришедшее из облака ушло бы обратно
    replace: function (s, silent) {
      var sandbox = state.sandbox;
      state = Object.assign(fresh(), s);
      if (!s.sandbox) state.sandbox = sandbox || {};
      write();
      if (!silent) notify();
    },
    // стереть локальную копию прогресса аккаунта (после выхода, когда всё сохранено в облаке)
    drop: function (uid) {
      try { localStorage.removeItem(BASE + '.u.' + String(uid).replace(/[^A-Za-z0-9_-]/g, '')); } catch (e) { /* ignore */ }
    },

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
      var epoch = state.epoch || 0;
      state = Object.assign(fresh(), s);
      state.epoch = Math.max(epoch, state.epoch || 0); // иначе более раннее «стереть прогресс» отменило бы загрузку при слиянии с облаком
      write(); notify();
      return { ok: true };
    },
    // «Стереть прогресс»: новый пустой прогресс с отметкой времени — она сильнее всего, что было раньше, на всех устройствах аккаунта
    reset: function () {
      state = fresh();
      state.epoch = Date.now();
      try { localStorage.removeItem(key + '.corrupt'); } catch (e) { /* ignore */ }
      write(); notify();
    }
  };

  window.Store = Store;
})();
