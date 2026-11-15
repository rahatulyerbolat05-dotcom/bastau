/* Аккаунт: вход через Google (Firebase Auth) и запуск облачного сохранения (js/cloud.js).
   Вход необязателен: без него Бастау работает как раньше, прогресс хранится только на устройстве.
   SDK Firebase подгружается с gstatic только когда нужен — по нажатию «Войти» или если на этом устройстве уже входили. */
(function () {
  'use strict';
  var cfg = window.BASTAU_FIREBASE || null;
  var SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var LAST = 'bastau.account';      // uid последнего вошедшего на этом устройстве (чтобы сразу открыть его прогресс)
  var DEVICE = 'bastau.device';
  var ADOPTED = 'bastau.adopted.';  // + uid: про гостевой прогресс уже спрашивали

  var st = { available: !!cfg, status: cfg ? 'out' : 'off', uid: null, email: '', sync: 'idle', syncedAt: 0, error: '' };
  var listeners = [], sdkPromise = null, auth = null, sync = null, user = null;
  var pushTimer = null, pending = false, applying = false, guestOffer = null;

  function ls(get, k, v) {
    try { if (get) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* приватный режим */ }
    return null;
  }
  function emit(kind) { listeners.forEach(function (fn) { try { fn(kind || 'status', st); } catch (e) { /* ignore */ } }); }
  function deviceId() {
    var d = ls(true, DEVICE);
    if (!d) {
      var a = new Uint8Array(8); (window.crypto || window.msCrypto).getRandomValues(a);
      d = Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      ls(false, DEVICE, d);
    }
    return d;
  }
  function busy() { return document.body.classList.contains('has-player'); } // урок открыт: прогресс под ним менять нельзя

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Не удалось загрузить модуль входа. Проверь интернет.')); };
      document.head.appendChild(s);
    });
  }
  function loadSdk() {
    if (!cfg) return Promise.reject(new Error('Вход не настроен.'));
    if (!sdkPromise) {
      sdkPromise = loadScript(SDK + 'firebase-app-compat.js').then(function () { return loadScript(SDK + 'firebase-auth-compat.js'); }).then(function () {
        var fb = window.firebase;
        if (!fb.apps.length) fb.initializeApp(cfg);
        auth = fb.auth();
        auth.onAuthStateChanged(onUser);
        return auth;
      });
      sdkPromise.catch(function () { sdkPromise = null; });
    }
    return sdkPromise;
  }

  function human(e) {
    var code = e && e.code || '';
    if (code === 'auth/popup-blocked') return 'Браузер заблокировал окно входа. Разреши всплывающие окна для этого сайта и нажми «Войти» ещё раз.';
    if (code === 'auth/unauthorized-domain') return 'Адрес этого сайта не добавлен в настройки входа (Firebase → Authentication → Settings → Authorized domains).';
    if (code === 'auth/operation-not-allowed') return 'Вход через Google ещё не включён в проекте Firebase (Authentication → Sign-in method).';
    if (code === 'auth/network-request-failed' || code === 'offline') return 'Нет связи с интернетом. Прогресс сохранён на устройстве и уйдёт в облако, когда связь появится.';
    if (code === 'auth' || code === 'auth/user-token-expired') return 'Вход устарел. Выйди и войди заново.';
    if (code === 'denied') return 'Облако отклонило запись. Выйди и войди заново.';
    if (code === 'quota') return 'Слишком много запросов. Попробую позже.';
    if (code === 'too-big') return e.message;
    return 'Не получилось' + (code ? ' (' + code + ')' : '') + '. Прогресс на устройстве цел.';
  }

  function runSync() {
    if (!sync) return Promise.resolve(null);
    if (busy()) { pending = true; return Promise.resolve(null); }
    pending = false;
    st.sync = 'syncing'; emit();
    return sync.sync().then(function (r) {
      st.sync = 'ok'; st.syncedAt = Date.now(); st.error = '';
      emit(r && r.pulled ? 'data' : 'status');
      return r;
    }, function (e) {
      st.sync = e && e.code === 'offline' ? 'offline' : 'error'; st.error = human(e);
      emit();
      return null;
    });
  }
  function schedule() {
    if (!sync || applying) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(runSync, 2500);
  }

  function enter(u) {
    var guest = window.Store.account() ? null : JSON.parse(JSON.stringify(window.Store.get()));
    user = u;
    st.uid = u.uid; st.email = u.email || ''; st.status = 'in'; st.sync = 'idle'; st.error = '';
    ls(false, LAST, u.uid);
    if (window.Store.account() !== u.uid) window.Store.use(u.uid);
    sync = window.Cloud.createSync({
      projectId: cfg.projectId, uid: u.uid, device: deviceId(), Core: window.Core,
      fetch: function (url, init) { return window.fetch(url, init); },
      getToken: function () { return u.getIdToken(); },
      getLocal: function () { return window.Store.get(); },
      setLocal: function (s) { applying = true; try { window.Store.replace(s, true); } finally { applying = false; } },
      now: function () { return Date.now(); }
    });
    emit('data');
    runSync().then(function () {
      // на устройстве был прогресс без входа — спрашиваем, добавить ли его в аккаунт (на общем устройстве он может быть чужим)
      if (guest && window.Core.hasProgress(guest) && !ls(true, ADOPTED + u.uid)) {
        guestOffer = guest; emit('guest');
      }
    });
  }
  function leave(keepCopy) {
    var uid = st.uid;
    clearTimeout(pushTimer);
    sync = null; user = null; guestOffer = null;
    st.uid = null; st.email = ''; st.status = cfg ? 'out' : 'off'; st.sync = 'idle'; st.error = '';
    ls(false, LAST, null);
    window.Store.use(null);
    if (uid && !keepCopy) window.Store.drop(uid);
    emit('data');
  }
  function onUser(u) {
    if (u) { if (!user || user.uid !== u.uid) enter(u); return; }
    if (st.uid) { // сессия закончилась сама: несохранённую копию не трогаем
      leave(st.sync !== 'ok');
      st.error = 'Вход на этом устройстве закончился. Войди заново, чтобы продолжить с прогрессом аккаунта.';
      emit();
    }
    else { st.status = 'out'; emit(); }
  }

  var Account = {
    state: function () { return st; },
    onChange: function (fn) { listeners.push(fn); },
    signIn: function () {
      st.error = ''; st.status = st.status === 'in' ? 'in' : 'loading'; emit();
      return loadSdk().then(function (a) {
        return a.signInWithPopup(new window.firebase.auth.GoogleAuthProvider());
      }).then(function () { return true; }, function (e) {
        var quiet = e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request' || e.code === 'auth/user-cancelled');
        if (st.status === 'loading') st.status = 'out';
        st.error = quiet ? '' : (e && e.code ? human(e) : (e && e.message) || human(e));
        emit();
        return false;
      });
    },
    signOut: function () {
      if (!auth || !st.uid) return Promise.resolve();
      pending = false;
      return (busy() ? Promise.resolve(null) : runSync()).then(function () {
        var saved = st.sync === 'ok';
        var uid = st.uid;
        return auth.signOut().then(function () { if (st.uid === uid) leave(!saved); return saved; });
      });
    },
    syncNow: runSync,
    // урок закрылся — можно выполнить отложенный обмен
    kick: function () { if (sync && pending) runSync(); },
    // гостевой прогресс, который можно добавить в аккаунт (или null)
    guestOffer: function () { return guestOffer; },
    answerGuest: function (add) {
      var g = guestOffer; guestOffer = null;
      if (st.uid) ls(false, ADOPTED + st.uid, '1');
      if (add && g && st.uid) {
        window.Store.replace(window.Core.mergeState(window.Store.get(), g), true);
        emit('data');
        runSync();
      }
    }
  };

  // Запуск. Если здесь уже входили — сразу открываем прогресс этого аккаунта (без мигания гостевого) и тихо поднимаем сессию.
  if (cfg) {
    var last = ls(true, LAST);
    if (last) {
      window.Store.use(last);
      st.status = 'restoring'; st.uid = last;
      loadSdk().catch(function () { st.sync = 'offline'; st.error = human({ code: 'offline' }); emit(); });
    }
    window.Store.onSave(schedule);
    window.addEventListener('online', function () {
      if (sync) runSync();
      else if (st.status === 'restoring') loadSdk().catch(function () { /* попробуем при следующем появлении сети */ });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && sync && Date.now() - st.syncedAt > 60000) runSync();
    });
  }

  window.Account = Account;
})();
