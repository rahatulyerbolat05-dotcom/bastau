// Облачное сохранение: слияние прогресса двух устройств и обмен с подставным Firestore.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Core = require('../js/core.js');
const Cloud = require('../js/cloud.js');

const DAY = 86400000;
const T0 = Date.UTC(2026, 10, 10, 9, 0, 0);
function fresh(over) {
  return Object.assign({ v: 1, lang: 'py', level: null, created: T0, lessons: {}, cards: {}, days: [], minutes: {}, calib: [], notes: {}, plan: null, theme: 'auto', sandbox: {}, welcomed: false, epoch: 0, prefsAt: 0 }, over || {});
}
function lesson(steps, over) { return Object.assign({ done: false, doneSteps: steps, results: {}, startedAt: T0, doneAt: null }, over || {}); }
function card(id, last, stage, reps) { return { id, stage: stage || 0, due: last + DAY, reps: reps || 0, lapses: 0, last, relearn: false }; }
const view = s => Core.stable(Core.cloudView(s));

// два устройства, которые учились независимо
function phone() {
  return fresh({
    welcomed: true, lang: 'js', prefsAt: T0 + 5,
    lessons: { 'hello:js': lesson(['goal', 'predict1', 'anatomy'], { results: { predict1: { correct: true, ms: 900 } } }), 'vars:js': lesson(['goal']) },
    cards: { 'js:q-print': card('js:q-print', T0 + 100, 1, 2), 'js:fill-hello': card('js:fill-hello', T0 + 50) },
    days: ['2026-11-10', '2026-11-11'], minutes: { '2026-11-10': 7.5, '2026-11-11': 2 },
    calib: [{ c: 'sure', ok: true, t: T0 + 1 }, { c: 'guess', ok: false, t: T0 + 3 }],
    notes: { explain: 'коротко' }, plan: { time: '20:00', cue: 'после ужина', at: T0 + 10 }, sandbox: { js: 'console.log("телефон");' }
  });
}
function laptop() {
  return fresh({
    welcomed: true, lang: 'py', prefsAt: T0 + 9, theme: 'dark',
    lessons: { 'hello:js': lesson(['goal', 'parsons', 'fill'], { done: true, doneAt: T0 + 500, results: { predict1: { correct: false, ms: 400 }, fill: { correct: true, ms: 100 } } }) },
    cards: { 'js:q-print': card('js:q-print', T0 + 300, 2, 3), 'js:q-case': card('js:q-case', T0 + 20) },
    days: ['2026-11-11', '2026-11-12'], minutes: { '2026-11-11': 9, '2026-11-12': 4 },
    calib: [{ c: 'sure', ok: true, t: T0 + 1 }, { c: 'maybe', ok: true, t: T0 + 2 }],
    notes: { explain: 'подробное объяснение своими словами', 'explain-vars': 'переменная' }, plan: { time: '08:00', cue: 'после завтрака', at: T0 + 4 }, sandbox: { py: 'print("ноутбук")' }
  });
}

test('слияние: ничего не теряется', () => {
  const a = phone(), b = laptop();
  const m = Core.mergeState(a, b);
  assert.deepEqual(m.lessons['hello:js'].doneSteps, ['anatomy', 'fill', 'goal', 'parsons', 'predict1']);
  assert.equal(m.lessons['hello:js'].done, true);
  assert.equal(m.lessons['hello:js'].doneAt, T0 + 500);
  assert.ok(m.lessons['hello:js'].results.fill && m.lessons['hello:js'].results.predict1);
  assert.deepEqual(m.lessons['vars:js'].doneSteps, ['goal']);
  assert.deepEqual(Object.keys(m.cards).sort(), ['js:fill-hello', 'js:q-case', 'js:q-print']);
  assert.equal(m.cards['js:q-print'].stage, 2, 'карточка, повторённая позже, актуальнее');
  assert.deepEqual(m.days, ['2026-11-10', '2026-11-11', '2026-11-12']);
  assert.deepEqual(m.minutes, { '2026-11-10': 7.5, '2026-11-11': 9, '2026-11-12': 4 });
  assert.equal(m.calib.length, 3, 'одинаковые записи уверенности не дублируются');
  assert.equal(m.notes.explain, 'подробное объяснение своими словами');
  assert.equal(m.notes['explain-vars'], 'переменная');
  assert.equal(m.plan.time, '20:00', 'план, сохранённый позже');
  assert.equal(m.lang, 'py'); assert.equal(m.theme, 'dark'); // настройки, изменённые позже
  assert.equal(m.welcomed, true);
  assert.equal(Core.validateState(m), true);
});

