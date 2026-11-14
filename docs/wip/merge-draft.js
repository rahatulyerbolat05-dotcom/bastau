  /* ---------- слияние прогресса с двух устройств (для облачного сохранения) ----------
     Чистая функция. Для всего, что уходит в облако (см. cloudView), результат не зависит от порядка:
     merge(a, b) и merge(b, a) дают одно и то же, а повторное слияние ничего не меняет.
     Без этого два устройства перезаписывали бы друг друга при каждой синхронизации. */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  // JSON с ключами по алфавиту — чтобы сравнивать состояния независимо от порядка полей
  function stable(x) {
    if (x === null || typeof x !== 'object') return JSON.stringify(x === undefined ? null : x);
    if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
    return '{' + Object.keys(x).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(x[k]); }).join(',') + '}';
  }
  function pickStable(p, q) { return stable(p) >= stable(q) ? p : q; }
  function minPos(x, y) { var v = [x, y].filter(function (n) { return typeof n === 'number' && n > 0; }); return v.length ? Math.min.apply(null, v) : null; }

  function mergeLesson(x, y) {
    var rx = x.rev || 0, ry = y.rev || 0;
    if (rx !== ry) return clone(rx > ry ? x : y); // «пройти заново» новее — побеждает целиком
    var out = clone(x), ids = {};
    (x.doneSteps || []).concat(y.doneSteps || []).forEach(function (id) { ids[id] = true; });
    out.doneSteps = Object.keys(ids).sort();
    out.results = {};
    var rk = {};
    Object.keys(x.results || {}).concat(Object.keys(y.results || {})).forEach(function (k) { rk[k] = true; });
    Object.keys(rk).forEach(function (k) {
      var p = (x.results || {})[k], q = (y.results || {})[k];
      out.results[k] = clone(p && q ? pickStable(p, q) : (p || q));
    });
    var xd = !!x.done, yd = !!y.done;
    out.done = xd || yd;
    out.skipped = xd && yd ? !!(x.skipped && y.skipped) : (xd ? !!x.skipped : (yd ? !!y.skipped : false));
    out.startedAt = minPos(x.startedAt, y.startedAt);
    out.doneAt = Math.max(x.doneAt || 0, y.doneAt || 0) || null;
    if (rx) out.rev = rx;
    return out;
  }
  function mergeCard(p, q) {
    if ((p.last || 0) !== (q.last || 0)) return clone((p.last || 0) > (q.last || 0) ? p : q); // позже повторённая — актуальнее
    if ((p.reps || 0) !== (q.reps || 0)) return clone((p.reps || 0) > (q.reps || 0) ? p : q);
    return clone(pickStable(p, q));
  }

  function mergeState(a, b) {
    if (!b) return clone(a);
    var ea = a.epoch || 0, eb = b.epoch || 0;
    // «стереть прогресс» новее всего, что было до него: старая сторона отбрасывается целиком
    if (ea !== eb) { var win = clone(ea > eb ? a : b); win.sandbox = clone(a.sandbox || {}); return win; }
    var out = clone(a), k;

    out.lessons = {};
    var lk = {};
    Object.keys(a.lessons || {}).concat(Object.keys(b.lessons || {})).forEach(function (x) { lk[x] = true; });
    for (k in lk) { var la = (a.lessons || {})[k], lb = (b.lessons || {})[k]; out.lessons[k] = la && lb ? mergeLesson(la, lb) : clone(la || lb); }

    out.cards = {};
    var ck = {};
    Object.keys(a.cards || {}).concat(Object.keys(b.cards || {})).forEach(function (x) { ck[x] = true; });
    for (k in ck) { var ca = (a.cards || {})[k], cb = (b.cards || {})[k]; out.cards[k] = ca && cb ? mergeCard(ca, cb) : clone(ca || cb); }

    var dk = {};
    (a.days || []).concat(b.days || []).forEach(function (d) { dk[d] = true; });
    out.days = Object.keys(dk).sort();

    out.minutes = {};
    Object.keys(a.minutes || {}).concat(Object.keys(b.minutes || {})).forEach(function (d) {
      out.minutes[d] = Math.max((a.minutes || {})[d] || 0, (b.minutes || {})[d] || 0);
    });

    var seen = {}, calib = [];
    (a.calib || []).concat(b.calib || []).forEach(function (r) {
      var key = r.t + '|' + r.c + '|' + (r.ok ? 1 : 0);
      if (!seen[key]) { seen[key] = true; calib.push({ c: r.c, ok: !!r.ok, t: r.t }); }
    });
    calib.sort(function (p, q) { return p.t - q.t || (stable(p) < stable(q) ? -1 : 1); });
    out.calib = calib.slice(-300);

    out.notes = {};
    Object.keys(a.notes || {}).concat(Object.keys(b.notes || {})).forEach(function (n) {
      var p = (a.notes || {})[n], q = (b.notes || {})[n];
      p = typeof p === 'string' ? p : ''; q = typeof q === 'string' ? q : '';
      out.notes[n] = p.length !== q.length ? (p.length > q.length ? p : q) : (p >= q ? p : q);
    });

    // план и настройки: побеждает более поздняя запись
    var pa = a.plan || null, pb = b.plan || null;
    out.plan = pa && pb ? clone(((pa.at || 0) !== (pb.at || 0)) ? ((pa.at || 0) > (pb.at || 0) ? pa : pb) : pickStable(pa, pb)) : clone(pa || pb);
    var fa = a.prefsAt || 0, fb = b.prefsAt || 0;
    var prefs = function (s) { return { lang: s.lang, level: s.level || null, theme: s.theme || 'auto' }; };
    var pw = fa !== fb ? prefs(fa > fb ? a : b) : pickStable(prefs(a), prefs(b));
    out.lang = pw.lang; out.level = pw.level; out.theme = pw.theme; out.prefsAt = Math.max(fa, fb);

    out.welcomed = !!(a.welcomed || b.welcomed);
    out.created = minPos(a.created, b.created) || a.created || b.created || 0;
    out.epoch = ea;
    out.v = 1;
    out.sandbox = clone(a.sandbox || {}); // песочница — черновик этого устройства, в облако не уходит
    return out;
  }
  // то, что хранится в облаке: всё, кроме черновиков песочницы
  function cloudView(s) { var c = clone(s); delete c.sandbox; return c; }
  function sameCloud(a, b) { return stable(cloudView(a)) === stable(cloudView(b)); }
  function hasProgress(s) {
    if (!s) return false;
    if (Object.keys(s.cards || {}).length) return true;
    return Object.keys(s.lessons || {}).some(function (k) { var l = s.lessons[k]; return l && (l.done || (l.doneSteps || []).length); });
  }

