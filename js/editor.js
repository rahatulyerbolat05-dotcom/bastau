/* Редактор кода: textarea поверх подсветки, номера строк, панель символов для телефона. */
(function () {
  'use strict';
  var h = window.UI.h;

  var SYMBOLS = {
    py: ['"', "'", '(', ')', ':', '=', '<', '>', '+', '-', ',', '[', ']', '#', '.'],
    js: ['"', "'", '(', ')', '{', '}', ';', '=', '<', '>', '+', '-', ',', '[', ']', '.']
  };

  function createEditor(opts) {
    var lang = opts.lang || 'py';
    var minLines = opts.minLines || 3;
    var ro = !!opts.readOnly;

    var gutter = h('div', { class: 'ed-gutter', 'aria-hidden': 'true' });
    var pre = h('pre', { class: 'ed-hl', 'aria-hidden': 'true' });
    var ta = h('textarea', {
      class: 'ed-ta', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', wrap: 'off',
      'aria-label': opts.label || 'Редактор кода', rows: String(minLines), inputmode: 'text', readOnly: ro
    });
    if (opts.placeholder) ta.setAttribute('placeholder', opts.placeholder);
    var codeBox = h('div', { class: 'ed-code' }, pre, ta);
    var scroll = h('div', { class: 'ed-scroll' }, gutter, codeBox);
    var keys = null;
    var root = h('div', { class: 'editor' + (ro ? ' ro' : '') }, scroll);
    root.style.setProperty('--minlines', String(minLines));

    var errLine = 0;

    function render() {
      var v = ta.value;
      pre.innerHTML = window.Core.highlight(v, lang) + '\n';
      var n = Math.max(minLines, v.split('\n').length);
      var out = '';
      for (var i = 1; i <= n; i++) out += '<span' + (i === errLine ? ' class="err"' : '') + '>' + i + '</span>';
      gutter.innerHTML = out;
    }
    var INDENT = lang === 'py' ? '    ' : '  ';
    // отступ для новой строки: как у текущей, плюс один уровень после «:» (Python) или «{» (JavaScript)
    function nextIndent(before) {
      var line = before.slice(before.lastIndexOf('\n') + 1);
      var ind = (/^[ \t]*/.exec(line) || [''])[0];
      var opens = lang === 'py' ? /:\s*(#.*)?$/.test(line) : /[{(\[]\s*$/.test(line);
      return ind + (opens ? INDENT : '');
    }
    ta.addEventListener('input', function (e) {
      // телефонные клавиатуры не всегда шлют keydown для Enter — добавляем отступ после вставки переноса
      if (e && e.inputType === 'insertLineBreak' && ta.selectionStart === ta.selectionEnd) {
        var pos = ta.selectionStart, ind = nextIndent(ta.value.slice(0, pos - 1));
        if (ind && ta.value[pos - 1] === '\n') ta.setRangeText(ind, pos, pos, 'end');
      }
      errLine = 0; render(); if (opts.onChange) opts.onChange(ta.value);
    });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (opts.onRun) opts.onRun(); return; }
      if (ta.readOnly || e.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        insert('\n' + nextIndent(ta.value.slice(0, ta.selectionStart)));
        return;
      }
      // Backspace в отступе убирает целый уровень
      if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
        var s0 = ta.selectionStart, line = ta.value.slice(ta.value.lastIndexOf('\n', s0 - 1) + 1, s0);
        if (line.length >= INDENT.length && /^ +$/.test(line) && line.length % INDENT.length === 0) {
          e.preventDefault();
          ta.setRangeText('', s0 - INDENT.length, s0, 'end');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    function insert(ch) {
      ta.focus();
      var s = ta.selectionStart, e = ta.selectionEnd;
      ta.setRangeText(ch, s, e, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (!ro && opts.symbols !== false) {
      var indentKey = h('button', {
        type: 'button', class: 'key key-wide', 'aria-label': 'Вставить отступ', text: '⇥ отступ',
        onpointerdown: function (e) { e.preventDefault(); insert(INDENT); },
        onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insert(INDENT); } }
      });
      keys = h('div', { class: 'ed-keys', role: 'toolbar', 'aria-label': 'Быстрые символы' }, indentKey, SYMBOLS[lang].map(function (ch) {
        return h('button', {
          type: 'button', class: 'key', 'aria-label': 'Вставить ' + ch, text: ch,
          // pointerdown + preventDefault: клавиатура и фокус остаются на месте
          onpointerdown: function (e) { e.preventDefault(); insert(ch); },
          onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insert(ch); } }
        });
      }));
      root.appendChild(keys);
    }

    ta.value = opts.value || '';
    render();

    return {
      el: root, ta: ta,
      getValue: function () { return ta.value; },
      setValue: function (v) { ta.value = v; errLine = 0; render(); if (opts.onChange) opts.onChange(v); },
      focus: function () { ta.focus(); },
      markError: function (n) { errLine = n || 0; render(); },
      setReadOnly: function (v) { ta.readOnly = !!v; root.classList.toggle('ro', !!v); if (keys) keys.hidden = !!v; }
    };
  }

  window.Editor = { create: createEditor };
})();