test('слияние: порядок не важен, повтор ничего не меняет, входные данные не портятся', () => {
  const a = phone(), b = laptop(), a0 = JSON.stringify(a), b0 = JSON.stringify(b);
  const ab = Core.mergeState(a, b), ba = Core.mergeState(b, a);
  assert.equal(view(ab), view(ba), 'merge(a,b) и merge(b,a) должны совпадать в облачной части');
  assert.equal(view(Core.mergeState(ab, a)), view(ab));
  assert.equal(view(Core.mergeState(ab, b)), view(ab));
  assert.equal(view(Core.mergeState(ab, ba)), view(ab));
  assert.equal(JSON.stringify(a), a0); assert.equal(JSON.stringify(b), b0);
  assert.equal(Core.sameCloud(ab, ba), true);
  // три устройства в любом порядке
  const c = fresh({ welcomed: true, cards: { 'py:x': card('py:x', T0 + 1) }, days: ['2026-11-09'], prefsAt: T0 + 1 });
  assert.equal(view(Core.mergeState(Core.mergeState(a, b), c)), view(Core.mergeState(a, Core.mergeState(b, c))));
  assert.equal(view(Core.mergeState(Core.mergeState(c, a), b)), view(Core.mergeState(Core.mergeState(b, c), a)));
});

test('слияние: черновик песочницы остаётся локальным и в облако не попадает', () => {
  const m = Core.mergeState(phone(), laptop());
  assert.deepEqual(m.sandbox, { js: 'console.log("телефон");' });
  assert.equal('sandbox' in Core.cloudView(m), false);
  assert.doesNotMatch(view(m), /телефон|ноутбук/);
});

test('слияние: «пройти заново» новее прошлого прохождения', () => {
  const done = fresh({ lessons: { 'hello:py': lesson(['goal', 'quiz', 'done'], { done: true, doneAt: T0 }) } });
  const restarted = fresh({ lessons: { 'hello:py': lesson(['goal'], { rev: T0 + 1000 }) } });
  for (const m of [Core.mergeState(done, restarted), Core.mergeState(restarted, done)]) {
    assert.equal(m.lessons['hello:py'].done, false);
    assert.deepEqual(m.lessons['hello:py'].doneSteps, ['goal']);
  }
});

test('слияние: пропущенный день перестаёт быть «пропущенным», если где-то он пройден по-настоящему', () => {
  const skipped = fresh({ lessons: { 'hello:py': lesson([], { done: true, skipped: true, doneAt: T0 }) } });
  const real = fresh({ lessons: { 'hello:py': lesson(['goal', 'done'], { done: true, doneAt: T0 + 5 }) } });
  assert.equal(Core.mergeState(skipped, real).lessons['hello:py'].skipped, false);
  assert.equal(Core.mergeState(real, skipped).lessons['hello:py'].skipped, false);
  assert.equal(Core.mergeState(skipped, skipped).lessons['hello:py'].skipped, true);
});

