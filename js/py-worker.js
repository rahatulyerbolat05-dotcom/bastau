/* Python в браузере через Pyodide. Версия закреплена; грузится с jsDelivr при первом запуске.
   Worker не имеет доступа к localStorage и DOM страницы. */
'use strict';
var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
var py = null, loading = null, dirty = false;
var MAX_LINES = 2000, MAX_CHARS = 200000;
var LIMIT_MSG = 'программа вывела больше ' + MAX_LINES + ' строк и была остановлена. Похоже, цикл не заканчивается.';

function boot() {
  if (py) return Promise.resolve(py);
  if (!loading) {
    loading = (function () {
      importScripts(PYODIDE_URL + 'pyodide.js');
      return self.loadPyodide({ indexURL: PYODIDE_URL }).then(function (p) { py = p; return p; });
    })();
    loading.catch(function () { loading = null; });
  }
  return loading;
}

// Оставляем в трейсбэке только кадры пользовательского кода
function cleanTraceback(msg) {
  var lines = String(msg).split('\n'), out = [], keep = false;
  lines.forEach(function (l) {
    if (/^\s+File "/.test(l)) {
      keep = l.indexOf('"<exec>"') !== -1;
      if (keep) out.push(l.replace('"<exec>"', '"main.py"'));
      return;
    }
    if (/^\s/.test(l)) { if (keep) out.push(l); return; }
    keep = false;
    out.push(l);
  });
  return out.join('\n').trim();
}

self.onmessage = function (e) {
  var m = e.data;
  if (m.type === 'init') {
    boot().then(function () { self.postMessage({ type: 'ready' }); })
      .catch(function (err) { self.postMessage({ type: 'initError', message: String(err && err.message || err) }); });
    return;
  }
  if (m.type === 'run') {
    boot().then(function (p) {
      // после оборванного вывода в буфере Pyodide остаётся хвост — сливаем его в никуда, чтобы он не попал в следующий запуск
      if (dirty) {
        p.setStdout({ batched: function () { } });
        p.setStderr({ batched: function () { } });
        try { p.runPython('import sys\nprint()\nsys.stdout.flush()\nsys.stderr.flush()'); } catch (e) { /* не критично */ }
        dirty = false;
      }
      var out = '', lines = 0, limited = false;
      function add(s) {
        if (limited) throw new Error(LIMIT_MSG);
        out += s + '\n';
        if (++lines > MAX_LINES || out.length > MAX_CHARS) { limited = true; dirty = true; throw new Error(LIMIT_MSG); }
      }
      p.setStdout({ batched: add });
      p.setStderr({ batched: add });
      p.setStdin({ stdin: function () { return undefined; } });
      var globals = p.globals.get('dict')();
      return p.runPythonAsync(m.code, { globals: globals }).then(function () {
        globals.destroy();
        self.postMessage({ type: 'result', id: m.id, ok: true, out: out });
      }, function (err) {
        globals.destroy();
        self.postMessage({ type: 'result', id: m.id, ok: false, out: out, error: limited ? 'Остановлено: ' + LIMIT_MSG : cleanTraceback(err && err.message || err) });
      });
    }).catch(function (err) {
      self.postMessage({ type: 'result', id: m.id, ok: false, out: '', loadError: true, error: String(err && err.message || err) });
    });
  }
};
