// Направление «Архитектура»: логика дней и записей, слияние между устройствами, целостность содержания.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Core = require('../js/core.js');
const L = require('../js/arch-logic.js');

global.window = Object.assign(global.window || {}, { Core });
require('../js/arch-course.js');
const K = global.window.ArchCourse;

const T0 = Date.UTC(2026, 10, 16, 9, 0, 0), DAY = 86400000;
const fresh = over => Object.assign({ v: 1, lang: 'js', level: null, created: T0, lessons: {}, cards: {}, days: [], minutes: {}, calib: [], notes: {}, plan: null, theme: 'auto', sandbox: {}, welcomed: true, epoch: 0, prefsAt: 0 }, over || {});
const view = s => Core.stable(Core.cloudView(s));
const CORE = K.BLOCKS.filter(b => b.core).map(b => b.id);

test('день: текущий — первый с невыполненным уроком; ежедневные блоки на переход не влияют', () => {
  const a = L.ensure(fresh(), T0);
  assert.equal(L.currentDay(a, K.BLOCKS), 1);
  ['look', 'sketch', 'terms'].forEach(id => L.markBlock(a, 1, id, T0));
  assert.equal(L.currentDay(a, K.BLOCKS), 1, 'только ежедневные блоки день не закрывают');
  CORE.slice(0, 3).forEach(id => L.markBlock(a, 1, id, T0));
  assert.equal(L.currentDay(a, K.BLOCKS), 1);
  L.markBlock(a, 1, CORE[3], T0);
  assert.equal(L.currentDay(a, K.BLOCKS), 2);
  assert.equal(L.doneCount(a, 1, K.BLOCKS), K.BLOCKS.length);
  assert.equal(L.weekOf(1), 1); assert.equal(L.weekOf(7), 1); assert.equal(L.weekOf(8), 2);
});

test('блок: момент первого выполнения не перезаписывается', () => {
  const a = L.ensure(fresh(), T0);
  L.markBlock(a, 1, 'concept', T0);
  L.markBlock(a, 1, 'concept', T0 + 5000);
  assert.equal(a.days['1'].b.concept, T0);
});

test('записи: создание, изменение, удаление с «надгробием», выборка по виду и неделе', () => {
  const a = L.ensure(fresh(), T0);
  const idea = L.upsert(a, { kind: 'idea', problem: 'Холодные стыки панелей' }, T0);
  assert.ok(idea.id); assert.equal(idea.at, T0); assert.equal(idea.u, T0);
  const again = L.upsert(a, Object.assign({}, idea, { idea: 'Заводской стык с уплотнителем' }), T0 + 10);
  assert.equal(again.id, idea.id); assert.equal(again.at, T0); assert.equal(again.u, T0 + 10);
  L.upsert(a, { kind: 'project', week: 1, title: 'План комнаты', note: '14 м²' }, T0 + 20);
  assert.equal(L.list(a, 'idea').length, 1);
  assert.equal(L.weekly(a, 'project', 1).title, 'План комнаты');
  assert.equal(L.weekly(a, 'project', 2), null);
  L.remove(a, idea.id, T0 + 30);
  assert.equal(L.list(a, 'idea').length, 0);
  assert.deepEqual(a.items[idea.id], { id: idea.id, kind: 'idea', u: T0 + 30, del: true });
  assert.equal(L.remove(a, 'нет такой', T0), null);
});

test('избранное и ежемесячные напоминания', () => {
  const a = L.ensure(fresh(), T0);
  L.setFav(a, 'fallingwater', true, T0);
  assert.equal(L.isFav(a, 'fallingwater'), true);
  L.setFav(a, 'fallingwater', false, T0 + 1);
  assert.deepEqual(L.favIds(a), []);

  assert.equal(L.ideasReviewDue(a, T0 + 60 * DAY), false, 'пустой банк пересматривать незачем');
  L.upsert(a, { kind: 'idea', problem: 'x' }, T0);
  assert.equal(L.ideasReviewDue(a, T0 + 29 * DAY), false);
  assert.equal(L.ideasReviewDue(a, T0 + 30 * DAY), true);
  a.marks.ideasReview = T0 + 30 * DAY;
  assert.equal(L.ideasReviewDue(a, T0 + 45 * DAY), false);
  assert.equal(L.ideasReviewDue(a, T0 + 61 * DAY), true);

  assert.equal(L.personThisMonth(a, T0), false);
  L.upsert(a, { kind: 'person', name: 'Архитектор' }, T0);
  assert.equal(L.personThisMonth(a, T0 + 10 * DAY), true);
  assert.equal(L.personThisMonth(a, T0 + 31 * DAY), false);
});