test('слияние: «стереть прогресс» сильнее старого прогресса на другом устройстве', () => {
  const old = phone();
  const wiped = fresh({ epoch: T0 + 9999, welcomed: false });
  for (const m of [Core.mergeState(old, wiped), Core.mergeState(wiped, old)]) {
    assert.equal(Object.keys(m.cards).length, 0);
    assert.equal(Object.keys(m.lessons).length, 0);
    assert.equal(m.epoch, T0 + 9999);
  }
  // а то, что сделано после стирания, сохраняется
  const after = fresh({ epoch: T0 + 9999, cards: { 'py:a': card('py:a', T0 + 20000) } });
  assert.equal(Object.keys(Core.mergeState(after, wiped).cards).length, 1);
});

test('слияние: журнал уверенности ограничен 300 записями', () => {
  const mk = (from, n) => Array.from({ length: n }, (_, i) => ({ c: 'sure', ok: true, t: from + i }));
  const m = Core.mergeState(fresh({ calib: mk(T0, 250) }), fresh({ calib: mk(T0 + 1000, 250) }));
  assert.equal(m.calib.length, 300);
  assert.equal(m.calib[299].t, T0 + 1249);
});

test('hasProgress', () => {
  assert.equal(Core.hasProgress(fresh()), false);
  assert.equal(Core.hasProgress(fresh({ lessons: { 'hello:py': lesson([]) } })), false);
  assert.equal(Core.hasProgress(fresh({ lessons: { 'hello:py': lesson(['goal']) } })), true);
  assert.equal(Core.hasProgress(fresh({ cards: { x: card('x', T0) } })), true);
  assert.equal(Core.hasProgress(null), false);
});

/* ---------- подставной Firestore: один документ на uid, условие по updateTime, как в REST API ---------- */
function fakeFirestore() {
  const docs = {}; let clock = 0;
  const log = [];
  const srv = {
    docs, log, offline: false, failNext: null, beforePatch: null,
    fetch(url, init) {
      log.push({ method: init.method, url, auth: init.headers.Authorization });
      if (srv.offline) return Promise.reject(new TypeError('Failed to fetch'));
      const res = (status, body) => Promise.resolve({ status, ok: status >= 200 && status < 300, text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)) });
      if (srv.failNext) { const f = srv.failNext; srv.failNext = null; return res(f.status, { error: { status: f.code, message: f.code } }); }
      const u = new URL(url), id = decodeURIComponent(u.pathname.split('/').pop());
      if (init.headers.Authorization !== 'Bearer token-' + id) return res(403, { error: { status: 'PERMISSION_DENIED', message: 'Missing or insufficient permissions.' } });
      if (init.method === 'GET') return docs[id] ? res(200, docs[id]) : res(404, { error: { status: 'NOT_FOUND' } });
      if (init.method === 'PATCH') {
        if (srv.beforePatch) { const hook = srv.beforePatch; srv.beforePatch = null; hook(id); }
        const wantExists = u.searchParams.get('currentDocument.exists'), wantTime = u.searchParams.get('currentDocument.updateTime');
        if (wantExists === 'false' && docs[id]) return res(409, { error: { status: 'ALREADY_EXISTS' } });
        if (wantTime && (!docs[id] || docs[id].updateTime !== wantTime)) return res(400, { error: { status: 'FAILED_PRECONDITION' } });
        const body = JSON.parse(init.body);
        docs[id] = { name: 'x/' + id, fields: body.fields, updateTime: 't' + (++clock) };
        return res(200, docs[id]);
      }
      return res(405, {});
    },
    stateOf(id) { return Cloud.decode(docs[id], Core); },
    put(id, state) { docs[id] = { name: 'x/' + id, fields: Cloud.encode(state, T0, 'other', Core).fields, updateTime: 't' + (++clock) }; }
  };
  return srv;
}
function device(srv, uid, initial, name) {
  const d = { state: initial, sets: 0 };
  d.sync = Cloud.createSync({
    projectId: 'p', uid, device: name || 'dev', Core, fetch: srv.fetch, now: () => T0,
    getToken: () => Promise.resolve('token-' + uid),
    getLocal: () => d.state, setLocal: s => { d.state = s; d.sets++; }
  });
  return d;
}

