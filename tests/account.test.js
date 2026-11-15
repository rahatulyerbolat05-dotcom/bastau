// Аккаунт целиком: настоящие js/store.js, js/cloud.js и js/account.js в подставном «браузере»
// (localStorage, документ, Firebase Auth и Firestore — поддельные). Проверяет сценарии входа, переноса прогресса и выхода.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Core = require('../js/core.js');
const Cloud = require('../js/cloud.js');

const src = f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
const tick = (ms) => new Promise(r => setTimeout(r, ms || 0));
async function settle() { for (let i = 0; i < 12; i++) await tick(); }

// общее «облако» для всех устройств теста
function makeCloud() {
  const docs = {}; let clock = 0;
  return {
    docs, offline: false, writes: 0,
    fetch(url, init) {
      if (this.offline) return Promise.reject(new TypeError('Failed to fetch'));
      const res = (status, body) => Promise.resolve({ status, ok: status >= 200 && status < 300, text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)) });
      const u = new URL(url), id = decodeURIComponent(u.pathname.split('/').pop());
      if (init.headers.Authorization !== 'Bearer idtoken-' + id) return res(403, { error: { status: 'PERMISSION_DENIED' } });
      if (init.method === 'GET') return docs[id] ? res(200, docs[id]) : res(404, { error: { status: 'NOT_FOUND' } });
      const wantExists = u.searchParams.get('currentDocument.exists'), wantTime = u.searchParams.get('currentDocument.updateTime');
      if (wantExists === 'false' && docs[id]) return res(409, { error: { status: 'ALREADY_EXISTS' } });
      if (wantTime && (!docs[id] || docs[id].updateTime !== wantTime)) return res(400, { error: { status: 'FAILED_PRECONDITION' } });
      docs[id] = { fields: JSON.parse(init.body).fields, updateTime: 't' + (++clock) };
      this.writes++;
      return res(200, docs[id]);
    },
    state(id) { return Cloud.decode(docs[id], Core); }
  };
}

// одно устройство: свой localStorage, свои экземпляры Store и Account
function makeDevice(cloud, storage) {
  const store = storage || new Map();
  const handlers = { window: {}, document: {} };
  const on = (bag) => (type, fn) => { (bag[type] = bag[type] || []).push(fn); };
  let authCb = null, current = null, popup = { uid: 'alice', email: 'alice@example.com' };
  const body = { player: false, classList: { contains: c => c === 'has-player' && body.player } };
  const firebaseStub = {
    apps: [], SDK_VERSION: '10.14.1',
    initializeApp(cfg) { this.apps.push(cfg); },
    auth() {
      return {
        onAuthStateChanged(cb) { authCb = cb; Promise.resolve().then(() => cb(current)); },
        signInWithPopup() {
          if (popup.error) return Promise.reject(popup.error);
          current = { uid: popup.uid, email: popup.email, getIdToken: () => Promise.resolve('idtoken-' + popup.uid) };
          return Promise.resolve().then(() => { authCb(current); return { user: current }; });
        },
        signOut() { current = null; return Promise.resolve().then(() => authCb(null)); }
      };
    }
  };
  firebaseStub.auth.GoogleAuthProvider = function () { };
  const win = {
    Core, Cloud,
    BASTAU_FIREBASE: { apiKey: 'k', authDomain: 'x.firebaseapp.com', projectId: 'p', appId: 'a' },
    addEventListener: on(handlers.window),
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) % 256; return a; } },
    fetch: (u, i) => cloud.fetch(u, i)
  };
  const doc = {
    body, visibilityState: 'visible',
    addEventListener: on(handlers.document), dispatchEvent() { },
    createElement: () => ({}),
    head: { appendChild(s) { if (/auth-compat/.test(s.src)) win.firebase = firebaseStub; Promise.resolve().then(() => (dev.sdkFails ? s.onerror() : s.onload())); } }
  };
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: k => { store.delete(k); }
  };
  const ctx = vm.createContext({ window: win, document: doc, localStorage, setTimeout, clearTimeout, Promise, JSON, Date, Math, Object, Array, String, Uint8Array, Error, console, CustomEvent: function () { } });
  const dev = { store, win, body, events: [], sdkFails: false, setPopup(p) { popup = p; } };
  dev.boot = function () {
    vm.runInContext(src('store.js'), ctx); vm.runInContext(src('account.js'), ctx);
    dev.Store = win.Store; dev.Account = win.Account;
    dev.Account.onChange((kind) => dev.events.push(kind));
    return dev;
  };
  dev.fire = (target, type) => (handlers[target][type] || []).forEach(fn => fn());
  return dev.boot();
}