test('статистика: день, модули, работы в портфолио', () => {
  const a = L.ensure(fresh(), T0);
  let st = L.stats(a, K);
  assert.deepEqual([st.day, st.lessons, st.modulesDone, st.works], [1, 0, 0, 0]);
  for (let n = 1; n <= K.MODULES[0].weeks * 7; n++) CORE.forEach(id => L.markBlock(a, n, id, T0));
  L.upsert(a, { kind: 'sketch', day: 1, photos: ['p1'] }, T0);
  L.upsert(a, { kind: 'idea', problem: 'не работа' }, T0);
  st = L.stats(a, K);
  assert.equal(st.modulesDone, 1);
  assert.equal(st.works, 1, 'идеи и разговоры в портфолио не считаются');
  assert.equal(L.moduleOfDay(K, 1).n, 1);
  assert.equal(L.moduleOfDay(K, K.MODULES[0].weeks * 7 + 1).n, 2);
  assert.equal(L.moduleOfDay(K, 99999).n, 8);
});

test('слияние устройств: блоки объединяются, новая версия записи побеждает, удаление не «воскресает»', () => {
  const phone = fresh(), pc = fresh();
  const a = L.ensure(phone, T0), b = L.ensure(pc, T0 + 100);
  L.markBlock(a, 1, 'concept', T0 + 10); L.markBlock(a, 1, 'sketch', T0 + 20);
  L.markBlock(b, 1, 'concept', T0 + 500); L.markBlock(b, 1, 'quiz', T0 + 600); b.days['1'].quiz = { ok: 3, total: 3 };
  const idea = L.upsert(a, { kind: 'idea', problem: 'старая формулировка' }, T0 + 30);
  b.items[idea.id] = Object.assign({}, idea, { problem: 'новая формулировка', u: T0 + 900 });
  const gone = L.upsert(b, { kind: 'person', name: 'Удалённый' }, T0 + 40);
  a.items[gone.id] = Object.assign({}, gone);
  L.remove(b, gone.id, T0 + 950);
  L.setFav(a, 'fallingwater', true, T0 + 50); L.setFav(b, 'fallingwater', false, T0 + 60);
  a.marks.ideasReview = T0 + 70;

  const ab = Core.mergeState(phone, pc), ba = Core.mergeState(pc, phone);
  assert.equal(view(ab), view(ba), 'порядок слияния не важен');
  assert.equal(view(Core.mergeState(ab, phone)), view(ab));
  assert.equal(view(Core.mergeState(ab, pc)), view(ab));
  const m = ab.arch;
  assert.deepEqual(Object.keys(m.days['1'].b).sort(), ['concept', 'quiz', 'sketch']);
  assert.equal(m.days['1'].b.concept, T0 + 10, 'остаётся самый ранний момент выполнения');
  assert.deepEqual(m.days['1'].quiz, { ok: 3, total: 3 });
  assert.equal(m.items[idea.id].problem, 'новая формулировка');
  assert.equal(m.items[gone.id].del, true);
  assert.equal(L.list(m, 'person').length, 0);
  assert.equal(L.isFav(m, 'fallingwater'), false);
  assert.equal(m.startedAt, T0); assert.equal(m.on, true); assert.equal(m.marks.ideasReview, T0 + 70);
  assert.equal(Core.validateState(ab), true);
});

