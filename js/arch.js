/* Направление «Архитектура»: экраны. Открывается из вкладки «Сегодня» (адрес #today/arch/…).
   Логика — js/arch-logic.js, содержание — js/arch-course.js, фото — js/media.js.
   Весь текст пользователя попадает на страницу только через textContent. */
(function () {
  'use strict';
  var h = window.UI.h, clear = window.UI.clear, icon = window.UI.icon, toast = window.UI.toast, sheet = window.UI.sheet;
  var S = window.Store, C = window.Core, L = window.ArchLogic, K = window.ArchCourse, M = window.Media;
  var ctx = null, cleanups = [], lastAct = Date.now(), shown = false;

  /* ---------- общее ---------- */
  function arch() {
    var st = S.get(), fresh = !st.arch || !st.arch.startedAt;
    var a = L.ensure(st, Date.now());
    if (fresh) S.save();
    return a;
  }
  function nav(p) { ctx.go('today', 'arch' + (p ? '/' + p : '')); }
  function plural(n, f) { var a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; }
  function dateText(ms) { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(ms)); }
  function onLeave(fn) { cleanups.push(fn); }
  function runCleanups() { var c = cleanups; cleanups = []; c.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } }); }
  function page() { return h('div', { class: 'page arch' }); }
  function back(label, to) { return h('button', { class: 'back-btn', onclick: function () { nav(to || ''); } }, icon('back', 20), label || 'Архитектура'); }
  function sources(list) {
    if (!list || !list.length) return null;
    return h('div', { class: 'arch-src' }, h('div', { class: 'conf-label', text: 'Источники' }), list.map(function (s) {
      return s.u ? h('a', { class: 'arch-link', href: s.u, target: '_blank', rel: 'noopener noreferrer', text: s.t }) : h('p', { class: 'muted small', text: s.t });
    }));
  }
  // фото из интернета (Викисклад) с подписью об авторе и лицензии
  function figure(p) {
    var img = h('img', { class: 'arch-img', src: p.src, alt: p.alt, decoding: 'async', referrerpolicy: 'no-referrer' });
    var box = h('figure', { class: 'arch-fig' }, img,
      h('figcaption', { class: 'muted small' }, 'Фото: ' + p.author + ', ' + p.license + ' · ',
        h('a', { class: 'arch-link', href: p.page, target: '_blank', rel: 'noopener noreferrer', text: 'Викисклад' })));
    img.onerror = function () {
      var ph = h('div', { class: 'arch-img ph', role: 'img', 'aria-label': p.alt }, h('span', { text: 'Фото не загрузилось: нужен интернет.' }));
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
    };
    return box;
  }
  function doneBtn(label, fn, disabled) { return h('button', { class: 'btn primary lg', disabled: !!disabled, onclick: fn }, label); }

  /* ---------- фото пользователя ---------- */
  function photoThumb(id, onRemove) {
    var box = h('div', { class: 'ph-thumb' }, h('span', { class: 'muted small', text: '…' }));
    M.url(id).then(function (url) {
      clear(box);
      if (!url) { box.classList.add('missing'); box.appendChild(h('span', { class: 'muted small', text: 'Фото осталось на другом устройстве' })); }
      else box.appendChild(h('img', { src: url, alt: 'Моё фото', loading: 'lazy' }));
      if (onRemove) box.appendChild(h('button', { class: 'ph-x', type: 'button', 'aria-label': 'Убрать фото', onclick: onRemove }, icon('close', 16)));
    });
    return box;
  }
  // поле с фото: ids — массив идентификаторов, который меняется на месте
  function photoField(ids, label) {
    var grid = h('div', { class: 'ph-grid' });
    var input = h('input', { type: 'file', accept: 'image/*', hidden: true });
    var addBtn = h('button', { class: 'btn secondary', type: 'button', onclick: function () { input.click(); } }, icon('camera', 18), label || 'Добавить фото');
    function draw() {
      clear(grid);
      ids.forEach(function (id, i) { grid.appendChild(photoThumb(id, function () { ids.splice(i, 1); M.remove(id); draw(); })); });
      grid.hidden = !ids.length;
    }
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; input.value = '';
      if (!f) return;
      addBtn.disabled = true;
      M.add(f).then(function (id) { ids.push(id); draw(); }, function (e) { toast(e && e.message || 'Не получилось добавить фото.'); })
        .then(function () { addBtn.disabled = false; });
    });
    draw();
    return h('div', { class: 'ph-field' }, grid, M.available ? addBtn : h('p', { class: 'muted small', text: 'Этот браузер не умеет хранить фото.' }), input,
      h('p', { class: 'muted small', text: 'Фото хранятся только на этом устройстве и в облако не уходят.' }));
  }

  /* ---------- таймер ---------- */
  function timer(seconds, onEnd) {
    var left = seconds, endAt = 0, tick = null, fired = false;
    var disp = h('div', { class: 'timer-d', role: 'timer', 'aria-label': 'Осталось времени' });
    var btn = h('button', { class: 'btn primary', type: 'button' });
    var reset = h('button', { class: 'btn ghost', type: 'button', onclick: function () { stop(); left = seconds; fired = false; paint(); } }, 'Сначала');
    function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function paint() {
      var cur = tick ? (endAt - Date.now()) / 1000 : left;
      disp.textContent = fmt(cur);
      clear(btn); btn.appendChild(icon(tick ? 'clock' : 'play', 18)); btn.appendChild(document.createTextNode(tick ? 'Пауза' : (left < seconds && left > 0 ? 'Продолжить' : 'Старт')));
      btn.disabled = !tick && left <= 0;
    }
    function stop() { if (tick) { clearInterval(tick); tick = null; left = Math.max(0, (endAt - Date.now()) / 1000); } }
    function step() {
      if (endAt - Date.now() <= 0) {
        stop(); left = 0; paint();
        if (!fired) { fired = true; window.UI.haptic(30); if (onEnd) onEnd(); }
        return;
      }
      paint();
    }
    btn.onclick = function () {
      if (tick) { stop(); paint(); return; }
      endAt = Date.now() + left * 1000; tick = setInterval(step, 250); paint();
    };
    onLeave(function () { if (tick) clearInterval(tick); });
    paint();
    return h('div', { class: 'timer' }, disp, h('div', { class: 'timer-actions' }, btn, reset));
  }

  /* ---------- день ---------- */
  function finishBlock(day, id) {
    var a = arch();
    L.markBlock(a, day, id, Date.now());
    S.touchDay(); S.save();
    var all = L.doneCount(a, day, K.BLOCKS) === K.BLOCKS.length;
    toast(all ? 'День ' + day + ' закрыт полностью.' : 'Сделано.');
    nav('day/' + day);
  }
  var BLOCK_ICON = { concept: 'bulb', building: 'arch', practice: 'pencil', quiz: 'check', look: 'star', sketch: 'clock', terms: 'text' };

  function blockRow(b, day, a) {
    var done = L.isDone(a, day, b.id);
    return h('button', { class: 'row tap', onclick: function () { nav('b/' + b.id + '/' + day); } },
      h('span', { class: 'row-ic' + (done ? ' tint' : '') }, icon(done ? 'check' : BLOCK_ICON[b.id], 20)),
      h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: b.title }), h('div', { class: 'row-s', text: done ? 'Сделано' : '≈ ' + b.min + ' мин' })),
      icon('chevron', 18));
  }
  function statusRow(ic, title, sub, done, to) {
    return h('button', { class: 'row tap', onclick: function () { nav(to); } },
      h('span', { class: 'row-ic' + (done ? ' tint' : '') }, icon(done ? 'check' : ic, 20)),
      h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: title }), h('div', { class: 'row-s', text: sub })),
      icon('chevron', 18));
  }

  function hub(main, forDay) {
    var a = arch(), now = Date.now();
    var cur = L.currentDay(a, K.BLOCKS), day = forDay || cur, d = K.DAYS[day - 1];
    var mod = L.moduleOfDay(K, day), week = L.weekOf(day), p = page();
    p.appendChild(h('button', { class: 'back-btn', onclick: function () { if (forDay && forDay !== cur) nav(''); else ctx.go('today'); } }, icon('back', 20), forDay && forDay !== cur ? 'Архитектура' : 'Сегодня'));
    p.appendChild(h('header', { class: 'large-title' }, h('div', null,
      h('div', { class: 'overline', text: 'Модуль ' + mod.n + ' · ' + mod.title }), h('h1', { text: 'Архитектура' }))));

    if (!d) {
      p.appendChild(h('section', { class: 'hero done' },
        h('div', { class: 'hero-top' }, h('span', { class: 'eyebrow', text: 'День ' + day }), h('span', { class: 'pill', text: 'Скоро' })),
        h('h2', { class: 'hero-title', text: 'Урок этого дня ещё готовится' }),
        h('p', { class: 'hero-sub', text: 'Ты прошёл все готовые уроки: ' + (day - 1) + '. Пока можно повторить вопросы и термины, сделать скетч и задания недели.' }),
        h('div', { class: 'account-actions' },
          h('button', { class: 'btn secondary', onclick: function () { nav('b/quiz/' + (day - 1)); } }, 'Повторить вопросы'),
          h('button', { class: 'btn secondary', onclick: function () { nav('b/terms/' + (day - 1)); } }, 'Повторить термины'))));
    } else {
      var n = L.doneCount(a, day, K.BLOCKS), total = K.BLOCKS.length, mins = K.BLOCKS.reduce(function (s, b) { return s + b.min; }, 0);
      var next = K.BLOCKS.filter(function (b) { return !L.isDone(a, day, b.id); })[0];
      p.appendChild(h('section', { class: 'hero' + (n === total ? ' done' : '') },
        h('div', { class: 'hero-top' }, h('span', { class: 'eyebrow', text: 'День ' + day }),
          n === total ? h('span', { class: 'pill ok' }, icon('check', 14), 'Пройдено') : h('span', { class: 'pill', text: '≈ ' + mins + ' мин' })),
        h('h2', { class: 'hero-title', text: d.title }),
        h('p', { class: 'hero-sub', text: 'Сделано ' + n + ' из ' + total + '. Урок — первые четыре блока, остальное можно делать в любом порядке.' }),
        h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': String(Math.round(n / total * 100)), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Прогресс дня' },
          h('div', { class: 'bar-fill', style: '--p:' + Math.round(n / total * 100) + '%' })),
        next ? h('button', { class: 'btn primary lg', onclick: function () { nav('b/' + next.id + '/' + day); } }, icon('play', 20), n ? 'Дальше: ' + next.title : 'Начать день') : null));
      p.appendChild(h('h2', { class: 'section-h', text: 'Урок дня' }));
      p.appendChild(h('section', { class: 'group' }, K.BLOCKS.filter(function (b) { return b.core; }).map(function (b) { return blockRow(b, day, a); })));
      p.appendChild(h('h2', { class: 'section-h', text: 'Каждый день' }));
      p.appendChild(h('section', { class: 'group' }, K.BLOCKS.filter(function (b) { return !b.core; }).map(function (b) { return blockRow(b, day, a); })));
    }

    var w = K.WEEKS[week - 1];
    p.appendChild(h('h2', { class: 'section-h', text: 'На этой неделе · неделя ' + week }));
    if (w) {
      var pr = L.weekly(a, 'project', week), ci = L.weekly(a, 'city', week), js = L.weekly(a, 'jstask', week);
      p.appendChild(h('section', { class: 'group' },
        statusRow('layers', 'Мини-проект: ' + w.project.title, pr ? 'Сдан ' + dateText(pr.at) : 'Один раз в неделю', !!pr, 'week/project'),
        statusRow('camera', w.city.title, ci ? 'Сделан ' + dateText(ci.at) : 'Найди здание, сфотографируй, разбери', !!ci, 'week/city'),
        statusRow('code', 'Код: ' + w.js.title, js ? 'Решена ' + dateText(js.at) : 'Маленькая задача на JavaScript', !!js, 'week/js')));
    } else {
      p.appendChild(h('p', { class: 'muted small', text: 'Задания этой недели ещё готовятся.' }));
    }

    var ideasDue = L.ideasReviewDue(a, now), met = L.personThisMonth(a, now), st = L.stats(a, K);
    p.appendChild(h('h2', { class: 'section-h', text: 'Раз в месяц' }));
    p.appendChild(h('section', { class: 'group' },
      statusRow('bulb', 'Пересмотреть банк идей', ideasDue ? 'Пора: выбери лучшую идею месяца' : (st.ideas ? 'Пока рано. Идей в банке: ' + st.ideas : 'Банк пуст. Запиши первую проблему, которую заметишь'), !ideasDue && st.ideas > 0, 'ideas'),
      statusRow('users', 'Поговорить с практиком', met ? 'В этом месяце разговор был' : 'Архитектор, строитель или девелопер', met, 'people')));

    p.appendChild(h('h2', { class: 'section-h', text: 'Разделы' }));
    p.appendChild(h('section', { class: 'group' },
      statusRow('folder', 'Портфолио', st.works ? st.works + ' ' + plural(st.works, ['работа', 'работы', 'работ']) : 'Здесь соберутся твои работы', false, 'portfolio'),
      statusRow('star', 'Избранное', st.fav ? st.fav + ' ' + plural(st.fav, ['здание', 'здания', 'зданий']) : 'Сохраняй сильные работы из «Насмотренности»', false, 'fav'),
      statusRow('bulb', 'Банк идей', st.ideas ? st.ideas + ' ' + plural(st.ideas, ['запись', 'записи', 'записей']) : 'Проблемы, которые ты замечаешь', false, 'ideas'),
      statusRow('users', 'Люди и связи', st.people ? st.people + ' ' + plural(st.people, ['разговор', 'разговора', 'разговоров']) : 'Кого ты уже расспросил', false, 'people'),
      statusRow('book', 'Программа', '8 модулей · пройдено уроков: ' + st.lessons, false, 'program')));
    clear(main).appendChild(p);
  }

  /* ---------- блок: понятие дня ---------- */
  function pConcept(main, day, d) {
    var c = d.concept, p = page(), fig = h('div', { class: 'arch-svg' });
    fig.innerHTML = c.svg; // свой статичный рисунок из js/arch-course.js, не данные пользователя
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: 'Понятие дня' }));
    p.appendChild(h('h1', { class: 'step-title', text: c.title }));
    p.appendChild(h('p', { class: 'lead', text: c.lead }));
    p.appendChild(fig);
    c.parts.forEach(function (x) {
      p.appendChild(h('section', { class: 'card flat arch-part' }, h('h2', { class: 'arch-h3', text: x.name }), h('p', { text: x.text }), h('p', { class: 'muted', text: 'Примеры: ' + x.example })));
    });
    p.appendChild(h('div', { class: 'callout' }, h('b', { text: 'Пример' }), h('p', { text: c.example })));
    if (c.note) p.appendChild(h('p', { class: 'muted', text: c.note }));
    p.appendChild(sources(c.sources));
    p.appendChild(doneBtn('Понятно', function () { finishBlock(day, 'concept'); }));
    clear(main).appendChild(p);
  }

  /* ---------- блок: разбор здания ---------- */
  function pBuilding(main, day, d) {
    var b = d.building, p = page();
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: 'Разбор здания' }));
    p.appendChild(h('h1', { class: 'step-title', text: b.name }));
    p.appendChild(figure(b.photo));
    p.appendChild(h('section', { class: 'card flat arch-facts' }, b.facts.map(function (f) { return h('div', { class: 'arch-fact' }, h('b', { text: f[0] }), h('span', { text: f[1] })); })));
    p.appendChild(h('h2', { class: 'section-h', text: 'Почему так сделано' }));
    p.appendChild(h('ol', { class: 'notes arch-list' }, b.why.map(function (t) { return h('li', { text: t }); })));
    p.appendChild(h('h2', { class: 'section-h', text: 'На что смотреть' }));
    p.appendChild(h('ul', { class: 'notes arch-list' }, b.look.map(function (t) { return h('li', { text: t }); })));
    if (b.extra) p.appendChild(h('p', { text: b.extra }));
    if (b.caveat) p.appendChild(h('p', { class: 'muted small', text: b.caveat }));
    p.appendChild(sources(b.sources));
    p.appendChild(doneBtn('Разобрал', function () { finishBlock(day, 'building'); }));
    clear(main).appendChild(p);
  }

  /* ---------- блок: практика ---------- */
  function pPractice(main, day, d) {
    var pr = d.practice, a = arch(), p = page();
    var item = L.list(a, 'practice').filter(function (it) { return it.day === day; })[0] || null;
    var photos = item ? (item.photos || []).slice() : [];
    var note = h('textarea', { class: 'free', rows: '3', maxlength: '600', placeholder: 'Что заметил, что было трудно (необязательно)', 'aria-label': 'Заметка к практике' });
    note.value = item ? item.note || '' : '';
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: 'Практика · ' + pr.minutes + ' минут' }));
    p.appendChild(h('h1', { class: 'step-title', text: pr.title }));
    p.appendChild(h('div', { class: 'chips' }, pr.need.map(function (t) { return h('span', { class: 'pill', text: t }); })));
    p.appendChild(h('ol', { class: 'notes arch-list' }, pr.steps.map(function (t) { return h('li', { text: t }); })));
    p.appendChild(h('div', { class: 'callout' }, h('b', { text: 'Когда готово' }), h('p', { text: pr.done })));
    p.appendChild(timer(pr.minutes * 60, function () { toast('Время вышло. Заканчивай и фотографируй.'); }));
    p.appendChild(h('h2', { class: 'section-h', text: 'Результат' }));
    p.appendChild(photoField(photos, 'Добавить фото работы'));
    p.appendChild(note);
    p.appendChild(doneBtn(item ? 'Сохранить' : 'Готово', function () {
      L.upsert(a, Object.assign({}, item || { kind: 'practice', day: day }, { title: pr.title, note: note.value.trim(), photos: photos }), Date.now());
      finishBlock(day, 'practice');
    }));
    clear(main).appendChild(p);
  }

  /* ---------- вопросы и термины: интервальное повторение ---------- */
  function allQuestions() { var o = {}; K.DAYS.forEach(function (d) { d.quiz.forEach(function (q) { o[q.id] = q; }); }); return o; }
  function allTerms() { var o = {}; K.DAYS.forEach(function (d) { d.terms.forEach(function (t) { o[t.id] = t; }); }); return o; }
  // карточки, которые пора повторить: prefix — 'arch:q:' или 'arch:t:'
  function dueIds(prefix, defs, skip) {
    var cards = S.get().cards, own = {};
    Object.keys(cards).forEach(function (k) { if (k.indexOf(prefix) === 0) own[k] = cards[k]; });
    return C.dueCards(own, Date.now()).map(function (c) { return c.id.slice(prefix.length); })
      .filter(function (id) { return defs[id] && skip.indexOf(id) === -1; });
  }
  function nextDueText(prefix) {
    var cards = S.get().cards, next = Infinity;
    Object.keys(cards).forEach(function (k) { if (k.indexOf(prefix) === 0 && cards[k].due > Date.now() && cards[k].due < next) next = cards[k].due; });
    if (next === Infinity) return 'Повторять пока нечего.';
    var days = Math.max(0, Math.round((C.startOfDay(next) - C.startOfDay(Date.now())) / C.DAY));
    return 'Повторять пока нечего. Ближайшее повторение — ' + (days <= 0 ? 'сегодня позже' : days === 1 ? 'завтра' : 'через ' + days + ' ' + plural(days, ['день', 'дня', 'дней'])) + '.';
  }

  // Оценка ответа. Новая карточка при верном ответе просто создаётся (повтор завтра); при ошибке возвращается через 10 минут.
  function rateCard(key, ok) {
    if (!S.get().cards[key]) { if (ok) S.ensureCard(key); else S.reviewCard(key, 'again'); }
    else S.reviewCard(key, ok ? 'good' : 'again');
  }

  function pQuiz(main, day, d) {
    var a = arch(), defs = allQuestions(), firstTime = !L.isDone(a, day, 'quiz');
    var fresh = firstTime ? d.quiz.map(function (q) { return q.id; }) : [];
    var queue = dueIds('arch:q:', defs, fresh).slice(0, 3).concat(fresh), total = queue.length, i = 0, right = 0;
    var p = page(), holder = h('div', { class: 'arch-q' });
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: firstTime ? 'Мини-тест' : 'Повторение вопросов' }));
    p.appendChild(holder);
    function finish() {
      clear(holder);
      if (firstTime) { var rec = L.markBlock(a, day, 'quiz', Date.now()); rec.quiz = { ok: right, total: total }; S.touchDay(); }
      S.save();
      holder.appendChild(h('div', { class: 'done' }, h('div', { class: 'done-badge', 'aria-hidden': 'true' }, icon('check', 40)),
        h('h1', { class: 'step-title center', text: 'Верно ' + right + ' из ' + total }),
        h('p', { class: 'lead center', text: right === total ? 'Эти вопросы вернутся через день, потом реже.' : 'Вопросы с ошибкой вернутся раньше остальных.' })));
      holder.appendChild(doneBtn('К дню', function () { nav('day/' + day); }));
    }
    function show() {
      clear(holder);
      if (i >= total) { finish(); return; }
      var q = defs[queue[i]], opts = C.shuffle(q.options), answered = false;
      var exp = h('div', { class: 'banner info', hidden: true, role: 'status' });
      var nextBtn = doneBtn(i === total - 1 ? 'Завершить' : 'Дальше', function () { i++; show(); }, true);
      var btns = opts.map(function (o) {
        return h('button', { class: 'opt', type: 'button', onclick: function () {
          if (answered) return; answered = true;
          var ok = !!o.correct; if (ok) right++;
          btns.forEach(function (b, j) { b.disabled = true; if (opts[j].correct) { b.classList.add('right'); b.querySelector('.opt-mark').textContent = '✓'; } });
          if (!ok) { this.classList.add('wrong'); this.querySelector('.opt-mark').textContent = '✕'; }
          rateCard('arch:q:' + q.id, ok);
          exp.hidden = false; exp.className = 'banner ' + (ok ? 'ok' : 'info');
          clear(exp).appendChild(h('div', { class: 'banner-main' }, h('div', { class: 'banner-t', text: ok ? 'Верно' : 'Не совсем' }), h('div', { class: 'banner-x', text: q.explain })));
          nextBtn.disabled = false;
          try { nextBtn.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ }
        } }, h('span', { class: 'opt-mark', 'aria-hidden': 'true' }), h('span', { class: 'opt-text', text: o.text }));
      });
      holder.appendChild(h('div', { class: 'quiz-count', text: 'Вопрос ' + (i + 1) + ' из ' + total }));
      holder.appendChild(h('h1', { class: 'step-title', text: q.q }));
      holder.appendChild(h('div', { class: 'opts', role: 'group', 'aria-label': 'Варианты ответа' }, btns));
      holder.appendChild(exp);
      holder.appendChild(nextBtn);
    }
    if (!total) {
      holder.appendChild(h('h1', { class: 'step-title', text: 'Вопросы дня уже пройдены' }));
      holder.appendChild(h('p', { class: 'lead', text: nextDueText('arch:q:') }));
      holder.appendChild(doneBtn('К дню', function () { nav('day/' + day); }));
    } else show();
    clear(main).appendChild(p);
  }

  function pTerms(main, day, d) {
    var a = arch(), defs = allTerms(), firstTime = !L.isDone(a, day, 'terms');
    var fresh = firstTime ? d.terms.map(function (t) { return t.id; }) : [];
    var queue = dueIds('arch:t:', defs, fresh).slice(0, 5).concat(fresh), total = queue.length, i = 0, knew = 0;
    var p = page(), holder = h('div', { class: 'arch-q' });
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: firstTime ? 'Английский для архитектуры' : 'Повторение терминов' }));
    p.appendChild(holder);
    function finish() {
      clear(holder);
      if (firstTime) { L.markBlock(a, day, 'terms', Date.now()); S.touchDay(); }
      S.save();
      holder.appendChild(h('div', { class: 'done' }, h('div', { class: 'done-badge', 'aria-hidden': 'true' }, icon('check', 40)),
        h('h1', { class: 'step-title center', text: 'Термины пройдены' }),
        h('p', { class: 'lead center', text: 'Знал сразу: ' + knew + ' из ' + total + '. Остальные вернутся раньше.' })));
      holder.appendChild(doneBtn('К дню', function () { nav('day/' + day); }));
    }
    function show() {
      clear(holder);
      if (i >= total) { finish(); return; }
      var t = defs[queue[i]];
      var answer = h('div', { class: 'term-back', hidden: true },
        h('div', { class: 'term-ru', text: t.ru }),
        h('p', { class: 'term-ex', lang: 'en', text: t.ex }), h('p', { class: 'muted', text: t.exRu }));
      var reveal = doneBtn('Показать перевод', function () {
        answer.hidden = false; reveal.hidden = true; rate.hidden = false;
        try { rate.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ }
      });
      function mark(ok) { if (ok) knew++; rateCard('arch:t:' + t.id, ok); i++; show(); }
      var rate = h('div', { class: 'account-actions', hidden: true },
        h('button', { class: 'btn secondary', type: 'button', onclick: function () { mark(false); } }, 'Не знал'),
        h('button', { class: 'btn primary', type: 'button', onclick: function () { mark(true); } }, 'Знал'));
      holder.appendChild(h('div', { class: 'quiz-count', text: 'Термин ' + (i + 1) + ' из ' + total }));
      holder.appendChild(h('section', { class: 'card term' }, h('div', { class: 'term-en', lang: 'en', text: t.en }),
        h('p', { class: 'muted small', text: 'Вспомни перевод, потом проверь себя.' }), answer));
      holder.appendChild(reveal); holder.appendChild(rate);
    }
    if (!total) {
      holder.appendChild(h('h1', { class: 'step-title', text: 'Термины дня уже пройдены' }));
      holder.appendChild(h('p', { class: 'lead', text: nextDueText('arch:t:') }));
      holder.appendChild(doneBtn('К дню', function () { nav('day/' + day); }));
    } else show();
    clear(main).appendChild(p);
  }

  /* ---------- блок: насмотренность ---------- */
  function favButton(id) {
    var btn = h('button', { class: 'btn secondary', type: 'button' });
    function paint() {
      var on = L.isFav(arch(), id);
      clear(btn); btn.appendChild(icon('star', 18)); btn.appendChild(document.createTextNode(on ? 'В избранном' : 'Сохранить в избранное'));
      btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    btn.onclick = function () { var a = arch(); L.setFav(a, id, !L.isFav(a, id), Date.now()); S.save(); paint(); };
    paint();
    return btn;
  }
  function pLook(main, day, d) {
    var w = d.look, p = page();
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: 'Насмотренность' }));
    p.appendChild(h('h1', { class: 'step-title', text: w.name }));
    p.appendChild(h('p', { class: 'lead', text: w.author + ' · ' + w.year + ' · ' + w.city }));
    p.appendChild(figure(w.photo));
    p.appendChild(h('h2', { class: 'section-h', text: 'Почему работа сильная' }));
    p.appendChild(h('ol', { class: 'notes arch-list' }, w.why.map(function (t) { return h('li', { text: t }); })));
    if (w.note) p.appendChild(h('p', { class: 'muted', text: w.note }));
    p.appendChild(sources(w.sources));
    p.appendChild(favButton(w.id));
    p.appendChild(doneBtn('Посмотрел', function () { finishBlock(day, 'look'); }));
    clear(main).appendChild(p);
  }

  /* ---------- блок: скетч ---------- */
  function pSketch(main, day, d) {
    var s = d.sketch, a = arch(), p = page();
    var item = L.list(a, 'sketch').filter(function (it) { return it.day === day; })[0] || null;
    var photos = item ? (item.photos || []).slice() : [];
    p.appendChild(back('День ' + day, 'day/' + day));
    p.appendChild(h('div', { class: 'overline', text: 'Скетч · 5 минут' }));
    p.appendChild(h('h1', { class: 'step-title', text: 'Тема дня: ' + s.theme.toLowerCase() }));
    p.appendChild(h('ol', { class: 'notes arch-list' }, s.task.map(function (t) { return h('li', { text: t }); })));
    p.appendChild(h('div', { class: 'callout' }, h('b', { text: 'Совет' }), h('p', { text: s.tip })));
    p.appendChild(timer(300, function () { toast('Пять минут прошли. Сфотографируй лист.'); }));
    p.appendChild(h('h2', { class: 'section-h', text: 'Мой скетч' }));
    p.appendChild(photoField(photos, 'Добавить фото скетча'));
    p.appendChild(doneBtn(item ? 'Сохранить' : 'Готово', function () {
      if (photos.length || item) L.upsert(a, Object.assign({}, item || { kind: 'sketch', day: day }, { title: s.theme, photos: photos }), Date.now());
      finishBlock(day, 'sketch');
    }));
    p.appendChild(h('p', { class: 'muted small center', text: 'Можно без фото. С фото скетч попадёт в галерею прогресса.' }));
    clear(main).appendChild(p);
  }

  /* ---------- форма записи: идея, человек, разбор города, проект ---------- */
  function recordForm(main, o) {
    var a = arch(), item = o.item, p = page(), inputs = {}, photos = item ? (item.photos || []).slice() : [];
    p.appendChild(back(o.backLabel, o.back));
    if (o.over) p.appendChild(h('div', { class: 'overline', text: o.over }));
    p.appendChild(h('h1', { class: 'step-title', text: o.title }));
    if (o.intro) o.intro.forEach(function (n) { if (n) p.appendChild(n); });
    var form = h('div', { class: 'arch-form' });
    o.fields.forEach(function (f, idx) {
      var id = 'af-' + idx;
      var el = f.type === 'text'
        ? h('input', { class: 'free', id: id, type: 'text', maxlength: String(f.max), placeholder: f.placeholder || '', autocomplete: 'off' })
        : h('textarea', { class: 'free', id: id, rows: '3', maxlength: String(f.max), placeholder: f.placeholder || '' });
      el.value = item && typeof item[f.key] === 'string' ? item[f.key] : '';
      inputs[f.key] = el;
      form.appendChild(h('div', { class: 'arch-field' }, h('label', { class: 'conf-label', for: id, text: f.label + (f.required ? '' : ' (необязательно)') }), el));
    });
    p.appendChild(form);
    if (o.photos) { p.appendChild(h('div', { class: 'conf-label', text: 'Фото' })); p.appendChild(photoField(photos, o.photoLabel)); }
    var err = h('p', { class: 'account-err', role: 'alert', hidden: true });
    p.appendChild(err);
    p.appendChild(doneBtn(item ? 'Сохранить' : (o.saveLabel || 'Сохранить'), function () {
      var rec = Object.assign({}, item || { kind: o.kind }, o.extra || {});
      var missing = null;
      o.fields.forEach(function (f) { var v = inputs[f.key].value.trim().slice(0, f.max); rec[f.key] = v; if (f.required && !v && !missing) missing = f; });
      if (missing) { err.hidden = false; err.textContent = 'Заполни поле «' + missing.label + '».'; inputs[missing.key].focus(); return; }
      if (o.photos) rec.photos = photos;
      L.upsert(a, rec, Date.now());
      S.touchDay(); S.save();
      toast('Сохранено.');
      nav(o.back);
    }));
    if (item) {
      p.appendChild(h('button', { class: 'btn ghost lg danger-text', type: 'button', onclick: function () {
        window.UI.confirmSheet({ title: 'Удалить запись?', text: 'Запись и её фото на этом устройстве будут удалены. Это нельзя отменить.', confirm: 'Удалить', danger: true, onConfirm: function () {
          (item.photos || []).forEach(function (id) { M.remove(id); });
          L.remove(a, item.id, Date.now()); S.save(); toast('Удалено.'); nav(o.back);
        } });
      } }, 'Удалить'));
    }
    clear(main).appendChild(p);
  }
  function steps(list) { return h('ol', { class: 'notes arch-list' }, list.map(function (t) { return h('li', { text: t }); })); }

  /* ---------- задания недели ---------- */
  function pWeek(main, what) {
    var a = arch(), week = L.weekOf(L.currentDay(a, K.BLOCKS)), w = K.WEEKS[week - 1];
    if (!w) { nav(''); return; }
    if (what === 'project') {
      recordForm(main, {
        kind: 'project', item: L.weekly(a, 'project', week), extra: { week: week, title: w.project.title }, fields: K.PROJECT_FIELDS, photos: true, photoLabel: 'Добавить фото плана',
        back: '', backLabel: 'Архитектура', over: 'Мини-проект · неделя ' + week, title: w.project.title, saveLabel: 'Сдать проект',
        intro: [h('p', { class: 'lead', text: w.project.lead }), h('div', { class: 'chips' }, w.project.need.map(function (t) { return h('span', { class: 'pill', text: t }); })),
          steps(w.project.steps), h('div', { class: 'callout' }, h('b', { text: 'Результат' }), h('p', { text: w.project.result })), h('p', { class: 'muted small', text: w.project.next })]
      });
    } else if (what === 'city') {
      recordForm(main, {
        kind: 'city', item: L.weekly(a, 'city', week), extra: { week: week }, fields: K.CITY_FIELDS, photos: true, photoLabel: 'Добавить фото здания',
        back: '', backLabel: 'Архитектура', over: 'Разбор города · неделя ' + week, title: w.city.title, saveLabel: 'Сохранить разбор',
        intro: [h('p', { class: 'lead', text: w.city.lead }), h('ul', { class: 'notes arch-list' }, w.city.tips.map(function (t) { return h('li', { text: t }); }))]
      });
    } else {
      var done = L.weekly(a, 'jstask', week), task = K.jsTask(week), p = page();
      p.appendChild(back());
      p.appendChild(h('div', { class: 'overline', text: 'Код и архитектура · неделя ' + week }));
      p.appendChild(h('h1', { class: 'step-title', text: w.js.title }));
      p.appendChild(h('p', { class: 'lead', text: w.js.lead }));
      if (done) {
        p.appendChild(h('div', { class: 'callout' }, h('b', { text: 'Решено ' + dateText(done.at) }), h('p', { text: 'Твоё решение сохранено в портфолио.' })));
        if (done.code) p.appendChild(window.Steps.codeBlock(done.code, 'js'));
      }
      p.appendChild(doneBtn(done ? 'Решить ещё раз' : 'Открыть задачу', function () {
        ctx.openTask(task, 'js', function (code) {
          L.upsert(a, Object.assign({}, L.weekly(a, 'jstask', week) || { kind: 'jstask', week: week }, { title: task.title, code: String(code || '').slice(0, 4000) }), Date.now());
          S.touchDay(); S.save();
        });
      }));
      p.appendChild(h('p', { class: 'muted small center', text: 'Задача запускается на JavaScript, даже если основной язык уроков другой.' }));
      clear(main).appendChild(p);
    }
  }

  /* ---------- списки ---------- */
  function emptyCard(text) { return h('section', { class: 'card flat' }, h('p', { class: 'muted', text: text })); }
  function recRow(it, title, sub, to, extra) {
    return h('div', { class: 'row arch-rec' },
      h('button', { class: 'arch-rec-main', onclick: function () { nav(to); } },
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: title || 'Без названия' }), h('div', { class: 'row-s', text: sub }))),
      extra || icon('chevron', 18));
  }

  function pIdeas(main, id) {
    var a = arch();
    if (id) {
      var item = id === 'new' ? null : a.items[id];
      if (id !== 'new' && (!item || item.del || item.kind !== 'idea')) { nav('ideas'); return; }
      recordForm(main, { kind: 'idea', item: item, fields: K.IDEA_FIELDS, back: 'ideas', backLabel: 'Банк идей', title: item ? 'Идея' : 'Новая запись', over: 'Банк идей' });
      return;
    }
    var p = page(), list = L.list(a, 'idea'), due = L.ideasReviewDue(a, Date.now());
    p.appendChild(back());
    p.appendChild(h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Банк идей' }))));
    p.appendChild(h('p', { class: 'lead-sm', text: 'Записывай проблемы в стройке и архитектуре, которые замечаешь. Из них потом вырастет продукт.' }));
    if (due) {
      p.appendChild(h('section', { class: 'card flat lang-hint', role: 'status' },
        h('div', { class: 'row' }, h('span', { class: 'row-ic tint' }, icon('bulb', 22)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Прошёл месяц: пересмотри банк' }),
          h('div', { class: 'row-s', text: 'Перечитай записи и отметь звёздочкой лучшую идею. Что из этого ты бы начал делать завтра?' }))),
        h('button', { class: 'btn primary', onclick: function () { a.marks.ideasReview = Date.now(); S.save(); toast('Отмечено. Напомню через месяц.'); pIdeas(main); } }, 'Пересмотрел')));
    }
    p.appendChild(doneBtn('Записать проблему', function () { nav('ideas/new'); }));
    if (!list.length) p.appendChild(emptyCard('Пока пусто. Первая запись — любая мелочь, которая тебя раздражает в домах, дворах или стройке.'));
    else p.appendChild(h('section', { class: 'group' }, list.map(function (it) {
      var star = h('button', { class: 'icon-btn star' + (it.best ? ' on' : ''), 'aria-label': it.best ? 'Убрать отметку «лучшая идея»' : 'Отметить как лучшую идею', 'aria-pressed': it.best ? 'true' : 'false', onclick: function () {
        L.upsert(a, Object.assign({}, it, { best: !it.best }), Date.now()); S.save(); pIdeas(main);
      } }, icon('star', 20));
      return recRow(it, it.problem, dateText(it.at) + (it.idea ? ' · есть идея решения' : ''), 'ideas/' + it.id, star);
    })));
    clear(main).appendChild(p);
  }

  function pPeople(main, id) {
    var a = arch();
    if (id) {
      var item = id === 'new' ? null : a.items[id];
      if (id !== 'new' && (!item || item.del || item.kind !== 'person')) { nav('people'); return; }
      recordForm(main, { kind: 'person', item: item, fields: K.PERSON_FIELDS, back: 'people', backLabel: 'Люди и связи', title: item ? 'Разговор' : 'Новый разговор', over: 'Люди и связи' });
      return;
    }
    var p = page(), list = L.list(a, 'person'), met = L.personThisMonth(a, Date.now());
    p.appendChild(back());
    p.appendChild(h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Люди и связи' }))));
    p.appendChild(h('p', { class: 'lead-sm', text: 'Раз в месяц — один разговор с тем, кто строит или проектирует. ' + (met ? 'В этом месяце разговор уже был.' : 'В этом месяце разговора ещё не было.') }));
    p.appendChild(h('details', { class: 'simple' }, h('summary', null, icon('bulb', 18), h('span', { text: 'О чём спросить' })),
      h('ul', { class: 'notes arch-list' }, K.PEOPLE_QUESTIONS.map(function (q) { return h('li', { text: q }); }))));
    p.appendChild(doneBtn('Записать разговор', function () { nav('people/new'); }));
    if (!list.length) p.appendChild(emptyCard('Пока никого. Начать можно с преподавателя, знакомого прораба или архитектора из местного бюро.'));
    else p.appendChild(h('section', { class: 'group' }, list.map(function (it) { return recRow(it, it.name, (it.role ? it.role + ' · ' : '') + dateText(it.at), 'people/' + it.id); })));
    p.appendChild(h('p', { class: 'muted small', text: 'Записи о людях хранятся в твоём прогрессе. Если ты вошёл в аккаунт, они сохраняются и в облаке.' }));
    clear(main).appendChild(p);
  }

  function gallery(items) {
    var ids = [];
    items.forEach(function (it) { (it.photos || []).forEach(function (id) { ids.push(id); }); });
    if (!ids.length) return null;
    return h('div', { class: 'ph-grid' }, ids.map(function (id) { return photoThumb(id); }));
  }
  function pPortfolio(main, id) {
    var a = arch();
    if (id) {
      var it = a.items[id];
      if (!it || it.del) { nav('portfolio'); return; }
      if (it.kind === 'city') { recordForm(main, { kind: 'city', item: it, fields: K.CITY_FIELDS, photos: true, back: 'portfolio', backLabel: 'Портфолио', title: 'Разбор здания', over: 'Архив города' }); return; }
      if (it.kind === 'project') { recordForm(main, { kind: 'project', item: it, fields: K.PROJECT_FIELDS, photos: true, back: 'portfolio', backLabel: 'Портфолио', title: it.title || 'Проект', over: 'Мини-проект' }); return; }
      nav('portfolio'); return;
    }
    var p = page();
    p.appendChild(back());
    p.appendChild(h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Портфолио' }))));
    var projects = L.list(a, 'project'), practice = L.list(a, 'practice'), sketches = L.list(a, 'sketch'), city = L.list(a, 'city'), code = L.list(a, 'jstask');
    if (!projects.length && !practice.length && !sketches.length && !city.length && !code.length) p.appendChild(emptyCard('Здесь появятся твои работы: практика, скетчи, проекты недели и разборы зданий.'));
    function section(title, items, row) {
      if (!items.length) return;
      p.appendChild(h('h2', { class: 'section-h', text: title + ' · ' + items.length }));
      var g = gallery(items); if (g) p.appendChild(g);
      if (row) p.appendChild(h('section', { class: 'group' }, items.map(row)));
    }
    section('Проекты недели', projects, function (it) { return recRow(it, it.title, 'Неделя ' + it.week + ' · ' + dateText(it.at), 'portfolio/' + it.id); });
    section('Галерея скетчей', sketches, function (it) { return h('div', { class: 'row' }, h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'День ' + it.day + ' · ' + (it.title || 'скетч') }), h('div', { class: 'row-s', text: dateText(it.at) }))); });
    section('Практика', practice, function (it) { return h('div', { class: 'row' }, h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'День ' + it.day + ' · ' + (it.title || '') }), h('div', { class: 'row-s', text: it.note || dateText(it.at) }))); });
    section('Архив города', city, function (it) { return recRow(it, it.name, 'Неделя ' + it.week + ' · ' + dateText(it.at), 'portfolio/' + it.id); });
    section('Задачи по коду', code, function (it) { return h('div', { class: 'row' }, h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: it.title || 'Задача' }), h('div', { class: 'row-s', text: 'Неделя ' + it.week + ' · ' + dateText(it.at) }))); });
    clear(main).appendChild(p);
  }

  function pFav(main) {
    var a = arch(), p = page(), ids = L.favIds(a), found = [];
    K.DAYS.forEach(function (d) { if (ids.indexOf(d.look.id) !== -1) found.push(d); });
    p.appendChild(back());
    p.appendChild(h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Избранное' }))));
    if (!found.length) p.appendChild(emptyCard('Пока пусто. В блоке «Насмотренность» нажми «Сохранить в избранное» — здание появится здесь.'));
    found.forEach(function (d) {
      p.appendChild(h('button', { class: 'card tap arch-favcard', onclick: function () { nav('b/look/' + d.n); } }, figure(d.look.photo),
        h('div', { class: 'row-t', text: d.look.name }), h('div', { class: 'row-s', text: d.look.author + ' · ' + d.look.year + ' · ' + d.look.city })));
    });
    clear(main).appendChild(p);
  }

  function pProgram(main) {
    var a = arch(), p = page(), st = L.stats(a, K), used = 0;
    p.appendChild(back());
    p.appendChild(h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Программа' }))));
    p.appendChild(h('p', { class: 'lead-sm', text: '8 модулей, примерно ' + K.MODULES.reduce(function (s, m) { return s + m.weeks; }, 0) + ' недель. Длина модулей — предварительный план. Готово уроков: ' + K.DAYS.length + '.' }));
    K.MODULES.forEach(function (m) {
      var from = used + 1; used += m.weeks * 7;
      var state = st.lessons >= used ? 'Пройден' : (st.day >= from && st.day <= used ? 'Сейчас' : 'Впереди');
      var card = h('section', { class: 'card arch-mod' },
        h('div', { class: 'hero-top' }, h('span', { class: 'eyebrow', text: 'Модуль ' + m.n + ' · ' + m.weeks + ' ' + plural(m.weeks, ['неделя', 'недели', 'недель']) }), h('span', { class: 'pill' + (state === 'Впереди' ? '' : ' ok'), text: state })),
        h('h2', { class: 'arch-h3', text: m.title }), h('p', { class: 'muted', text: m.about }));
      if (m.plan) {
        card.appendChild(h('div', { class: 'conf-label', text: 'Первая неделя' }));
        card.appendChild(h('div', { class: 'arch-plan' }, m.plan.map(function (t, i) {
          var n = from + i, ready = !!K.DAYS[n - 1], done = L.coreDone(a, n, K.BLOCKS);
          var label = 'День ' + n + ' · ' + t, sub = done ? 'Пройден' : (ready ? 'Готов' : 'Скоро');
          return ready ? h('button', { class: 'row tap', onclick: function () { nav('day/' + n); } }, h('span', { class: 'row-ic' + (done ? ' tint' : '') }, icon(done ? 'check' : 'play', 18)),
            h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: label }), h('div', { class: 'row-s', text: sub })), icon('chevron', 18))
            : h('div', { class: 'row locked' }, h('span', { class: 'row-ic' }, icon('lock', 18)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: label }), h('div', { class: 'row-s', text: sub })));
        })));
      }
      p.appendChild(card);
    });
    clear(main).appendChild(p);
  }

  /* ---------- карточки для «Сегодня» и «Прогресса» ---------- */
  function todayCard(go) {
    var st = S.get(), a = st.arch;
    if (!a || !a.startedAt) {
      return h('button', { class: 'card tap', onclick: function () { go('today', 'arch'); } },
        h('div', { class: 'row' }, h('span', { class: 'row-ic tint' }, icon('arch', 22)),
          h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Новое направление: Архитектура' }), h('div', { class: 'row-s', text: '20–30 минут в день: понятие, здание, практика и тест' })),
          icon('chevron', 18)));
    }
    var day = L.currentDay(a, K.BLOCKS), d = K.DAYS[day - 1], n = L.doneCount(a, day, K.BLOCKS), total = K.BLOCKS.length;
    var sub = !d ? 'Все готовые уроки пройдены · повторение и задания недели'
      : (n === total ? 'День ' + day + ' закрыт' : 'День ' + day + ' · ' + d.title + ' · сделано ' + n + ' из ' + total);
    if (L.ideasReviewDue(a, Date.now())) sub += ' · пора пересмотреть банк идей';
    return h('button', { class: 'card tap', onclick: function () { go('today', 'arch'); } },
      h('div', { class: 'row' }, h('span', { class: 'row-ic tint' }, icon('arch', 22)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Архитектура' }), h('div', { class: 'row-s', text: sub })),
        icon('chevron', 18)));
  }
  function progressCard(go) {
    var a = S.get().arch;
    if (!a || !a.startedAt) return null;
    var st = L.stats(a, K);
    function tile(v, l) { return h('div', { class: 'tile' }, h('div', { class: 'tile-v', text: v }), h('div', { class: 'tile-l', text: l })); }
    return h('div', { class: 'arch-progress' },
      h('h2', { class: 'section-h', text: 'Архитектура' }),
      h('div', { class: 'tiles' }, tile(String(st.day), 'день'), tile(st.modulesDone + ' / ' + K.MODULES.length, 'модулей пройдено'), tile(String(st.works), plural(st.works, ['работа', 'работы', 'работ']) + ' в портфолио')),
      h('button', { class: 'btn secondary', onclick: function () { go('today', 'arch/portfolio'); } }, 'Открыть портфолио'));
  }

  /* ---------- вход ---------- */
  function render(main, parts, context) {
    ctx = context; runCleanups(); shown = true;
    var a = arch(), head = parts[0] || '';
    if (!head) { hub(main); return; }
    if (head === 'day') { var n = parseInt(parts[1], 10); if (n >= 1 && n <= 9999) hub(main, n); else hub(main); return; }
    if (head === 'b') {
      var day = parseInt(parts[2], 10) || L.currentDay(a, K.BLOCKS), d = K.DAYS[day - 1];
      if (!d) { hub(main); return; }
      var fn = { concept: pConcept, building: pBuilding, practice: pPractice, quiz: pQuiz, look: pLook, sketch: pSketch, terms: pTerms }[parts[1]];
      if (fn) fn(main, day, d); else hub(main, day);
      return;
    }
    if (head === 'week') { pWeek(main, parts[1]); return; }
    if (head === 'ideas') { pIdeas(main, parts[1]); return; }
    if (head === 'people') { pPeople(main, parts[1]); return; }
    if (head === 'portfolio') { pPortfolio(main, parts[1]); return; }
    if (head === 'fav') { pFav(main); return; }
    if (head === 'program') { pProgram(main); return; }
    hub(main);
  }
  function leave() { shown = false; runCleanups(); }

  // время в «Архитектуре» идёт в общую цель дня — так же, как в уроках кода: только пока человек что-то делает
  ['pointerdown', 'keydown'].forEach(function (t) { document.addEventListener(t, function () { lastAct = Date.now(); }, true); });
  setInterval(function () {
    if (shown && document.visibilityState === 'visible' && Date.now() - lastAct < 30000 && !document.body.classList.contains('has-player')) S.addSeconds(5);
  }, 5000);

  window.Arch = { render: render, leave: leave, todayCard: todayCard, progressCard: progressCard };
})();
