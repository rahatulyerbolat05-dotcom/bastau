// Нестандартные ситуации: типичные ошибки новичка реально запускаются в Python и JavaScript,
// и на каждую приложение должно дать конкретную подсказку «что исправить», а не общие слова.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const Core = require('../js/core.js');

function findPython() {
  for (const bin of ['python3', 'python']) {
    const r = cp.spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return bin;
  }
  return null;
}
const PY = findPython();
function errPy(code) {
  const r = cp.spawnSync(PY, ['-X', 'utf8', '-c', code], { encoding: 'utf8', timeout: 8000, input: '', env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }) });
  return r.status === 0 ? null : r.stderr;
}
function errJs(code) {
  try { new Function('console', code)({ log() {} }); return null; } catch (e) { return e.name + ': ' + e.message; }
}

// [что случилось, код, что должно быть в подсказке]
const PY_CASES = [
  ['скобки вместо =', 'name("Zhanat")\nprint(name)', /name = "Zhanat"/],
  ['let в Python', 'let name = "A"\nprint(name)', /JavaScript/],
  ['print без скобок', 'print "hi"', /скобки/],
  ['нет закрывающей кавычки', 'print("hi)', /кавычка в строке 1/],
  ['разные кавычки', "print('hi\")", /кавычка/],
  ['Print с большой буквы', 'Print("hi")', /«Print», а нужно «print»/],
  ['текст без кавычек', 'print(hi)', /"hi"/],
  ['текст + число', 'score = 5\nprint("Счёт: " + score)', /str\(5\)|запятую/],
  ['= в условии', 'x = 5\nif x = 5:\n    print("да")', /==/],
  ['нет двоеточия у if', 'x = 5\nif x == 5\n    print("да")', /двоеточие/],
  ['нет отступа', 'x = 5\nif x == 5:\nprint("да")', /отступ/],
  ['лишний отступ', 'x = 5\n    print(x)', /Лишний отступ/],
  ['опечатка prin', 'prin("hi")', /«prin», а нужно «print»/],
  ['русская р в print', 'рrint("hi")', /русская буква «р»/],
  ['русская с в имени', 'с = 5\nprint(c)', /русской буквой/],
  ['не закрыта скобка', 'print("hi"', /Не хватает закрывающей «\)»/],
  ['лишняя скобка', 'print("hi"))', /Лишняя закрывающая «\)»/],
  ['input', 'x = input()\nprint(x)', /прямо в коде/],
  ['две команды в строке', 'age = 15 print(age)', /с новой строки/],
  ['нет запятой', 'a = 1\nb = 2\nprint(a b)', /запятая/],
  ['имя с цифры', '1name = 5', /с цифры/],
  ['имя с пробелом', 'my name = "A"', /пробела/],
  ['for без двоеточия', 'for i in range(3)\n    print(i)', /двоеточие/],
  ['деление на ноль', 'print(10 / 0)', /на ноль/],
  ['true с маленькой', 'x = true', /True/],
  ['else if', 'x = 5\nif x > 3:\n    print(1)\nelse if x > 1:\n    print(2)', /elif/],
  ['фигурные скобки', 'x = 5\nif (x > 3) {\n    print(1)\n}', /Фигурные скобки/],
  ['&&', 'x = 5\nif x > 3 && x < 9:\n    print(1)', /and/],
  ['console.log в Python', 'console.log("hi")', /print\(/],
  ['int от букв', 'print(int("abc"))', /int\(\)/],
  ['нет такого номера в списке', 'a = [1, 2]\nprint(a[5])', /с 0/],
  ['== вместо =', 'x == 5\nprint(x)', /один знак/],
  ['else без if', 'else:\n    print(1)', /перед ним должен быть if/],
  ['текст * текст', 'print("5" * "5")', /кавычки/],
  ['range без скобок', 'for i in range 3:\n    print(i)', /range\(3\)/],
  ['скобки после числа', 'x = 5\nx()', /Скобки ставят только после команд/],
  ['опечатка в переменной', 'city = "Астана"\nprint(sity)', /«sity», а нужно «city»/],
  ['регистр в переменной', 'name = "Аян"\nprint(Name)', /«Name», а нужно «name»/]
];
const JS_CASES = [
  ['скобки вместо =', 'let name1("Zhanat");\nconsole.log(name1);', /let name1 = "Zhanat";/],
  ['нет закрывающей кавычки', 'console.log("hi);', /кавычка в строке 1/],
  ['Console с большой', 'Console.log("hi");', /«Console», а нужно «console»/],
  ['текст без кавычек', 'console.log(hi);', /"hi"/],
  ['console.Log', 'console.Log("hi");', /console\.log — все буквы маленькие/],
  ['опечатка consol', 'consol.log("hi");', /«consol», а нужно «console»/],
  ['print в JS', 'print("hi");', /console\.log\(/],
  ['повторный let', 'let x = 5;\nlet x = 6;', /уже создана/],
  ['меняем const', 'const x = 5;\nx = 6;', /через let/],
  ['if без скобок', 'let x = 5;\nif x == 5 {\n  console.log(1);\n}', /в круглых скобках/],
  ['нет }', 'let x = 5;\nif (x == 5) {\n  console.log(1);', /Не хватает закрывающей «\}»/],
  ['нет )', 'console.log("hi";', /Не хватает закрывающей «\)»/],
  ['нет запятой', 'console.log("a" "b");', /запятая/],
  ['русская с в console', 'соnsole.log("hi");', /русская буква/],
  ['prompt', 'let x = prompt("?");', /прямо в коде/],
  ['alert', 'alert("hi");', /прямо в коде/],
  ['имя с цифры', 'let 1name = 5;', /с цифры/],
  ['имя с пробелом', 'let my name = 5;', /пробела/],
  ['свойство у пустой переменной', 'let a;\nconsole.log(a.length);', /ничего нет/],
  ['две команды в строке', 'let x = 5 console.log(x);', /с новой строки/],
  ['elif', 'let x = 5;\nif (x > 3) {\n} elif (x > 1) {\n}', /else if/],
  ['and', 'let x = 5;\nif (x > 3 and x < 9) {\n}', /&&/],
  ['двоеточие как в Python', 'let x = 5;\nif (x > 3):\n  console.log(1);', /фигурных скобках/],
  ['True с большой', 'let x = True;', /true/],
  ['лишняя }', 'console.log(1);\n}', /Лишняя закрывающая «\}»/],
  ['лишняя )', 'console.log(1));', /Лишняя закрывающая «\)»/],
  ['скобки после числа', 'let x = 5;\nx();', /это не команда/],
  ['console.log без скобок', 'console.log "hi";', /нужны скобки/],
  ['input в JS', 'let x = input();', /Python/],
  ['используется раньше, чем создана', 'console.log(x);\nlet x = 5;', /раньше, чем создана/],
  ['опечатка в переменной', 'let city = "Астана";\nconsole.log(sity);', /«sity», а нужно «city»/]
];

