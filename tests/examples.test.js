const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');

const raw = fs.readFileSync(path.join(__dirname, '..', 'js', 'examples-data.js'), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(raw, ctx);
const DATA = ctx.window.EXAMPLES;
const snippets = DATA.projects.flatMap(p => p.snippets.map(s => ({ p, s })));

test('данные примеров: программы, фрагменты, обязательные поля', () => {
  assert.ok(DATA.projects.length >= 7, 'программ: ' + DATA.projects.length);
  const ids = new Set();
  DATA.projects.forEach(p => {
    assert.ok(!ids.has(p.id), 'повтор id ' + p.id); ids.add(p.id);
    ['name', 'tagline', 'where', 'icon'].forEach(k => assert.ok(p[k], p.id + ': нет ' + k));
    assert.ok(p.stack.length && p.tree.length && p.snippets.length, p.id + ': пусто');
    p.tree.forEach(t => assert.equal(t.length, 2));
  });
  snippets.forEach(({ p, s }) => {
    assert.ok(s.code.trim(), p.id + '/' + s.id + ': пустой код');
    assert.equal(s.nums.length, s.code.split('\n').length, s.id + ': номера строк не совпадают с кодом');
    assert.ok(s.bridge && s.notes.length >= 3, s.id + ': нужны связь с уроком и ≥3 пояснения');
    assert.ok(['js', 'py'].includes(s.lang), s.id + ': язык');
  });
});

test('в публичных примерах нет секретов и личных данных', () => {
  const bad = /(sk_[a-z0-9]{8,}|AIza[0-9A-Za-z_-]{20,}|gho_[0-9A-Za-z]{20,}|-----BEGIN [A-Z ]*PRIVATE|api[_-]?key["']?\s*[:=]\s*["'][^"']{8,}|password["']?\s*[:=]\s*["'][^"']+|https?:\/\/[^\s"']*github\.io\/raspisanie-2a)/i;
  assert.ok(!bad.test(raw), 'похоже на секрет или закрытую ссылку: ' + (raw.match(bad) || [''])[0]);
  // имена преподавателей и класса школьника не должны попадать в данные
  ['Әділханов', '2 «Ә»', '2a-x7k3'].forEach(w => assert.ok(!raw.includes(w), 'личные данные: ' + w));
});

test('демо на JavaScript запускаются и дают ожидаемый вывод', () => {
  const demos = snippets.filter(({ s }) => s.demo && s.demo.lang === 'js');
  assert.ok(demos.length >= 3);
  demos.forEach(({ s }) => {
    const out = [];
    const sandbox = vm.createContext({ console: { log: (...a) => out.push(a.join(' ')) }, TextEncoder, crypto: globalThis.crypto, Uint8Array });
    new vm.Script(s.demo.code).runInContext(sandbox, { timeout: 2000 });
    const text = out.join('\n').replace(/[  ]/g, ' ');
    (s.demo.expect || []).forEach(e => assert.ok(text.includes(e), s.id + ': нет «' + e + '» в\n' + text));
    (s.demo.expectRegex || []).forEach(r => out.forEach(l => assert.match(l, new RegExp(r))));
  });
});

test('демо на Python запускается (если python установлен)', t => {
  let py = null;
  try { py = cp.execFileSync('python', ['-X', 'utf8', '--version'], { encoding: 'utf8' }); } catch (e) { /* нет python */ }
  if (!py) return t.skip('python не найден');
  snippets.filter(({ s }) => s.demo && s.demo.lang === 'py').forEach(({ s }) => {
    const out = cp.execFileSync('python', ['-X', 'utf8', '-c', s.demo.code], { encoding: 'utf8', env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }) });
    s.demo.expect.forEach(e => assert.ok(out.includes(e), s.id + ': нет «' + e + '»'));
  });
});

test('номера строк фрагмента идут по возрастанию, «⋯» обозначает пропуск', () => {
  snippets.forEach(({ s }) => {
    const real = s.nums.filter(n => n > 0);
    for (let i = 1; i < real.length; i++) assert.ok(real[i] > real[i - 1], s.id);
    s.nums.forEach((n, i) => { if (n === 0) assert.equal(s.code.split('\n')[i], '…'); });
  });
});