function learn(dev, lessonKey, steps, cardId) {
  const L = dev.Store.lesson(lessonKey);
  steps.forEach(s => { if (!L.doneSteps.includes(s)) L.doneSteps.push(s); });
  if (cardId) dev.Store.ensureCard(cardId);
  dev.Store.get().welcomed = true;
  dev.Store.save(); dev.Store.flush();
}

test('вход: гостевой прогресс предлагается добавить в аккаунт и уходит в облако', async () => {
  const cloud = makeCloud(), pc = makeDevice(cloud);
  learn(pc, 'hello:js', ['goal', 'predict1'], 'js:q-print');
  assert.equal(pc.Account.state().status, 'out');

  assert.equal(await pc.Account.signIn(), true);
  await settle();
  assert.equal(pc.Account.state().status, 'in');
  assert.equal(pc.Account.state().email, 'alice@example.com');
  assert.equal(pc.Store.account(), 'alice');
  assert.equal(Core.hasProgress(pc.Store.get()), false, 'до ответа прогресс аккаунта пуст — гостевой сам не подмешивается');
  assert.ok(pc.events.includes('guest'));
  assert.ok(pc.Account.guestOffer());

  pc.Account.answerGuest(true);
  await settle();
  assert.deepEqual(pc.Store.get().lessons['hello:js'].doneSteps.slice().sort(), ['goal', 'predict1']);
  assert.ok(cloud.state('alice').cards['js:q-print'], 'прогресс записан в облако');
  assert.equal(pc.Account.state().sync, 'ok');
  assert.equal(pc.Account.guestOffer(), null);
  // имя и почта в облако не попадают
  assert.doesNotMatch(JSON.stringify(cloud.docs.alice), /alice@example\.com/);
});

test('второе устройство: вход подтягивает прогресс; дальше изменения расходятся в обе стороны', async () => {
  const cloud = makeCloud(), pc = makeDevice(cloud), phone = makeDevice(cloud);
  learn(pc, 'hello:js', ['goal', 'predict1'], 'js:q-print');
  await pc.Account.signIn(); await settle(); pc.Account.answerGuest(true); await settle();

  await phone.Account.signIn(); await settle();
  assert.equal(phone.Account.guestOffer(), null, 'на чистом телефоне спрашивать не о чем');
  assert.deepEqual(phone.Store.get().lessons['hello:js'].doneSteps.slice().sort(), ['goal', 'predict1']);
  assert.equal(phone.Store.get().welcomed, true);
  assert.ok(phone.events.includes('data'));

  // телефон учится дальше → сохранение → отложенный обмен
  learn(phone, 'hello:js', ['anatomy'], 'js:q-case');
  await tick(2700); await settle();
  assert.ok(cloud.state('alice').cards['js:q-case']);

  await pc.Account.syncNow(); await settle();
  assert.ok(pc.Store.get().cards['js:q-case'], 'компьютер получил сделанное на телефоне');
  assert.deepEqual(pc.Store.get().lessons['hello:js'].doneSteps.slice().sort(), ['anatomy', 'goal', 'predict1']);
  const writes = cloud.writes;
  await pc.Account.syncNow(); await phone.Account.syncNow(); await settle();
  assert.equal(cloud.writes, writes, 'когда всё совпадает, лишних записей нет');
});

