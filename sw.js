/* Офлайн: оболочка приложения — сеть сначала (всегда свежая), кэш как запасной; Pyodide — кэш сначала. */
'use strict';
var SHELL = 'bastau-shell-v1';
var RUNTIME = 'bastau-pyodide-v1';
var FILES = ['./', 'index.html', 'css/app.css?v=14', 'js/core.js?v=14', 'js/store.js?v=14', 'js/ui.js?v=14', 'js/runner.js?v=14', 'js/editor.js?v=14', 'js/course.js?v=14', 'js/steps.js?v=14', 'js/examples-data.js?v=14', 'js/app.js?v=14', 'js/py-worker.js', 'js/js-worker.js', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== RUNTIME; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === 'https://cdn.jsdelivr.net' && url.pathname.indexOf('/pyodide/') === 0) {
    e.respondWith(caches.open(RUNTIME).then(function (cache) {
      return cache.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { if (res.ok) cache.put(req, res.clone()); return res; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    var copy = res.clone();
    if (res.ok) caches.open(SHELL).then(function (c) { c.put(req, copy); });
    return res;
  }).catch(function () { return caches.match(req, { ignoreSearch: false }).then(function (hit) { return hit || caches.match('index.html'); }); }));
});