test('слияние: архитектура есть только на одном устройстве; у старых состояний раздела нет вовсе', () => {
  const withArch = fresh(), plain = fresh();
  L.markBlock(L.ensure(withArch, T0), 1, 'concept', T0);
  assert.ok(Core.mergeState(plain, withArch).arch.days['1']);
  assert.ok(Core.mergeState(withArch, plain).arch.days['1']);
  assert.equal('arch' in Core.mergeState(plain, fresh()), false, 'пустой раздел не появляется из ниоткуда');
  assert.equal(Core.sameCloud(Core.mergeState(plain, withArch), withArch), true);
  assert.equal(Core.hasProgress(withArch), true, 'прогресс только в архитектуре — тоже прогресс');
  assert.equal(Core.hasProgress(Object.assign(fresh(), { arch: { on: true, startedAt: T0, days: {}, items: {}, fav: {}, marks: {} } })), false);
});

test('проверка состояния: правильный раздел принимается, мусор отвергается', () => {
  const ok = fresh(); const a = L.ensure(ok, T0); L.markBlock(a, 1, 'concept', T0); L.upsert(a, { kind: 'idea', problem: 'x' }, T0);
  assert.equal(Core.validateState(ok), true);
  for (const bad of ['строка', [], 5, { days: [] }, { items: 'x' }, { days: { 1: 'x' } }, { days: { 1: { b: [] } } }, { items: { a: { kind: 'idea' } } }, { items: { a: { u: 1 } } }, { items: { a: null } }]) {
    assert.equal(Core.validateState(fresh({ arch: bad })), false, JSON.stringify(bad));
  }
  const many = {}; for (let i = 0; i < 5001; i++) many['i' + i] = { kind: 'idea', u: 1 };
  assert.equal(Core.validateState(fresh({ arch: { items: many } })), false);
});

test('программа: 8 модулей в заданном порядке', () => {
  assert.deepEqual(K.MODULES.map(m => m.title), ['Основы композиции', 'История архитектуры', 'Конструкции и материалы', 'Планировка жилья', 'Нормы и законы РК', 'Модульное и сборное строительство', 'Цифровые инструменты', 'Экономика стройки']);
  K.MODULES.forEach((m, i) => { assert.equal(m.n, i + 1); assert.ok(m.weeks >= 1 && m.about.length > 20); });
  assert.deepEqual(K.BLOCKS.filter(b => b.core).map(b => b.id), ['concept', 'building', 'practice', 'quiz']);
  assert.deepEqual(K.BLOCKS.filter(b => !b.core).map(b => b.id), ['look', 'sketch', 'terms']);
});

