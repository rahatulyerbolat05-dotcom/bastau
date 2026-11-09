// Сквозной прогон урока в браузере: window.__e2e(lang, level, lessonId) проходит все шаги реальными кликами по DOM (lessonId: 'hello' | 'vars').
// Загружается тегом <script> (CSP запрещает eval). Требует tests/browser-helpers.js.
window.__e2e = async function (lang, level, lessonId) {
  lessonId = lessonId || 'hello';
  const t = window.__t, { $, $$, sleep, waitFor, clickPrimary, step, banner, setCode, run, primary } = t;
  const out = [];
  const st = Store.get();
  st.lang = lang; st.level = level || 'new'; st.welcomed = true; st.lessons[lessonId + ':' + lang] = { done: false, doneSteps: [], results: {}, startedAt: null, doneAt: null };
  Store.save(); __bastau.go('today'); await sleep(300);
  const c = __bastau.course(lang, lessonId);
  const visible = c.steps.filter(s => !(s.novice && st.level === 'pro'));
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message));
  __bastau.openLesson(true, lessonId); await sleep(500);
  let guard = 0;
  while ($('.player') && guard++ < 40) {
    const m = /Шаг (\d+) из (\d+)/.exec(step() || '');
    if (!m) { await sleep(200); continue; }
    const s = visible[+m[1] - 1];
    const t0 = Date.now();
    if (window.__stepHook) { await sleep(450); const h = window.__stepHook(s); if (h) out.push('[' + s.id + ': ' + h + ']'); }
    switch (s.kind) {
      case 'intro': await clickPrimary(); break;
      case 'predict': {
        $$('.opt').find(b => b.textContent.trim() === s.options.find(o => o.correct).text.trim()).click();
        $$('.conf .chip').find(b => b.textContent === 'Уверен').click();
        await clickPrimary(); await clickPrimary();
        await waitFor(() => $('.banner.ok'), 30000, 'predict ok'); await clickPrimary(); break;
      }
      case 'anatomy': for (const b of $$('.part')) { b.click(); await sleep(30); } await clickPrimary(); break;
      case 'parsons': {
        for (const x of s.solutions[0]) $$('.pz-bank .tok').find(b => b.textContent === x).click();
        await sleep(40); primary().click(); await waitFor(() => $('.banner.ok'), 3000, 'parsons ok'); await clickPrimary(); break;
      }
      case 'fill': {
        const ins = $$('.blank'); s.blanks.forEach((b, i) => { ins[i].value = b.accept[0]; ins[i].dispatchEvent(new Event('input', { bubbles: true })); });
        primary().click(); await waitFor(() => $('.banner.ok'), 3000, 'fill ok'); await clickPrimary(); break;
      }
      case 'code': {
        let code = s.solution;
        if (lessonId === 'hello' && s.id === 'make2') code = lang === 'py' ? 'print("Привет!")\nprint("Меня зовут Ерболат")' : 'console.log("Привет!");\nconsole.log("Меня зовут Ерболат");';
        setCode(code); await run(); await waitFor(() => $('.banner.ok'), 5000, 'code ok:' + s.id); await clickPrimary(); break;
      }
      case 'quiz': {
        for (const q of s.questions) {
          $$('.opt').find(b => b.textContent.trim() === q.options.find(o => o.correct).text.trim()).click();
          $$('.conf .chip').find(b => b.textContent === 'Уверен').click();
          await clickPrimary(); await clickPrimary();
        }
        break;
      }
      case 'explain': {
        const ta = $('.free'); ta.value = 'Команда выводит на экран то, что стоит в скобках; кавычки обозначают текст.'; ta.dispatchEvent(new Event('input', { bubbles: true }));
        await clickPrimary(); $$('.rate .chip').find(b => b.textContent === 'Совпало').click(); await sleep(150); await clickPrimary(); break;
      }
      case 'plan': await clickPrimary(); break;
      case 'done': await clickPrimary(); break;
      default: throw new Error('unknown kind ' + s.kind);
    }
    out.push(s.id + ' ' + (Date.now() - t0) + 'ms');
    await sleep(350);
  }
  await sleep(500);
  const L = Store.get().lessons[lessonId + ':' + lang];
  return { steps: out.join(', '), done: L.done, doneSteps: L.doneSteps.length, expected: visible.length, cards: Object.keys(Store.get().cards).filter(k => k.indexOf(lang + ':') === 0).length, jsErrors: errors };
};
'e2e loaded';
