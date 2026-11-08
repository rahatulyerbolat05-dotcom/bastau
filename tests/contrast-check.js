// Проверка контраста токенов WCAG AA (вставляется в страницу тегом <script>, вызывается window.__contrast()).
window.__contrast = function () {
  function parse(c) {
    c = c.trim(); var m;
    if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
    if ((m = /^rgba?\(([^)]+)\)$/.exec(c))) { var p = m[1].split(',').map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    throw new Error('bad color ' + c);
  }
  function over(f, b) { var a = f[3]; return [0, 1, 2].map(function (i) { return f[i] * a + b[i] * (1 - a); }).concat(1); }
  function lum(c) { var l = c.slice(0, 3).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; }
  function cr(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var cs = getComputedStyle(document.documentElement);
  function v(n) { return parse(cs.getPropertyValue(n)); }
  var bgG = v('--bg-grouped'), surf = v('--surface'), codeBg = v('--code-bg'), fillOnSurf = over(v('--fill'), surf);
  var pairs = [
    ['label / bg', v('--label'), bgG, 4.5],
    ['label2 / surface', over(v('--label-2'), surf), surf, 4.5],
    ['label2 / bg-grouped', over(v('--label-2'), bgG), bgG, 4.5],
    ['label2 / fill', over(v('--label-2'), fillOnSurf), fillOnSurf, 4.5],
    ['tint / surface', v('--tint'), surf, 4.5],
    ['tint / tint-bg', v('--tint'), over(v('--tint-bg'), surf), 4.5],
    ['on-tint / tint (кнопка)', v('--on-tint'), v('--tint'), 4.5],
    ['danger / danger-bg', v('--danger'), over(v('--danger-bg'), surf), 4.5],
    ['info / info-bg', v('--info'), over(v('--info-bg'), surf), 4.5],
    ['danger / surface', v('--danger'), surf, 4.5],
    ['строки / код', v('--c-str'), codeBg, 4.5],
    ['ключевые слова / код', v('--c-kw'), codeBg, 4.5],
    ['функции / код', v('--c-fn'), codeBg, 4.5],
    ['числа / код', v('--c-num'), codeBg, 4.5],
    ['комментарии / код', v('--c-com'), codeBg, 4.5],
    ['номера строк / код', over(v('--c-gutter'), codeBg), codeBg, 3],
    ['код / код-фон', v('--code-fg'), codeBg, 4.5]
  ];
  var bad = [];
  var rows = pairs.map(function (p) { var r = cr(p[1], p[2]); if (r < p[3]) bad.push(p[0] + ' ' + r.toFixed(2) + ' < ' + p[3]); return p[0] + ': ' + r.toFixed(2); });
  return { fails: bad, all: rows };
};
