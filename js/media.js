/* Фото пользователя (скетчи, здания, проекты): хранятся ТОЛЬКО на этом устройстве, в IndexedDB.
   В облако не уходят: для этого нужен отдельный файловый сервис. В прогрессе хранится лишь идентификатор фото,
   поэтому на другом устройстве запись видна, а снимок — нет.
   Перед сохранением фото уменьшается (длинная сторона до 1600 px, JPEG) — иначе снимки с телефона быстро съедят память. */
(function () {
  'use strict';
  var DB = 'bastau-media', STORE = 'photos', MAX_SIDE = 1600, MAX_FILE = 25 * 1024 * 1024;
  var dbPromise = null, urls = {};

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('Этот браузер не умеет хранить фото.')); return; }
      var req = window.indexedDB.open(DB, 1);
      req.onupgradeneeded = function () { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Не удалось открыть хранилище фото.')); };
      req.onblocked = function () { reject(new Error('Хранилище фото занято другой вкладкой.')); };
    });
    dbPromise.catch(function () { dbPromise = null; });
    return dbPromise;
  }
  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(STORE, mode), out;
        t.oncomplete = function () { resolve(out); };
        t.onerror = t.onabort = function () { reject(t.error || new Error('Не удалось сохранить фото: возможно, на устройстве кончилось место.')); };
        var r = fn(t.objectStore(STORE));
        if (r) r.onsuccess = function () { out = r.result; };
      });
    });
  }

  function newId() {
    var a = new Uint8Array(8); window.crypto.getRandomValues(a);
    return 'p' + Date.now().toString(36) + Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  // Файл → уменьшенный JPEG. Тип проверяется по факту: если браузер не смог прочитать картинку, это не картинка.
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, hgt = img.naturalHeight;
        if (!w || !hgt) { reject(new Error('Не получилось прочитать изображение.')); return; }
        var k = Math.min(1, MAX_SIDE / Math.max(w, hgt));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(hgt * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          if (!blob) { reject(new Error('Не получилось обработать изображение.')); return; }
          resolve({ blob: blob, w: c.width, h: c.height });
        }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Этот файл не похож на фотографию. Выбери снимок в формате JPEG, PNG или HEIC.')); };
      img.src = url;
    });
  }

  var Media = {
    available: !!window.indexedDB,
    // сохранить фото; возвращает идентификатор
    add: function (file) {
      if (!file) return Promise.reject(new Error('Файл не выбран.'));
      if (file.type && file.type.indexOf('image/') !== 0) return Promise.reject(new Error('Нужна фотография, а это другой тип файла.'));
      if (file.size > MAX_FILE) return Promise.reject(new Error('Фото слишком большое (больше 25 МБ).'));
      return shrink(file).then(function (r) {
        var rec = { id: newId(), blob: r.blob, w: r.w, h: r.h, at: Date.now() };
        return tx('readwrite', function (s) { s.put(rec); }).then(function () { return rec.id; });
      });
    },
    // адрес для <img>; null, если фото нет на этом устройстве
    url: function (id) {
      if (urls[id]) return Promise.resolve(urls[id]);
      return tx('readonly', function (s) { return s.get(id); }).then(function (rec) {
        if (!rec || !rec.blob) return null;
        urls[id] = URL.createObjectURL(rec.blob);
        return urls[id];
      }, function () { return null; });
    },
    remove: function (id) {
      if (urls[id]) { URL.revokeObjectURL(urls[id]); delete urls[id]; }
      return tx('readwrite', function (s) { s.delete(id); }).catch(function () { /* нечего удалять */ });
    },
    count: function () { return tx('readonly', function (s) { return s.count(); }).catch(function () { return 0; }); }
  };

  window.Media = Media;
})();
