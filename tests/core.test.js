const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/core.js');

const T0 = new Date(2026, 10, 8, 15, 30).getTime(); // 8 ноября 2026, 15:30 локально

test('новая карточка назначается на завтра с начала дня', () => {
  const c = C.newCard('a', T0);
  assert.equal(c.stage, 0);
  assert.equal(C.dayKey(c.due), '2026-11-09');
  assert.equal(new Date(c.due).getHours(), 0);
});

test('good двигает стадию и растит интервал: +3, +7, +16, +35, +90, дальше потолок', () => {
  let c = C.newCard('a', T0);
  const gaps = [];
  let now = c.due;
  for (let i = 0; i < 7; i++) {
    c = C.schedule(c, 'good', now);
    gaps.push(Math.round((C.startOfDay(c.due) - C.startOfDay(now)) / C.DAY));
    now = c.due;
  }
  assert.deepEqual(gaps, [3, 7, 16, 35, 90, 90, 90]);
});

test('hard не повышает стадию', () => {
  let c = C.newCard('a', T0);
  c = C.schedule(c, 'good', c.due); // stage 1
  const before = c.stage;
  c = C.schedule(c, 'hard', c.due);
  assert.equal(c.stage, before);
});

test('again: через 10 минут, стадия -2, затем успех трактуется как hard', () => {
  let c = C.newCard('a', T0);
  for (let i = 0; i < 3; i++) c = C.schedule(c, 'good', c.due); // stage 3
  assert.equal(c.stage, 3);
  const now = c.due;
  c = C.schedule(c, 'again', now);
  assert.equal(c.stage, 1);
  assert.equal(c.due, now + 600000);
  assert.equal(c.lapses, 1);
  assert.equal(c.relearn, true);
  const stage = c.stage;
  c = C.schedule(c, 'good', now + 600000);
  assert.equal(c.relearn, false);
  assert.equal(c.stage, stage, 'после релёрна стадия не растёт');
});

test('again на стадии 0 не уходит в минус', () => {
  const c = C.schedule(C.newCard('a', T0), 'again', T0);
  assert.equal(c.stage, 0);
});

test('dueCards: только просроченные, самые старые первыми', () => {
  const cards = {
    a: { id: 'a', stage: 0, due: T0 + 5 },
    b: { id: 'b', stage: 0, due: T0 - 100 },
    c: { id: 'c', stage: 0, due: T0 - 500 }
  };
  assert.deepEqual(C.dueCards(cards, T0).map(c => c.id), ['c', 'b']);
  assert.equal(C.cardStats(cards, T0).due, 2);
});

test('серия: подряд, один пропуск прощён, два — обнуляют', () => {
  const now = new Date(2026, 10, 8, 12).getTime();
  assert.deepEqual(C.streak([], now), { count: 0, forgiven: 0, alive: false, atRisk: false });
  const s1 = C.streak(['2026-11-06', '2026-11-07', '2026-11-08'], now);
  assert.equal(s1.count, 3); assert.equal(s1.atRisk, false);
  const s2 = C.streak(['2026-11-04', '2026-11-06', '2026-11-08'], now);
  assert.equal(s2.count, 3); assert.equal(s2.forgiven, 2);
  const s3 = C.streak(['2026-11-01', '2026-11-02', '2026-11-05'], now);
  assert.equal(s3.alive, false); assert.equal(s3.count, 0);
  const s4 = C.streak(['2026-11-07'], now);
  assert.equal(s4.count, 1); assert.equal(s4.atRisk, true);
  const s5 = C.streak(['2026-11-06'], now); // вчера пропущено, сегодня ещё можно
  assert.equal(s5.alive, true); assert.equal(s5.atRisk, true);
  const s6 = C.streak(['2026-11-01', '2026-11-05', '2026-11-06'], now); // разрыв 4 дня
  assert.equal(s6.count, 2);
});

test('weekStrip: понедельник первым, сегодня помечено', () => {
  const now = new Date(2026, 10, 8, 12).getTime(); // воскресенье
  const w = C.weekStrip(['2026-11-03', '2026-11-08'], now);
  assert.equal(w.length, 7);
  assert.equal(w[0].label, 'Пн'); assert.equal(w[0].key, '2026-11-02');
  assert.equal(w[6].today, true); assert.equal(w[6].active, true);
  assert.equal(w[1].active, true);
  assert.equal(w[5].future, false);
});

test('checkOutput: разные виды ошибок дают разные подсказки', () => {
  const E = 'Hello, World!';
  assert.equal(C.checkOutput('Hello, World!\n', E).ok, true);
  assert.equal(C.checkOutput('Hello, World!   \r\n', E).ok, true);
  assert.equal(C.checkOutput('', E).code, 'empty');
  assert.equal(C.checkOutput('hello, world!', E).code, 'case');
  assert.equal(C.checkOutput('Hello,World!', E).code, 'space');
  assert.equal(C.checkOutput('Hello, World!\nHello, World!', E).code, 'lines');
  assert.equal(C.checkOutput('Hello, World', E).code, 'diff');
  assert.equal(C.checkOutput('a\nb', 'a\nc').line, 2);
});

