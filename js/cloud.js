/* Облачное сохранение прогресса: один документ Firestore progress/{uid} на аккаунт, доступ по REST.
   Здесь нет ни входа, ни DOM — только обмен и слияние, поэтому модуль тестируется в Node с подставным fetch.
   Вход через Google — в js/account.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Cloud = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_DATA = 300000; // столько же в firestore.rules

  function docUrl(projectId, uid) {
    return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(projectId) +
      '/databases/(default)/documents/progress/' + encodeURIComponent(uid);
  }

  function encode(state, now, device, Core) {
    var data = JSON.stringify(Core.cloudView(state));
    if (data.length > MAX_DATA) { var e = new Error('Прогресс слишком большой для сохранения в облаке.'); e.code = 'too-big'; throw e; }
    return { fields: { v: { integerValue: '1' }, data: { stringValue: data }, u: { integerValue: String(Math.round(now)) }, d: { stringValue: String(device).slice(0, 64) } } };
  }

  // Документ из облака → состояние. Чужим данным не доверяем: всё проверяется так же, как импорт из файла.
  function decode(doc, Core) {
    try {
      var f = doc && doc.fields;
      if (!f || !f.data || typeof f.data.stringValue !== 'string') return null;
      if (!f.v || String(f.v.integerValue) !== '1') return null;
      var s = JSON.parse(f.data.stringValue);
      return Core.validateState(s) ? s : null;
    } catch (e) { return null; }
  }

  function httpError(res, body) {
    var st = body && body.error && body.error.status;
    var e = new Error((body && body.error && body.error.message) || ('HTTP ' + res.status));
    e.http = res.status; e.status = st || '';
    e.code = res.status === 401 || st === 'UNAUTHENTICATED' ? 'auth'
      : res.status === 403 ? 'denied'
      : (st === 'FAILED_PRECONDITION' || st === 'ALREADY_EXISTS' || st === 'ABORTED' || res.status === 409 || res.status === 412) ? 'conflict'
      : res.status === 429 ? 'quota' : 'server';
    return e;
  }

  /* o: { projectId, uid, fetch, getToken() → Promise<string>, device, Core, getLocal() → state, setLocal(state), now() }
     sync(): забрать из облака → слить с локальным → записать то, что изменилось. Возвращает { pulled, pushed }. */
  function createSync(o) {
    var url = docUrl(o.projectId, o.uid);
    var running = null, again = false;

    function call(method, target, body) {
      return o.getToken().then(function (token) {
        var init = { method: method, headers: { Authorization: 'Bearer ' + token } };
        if (body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
        return o.fetch(target, init);
      }).then(function (res) {
        return res.text().then(function (t) {
          var json = null; try { json = t ? JSON.parse(t) : null; } catch (e) { /* не JSON */ }
          return { res: res, json: json };
        });
      }, function (err) { var e = new Error('Нет связи с интернетом.'); e.code = 'offline'; e.cause = err; throw e; });
    }

    function pull() {
      return call('GET', url).then(function (r) {
        if (r.res.status === 404) return { exists: false, state: null, updateTime: null };
        if (!r.res.ok) throw httpError(r.res, r.json);
        return { exists: true, state: decode(r.json, o.Core), updateTime: r.json.updateTime || null };
      });
    }

    // Запись с условием: документ не должен был измениться с момента чтения. Иначе — конфликт, читаем заново.
    function push(state, remote) {
      var cond = remote.exists && remote.updateTime ? 'currentDocument.updateTime=' + encodeURIComponent(remote.updateTime) : 'currentDocument.exists=false';
      return call('PATCH', url + '?' + cond, encode(state, o.now(), o.device, o.Core)).then(function (r) {
        if (!r.res.ok) throw httpError(r.res, r.json);
        return r.json;
      });
    }

    function once(attempt) {
      return pull().then(function (remote) {
        var local = o.getLocal();
        // повреждённый документ в облаке не должен стирать локальный прогресс: считаем, что там пусто, и перезаписываем
        var merged = remote.exists && remote.state ? o.Core.mergeState(local, remote.state) : local;
        var pulled = !o.Core.sameCloud(merged, local);
        if (pulled) o.setLocal(merged);
        var needPush = !remote.exists || !remote.state || !o.Core.sameCloud(merged, remote.state);
        if (!needPush) return { pulled: pulled, pushed: false };
        return push(merged, remote).then(function () { return { pulled: pulled, pushed: true }; }, function (err) {
          if (err.code === 'conflict' && attempt < 3) return once(attempt + 1); // другое устройство успело раньше
          throw err;
        });
      });
    }

    function sync() {
      if (running) { again = true; return running; } // не запускаем два обмена одновременно
      running = once(0).then(function (r) { running = null; if (again) { again = false; return sync(); } return r; },
        function (e) { running = null; again = false; throw e; });
      return running;
    }

    return { sync: sync, pull: pull, url: url };
  }

  return { createSync: createSync, encode: encode, decode: decode, docUrl: docUrl, MAX_DATA: MAX_DATA };
});
