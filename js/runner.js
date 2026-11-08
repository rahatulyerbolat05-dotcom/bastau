/* Запуск кода: Python (Pyodide) и JavaScript в Worker'ах с таймаутом. */
(function () {
  'use strict';
  var TIMEOUT_MS = 5000;
  var BOOT_LIMIT_MS = 180000;
  var URLS = { py: 'js/py-worker.js', js: 'js/js-worker.js' };
  var workers = { py: null, js: null };
  var status = { py: 'idle', js: 'idle' };
  var booting = { py: null, js: null };
  var pending = {};
  var seq = 0;
  var listeners = [];

  function setStatus(lang, s) { status[lang] = s; listeners.forEach(function (fn) { try { fn(lang, s); } catch (e) { /* ignore */ } }); }

  function onMessage(lang, d) {
    if (d.type === 'result' && pending[d.id]) {
      var p = pending[d.id]; delete pending[d.id];
      clearTimeout(p.timer);
      p.resolve(d);
    }
  }

  function kill(lang) {
    if (workers[lang]) { workers[lang].terminate(); workers[lang] = null; }
    booting[lang] = null;
    setStatus(lang, 'idle');
  }

  function failAll(lang, msg) {
    Object.keys(pending).forEach(function (id) {
      var p = pending[id];
      if (p.lang !== lang) return;
      clearTimeout(p.timer); delete pending[id];
      p.resolve({ ok: false, out: '', loadError: true, error: msg });
    });
  }

  // Поднимает Worker и ждёт 'ready'
  function ensure(lang) {
    if (booting[lang]) return booting[lang];
    setStatus(lang, 'loading');
    booting[lang] = new Promise(function (resolve, reject) {
      var w;
      try { w = new Worker(URLS[lang]); } catch (e) { setStatus(lang, 'error'); booting[lang] = null; reject(e); return; }
      workers[lang] = w;
      var bootTimer = setTimeout(function () {
        kill(lang); setStatus(lang, 'error'); reject(new Error('Загрузка заняла слишком много времени.'));
      }, BOOT_LIMIT_MS);
      w.onmessage = function (ev) {
        var d = ev.data;
        if (d.type === 'ready') { clearTimeout(bootTimer); setStatus(lang, 'ready'); resolve(w); }
        else if (d.type === 'initError') { clearTimeout(bootTimer); kill(lang); setStatus(lang, 'error'); reject(new Error(d.message)); }
        else onMessage(lang, d);
      };
      w.onerror = function (ev) {
        clearTimeout(bootTimer);
        var msg = (ev && ev.message) || 'Не удалось запустить исполнитель кода.';
        failAll(lang, msg); kill(lang); setStatus(lang, 'error'); reject(new Error(msg));
      };
      w.postMessage({ type: 'init' });
    });
    return booting[lang];
  }

  function run(lang, code) {
    var fixed = window.Core.fixCurly(code);
    return ensure(lang).then(function (w) {
      return new Promise(function (resolve) {
        var id = ++seq;
        var timer = setTimeout(function () {
          delete pending[id];
          kill(lang);
          resolve({ ok: false, out: '', timedOut: true, curly: fixed.changed, error: 'Программа работала дольше 5 секунд и была остановлена. Возможно, в ней бесконечный цикл.' });
          ensure(lang).catch(function () { /* прогреем заново в фоне */ });
        }, TIMEOUT_MS);
        pending[id] = { resolve: function (d) { d.curly = fixed.changed; resolve(d); }, timer: timer, lang: lang };
        w.postMessage({ type: 'run', id: id, code: fixed.code });
      });
    }, function (err) {
      return { ok: false, out: '', loadError: true, curly: fixed.changed, error: 'Не удалось загрузить ' + (lang === 'py' ? 'Python' : 'JavaScript') + ': ' + (err && err.message || err) };
    });
  }

  window.Runner = {
    run: run,
    preload: function (lang) { return ensure(lang).catch(function () { /* статус сообщит */ }); },
    status: function (lang) { return status[lang]; },
    onStatus: function (fn) { listeners.push(fn); },
    TIMEOUT_MS: TIMEOUT_MS
  };
})();
