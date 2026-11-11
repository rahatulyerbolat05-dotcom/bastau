// Проверка уроков: структура + решения и «сломанные» старты реально запускаются в Python и JavaScript.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const cp = require('node:child_process');

global.window = { Core: require('../js/core.js') };
require('../js/course.js');
const Course = global.window.Course;
const Core = global.window.Core;

function findPython() {
  for (const bin of ['python3', 'python']) {
    const r = cp.spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return bin;
  }
  return null;
}
const PY = findPython();

function runJs(code) {
  let out = '', lines = 0;
  // тот же предел вывода, что в js/js-worker.js: бесконечный цикл с печатью обрывается, а не вешает тест
  const log = (...a) => {
    out += a.map(x => (typeof x === 'string' ? x : String(x))).join(' ') + '\n';
    if (++lines > 2000) { const e = new Error('слишком много вывода'); e.name = 'Остановлено'; throw e; }
  };
  try { new Function('console', code)({ log, info: log, warn: log, error: log }); return { ok: true, out }; }
  catch (e) { return { ok: false, out, error: e.name + ': ' + e.message }; }
}
function runPy(code) {
  const r = cp.spawnSync(PY, ['-X', 'utf8', '-c', code], { encoding: 'utf8', timeout: 8000, env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }) });
  return r.status === 0 ? { ok: true, out: r.stdout } : { ok: false, out: r.stdout, error: r.stderr };
}
function run(lang, code) { return lang === 'js' ? runJs(code) : runPy(code); }

// то же решение, что у приложения: validate(out, code) или сравнение с expect
function verdict(step, r, code) {
  if (!r.ok) return { ok: false, msg: r.error };
  return step.validate ? step.validate(r.out, code) : Core.checkOutput(r.out, step.expect);
}

const LANGS = ['py', 'js'];

test('уроки: id шагов уникальны, карточки существуют и не пересекаются между уроками', () => {
  assert.ok(Course.LESSONS.length >= 4);
  const seenCards = new Set();
  for (const lang of LANGS) {
    seenCards.clear();
    for (const l of Course.LESSONS) {
      const c = Course.build(lang, l.id);
      assert.equal(c.id, l.id);
      assert.equal(c.day, l.day);
      const ids = c.steps.map(s => s.id);
      assert.equal(new Set(ids).size, ids.length, l.id + ': повтор id шагов');
      assert.equal(ids[ids.length - 1], 'done');
      c.steps.forEach(s => { if (s.card) assert.ok(c.cards[s.card], l.id + ': нет карточки ' + s.card); });
      Object.keys(c.cards).forEach(k => { assert.ok(!seenCards.has(k), 'карточка ' + k + ' есть в двух уроках'); seenCards.add(k); });
    }
    assert.equal(Object.keys(Course.allCards(lang)).length, seenCards.size);
  }
});

test('вопросы: ровно один верный вариант, есть объяснение', () => {
  for (const lang of LANGS) {
    for (const l of Course.LESSONS) {
      const c = Course.build(lang, l.id);
      const mcqs = Object.values(c.cards).filter(d => d.kind === 'mcq');
      assert.ok(mcqs.length >= 5, l.id + ': мало вопросов');
      mcqs.forEach(q => {
        assert.equal(q.options.filter(o => o.correct).length, 1, l.id + '/' + q.card);
        assert.ok(q.explain && q.explain.length > 10);
        assert.equal(new Set(q.options.map(o => o.text)).size, q.options.length, q.card + ': одинаковые варианты');
      });
    }
  }
});

test('Parsons: решения состоят из блоков, есть лишний блок', () => {
  for (const lang of LANGS) {
    for (const l of Course.LESSONS) {
      Course.build(lang, l.id).steps.filter(s => s.kind === 'parsons').forEach(s => {
        s.solutions.forEach(sol => sol.forEach(t => assert.ok(s.tokens.includes(t), l.id + ': блока нет в наборе: ' + t)));
        assert.ok(s.tokens.length > s.solutions[0].length, l.id + ': нет лишнего блока');
        assert.equal(Core.parsonsCheck(s.solutions[0], s.solutions).ok, true);
      });
    }
  }
});

