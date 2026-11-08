// Помощники для сквозной проверки в браузере (вставляются через fetch + eval из javascript_tool).
window.__t = (function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const primary = () => $('.p-actions .btn.primary');
  const step = () => $('.p-text') && $('.p-text').textContent;
  async function waitFor(fn, t = 20000, label = '') {
    const s = Date.now();
    while (Date.now() - s < t) { let v; try { v = fn(); } catch (e) { /* ждём */ } if (v) return v; await sleep(80); }
    throw new Error('timeout ' + label + ' @' + step());
  }
  async function clickPrimary() { await waitFor(() => primary() && !primary().disabled, 20000, 'primary'); primary().click(); await sleep(250); }
  const banner = () => { const b = $('.banner'); return b ? b.className.replace('banner ', '') + ': ' + $('.banner-t').textContent + ' | ' + (($('.banner-x') || {}).textContent || '') : null; };
  function setCode(v) { const ta = $('.ed-ta'); ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); }
  async function run() { await waitFor(() => primary() && !primary().disabled, 20000, 'runbtn'); primary().click(); await sleep(150); await waitFor(() => !primary().disabled, 30000, 'run-done'); await sleep(250); }
  const log = []; const L = (...a) => log.push(a.join(' '));
  return { sleep, $, $$, primary, waitFor, clickPrimary, step, banner, setCode, run, log, L };
})();
'helpers ok';