test('отказ: чужой гостевой прогресс в аккаунт не попадает и больше не предлагается', async () => {
  const cloud = makeCloud(), shared = makeDevice(cloud);
  learn(shared, 'hello:py', ['goal'], 'py:q-print');
  shared.setPopup({ uid: 'bob', email: 'bob@example.com' });
  await shared.Account.signIn(); await settle();
  shared.Account.answerGuest(false); await settle();
  assert.equal(Core.hasProgress(shared.Store.get()), false);
  assert.equal(Core.hasProgress(cloud.state('bob') || {}), false);

  await shared.Account.signOut(); await settle();
  assert.equal(shared.Store.account(), null);
  assert.ok(shared.Store.get().cards['py:q-print'], 'гостевой прогресс после выхода на месте');
  await shared.Account.signIn(); await settle();
  assert.equal(shared.Account.guestOffer(), null, 'второй раз не спрашиваем');
});

test('два аккаунта на одном устройстве не видят прогресс друг друга', async () => {
  const cloud = makeCloud(), shared = makeDevice(cloud);
  await shared.Account.signIn(); await settle();
  learn(shared, 'vars:js', ['goal', 'fill'], 'js:v-fill');
  await shared.Account.signOut(); await settle();
  assert.equal(shared.store.has('bastau.v1.u.alice'), false, 'после сохранённого выхода копия аккаунта с устройства стёрта');

  shared.setPopup({ uid: 'bob', email: 'bob@example.com' });
  await shared.Account.signIn(); await settle();
  assert.equal(Core.hasProgress(shared.Store.get()), false, 'Боб не видит прогресс Алисы');
  learn(shared, 'hello:py', ['goal'], 'py:q-print');
  await shared.Account.signOut(); await settle();

  shared.setPopup({ uid: 'alice', email: 'alice@example.com' });
  await shared.Account.signIn(); await settle();
  assert.ok(shared.Store.get().cards['js:v-fill']);
  assert.equal(shared.Store.get().cards['py:q-print'], undefined);
  assert.equal(cloud.state('bob').cards['js:v-fill'], undefined);
});

test('открытый урок: обмен откладывается и выполняется после закрытия', async () => {
  const cloud = makeCloud(), pc = makeDevice(cloud), phone = makeDevice(cloud);
  await pc.Account.signIn(); await settle();
  await phone.Account.signIn(); await settle();
  learn(phone, 'hello:js', ['goal'], 'js:q-print'); await phone.Account.syncNow(); await settle();

  pc.body.player = true; // на компьютере открыт урок
  const before = pc.Store.get();
  await pc.Account.syncNow(); await settle();
  assert.equal(pc.Store.get(), before, 'объект прогресса под открытым уроком не подменён');
  assert.equal(pc.Store.get().cards['js:q-print'], undefined);
  pc.body.player = false; pc.Account.kick(); await settle();
  assert.ok(pc.Store.get().cards['js:q-print']);
});

test('нет сети: прогресс остаётся на устройстве, после появления сети уходит в облако; выход без сохранения не стирает копию', async () => {
  const cloud = makeCloud(), pc = makeDevice(cloud);
  await pc.Account.signIn(); await settle();
  cloud.offline = true;
  learn(pc, 'hello:js', ['goal'], 'js:q-print');
  await pc.Account.syncNow(); await settle();
  assert.equal(pc.Account.state().sync, 'offline');
  assert.match(pc.Account.state().error, /Нет связи/);
  assert.ok(pc.Store.get().cards['js:q-print']);

  assert.equal(await pc.Account.signOut(), false);
  await settle();
  assert.equal(pc.store.has('bastau.v1.u.alice'), true, 'несохранённая копия аккаунта не удалена');

  cloud.offline = false;
  await pc.Account.signIn(); await settle();
  assert.ok(cloud.state('alice').cards['js:q-print'], 'после входа с сетью прогресс дошёл до облака');
});

