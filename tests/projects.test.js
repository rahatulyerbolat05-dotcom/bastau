// Проекты песочницы и направления: слияние между устройствами, проверка данных, состав направлений.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../js/core.js');
global.window = Object.assign(global.window || {}, { Core });
require('../js/course.js');
const Course = global.window.Course;

const T0 = Date.UTC(2026, 10, 21, 9, 0, 0);
const fresh = over => Object.assign({ v: 1, lang: 'js', level: null, created: T0, lessons: {}, cards: {}, days: [], minutes: {}, calib: [], notes: {}, plan: null, theme: 'auto', sandbox: {}, welcomed: true, epoch: 0, prefsAt: 0 }, over || {});
const view = s => Core.stable(Core.cloudView(s));
const proj = (id, u, over) => Object.assign({ id, name: 'Проект ' + id, lang: 'js', code: 'console.log(1);', at: T0, u }, over || {});

test('проекты: слияние устройств — новее побеждает, удаление не «воскресает», порядок не важен', () => {
  const phone = fresh({ projects: { a: proj('a', T0 + 10, { code: 'старый' }), b: proj('b', T0 + 5), c: proj('c', T0 + 1) } });
  const pc = fresh({ projects: { a: proj('a', T0 + 20, { code: 'новый' }), b: { id: 'b', u: T0 + 30, del: true }, d: proj('d', T0 + 2, { lang: 'html', code: '<h1>Hi</h1>' }) } });
  const ab = Core.mergeState(phone, pc), ba = Core.mergeState(pc, phone);
  assert.equal(view(ab), view(ba));
  assert.equal(view(Core.mergeState(ab, phone)), view(ab));
  assert.equal(ab.projects.a.code, 'новый');
  assert.equal(ab.projects.b.del, true);
  assert.ok(ab.projects.c && ab.projects.d);
  assert.equal(Core.validateState(ab), true);
  assert.equal('projects' in Core.mergeState(fresh(), fresh()), false, 'пустой раздел не появляется');
  assert.equal(Core.hasProgress(fresh({ projects: { a: proj('a', 1) } })), true);
  assert.equal(Core.hasProgress(fresh({ projects: { a: { id: 'a', u: 1, del: true } } })), false);
});

test('проекты: проверка данных отвергает мусор и слишком большие проекты', () => {
  assert.equal(Core.validateState(fresh({ projects: { a: proj('a', 1) } })), true);
  assert.equal(Core.validateState(fresh({ projects: { a: { id: 'a', u: 1, del: true } } })), true);
  const bad = [[], 'x', { a: null }, { a: { u: 1 } }, { a: proj('a', 1, { lang: 'php' }) }, { a: proj('a', 1, { name: 'я'.repeat(81) }) },
    { a: proj('a', 1, { code: 'x'.repeat(Core.PROJECT_CODE_MAX + 1) }) }, { a: proj('a', 'вчера') }];
  bad.forEach(p => assert.equal(Core.validateState(fresh({ projects: p })), false, JSON.stringify(p).slice(0, 60)));
  const many = {}; for (let i = 0; i <= Core.PROJECT_MAX; i++) many['p' + i] = proj('p' + i, 1);
  assert.equal(Core.validateState(fresh({ projects: many })), false);
});

test('подсветка HTML экранирует всё и не теряет текст', () => {
  const src = '<a href="x" onclick="alert(1)">Ссылка & <b>жирный</b></a><!-- <script> -->';
  const out = Core.highlight(src, 'html');
  assert.doesNotMatch(out.replace(/<\/?span[^>]*>/g, ''), /<|>/, 'в результате нет живых тегов, кроме подсветки');
  const text = out.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  assert.equal(text, src);
});

test('направления: у каждого есть уроки с днями по порядку; ключи и язык шагов', () => {
  const ids = Course.TRACKS.map(t => t.id);
  assert.deepEqual(ids, ['html', 'logic', 'math']);
  for (const t of Course.TRACKS) {
    const ls = Course.LESSONS.filter(l => l.track === t.id);
    assert.ok(ls.length >= 2, t.id);
    ls.forEach((l, i) => assert.equal(l.day, i + 1, t.id + ': дни по порядку'));
    for (const lang of ['py', 'js']) ls.forEach(l => {
      const c = Course.build(lang, l.id);
      assert.equal(c.track, t.id);
      if (t.id === 'math') assert.equal(c.keyLang, undefined, 'математика решается кодом — прогресс по языку');
      else assert.equal(c.keyLang, 'all', 'HTML и логика не зависят от языка');
      if (t.id === 'html') {
        assert.equal(c.stepLang, 'html');
        c.steps.filter(s => s.kind === 'html').forEach(s => { assert.equal(typeof s.validate, 'function'); assert.ok(s.solution && s.hints.length >= 2 && s.card); });
      }
    });
  }
  // программирование: уроки без track, дни 1..N по порядку
  Course.LESSONS.filter(l => !l.track).forEach((l, i) => assert.equal(l.day, i + 1));
});
