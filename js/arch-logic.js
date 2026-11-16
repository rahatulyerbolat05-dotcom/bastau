/* Логика направления «Архитектура» без DOM: какой сегодня день, что выполнено, записи пользователя, напоминания.
   Тестируется в Node. Экран — в js/arch.js, содержание — в js/arch-course.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ArchLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DAY = 86400000, MONTH = 30 * DAY;

  function ensure(state, now) {
    if (!state.arch || typeof state.arch !== 'object') state.arch = {};
    var a = state.arch;
    if (!a.startedAt) a.startedAt = now;
    a.on = true;
    ['days', 'fav', 'items', 'marks'].forEach(function (k) { if (!a[k] || typeof a[k] !== 'object') a[k] = {}; });
    return a;
  }
  function blocksOf(arch, n) { var d = arch && arch.days && arch.days[String(n)]; return (d && d.b) || {}; }
  function isDone(arch, n, id) { return !!blocksOf(arch, n)[id]; }
  function markBlock(arch, n, id, now) {
    var key = String(n);
    if (!arch.days[key]) arch.days[key] = { b: {} };
    if (!arch.days[key].b) arch.days[key].b = {};
    if (!arch.days[key].b[id]) arch.days[key].b[id] = now; // момент первого выполнения не перезаписывается
    return arch.days[key];
  }
  function coreDone(arch, n, blocks) { return blocks.filter(function (b) { return b.core; }).every(function (b) { return isDone(arch, n, b.id); }); }
  function doneCount(arch, n, blocks) { return blocks.filter(function (b) { return isDone(arch, n, b.id); }).length; }
  // Текущий день — первый, у которого не выполнен урок (четыре основных блока). Может быть больше числа готовых дней.
  function currentDay(arch, blocks) {
    var n = 1;
    while (n < 10000 && coreDone(arch, n, blocks)) n++;
    return n;
  }
  function weekOf(day) { return Math.max(1, Math.ceil(day / 7)); }

  function newId(now) { return 'i' + now.toString(36) + Math.random().toString(36).slice(2, 8); }
  function list(arch, kind) {
    return Object.keys((arch && arch.items) || {}).map(function (k) { return arch.items[k]; })
      .filter(function (it) { return it && !it.del && (!kind || it.kind === kind); })
      .sort(function (p, q) { return (q.at || 0) - (p.at || 0); });
  }
  // создать или изменить запись; u — отметка изменения для слияния устройств
  function upsert(arch, item, now) {
    var it = Object.assign({}, item);
    if (!it.id) { it.id = newId(now); it.at = now; }
    if (!it.at) it.at = now;
    it.u = now;
    delete it.del;
    arch.items[it.id] = it;
    return it;
  }
  // удаление оставляет «надгробие»: иначе запись вернулась бы с другого устройства
  function remove(arch, id, now) {
    var it = arch.items[id];
    if (!it) return null;
    arch.items[id] = { id: id, kind: it.kind, u: now, del: true };
    return it;
  }
  function weekly(arch, kind, week) { return list(arch, kind).filter(function (it) { return it.week === week; })[0] || null; }

  function isFav(arch, id) { var f = arch && arch.fav && arch.fav[id]; return !!(f && f.on); }
  function setFav(arch, id, on, now) { arch.fav[id] = { on: !!on, u: now }; }
  function favIds(arch) { return Object.keys((arch && arch.fav) || {}).filter(function (k) { return arch.fav[k] && arch.fav[k].on; }); }

  // Раз в месяц: пересмотреть банк идей (если в нём что-то есть) и поговорить с практиком.
  function ideasReviewDue(arch, now) {
    var ideas = list(arch, 'idea');
    if (!ideas.length) return false;
    var from = (arch.marks && arch.marks.ideasReview) || ideas[ideas.length - 1].at || arch.startedAt || now;
    return now - from >= MONTH;
  }
  function personThisMonth(arch, now) {
    return list(arch, 'person').some(function (p) { return now - (p.at || 0) < MONTH; });
  }

  function stats(arch, course) {
    var blocks = course.BLOCKS, day = currentDay(arch, blocks), lessons = day - 1;
    var modulesDone = 0, used = 0;
    course.MODULES.forEach(function (m) { used += m.weeks * 7; if (lessons >= used) modulesDone++; });
    var works = list(arch).filter(function (it) { return ['practice', 'sketch', 'project', 'city', 'jstask'].indexOf(it.kind) !== -1; }).length;
    return { day: day, lessons: lessons, modulesDone: modulesDone, works: works, ideas: list(arch, 'idea').length, people: list(arch, 'person').length, fav: favIds(arch).length };
  }
  // модуль, к которому относится день (по плановой длине модулей)
  function moduleOfDay(course, day) {
    var used = 0;
    for (var i = 0; i < course.MODULES.length; i++) { used += course.MODULES[i].weeks * 7; if (day <= used) return course.MODULES[i]; }
    return course.MODULES[course.MODULES.length - 1];
  }

  return {
    DAY: DAY, MONTH: MONTH,
    ensure: ensure, blocksOf: blocksOf, isDone: isDone, markBlock: markBlock, coreDone: coreDone, doneCount: doneCount,
    currentDay: currentDay, weekOf: weekOf, list: list, upsert: upsert, remove: remove, weekly: weekly,
    isFav: isFav, setFav: setFav, favIds: favIds, ideasReviewDue: ideasReviewDue, personThisMonth: personThisMonth,
    stats: stats, moduleOfDay: moduleOfDay
  };
});