test('обмен: первый вход создаёт документ, второе устройство получает и добавляет своё, всё сходится', async () => {
  const srv = fakeFirestore();
  const a = device(srv, 'u1', phone(), 'phone'), b = device(srv, 'u1', laptop(), 'laptop');
  assert.deepEqual(await a.sync.sync(), { pulled: false, pushed: true });
  assert.equal(view(srv.stateOf('u1')), view(a.state));

  assert.deepEqual(await b.sync.sync(), { pulled: true, pushed: true });
  assert.equal(Object.keys(b.state.cards).length, 3);
  assert.deepEqual(b.state.sandbox, { py: 'print("ноутбук")' }, 'черновик ноутбука не затёрт');

  assert.deepEqual(await a.sync.sync(), { pulled: true, pushed: false });
  assert.equal(view(a.state), view(b.state));
  // дальше обмен ничего не меняет и ничего не пишет
  const writes = srv.log.filter(x => x.method === 'PATCH').length;
  assert.deepEqual(await a.sync.sync(), { pulled: false, pushed: false });
  assert.deepEqual(await b.sync.sync(), { pulled: false, pushed: false });
  assert.equal(srv.log.filter(x => x.method === 'PATCH').length, writes);
});

test('обмен: в облако не уходит песочница, запросы идут с токеном и только к своему документу', async () => {
  const srv = fakeFirestore();
  const a = device(srv, 'user 1/x', phone());
  await a.sync.sync();
  const raw = srv.docs['user 1/x'].fields.data.stringValue;
  assert.doesNotMatch(raw, /sandbox|телефон/);
  assert.ok(raw.length < Cloud.MAX_DATA);
  srv.log.forEach(r => {
    assert.equal(r.auth, 'Bearer token-user 1/x');
    assert.match(r.url, /\/documents\/progress\/user%201%2Fx(\?|$)/);
  });
  assert.deepEqual(Object.keys(srv.docs['user 1/x'].fields).sort(), ['d', 'data', 'u', 'v']);
});

test('обмен: конфликт (другое устройство записало между чтением и записью) — читаем заново и сливаем', async () => {
  const srv = fakeFirestore();
  const a = device(srv, 'u1', phone());
  srv.put('u1', fresh({ welcomed: true, cards: { 'py:first': card('py:first', T0) } }));
  srv.beforePatch = id => srv.put(id, laptop()); // ноутбук успел раньше
  const r = await a.sync.sync();
  assert.equal(r.pushed, true);
  const cloud = srv.stateOf('u1');
  assert.ok(cloud.cards['js:q-case'], 'запись ноутбука не потеряна');
  assert.ok(cloud.cards['js:fill-hello'], 'запись телефона не потеряна');
  assert.equal(view(cloud), view(a.state));
});

test('обмен: нет сети — понятная ошибка, локальный прогресс не тронут', async () => {
  const srv = fakeFirestore(); srv.offline = true;
  const a = device(srv, 'u1', phone()); const before = JSON.stringify(a.state);
  await assert.rejects(a.sync.sync(), e => e.code === 'offline');
  assert.equal(JSON.stringify(a.state), before);
  assert.equal(a.sets, 0);
  srv.offline = false;
  assert.equal((await a.sync.sync()).pushed, true, 'после появления сети обмен проходит');
});

test('обмен: испорченный документ в облаке не стирает локальный прогресс', async () => {
  const srv = fakeFirestore();
  for (const bad of ['не json', '{"v":2}', '[]', JSON.stringify({ v: 1, lang: 'py', cards: { x: { stage: 99, due: 1 } }, lessons: {}, days: [] })]) {
    srv.docs.u1 = { fields: { v: { integerValue: '1' }, data: { stringValue: bad }, u: { integerValue: '1' }, d: { stringValue: 'x' } }, updateTime: 'tX' };
    const a = device(srv, 'u1', phone());
    const r = await a.sync.sync();
    assert.equal(r.pushed, true, bad);
    assert.equal(Object.keys(a.state.cards).length, 2);
    assert.equal(view(srv.stateOf('u1')), view(a.state));
  }
});