test('fillCheck: регистр отдельно, пустое отдельно', () => {
  assert.equal(C.fillCheck(' print ', ['print']).ok, true);
  assert.equal(C.fillCheck('Print', ['print']).code, 'case');
  assert.equal(C.fillCheck('', ['print']).code, 'empty');
  assert.equal(C.fillCheck('echo', ['print']).code, 'wrong');
  assert.equal(C.fillCheck("'", ['"', "'"]).ok, true);
});

test('parsonsCheck: несколько допустимых решений и указание места ошибки', () => {
  const sols = [['print', '(', '"x"', ')'], ['print', '(', '"x"', ')', ';']];
  assert.equal(C.parsonsCheck(['print', '(', '"x"', ')'], sols).ok, true);
  assert.equal(C.parsonsCheck(['print', '(', '"x"', ')', ';'], sols).ok, true);
  const r = C.parsonsCheck(['print', '"x"', '(', ')'], sols);
  assert.equal(r.ok, false); assert.equal(r.wrongAt, 1);
  assert.equal(C.parsonsCheck(['print', '('], sols).ok, false);
});

test('fixCurly заменяет умные кавычки', () => {
  const r = C.fixCurly('print(“Привет”) # ‘a’');
  assert.equal(r.code, 'print("Привет") # \'a\'');
  assert.equal(r.changed, true);
  assert.equal(C.fixCurly('print("a")').changed, false);
});

test('explainError узнаёт типовые ошибки Python и JS', () => {
  assert.match(C.explainError('py', 'SyntaxError: unterminated string literal (detected at line 1)'), /кавычка/);
  assert.match(C.explainError('py', "NameError: name 'Print' is not defined"), /Print/);
  assert.match(C.explainError('py', "SyntaxError: '(' was never closed"), /скобка/);
  assert.match(C.explainError('js', 'SyntaxError: Invalid or unexpected token'), /кавычка/);
  assert.match(C.explainError('js', 'ReferenceError: Console is not defined'), /Console/);
  assert.equal(C.explainError('py', 'ZeroDivisionError: division by zero'), null);
});

test('highlight: экранирует HTML и помечает незакрытую строку', () => {
  const h = C.highlight('print("<b>&</b>")', 'py');
  assert.ok(!h.includes('<b>'), 'пользовательский HTML не должен проходить как есть');
  assert.ok(h.includes('&lt;b&gt;'));
  assert.ok(h.includes('t-fn'));
  const open = C.highlight('print("Hello)', 'py');
  assert.ok(open.includes('t-open'));
  const closed = C.highlight('print("Hello")', 'py');
  assert.ok(!closed.includes('t-open'));
  assert.ok(C.highlight('# <script>alert(1)</script>', 'py').includes('&lt;script&gt;'));
  assert.ok(C.highlight('console.log("a") // x', 'js').includes('t-com'));
  assert.ok(C.highlight('x = 12', 'py').includes('t-num'));
});

test('highlight: апостроф в комментарии и экранированная кавычка', () => {
  assert.ok(C.highlight('print("a\\"b")', 'py').indexOf('t-open') === -1);
  assert.ok(C.highlight("# don't", 'py').indexOf('t-open') === -1);
});

test('icsDaily: валидная структура, CRLF, RRULE, строки ≤ 75 символов', () => {
  const ics = C.icsDaily({ title: 'Бастау: 5 минут кода', description: 'Открой приложение и повтори карточки, затем напиши print.', startMs: T0, minutes: 10, count: 7, nowMs: T0 });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('RRULE:FREQ=DAILY;COUNT=7'));
  assert.ok(ics.includes('BEGIN:VALARM'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  ics.split('\r\n').forEach(l => assert.ok(Array.from(l).length <= 75, 'слишком длинная строка: ' + l));
});

test('validateState: принимает нормальное, отвергает мусор', () => {
  const ok = { v: 1, lang: 'py', cards: { a: { stage: 0, due: 1 } }, lessons: {}, days: ['2026-11-08'] };
  assert.equal(C.validateState(ok), true);
  assert.equal(C.validateState(null), false);
  assert.equal(C.validateState([]), false);
  assert.equal(C.validateState({ ...ok, v: 2 }), false);
  assert.equal(C.validateState({ ...ok, lang: 'rb' }), false);
  assert.equal(C.validateState({ ...ok, cards: { a: { stage: 99, due: 1 } } }), false);
  assert.equal(C.validateState({ ...ok, days: ['вчера'] }), false);
});

test('shuffle не теряет элементов и не мутирует исходник', () => {
  const src = [1, 2, 3, 4, 5];
  const out = C.shuffle(src, () => 0.3);
  assert.deepEqual(out.slice().sort(), src);
  assert.deepEqual(src, [1, 2, 3, 4, 5]);
});