test('пропуски: у каждого поля есть допустимые ответы, лишних нет', () => {
  for (const lang of LANGS) {
    for (const l of Course.LESSONS) {
      Course.build(lang, l.id).steps.filter(s => s.kind === 'fill').forEach(s => {
        s.blanks.forEach(b => assert.ok(b.accept.length && b.accept.every(a => a.length), l.id));
        const used = s.tpl.filter(p => typeof p !== 'string').map(p => p.b).sort();
        assert.deepEqual(used, s.blanks.map((_, i) => i));
      });
    }
  }
});

for (const lang of LANGS) {
  test('код-шаги (' + lang + '): решение проходит, старт отладки/изменения — нет', { skip: lang === 'py' && !PY ? 'нет python' : false }, () => {
    for (const l of Course.LESSONS) {
      const c = Course.build(lang, l.id);
      c.steps.filter(s => s.kind === 'code').forEach(s => {
        const sol = run(lang, s.solution);
        const v = verdict(s, sol, s.solution);
        assert.equal(v.ok, true, l.id + '/' + s.id + ': решение не проходит: ' + (v.msg || '') + '\n' + s.solution);
        if (s.mode === 'debug' || s.mode === 'modify') {
          const st = run(lang, s.starter);
          assert.equal(verdict(s, st, s.starter).ok, false, l.id + '/' + s.id + ': старт уже «правильный»');
        }
      });
      Object.values(c.cards).filter(d => d.kind === 'code').forEach(d => {
        const v = verdict(d, run(lang, d.solution), d.solution);
        assert.equal(v.ok, true, l.id + '/' + d.card + ': решение карточки не проходит');
      });
    }
  });

  test('день 2 (' + lang + '): подсказки-«шорткаты» не засчитываются', { skip: lang === 'py' && !PY ? 'нет python' : false }, () => {
    const c = Course.build(lang, 'vars');
    const step = id => c.steps.find(s => s.id === id);
    const out = lang === 'js' ? 'console.log' : 'print';
    const end = lang === 'js' ? ';' : '';
    const decl = (n, v) => (lang === 'js' ? 'let ' : '') + n + ' = ' + v + end;

    // age: число выведено напрямую — вывод верный, но переменной нет
    const age = step('make1');
    assert.equal(verdict(age, run(lang, out + '(15)' + end), out + '(15)' + end).ok, false);
    assert.equal(verdict(age, run(lang, decl('age', 15) + '\n' + out + '(15)' + end), decl('age', 15) + '\n' + out + '(15)' + end).ok, false);
    assert.equal(verdict(age, run(lang, decl('age', 150) + '\n' + out + '(age)' + end), '').ok, false);

    // score: нужно действительно прибавлять к переменной
    const score = step('make2');
    const cheat = decl('score', 15) + '\n' + out + '(score)' + end;
    assert.equal(verdict(score, run(lang, cheat), cheat).ok, false);
    const plusEq = decl('score', 10) + '\nscore += 5' + end + '\n' + out + '(score)' + end;
    assert.equal(verdict(score, run(lang, plusEq), plusEq).ok, true);

    // modify: нельзя вписать итог в вывод
    const mod = step('modify');
    const hard = out + '("Алия 17")' + end;
    assert.equal(verdict(mod, run(lang, hard), hard).ok, false);
    const good = decl('name', '"Алия"') + '\n' + decl('age', 17) + '\n' + out + '(name, age)' + end;
    assert.equal(verdict(mod, run(lang, good), good).ok, true);
  });

  test('день 2 (' + lang + '): ожидаемые выводы предсказаний совпадают с реальными', { skip: lang === 'py' && !PY ? 'нет python' : false }, () => {
    const c = Course.build(lang, 'vars');
    c.steps.filter(s => s.kind === 'predict').forEach(s => {
      const r = run(lang, s.code);
      assert.equal(r.ok, true, s.id);
      assert.equal(Core.normOut(r.out), Core.normOut(s.expected), s.id + ': ожидание не совпало с реальным выводом');
      assert.equal(s.options.filter(o => o.correct).length, 1);
    });
  });
}