test('перезапуск приложения: прогресс аккаунта открыт сразу, сессия поднимается сама', async () => {
  const cloud = makeCloud(), storage = new Map();
  const first = makeDevice(cloud, storage);
  await first.Account.signIn(); await settle();
  learn(first, 'hello:js', ['goal', 'predict1'], 'js:q-print'); await first.Account.syncNow(); await settle();

  const second = makeDevice(cloud, storage); // то же устройство, новая загрузка страницы
  assert.equal(second.Store.account(), 'alice', 'прогресс аккаунта открыт до ответа сервера входа');
  assert.equal(second.Account.state().status, 'restoring');
  assert.ok(second.Store.get().cards['js:q-print']);
});

test('ошибки входа объясняются по-человечески и не меняют прогресс', async () => {
  const cloud = makeCloud();
  const cases = [
    ['auth/popup-blocked', /всплывающие окна/],
    ['auth/unauthorized-domain', /Authorized domains/],
    ['auth/operation-not-allowed', /не включён/],
    ['auth/configuration-not-found', /не включён/],
    ['auth/network-request-failed', /Нет связи/],
    ['auth/internal-error', /auth\/internal-error/]
  ];
  for (const [code, want] of cases) {
    const d = makeDevice(cloud);
    learn(d, 'hello:js', ['goal'], 'js:q-print');
    d.setPopup({ error: Object.assign(new Error('x'), { code }) });
    assert.equal(await d.Account.signIn(), false);
    assert.match(d.Account.state().error, want, code);
    assert.equal(d.Account.state().status, 'out');
    assert.equal(d.Store.account(), null);
    assert.ok(d.Store.get().cards['js:q-print']);
  }
  // закрыл окно входа сам — без сообщения об ошибке
  const d = makeDevice(cloud);
  d.setPopup({ error: Object.assign(new Error('x'), { code: 'auth/popup-closed-by-user' }) });
  assert.equal(await d.Account.signIn(), false);
  assert.equal(d.Account.state().error, '');
  // модуль входа не загрузился
  const e = makeDevice(cloud); e.sdkFails = true;
  assert.equal(await e.Account.signIn(), false);
  assert.match(e.Account.state().error, /Не удалось загрузить модуль входа/);
});

test('без настроек Firebase вход выключен и ничего не ломает', () => {
  const store = new Map();
  const win = { Core, Cloud, BASTAU_FIREBASE: null, addEventListener() { } };
  const ctx = vm.createContext({ window: win, document: { body: { classList: { contains: () => false } }, addEventListener() { }, dispatchEvent() { } }, localStorage: { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) }, setTimeout, clearTimeout, Promise, JSON, Date, Math, Object, Array, String, Uint8Array, Error, CustomEvent: function () { } });
  vm.runInContext(src('store.js'), ctx); vm.runInContext(src('account.js'), ctx);
  assert.equal(win.Account.state().available, false);
  assert.equal(win.Account.state().status, 'off');
  assert.equal(win.Store.account(), null);
});

test('хранилище: «стереть прогресс» ставит отметку, загрузка файла её не теряет', () => {
  const cloud = makeCloud(), d = makeDevice(cloud);
  learn(d, 'hello:js', ['goal'], 'js:q-print');
  const backup = d.Store.exportJSON();
  d.Store.reset();
  const epoch = d.Store.get().epoch;
  assert.ok(epoch > 0);
  assert.equal(Core.hasProgress(d.Store.get()), false);
  assert.equal(d.Store.importJSON(backup).ok, true);
  assert.equal(d.Store.get().epoch, epoch, 'иначе слияние с облаком отменило бы загрузку');
  assert.ok(d.Store.get().cards['js:q-print']);
  // uid с опасными символами не превращается в чужой ключ хранилища
  d.Store.use('../x y');
  assert.equal(d.Store.account(), 'xy');
});
