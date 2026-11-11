/* Содержание: уроки дней 1–4 (Hello, World!; переменные и типы; условия; цикл while) для Python и JavaScript, карточки повторения, пояснения «почему так». */
(function () {
  'use strict';

  var LINKS = {
    dunlosky: { t: 'Dunlosky и др. 2013 (обзор APS)', u: 'https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html' },
    roediger: { t: 'Roediger & Karpicke 2006', u: 'https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf' },
    cepeda: { t: 'Cepeda и др. 2006', u: 'https://pubmed.ncbi.nlm.nih.gov/16719566/' },
    primm: { t: 'PRIMM (Sentance, Waite)', u: 'https://qmro.qmul.ac.uk/xmlui/handle/123456789/57800' },
    pretest: { t: 'Эффект pretesting (Kornell, Hays, Bjork 2009)', u: 'https://pubmed.ncbi.nlm.nih.gov/19751074/' },
    worked: { t: 'Эффект разобранных примеров (обзор)', u: 'https://en.wikipedia.org/wiki/Worked-example_effect' },
    subgoal: { t: 'Margulieux, Guzdial, Catrambone 2012', u: 'https://appinventor.mit.edu/explore/resources/subgoal-labeled-instructional-material.html' },
    guidance: { t: 'Kirschner, Sweller, Clark 2006', u: 'https://www.aft.org/sites/default/files/GuidedInstruction.pdf' },
    parsons: { t: 'Parsons-задачи (мульти-институциональное исследование)', u: 'https://repository.falmouth.ac.uk/5216/' },
    selfexp: { t: 'Bisra и др. 2018 (метаанализ)', u: 'https://doi.org/10.1007/s10648-018-9434-x' },
    gollwitzer: { t: 'Gollwitzer & Sheeran 2006', u: 'https://doi.org/10.1016/S0065-2601(06)38002-1' },
    lally: { t: 'Lally и др. 2010', u: 'https://doi.org/10.1002/ejsp.674' },
    interleave: { t: 'Brunmair & Richter 2019', u: 'https://pubmed.ncbi.nlm.nih.gov/31556629/' }
  };

  var WHY = {
    predict: { title: 'Сначала предсказание', text: 'Пока ты не видел ответа, мозг строит гипотезу. Даже неверная, она делает правильный ответ запоминаемым — при условии, что обратная связь приходит сразу. «Не знаю» — нормальный ответ, без штрафа.', src: ['primm', 'pretest'], note: 'Для PRIMM — одно исследование с контрольной группой на школьниках; pretesting подтверждён лучше.' },
    worked: { title: 'Разбор по частям', text: 'Новичку легче сначала изучить готовый пример, чем решать с нуля. Каждая часть подписана по роли («команда», «что показать», «текст») — такие подписи помогают видеть структуру.', src: ['worked', 'subgoal', 'guidance'], note: 'Основные данные — из математики и физики; для программирования выборки небольшие.' },
    parsons: { title: 'Собери из блоков', text: 'Задача на сборку из готовых блоков снижает нагрузку: не нужно одновременно помнить синтаксис и придумывать порядок. Лишний блок («Print») проверяет, что ты различаешь регистр.', src: ['parsons'], note: 'Результаты в основном от одной исследовательской группы; обучающий эффект не хуже, чем при написании с нуля, но быстрее.' },
    completion: { title: 'Заполни пропуски', text: 'Промежуточная ступень между «посмотрел» и «написал сам»: поддержка постепенно уменьшается.', src: ['worked', 'guidance'], note: 'Критика: у опытных новичков такая поддержка лишняя — поэтому «опытным» этот шаг пропускается.' },
    modify: { title: 'Измени чужой код', text: 'Менять работающую программу безопаснее, чем писать с нуля: у тебя уже есть рабочая основа, и ты видишь, что делает каждая часть.', src: ['primm'], note: 'Шаги Modify и Make из PRIMM.' },
    debug: { title: 'Ошибки — это подсказки', text: 'Ошибки случаются у всех, поэтому читать их — отдельный навык. Здесь ты чинишь сломанные программы до того, как собственные ошибки напугают.', src: ['primm'], note: 'Это педагогическое решение (Investigate в PRIMM), а не отдельный эффект с измеренным размером.' },
    make: { title: 'Напиши сам', text: 'Вспоминать и воспроизводить сложнее, чем узнавать, и именно это закрепляет знания. Подсказки открываются после попытки: помощь «заранее» отнимает пользу у усилия.', src: ['roediger', 'dunlosky'], note: 'Практика с проверкой памяти — один из двух приёмов с «высокой полезностью» в обзоре Dunlosky.' },
    retrieval: { title: 'Вспомни без подсказок', text: 'Проверка памяти запоминает лучше, чем перечитывание — хотя перечитывать кажется надёжнее. Поэтому уверенность до ответа важна: ошибка при высокой уверенности исправляется лучше всего.', src: ['roediger', 'dunlosky'], note: 'Гиперкоррекция (Butterfield & Metcalfe 2001) хорошо воспроизводится, но зависит от типа вопросов.' },
    selfexp: { title: 'Объясни своими словами', text: 'Попытка объяснить вскрывает пробелы, которых не видно, пока просто читаешь. Сравнение с эталоном — обратная связь.', src: ['selfexp'], note: 'Метаанализ из 64 исследований; размер эффекта в разных областях сильно различается.' },
    plan: { title: 'Когда и где', text: 'Конкретный план «когда я это сделаю» заметно повышает шанс, что человек действительно начнёт. Одного намерения мало.', src: ['gollwitzer', 'lally'], note: 'Средний эффект усреднён по очень разным областям. На формирование привычки уходит в среднем ~66 дней, один пропуск её не ломает — поэтому серия «мягкая».' },
    spacing: { title: 'Повторения с растущими интервалами', text: 'Повторять лучше с паузами, и чем дольше надо помнить, тем длиннее пауза. Здесь: через 1, 3, 7, 16, 35 и 90 дней. Если не вспомнил — вернёмся быстрее.', src: ['cepeda', 'dunlosky'], note: 'Принцип надёжен; конкретные числа дней — моя эвристика, не результат конкретного исследования.' },
    interleave: { title: 'Вперемешку', text: 'Карточки разных тем перемешаны, чтобы ты учился выбирать подход, а не повторять один и тот же.', src: ['interleave'], note: 'Эффект неоднородный: для словесного материала бывает отрицательным.' }
  };

  var ROSETTA = [
    { name: 'Python', code: 'print("Hello, World!")' },
    { name: 'JavaScript', code: 'console.log("Hello, World!");' },
    { name: 'C#', code: 'Console.WriteLine("Hello, World!");', note: 'Современный C# (9+) позволяет писать без обёртки.' },
    { name: 'Java', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { name: 'C++', code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
    { name: 'Kotlin', code: 'fun main() {\n    println("Hello, World!")\n}' },
    { name: 'Go', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
    { name: 'Rust', code: 'fn main() {\n    println!("Hello, World!");\n}' },
    { name: 'PHP', code: '<?php\necho "Hello, World!";' }
  ];

  // Готовые уроки. Остальные дни помечены «скоро» (ROADMAP) и не имитируют готовность.
  var LESSONS = [
    { id: 'hello', day: 1, title: 'Hello, World!', minutes: 20 },
    { id: 'vars', day: 2, title: 'Переменные и типы данных', minutes: 20 },
    { id: 'cond', day: 3, title: 'Условия: если… иначе', minutes: 20 },
    { id: 'loops', day: 4, title: 'Циклы: повторяй, пока…', minutes: 20 }
  ];
  var ROADMAP = ['Цикл for: повтори N раз', 'Списки', 'Функции'];

  function buildHello(lang) {
    var py = lang !== 'js';
    var NAME = py ? 'Python' : 'JavaScript';
    var CODE = py ? 'print("Hello, World!")' : 'console.log("Hello, World!");';
    var CMD = py ? 'print' : 'console.log';
    var BAD_CASE = py ? 'Print' : 'Console.log';
    var END = py ? '' : ';';

    /* ---------- общие определения (используются и в уроке, и в карточках) ---------- */
    var defs = {};

    defs['write-hello'] = {
      kind: 'code', mode: 'write', card: 'write-hello', tag: 'Напиши сам', why: 'make',
      title: 'Напиши сам', prompt: 'Напиши программу, которая выводит на экран: Hello, World!',
      starter: '', expect: 'Hello, World!',
      hints: [
        'Какая команда показывает текст на экране? Вспомни разбор строки.',
        'Порядок такой: команда, открывающая скобка, текст в кавычках, закрывающая скобка.',
        'Вот каркас: ' + CMD + '( ... )' + END + ' — внутри скобок нужен текст в кавычках.'
      ],
      solution: CODE
    };

    defs['write-two'] = {
      kind: 'code', mode: 'write', card: 'write-two', tag: 'Напиши сам', why: 'make',
      title: 'Две строки', prompt: 'Выведи две строки:\nПривет!\nЯ учусь программировать',
      starter: '', expect: 'Привет!\nЯ учусь программировать',
      hints: [
        'Одна команда вывода печатает одну строку. Сколько команд нужно?',
        'Напиши две команды, одну под другой.',
        CMD + '("Привет!")' + END + '\n' + CMD + '("...")' + END
      ],
      solution: CMD + '("Привет!")' + END + '\n' + CMD + '("Я учусь программировать")' + END
    };

    defs['debug-quote'] = {
      kind: 'code', mode: 'debug', card: 'debug-quote', tag: 'Найди ошибку', why: 'debug',
      title: 'Чиним программу', prompt: 'Программа должна вывести Hello, World!, но ломается. Запусти её, прочитай ошибку и исправь.',
      starter: py ? 'print("Hello, World!)' : 'console.log("Hello, World!);', expect: 'Hello, World!',
      preface: 'Ошибка — не провал, а подсказка. Компьютер сообщает, где именно он перестал понимать, и почему. Читай сообщение снизу вверх: последняя строка — суть, выше — место.',
      hints: [
        'Посмотри, как подсветился текст в кавычках: где он заканчивается?',
        'У текста есть открывающая кавычка, а закрывающей нет.',
        'Добавь закрывающую кавычку перед закрывающей скобкой.'
      ],
      solution: CODE
    };

    defs['debug-case'] = {
      kind: 'code', mode: 'debug', card: 'debug-case', tag: 'Найди ошибку', why: 'debug',
      title: 'Ещё одна поломка', prompt: 'Опять не работает. Запусти, прочитай ошибку и исправь.',
      starter: py ? 'Print("Hello, World!")' : 'Console.log("Hello, World!");', expect: 'Hello, World!',
      hints: [
        'Прочитай, какое слово компьютер «не знает».',
        'Команды чувствительны к регистру: заглавная и строчная буквы — разные символы.',
        'Напиши ' + CMD + ' только строчными буквами.'
      ],
      solution: CODE
    };

    defs['fill-hello'] = {
      kind: 'fill', card: 'fill-hello', tag: 'Заполни пропуски', why: 'completion',
      title: 'Заполни пропуски', prompt: 'Впиши недостающее, чтобы программа вывела Hello, World!',
      tpl: [{ b: 0 }, '(', { b: 1 }, 'Hello, World!', { b: 2 }, ')' + END],
      blanks: [
        { accept: [CMD], label: 'команда' },
        { accept: ['"', "'"], label: 'кавычка' },
        { accept: ['"', "'"], label: 'кавычка' }
      ]
    };

    var qs = {};
    qs['q-print'] = {
      kind: 'mcq', card: 'q-print', tag: 'Вспомни', why: 'retrieval',
      q: 'Что делает ' + (py ? 'команда print' : 'команда console.log') + '?',
      options: [
        { text: py ? 'Показывает значение на экране' : 'Показывает значение в консоли', correct: true },
        { text: 'Стирает всё с экрана' },
        { text: 'Сохраняет программу в файл' },
        { text: 'Запускает программу заново' }
      ],
      explain: CMD + ' — команда вывода: берёт то, что в скобках, и показывает на экране.'
    };
    qs['q-quotes'] = {
      kind: 'mcq', card: 'q-quotes', tag: 'Вспомни', why: 'retrieval',
      q: 'Зачем нужны кавычки вокруг Hello, World!?',
      options: [
        { text: 'Они показывают, что это текст, а не команда', correct: true },
        { text: 'Чтобы текст стал жирным' },
        { text: 'Чтобы компьютер пропустил эту строку' },
        { text: 'Они нужны только для красоты' }
      ],
      explain: 'Без кавычек компьютер попытается понять слова как команды или имена — и выдаст ошибку.'
    };
    qs['q-case'] = {
      kind: 'mcq', card: 'q-case', tag: 'Вспомни', why: 'retrieval',
      q: 'Что произойдёт при запуске этого кода?', code: BAD_CASE + '("Hello")' + END,
      options: [
        { text: py ? 'Ошибка: Python не знает слова Print' : 'Ошибка: JavaScript не знает слова Console', correct: true },
        { text: 'Выведется Hello' },
        { text: 'Выведется ' + BAD_CASE + '("Hello")' },
        { text: 'Ничего: программа молча завершится' }
      ],
      explain: 'Регистр важен: ' + CMD + ' и ' + BAD_CASE + ' — разные слова. Компьютер знает только первое.'
    };
    qs['q-two'] = {
      kind: 'mcq', card: 'q-two', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: CMD + '("A")' + END + '\n' + CMD + '("B")' + END,
      options: [
        { text: 'A и B на двух отдельных строках', correct: true },
        { text: 'AB в одной строке' },
        { text: 'Только B' },
        { text: 'Ошибка' }
      ],
      explain: 'Каждая команда вывода печатает свою строку. Строки выполняются сверху вниз.'
    };
    qs['q-text'] = {
      kind: 'mcq', card: 'q-text', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет этот код?', code: CMD + '("2 + 2")' + END,
      options: [
        { text: '2 + 2', correct: true },
        { text: '4' },
        { text: 'Ошибка' },
        { text: '2+2=4' }
      ],
      explain: 'Всё в кавычках — просто текст. Компьютер не вычисляет его, а выводит как есть. (Попробуй в Песочнице ' + CMD + '(2 + 2) без кавычек.)'
    };

    /* ---------- шаги урока ---------- */
    var steps = [];

    steps.push({
      id: 'goal', kind: 'intro', tag: 'Цель',
      title: 'Сегодня ты напишешь свою первую программу',
      lead: 'Программа — это список точных инструкций. Компьютер читает их сверху вниз и выполняет по одной. Он не догадывается, что ты имел в виду, поэтому важна каждая буква.',
      flow: { code: CODE, out: 'Hello, World!' },
      points: ['Угадаешь, что сделает готовый код', 'Разберёшь его по частям', 'Соберёшь, изменишь и починишь', 'Напишешь сам — а завтра повторишь'],
      foot: '≈ 20 минут. Можно остановиться в любой момент — приложение запомнит, где ты был.',
      simple: 'Программа — как рецепт: «возьми, налей, перемешай». Компьютер выполняет шаги по порядку и ничего не додумывает сам. Сегодняшний рецепт из одного шага: «покажи на экране текст».'
    });

    steps.push({
      id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Сначала угадай',
      question: 'Вот готовая программа на ' + NAME + '. Как думаешь, что появится на экране, когда её запустят?',
      code: CODE, expected: 'Hello, World!',
      options: [
        { id: 'a', text: 'Hello, World!', correct: true },
        { id: 'b', text: CODE },
        { id: 'c', text: 'Ошибка' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Кавычки не выводятся — они лишь показывают, где начинается и кончается текст.',
        bad: 'Ничего страшного: ошибка в предсказании запоминается лучше, чем лёгкое угадывание. На экране оказался только текст из кавычек — без кавычек и без команды.',
        dk: 'Хорошо, что не стал гадать. Теперь ты знаешь: на экран попадает только текст из кавычек.'
      }
    });

    var parts = py ? [
      { key: 'cmd', text: 'print' },
      { key: 'paren', text: '(' }, { key: 'quote', text: '"' }, { key: 'text', text: 'Hello, World!' }, { key: 'quote', text: '"' }, { key: 'paren', text: ')' }
    ] : [
      { key: 'cmd', text: 'console.log' },
      { key: 'paren', text: '(' }, { key: 'quote', text: '"' }, { key: 'text', text: 'Hello, World!' }, { key: 'quote', text: '"' }, { key: 'paren', text: ')' }, { key: 'semi', text: ';' }
    ];
    var roles = {
      cmd: { role: '1 · Команда', desc: py ? 'Слово print значит «показать». Это встроенная команда: компьютер знает её заранее. Писать нужно ровно так — строчными буквами.' : 'console — «консоль», экран разработчика; log — «записать». Вместе: показать в консоли. Пишется строчными буквами, через точку.' },
      paren: { role: '2 · Скобки', desc: 'Скобки передают команде то, с чем работать: внутри — что нужно показать. Открыл скобку — обязательно закрой.' },
      quote: { role: '3 · Кавычки', desc: 'Кавычки говорят: «это текст, а не команда». Нужны две — открывающая и закрывающая. Без них компьютер попробует понять слова как команды.' },
      text: { role: '3 · Текст', desc: 'Именно эти символы появятся на экране — с запятой, пробелом и заглавными буквами. Менять можно что угодно.' },
      semi: { role: '4 · Конец инструкции', desc: 'Точка с запятой завершает инструкцию, как точка — предложение. В JavaScript её часто можно опустить, но лучше ставить.' }
    };
    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери строку по частям',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: parts, roles: roles,
      summary: py ? 'Итого: команда + скобки + текст в кавычках. Три роли — вся программа.' : 'Итого: команда + скобки + текст в кавычках + конец инструкции.',
      simple: 'Представь, что просишь помощника: «Скажи: Привет». «Скажи» — это команда ' + CMD + '. В скобках — что именно сказать. Кавычки показывают, где фраза начинается и где кончается.'
    });

    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null,
      title: 'Собери программу',
      lead: 'Нажимай на блоки, чтобы выстроить программу, которая выводит Hello, World!. Один блок лишний.',
      tokens: py ? ['(', '"Hello, World!"', 'print', ')', 'Print'] : ['(', '"Hello, World!"', 'console.log', ')', ';', 'Console.log'],
      solutions: py ? [['print', '(', '"Hello, World!"', ')']] : [['console.log', '(', '"Hello, World!"', ')', ';'], ['console.log', '(', '"Hello, World!"', ')']],
      tipIf: py ? { Print: 'Блок Print с заглавной — другое слово, Python его не знает.' } : { 'Console.log': 'Console с заглавной — другое слово, JavaScript его не знает.' },
      hint: 'Начни с команды, потом скобка, текст и закрывающая скобка.'
    });

    var f = defs['fill-hello'];
    steps.push(Object.assign({ id: 'fill', novice: true }, f));

    steps.push({
      id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify',
      title: 'Измени текст',
      prompt: 'Это рабочая программа. Измени её так, чтобы она вывела: Привет, мир!',
      starter: CODE, expect: 'Привет, мир!',
      hints: ['Меняй только то, что внутри кавычек.', 'Команду, скобки и сами кавычки не трогай.', CMD + '("Привет, мир!")' + END],
      solution: CMD + '("Привет, мир!")' + END
    });

    steps.push(Object.assign({ id: 'debug1' }, defs['debug-quote']));
    steps.push(Object.assign({ id: 'debug2' }, defs['debug-case']));
    steps.push(Object.assign({ id: 'make1' }, defs['write-hello'], {
      prompt: 'Теперь сам. Редактор пуст. Напиши программу, которая выводит на экран: Hello, World!'
    }));

    steps.push({
      id: 'make2', kind: 'code', mode: 'write', tag: 'Напиши сам', why: 'make', card: 'write-two',
      title: 'Две строки про тебя',
      prompt: 'Выведи две строки:\n1) Привет!\n2) Меня зовут … (подставь своё имя)',
      starter: '', expect: null,
      validate: function (out) {
        var lines = out.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').map(function (l) { return l.replace(/\s+$/, ''); });
        if (lines.length !== 2) return { ok: false, msg: 'Нужно ровно две строки, а выведено: ' + (out.trim() ? lines.length : 0) + '. Одна команда вывода — одна строка.' };
        if (lines[0] !== 'Привет!') return { ok: false, msg: 'Первая строка должна быть ровно: Привет!' };
        if (lines[1].indexOf('Меня зовут ') !== 0 || lines[1].length <= 11) return { ok: false, msg: 'Вторая строка должна начинаться с «Меня зовут », а дальше — твоё имя.' };
        return { ok: true };
      },
      hints: ['Одна команда вывода печатает одну строку. Сколько команд нужно?', 'Напиши две команды, одну под другой.', CMD + '("Привет!")' + END + '\n' + CMD + '("Меня зовут Имя")' + END],
      solution: CMD + '("Привет!")' + END + '\n' + CMD + '("Меня зовут Имя")' + END,
      after: 'Попробуй потом в Песочнице: ' + CMD + '(2 + 2) — без кавычек. Что выведется?'
    });

    steps.push({
      id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval',
      title: 'Проверка без подсказок',
      lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['q-print'], qs['q-quotes'], qs['q-case'], qs['q-two'], qs['q-text']]
    });

    steps.push({
      id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp',
      title: 'Объясни своими словами',
      prompt: 'Как будто объясняешь другу, который никогда не программировал: что делает эта строка и зачем каждая её часть?',
      code: CODE, min: 30,
      model: py
        ? 'Слово print — команда «показать на экране». В скобках то, что нужно показать. Кавычки говорят, что Hello, World! — это текст, а не команда. Поэтому на экране появится ровно этот текст, без кавычек.'
        : 'console.log — команда «показать в консоли». В скобках то, что нужно показать. Кавычки говорят, что Hello, World! — это текст, а не команда. Точка с запятой завершает инструкцию. На экране появится ровно этот текст, без кавычек.'
    });

    steps.push({
      id: 'plan', kind: 'plan', tag: 'План', why: 'plan',
      title: 'Когда ты вернёшься?',
      lead: 'Завтра нужно всего 5 минут: вспомнить сегодняшнее. Выбери время — так шанс реально прийти заметно выше.'
    });

    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Первая программа написана' });

    var cards = Object.assign({}, defs, qs);
    return { id: 'hello', title: 'Hello, World!', day: 1, minutes: 20, steps: steps, cards: cards, lang: lang };
  }

  /* ======================= День 2: переменные и типы данных ======================= */
  function buildVars(lang) {
    var py = lang !== 'js';
    var NAME = py ? 'Python' : 'JavaScript';
    var OUT = py ? 'print' : 'console.log';
    var END = py ? '' : ';';
    function asg(n, v) { return (py ? '' : 'let ') + n + ' = ' + v + END; }
    function show(args) { return OUT + '(' + args + ')' + END; }
    function prog() { return Array.prototype.slice.call(arguments).join('\n'); }
    // есть ли в коде «имя = значение» (значение — регулярка), и выводится ли выражение
    function assigns(code, n, v) { return new RegExp('(?:^|;)[ \\t]*(?:(?:let|const|var)\\s+)?' + n + '[ \\t]*=[ \\t]*' + v + '(?![\\w.])', 'm').test(code); }
    function prints(code, expr) { return new RegExp((py ? 'print' : 'console\\.log') + '\\s*\\(\\s*' + expr + '\\s*\\)').test(code); }
    function outOk(out, expected) { return window.Core.checkOutput(out, expected); }

    var defs = {};

    defs['v-fill'] = {
      kind: 'fill', card: 'v-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Создай переменную', prompt: 'Создай переменную city со значением «Астана». Это текст, поэтому нужны кавычки. Впиши недостающее.',
      tpl: py ? [{ b: 0 }, ' = ', { b: 1 }] : ['let ', { b: 0 }, ' = ', { b: 1 }, ';'],
      blanks: [
        { accept: ['city'], label: 'имя переменной' },
        { accept: ['"Астана"', "'Астана'"], label: 'значение' }
      ],
      okText: 'Имя слева, значение справа, между ними знак равенства. Теперь city «помнит» Астану.',
      hintText: 'Первый пропуск — имя переменной (city). Второй — значение: текст Астана в кавычках с двух сторон.'
    };

    defs['v-debug-name'] = {
      kind: 'code', mode: 'debug', card: 'v-debug-name', tag: 'Найди ошибку', why: 'debug',
      title: 'Опечатка в имени', prompt: 'Программа должна вывести Астана, но ломается. Запусти, прочитай ошибку и исправь.',
      starter: prog(asg('city', '"Астана"'), show('sity')), expect: 'Астана',
      preface: 'Опечатка в имени переменной — самая частая ошибка новичков. Для компьютера city и sity — два разных слова.',
      hints: [
        'Прочитай ошибку: какое слово компьютер «не знает»?',
        'Сравни это слово с тем, как переменная названа в первой строке.',
        'Исправь опечатку: имя должно быть city.'
      ],
      solution: prog(asg('city', '"Астана"'), show('city'))
    };

    defs['v-debug-quote'] = {
      kind: 'code', mode: 'debug', card: 'v-debug-quote', tag: 'Найди ошибку', why: 'debug',
      title: 'Слово или значение?', prompt: 'Ошибки нет, но выводится не то, что нужно: должно быть Астана. Запусти, посмотри на вывод и исправь.',
      starter: prog(asg('city', '"Астана"'), show('"city"')), expect: 'Астана',
      hints: [
        'Что именно вывелось? Это то, что лежит в переменной?',
        'Кавычки превращают слово в текст. Здесь нужно не слово city, а то, что в нём хранится.',
        'Убери кавычки вокруг city.'
      ],
      solution: prog(asg('city', '"Астана"'), show('city'))
    };

    defs['v-write-age'] = {
      kind: 'code', mode: 'write', card: 'v-write-age', tag: 'Напиши сам', why: 'make',
      title: 'Своя переменная', prompt: 'Создай переменную age со значением 15 и выведи её на экран.',
      starter: '', expect: '15',
      validate: function (out, code) {
        var r = outOk(out, '15'); if (!r.ok) return r;
        if (!assigns(code, 'age', '15')) return { ok: false, msg: 'Выведено верно, но переменной age нет. Создай её: ' + asg('age', '15') };
        if (!prints(code, 'age')) return { ok: false, msg: 'Выводи не число напрямую, а переменную: ' + show('age') };
        return { ok: true };
      },
      hints: [
        'Сначала создай переменную: имя, знак равенства, значение.',
        'Потом выведи её командой вывода — без кавычек вокруг имени.',
        'Вот каркас: ' + asg('age', '15') + '\n' + show('...')
      ],
      solution: prog(asg('age', '15'), show('age'))
    };

    defs['v-write-score'] = {
      kind: 'code', mode: 'write', card: 'v-write-score', tag: 'Напиши сам', why: 'make',
      title: 'Счёт игры', prompt: 'Создай переменную score со значением 10. Прибавь к ней 5 (результат запиши обратно в score) и выведи score.',
      starter: '', expect: '15',
      validate: function (out, code) {
        var r = outOk(out, '15'); if (!r.ok) return r;
        if (!assigns(code, 'score', '10')) return { ok: false, msg: 'Начни с переменной: ' + asg('score', '10') };
        if (!/score[ \t]*=[ \t]*score[ \t]*\+[ \t]*5|score[ \t]*\+=[ \t]*5/.test(code)) return { ok: false, msg: 'Прибавь 5 к самой переменной и запиши обратно: score = score + 5' };
        if (!prints(code, 'score')) return { ok: false, msg: 'Выведи переменную: ' + show('score') };
        return { ok: true };
      },
      hints: [
        'Справа от знака равенства стоит старое значение, слева — куда записать новое.',
        'Запись score = score + 5 значит: взять score, прибавить 5, положить обратно в score.',
        'Три строки: создать score, увеличить, вывести.'
      ],
      solution: prog(asg('score', '10'), 'score = score + 5' + END, show('score'))
    };

    var qs = {};
    qs['v-q-value'] = {
      kind: 'mcq', card: 'v-q-value', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('a', '7'), show('a')), out: '7',
      options: [{ text: '7', correct: true }, { text: 'a' }, { text: '"a"' }, { text: 'Ошибка' }],
      explain: 'Имя без кавычек — это переменная: компьютер подставляет то, что в ней лежит. В a лежит 7.'
    };
    qs['v-q-quotes'] = {
      kind: 'mcq', card: 'v-q-quotes', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('city', '"Астана"'), show('"city"')), out: 'city',
      options: [{ text: 'city', correct: true }, { text: 'Астана' }, { text: '"city"' }, { text: 'Ошибка' }],
      explain: 'Кавычки делают city просто текстом, и компьютер не заглядывает в переменную. Чтобы вывести Астана, кавычки не нужны.'
    };
    qs['v-q-types'] = {
      kind: 'mcq', card: 'v-q-types', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: show('"5" + "5"'), out: '55',
      options: [{ text: '55', correct: true }, { text: '10' }, { text: 'Ошибка' }, { text: '5 5' }],
      explain: 'В кавычках 5 — текст. Два текста склеиваются: «5» и «5» дают «55». Без кавычек 5 + 5 дало бы 10.'
    };
    qs['v-q-update'] = {
      kind: 'mcq', card: 'v-q-update', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('x', '5'), 'x = x + 1' + END, show('x')), out: '6',
      options: [{ text: '6', correct: true }, { text: '5' }, { text: '51' }, { text: 'Ошибка' }],
      explain: 'Сначала компьютер считает правую часть: 5 + 1 = 6. Потом кладёт результат обратно в x. Значение переменной можно менять.'
    };
    qs['v-q-case'] = {
      kind: 'mcq', card: 'v-q-case', tag: 'Вспомни', why: 'retrieval',
      q: 'Что произойдёт при запуске этого кода?', code: prog(asg('name', '"Аян"'), show('Name')),
      options: [
        { text: py ? 'Ошибка: Python не знает слово Name' : 'Ошибка: JavaScript не знает слово Name', correct: true },
        { text: 'Выведется Аян' },
        { text: 'Выведется Name' },
        { text: 'Ничего: программа молча завершится' }
      ],
      explain: 'Регистр важен и в именах: name и Name — две разные переменные. Вторую компьютер не создавал.'
    };

    var steps = [];

    steps.push({
      id: 'goal', kind: 'intro', tag: 'Цель',
      title: 'Сегодня программа научится помнить',
      lead: 'Переменная — это имя, под которым компьютер хранит значение. Один раз положил — и можешь использовать сколько угодно раз, а при желании заменить.',
      flow: { code: prog(asg('city', '"Астана"'), show('city')), out: 'Астана' },
      points: ['Угадаешь, что выведет программа с переменной', 'Разберёшь запись «имя = значение»', 'Соберёшь, дополнишь, починишь', 'Поймёшь, чем число отличается от текста'],
      foot: '≈ 20 минут. Hello, World! тут не нужен: начинаем сразу с переменных.',
      simple: 'Переменная — как контакт в телефоне. Ты один раз записал номер под именем «Мама» и потом звонишь по имени, не вспоминая цифры. Здесь то же самое: под именем city записан текст Астана.'
    });

    steps.push({
      id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Сначала угадай',
      question: 'Вот программа на ' + NAME + '. Что появится на экране?',
      code: prog(asg('city', '"Астана"'), show('city')), expected: 'Астана',
      options: [
        { id: 'a', text: 'Астана', correct: true },
        { id: 'b', text: 'city' },
        { id: 'c', text: '"Астана"' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно: city без кавычек — это не слово, а имя переменной. Компьютер подставил то, что в ней лежит.',
        bad: 'Ничего страшного. В первой строке в city положили текст Астана. Во второй city стоит без кавычек, и компьютер подставил значение. Сам текст выводится без кавычек.',
        dk: 'Хорошо, что не стал гадать. Запомни: имя без кавычек — это то, что в нём лежит.'
      }
    });

    var asgParts = py ? [
      { key: 'name', text: 'name' }, { key: 'eq', text: ' = ' }, { key: 'value', text: '"Айдос"' }
    ] : [
      { key: 'kw', text: 'let' }, { key: 'name', text: ' name' }, { key: 'eq', text: ' = ' }, { key: 'value', text: '"Айдос"' }, { key: 'semi', text: ';' }
    ];
    var asgRoles = {
      kw: { role: '1 · Слово «создать»', desc: 'let значит «создай переменную». Его пишут один раз — когда имя появляется впервые.' },
      name: { role: (py ? '1' : '2') + ' · Имя', desc: 'Название переменной. Его придумываешь ты. Пиши английскими буквами и без пробелов: city, age, name1.' },
      eq: { role: (py ? '2' : '3') + ' · Знак «запомни»', desc: 'Здесь это не «равно», а «запомни». То, что справа, запоминается под именем слева.' },
      value: { role: (py ? '3' : '4') + ' · Значение', desc: 'То, что нужно запомнить. Текст пишут в кавычках, число — без кавычек.' },
      semi: { role: '5 · Конец инструкции', desc: 'Как и раньше, точка с запятой завершает инструкцию.' }
    };
    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери запись по частям',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: asgParts, roles: asgRoles,
      summary: 'Итого: имя, знак =, значение. Потом имя можно писать везде, где нужно это значение.',
      simple: {
        text: 'Читай запись справа налево: «возьми "Айдос" и запомни под именем name». После этого везде, где написано name, компьютер подставит Айдос.',
        code: prog(asg('name', '"Айдос"'), show('name'))
      }
    });

    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true,
      title: 'Собери программу',
      lead: 'Расставь строки так, чтобы программа вывела: Айдос 15. Одна строка лишняя.',
      tokens: [asg('name', '"Айдос"'), asg('age', '15'), show('name, age'), show('"name", "age"')],
      solutions: [
        [asg('name', '"Айдос"'), asg('age', '15'), show('name, age')],
        [asg('age', '15'), asg('name', '"Айдос"'), show('name, age')]
      ],
      tipIf: (function () { var o = {}; o[show('"name", "age"')] = 'С кавычками выведутся сами слова name и age, а не то, что лежит в переменных.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Сначала переменные нужно создать: вывести можно только то, что уже есть.' : 'Порядок нарушен: сначала создаём переменные, потом выводим.'; },
      okText: 'Сначала создаём, потом используем — именно так компьютер читает программу, сверху вниз.',
      hint: 'Две строки создают переменные (их порядок неважен), последняя выводит обе.'
    });

    steps.push(Object.assign({ id: 'fill', novice: true }, defs['v-fill']));

    steps.push({
      id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Число или текст?',
      question: 'Две похожие строки. Что выведет эта программа?',
      code: prog(show('"5" + "5"'), show('5 + 5')), expected: '55\n10',
      options: [
        { id: 'a', text: '55 и 10', correct: true },
        { id: 'b', text: '10 и 10' },
        { id: 'c', text: '55 и 55' },
        { id: 'd', text: 'Ошибка' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. В кавычках цифры — это текст, а тексты склеиваются. Без кавычек это числа, и они складываются.',
        bad: 'Это одна из самых частых путаниц. "5" в кавычках — текст, и + склеивает тексты: получается 55. А 5 + 5 без кавычек — числа, и они складываются: 10.',
        dk: 'Смотри: "5" + "5" — это склейка двух текстов (55), а 5 + 5 — сложение чисел (10).'
      }
    });

    steps.push({
      id: 'types', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Тип значения',
      lead: 'Каждое значение имеет тип. Нажми на каждое значение — увидишь разницу.',
      parts: [{ key: 'num', text: '15' }, { key: 'str', text: ' "15" ' }, { key: 'str', text: '"Айдос"' }],
      roles: {
        num: { role: 'Число' + (py ? ' (int)' : ' (number)'), desc: 'Без кавычек. С числами можно считать: 15 + 1 = 16, 15 * 2 = 30. Сравнивать тоже можно: больше, меньше.' },
        str: { role: 'Текст' + (py ? ' (str)' : ' (string)'), desc: 'В кавычках. Это просто набор символов, даже если там цифры. "15" — два символа, а не число пятнадцать: "15" + "1" даст "151", а не 16.' }
      },
      summary: 'Итого: кавычки есть — текст, кавычек нет — число. От типа зависит, что делает +.',
      simple: 'Число — это количество, с ним считают. Текст — это надпись, её просто показывают. Номер телефона — пример текста из цифр: складывать номера бессмысленно. Поэтому "5" + "5" — это две надписи рядом: 55.'
    });

    steps.push({
      id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify',
      title: 'Поменяй значения',
      prompt: 'Это рабочая программа. Измени значения переменных так, чтобы она вывела: Алия 17',
      starter: prog(asg('name', '"Айдос"'), asg('age', '15'), show('name, age')), expect: 'Алия 17',
      unchangedMsg: 'Поменяй значения у переменных (то, что справа от знака равенства) — и запусти снова.',
      validate: function (out, code) {
        var r = outOk(out, 'Алия 17'); if (!r.ok) return r;
        if (!prints(code, 'name\\s*,\\s*age')) return { ok: false, msg: 'Вывод верный, но ты вписал текст прямо в команду вывода. Оставь ' + show('name, age') + ', а поменяй значения переменных.' };
        return { ok: true };
      },
      hints: ['Менять нужно только то, что справа от знака равенства.', 'Текст — в кавычках, число — без.', prog(asg('name', '"Алия"'), asg('age', '17'), show('name, age'))],
      solution: prog(asg('name', '"Алия"'), asg('age', '17'), show('name, age'))
    });

    steps.push(Object.assign({ id: 'debug1' }, defs['v-debug-name']));
    steps.push(Object.assign({ id: 'debug2' }, defs['v-debug-quote']));
    steps.push(Object.assign({ id: 'make1' }, defs['v-write-age'], { prompt: 'Теперь сам. Редактор пуст. Создай переменную age со значением 15 и выведи её на экран.' }));
    steps.push(Object.assign({ id: 'make2' }, defs['v-write-score'], {
      after: 'Попробуй потом в Песочнице: ' + show('"Счёт: " + 5') + ' — что получится?',
      simple: 'Представь копилку. В ней 10 монет. Ты открываешь её, добавляешь 5 и закрываешь — теперь там 15. Запись score = score + 5 делает ровно это: берёт старое значение, прибавляет 5 и запоминает новое.'
    }));

    steps.push({
      id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval',
      title: 'Проверка без подсказок',
      lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['v-q-value'], qs['v-q-quotes'], qs['v-q-types'], qs['v-q-update'], qs['v-q-case']]
    });

    steps.push({
      id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-vars',
      title: 'Объясни своими словами',
      prompt: 'Как будто объясняешь другу: что такое переменная, зачем нужны кавычки вокруг текста и что выведет эта программа?',
      code: prog(asg('age', '15'), show('age + 1')), min: 40,
      model: 'Переменная — это имя, под которым хранится значение: age «помнит» число 15. Когда имя стоит без кавычек, компьютер подставляет то, что в нём лежит, поэтому age + 1 даёт 16. Кавычки нужны для текста: без них слово компьютер принял бы за имя, а в кавычках это просто символы.'
    });

    steps.push({
      id: 'done', kind: 'done', tag: 'Готово', title: 'Переменные освоены', rosetta: false,
      lead: 'Теперь программа умеет помнить значения и менять их. Это основа всего дальнейшего.',
      foot: 'Первое повторение — завтра. Один пропущенный день серию не обнуляет.'
    });

    var cards = Object.assign({}, defs, qs);
    return { id: 'vars', title: 'Переменные и типы данных', day: 2, minutes: 20, steps: steps, cards: cards, lang: lang };
  }

  /* ======================= общие помощники для уроков 3+ ======================= */
  function kit(lang) {
    var py = lang !== 'js';
    var k = { py: py, NAME: py ? 'Python' : 'JavaScript', OUT: py ? 'print' : 'console.log', END: py ? '' : ';', IND: py ? '    ' : '  ' };
    k.asg = function (n, v) { return (py ? '' : 'let ') + n + ' = ' + v + k.END; };   // создать переменную
    k.set = function (n, v) { return n + ' = ' + v + k.END; };                         // изменить значение
    k.show = function (a) { return k.OUT + '(' + a + ')' + k.END; };
    k.prog = function () { return Array.prototype.slice.call(arguments).join('\n'); };
    k.ind = function (s) { return String(s).split('\n').map(function (l) { return k.IND + l; }).join('\n'); };
    k.head = function (kw, cond) { return py ? kw + ' ' + cond + ':' : kw + ' (' + cond + ') {'; };
    k.iff = function (cond, a, b) {
      var s = k.head('if', cond) + '\n' + k.ind(a);
      if (py) return b ? s + '\nelse:\n' + k.ind(b) : s;
      return b ? s + '\n} else {\n' + k.ind(b) + '\n}' : s + '\n}';
    };
    k.loop = function (cond, body) { return k.head('while', cond) + '\n' + k.ind(body) + (py ? '' : '\n}'); };
    // проверки по коду без содержимого строк и комментариев
    k.has = function (code, re) { return re.test(window.Core.bareCode(code, lang)); };
    k.outs = function (code) { var m = window.Core.bareCode(code, lang).match(py ? /\bprint\s*\(/g : /console\.log\s*\(/g); return m ? m.length : 0; };
    k.assigns = function (code, n, v) { return new RegExp('(?:^|;)[ \\t]*(?:(?:let|const|var)\\s+)?' + n + '[ \\t]*=[ \\t]*' + v + '(?![\\w.])', 'm').test(code); };
    k.outOk = function (out, expected) { return window.Core.checkOutput(out, expected); };
    return k;
  }

  /* ======================= День 3: условия ======================= */
  function buildCond(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, show = k.show, prog = k.prog, iff = k.iff;
    var T = py ? 'True' : 'true', F = py ? 'False' : 'false';
    var AGE = function (n) { return prog(asg('age', String(n)), iff('age >= 18', show('"Можно"'), show('"Рано"'))); };
    var TEMP = function (n) { return prog(asg('temp', String(n)), iff('temp > 25', show('"Жарко"'), show('"Нормально"'))); };

    var defs = {};

    defs['c-fill'] = {
      kind: 'fill', card: 'c-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Допиши условие', prompt: 'Нужно условие «если score больше 50». Впиши знак сравнения и то, чем заканчивается строка.',
      tpl: py ? ['if score ', { b: 0 }, ' 50', { b: 1 }] : ['if (score ', { b: 0 }, ' 50) ', { b: 1 }],
      blanks: [{ accept: ['>'], label: 'знак сравнения' }, { accept: [py ? ':' : '{'], label: 'конец строки' }],
      okText: py ? 'Знак > значит «больше». Двоеточие говорит: дальше — что делать, если это правда.' : 'Знак > значит «больше». Фигурная скобка открывает команды, которые выполнятся, если это правда.',
      hintText: 'Первый пропуск — знак «больше»: >. Второй — ' + (py ? 'двоеточие.' : 'открывающая фигурная скобка {.')
    };

    defs['c-debug-syntax'] = {
      kind: 'code', mode: 'debug', card: 'c-debug-syntax', tag: 'Найди ошибку', why: 'debug',
      title: 'Сломанное условие', prompt: 'Программа должна вывести Больше, но не запускается. Запусти, прочитай подсказку под ошибкой и исправь.',
      starter: py ? 'x = 7\nif x > 5\n    print("Больше")' : 'let x = 7;\nif x > 5 {\n  console.log("Больше");\n}',
      expect: 'Больше',
      preface: py ? 'Строка с if всегда заканчивается двоеточием. Забыть его — самая частая ошибка в условиях.' : 'В JavaScript условие после if всегда стоит в круглых скобках. Забыть их — частая ошибка.',
      hints: py ? ['Посмотри на конец строки с if.', 'После условия нужно двоеточие.', 'Должно быть так: if x > 5:']
        : ['Посмотри, что стоит сразу после if.', 'Условие нужно взять в круглые скобки.', 'Должно быть так: if (x > 5) {'],
      solution: prog(asg('x', '7'), iff('x > 5', show('"Больше"')))
    };

    defs['c-debug-logic'] = {
      kind: 'code', mode: 'debug', card: 'c-debug-logic', tag: 'Найди ошибку', why: 'debug',
      title: 'Условие наоборот', prompt: 'Скидку дают, если цена больше 1000. Цена 1500, но программа пишет «Без скидки». Ошибки нет — неверно само условие. Исправь его, цену не меняй.',
      starter: prog(asg('price', '1500'), iff('price < 1000', show('"Скидка"'), show('"Без скидки"'))), expect: 'Скидка',
      validate: function (out, code) {
        var r = k.outOk(out, 'Скидка'); if (!r.ok) return r;
        if (!k.assigns(code, 'price', '1500')) return { ok: false, msg: 'Цену менять не нужно: price должна остаться 1500. Исправь знак в условии.' };
        if (!k.has(code, /\bif\b/) || !k.has(code, /\belse\b/)) return { ok: false, msg: 'Оставь if и else. Исправь только знак сравнения.' };
        return { ok: true };
      },
      hints: ['Прочитай условие вслух: «если цена меньше 1000». А что сказано в задании?', 'Знак < значит «меньше», знак > значит «больше».', 'Замени < на >.'],
      solution: prog(asg('price', '1500'), iff('price > 1000', show('"Скидка"'), show('"Без скидки"')))
    };

    defs['c-write-temp'] = {
      kind: 'code', mode: 'write', card: 'c-write-temp', tag: 'Напиши сам', why: 'make',
      title: 'Жарко или нормально', prompt: 'Создай переменную temp со значением 30. Если temp больше 25 — выведи Жарко, иначе — выведи Нормально.',
      starter: '', expect: 'Жарко',
      validate: function (out, code) {
        var r = k.outOk(out, 'Жарко'); if (!r.ok) return r;
        if (!k.assigns(code, 'temp', '30')) return { ok: false, msg: 'Начни с переменной: ' + asg('temp', '30') };
        if (!k.has(code, /\bif\b/)) return { ok: false, msg: 'Выведено верно, но без проверки. Нужно условие: ' + k.head('if', 'temp > 25') };
        if (!k.has(code, /\belse\b/) || code.indexOf('Нормально') === -1) return { ok: false, msg: 'Нужна и ветка «иначе» (else), в которой выводится Нормально.' };
        return { ok: true };
      },
      hints: [
        'Три части: создать temp, проверить условие, вывести одно из двух.',
        py ? 'Строка с условием: if temp > 25: — а команда под ней начинается с 4 пробелов.' : 'Строка с условием: if (temp > 25) { — а команда стоит внутри фигурных скобок.',
        'Каркас:\n' + iff('temp > 25', show('"..."'), show('"..."'))
      ],
      solution: TEMP(30)
    };

    defs['c-write-pass'] = {
      kind: 'code', mode: 'write', card: 'c-write-pass', tag: 'Напиши сам', why: 'make',
      title: 'Проверка пароля', prompt: 'Создай переменную password со значением "qwerty". Если password равен "qwerty" — выведи Вход разрешён, иначе — выведи Неверный пароль.',
      starter: '', expect: 'Вход разрешён',
      validate: function (out, code) {
        var r = k.outOk(out, 'Вход разрешён'); if (!r.ok) return r;
        if (!k.has(code, /\bif\b/) || !k.has(code, /\belse\b/)) return { ok: false, msg: 'Нужна проверка: if и else.' };
        if (!k.has(code, /==/)) return { ok: false, msg: 'Чтобы сравнить, нужны два знака равенства: password == "qwerty"' };
        if (code.indexOf('Неверный пароль') === -1) return { ok: false, msg: 'В ветке «иначе» выведи Неверный пароль.' };
        return { ok: true };
      },
      hints: [
        'Сравнение «равно» пишется двумя знаками: ==. Один знак = кладёт значение в переменную.',
        'Текст сравнивают с текстом в кавычках: password == "qwerty"',
        'Каркас:\n' + prog(asg('password', '"qwerty"'), iff('password == "..."', show('"..."'), show('"..."')))
      ],
      solution: prog(asg('password', '"qwerty"'), iff('password == "qwerty"', show('"Вход разрешён"'), show('"Неверный пароль"')))
    };

    var qs = {};
    qs['c-q-else'] = {
      kind: 'mcq', card: 'c-q-else', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('x', '3'), iff('x > 5', show('"A"'), show('"B"'))), out: 'B',
      options: [{ text: 'B', correct: true }, { text: 'A' }, { text: 'A и B' }, { text: 'Ничего' }],
      explain: '3 не больше 5 — условие неверно. Значит, выполняется ветка «иначе» (else).'
    };
    qs['c-q-bool'] = {
      kind: 'mcq', card: 'c-q-bool', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет этот код?', code: show('7 == 7'), out: T,
      options: [{ text: T, correct: true }, { text: '7' }, { text: '7 == 7' }, { text: 'Ошибка' }],
      explain: 'Сравнение — это вопрос, а ответ на него — «да» или «нет». «Да» в ' + k.NAME + ' пишется ' + T + ', «нет» — ' + F + '.'
    };
    qs['c-q-eq'] = {
      kind: 'mcq', card: 'c-q-eq', tag: 'Вспомни', why: 'retrieval',
      q: 'Чем = отличается от ==?',
      options: [
        { text: 'Один знак кладёт значение в переменную, два — сравнивают', correct: true },
        { text: 'Ничем, это одно и то же' },
        { text: 'Два знака кладут значение, один — сравнивает' },
        { text: 'Два знака нужны только для текста' }
      ],
      explain: 'age = 18 значит «запомни 18 под именем age». age == 18 значит «age равно 18?» — и ответ «да» или «нет».'
    };
    qs['c-q-inside'] = {
      kind: 'mcq', card: 'c-q-inside', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('x', '1'), iff('x > 5', show('"Да"')), show('"Конец"')), out: 'Конец',
      options: [{ text: 'Конец', correct: true }, { text: 'Да и Конец' }, { text: 'Да' }, { text: 'Ничего' }],
      explain: py ? 'Последняя строка стоит без отступа — она не внутри if и выполняется всегда. А «Да» внутри if, и условие неверно.'
        : 'Последняя строка стоит после закрывающей скобки } — она не внутри if и выполняется всегда. А «Да» внутри if, и условие неверно.'
    };
    qs['c-q-gte'] = {
      kind: 'mcq', card: 'c-q-gte', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: AGE(18), out: 'Можно',
      options: [{ text: 'Можно', correct: true }, { text: 'Рано' }, { text: 'Можно и Рано' }, { text: 'Ошибка' }],
      explain: 'Знак >= значит «больше или равно». 18 равно 18 — условие верно.'
    };

    var steps = [];

    steps.push({
      id: 'goal', kind: 'intro', tag: 'Цель',
      title: 'Сегодня программа научится выбирать',
      lead: 'До сих пор программа выполняла все строки подряд. Условие даёт ей выбор: «если так — сделай одно, иначе — другое».',
      flow: { code: AGE(20), out: 'Можно' },
      points: ['Угадаешь, какую ветку выберет программа', 'Разберёшь строку с if', 'Соберёшь, допишешь и починишь условие', 'Напишешь свою проверку'],
      foot: '≈ 20 минут.',
      simple: 'Условие — как светофор. Зелёный? Идём. Иначе — стоим. Программа делает то же самое: проверяет и выбирает одну из двух дорог.'
    });

    steps.push({
      id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Сначала угадай',
      question: 'В переменной age лежит 20. Что выведет программа?',
      code: AGE(20), expected: 'Можно',
      options: [
        { id: 'a', text: 'Можно', correct: true },
        { id: 'b', text: 'Рано' },
        { id: 'c', text: 'Можно и Рано' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. 20 больше 18 — условие верно, и выполнилась команда под if. Ветку else программа пропустила.',
        bad: 'Смотри: if значит «если», else значит «иначе». 20 больше 18 — условие верно, поэтому выполнилась только команда под if. Из двух веток всегда работает одна.',
        dk: 'if значит «если», else значит «иначе». Условие верно — работает команда под if. Неверно — команда под else.'
      }
    });

    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери строку с условием',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: py ? [{ key: 'kw', text: 'if' }, { key: 'cond', text: ' age >= 18' }, { key: 'colon', text: ':' }]
        : [{ key: 'kw', text: 'if' }, { key: 'paren', text: ' (' }, { key: 'cond', text: 'age >= 18' }, { key: 'paren', text: ')' }, { key: 'brace', text: ' {' }],
      roles: {
        kw: { role: '1 · Слово «если»', desc: 'if по-английски «если». С него начинается проверка.' },
        paren: { role: '2 · Круглые скобки', desc: 'В JavaScript условие всегда пишут в круглых скобках.' },
        cond: { role: (py ? '2' : '3') + ' · Условие', desc: 'Вопрос, на который можно ответить «да» или «нет». Здесь: «age больше или равно 18?» Знаки: > больше, < меньше, >= больше или равно, <= меньше или равно, == равно.' },
        colon: { role: '3 · Двоеточие', desc: 'Значит «тогда делай вот что». Команды для этого случая пишут на следующих строках с отступом в 4 пробела.' },
        brace: { role: '4 · Фигурная скобка', desc: 'Открывает команды, которые выполнятся, если условие верно. В конце их закрывает скобка }.' }
      },
      summary: py ? 'Итого: if + условие + двоеточие. Ниже с отступом — что делать, если условие верно.' : 'Итого: if + условие в круглых скобках + команды в фигурных.',
      simple: py ? {
        text: 'Отступ — это 4 пробела в начале строки. По нему Python понимает, какие команды «внутри» условия. Строка с отступом выполняется, только если условие верно. Строка без отступа выполняется всегда.',
        code: 'if age >= 18:\n    print("Можно")\nprint("Конец")',
        after: '«Можно» напечатается только если age от 18. «Конец» напечатается всегда.'
      } : {
        text: 'Фигурные скобки — как коробка. Команды внутри коробки выполняются, только если условие верно. То, что стоит после закрывающей скобки, выполняется всегда.',
        code: 'if (age >= 18) {\n  console.log("Можно");\n}\nconsole.log("Конец");',
        after: '«Можно» напечатается только если age от 18. «Конец» напечатается всегда.'
      }
    });

    steps.push({
      id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Да или нет?',
      question: 'Сравнение — это вопрос к компьютеру. Что он ответит на эти два?',
      code: prog(show('7 > 3'), show('7 == 3')), expected: T + '\n' + F,
      options: [
        { id: 'a', text: T + ' и ' + F, correct: true },
        { id: 'b', text: F + ' и ' + T },
        { id: 'c', text: '7 и 3' },
        { id: 'd', text: 'Ошибка' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. 7 больше 3 — правда (' + T + '). 7 равно 3 — неправда (' + F + '). Именно на такой ответ и смотрит if.',
        bad: T + ' значит «да, правда», ' + F + ' значит «нет, неправда». 7 больше 3 — правда. 7 равно 3 — неправда. Именно на такой ответ и смотрит if.',
        dk: T + ' значит «да, правда», ' + F + ' значит «нет, неправда». if смотрит на этот ответ и решает, выполнять ли команды под собой.'
      },
      simple: 'Спроси себя: «7 больше 3?» Ты ответишь «да». Компьютер отвечает так же, только по-английски: ' + T + '. На вопрос «7 равно 3?» он отвечает ' + F + ' — «нет».'
    });

    var pTok = py ? ['temp = 30', 'if temp > 25:', '    print("Жарко")', 'else:', '    print("Нормально")', 'if temp > 25']
      : ['let temp = 30;', 'if (temp > 25) {', '  console.log("Жарко");', '} else {', '  console.log("Нормально");', '}', 'if temp > 25 {'];
    var pBad = pTok[pTok.length - 1];
    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true,
      title: 'Собери программу',
      lead: 'Собери программу: если temp больше 25, она пишет Жарко, иначе — Нормально. Одна строка лишняя.',
      tokens: pTok, solutions: [pTok.slice(0, pTok.length - 1)],
      tipIf: (function () { var o = {}; o[pBad] = py ? 'У этой строки нет двоеточия в конце — Python её не поймёт.' : 'В этой строке условие без круглых скобок — JavaScript так не понимает.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Начни с переменной temp: условие проверяет её, значит, она должна уже существовать.' : 'Порядок такой: переменная, строка с if, команда, строка с else, команда.'; },
      okText: 'Сначала значение, потом проверка, потом две ветки: «если да» и «иначе».',
      hint: 'Первая строка создаёт temp. Потом if с условием, под ним — что вывести. Потом else, под ним — что вывести иначе.'
    });

    steps.push(Object.assign({ id: 'fill', novice: true }, defs['c-fill']));

    steps.push({
      id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify',
      title: 'Поменяй одно число',
      prompt: 'Программа пишет «Рано», потому что возраст 15. Измени значение age так, чтобы она вывела: Можно',
      starter: AGE(15), expect: 'Можно',
      unchangedMsg: 'Поменяй число в первой строке — и запусти снова.',
      validate: function (out, code) {
        var r = k.outOk(out, 'Можно'); if (!r.ok) return r;
        if (!k.has(code, /\bif\b/) || !k.has(code, /\belse\b/) || code.indexOf('Рано') === -1) return { ok: false, msg: 'Не удаляй условие. Поменяй только значение age в первой строке.' };
        return { ok: true };
      },
      hints: ['Условие: возраст больше или равен 18.', 'Подойдёт любое число от 18.', asg('age', '18')],
      solution: AGE(18)
    });

    steps.push(Object.assign({ id: 'debug1' }, defs['c-debug-syntax']));
    steps.push(Object.assign({ id: 'debug2' }, defs['c-debug-logic']));
    steps.push(Object.assign({ id: 'make1' }, defs['c-write-temp'], {
      prompt: 'Теперь сам. Редактор пуст. Создай переменную temp со значением 30. Если temp больше 25 — выведи Жарко, иначе — выведи Нормально.'
    }));
    steps.push(Object.assign({ id: 'make2' }, defs['c-write-pass'], {
      simple: {
        text: 'Один знак = — это «запомни». Два знака == — это вопрос «равно?». В первой строке ты запоминаешь пароль, в условии — спрашиваешь, совпал ли он.',
        code: prog(asg('password', '"qwerty"'), k.head('if', 'password == "qwerty"'))
      }
    }));

    steps.push({
      id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval',
      title: 'Проверка без подсказок',
      lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['c-q-else'], qs['c-q-bool'], qs['c-q-eq'], qs['c-q-inside'], qs['c-q-gte']]
    });

    steps.push({
      id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-cond',
      title: 'Объясни своими словами',
      prompt: 'Объясни другу по шагам: что делает эта программа и что она выведет?',
      code: TEMP(10), min: 40,
      model: 'В temp лежит 10. Программа проверяет условие «temp больше 25». 10 не больше 25 — это неправда. Поэтому команда под if пропускается, и выполняется ветка else: на экране появится Нормально.'
    });

    steps.push({
      id: 'done', kind: 'done', tag: 'Готово', title: 'Условия освоены', rosetta: false,
      lead: 'Теперь программа умеет выбирать. С переменными и условиями уже можно писать проверки пароля, возраста и скидок.'
    });

    var cards = Object.assign({}, defs, qs);
    return { id: 'cond', title: 'Условия: если… иначе', day: 3, minutes: 20, steps: steps, cards: cards, lang: lang };
  }

  /* ======================= День 4: цикл while ======================= */
  function buildLoops(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, set = k.set, show = k.show, prog = k.prog, loop = k.loop;
    var COUNT = function (to, op) { return prog(asg('i', '1'), loop('i ' + (op || '<=') + ' ' + to, prog(show('i'), set('i', 'i + 1')))); };
    var HELLO = prog(asg('count', '1'), loop('count <= 3', prog(show('"Привет"'), set('count', 'count + 1'))));
    var needLoop = function (code, maxOuts, msgOuts) {
      if (!k.has(code, /\bwhile\b/)) return { ok: false, msg: 'Здесь нужен цикл while. Одна команда вывода внутри цикла вместо нескольких подряд.' };
      if (k.outs(code) > maxOuts) return { ok: false, msg: msgOuts };
      return { ok: true };
    };

    var defs = {};

    defs['l-fill'] = {
      kind: 'fill', card: 'l-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Допиши счётчик', prompt: 'Эта строка стоит внутри цикла и увеличивает i на 1. Впиши недостающее.',
      tpl: py ? ['i = i ', { b: 0 }, ' ', { b: 1 }] : ['i = i ', { b: 0 }, ' ', { b: 1 }, ';'],
      blanks: [{ accept: ['+'], label: 'знак' }, { accept: ['1'], label: 'число' }],
      okText: 'Взять i, прибавить 1, положить обратно. Без этой строки цикл никогда не закончится.',
      hintText: 'Нужно прибавить единицу: знак + и число 1.'
    };

    defs['l-debug-inf'] = {
      kind: 'code', mode: 'debug', card: 'l-debug-inf', tag: 'Найди ошибку', why: 'debug',
      title: 'Цикл без конца', prompt: 'Программа должна вывести 1, 2, 3 — каждое число на своей строке. Запусти и посмотри, что произойдёт. Потом исправь.',
      starter: prog(asg('i', '1'), loop('i <= 3', show('i'))), expect: '1\n2\n3',
      preface: 'Если условие цикла всегда верно, цикл не остановится сам. Бастау прервёт такую программу — ничего не сломается.',
      hints: [
        'Чему равно i на каждом круге? Меняется ли оно?',
        'Внутри цикла нужно увеличивать i. Иначе условие i <= 3 верно всегда.',
        'Добавь внутрь цикла, после вывода, строку: ' + set('i', 'i + 1')
      ],
      solution: COUNT(3)
    };

    defs['l-debug-off'] = {
      kind: 'code', mode: 'debug', card: 'l-debug-off', tag: 'Найди ошибку', why: 'debug',
      title: 'Не хватает одного числа', prompt: 'Нужно вывести числа от 1 до 5. Программа выводит только до 4. Ошибки нет — неверно условие. Исправь его.',
      starter: COUNT(5, '<'), expect: '1\n2\n3\n4\n5',
      validate: function (out, code) {
        var r = k.outOk(out, '1\n2\n3\n4\n5'); if (!r.ok) return r;
        return needLoop(code, 1, 'Не добавляй команды вывода. Исправь условие цикла.');
      },
      hints: ['Когда i стало 5, условие i < 5 верно?', 'Знак < значит «строго меньше». Нужно «меньше или равно».', 'Замени < на <=.'],
      solution: COUNT(5)
    };

    defs['l-write-count'] = {
      kind: 'code', mode: 'write', card: 'l-write-count', tag: 'Напиши сам', why: 'make',
      title: 'Счёт до четырёх', prompt: 'Выведи числа от 1 до 4, каждое на своей строке. Используй цикл while.',
      starter: '', expect: '1\n2\n3\n4',
      validate: function (out, code) {
        var r = k.outOk(out, '1\n2\n3\n4'); if (!r.ok) return r;
        return needLoop(code, 1, 'Команда вывода должна быть одна — внутри цикла.');
      },
      hints: [
        'Три части: создать i, строка с while и условием, внутри — вывод и увеличение i.',
        'Условие: i <= 4.',
        'Каркас:\n' + prog(asg('i', '1'), loop('i <= ...', prog(show('i'), '...')))
      ],
      solution: COUNT(4)
    };

    defs['l-write-rocket'] = {
      kind: 'code', mode: 'write', card: 'l-write-rocket', tag: 'Напиши сам', why: 'make',
      title: 'Обратный отсчёт', prompt: 'Выведи обратный отсчёт: 3, 2, 1 — каждое число на своей строке. После цикла выведи слово Пуск!',
      starter: '', expect: '3\n2\n1\nПуск!',
      validate: function (out, code) {
        var r = k.outOk(out, '3\n2\n1\nПуск!'); if (!r.ok) return r;
        return needLoop(code, 2, 'Нужны две команды вывода: одна внутри цикла (число) и одна после него (Пуск!).');
      },
      hints: [
        'Начни с i = 3 и на каждом круге уменьшай: ' + set('i', 'i - 1'),
        'Цикл работает, пока i >= 1.',
        'Слово Пуск! выводится после цикла — ' + (py ? 'в строке без отступа.' : 'после закрывающей скобки }.')
      ],
      solution: prog(asg('i', '3'), loop('i >= 1', prog(show('i'), set('i', 'i - 1'))), show('"Пуск!"'))
    };

    var qs = {};
    qs['l-q-times'] = {
      kind: 'mcq', card: 'l-q-times', tag: 'Вспомни', why: 'retrieval',
      q: 'Сколько раз программа выведет x?', code: prog(asg('i', '0'), loop('i < 3', prog(show('"x"'), set('i', 'i + 1')))), out: 'x\nx\nx',
      options: [{ text: '3 раза', correct: true }, { text: '2 раза' }, { text: '4 раза' }, { text: 'Без остановки' }],
      explain: 'i проходит значения 0, 1, 2 — это три круга. Когда i стало 3, условие i < 3 неверно, и цикл закончился.'
    };
    qs['l-q-forget'] = {
      kind: 'mcq', card: 'l-q-forget', tag: 'Вспомни', why: 'retrieval',
      q: 'В этом цикле забыли строку «' + set('i', 'i + 1') + '». Что произойдёт?', code: prog(asg('i', '1'), loop('i <= 3', show('i'))),
      options: [
        { text: 'Цикл не остановится: i всегда равно 1', correct: true },
        { text: 'Выведется 1, 2, 3' },
        { text: 'Выведется 1 — один раз' },
        { text: 'Ошибка в первой строке' }
      ],
      explain: 'i не меняется, поэтому условие i <= 3 верно всегда. Компьютер будет печатать 1 без конца, пока программу не остановят.'
    };
    qs['l-q-stop'] = {
      kind: 'mcq', card: 'l-q-stop', tag: 'Вспомни', why: 'retrieval',
      q: 'Когда цикл while останавливается?',
      options: [
        { text: 'Когда его условие стало неверным', correct: true },
        { text: 'Всегда после трёх кругов' },
        { text: 'Когда закончились строки программы' },
        { text: 'Никогда: его останавливают вручную' }
      ],
      explain: 'Перед каждым кругом компьютер проверяет условие. Верно — делает круг. Неверно — выходит из цикла и идёт дальше по программе.'
    };
    qs['l-q-zero'] = {
      kind: 'mcq', card: 'l-q-zero', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('i', '5'), loop('i < 3', prog(show('i'), set('i', 'i + 1')))), out: '',
      options: [{ text: 'Ничего', correct: true }, { text: '5' }, { text: '5, 4, 3' }, { text: '5 без остановки' }],
      explain: 'Условие проверяется ещё до первого круга. 5 не меньше 3 — цикл не выполнится ни разу.'
    };
    qs['l-q-after'] = {
      kind: 'mcq', card: 'l-q-after', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('i', '1'), loop('i <= 3', set('i', 'i + 1')), show('i')), out: '4',
      options: [{ text: '4', correct: true }, { text: '3' }, { text: '1' }, { text: '1, 2, 3' }],
      explain: 'Внутри цикла вывода нет — там только i растёт. Цикл остановился, когда i стало 4, и это значение вывела последняя строка.'
    };

    var steps = [];

    steps.push({
      id: 'goal', kind: 'intro', tag: 'Цель',
      title: 'Сегодня программа научится повторять',
      lead: 'Писать одну команду сто раз — долго. Цикл говорит компьютеру: «повторяй эти команды, пока условие верно».',
      flow: { code: COUNT(3), out: '1\n2\n3' },
      points: ['Угадаешь, сколько раз сработает цикл', 'Разберёшь строку с while', 'Починишь цикл, который не может остановиться', 'Напишешь счётчик и обратный отсчёт'],
      foot: '≈ 20 минут.',
      simple: 'Цикл — как мытьё посуды: «пока в раковине есть тарелки — мой следующую». Ты не считаешь заранее, сколько раз. Просто повторяешь, пока условие верно.'
    });

    steps.push({
      id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Сначала угадай',
      question: 'Сколько раз программа выведет слово Привет?',
      code: HELLO, expected: 'Привет\nПривет\nПривет',
      options: [
        { id: 'a', text: 'Три раза', correct: true },
        { id: 'b', text: 'Один раз' },
        { id: 'c', text: 'Без остановки' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. count проходит значения 1, 2, 3. Когда стало 4, условие count <= 3 неверно — цикл остановился.',
        bad: 'while значит «пока». Команды внутри повторяются, пока count <= 3. count растёт: 1, 2, 3 — три круга. На 4 условие неверно, цикл остановился.',
        dk: 'while значит «пока». Команды внутри повторяются, пока условие верно. count растёт: 1, 2, 3 — три круга.'
      }
    });

    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери строку с циклом',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: py ? [{ key: 'kw', text: 'while' }, { key: 'cond', text: ' i <= 3' }, { key: 'colon', text: ':' }]
        : [{ key: 'kw', text: 'while' }, { key: 'paren', text: ' (' }, { key: 'cond', text: 'i <= 3' }, { key: 'paren', text: ')' }, { key: 'brace', text: ' {' }],
      roles: {
        kw: { role: '1 · Слово «пока»', desc: 'while по-английски «пока». Команды ниже будут повторяться, пока условие верно.' },
        paren: { role: '2 · Круглые скобки', desc: 'Как и у if: условие в JavaScript пишут в круглых скобках.' },
        cond: { role: (py ? '2' : '3') + ' · Условие', desc: 'Такое же, как в if. Проверяется перед каждым кругом. Верно — делаем круг. Неверно — цикл закончен.' },
        colon: { role: '3 · Двоеточие', desc: 'Дальше с отступом в 4 пробела идут команды, которые повторяются.' },
        brace: { role: '4 · Фигурная скобка', desc: 'Открывает команды, которые повторяются. В конце их закрывает скобка }.' }
      },
      summary: 'Итого: while + условие. Всё как у if, только команды выполняются не один раз, а снова и снова.',
      simple: {
        text: 'Разница между if и while одна. if проверяет условие один раз. while после каждого круга возвращается наверх и проверяет снова.',
        code: COUNT(3),
        after: 'Круг 1: выводим 1, i становится 2. Круг 2: выводим 2, i становится 3. Круг 3: выводим 3, i становится 4. Проверка «4 <= 3?» — нет. Цикл закончен.'
      }
    });

    steps.push({
      id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Пройди по кругам',
      question: 'Что выведет программа? Пройди цикл в уме, круг за кругом.',
      code: COUNT(3), expected: '1\n2\n3',
      options: [
        { id: 'a', text: '1, 2, 3', correct: true },
        { id: 'b', text: '1, 2' },
        { id: 'c', text: '0, 1, 2' },
        { id: 'd', text: '1, 2, 3, 4' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. Знак <= значит «меньше или равно», поэтому 3 тоже выводится. На 4 условие неверно.',
        bad: 'Начинаем с 1. Знак <= значит «меньше или равно», поэтому круг с i = 3 тоже выполняется. Когда i стало 4, условие неверно, и 4 уже не выводится.',
        dk: 'Начинаем с 1 и на каждом круге прибавляем 1. Круги идут, пока i <= 3: выводятся 1, 2 и 3.'
      }
    });

    var pTok = py ? ['i = 1', 'while i <= 3:', '    print(i)', '    i = i + 1', '    i = 1']
      : ['let i = 1;', 'while (i <= 3) {', '  console.log(i);', '  i = i + 1;', '}', '  i = 1;'];
    var pBad = pTok[pTok.length - 1];
    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true,
      title: 'Собери цикл',
      lead: 'Собери программу, которая выводит 1, 2, 3. Одна строка лишняя.',
      tokens: pTok, solutions: [pTok.slice(0, pTok.length - 1)],
      tipIf: (function () { var o = {}; o[pBad] = 'Эта строка на каждом круге возвращает i к 1 — такой цикл никогда не закончится.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Сначала создай счётчик i: условие цикла проверяет его.' : 'Порядок такой: счётчик, строка с while, вывод, увеличение счётчика.'; },
      okText: 'Создать счётчик, проверить условие, сделать дело, увеличить счётчик — так устроен почти каждый цикл.',
      hint: 'Первая строка создаёт i. Потом while с условием. Внутри цикла — сначала вывести i, потом увеличить.'
    });

    steps.push(Object.assign({ id: 'fill', novice: true }, defs['l-fill']));

    steps.push({
      id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify',
      title: 'Сделай цикл длиннее',
      prompt: 'Программа считает до 3. Измени одно число так, чтобы она вывела числа от 1 до 5.',
      starter: COUNT(3), expect: '1\n2\n3\n4\n5',
      unchangedMsg: 'Поменяй число в условии цикла — и запусти снова.',
      validate: function (out, code) {
        var r = k.outOk(out, '1\n2\n3\n4\n5'); if (!r.ok) return r;
        return needLoop(code, 1, 'Не добавляй команды вывода. Измени число в условии цикла.');
      },
      hints: ['Цикл работает, пока i <= 3.', 'Какое число должно стоять в условии, чтобы последним вывелось 5?', k.head('while', 'i <= 5')],
      solution: COUNT(5)
    });

    steps.push(Object.assign({ id: 'debug1' }, defs['l-debug-inf']));
    steps.push(Object.assign({ id: 'debug2' }, defs['l-debug-off']));
    steps.push(Object.assign({ id: 'make1' }, defs['l-write-count'], {
      prompt: 'Теперь сам. Редактор пуст. Выведи числа от 1 до 4, каждое на своей строке. Используй цикл while.'
    }));
    steps.push(Object.assign({ id: 'make2' }, defs['l-write-rocket'], {
      simple: {
        text: 'Обратный отсчёт — тот же счётчик, только наоборот. Начинаем с 3, на каждом круге отнимаем 1. Цикл идёт, пока число не меньше 1.',
        code: prog(asg('i', '3'), k.head('while', 'i >= 1'))
      }
    }));

    steps.push({
      id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval',
      title: 'Проверка без подсказок',
      lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['l-q-times'], qs['l-q-forget'], qs['l-q-stop'], qs['l-q-zero'], qs['l-q-after']]
    });

    steps.push({
      id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-loops',
      title: 'Объясни своими словами',
      prompt: 'Объясни другу по шагам: что происходит на каждом круге и почему цикл останавливается?',
      code: prog(asg('i', '1'), loop('i <= 2', prog(show('"Привет"'), set('i', 'i + 1')))), min: 40,
      model: 'Сначала i равно 1. Условие «i меньше или равно 2» верно — выводится Привет, и i становится 2. Условие снова верно — выводится второй Привет, и i становится 3. Теперь условие неверно, и цикл заканчивается. Всего Привет выведется два раза.'
    });

    steps.push({
      id: 'done', kind: 'done', tag: 'Готово', title: 'Циклы освоены', rosetta: false,
      lead: 'Переменные, условия и циклы — три кирпича, из которых собрана почти любая программа. Все три у тебя уже есть.'
    });

    var cards = Object.assign({}, defs, qs);
    return { id: 'loops', title: 'Циклы: повторяй, пока…', day: 4, minutes: 20, steps: steps, cards: cards, lang: lang };
  }

  var BUILDERS = { hello: buildHello, vars: buildVars, cond: buildCond, loops: buildLoops };
  function build(lang, id) { return (BUILDERS[id] || buildHello)(lang); }
  // все карточки повторения всех уроков для языка (id карточек уникальны между уроками)
  function allCards(lang) {
    var out = {};
    LESSONS.forEach(function (l) { Object.assign(out, build(lang, l.id).cards); });
    return out;
  }

  window.Course = { build: build, allCards: allCards, LESSONS: LESSONS, WHY: WHY, LINKS: LINKS, ROSETTA: ROSETTA, ROADMAP: ROADMAP };
})();