for (const lang of LANGS) {
  test('вопросы с кодом (' + lang + '): заявленный вывод совпадает с реальным, предсказания тоже', { skip: lang === 'py' && !PY ? 'нет python' : false }, () => {
    for (const l of Course.LESSONS) {
      const c = Course.build(lang, l.id);
      Object.values(c.cards).filter(d => d.kind === 'mcq' && d.out !== undefined).forEach(q => {
        const r = run(lang, q.code);
        assert.equal(r.ok, true, l.id + '/' + q.card + ': код вопроса падает: ' + r.error);
        assert.equal(Core.normOut(r.out), Core.normOut(q.out), l.id + '/' + q.card);
      });
      c.steps.filter(s => s.kind === 'predict').forEach(s => {
        const r = run(lang, s.code);
        assert.equal(r.ok, true, l.id + '/' + s.id);
        assert.equal(Core.normOut(r.out), Core.normOut(s.expected), l.id + '/' + s.id + ': ожидание не совпало с реальным выводом');
      });
      // во вступлении показан «экран» — он тоже должен быть правдой
      c.steps.filter(s => s.kind === 'intro').forEach(s => {
        assert.equal(Core.normOut(run(lang, s.flow.code).out), Core.normOut(s.flow.out), l.id + '/intro');
      });
    }
  });

  test('дни 3–4 (' + lang + '): обходные решения не засчитываются', { skip: lang === 'py' && !PY ? 'нет python' : false }, () => {
    const py = lang === 'py';
    const out = py ? 'print' : 'console.log', end = py ? '' : ';';
    const p = t => out + '(' + t + ')' + end;
    const check = (lessonId, stepId, code, want) => {
      const s = Course.build(lang, lessonId).steps.find(x => x.id === stepId);
      assert.equal(verdict(s, run(lang, code), code).ok, want, lessonId + '/' + stepId + ':\n' + code);
    };
    // условия: просто вывести ответ нельзя
    check('cond', 'make1', p('"Жарко"'), false);
    check('cond', 'make2', p('"Вход разрешён"'), false);
    check('cond', 'modify', p('"Можно"'), false);
    check('cond', 'debug2', p('"Скидка"'), false);
    // условие исправлено, но цена изменена — не то, что просили
    check('cond', 'debug2', py ? 'price = 500\nif price < 1000:\n    print("Скидка")\nelse:\n    print("Без скидки")'
      : 'let price = 500;\nif (price < 1000) {\n  console.log("Скидка");\n} else {\n  console.log("Без скидки");\n}', false);
    // циклы: несколько команд вывода подряд вместо цикла
    check('loops', 'make1', [1, 2, 3, 4].map(n => p(n)).join('\n'), false);
    check('loops', 'make2', [3, 2, 1].map(n => p(n)).join('\n') + '\n' + p('"Пуск!"'), false);
    check('loops', 'modify', [1, 2, 3, 4, 5].map(n => p(n)).join('\n'), false);
    // другой верный способ с циклом засчитывается
    check('loops', 'make1', py ? 'n = 0\nwhile n < 4:\n    n = n + 1\n    print(n)' : 'let n = 0;\nwhile (n < 4) {\n  n = n + 1;\n  console.log(n);\n}', true);
    check('loops', 'debug2', py ? 'i = 1\nwhile i < 6:\n    print(i)\n    i = i + 1' : 'let i = 1;\nwhile (i < 6) {\n  console.log(i);\n  i = i + 1;\n}', true);
    // бесконечный цикл из задания действительно не проходит и обрывается
    const inf = Course.build(lang, 'loops').steps.find(x => x.id === 'debug1');
    assert.equal(run(lang, inf.starter).ok, false);
  });
}

test('объяснения ошибок для переменных', () => {
  assert.match(Core.explainError('py', "NameError: name 'sity' is not defined"), /переменная/);
  assert.match(Core.explainError('js', 'ReferenceError: sity is not defined'), /переменная/);
  assert.match(Core.explainError('py', 'TypeError: can only concatenate str (not "int") to str'), /str\(5\)/);
});
