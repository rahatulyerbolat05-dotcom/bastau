/* Бастау — оболочка: вкладки, плеер урока, повторения, песочница, прогресс. */
(function () {
  'use strict';
  var h = window.UI.h, clear = window.UI.clear, icon = window.UI.icon, sheet = window.UI.sheet, toast = window.UI.toast;
  var C = window.Core, S = window.Store, R = window.Runner;

  var main = document.getElementById('main');
  var tabbar = document.getElementById('tabbar');
  var overlayRoot = document.getElementById('overlay-root');
  var TABS = [['today', 'Сегодня', 'today'], ['review', 'Повторение', 'review'], ['sandbox', 'Песочница', 'sandbox'], ['examples', 'Примеры', 'code'], ['progress', 'Прогресс', 'progress']];
  var tab = 'today';
  var exSub = null; // открытая программа во вкладке «Примеры»
  var courses = {};
  var openShell = null;

  /* ---------- утилиты ---------- */
  function course(lang) { return courses[lang] || (courses[lang] = window.Course.build(lang)); }
  function cardKey(lang, id) { return lang + ':' + id; }
  function langName(l) { return l === 'js' ? 'JavaScript' : 'Python'; }
  function plural(n, f) { var a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; }
  function fmtDate(ms, opts) { return new Intl.DateTimeFormat('ru-RU', opts).format(new Date(ms)); }
  function lessonKey(lang) { return 'hello:' + lang; }
  function visibleSteps(c) { var lvl = S.get().level; return c.steps.filter(function (s) { return !(s.novice && lvl === 'pro'); }); }
  var WEIGHT = { intro: 0.5, predict: 1, anatomy: 1.5, parsons: 1.5, fill: 1, code: 2, quiz: 3, explain: 2, plan: 1, done: 0.5 };
  function minutesLeft(steps, L) {
    var m = 0; steps.forEach(function (s) { if (L.doneSteps.indexOf(s.id) === -1) m += WEIGHT[s.kind] || 1; });
    return Math.max(1, Math.round(m));
  }
  function cardsOfLang(lang) {
    var out = {}, all = S.get().cards;
    Object.keys(all).forEach(function (k) { if (k.indexOf(lang + ':') === 0) out[k] = all[k]; });
    return out;
  }
  function humanDue(ms) {
    var now = Date.now();
    if (ms <= now) return 'сейчас';
    var d = Math.round((C.startOfDay(ms) - C.startOfDay(now)) / C.DAY);
    if (d <= 0) return 'сегодня позже';
    if (d === 1) return 'завтра';
    return 'через ' + d + ' ' + plural(d, ['день', 'дня', 'дней']);
  }

  function applyTheme() {
    var t = S.get().theme, root = document.documentElement;
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var m = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!m) { m = h('meta', { name: 'theme-color' }); document.head.appendChild(m); }
    m.setAttribute('content', dark ? '#000000' : '#F2F2F7');
  }

  /* ---------- шторка «почему так» ---------- */
  function openWhy(key) {
    var w = window.Course.WHY[key]; if (!w) return;
    var links = w.src.map(function (k) { var l = window.Course.LINKS[k]; return h('li', null, h('a', { href: l.u, target: '_blank', rel: 'noopener noreferrer', text: l.t })); });
    sheet({
      title: w.title,
      body: h('div', { class: 'why' },
        h('p', { text: w.text }),
        h('div', { class: 'why-h', text: 'Источники' }), h('ul', { class: 'why-links' }, links),
        h('p', { class: 'muted small', text: 'Честная оценка: ' + w.note }))
    });
  }

  /* ---------- конфетти ---------- */
  function confetti() {
    if (window.UI.reduceMotion.matches) return;
    var box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    var colors = ['#34C759', '#0A84FF', '#FF9F0A', '#FF453A', '#BF5AF2', '#FFD60A'];
    for (var i = 0; i < 30; i++) {
      var p = h('i');
      p.style.setProperty('--x', (Math.random() * 100).toFixed(1) + 'vw');
      p.style.setProperty('--d', (Math.random() * 0.6).toFixed(2) + 's');
      p.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
      p.style.setProperty('--c', colors[i % colors.length]);
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 2600);
  }

  /* ---------- оболочка плеера ---------- */
  function createShell(opts) {
    var closed = false, pushed = false, cleanups = [], lastAct = Date.now();
    var progressFill = h('div', { class: 'p-fill' });
    var progressText = h('span', { class: 'p-text', 'aria-live': 'polite' });
    var infoBtn = h('button', { class: 'icon-btn', 'aria-label': 'Зачем этот шаг', hidden: true }, icon('info', 22));
    var closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Закрыть', onclick: function () { shell.close(); } }, icon('close', 22));
    var body = h('main', { class: 'p-body', tabindex: '-1' });
    var bannerBox = h('div', { class: 'banner-box', 'aria-live': 'polite' });
    var secondary = h('button', { class: 'btn ghost', type: 'button', hidden: true });
    var primary = h('button', { class: 'btn primary', type: 'button' });
    var el = h('div', { class: 'player', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title },
      h('header', { class: 'p-top' }, closeBtn,
        h('div', { class: 'p-prog', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0', 'aria-label': 'Прогресс' }, h('div', { class: 'p-track' }, progressFill), progressText),
        infoBtn),
      body,
      h('footer', { class: 'p-foot' }, bannerBox, h('div', { class: 'p-actions' }, secondary, primary)));
    overlayRoot.appendChild(el);
    document.body.classList.add('has-player');
    try { history.pushState({ player: true }, ''); pushed = true; } catch (e) { pushed = false; }
    void el.offsetWidth; // фиксируем начальное состояние, затем запускаем переход
    el.classList.add('open');

    ['pointerdown', 'keydown'].forEach(function (t) { el.addEventListener(t, function () { lastAct = Date.now(); }, true); });
    var tick = setInterval(function () { if (document.visibilityState === 'visible' && Date.now() - lastAct < 30000) S.addSeconds(5); }, 5000);

    function onKey(e) { if (e.key === 'Escape' && !document.body.classList.contains('has-sheet')) shell.close(); }
    document.addEventListener('keydown', onKey);

    var shell = {
      el: el, body: body,
      onClose: opts.onClose,
      setProgress: function (i, n, text) {
        var pct = Math.round(Math.min(1, i / n) * 100);
        progressFill.style.setProperty('--p', pct + '%');
        el.querySelector('.p-prog').setAttribute('aria-valuenow', String(pct));
        progressText.textContent = text || ('Шаг ' + (i + 1) + ' из ' + n);
      },
      setInfo: function (fn) {
        infoBtn.hidden = !fn; infoBtn.onclick = fn || null;
      },
      setPrimary: function (o) {
        clear(primary);
        if (o.icon) primary.appendChild(icon(o.icon, 20));
        primary.appendChild(document.createTextNode(o.label));
        primary.disabled = !!o.disabled;
        primary.className = 'btn ' + (o.kind || 'primary');
        primary.onclick = o.disabled ? null : o.onClick;
        if (o.focus) primary.focus({ preventScroll: true });
      },
      setSecondary: function (o) {
        clear(secondary);
        if (!o) { secondary.hidden = true; secondary.onclick = null; return; }
        secondary.hidden = false;
        if (o.icon) secondary.appendChild(icon(o.icon, 18));
        secondary.appendChild(document.createTextNode(o.label));
        secondary.onclick = o.onClick;
      },
      banner: function (b) {
        clear(bannerBox);
        var ic = b.kind === 'ok' ? 'check' : b.kind === 'bad' ? 'cross' : 'info';
        var box = h('div', { class: 'banner ' + b.kind },
          h('span', { class: 'banner-ic' }, icon(ic, 18)),
          h('div', { class: 'banner-main' }, h('div', { class: 'banner-t', text: b.title }), b.text ? h('div', { class: 'banner-x', text: b.text }) : null, b.node || null));
        bannerBox.appendChild(box);
        // плашка занимает место снизу — прокручиваем, чтобы вывод программы не оказался под ней
        setTimeout(function () { body.scrollTo({ top: body.scrollHeight, behavior: window.UI.reduceMotion.matches ? 'auto' : 'smooth' }); }, 30);
      },
      clearBanner: function () { clear(bannerBox); },
      addCleanup: function (fn) { cleanups.push(fn); },
      runCleanups: function () { var c = cleanups; cleanups = []; c.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } }); },
      close: function () {
        if (closed) return;
        if (pushed) { try { history.back(); } catch (e) { shell.teardown(); } setTimeout(function () { shell.teardown(); }, 200); }
        else shell.teardown();
      },
      teardown: function () {
        if (closed) return; closed = true;
        clearInterval(tick); document.removeEventListener('keydown', onKey);
        shell.runCleanups();
        el.classList.remove('open');
        var gone = function () { if (el.parentNode) el.parentNode.removeChild(el); };
        if (window.UI.reduceMotion.matches) gone(); else setTimeout(gone, 300);
        document.body.classList.remove('has-player');
        openShell = null;
        S.flush();
        if (shell.onClose) shell.onClose();
      }
    };
    openShell = shell;
    return shell;
  }
  window.addEventListener('popstate', function () { if (openShell) openShell.teardown(); });

  /* ---------- урок ---------- */
  function openLesson(restart) {
    var lang = S.get().lang;
    var c = course(lang);
    var L = S.lesson(lessonKey(lang));
    if (restart) { L.doneSteps = []; L.done = false; L.results = {}; }
    if (!L.startedAt) L.startedAt = Date.now();
    var steps = visibleSteps(c);
    if (lang === 'py') R.preload('py');
    var shell = createShell({ title: 'Урок: Hello, World!', onClose: function () { renderTab(); } });
    var idx = 0;
    for (var i = 0; i < steps.length; i++) { if (L.doneSteps.indexOf(steps[i].id) === -1) { idx = i; break; } idx = steps.length - 1; }

    function summary() {
      var graded = ['code', 'fill', 'parsons', 'quiz', 'predict'], total = 0, first = 0;
      steps.forEach(function (s) { if (graded.indexOf(s.kind) !== -1) { total++; var r = L.results[s.id]; if (r && r.correct) first++; } });
      return { minutes: Math.max(1, Math.round(S.minutesToday())), total: total, firstTry: first, cards: Object.keys(cardsOfLang(lang)).length };
    }

    function mountCurrent() {
      var step = steps[idx], t0 = Date.now(), finished = false;
      shell.runCleanups(); clear(shell.body); shell.clearBanner(); shell.setSecondary(null);
      shell.setProgress(idx, steps.length);
      shell.setInfo(step.why ? function () { openWhy(step.why); } : null);
      var api = {
        lang: lang, review: false,
        setPrimary: shell.setPrimary, setSecondary: shell.setSecondary, banner: shell.banner, clearBanner: shell.clearBanner,
        cleanup: shell.addCleanup, summary: summary, confetti: confetti,
        openExamples: function () { shell.close(); setTimeout(function () { go('examples'); }, 350); },
        finish: function (result, o) {
          if (finished) return; finished = true;
          result.ms = Date.now() - t0;
          L.results[step.id] = result;
          if (L.doneSteps.indexOf(step.id) === -1) L.doneSteps.push(step.id);
          if (step.card) S.ensureCard(cardKey(lang, step.card));
          (result.cards || []).forEach(function (cc) { S.ensureCard(cardKey(lang, cc.id)); });
          S.touchDay(); S.save();
          if (o && o.advance) next();
          else shell.setPrimary({ label: idx === steps.length - 1 ? 'Завершить' : 'Дальше', onClick: next, focus: true });
        }
      };
      try { window.Steps.mount(step, shell.body, api); }
      catch (e) { shell.banner({ kind: 'bad', title: 'Не удалось показать шаг', text: String(e && e.message || e) }); shell.setPrimary({ label: 'Пропустить', onClick: next }); }
      shell.body.scrollTop = 0;
      shell.body.focus({ preventScroll: true });
    }
    function next() {
      if (idx + 1 < steps.length) { idx++; mountCurrent(); return; }
      L.done = true; L.doneAt = Date.now(); S.save();
      shell.close();
    }
    mountCurrent();
  }

  /* ---------- повторение ---------- */
  function openReview() {
    var lang = S.get().lang, c = course(lang);
    var due = C.dueCards(cardsOfLang(lang), Date.now()).filter(function (cd) { return c.cards[cd.id.slice(lang.length + 1)]; });
    if (!due.length) { toast('Сейчас повторять нечего.'); return; }
    var queue = C.shuffle(due.slice(0, 10).map(function (cd) { return cd.id; }));
    var total = queue.length, completed = 0, requeued = {}, tally = { good: 0, hard: 0, again: 0 };
    if (lang === 'py') R.preload('py');
    var shell = createShell({ title: 'Повторение', onClose: function () { renderTab(); } });
    shell.setInfo(function () { openWhy('spacing'); });

    function mountCard() {
      shell.runCleanups(); clear(shell.body); shell.clearBanner(); shell.setSecondary(null);
      if (!queue.length) { return summaryScreen(); }
      var key = queue[0], def = c.cards[key.slice(lang.length + 1)], finished = false;
      shell.setProgress(completed, total, 'Карточка ' + Math.min(completed + 1, total) + ' из ' + total);
      var api = {
        lang: lang, review: true,
        setPrimary: shell.setPrimary, setSecondary: shell.setSecondary, banner: shell.banner, clearBanner: shell.clearBanner,
        cleanup: shell.addCleanup, summary: function () { return {}; }, confetti: function () { },
        finish: function (result) {
          if (finished) return; finished = true;
          var outcome = !result.correct ? 'again' : (result.conf && result.conf !== 'sure' ? 'hard' : 'good');
          if (requeued[key] && outcome === 'good') outcome = 'hard'; // со второй попытки — уже не «сразу»
          S.reviewCard(key, outcome); tally[outcome]++;
          queue.shift();
          if (outcome === 'again' && !requeued[key]) { requeued[key] = true; queue.push(key); }
          else completed++;
          S.touchDay(); S.save();
          shell.setPrimary({ label: queue.length ? 'Дальше' : 'Завершить', onClick: mountCard, focus: true });
        }
      };
      window.Steps.mount(def, shell.body, api);
      shell.body.scrollTop = 0;
    }
    function summaryScreen() {
      shell.setProgress(total, total, 'Готово');
      shell.setInfo(null);
      var cards = cardsOfLang(lang), nextDue = Infinity;
      Object.keys(cards).forEach(function (k) { if (cards[k].due > Date.now() && cards[k].due < nextDue) nextDue = cards[k].due; });
      shell.body.appendChild(h('div', { class: 'done' },
        h('div', { class: 'done-badge', 'aria-hidden': 'true' }, icon('check', 40)),
        h('h1', { class: 'step-title center', text: 'Повторение завершено' }),
        h('div', { class: 'stats' },
          statBox(String(tally.good), 'вспомнил сразу'), statBox(String(tally.hard), 'с сомнением'), statBox(String(tally.again), 'вернутся скоро')),
        h('p', { class: 'foot-note center', text: nextDue === Infinity ? 'Все карточки пройдены.' : 'Следующее повторение — ' + humanDue(nextDue) + '.' })));
      shell.setPrimary({ label: 'Готово', onClick: function () { shell.close(); } });
      if (!tally.again) confetti();
    }
    mountCard();
  }
  function statBox(v, l) { return h('div', { class: 'stat' }, h('div', { class: 'stat-v', text: v }), h('div', { class: 'stat-l', text: l })); }

  /* ---------- вкладка «Сегодня» ---------- */
  function renderToday() {
    var st = S.get(), lang = st.lang, c = course(lang), L = S.lesson(lessonKey(lang));
    var steps = visibleSteps(c);
    var started = L.doneSteps.length > 0, finishedAll = L.done;
    var sk = C.streak(st.days, Date.now());
    var cs = C.cardStats(cardsOfLang(lang), Date.now());
    var pct = Math.round(L.doneSteps.filter(function (id) { return steps.some(function (s) { return s.id === id; }); }).length / steps.length * 100);

    var hero;
    if (finishedAll) {
      hero = h('section', { class: 'hero done', 'aria-labelledby': 'hero-t' },
        h('div', { class: 'hero-top' }, h('span', { class: 'eyebrow', text: 'День 1 · ' + langName(lang) }), h('span', { class: 'pill ok' }, icon('check', 14), 'Пройдено')),
        h('h2', { id: 'hero-t', class: 'hero-title', text: 'Hello, World!' }),
        h('p', { class: 'hero-sub', text: 'Первая программа написана. Следующий день появится позже — а пока закрепляй повторением.' }),
        h('button', { class: 'btn secondary', onclick: function () { openLesson(true); } }, 'Пройти заново'));
    } else {
      hero = h('section', { class: 'hero', 'aria-labelledby': 'hero-t' },
        h('div', { class: 'hero-top' }, h('span', { class: 'eyebrow', text: 'День 1 · ' + langName(lang) }), h('span', { class: 'pill', text: '≈ ' + (started ? minutesLeft(steps, L) : c.minutes) + ' мин' })),
        h('h2', { id: 'hero-t', class: 'hero-title', text: 'Hello, World!' }),
        h('p', { class: 'hero-sub', text: started ? 'Осталось немного. Прогресс сохранён — продолжай с того места, где остановился.' : 'Твоя первая программа: предскажешь, разберёшь, соберёшь, починишь и напишешь сам.' }),
        started ? h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Прогресс урока' }, h('div', { class: 'bar-fill', style: '--p:' + pct + '%' })) : null,
        h('button', { class: 'btn primary lg', onclick: function () { openLesson(false); } }, icon('play', 20), started ? 'Продолжить' : 'Начать урок'));
    }

    var reviewCard;
    if (!cs.total) {
      reviewCard = h('section', { class: 'card flat' }, h('div', { class: 'row' }, h('span', { class: 'row-ic' }, icon('review', 22)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Повторение' }), h('div', { class: 'row-s', text: 'Карточки появятся по ходу урока и вернутся через 1, 3, 7 дней…' }))));
    } else if (cs.due) {
      reviewCard = h('button', { class: 'card tap', onclick: openReview, 'aria-label': 'Начать повторение: ' + cs.due + ' ' + plural(cs.due, ['карточка', 'карточки', 'карточек']) },
        h('div', { class: 'row' }, h('span', { class: 'row-ic tint' }, icon('review', 22)),
          h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Пора повторить' }), h('div', { class: 'row-s', text: cs.due + ' ' + plural(cs.due, ['карточка', 'карточки', 'карточек']) + ' · ≈ ' + Math.max(1, Math.round(cs.due * 0.6)) + ' мин' })),
          icon('chevron', 18)));
    } else {
      var nd = Infinity, cards = cardsOfLang(lang); Object.keys(cards).forEach(function (k) { if (cards[k].due < nd) nd = cards[k].due; });
      reviewCard = h('section', { class: 'card flat' }, h('div', { class: 'row' }, h('span', { class: 'row-ic' }, icon('review', 22)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Повторять пока нечего' }), h('div', { class: 'row-s', text: 'Ближайшее повторение — ' + humanDue(nd) + '. ' + (st.plan ? 'Ты планировал в ' + st.plan.time + '.' : '') }))));
    }

    var week = C.weekStrip(st.days, Date.now());
    var strip = h('div', { class: 'week', role: 'list', 'aria-label': 'Эта неделя' }, week.map(function (d) {
      return h('div', { class: 'wd' + (d.today ? ' today' : '') + (d.active ? ' on' : '') + (d.future ? ' future' : ''), role: 'listitem', 'aria-label': d.label + ' ' + d.num + (d.active ? ': занимался' : d.future ? '' : ': без занятий') },
        h('span', { class: 'wd-l', text: d.label }), h('span', { class: 'wd-c' }, d.active ? icon('check', 16) : String(d.num)));
    }));
    var minToday = S.minutesToday(), goalPct = Math.min(100, Math.round(minToday / 5 * 100));

    var road = window.Course.ROADMAP.map(function (t, i) {
      return h('div', { class: 'row locked' }, h('span', { class: 'row-ic' }, icon('lock', 20)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'День ' + (i + 2) + ' · ' + t }), h('div', { class: 'row-s', text: 'Скоро' })));
    });

    var streakBtn = h('button', { class: 'streak' + (sk.alive ? ' alive' : ''), onclick: openStreak, 'aria-label': 'Серия: ' + sk.count + ' ' + plural(sk.count, ['день', 'дня', 'дней']) + '. Подробнее' },
      icon('flame', 18), h('b', { text: String(sk.count) }));

    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('div', { class: 'overline', text: cap(fmtDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })) }), h('h1', { text: 'Сегодня' })), streakBtn),
      hero, reviewCard,
      exData().length ? h('button', { class: 'card tap', onclick: function () { go('examples'); } },
        h('div', { class: 'row' }, h('span', { class: 'row-ic' }, icon('code', 22)),
          h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Примеры из твоих программ' }), h('div', { class: 'row-s', text: 'Где живут строки, функции и условия в настоящих проектах' })),
          icon('chevron', 18))) : null,
      h('section', { class: 'card', 'aria-label': 'Неделя' }, strip,
        h('div', { class: 'goal' }, h('div', { class: 'goal-row' }, h('span', { text: 'Цель дня — 5 минут' }), h('b', { text: Math.round(minToday * 10) / 10 + ' мин' })),
          h('div', { class: 'bar thin' }, h('div', { class: 'bar-fill', style: '--p:' + goalPct + '%' })),
          h('p', { class: 'muted small', text: 'Прийти на 5 минут важнее, чем сидеть час раз в неделю. Пропущенный день не страшен.' }))),
      h('h2', { class: 'section-h', text: 'Дальше' }),
      h('section', { class: 'group' }, road)));
  }

  function openStreak() {
    var sk = C.streak(S.get().days, Date.now());
    sheet({
      title: 'Мягкая серия',
      body: h('div', { class: 'why' },
        h('p', { text: sk.alive ? 'Сейчас: ' + sk.count + ' ' + plural(sk.count, ['день', 'дня', 'дней']) + (sk.forgiven ? ', из них прощённых пропусков: ' + sk.forgiven : '') + '.' : 'Серия начнётся с первого занятия.' }),
        h('p', { text: 'Правило: один пропущенный день подряд серию не обнуляет. Два подряд — обнуляют.' }),
        h('p', { class: 'muted small', text: 'Почему так: по данным Lally и др. (2010), привычка формируется в среднем ~66 дней, а единичный пропуск на неё заметно не влияет. Жёсткая серия «или всё, или ничего» чаще заставляет бросать после первого срыва. Выборка в том исследовании небольшая (82 человека), так что это ориентир, а не закон.' }))
    });
  }

  /* ---------- вкладка «Повторение» ---------- */
  function renderReview() {
    var lang = S.get().lang, cards = cardsOfLang(lang), cs = C.cardStats(cards, Date.now());
    var groups = {};
    Object.keys(cards).forEach(function (k) {
      var due = cards[k].due, key = due <= Date.now() ? 'now' : C.dayKey(due);
      (groups[key] = groups[key] || { due: due, n: 0 }).n++;
    });
    var keys = Object.keys(groups).sort(function (a, b) { return groups[a].due - groups[b].due; });
    var rows = keys.map(function (k) {
      var g = groups[k];
      return h('div', { class: 'row' }, h('span', { class: 'row-ic' }, icon('cal', 20)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: k === 'now' ? 'Можно повторить сейчас' : cap(humanDue(g.due)) }), h('div', { class: 'row-s', text: k === 'now' ? '' : fmtDate(g.due, { weekday: 'long', day: 'numeric', month: 'long' }) })),
        h('b', { class: 'row-v', text: String(g.n) }));
    });
    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Повторение' }))),
      h('section', { class: 'card center-card' },
        h('div', { class: 'big-num', text: String(cs.due) }),
        h('div', { class: 'big-cap', text: cs.total ? plural(cs.due, ['карточка', 'карточки', 'карточек']) + ' к повторению' : 'Карточек пока нет' }),
        h('p', { class: 'muted', text: cs.total ? 'Вспоминай сам — не подглядывай. Так запоминается надёжнее, чем перечитывание.' : 'Пройди шаги урока — карточки появятся сами.' }),
        h('button', { class: 'btn primary lg', disabled: !cs.due, onclick: openReview }, icon('play', 20), 'Начать повторение')),
      keys.length ? h('h2', { class: 'section-h', text: 'Расписание' }) : null,
      keys.length ? h('section', { class: 'group' }, rows) : null,
      h('button', { class: 'link-btn', onclick: function () { openWhy('spacing'); } }, icon('info', 18), 'Почему интервалы растут'),
      h('button', { class: 'link-btn', onclick: function () { openWhy('interleave'); } }, icon('info', 18), 'Почему карточки вперемешку')));
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- вкладка «Песочница» ---------- */
  var sbLang = null;
  function renderSandbox() {
    var st = S.get();
    if (!sbLang) sbLang = st.lang;
    var lang = sbLang;
    var starter = lang === 'py' ? 'print("Hello, World!")' : 'console.log("Hello, World!");';
    var code = (st.sandbox && st.sandbox[lang]) || starter;
    var con = window.Steps.consoleView(lang);
    var ed = window.Editor.create({
      lang: lang, value: code, minLines: 8, label: 'Песочница: редактор кода', onRun: run,
      onChange: function (v) { st.sandbox = st.sandbox || {}; st.sandbox[lang] = v; S.save(); }
    });
    var busy = false;
    function run() {
      if (busy) return; busy = true; runBtn.disabled = true;
      window.Steps.execute(lang, ed.getValue(), con).then(function (r) {
        busy = false; runBtn.disabled = false;
        ed.markError(r.errorLine || 0);
        if (r.curly) toast('Телефон заменил кавычки на «умные» — мы подставили обычные.');
        S.addSeconds(0); S.touchDay();
      });
    }
    var runBtn = h('button', { class: 'btn primary', onclick: run }, icon('play', 20), 'Запустить');
    var seg = h('div', { class: 'seg', role: 'tablist', 'aria-label': 'Язык' }, [['py', 'Python'], ['js', 'JavaScript']].map(function (o) {
      return h('button', { role: 'tab', 'aria-selected': o[0] === lang ? 'true' : 'false', class: o[0] === lang ? 'on' : '', onclick: function () { sbLang = o[0]; if (o[0] === 'py') R.preload('py'); renderSandbox(); } }, o[1]);
    }));
    var ideas = (lang === 'py' ? ['print(2 + 2)', 'print("Привет, " + "мир")', 'print("a" * 3)'] : ['console.log(2 + 2);', 'console.log("Привет, " + "мир");', 'console.log("a".repeat(3));']);
    var chips = h('div', { class: 'chips scroll' }, ideas.map(function (t) {
      return h('button', { class: 'chip code', text: t, onclick: function () { ed.setValue(t); con.idle(); } });
    }));
    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Песочница' }))),
      seg,
      h('p', { class: 'muted', text: 'Свободная практика: пиши что угодно и смотри, что получится. Сломать ничего нельзя.' }),
      ed.el,
      h('div', { class: 'sb-actions' }, runBtn, h('button', { class: 'btn ghost', onclick: function () { ed.setValue(starter); con.idle(); } }, 'Сбросить')),
      con.el,
      h('div', { class: 'conf-label', text: 'Попробуй' }), chips));
  }

  /* ---------- вкладка «Примеры» ---------- */
  function exData() { return (window.EXAMPLES && window.EXAMPLES.projects) || []; }
  function inline(text) { // `код` внутри пояснений — отдельным элементом, без innerHTML
    var out = [];
    String(text).split('`').forEach(function (part, i) { out.push(i % 2 ? h('code', { text: part }) : part); });
    return out;
  }
  function numberedCode(sn) {
    var gut = h('div', { class: 'nb-gutter', 'aria-hidden': 'true' }, sn.nums.map(function (n) { return h('span', { text: n ? String(n) : '⋯' }); }));
    var pre = h('pre', { class: 'nb-code' });
    pre.innerHTML = C.highlight(sn.code, sn.lang); // highlight экранирует HTML
    return h('div', { class: 'numblock', role: 'group', 'aria-label': 'Код из файла ' + sn.file + ', строки ' + sn.lines }, gut, h('div', { class: 'nb-scroll' }, pre));
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Скопировано.'); }, function () { toast('Не удалось скопировать — выдели код и скопируй вручную.'); });
    } else toast('Копирование недоступно в этом браузере.');
  }
  function openInSandbox(demo) {
    var st = S.get(); st.sandbox = st.sandbox || {};
    st.sandbox[demo.lang] = demo.code; S.save();
    sbLang = demo.lang;
    if (demo.lang === 'py') R.preload('py');
    go('sandbox');
    toast('Пример в Песочнице — нажми «Запустить».');
  }
  function snippetCard(sn) {
    var actions = [h('button', { class: 'btn secondary', onclick: function () { copyText(sn.code); } }, icon('copy', 18), 'Копировать')];
    if (sn.demo) actions.push(h('button', { class: 'btn primary', onclick: function () { openInSandbox(sn.demo); } }, icon('play', 18), 'Запустить в песочнице'));
    var demoOut = null;
    if (sn.demo) {
      demoOut = h('div', { class: 'demo-out' }, h('div', { class: 'conf-label', text: 'Что выведет пример (' + (sn.demo.lang === 'py' ? 'Python' : 'JavaScript') + ')' }),
        sn.demo.out !== null && sn.demo.out !== undefined ? h('pre', { class: 'cmp-pre', text: sn.demo.out }) : null,
        sn.demo.outNote ? h('p', { class: 'muted small', text: sn.demo.outNote }) : null);
    }
    return h('article', { class: 'card snip' },
      h('h3', { class: 'snip-t', text: sn.title }),
      h('div', { class: 'snip-file' }, icon('file', 14), h('code', { text: sn.file }), ' · строки ' + sn.lines),
      numberedCode(sn),
      h('div', { class: 'callout' }, h('b', { text: 'Связь с твоим уроком' }), h('p', null, inline(sn.bridge))),
      h('div', { class: 'conf-label', text: 'На что смотреть' }),
      h('ol', { class: 'notes' }, sn.notes.map(function (n) { return h('li', null, inline(n)); })),
      demoOut,
      h('div', { class: 'snip-actions' }, actions));
  }
  function renderExamples() {
    var list = exData();
    var proj = exSub ? list.filter(function (p) { return p.id === exSub; })[0] : null;
    if (!list.length) {
      clear(main).appendChild(h('div', { class: 'page' }, h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Примеры' }))),
        h('p', { class: 'muted', text: 'Не удалось загрузить примеры. Обнови страницу.' })));
      return;
    }
    if (proj) {
      var runnable = proj.snippets.filter(function (s) { return s.demo; }).length;
      clear(main).appendChild(h('div', { class: 'page' },
        h('button', { class: 'back-btn', onclick: function () { go('examples'); } }, icon('back', 20), 'Примеры'),
        h('header', { class: 'ex-head' },
          h('span', { class: 'ex-ic' }, icon(proj.icon, 28)),
          h('h1', { text: proj.name }),
          h('p', { class: 'ex-tag', text: proj.tagline }),
          h('div', { class: 'chips' }, proj.stack.map(function (s) { return h('span', { class: 'pill', text: s }); }))),
        h('section', { class: 'card flat facts' },
          proj.stat ? h('div', { class: 'fact' }, h('span', { text: 'Размер' }), h('b', { text: proj.stat })) : null,
          proj.commit ? h('div', { class: 'fact' }, h('span', { text: 'Версия' }), h('b', { text: 'коммит ' + proj.commit })) : null,
          h('div', { class: 'fact' }, h('span', { text: 'Где лежит' }), h('b', { text: proj.where }))),
        h('h2', { class: 'section-h', text: 'Как устроена' }),
        h('section', { class: 'group' }, proj.tree.map(function (t) {
          return h('div', { class: 'row tree-row' }, h('span', { class: 'row-ic' }, icon('file', 18)), h('div', { class: 'row-main' }, h('div', { class: 'row-t mono', text: t[0] }), h('div', { class: 'row-s', text: t[1] })));
        })),
        h('h2', { class: 'section-h', text: 'Фрагменты кода' }),
        h('p', { class: 'muted small', text: 'Код показан дословно из рабочих файлов (убран только общий отступ слева); слева — номера строк в исходном файле.' + (runnable ? ' Примеры с кнопкой «Запустить» работают в Песочнице прямо здесь.' : '') }),
        proj.snippets.map(snippetCard)));
      return;
    }
    var rows = list.map(function (p) {
      var run = p.snippets.filter(function (s) { return s.demo; }).length;
      return h('button', { class: 'row tap ex-row', onclick: function () { go('examples', p.id); } },
        h('span', { class: 'row-ic tint' }, icon(p.icon, 22)),
        h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: p.name }), h('div', { class: 'row-s clamp', text: p.tagline }),
          h('div', { class: 'row-s', text: p.snippets.length + ' ' + plural(p.snippets.length, ['фрагмент', 'фрагмента', 'фрагментов']) + (run ? ' · можно запустить: ' + run : '') })),
        icon('chevron', 18));
    });
    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Примеры' }))),
      h('p', { class: 'lead-sm', text: 'Реальные фрагменты из программ, которые я для тебя писал. Они собраны из тех же кирпичиков, что и твой Hello World: строки в кавычках, функции, условия, циклы. Выбери программу — увидишь, как она устроена.' }),
      h('section', { class: 'group' }, rows),
      h('p', { class: 'muted small', text: 'Это снимок на ' + (window.EXAMPLES.builtAt || '') + ': если программы изменятся, здесь останутся прежние версии фрагментов.' })));
  }

  /* ---------- вкладка «Прогресс» ---------- */
  function renderProgress() {
    var st = S.get(), lang = st.lang, sk = C.streak(st.days, Date.now()), cs = C.cardStats(cardsOfLang(lang), Date.now());
    var cal = S.calibration();
    function calRow(label, b) {
      var pct = b.n ? Math.round(b.ok / b.n * 100) : 0;
      return h('div', { class: 'cal-row' }, h('div', { class: 'cal-l', text: label }),
        h('div', { class: 'bar thin' }, h('div', { class: 'bar-fill', style: '--p:' + pct + '%' })),
        h('div', { class: 'cal-v', text: b.n ? pct + '% · ' + b.n : '—' }));
    }
    var calText = 'Пока мало ответов. Отмечай уверенность в вопросах — приложение покажет, насколько ей можно доверять.';
    if (cal.sure.n >= 4 && cal.sure.ok / cal.sure.n < 0.7) calText = 'Когда ты «уверен», ты прав реже, чем кажется. Это нормально и полезно знать: такие ошибки как раз лучше всего запоминаются.';
    else if (cal.sure.n >= 4) calText = 'Твоя уверенность хорошо согласуется с результатом — доверяй себе, но продолжай проверять.';

    var whyKeys = ['predict', 'worked', 'parsons', 'make', 'retrieval', 'spacing', 'selfexp', 'plan'];
    var whyRows = whyKeys.map(function (k) {
      return h('button', { class: 'row tap', onclick: function () { openWhy(k); } }, h('span', { class: 'row-ic' }, icon('book', 20)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: window.Course.WHY[k].title })), icon('chevron', 18));
    });

    function segSetting(label, current, options, onPick) {
      return h('div', { class: 'setting' }, h('div', { class: 'setting-l', text: label }),
        h('div', { class: 'seg small', role: 'radiogroup', 'aria-label': label }, options.map(function (o) {
          return h('button', { role: 'radio', 'aria-checked': o[0] === current ? 'true' : 'false', class: o[0] === current ? 'on' : '', onclick: function () { onPick(o[0]); } }, o[1]);
        })));
    }
    var fileIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: function () {
      var f = fileIn.files && fileIn.files[0]; if (!f) return;
      if (f.size > 1024 * 1024) { toast('Файл слишком большой для сохранения Бастау.'); return; }
      f.text().then(function (t) { var r = S.importJSON(t); if (r.ok) { toast('Прогресс загружен.'); applyTheme(); renderTab(); } else toast(r.msg); });
    } });

    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Прогресс' }))),
      h('div', { class: 'tiles' },
        tile(String(sk.count), plural(sk.count, ['день', 'дня', 'дней']) + ' в серии'),
        tile(String(Math.round(S.minutesWeek())), 'мин за 7 дней'),
        tile(cs.mastered + ' / ' + cs.total, 'карточек освоено')),
      h('h2', { class: 'section-h', text: 'Можно ли доверять своей уверенности' }),
      h('section', { class: 'card' }, calRow('Уверен', cal.sure), calRow('Скорее да', cal.maybe), calRow('Угадываю', cal.guess), h('p', { class: 'muted small', text: calText })),
      h('h2', { class: 'section-h', text: 'Почему так учим' }),
      h('section', { class: 'group' }, whyRows),
      h('h2', { class: 'section-h', text: 'Настройки' }),
      h('section', { class: 'card' },
        segSetting('Язык урока', st.lang, [['py', 'Python'], ['js', 'JavaScript']], function (v) { st.lang = v; S.save(); if (v === 'py') R.preload('py'); renderProgress(); }),
        segSetting('Мой опыт', st.level || 'new', [['new', 'Новичок'], ['some', 'Немного'], ['pro', 'Уверенно']], function (v) { st.level = v; S.save(); renderProgress(); }),
        segSetting('Тема', st.theme, [['auto', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']], function (v) { st.theme = v; S.save(); applyTheme(); renderProgress(); })),
      h('section', { class: 'group' },
        h('button', { class: 'row tap', onclick: function () { window.UI.downloadText('bastau-progress-' + C.dayKey(Date.now()) + '.json', S.exportJSON(), 'application/json'); toast('Файл сохранён.'); } }, h('span', { class: 'row-ic' }, icon('download', 20)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Сохранить прогресс в файл' }), h('div', { class: 'row-s', text: 'Всё хранится только на этом устройстве' }))),
        h('button', { class: 'row tap', onclick: function () { fileIn.click(); } }, h('span', { class: 'row-ic' }, icon('upload', 20)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Загрузить из файла' }))),
        h('button', { class: 'row tap danger', onclick: function () {
          window.UI.confirmSheet({ title: 'Стереть весь прогресс?', text: 'Уроки, карточки и серия будут удалены с этого устройства. Это нельзя отменить — сначала можно сохранить файл.', confirm: 'Стереть', danger: true, onConfirm: function () { S.reset(); applyTheme(); sbLang = null; start(); } });
        } }, h('span', { class: 'row-ic' }, icon('trash', 20)), h('div', { class: 'row-main' }, h('div', { class: 'row-t', text: 'Стереть прогресс' })))),
      fileIn,
      h('p', { class: 'muted small center', text: 'Бастау · данные не покидают устройство · Python загружается из jsDelivr при первом запуске' })));
  }
  function tile(v, l) { return h('div', { class: 'tile' }, h('div', { class: 'tile-v', text: v }), h('div', { class: 'tile-l', text: l })); }

  /* ---------- вкладки ---------- */
  function renderTabs() {
    clear(tabbar);
    TABS.forEach(function (t) {
      tabbar.appendChild(h('button', {
        class: 'tab' + (t[0] === tab ? ' on' : ''), 'aria-current': t[0] === tab ? 'page' : null,
        onclick: function () { go(t[0]); }
      }, icon(t[2], 26), h('span', { class: 'tab-l', text: t[1] })));
    });
  }
  function renderTab() {
    renderTabs();
    try {
      if (tab === 'review') renderReview(); else if (tab === 'sandbox') renderSandbox(); else if (tab === 'examples') renderExamples(); else if (tab === 'progress') renderProgress(); else renderToday();
    } catch (e) { renderFail(e); }
  }
  // Если вкладка не нарисовалась — показываем причину на экране, а не молчим.
  function diagText(e) {
    var scripts = [].slice.call(document.scripts).map(function (s) { return (s.getAttribute('src') || '').match(/v=(\d+)/); }).filter(Boolean).map(function (m) { return m[1]; });
    return [
      'Ошибка: ' + (e && e.message || e),
      'Вкладка: ' + tab + (exSub ? '/' + exSub : ''),
      'Версия файлов: ' + (scripts.length ? scripts.join(',') : '?'),
      'Примеры загружены: ' + ((window.EXAMPLES && window.EXAMPLES.projects && window.EXAMPLES.projects.length) || 0),
      'Окно: ' + innerWidth + '×' + innerHeight + ', ' + navigator.userAgent,
      'Где: ' + String(e && e.stack || '').split('\n').slice(0, 4).join(' | ')
    ].join('\n');
  }
  function renderFail(e) {
    var text = diagText(e);
    var actions = [h('button', { class: 'btn secondary', onclick: function () { copyText(text); } }, icon('copy', 18), 'Скопировать описание')];
    actions.push(tab === 'today'
      ? h('button', { class: 'btn primary', onclick: function () { location.reload(); } }, 'Обновить страницу')
      : h('button', { class: 'btn primary', onclick: function () { go('today'); } }, 'Вернуться на «Сегодня»'));
    clear(main).appendChild(h('div', { class: 'page' },
      h('header', { class: 'large-title' }, h('div', null, h('h1', { text: 'Не получилось открыть' }))),
      h('p', { class: 'muted', text: 'Это ошибка приложения, не твоя. Нажми «Скопировать описание» и пришли мне — я исправлю.' }),
      h('pre', { class: 'cmp-pre', text: text }),
      h('div', { class: 'snip-actions' }, actions)));
  }
  window.addEventListener('error', function (ev) { if (ev && ev.message && !/ResizeObserver/.test(ev.message)) toast('Ошибка: ' + ev.message); });
  window.addEventListener('unhandledrejection', function (ev) { var r = ev && ev.reason; toast('Ошибка: ' + (r && r.message || r)); });
  function parseHash() {
    var parts = (location.hash || '').replace('#', '').split('/');
    var t = TABS.some(function (x) { return x[0] === parts[0]; }) ? parts[0] : 'today';
    return { tab: t, sub: t === 'examples' && parts[1] ? parts[1] : null };
  }
  function go(t, sub) {
    tab = t; exSub = sub || null;
    try { history.replaceState(null, '', '#' + t + (exSub ? '/' + exSub : '')); } catch (e) { /* ignore */ }
    renderTab();
    main.scrollTop = 0; window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  /* ---------- знакомство ---------- */
  function renderWelcome() {
    var st = S.get(), lang = st.lang || 'py', level = st.level || 'new';
    var el = h('div', { class: 'welcome', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'w-t' });
    function draw() {
      clear(el);
      var langCards = [['py', 'Python', 'Проще читать. Лучший старт для большинства.'], ['js', 'JavaScript', 'Запускается мгновенно, работает без интернета.']].map(function (o) {
        return h('button', { class: 'choice' + (lang === o[0] ? ' on' : ''), role: 'radio', 'aria-checked': lang === o[0] ? 'true' : 'false', onclick: function () { lang = o[0]; if (lang === 'py') R.preload('py'); draw(); } },
          h('span', { class: 'choice-t', text: o[1] }), h('span', { class: 'choice-s', text: o[2] }));
      });
      var levels = [['new', 'Впервые'], ['some', 'Немного пробовал'], ['pro', 'Уже пишу код']].map(function (o) {
        return h('button', { class: 'chip' + (level === o[0] ? ' on' : ''), role: 'radio', 'aria-checked': level === o[0] ? 'true' : 'false', onclick: function () { level = o[0]; draw(); } }, o[1]);
      });
      el.appendChild(h('div', { class: 'welcome-in' },
        h('div', { class: 'logo', 'aria-hidden': 'true' }, h('span', { text: '>_' })),
        h('h1', { id: 'w-t', class: 'welcome-t', text: 'Бастау' }),
        h('p', { class: 'welcome-s', text: 'Первая программа за 20 минут — и дальше без забывания. Научно обоснованные приёмы: предсказать, разобрать, собрать, написать самому, повторить вовремя.' }),
        h('div', { class: 'conf-label', text: 'С какого языка начнём?' }),
        h('div', { class: 'choices', role: 'radiogroup', 'aria-label': 'Язык' }, langCards),
        h('div', { class: 'conf-label', text: 'Твой опыт' }),
        h('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Опыт' }, levels),
        h('button', { class: 'btn primary lg', onclick: function () {
          st.lang = lang; st.level = level; st.welcomed = true; S.save();
          if (el.parentNode) el.parentNode.removeChild(el);
          document.body.classList.remove('has-welcome');
          renderTab(); openLesson(false);
        } }, 'Начать урок'),
        h('p', { class: 'muted small center', text: 'Без регистрации. Прогресс хранится только на этом устройстве.' })));
    }
    draw();
    overlayRoot.appendChild(el);
    document.body.classList.add('has-welcome');
  }

  /* ---------- запуск ---------- */
  function start() {
    var ph = parseHash();
    tab = ph.tab; exSub = ph.sub;
    applyTheme();
    renderTab();
    if (!S.get().welcomed) renderWelcome();
    else if (S.get().lang === 'py') { if ('requestIdleCallback' in window) requestIdleCallback(function () { R.preload('py'); }, { timeout: 4000 }); else setTimeout(function () { R.preload('py'); }, 1500); }
  }
  document.addEventListener('bastau:storage-failed', function () { toast('Не удаётся сохранять прогресс (приватный режим?). Сохрани файл в «Прогресс».'); });
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  window.addEventListener('hashchange', function () { var ph = parseHash(); if (!openShell && (ph.tab !== tab || ph.sub !== exSub)) go(ph.tab, ph.sub); });

  // автообновление «пора повторить» при возврате на вкладку
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !openShell && (tab === 'today' || tab === 'review')) renderTab(); });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.search.indexOf('nosw') === -1) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* офлайн-режим недоступен — не критично */ }); });
  }

  window.__bastau = { openLesson: openLesson, openReview: openReview, go: go, course: course };
  start();
})();