test('ошибки новичка в Python: на каждую есть конкретная подсказка', { skip: PY ? false : 'нет python' }, () => {
  for (const [label, code, want] of PY_CASES) {
    const err = errPy(code);
    assert.ok(err, label + ': пример должен падать');
    const hint = Core.friendlyError('py', code, err);
    assert.match(hint, want, label + '\n  ошибка: ' + err.trim().split('\n').pop() + '\n  подсказка: ' + hint);
    assert.doesNotMatch(hint, /не умею объяснять/, label);
  }
});

test('ошибки новичка в JavaScript: на каждую есть конкретная подсказка', () => {
  for (const [label, code, want] of JS_CASES) {
    const err = errJs(code);
    assert.ok(err, label + ': пример должен падать');
    const hint = Core.friendlyError('js', code, err);
    assert.match(hint, want, label + '\n  ошибка: ' + err + '\n  подсказка: ' + hint);
    assert.doesNotMatch(hint, /не умею объяснять/, label);
  }
});

test('диагностика не срабатывает на текст внутри кавычек и не падает на мусоре', () => {
  // слова let / && / { внутри строки не должны влиять на подсказку
  const hint = Core.friendlyError('py', 'print("let x && { }")\nprint(hi)', "NameError: name 'hi' is not defined");
  assert.match(hint, /"hi"/);
  assert.equal(Core.diagnose('py', 'print(1)', ''), null);
  assert.equal(typeof Core.friendlyError('js', '', 'SomethingError: странное'), 'string');
  assert.match(Core.friendlyError('py', 'x', 'RuntimeError: boom, line 3'), /строку 3/);
  for (const junk of [null, undefined, 42, '\u0000', '((((', '"""']) {
    assert.doesNotThrow(() => Core.diagnose('py', junk, 'SyntaxError: invalid syntax'));
    assert.doesNotThrow(() => Core.diagnose('js', junk, 'SyntaxError: Unexpected token'));
  }
});

test('бесконечный цикл: понятное объяснение', () => {
  assert.match(Core.friendlyError('py', 'i = 1\nwhile i <= 3:\n    print(i)', 'Остановлено: программа вывела больше 2000 строк'), /i = i \+ 1/);
});

test('bareCode: строки и комментарии вычищены, длина сохранена', () => {
  const src = 'x = "if a && b"  # let y\nprint(x)';
  const b = Core.bareCode(src, 'py');
  assert.equal(b.length, src.length);
  assert.doesNotMatch(b, /&&|let|if/);
  assert.match(b, /print\(x\)/);
  const js = Core.bareCode('let s = `a\n{b}`; // while', 'js');
  assert.doesNotMatch(js, /while|\{/);
});
