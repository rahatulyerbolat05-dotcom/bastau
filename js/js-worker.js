/* Запуск JavaScript пользователя в отдельном Worker: нет DOM, нет localStorage.
   Сетевые и хранилищные API отключаем, чтобы пример не мог «позвонить домой». */
'use strict';
var post = self.postMessage.bind(self);
['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'Worker', 'SharedWorker', 'BroadcastChannel', 'postMessage']
  .forEach(function (k) { try { self[k] = undefined; } catch (e) { /* ignore */ } });

function fmt(v) {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'function') return String(v);
  if (typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { /* fallthrough */ } }
  return String(v);
}

self.onmessage = function (e) {
  var m = e.data;
  if (m.type === 'init') { post({ type: 'ready' }); return; }
  if (m.type !== 'run') return;
  var out = '';
  function log() { out += Array.prototype.map.call(arguments, fmt).join(' ') + '\n'; }
  var fakeConsole = { log: log, info: log, warn: log, error: log, debug: log };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', m.code)(fakeConsole);
    post({ type: 'result', id: m.id, ok: true, out: out });
  } catch (err) {
    post({ type: 'result', id: m.id, ok: false, out: out, error: (err && err.name ? err.name + ': ' + err.message : String(err)) });
  }
};
