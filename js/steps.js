/* Рендеры шагов урока и карточек повторения.
   Контракт: Steps.mount(step, body, api). api даёт setPrimary/setSecondary/banner/finish/cleanup. */
(function () {
  'use strict';
  var h = window.UI.h, icon = window.UI.icon, haptic = window.UI.haptic, Core = window.Core;

  /* ---------- общие кирпичики ---------- */
  function codeBlock(code, lang) {
    var pre = h('pre', { class: 'codeblock' });
    pre.innerHTML = Core.highlight(code, lang);
    return pre;
  }

  function consoleView(lang) {
    var out = h('pre', { class: 'con-out' });
    var err = h('div', { class: 'con-err', hidden: true });
    var el = h('div', { class: 'console', role: 'log', 'aria-live': 'polite', 'aria-label': 'Вывод программы' },
      h('div', { class: 'con-head' }, h('span', { text: 'Вывод' })), out, err);
    function idle(text) {
      out.className = 'con-out muted'; out.textContent = text || 'Здесь появится результат.'; err.hidden = true; err.textContent = '';
    }
    function running() {
      var cold = window.Runner.status(lang) !== 'ready';
      out.className = 'con-out muted';
      out.textContent = '';
      err.hidden = true;
      out.appendChild(h('span', { class: 'spin', 'aria-hidden': 'true' }));
      out.appendChild(document.createTextNode(cold && lang === 'py' ? ' Готовим Python… Первый запуск занимает несколько секунд.' : ' Выполняю…'));
    }
    // подсказка может содержать пример кода со второй строки
    function friendlyNode(text) {
      var parts = String(text).split('\n');
      return h('div', { class: 'con-friendly' }, h('b', { text: 'Что исправить: ' }), parts[0],
        parts.length > 1 ? h('pre', { class: 'hint-code', text: parts.slice(1).join('\n') }) : null);
    }
    function show(r, code) {
      var text = (r.out || '').replace(/\n+$/, '');
      var all = text.split('\n');
      // длинный вывод показываем не целиком; у оборванного цикла — совсем коротко, чтобы подсказка была на виду
      var keep = /вывела больше \d+ строк/.test(r.error || '') ? 8 : 30;
      if (all.length > keep + 10) text = all.slice(0, keep).join('\n') + '\n… и ещё строк: ' + (all.length - keep);
      err.textContent = ''; err.hidden = true;
      if (text) { out.className = 'con-out'; out.textContent = text; }
      else { out.className = 'con-out muted'; out.textContent = r.ok ? '(программа ничего не вывела)' : ''; }
      var line = 0;
      if (r.error) {
        err.hidden = false;
        err.appendChild(h('pre', { class: 'con-raw', text: r.error }));
        var friendly = r.loadError ? null : (r.timedOut
          ? 'Скорее всего, цикл не может закончиться: его условие всегда верно. Проверь, что внутри цикла меняется переменная из условия.'
          : Core.friendlyError(lang, code || '', r.error));
        r.friendly = friendly;
        if (friendly) err.appendChild(friendlyNode(friendly));
        var m = /line (\d+)/.exec(r.error);
        if (m) line = parseInt(m[1], 10);
      }
      return line;
    }
    idle();
    return { el: el, idle: idle, running: running, show: show };
  }

  function execute(lang, code, con) {
    con.running();
    return window.Runner.run(lang, code).then(function (r) {
      var line = con.show(r, code);
      r.errorLine = line;
      return r;
    });
  }

  function confidenceRow(onChange) {
    var value = null;
    var opts = [['sure', 'Уверен'], ['maybe', 'Скорее да'], ['guess', 'Угадываю']];
    var btns = opts.map(function (o) {
      return h('button', {
        type: 'button', class: 'chip', role: 'radio', 'aria-checked': 'false', text: o[1],
        onclick: function () { value = o[0]; btns.forEach(function (b, i) { var on = opts[i][0] === value; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.classList.toggle('on', on); }); onChange(value); }
      });
    });
    var el = h('div', { class: 'conf' }, h('div', { class: 'conf-label', id: 'conf-l', text: 'Насколько ты уверен?' }), h('div', { class: 'chips', role: 'radiogroup', 'aria-labelledby': 'conf-l' }, btns));
    return { el: el, value: function () { return value; }, lock: function () { btns.forEach(function (b) { b.disabled = true; }); } };
  }

  function optionList(options, onPick) {
    var picked = -1;
    var btns = options.map(function (o, i) {
      return h('button', {
        type: 'button', class: 'opt', role: 'radio', 'aria-checked': 'false',
        onclick: function () { if (btns.locked) return; picked = i; btns.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); b.classList.toggle('on', j === i); }); haptic(6); onPick(i); }
      }, h('span', { class: 'opt-mark', 'aria-hidden': 'true' }), h('span', { class: 'opt-text', text: o.text }));
    });
    var el = h('div', { class: 'opts', role: 'radiogroup' }, btns);
    return {
      el: el, picked: function () { return picked; },
      reveal: function (correctIdx) {
        btns.locked = true;
        btns.forEach(function (b, i) {
          b.disabled = true;
          if (i === correctIdx) { b.classList.add('right'); b.querySelector('.opt-mark').textContent = '✓'; }
          else if (i === picked) { b.classList.add('wrong'); b.querySelector('.opt-mark').textContent = '✕'; }
        });
      }
    };
  }

  function shuffled(options) {
    var fixed = options.filter(function (o) { return o.dk; });
    var rest = options.filter(function (o) { return !o.dk; });
    return Core.shuffle(rest).concat(fixed);
  }

  function expectedVsGot(expected, got) {
    return h('div', { class: 'cmp' },
      h('div', { class: 'cmp-col' }, h('div', { class: 'cmp-h', text: 'Нужно' }), h('pre', { class: 'cmp-pre', text: expected })),
      h('div', { class: 'cmp-col' }, h('div', { class: 'cmp-h', text: 'Получилось' }), h('pre', { class: 'cmp-pre', text: got || '(пусто)' })));
  }

  /* ---------- intro ---------- */
  function mountIntro(step, body, api) {
    var flow = h('div', { class: 'flow', 'aria-hidden': 'true' },
      h('div', { class: 'flow-node' }, h('div', { class: 'flow-cap', text: 'Ты пишешь' }), codeBlock(step.flow.code, api.lang)),
      h('div', { class: 'flow-arrow' }, icon('chevron', 20)),
      h('div', { class: 'flow-node mid' }, h('div', { class: 'flow-cap', text: 'Компьютер' }), h('div', { class: 'flow-cpu', text: 'читает сверху вниз' })),
      h('div', { class: 'flow-arrow' }, icon('chevron', 20)),
      h('div', { class: 'flow-node' }, h('div', { class: 'flow-cap', text: 'Ты видишь' }), h('div', { class: 'flow-screen', text: step.flow.out })));
    body.appendChild(h('div', { class: 'intro' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.lead }),
      flow,
      h('ul', { class: 'points' }, step.points.map(function (p) { return h('li', null, icon('check', 18), h('span', { text: p })); })),
      h('p', { class: 'foot-note', text: step.foot })));
    api.setPrimary({ label: 'Поехали', onClick: function () { api.finish({ correct: true }, { advance: true }); } });
  }

  /* ---------- predict ---------- */
  function mountPredict(step, body, api) {
    var opts = shuffled(step.options);
    var chosen = null, conf = null, phase = 'choose';
    var con = consoleView(api.lang);
    var confRow = confidenceRow(function (v) { conf = v; sync(); });
    confRow.el.hidden = true;
    var list = optionList(opts, function (i) { chosen = opts[i]; confRow.el.hidden = !!chosen.dk; if (chosen.dk) conf = null; sync(); });
    var conBox = h('div', { hidden: true }, con.el);
    body.appendChild(h('div', { class: 'predict' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.question }),
      codeBlock(step.code, api.lang),
      list.el, confRow.el, conBox));

    function sync() {
      if (phase !== 'choose') return;
      var ready = chosen && (chosen.dk || conf);
      api.setPrimary({ label: 'Зафиксировать ответ', disabled: !ready, onClick: lock });
    }
    function lock() {
      phase = 'run'; confRow.lock();
      conBox.hidden = false;
      con.idle('Теперь запусти код и проверь себя.');
      api.setPrimary({ label: 'Запустить', icon: 'play', onClick: go });
    }
    function go() {
      api.setPrimary({ label: 'Выполняю…', disabled: true });
      execute(api.lang, step.code, con).then(function (r) {
        if (r.error) {
          api.banner({ kind: 'info', title: 'Не получилось запустить', text: r.loadError ? 'Python загружается из интернета при первом запуске. Проверь соединение и повтори — или переключись на JavaScript в «Прогресс → Настройки» (он работает офлайн).' : r.error });
          api.setPrimary({ label: 'Запустить ещё раз', icon: 'play', onClick: go });
          return;
        }
        var correctIdx = opts.findIndex(function (o) { return o.correct; });
        list.reveal(correctIdx);
        var correct = !!(chosen && chosen.correct);
        if (conf) window.Store.logCalib(conf, correct);
        var msg = chosen.dk ? step.after.dk : (correct ? step.after.ok : step.after.bad);
        var hyper = !correct && !chosen.dk && conf === 'sure' ? ' Ты был уверен — такие ошибки запоминаются лучше всего.' : '';
        api.banner({ kind: correct ? 'ok' : 'info', title: correct ? 'Верно' : (chosen.dk ? 'Смотри' : 'Не совсем'), text: msg + hyper });
        haptic(correct ? 10 : 6);
        api.finish({ correct: correct, conf: conf, dk: !!chosen.dk });
      });
    }
    sync();
  }

  /* ---------- anatomy ---------- */
  function mountAnatomy(step, body, api) {
    var keys = [];
    step.parts.forEach(function (p) { if (keys.indexOf(p.key) === -1) keys.push(p.key); });
    var seen = {};
    var panelRole = h('div', { class: 'anat-role', text: 'Нажми на любую часть' });
    var panelDesc = h('div', { class: 'anat-desc', text: 'Подсвеченные цвета — роли частей. Всего ролей: ' + keys.length + '.' });
    var progress = h('div', { class: 'anat-progress' });
    var summary = h('p', { class: 'anat-summary', hidden: true, text: step.summary });
    var buttons = step.parts.map(function (p) {
      return h('button', { type: 'button', class: 'part part-' + p.key, text: p.text, 'aria-label': step.roles[p.key].role + ': ' + p.text, onclick: function () { pick(p.key); } });
    });
    function updateProgress() {
      progress.textContent = '';
      keys.forEach(function (k) { progress.appendChild(h('span', { class: 'dot' + (seen[k] ? ' on' : '') })); });
      progress.appendChild(h('span', { class: 'anat-count', text: Object.keys(seen).length + ' из ' + keys.length }));
    }
    function pick(key) {
      seen[key] = true;
      buttons.forEach(function (b, i) { b.classList.toggle('active', step.parts[i].key === key); });
      panelRole.textContent = step.roles[key].role;
      panelDesc.textContent = step.roles[key].desc;
      updateProgress();
      haptic(5);
      if (Object.keys(seen).length === keys.length) {
        summary.hidden = false;
        api.setPrimary({ label: 'Дальше', onClick: function () { api.finish({ correct: true }, { advance: true }); } });
      }
    }
    body.appendChild(h('div', { class: 'anatomy' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.lead }),
      h('div', { class: 'anat-code', role: 'group', 'aria-label': 'Части кода' }, buttons),
      h('div', { class: 'anat-card', 'aria-live': 'polite' }, panelRole, panelDesc),
      progress, summary));
    updateProgress();
    api.setPrimary({ label: 'Дальше', disabled: true, onClick: function () { } });
  }

  /* ---------- parsons ---------- */
  function mountParsons(step, body, api) {
    var items = Core.shuffle(step.tokens.map(function (t, i) { return { id: i, text: t }; }));
    var answer = [];
    var fails = 0;
    var ansEl = h('div', { class: 'pz-answer' + (step.lines ? ' pz-lines' : ''), 'aria-label': 'Твоя программа', role: 'list' });
    var bankEl = h('div', { class: 'pz-bank' + (step.lines ? ' pz-lines' : ''), 'aria-label': 'Доступные блоки', role: 'list' });
    function tokBtn(it, inAnswer) {
      return h('button', {
        type: 'button', class: 'tok' + (inAnswer ? ' placed' : ''), role: 'listitem', text: it.text,
        'aria-label': (inAnswer ? 'Убрать блок ' : 'Добавить блок ') + it.text,
        onclick: function () { if (inAnswer) answer = answer.filter(function (x) { return x.id !== it.id; }); else answer.push(it); haptic(5); draw(); }
      });
    }
    function draw() {
      ansEl.textContent = ''; bankEl.textContent = '';
      if (!answer.length) ansEl.appendChild(h('span', { class: 'pz-empty', text: 'Нажимай на блоки ниже' }));
      answer.forEach(function (it) { ansEl.appendChild(tokBtn(it, true)); });
      items.filter(function (it) { return !answer.some(function (a) { return a.id === it.id; }); }).forEach(function (it) { bankEl.appendChild(tokBtn(it, false)); });
      api.setPrimary({ label: 'Проверить', disabled: !answer.length, onClick: check });
    }
    function check() {
      var texts = answer.map(function (a) { return a.text; });
      var r = Core.parsonsCheck(texts, step.solutions);
      if (r.ok) {
        ansEl.classList.add('ok');
        api.banner({ kind: 'ok', title: 'Собрано', text: step.okText || 'Команда, скобки и текст в кавычках — всё на своих местах.' });
        haptic(10);
        api.finish({ correct: fails === 0, tries: fails });
        return;
      }
      fails++;
      ansEl.classList.remove('shake'); void ansEl.offsetWidth; ansEl.classList.add('shake');
      var tip = null;
      Object.keys(step.tipIf || {}).forEach(function (k) { if (texts.indexOf(k) !== -1) tip = step.tipIf[k]; });
      api.banner({ kind: 'bad', title: 'Пока не то', text: tip || (step.failMsg ? step.failMsg(r) : r.msg) });
      if (fails >= 2) api.setSecondary({ label: 'Подсказка', onClick: function () { api.banner({ kind: 'info', title: 'Подсказка', text: step.hint }); } });
    }
    body.appendChild(h('div', { class: 'parsons' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.lead }), ansEl, bankEl));
    draw();
  }

  /* ---------- fill ---------- */
  function mountFill(step, body, api) {
    var inputs = [], fails = 0;
    var line = h('div', { class: 'fill-line' }, step.tpl.map(function (part) {
      if (typeof part === 'string') return h('span', { class: 'fill-text', text: part });
      var b = step.blanks[part.b];
      var inp = h('input', {
        type: 'text', class: 'blank', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', spellcheck: 'false',
        size: String(Math.max(2, b.accept[0].length + 1)), 'aria-label': 'Пропуск ' + (part.b + 1) + ': ' + b.label,
        onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } },
        oninput: function () { inp.classList.remove('ok', 'bad'); }
      });
      inputs.push({ el: inp, spec: b });
      return inp;
    }));
    body.appendChild(h('div', { class: 'fill' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.prompt }), line));
    function check() {
      var firstMsg = null, allOk = true;
      inputs.forEach(function (x) {
        var r = Core.fillCheck(x.el.value, x.spec.accept);
        x.el.classList.toggle('ok', r.ok); x.el.classList.toggle('bad', !r.ok);
        if (!r.ok) { allOk = false; if (!firstMsg) firstMsg = r.msg; }
      });
      if (allOk) {
        inputs.forEach(function (x) { x.el.disabled = true; });
        api.banner({ kind: 'ok', title: 'Всё сошлось', text: step.okText || 'Команда плюс текст, ограниченный кавычками с двух сторон.' });
        haptic(10);
        api.finish({ correct: fails === 0, tries: fails });
      } else {
        fails++;
        api.banner({ kind: 'bad', title: 'Есть ошибка', text: firstMsg });
        if (fails >= 2) api.setSecondary({ label: 'Подсказка', onClick: function () { api.banner({ kind: 'info', title: 'Подсказка', text: step.hintText || 'Первый пропуск — команда вывода. Два других — кавычки: одна открывает текст, другая закрывает.' }); } });
      }
    }
    api.setPrimary({ label: 'Проверить', onClick: check });
    setTimeout(function () { if (inputs[0]) inputs[0].el.focus(); }, 60);
  }

  /* ---------- code (modify / write / debug) ---------- */
  function mountCode(step, body, api) {
    var lang = api.lang;
    var tries = 0, hintsUsed = 0, revealed = false, busy = false, runs = 0, solved = false;
    var started = Date.now();
    var ed = window.Editor.create({ lang: lang, value: step.starter || '', minLines: step.mode === 'write' ? 4 : 3, onRun: run, label: 'Редактор кода: ' + step.title });
    var con = consoleView(lang);
    var promptEl = h('p', { class: 'task' }, step.prompt);
    body.appendChild(h('div', { class: 'codestep' },
      h('h1', { class: 'step-title', text: step.title }),
      step.preface && !api.review ? h('p', { class: 'preface' }, icon('bulb', 18), h('span', { text: step.preface })) : null,
      promptEl, ed.el, con.el));

    function hintsAllowed() { return !api.review; }
    function hintReady() { return tries >= 1 || Date.now() - started > 30000; }
    function updateSecondary() {
      if (solved) return;
      if (api.review) { api.setSecondary({ label: 'Не помню', onClick: reveal }); return; }
      if (!hintReady()) { api.setSecondary(null); return; }
      if (hintsUsed < step.hints.length) api.setSecondary({ label: 'Подсказка ' + (hintsUsed + 1) + ' из ' + step.hints.length, icon: 'bulb', onClick: showHint });
      else api.setSecondary({ label: 'Показать решение', onClick: reveal });
    }
    function showHint() {
      var t = step.hints[hintsUsed];
      hintsUsed++;
      api.banner({ kind: 'info', title: 'Подсказка ' + hintsUsed, text: t, code: hintsUsed === step.hints.length ? null : null });
      updateSecondary();
    }
    function reveal() {
      revealed = true;
      ed.setValue(step.solution);
      api.banner({ kind: 'info', title: 'Решение вставлено', text: 'Запусти его и убедись, что понимаешь, почему оно работает. Это задание вернётся в повторение раньше.' });
      api.setSecondary(null);
      api.setPrimary({ label: 'Запустить', icon: 'play', onClick: run });
    }
    var timer = setInterval(updateSecondary, 2000);
    api.cleanup(function () { clearInterval(timer); });

    function run() {
      if (busy || solved) return;
      var code = ed.getValue();
      if (!code.trim()) {
        api.banner({ kind: 'info', title: 'Редактор пуст', text: 'Напиши программу и нажми «Запустить».' });
        ed.focus(); return;
      }
      if (step.mode === 'modify' && code.trim() === (step.starter || '').trim()) {
        api.banner({ kind: 'info', title: 'Пока без изменений', text: step.unchangedMsg || 'Поменяй текст внутри кавычек — и запусти снова.' });
        ed.focus(); return;
      }
      busy = true; runs++;
      api.setPrimary({ label: 'Выполняю…', disabled: true });
      var untouched = step.mode === 'debug' && code.trim() === (step.starter || '').trim();
      execute(lang, code, con).then(function (r) {
        busy = false;
        ed.markError(r.errorLine || 0);
        if (r.curly) window.UI.toast('Телефон заменил кавычки на «умные» — мы подставили обычные.');
        if (r.loadError) {
          api.banner({ kind: 'info', title: 'Не удалось запустить', text: 'Python загружается из интернета при первом запуске. Проверь соединение и повтори — или переключись на JavaScript в «Прогресс → Настройки» (он работает офлайн).' });
        } else if (r.error) {
          if (!untouched) tries++;
          api.banner({ kind: untouched ? 'info' : 'bad', title: untouched ? 'Вот она, ошибка' : 'Есть ошибка', text: untouched ? 'Прочитай сообщение в «Выводе»: внизу — суть, выше — место. Теперь исправь код.' : (step.mode !== 'debug' && r.friendly ? r.friendly.split('\n')[0] : 'Программа не запустилась. В блоке «Вывод» написано, что исправить.') });
        } else {
          var v = step.validate ? step.validate(r.out, code) : window.Core.checkOutput(r.out, step.expect);
          if (v.ok) { return success(r); }
          tries++;
          api.banner({ kind: 'bad', title: 'Почти', text: v.msg, node: step.expect ? expectedVsGot(window.Core.normOut(step.expect), window.Core.normOut(r.out)) : null });
        }
        api.setPrimary({ label: 'Запустить', icon: 'play', onClick: run });
        updateSecondary();
      });
    }
    function success() {
      solved = true; haptic(12);
      ed.setReadOnly(true);
      api.setSecondary(null);
      var ok = !revealed && tries === 0 && hintsUsed === 0;
      var text = ok ? 'Получилось с первой попытки.' : (revealed ? 'Решено с готовым решением — вернёмся к этому в повторении.' : 'Получилось. Ошибки по дороге — это нормально, так и учатся.');
      if (step.after) text += ' ' + step.after;
      api.banner({ kind: 'ok', title: 'Верно', text: text });
      api.finish({ correct: ok, tries: tries, hints: hintsUsed, revealed: revealed });
    }
    api.setPrimary({ label: 'Запустить', icon: 'play', onClick: run });
    if (step.mode !== 'debug') setTimeout(function () { ed.focus(); }, 80);
    updateSecondary();
  }

  /* ---------- mcq (общий для quiz и карточек) ---------- */
  function mcqBlock(q, container, api, onAnswered) {
    var opts = shuffled(q.options);
    var conf = null, picked = null, answered = false;
    var confRow = confidenceRow(function (v) { conf = v; sync(); });
    confRow.el.hidden = true;
    var list = optionList(opts, function (i) { picked = opts[i]; confRow.el.hidden = false; sync(); });
    container.appendChild(h('div', { class: 'mcq' },
      h('p', { class: 'lead', text: q.q }),
      q.code ? codeBlock(q.code, api.lang) : null, list.el, confRow.el));
    function sync() {
      if (answered) return;
      api.setPrimary({ label: 'Ответить', disabled: !(picked && conf), onClick: answer });
    }
    function answer() {
      answered = true;
      var correct = !!picked.correct;
      confRow.lock();
      list.reveal(opts.findIndex(function (o) { return o.correct; }));
      window.Store.logCalib(conf, correct);
      var hyper = !correct && conf === 'sure' ? ' Ты был уверен — именно такие ошибки лучше всего исправляются, если прочитать объяснение.' : '';
      api.banner({ kind: correct ? 'ok' : 'bad', title: correct ? 'Верно' : 'Не совсем', text: q.explain + hyper });
      haptic(correct ? 10 : 6);
      onAnswered({ correct: correct, conf: conf });
    }
    sync();
  }

  function mountMcq(step, body, api) {
    body.appendChild(h('h1', { class: 'step-title', text: step.title || 'Вспомни' }));
    mcqBlock(step, body, api, function (res) { api.finish({ correct: res.correct, conf: res.conf }); });
  }

  /* ---------- quiz ---------- */
  function mountQuiz(step, body, api) {
    var idx = 0, results = [];
    var holder = h('div', { class: 'quiz-q' });
    var counter = h('div', { class: 'quiz-count' });
    body.appendChild(h('div', { class: 'quiz' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.lead }), counter, holder));
    function showQ() {
      holder.textContent = '';
      api.clearBanner();
      counter.textContent = 'Вопрос ' + (idx + 1) + ' из ' + step.questions.length;
      mcqBlock(step.questions[idx], holder, api, function (res) {
        results.push({ id: step.questions[idx].card, correct: res.correct });
        var last = idx === step.questions.length - 1;
        api.setPrimary({
          label: last ? 'Завершить' : 'Дальше', onClick: function () {
            if (last) api.finish({ correct: results.every(function (r) { return r.correct; }), score: results.filter(function (r) { return r.correct; }).length, total: results.length, cards: results }, { advance: true });
            else { idx++; showQ(); }
          }
        });
      });
    }
    showQ();
  }

  /* ---------- explain ---------- */
  function mountExplain(step, body, api) {
    var ta = h('textarea', { class: 'free', rows: '5', maxlength: '800', placeholder: 'Своими словами…', 'aria-label': 'Твоё объяснение', spellcheck: 'true' });
    var count = h('div', { class: 'free-count', text: '0 / ' + step.min });
    var modelBox = h('div', { class: 'model', hidden: true });
    var rate = h('div', { class: 'rate', hidden: true });
    body.appendChild(h('div', { class: 'explain' },
      h('h1', { class: 'step-title', text: step.title }),
      codeBlock(step.code, api.lang),
      h('p', { class: 'lead', text: step.prompt }), ta, count, modelBox, rate));
    ta.addEventListener('input', function () {
      var n = ta.value.trim().length;
      count.textContent = n + ' / ' + step.min;
      api.setPrimary({ label: 'Сравнить с эталоном', disabled: n < step.min, onClick: compare });
    });
    function compare() {
      ta.readOnly = true;
      window.Store.get().notes[step.noteKey || 'explain'] = ta.value.trim();
      window.Store.save();
      modelBox.hidden = false;
      modelBox.appendChild(h('div', { class: 'model-h', text: 'Эталон' }));
      modelBox.appendChild(h('p', { text: step.model }));
      rate.hidden = false;
      rate.appendChild(h('div', { class: 'conf-label', text: 'Насколько совпало с твоим объяснением?' }));
      var row = h('div', { class: 'chips' });
      [['yes', 'Совпало'], ['part', 'Почти'], ['no', 'Не совсем']].forEach(function (o) {
        row.appendChild(h('button', {
          type: 'button', class: 'chip', text: o[1], onclick: function () {
            Array.prototype.forEach.call(row.children, function (b) { b.disabled = true; });
            api.banner({ kind: o[0] === 'no' ? 'info' : 'ok', title: o[0] === 'no' ? 'Это нормально' : 'Хорошо', text: o[0] === 'no' ? 'Именно поэтому завтра будет повторение: пробелы закрываются вспоминанием, а не перечитыванием.' : 'Если можешь объяснить — значит, понял, а не просто запомнил.' });
            api.finish({ correct: o[0] !== 'no', rating: o[0] }, { advance: false });
          }
        }));
      });
      rate.appendChild(row);
      api.setPrimary({ label: 'Дальше', disabled: true, onClick: function () { } });
    }
    api.setPrimary({ label: 'Сравнить с эталоном', disabled: true, onClick: compare });
    setTimeout(function () { ta.focus(); }, 80);
  }

  /* ---------- plan ---------- */
  function mountPlan(step, body, api) {
    var presets = [['08:00', 'Утром', 'после завтрака'], ['15:00', 'После пар', 'после пар'], ['20:00', 'Вечером', 'после ужина']];
    var cues = ['после завтрака', 'после пар', 'после ужина', 'перед сном'];
    var time = '20:00', cue = cues[2];
    var timeIn = h('input', { type: 'time', class: 'time-in', value: time, 'aria-label': 'Своё время', onchange: function () { if (timeIn.value) { time = timeIn.value; paintTime(); sum(); } } });
    var tBtns = presets.map(function (p) {
      return h('button', { type: 'button', class: 'chip', role: 'radio', onclick: function () { time = p[0]; cue = p[2]; timeIn.value = p[0]; paintTime(); paintCue(); sum(); } }, p[1] + ' · ' + p[0]);
    });
    var cBtns = cues.map(function (c) {
      return h('button', { type: 'button', class: 'chip', role: 'radio', onclick: function () { cue = c; paintCue(); sum(); } }, c);
    });
    var summary = h('p', { class: 'plan-sum', 'aria-live': 'polite' });
    function paintTime() { tBtns.forEach(function (b, i) { var on = presets[i][0] === time; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    function paintCue() { cBtns.forEach(function (b, i) { var on = cues[i] === cue; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    function sum() { summary.textContent = 'Завтра в ' + time + ', ' + cue + ' — открою Бастау и повторю карточки (5 минут).'; }
    body.appendChild(h('div', { class: 'plan' },
      h('h1', { class: 'step-title', text: step.title }),
      h('p', { class: 'lead', text: step.lead }),
      h('div', { class: 'conf-label', text: 'Во сколько?' }),
      h('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Время' }, tBtns, timeIn),
      h('div', { class: 'conf-label', text: 'После чего?' }),
      h('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Привязка' }, cBtns), summary));
    paintTime(); paintCue(); sum();

    function save() { window.Store.get().plan = { time: time, cue: cue }; window.Store.save(); }
    function ics() {
      var p = time.split(':').map(Number);
      var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(p[0], p[1], 0, 0);
      var text = window.Core.icsDaily({ title: 'Бастау: 5 минут кода', description: 'Открой Бастау и повтори карточки. Один день пропустить — не страшно.', startMs: d.getTime(), minutes: 10, count: 7 });
      window.UI.downloadText('bastau-napominanie.ics', text, 'text/calendar;charset=utf-8');
      save();
      window.UI.toast('Файл скачан — открой его, чтобы добавить в календарь.');
    }
    api.setSecondary({ label: 'Скачать напоминание (.ics)', icon: 'cal', onClick: ics });
    api.setPrimary({ label: 'Сохранить план', onClick: function () { save(); api.finish({ correct: true }, { advance: true }); } });
  }

  /* ---------- done ---------- */
  function mountDone(step, body, api) {
    var st = api.summary();
    var withRosetta = step.rosetta !== false;
    var rosetta = withRosetta ? window.Course.ROSETTA.map(function (r) {
      return h('details', { class: 'ros' }, h('summary', { text: r.name }), codeBlock(r.code, r.name === 'Python' ? 'py' : (r.name === 'JavaScript' ? 'js' : 'none')), r.note ? h('p', { class: 'muted', text: r.note }) : null);
    }) : null;
    body.appendChild(h('div', { class: 'done' },
      h('div', { class: 'done-badge', 'aria-hidden': 'true' }, icon('check', 40)),
      h('h1', { class: 'step-title center', text: step.title }),
      h('p', { class: 'lead center', text: step.lead || 'Ты написал, запустил и починил код — это и есть программирование.' }),
      h('div', { class: 'stats' },
        stat(st.minutes + ' мин', 'сегодня'),
        stat(st.firstTry + ' из ' + st.total, 'с первой попытки'),
        stat(String(st.cards), 'карточек на завтра')),
      h('p', { class: 'foot-note center', text: step.foot || 'Первое повторение — завтра. Один пропущенный день серию не обнуляет.' }),
      api.openExamples ? h('button', { class: 'btn secondary lg', type: 'button', onclick: api.openExamples }, icon('code', 20), 'Где это живёт в реальных программах') : null,
      withRosetta ? h('h2', { class: 'section-h', text: 'Бонус: то же самое в других языках' }) : null,
      withRosetta ? h('p', { class: 'muted', text: 'Здесь запускаются Python и JavaScript, остальное — для знакомства. Найди общее: команда вывода и текст в кавычках.' }) : null,
      withRosetta ? h('div', { class: 'ros-list' }, rosetta) : null));
    api.confetti();
    api.setPrimary({ label: 'На главную', onClick: function () { api.finish({ correct: true }, { advance: true }); } });
  }
  function stat(v, l) { return h('div', { class: 'stat' }, h('div', { class: 'stat-v', text: v }), h('div', { class: 'stat-l', text: l })); }

  var KINDS = { intro: mountIntro, predict: mountPredict, anatomy: mountAnatomy, parsons: mountParsons, fill: mountFill, code: mountCode, mcq: mountMcq, quiz: mountQuiz, explain: mountExplain, plan: mountPlan, done: mountDone };

  window.Steps = {
    mount: function (step, body, api) {
      var fn = KINDS[step.kind];
      if (!fn) throw new Error('Неизвестный тип шага: ' + step.kind);
      fn(step, body, api);
      // второе, более простое объяснение — по желанию (в повторении не показываем: там нужно вспоминать)
      if (step.simple && !api.review) {
        var sm = typeof step.simple === 'string' ? { text: step.simple } : step.simple;
        body.appendChild(h('details', { class: 'simple' },
          h('summary', null, icon('bulb', 18), h('span', { text: 'Не понял? Объясню проще' })),
          h('p', { text: sm.text }),
          sm.code ? codeBlock(sm.code, api.lang) : null,
          sm.after ? h('p', { text: sm.after }) : null));
      }
    },
    consoleView: consoleView, execute: execute, codeBlock: codeBlock
  };
})();