test('уроки: у каждого дня есть все блоки; 3 вопроса с одним верным ответом; 5 терминов; фото с автором и лицензией', () => {
  assert.ok(K.DAYS.length >= 1);
  const qIds = new Set(), tIds = new Set(), lookIds = new Set();
  K.DAYS.forEach((d, i) => {
    assert.equal(d.n, i + 1);
    assert.ok(d.title && d.concept.title && d.concept.lead && d.concept.parts.length >= 2 && d.concept.example);
    assert.match(d.concept.svg, /^<svg[\s\S]*<\/svg>$/);
    assert.doesNotMatch(d.concept.svg, /<script|on\w+=|href=|javascript:/i, 'в рисунке нет ничего исполняемого');
    assert.equal(d.building.facts.length, 4);
    assert.deepEqual(d.building.facts.map(f => f[0]), ['Что', 'Кто', 'Когда', 'Где']);
    assert.ok(d.building.why.length >= 2 && d.building.look.length >= 2);
    assert.ok(d.practice.minutes === 10 && d.practice.steps.length >= 3 && d.practice.done);
    assert.equal(d.quiz.length, 3, 'мини-тест из трёх вопросов');
    d.quiz.forEach(q => {
      assert.ok(!qIds.has(q.id), 'повтор id вопроса ' + q.id); qIds.add(q.id);
      assert.equal(q.options.filter(o => o.correct).length, 1, q.id);
      assert.equal(new Set(q.options.map(o => o.text)).size, q.options.length);
      assert.ok(q.explain.length > 20);
    });
    assert.equal(d.terms.length, 5, 'пять терминов в день');
    d.terms.forEach(t => { assert.ok(!tIds.has(t.id)); tIds.add(t.id); assert.ok(t.en && t.ru && t.ex && t.exRu); assert.match(t.en, /^[a-z -]+$/); });
    assert.ok(!lookIds.has(d.look.id)); lookIds.add(d.look.id);
    assert.ok(d.look.name && d.look.author && d.look.year && d.look.city);
    assert.ok(d.look.why.length >= 2 && d.look.why.length <= 3, '2–3 предложения, почему работа сильная');
    assert.ok(K.SKETCH_THEMES.includes(d.sketch.theme));
    for (const p of [d.building.photo, d.look.photo]) {
      assert.match(p.src, /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//);
      assert.match(p.page, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      assert.ok(p.author && p.alt.length > 15);
      assert.match(p.license, /^CC (BY|BY-SA) \d\.\d|^CC0|^Public domain/);
    }
    [d.concept.sources, d.building.sources, d.look.sources].forEach(list => {
      assert.ok(list.length >= 1);
      list.forEach(s => { assert.ok(s.t); if (s.u) assert.match(s.u, /^https:\/\//); });
    });
  });
});

test('задания недели и поля записей', () => {
  const w = K.WEEKS[0];
  assert.ok(w.project.title && w.project.steps.length >= 3 && w.project.result);
  assert.match(w.city.title, /Усть-Каменогорск/);
  assert.deepEqual(K.CITY_FIELDS.map(f => f.key), ['name', 'function', 'materials', 'works', 'change']);
  assert.deepEqual(K.IDEA_FIELDS.map(f => f.key), ['problem', 'who', 'now', 'idea']);
  assert.deepEqual(K.PERSON_FIELDS.map(f => f.key), ['name', 'role', 'talk', 'learned']);
  [K.CITY_FIELDS, K.IDEA_FIELDS, K.PERSON_FIELDS, K.PROJECT_FIELDS].forEach(fs2 => fs2.forEach(f => { assert.ok(f.label && f.max > 0 && f.max <= 800 && ['text', 'area'].includes(f.type)); }));
  assert.ok(K.PEOPLE_QUESTIONS.length >= 5);
  assert.deepEqual(K.SKETCH_THEMES, ['Линия', 'Перспектива', 'Объём', 'Светотень', 'Фасад', 'План']);
});

test('задача по коду недели: решение проходит, вписанный ответ — нет', () => {
  const task = K.jsTask(1);
  const run = code => { let out = ''; new Function('console', code)({ log: (...a) => { out += a.join(' ') + '\n'; } }); return out; };
  assert.equal(task.validate(run(task.solution), task.solution).ok, true);
  const cheat = task.starter + 'console.log(14);';
  assert.equal(task.validate(run(cheat), cheat).ok, false);
  const other = task.starter + 'let area = length * width;\nconsole.log(area);';
  assert.equal(task.validate(run(other), other).ok, true, 'другой порядок множителей и своя переменная — тоже верно');
  const wrong = task.starter + 'console.log(width + length);';
  assert.equal(task.validate(run(wrong), wrong).ok, false);
  assert.equal(K.jsTask(99), null);
});

test('страница: разрешены только фото с Викисклада и свои; модули архитектуры подключены и закэшированы', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
  assert.match(csp, /img-src 'self' data: blob: https:\/\/upload\.wikimedia\.org;/);
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  for (const f of ['media.js', 'arch-logic.js', 'arch-course.js', 'arch.js']) {
    assert.match(html, new RegExp('js/' + f.replace('.', '\\.') + '\\?v=\\d+'), f + ' в index.html');
    assert.match(sw, new RegExp('js/' + f.replace('.', '\\.') + '\\?v=\\d+'), f + ' в sw.js');
  }
  const arch = fs.readFileSync(path.join(__dirname, '..', 'js', 'arch.js'), 'utf8');
  assert.equal((arch.match(/innerHTML/g) || []).length, 1, 'innerHTML только для своего статичного рисунка');
});