test('обмен: коды ошибок сервера', async () => {
  const srv = fakeFirestore();
  const a = device(srv, 'u1', phone());
  srv.failNext = { status: 401, code: 'UNAUTHENTICATED' };
  await assert.rejects(a.sync.sync(), e => e.code === 'auth');
  srv.failNext = { status: 429, code: 'RESOURCE_EXHAUSTED' };
  await assert.rejects(a.sync.sync(), e => e.code === 'quota');
  srv.failNext = { status: 500, code: 'INTERNAL' };
  await assert.rejects(a.sync.sync(), e => e.code === 'server');
  // чужой токен: правила не пускают
  const thief = Cloud.createSync({ projectId: 'p', uid: 'u1', device: 'x', Core, fetch: srv.fetch, now: () => T0, getToken: () => Promise.resolve('token-u2'), getLocal: () => fresh(), setLocal: () => { throw new Error('не должно вызываться'); } });
  await assert.rejects(thief.sync(), e => e.code === 'denied');
});

test('обмен: одновременные вызовы не запускают два обмена сразу', async () => {
  const srv = fakeFirestore();
  const a = device(srv, 'u1', phone());
  const [r1, r2, r3] = await Promise.all([a.sync.sync(), a.sync.sync(), a.sync.sync()]);
  assert.equal(r1.pushed !== undefined && r2 !== undefined && r3 !== undefined, true);
  assert.equal(srv.log.filter(x => x.method === 'PATCH').length, 1, 'запись одна');
});

test('обмен: слишком большой прогресс не отправляется', () => {
  const big = fresh({ notes: { explain: 'я'.repeat(Cloud.MAX_DATA) } });
  assert.throws(() => Cloud.encode(big, T0, 'd', Core), e => e.code === 'too-big');
});

test('decode не доверяет чужим данным', () => {
  assert.equal(Cloud.decode(null, Core), null);
  assert.equal(Cloud.decode({}, Core), null);
  assert.equal(Cloud.decode({ fields: { v: { integerValue: '2' }, data: { stringValue: JSON.stringify(fresh()) } } }, Core), null);
  assert.equal(Cloud.decode({ fields: { v: { integerValue: '1' }, data: { stringValue: '{"__proto__":{"x":1}}' } } }, Core), null);
  const ok = Cloud.decode({ fields: Cloud.encode(phone(), T0, 'd', Core).fields }, Core);
  assert.equal(ok.lang, 'js');
  assert.equal({}.x, undefined);
});

test('правила Firestore: доступ только владельцу, ограничение размера совпадает с клиентом', () => {
  const rules = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
  assert.match(rules, /match \/progress\/\{uid\}/);
  assert.match(rules, /request\.auth != null && request\.auth\.uid == uid/);
  assert.doesNotMatch(rules, /if true/);
  assert.equal((rules.match(/\ballow\b/g) || []).length, 2);
  assert.equal(rules.split('allow').slice(1).every(a => /isOwner\(\)/.test(a.split('\n')[0])), true, 'каждое разрешение требует владельца');
  assert.match(rules, new RegExp('data\\.size\\(\\) <= ' + Cloud.MAX_DATA));
});

test('страница разрешает только нужные адреса Firebase', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
  assert.doesNotMatch(csp, /unsafe-eval|script-src[^;]*unsafe-inline|\*/);
  assert.match(csp, /script-src 'self' https:\/\/www\.gstatic\.com\/firebasejs\/10\.14\.1\/ https:\/\/apis\.google\.com;/);
  assert.match(csp, /frame-src https:\/\/bastau-by-yerbo\.firebaseapp\.com;/);
  const account = fs.readFileSync(path.join(__dirname, '..', 'js', 'account.js'), 'utf8');
  assert.match(account, /firebasejs\/10\.14\.1\//, 'версия SDK в account.js совпадает с разрешённой в CSP');
});
