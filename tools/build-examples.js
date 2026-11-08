#!/usr/bin/env node
/* Собирает js/examples-data.js из исходников программ по tools/examples-spec.js.
   - код берётся из файлов по номерам строк (дословно, общий левый отступ убирается);
   - expect: если первая строка фрагмента не содержит ожидаемого текста — сборка падает (исходник изменился);
   - demo: пример для «Песочницы» собирается из тех же строк и РЕАЛЬНО запускается (JS — в vm, Python — через python),
     полученный вывод сверяется с ожиданием и сохраняется.
   Запуск: node tools/build-examples.js   (на ПК, где лежат исходники) */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const spec = require('./examples-spec.js');
const cache = {};

function gitShort(dir) {
  if (!dir) return null;
  const d = path.resolve(ROOT, dir);
  try {
    const sha = cp.execFileSync('git', ['-C', d, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    const dirty = cp.execFileSync('git', ['-C', d, 'status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0;
    return { sha, dirty };
  } catch (e) { return null; }
}

function readLines(project, file, zipInner) {
  const key = (project.zip || project.root) + '|' + file + '|' + (zipInner || '');
  if (cache[key]) return cache[key];
  let text;
  if (project.zip && zipInner) {
    text = cp.execFileSync('python', ['-X', 'utf8', '-c', 'import zipfile,sys;sys.stdout.buffer.write(zipfile.ZipFile(sys.argv[1]).read(sys.argv[2]))', project.zip, zipInner]).toString('utf8');
  } else {
    text = fs.readFileSync(path.resolve(ROOT, project.root, file), 'utf8');
  }
  return (cache[key] = text.replace(/\r\n?/g, '\n').split('\n'));
}

function dedent(lines) {
  const ind = lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length);
  const k = ind.length ? Math.min(...ind) : 0;
  return lines.map(l => l.slice(Math.min(k, l.match(/^ */)[0].length)));
}

function take(project, sn, file, from, to, zipInner) {
  const lines = readLines(project, file, zipInner);
  if (from < 1 || to > lines.length || from > to) throw new Error(`${project.id}/${sn.id}: строки ${from}-${to} вне файла ${file} (${lines.length})`);
  return lines.slice(from - 1, to);
}

function snippet(project, sn) {
  const ranges = sn.ranges || [[sn.from, sn.to]];
  let code = [], nums = [];
  ranges.forEach((r, i) => {
    const chunk = dedent(take(project, sn, sn.file, r[0], r[1], sn.zipInner));
    if (i === 0) {
      const first = chunk[0] || '';
      if (sn.expect && first.indexOf(sn.expect) === -1) throw new Error(`${project.id}/${sn.id}: первая строка «${first.trim()}» не содержит «${sn.expect}» — исходник изменился, поправь номера строк`);
    }
    if (i > 0) { code.push('…'); nums.push(0); }
    chunk.forEach((l, j) => { code.push(l); nums.push(r[0] + j); });
  });
  const label = ranges.map(r => r[0] === r[1] ? String(r[0]) : r[0] + '–' + r[1]).join(', ');
  const out = { id: sn.id, title: sn.title, file: sn.file, lines: label, lang: sn.lang, code: code.join('\n'), nums, bridge: sn.bridge, notes: sn.notes };
  if (sn.demo) out.demo = demo(project, sn);
  return out;
}

function runJs(code) {
  const out = [];
  const log = (...a) => out.push(a.map(x => typeof x === 'string' ? x : String(x)).join(' '));
  const ctx = vm.createContext({ console: { log }, TextEncoder, Math, Date, Array, String, Number, crypto: globalThis.crypto, Uint8Array });
  new vm.Script(code, { filename: 'demo.js' }).runInContext(ctx, { timeout: 2000 });
  return out.join('\n') + '\n';
}
function runPy(code) {
  return cp.execFileSync('python', ['-X', 'utf8', '-c', code], { encoding: 'utf8', timeout: 5000, env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }) });
}

function demo(project, sn) {
  const d = sn.demo;
  const code = d.parts.map(p => {
    if (p.text !== undefined) return p.text;
    return dedent(take(project, sn, p.file || sn.file, p.from, p.to, p.file ? undefined : sn.zipInner)).join('\n');
  }).join('\n') + '\n';
  const actual = (d.lang === 'js' ? runJs(code) : runPy(code)).replace(/\r\n?/g, '\n').replace(/[  ]/g, ' ');
  (d.expect || []).forEach(e => { if (actual.indexOf(e) === -1) throw new Error(`${project.id}/${sn.id}: в выводе демо нет «${e}»:\n${actual}`); });
  (d.expectRegex || []).forEach(r => { actual.trim().split('\n').forEach(l => { if (!new RegExp(r).test(l)) throw new Error(`${project.id}/${sn.id}: строка «${l}» не подходит под ${r}`); }); });
  const res = { lang: d.lang, code, out: d.outNote ? null : actual.replace(/\u00a0|\u202f/g, ' ').trimEnd() };
  if (d.outNote) res.outNote = d.outNote;
  if (d.expectRegex) res.expectRegex = d.expectRegex;
  if (d.expect) res.expect = d.expect.map(s => s);
  return res;
}

const projects = spec.map(p => {
  const sn = p.snippets.map(s => snippet(p, s));
  let stat = null;
  if (p.countFiles) {
    const n = p.countFiles.reduce((a, f) => a + readLines(p, f).length - 1, 0);
    stat = n.toLocaleString('ru-RU').replace(/\u00a0|\u202f/g, ' ') + ' строк кода';
  }
  const g = gitShort(p.git);
  return {
    id: p.id, name: p.name, icon: p.icon, tagline: p.tagline, stack: p.stack, stat,
    where: p.zip ? 'исходники в архиве на твоём ПК' : (p.root === '.' ? 'D:\\bastau' : p.root.replace(/\//g, '\\')),
    commit: g ? g.sha + (g.dirty ? ' (+ правки без коммита)' : '') : null,
    tree: p.tree, snippets: sn
  };
});

const header = '/* Сгенерировано tools/build-examples.js из исходников программ — не править руками. */\n';
const body = 'window.EXAMPLES = ' + JSON.stringify({ builtAt: new Date().toISOString().slice(0, 10), projects }, null, 1) + ';\n';
fs.writeFileSync(path.join(ROOT, 'js', 'examples-data.js'), header + body, 'utf8');
const total = projects.reduce((a, p) => a + p.snippets.length, 0);
console.log(`готово: ${projects.length} программ, ${total} фрагментов, демо: ${projects.reduce((a, p) => a + p.snippets.filter(s => s.demo).length, 0)}`);
projects.forEach(p => console.log(`  ${p.id}: ${p.stat || '—'}; ${p.commit || 'без git'}; ${p.snippets.map(s => s.id + '[' + s.lines + ']').join(' ')}`));
