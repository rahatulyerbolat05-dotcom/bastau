/* Бастау — чистое ядро без DOM: повторения, серия, проверка ответов, подсветка кода, .ics.
   Работает и в браузере (window.Core), и в Node (require) — поэтому покрыто тестами. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DAY = 864e5;
  // Интервалы повторения в днях. Принцип «интервал растёт» — из Cepeda 2006;
  // конкретные числа — эвристика (см. docs/SPEC.md).
  var INTERVALS = [1, 3, 7, 16, 35, 90];

  /* ---------- даты ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function startOfDay(ms) { var d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function addDays(ms, n) { var d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); }
  function keyToDayNum(k) {
    var p = k.split('-').map(Number);
    return Date.UTC(p[0], p[1] - 1, p[2]) / DAY;
  }

  /* ---------- повторения ---------- */
  function newCard(id, now) {
    return { id: id, stage: 0, due: addDays(startOfDay(now), INTERVALS[0]), reps: 0, lapses: 0, last: now, relearn: false };
  }

  // outcome: 'good' (вспомнил сразу), 'hard' (вспомнил, но неуверенно), 'again' (не вспомнил)
  function schedule(card, outcome, now) {
    var c = Object.assign({}, card);
    c.reps = (c.reps || 0) + 1;
    c.last = now;
    if (outcome === 'again') {
      c.lapses = (c.lapses || 0) + 1;
      c.stage = Math.max(0, c.stage - 2);
      c.due = now + 10 * 60000;
      c.relearn = true;
      return c;
    }
    if (c.relearn) { c.relearn = false; outcome = 'hard'; }
    if (outcome === 'good') c.stage = Math.min(c.stage + 1, INTERVALS.length - 1);
    c.due = addDays(startOfDay(now), INTERVALS[c.stage]);
    return c;
  }

  function dueCards(cards, now) {
    return Object.keys(cards || {}).map(function (k) { return cards[k]; })
      .filter(function (c) { return c && c.due <= now; })
      .sort(function (a, b) { return a.due - b.due; });
  }

  function cardStats(cards, now) {
    var list = Object.keys(cards || {}).map(function (k) { return cards[k]; });
    return {
      total: list.length,
      due: list.filter(function (c) { return c.due <= now; }).length,
      mastered: list.filter(function (c) { return c.stage >= 3; }).length
    };
  }

  function shuffle(arr, rnd) {
    rnd = rnd || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- серия: один пропущенный день подряд серию не обнуляет (Lally 2010) ---------- */
  function streak(keys, now) {
    var uniq = Array.from(new Set(keys || [])).sort();
    if (!uniq.length) return { count: 0, forgiven: 0, alive: false, atRisk: false };
    var days = uniq.map(keyToDayNum);
    var today = keyToDayNum(dayKey(now));
    var last = days[days.length - 1];
    if (today - last > 2) return { count: 0, forgiven: 0, alive: false, atRisk: false };
    var count = 1, forgiven = 0;
    for (var i = days.length - 1; i > 0; i--) {
      var gap = days[i] - days[i - 1];
      if (gap <= 2) { count++; if (gap === 2) forgiven++; } else break;
    }
    return { count: count, forgiven: forgiven, alive: true, atRisk: today - last >= 1 };
  }

  // 7 дней текущей недели, понедельник первым
  var WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  function weekStrip(keys, now) {
    var set = new Set(keys || []);
    var d = new Date(now);
    var dow = (d.getDay() + 6) % 7;
    var monday = addDays(startOfDay(now), -dow);
    var todayKey = dayKey(now);
    var out = [];
    for (var i = 0; i < 7; i++) {
      var ms = addDays(monday, i);
      var k = dayKey(ms);
      out.push({ key: k, label: WD[i], num: new Date(ms).getDate(), today: k === todayKey, active: set.has(k), future: k > todayKey });
    }
    return out;
  }

  /* ---------- проверка ответов ---------- */
  function normOut(s) {
    return String(s == null ? '' : s).replace(/\r\n?/g, '\n').split('\n')
      .map(function (l) { return l.replace(/[ \t]+$/, ''); }).join('\n').replace(/\n+$/, '');
  }

  // expected: строка (вывод целиком)
  function checkOutput(actual, expected) {
    var a = normOut(actual), e = normOut(expected);
    if (a === e) return { ok: true };
    if (a === '') return { ok: false, code: 'empty', msg: 'Программа ничего не вывела. Выводит на экран только команда вывода — проверь, что она есть и что ты нажал «Запустить».' };
    if (a.toLowerCase() === e.toLowerCase()) return { ok: false, code: 'case', msg: 'Заглавные и строчные буквы — разные символы. Сравни регистр букв.' };
    if (a.replace(/\s+/g, '') === e.replace(/\s+/g, '')) return { ok: false, code: 'space', msg: 'Слова верные, но пробелы или переносы строк отличаются.' };
    var al = a.split('\n'), el = e.split('\n');
    if (al.length !== el.length) return { ok: false, code: 'lines', msg: 'Нужно строк: ' + el.length + ', выведено: ' + al.length + '. Каждая команда вывода печатает свою строку.' };
    for (var i = 0; i < el.length; i++) {
      if (al[i] !== el[i]) return { ok: false, code: 'diff', line: i + 1, msg: 'Строка ' + (i + 1) + ' отличается от нужной. Сравни посимвольно: знаки препинания, пробелы, регистр.' };
    }
    return { ok: false, code: 'diff', msg: 'Вывод отличается от нужного.' };
  }

  function fillCheck(value, accepts) {
    var v = String(value == null ? '' : value).trim();
    var list = Array.isArray(accepts) ? accepts : [accepts];
    for (var i = 0; i < list.length; i++) if (v === list[i]) return { ok: true };
    for (var j = 0; j < list.length; j++) {
      if (v.toLowerCase() === String(list[j]).toLowerCase()) return { ok: false, code: 'case', msg: 'Проверь регистр: заглавные и строчные буквы — разные символы.' };
    }
    if (v === '') return { ok: false, code: 'empty', msg: 'Поле пустое.' };
    return { ok: false, code: 'wrong', msg: 'Не то. Посмотри на разбор строки выше.' };
  }

  // answer: массив токенов; solutions: массив допустимых массивов
  function parsonsCheck(answer, solutions) {
    for (var s = 0; s < solutions.length; s++) {
      if (answer.length === solutions[s].length && answer.every(function (t, i) { return t === solutions[s][i]; })) return { ok: true };
    }
    var best = solutions[0], wrongAt = 0;
    for (var i = 0; i < answer.length; i++) { if (answer[i] !== best[i]) { wrongAt = i; break; } wrongAt = i + 1; }
    var msg;
    if (wrongAt >= answer.length) msg = 'Блоки идут верно, но не хватает последних.';
    else if (wrongAt === 0) msg = 'Порядок нарушен с самого начала: программа начинается с команды.';
    else msg = 'Первые блоки (' + wrongAt + ') на месте, а дальше порядок нарушен.';
    return { ok: false, wrongAt: wrongAt, msg: msg };
  }

  // «умные» кавычки с телефона → обычные. Возвращает {code, changed}
  function fixCurly(code) {
    var out = String(code).replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u2018\u2019\u201A\u201B]/g, "'");
    return { code: out, changed: out !== code };
  }

  /* ---------- человеческие объяснения ошибок ---------- */
  var ERR_PY = [
    [/unterminated string literal/, 'Не закрыта кавычка. Текст в кавычках должен начинаться и заканчиваться кавычкой.'],
    [/'\(' was never closed/, 'Открыта скобка «(», но не закрыта. Добавь «)».'],
    [/unmatched '\)'/, 'Лишняя закрывающая скобка «)».'],
    [/Missing parentheses in call to 'print'/, 'В Python 3 после print нужны скобки: print(...).'],
    [/NameError: name '([^']+)' is not defined/, function (m) { return 'Python не знает слово «' + m[1] + '». Проверь написание и регистр. Если это переменная — она должна быть создана выше и написана точно так же. Если это текст — возьми его в кавычки.'; }],
    [/TypeError: can only concatenate str/, 'Нельзя сложить текст и число: Python не смешивает их сам. Преврати число в текст — str(5) — или выводи через запятую.'],
    [/TypeError: unsupported operand type/, 'Эти значения разных типов (например, число и текст) нельзя так сложить. Проверь, где кавычки, а где нет.'],
    [/Perhaps you forgot a comma/, 'Похоже, текст внутри скобок нужно взять в кавычки (или пропущена запятая).'],
    [/invalid character/, 'В коде «чужой» символ — например, умные кавычки или длинное тире. Перепечатай его с клавиатуры.'],
    [/IndentationError: unexpected indent/, 'Лишний отступ: строка не должна начинаться с пробелов.'],
    [/SyntaxError: invalid syntax/, 'Python не понял запись. Проверь кавычки, скобки и опечатки в указанной строке.']
  ];
  var ERR_JS = [
    [/Invalid or unexpected token/, 'Не закрыта кавычка или встретился «чужой» символ (например, умные кавычки).'],
    [/missing \) after argument list/, 'Не закрыта скобка или пропущена запятая внутри скобок.'],
    [/(\w+) is not defined/, function (m) { return 'JavaScript не знает слово «' + m[1] + '». Проверь написание и регистр. Если это переменная — она должна быть создана выше (let …) и написана точно так же. Если это текст — возьми его в кавычки.'; }],
    [/Unexpected end of input/, 'Код оборвался: не хватает закрывающей скобки или кавычки.'],
    [/Unexpected identifier/, 'Лишнее слово: возможно, текст нужно взять в кавычки.'],
    [/Unexpected token/, 'Встретился неожиданный символ. Проверь кавычки и скобки.'],
    [/Unexpected string/, 'Строка стоит не там: проверь, не пропущена ли запятая или скобка перед ней.']
  ];
  function explainError(lang, raw) {
    var table = lang === 'js' ? ERR_JS : ERR_PY;
    var text = String(raw || '');
    for (var i = 0; i < table.length; i++) {
      var m = table[i][0].exec(text);
      if (m) return typeof table[i][1] === 'function' ? table[i][1](m) : table[i][1];
    }
    return null;
  }
  // Лучшее из доступных объяснений: по коду → по тексту ошибки → общее с номером строки.
  function friendlyError(lang, code, raw) {
    var d = diagnose(lang, code, raw) || explainError(lang, raw);
    if (d) return d;
    var m = /line (\d+)/.exec(String(raw || ''));
    return 'Эту ошибку я не умею объяснять автоматически.' + (m ? ' Посмотри на строку ' + m[1] + ':' : ' Проверь:') + ' все ли скобки и кавычки закрыты, нет ли опечаток в командах и именах.';
  }

  /* ---------- диагностика по коду: конкретная подсказка «что исправить» ----------
     explainError смотрит только на текст ошибки. diagnose смотрит ещё и на сам код:
     находит типичные промахи новичка и отвечает на языке его собственной программы. */
  var HOMO = { 'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'к': 'k', 'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'О': 'O', 'Р': 'P', 'Х': 'X', 'К': 'K', 'М': 'M', 'Т': 'T', 'Н': 'H' };
  function latinize(w) { return String(w).replace(/[Ѐ-ӿ]/g, function (ch) { return HOMO[ch] || ch; }); }
  function hasCyr(w) { return /[Ѐ-ӿ]/.test(w); }
  function hasLat(w) { return /[A-Za-z]/.test(w); }

  // Код без содержимого строк и комментариев (длина и переносы сохраняются) — чтобы шаблоны не срабатывали внутри текста.
  function bareCode(code, lang) {
    var s = String(code), out = '', i = 0, n = s.length;
    while (i < n) {
      var ch = s[i];
      if ((lang === 'py' && ch === '#') || (lang === 'js' && ch === '/' && s[i + 1] === '/')) {
        while (i < n && s[i] !== '\n') { out += ' '; i++; }
        continue;
      }
      if (ch === '"' || ch === "'" || (lang === 'js' && ch === '`')) {
        out += ch; i++;
        while (i < n && s[i] !== ch && (ch === '`' || s[i] !== '\n')) {
          if (s[i] === '\\' && i + 1 < n && s[i + 1] !== '\n') { out += '  '; i += 2; continue; }
          out += s[i] === '\n' ? '\n' : ' '; i++;
        }
        if (i < n && s[i] === ch) { out += ch; i++; }
        continue;
      }
      out += ch; i++;
    }
    return out;
  }

  function lev(a, b) {
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  var ID = '[\\p{L}_$][\\p{L}\\p{N}_$]*';
  function definedNames(bare, lang) {
    var out = [], m, re;
    if (lang === 'js') {
      re = new RegExp('\\b(?:let|const|var)\\s+(' + ID + ')', 'gu');
      while ((m = re.exec(bare))) out.push(m[1]);
    } else {
      re = new RegExp('\\bfor\\s+(' + ID + ')\\s+in\\b', 'gu');
      while ((m = re.exec(bare))) out.push(m[1]);
    }
    re = new RegExp('^[ \\t]*(' + ID + ')[ \\t]*=(?!=)', 'gmu');
    while ((m = re.exec(bare))) out.push(m[1]);
    return out.filter(function (x, i) { return out.indexOf(x) === i; });
  }
  var KNOWN = {
    py: ['print', 'range', 'len', 'int', 'str', 'float', 'input', 'True', 'False', 'None'],
    js: ['console', 'true', 'false', 'null', 'undefined']
  };
  var NO_IO = 'Ввод с клавиатуры и окна браузера в Бастау не работают: программа выполняется отдельно от страницы. Задай значение прямо в коде, например: ';

  function brackets(bare) {
    var pairs = [['(', ')'], ['{', '}'], ['[', ']']];
    for (var i = 0; i < pairs.length; i++) {
      var o = bare.split(pairs[i][0]).length - 1, c = bare.split(pairs[i][1]).length - 1;
      if (o > c) return 'Не хватает закрывающей «' + pairs[i][1] + '»: открыто ' + o + ', закрыто ' + c + '. Каждую открытую скобку нужно закрыть.';
      if (c > o) return 'Лишняя закрывающая «' + pairs[i][1] + '»: открыто ' + o + ', закрыто ' + c + '. Убери лишнюю или добавь открывающую.';
    }
    return null;
  }
  function oddQuoteLine(code) {
    var lines = String(code).split('\n');
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].replace(/\\./g, '');
      if ((l.split('"').length - 1) % 2 === 1 || ((l.split("'").length - 1) % 2 === 1 && l.indexOf('"') === -1)) return i + 1;
    }
    return 0;
  }

  // Подсказка про неизвестное слово w
  function nameHint(lang, w, code, bare) {
    var py = lang !== 'js';
    var defined = definedNames(bare, lang);
    var pool = defined.concat(KNOWN[lang]);
    var lines = String(code).split('\n'), bl = bare.split('\n'), i, m;
    var wRe = w.replace(/[$]/g, '\\$');

    if (!py && /^(prompt|alert|confirm|document|window|input)$/.test(w)) return (w === 'input' ? 'input — это команда Python, в JavaScript её нет. ' : '') + NO_IO + 'let name = "Аян";';
    if (py && w === 'console') return 'console.log — это JavaScript. В Python вывод пишется так: print("текст")';
    if (!py && w === 'print') return 'print — это Python. В JavaScript вывод пишется так: console.log("текст");';
    if (py && /^(true|false|none|null)$/.test(w)) return 'В Python это слово пишется с большой буквы: ' + (w === 'true' ? 'True' : w === 'false' ? 'False' : 'None') + '.';
    if (!py && /^(True|False|None)$/.test(w)) return 'В JavaScript это слово пишется с маленькой буквы: ' + (w === 'True' ? 'true' : w === 'False' ? 'false' : 'null') + '.';

    // русская буква, похожая на английскую
    if (hasCyr(w) && (hasLat(w) || pool.indexOf(latinize(w)) !== -1)) {
      var bad = (/[Ѐ-ӿ]/.exec(w) || [''])[0];
      return 'В слове «' + w + '» есть русская буква «' + bad + '». Она выглядит как английская' + (HOMO[bad] ? ' «' + HOMO[bad] + '»' : '') + ', но для компьютера это другой символ. Переключи раскладку на английскую и набери слово заново.';
    }
    for (i = 0; i < defined.length; i++) {
      if (defined[i] !== w && hasCyr(defined[i]) && latinize(defined[i]) === w) return 'Имя «' + defined[i] + '» выше набрано с русской буквой, а здесь «' + w + '» — английскими. Выглядят одинаково, но для компьютера это разные имена. Набери оба в одной раскладке.';
    }
    // регистр
    for (i = 0; i < pool.length; i++) {
      if (pool[i] !== w && pool[i].toLowerCase() === w.toLowerCase()) return 'Большие и маленькие буквы — разные символы. У тебя «' + w + '», а нужно «' + pool[i] + '».';
    }
    // опечатка
    var best = null, bd = 99;
    pool.forEach(function (c) { var d = lev(w.toLowerCase(), c.toLowerCase()); if (d < bd) { bd = d; best = c; } });
    if (best && bd > 0 && ((bd === 1 && w.length >= 3) || (bd === 2 && w.length >= 5))) return 'Похоже на опечатку: у тебя «' + w + '», а нужно «' + best + '». Компьютер сравнивает имена буква в букву.';
    // name("Zhanat") — переменную создают знаком =, а не скобками
    for (i = 0; i < bl.length; i++) {
      if (new RegExp('^\\s*' + wRe + '\\s*\\(', 'u').test(bl[i])) {
        m = new RegExp('^\\s*' + wRe + '\\s*\\(\\s*(.*?)\\s*\\)\\s*;?\\s*$', 'u').exec(lines[i]);
        if (m && /^(["'].*["']|-?\d+(\.\d+)?)$/.test(m[1])) return 'Похоже, ты создаёшь переменную ' + w + '. Для этого нужен знак =, а не скобки: ' + (py ? '' : 'let ') + w + ' = ' + m[1] + (py ? '' : ';') + '. Скобки ставят только после команд, например ' + (py ? 'print(...)' : 'console.log(...)') + '.';
      }
      if (new RegExp('^\\s*' + wRe + '\\s*==', 'u').test(bl[i])) return 'Два знака == сравнивают, а не создают. Чтобы положить значение в ' + w + ', нужен один знак: ' + (py ? '' : 'let ') + w + ' = …';
    }
    return 'Компьютер не знает слово «' + w + '». Если это текст — возьми его в кавычки: "' + w + '". Если это переменная — сначала создай её выше: ' + (py ? '' : 'let ') + w + ' = …';
  }

  function diagnose(lang, code, rawError) {
    var err = String(rawError || ''), src = String(code || '');
    if (!err) return null;
    if (/OutputLimit|вывела больше \d+ строк/.test(err)) return 'Цикл не может закончиться: его условие всегда верно. Проверь, что внутри цикла меняется переменная из условия, например i = i + 1.';
    var py = lang !== 'js';
    var bare = bareCode(src, lang), bl = bare.split('\n'), lines = src.split('\n'), m, i, b;
    function anyLine(re) { for (var k = 0; k < bl.length; k++) if (re.test(bl[k])) return k + 1; return 0; }

    // 1. неизвестное слово
    m = py ? /NameError: name '([^']+)' is not defined/.exec(err) : /ReferenceError: (\S+) is not defined/.exec(err);
    if (m) return nameHint(lang, m[1], src, bare);

    if (py) {
      if (/EOFError/.test(err) || (/\binput\s*\(/.test(bare) && /OSError|I\/O error/.test(err))) return NO_IO + 'name = "Аян"';
      if (/Maybe you meant '=='/.test(err)) return 'В условии нужно сравнение — два знака ==. Один знак = кладёт значение в переменную, а не сравнивает.';
      if (/expected ':'/.test(err)) {
        if (anyLine(/^\s*else\s+if\b/)) return 'В Python пишут elif, а не else if.';
        return 'В конце строки с if, elif, else, for или while нужно двоеточие «:». Оно говорит: «дальше идут команды, которые выполняются по этому условию».';
      }
      if (/expected an indented block/.test(err)) return 'После строки с двоеточием следующая строка должна начинаться с отступа — 4 пробела. По отступу Python понимает, какие команды «внутри» if или for.';
      if (/unindent does not match|TabError|inconsistent use of tabs/.test(err)) return 'Отступы разной ширины. Сделай все отступы внутри одного блока одинаковыми: по 4 пробела.';
      if (/unexpected indent/.test(err)) return 'Лишний отступ в начале строки. Отступ нужен только для команд внутри if, for или while.';
      if (/SyntaxError|IndentationError/.test(err)) {
        if (anyLine(/^\s*(let|const|var)\s/)) return 'let, const и var — это JavaScript. В Python переменная создаётся без них: name = "Аян"';
        if (anyLine(/\bprint\s+["'\w]/) && /Missing parentheses/.test(err)) return 'После print нужны скобки: print("текст")';
        if (anyLine(/[{}]/) && anyLine(/^\s*(if|else|elif|for|while)\b.*\{|^\s*\}/)) return 'Фигурные скобки { } — из JavaScript. В Python блок задаётся двоеточием и отступом:\nif x > 3:\n    print("да")';
        if (anyLine(/&&|\|\|/)) return 'В Python условия соединяют словами: and (и), or (или), not (не). Значки && и || — из JavaScript.';
        if (/invalid decimal literal/.test(err)) return 'Имя не может начинаться с цифры. Например, name1 вместо 1name.';
        if (anyLine(/\brange\s+\d/)) return 'range пишется со скобками: range(3)';
        if (anyLine(/^\s*else\b/) && !anyLine(/^\s*if\b/)) return 'else не может стоять сам по себе: перед ним должен быть if.';
        if (/Perhaps you forgot a comma/.test(err)) return 'Между значениями в скобках нужна запятая: print(a, b). А если это текст — возьми его в кавычки.';
        if (anyLine(new RegExp('^\\s*' + ID + '\\s+' + ID + '\\s*=(?!=)', 'u'))) return 'В имени переменной не может быть пробела. Соедини слова подчёркиванием: my_name = …';
        if (anyLine(/\S\s+print\s*\(/) && !anyLine(/^\s*(if|elif|else|for|while)\b.*:\s*print/)) return 'Две команды на одной строке. Каждую команду пиши с новой строки.';
        if (/unterminated string literal/.test(err)) { i = oddQuoteLine(src); return 'Не закрыта кавычка' + (i ? ' в строке ' + i : '') + '. Текст должен начинаться и заканчиваться одинаковой кавычкой: "текст".'; }
        if (/was never closed|unmatched/.test(err)) { b = brackets(bare); if (b) return b; }
      }
      if (/ZeroDivisionError/.test(err)) return 'Делить на ноль нельзя. Проверь число или переменную после знака деления.';
      if (/invalid literal for int\(\)/.test(err)) return 'int() превращает в число только текст из цифр, например int("15"). Текст с буквами числом сделать нельзя.';
      if (/IndexError/.test(err)) return 'В списке нет элемента с таким номером. Счёт начинается с 0: у списка из трёх элементов номера 0, 1 и 2.';
      if (/can't multiply sequence by non-int/.test(err)) return 'Текст нельзя умножить на текст. Если хочешь считать, убери кавычки вокруг чисел.';
      if (/object is not callable/.test(err)) return 'После значения стоят скобки, будто это команда. Скобки ставят только после команд, например print(...).';
      if (/has no len\(\)/.test(err)) return 'len() считает длину текста или списка. У числа длины нет.';
      if (/AttributeError/.test(err)) return 'У этого значения нет такой команды после точки. Проверь написание.';
      if (/KeyError/.test(err)) return 'В словаре нет такого ключа. Проверь написание ключа и кавычки.';
      return null;
    }

    // JavaScript
    m = new RegExp('\\b(let|const|var)\\s+(' + ID + ')\\s*\\(', 'u').exec(bare);
    if (m) {
      i = bare.slice(0, m.index).split('\n').length - 1;
      var arg = new RegExp(m[2].replace(/[$]/g, '\\$') + '\\s*\\(\\s*(.*?)\\s*\\)', 'u').exec(lines[i] || '');
      return 'Переменная создаётся знаком =, а не скобками. Напиши: ' + m[1] + ' ' + m[2] + ' = ' + (arg && arg[1] ? arg[1] : '…') + '; Скобки ставят только после команд, например console.log(...).';
    }
    if (/has already been declared/.test(err)) { m = /Identifier '([^']+)'/.exec(err); return 'Переменная ' + (m ? m[1] : '') + ' уже создана выше. let пишут один раз — при создании. Чтобы изменить значение, пиши без let: ' + (m ? m[1] : 'x') + ' = …;'; }
    if (/Assignment to constant variable/.test(err)) return 'const — это значение, которое нельзя менять. Если его нужно менять, создай переменную через let.';
    if (/before initialization/.test(err)) { m = /access '([^']+)'/.exec(err); return 'Переменная ' + (m ? m[1] : '') + ' используется раньше, чем создана. Перенеси строку с let выше.'; }
    m = /TypeError: (\S+) is not a function/.exec(err);
    if (m) {
      if (/^console\./i.test(m[1])) return 'Команда вывода пишется так: console.log — все буквы маленькие. У тебя «' + m[1] + '».';
      return 'После «' + m[1] + '» стоят скобки, будто это команда, но это не команда. Скобки ставят только после команд, например console.log(...).';
    }
    m = /Cannot read properties of (undefined|null) \(reading '([^']+)'\)/.exec(err);
    if (m) return 'Ты пишешь «.' + m[2] + '» после переменной, в которой ещё ничего нет. Проверь, что выше в неё положили значение.';
    if (/SyntaxError/.test(err)) {
      if (anyLine(/\b(let|const|var)\s+\d/)) return 'Имя не может начинаться с цифры. Например, name1 вместо 1name.';
      if (anyLine(new RegExp('\\b(let|const|var)\\s+' + ID + '\\s+' + ID + '\\s*=', 'u'))) return 'В имени переменной не может быть пробела. Пиши слитно: myName.';
      if (anyLine(/\belif\b/)) return 'В JavaScript пишут else if, а не elif.';
      if (anyLine(/^\s*(if|while|for)\s+[^(\s]/)) return 'В JavaScript условие пишут в круглых скобках, а команды — в фигурных:\nif (x > 3) {\n  console.log("да");\n}';
      if (anyLine(/\b(and|or|not)\b/)) return 'В JavaScript условия соединяют значками: && (и), || (или), ! (не). Слова and и or — из Python.';
      if (anyLine(/^\s*(if|else|for|while)\b.*:\s*$/)) return 'Двоеточие в конце — из Python. В JavaScript команды блока пишут в фигурных скобках:\nif (x > 3) {\n  console.log("да");\n}';
      if (anyLine(/\bconsole\.log\s+["'`\w]/)) return 'После console.log нужны скобки: console.log("текст");';
      if (/Invalid or unexpected token/.test(err)) { i = oddQuoteLine(src); if (i) return 'Не закрыта кавычка в строке ' + i + '. Текст должен начинаться и заканчиваться одинаковой кавычкой: "текст".'; }
      b = brackets(bare);
      if (b) return b;
      if (/Unexpected identifier/.test(err) && anyLine(/[^;{}\s]\s+(console\.log|let|const|var)\b/)) return 'Две команды на одной строке. Каждую команду пиши с новой строки и заканчивай точкой с запятой.';
    }
    return null;
  }

  /* ---------- подсветка кода (HTML-экранирование обязательно: код пользователя) ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var KW = {
    py: 'and as assert break class continue def del elif else except finally for from global if import in is lambda None nonlocal not or pass raise return try while with yield True False'.split(' '),
    js: 'async await break case catch class const continue default do else export finally for function if import in instanceof let new null of return switch this throw try typeof var void while true false undefined'.split(' ')
  };
  var KWSET = { py: new Set(KW.py), js: new Set(KW.js) };

  function highlightLine(line, lang) {
    var out = '', i = 0, n = line.length;
    while (i < n) {
      var ch = line[i];
      if ((lang === 'py' && ch === '#') || (lang === 'js' && ch === '/' && line[i + 1] === '/')) {
        out += '<span class="t-com">' + esc(line.slice(i)) + '</span>'; break;
      }
      if (ch === '"' || ch === "'" || (lang === 'js' && ch === '`')) {
        var j = i + 1, closed = false;
        while (j < n) {
          if (line[j] === '\\') { j += 2; continue; }
          if (line[j] === ch) { closed = true; j++; break; }
          j++;
        }
        if (j > n) j = n;
        out += '<span class="t-str' + (closed ? '' : ' t-open') + '">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      var rest = line.slice(i), m;
      if ((m = /^\d+(\.\d+)?/.exec(rest))) { out += '<span class="t-num">' + esc(m[0]) + '</span>'; i += m[0].length; continue; }
      if ((m = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(rest))) {
        var w = m[0], after = rest.slice(w.length).replace(/^\s+/, '');
        var cls = KWSET[lang] && KWSET[lang].has(w) ? 't-kw' : (after[0] === '(' ? 't-fn' : (w === 'console' ? 't-obj' : ''));
        out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
        i += w.length; continue;
      }
      out += esc(ch); i++;
    }
    return out;
  }
  function highlight(code, lang) {
    return String(code).split('\n').map(function (l) { return highlightLine(l, lang); }).join('\n');
  }

  /* ---------- .ics: ежедневное напоминание на 7 дней ---------- */
  function icsStamp(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function icsLocal(ms) {
    var d = new Date(ms);
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function icsFold(line) {
    // складываем по 70 символов (с запасом по октетам для кириллицы)
    var out = [], chunk = Array.from(line), cur = '';
    chunk.forEach(function (c) { if ((cur + c).length > 70) { out.push(cur); cur = ' ' + c; } else cur += c; });
    out.push(cur);
    return out.join('\r\n');
  }
  function icsDaily(opts) {
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bastau//RU', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + (opts.uid || 'bastau-' + opts.startMs) + '@bastau.local',
      'DTSTAMP:' + icsStamp(opts.nowMs || Date.now()),
      'DTSTART:' + icsLocal(opts.startMs),
      'DTEND:' + icsLocal(opts.startMs + (opts.minutes || 10) * 60000),
      'RRULE:FREQ=DAILY;COUNT=' + (opts.count || 7),
      'SUMMARY:' + icsEscape(opts.title),
      'DESCRIPTION:' + icsEscape(opts.description || ''),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(opts.title), 'TRIGGER:-PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }

  /* ---------- проверка импортируемого прогресса ---------- */
  function validateState(s) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
    if (s.v !== 1) return false;
    if (s.lang !== 'py' && s.lang !== 'js') return false;
    if (typeof s.cards !== 'object' || s.cards === null || Array.isArray(s.cards)) return false;
    if (typeof s.lessons !== 'object' || s.lessons === null || Array.isArray(s.lessons)) return false;
    if (!Array.isArray(s.days)) return false;
    var ok = true;
    Object.keys(s.cards).forEach(function (k) {
      var c = s.cards[k];
      if (!c || typeof c.stage !== 'number' || typeof c.due !== 'number' || c.stage < 0 || c.stage >= INTERVALS.length) ok = false;
    });
    s.days.forEach(function (d) { if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) ok = false; });
    return ok;
  }

  return {
    INTERVALS: INTERVALS, DAY: DAY,
    dayKey: dayKey, startOfDay: startOfDay, addDays: addDays,
    newCard: newCard, schedule: schedule, dueCards: dueCards, cardStats: cardStats, shuffle: shuffle,
    streak: streak, weekStrip: weekStrip,
    normOut: normOut, checkOutput: checkOutput, fillCheck: fillCheck, parsonsCheck: parsonsCheck, fixCurly: fixCurly,
    explainError: explainError, diagnose: diagnose, friendlyError: friendlyError, bareCode: bareCode, esc: esc, highlight: highlight,
    icsDaily: icsDaily, validateState: validateState
  };
});
