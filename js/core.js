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
      if (v.toLowerCase() === String(list[j]).toLowerCase()) return { ok: false, code: 'case', msg: 'Проверь регистр: все буквы команды строчные.' };
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
    [/NameError: name '([^']+)' is not defined/, function (m) { return 'Python не знает слово «' + m[1] + '». Проверь написание и регистр (print — только строчными). Если это текст — возьми его в кавычки.'; }],
    [/Perhaps you forgot a comma/, 'Похоже, текст внутри скобок нужно взять в кавычки (или пропущена запятая).'],
    [/invalid character/, 'В коде «чужой» символ — например, умные кавычки или длинное тире. Перепечатай его с клавиатуры.'],
    [/IndentationError: unexpected indent/, 'Лишний отступ: строка не должна начинаться с пробелов.'],
    [/SyntaxError: invalid syntax/, 'Python не понял запись. Проверь кавычки, скобки и опечатки в указанной строке.']
  ];
  var ERR_JS = [
    [/Invalid or unexpected token/, 'Не закрыта кавычка или встретился «чужой» символ (например, умные кавычки).'],
    [/missing \) after argument list/, 'Не закрыта скобка или пропущена запятая внутри скобок.'],
    [/(\w+) is not defined/, function (m) { return 'JavaScript не знает слово «' + m[1] + '». Проверь написание и регистр (console — строчными). Если это текст — возьми его в кавычки.'; }],
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
    explainError: explainError, esc: esc, highlight: highlight,
    icsDaily: icsDaily, validateState: validateState
  };
});
