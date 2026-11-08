/* Python в браузере через Pyodide. Версия закреплена; грузится с jsDelivr при первом запуске.
   Worker не имеет доступа к localStorage и DOM страницы. */
'use strict';
var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
var py = null, loading = null;

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
      var out = '';
      p.setStdout({ batched: function (s) { out += s + '\n'; } });
      p.setStderr({ batched: function (s) { out += s + '\n'; } });
      p.setStdin({ stdin: function () { return undefined; } });
      var globals = p.globals.get('dict')();
      return p.runPythonAsync(m.code, { globals: globals }).then(function () {
        globals.destroy();
        self.postMessage({ type: 'result', id: m.id, ok: true, out: out });
      }, function (err) {
        globals.destroy();
        self.postMessage({ type: 'result', id: m.id, ok: false, out: out, error: cleanTraceback(err && err.message || err) });
      });
    }).catch(function (err) {
      self.postMessage({ type: 'result', id: m.id, ok: false, out: '', loadError: true, error: String(err && err.message || err) });
    });
  }
};
