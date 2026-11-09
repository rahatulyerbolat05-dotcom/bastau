/* Содержание: уроки «Hello, World!» (день 1) и «Переменные и типы данных» (день 2) для Python и JavaScript, карточки повторения, пояснения «почему так». */
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
    { id: 'vars', day: 2, title: 'Переменные и типы данных', minutes: 20 }
  ];
  var ROADMAP = ['Ввод и условия', 'Циклы'];

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
      foot: '≈ 20 минут. Можно остановиться в любой момент — приложение запомнит, где ты был.'
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
      summary: py ? 'Итого: команда + скобки + текст в кавычках. Три роли — вся программа.' : 'Итого: команда + скобки + текст в кавычках + конец инструкции.'
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
      q: 'Что выведет эта программа?', code: prog(asg('a', '7'), show('a')),
      options: [{ text: '7', correct: true }, { text: 'a' }, { text: '"a"' }, { text: 'Ошибка' }],
      explain: 'Имя без кавычек — это переменная: компьютер подставляет то, что в ней лежит. В a лежит 7.'
    };
    qs['v-q-quotes'] = {
      kind: 'mcq', card: 'v-q-quotes', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('city', '"Астана"'), show('"city"')),
      options: [{ text: 'city', correct: true }, { text: 'Астана' }, { text: '"city"' }, { text: 'Ошибка' }],
      explain: 'Кавычки делают city просто текстом, и компьютер не заглядывает в переменную. Чтобы вывести Астана, кавычки не нужны.'
    };
    qs['v-q-types'] = {
      kind: 'mcq', card: 'v-q-types', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: show('"5" + "5"'),
      options: [{ text: '55', correct: true }, { text: '10' }, { text: 'Ошибка' }, { text: '5 5' }],
      explain: 'В кавычках 5 — текст. Два текста склеиваются: «5» и «5» дают «55». Без кавычек 5 + 5 дало бы 10.'
    };
    qs['v-q-update'] = {
      kind: 'mcq', card: 'v-q-update', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('x', '5'), 'x = x + 1' + END, show('x')),
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
      foot: '≈ 20 минут. Hello, World! тут не нужен: начинаем сразу с переменных.'
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
      kw: { role: '1 · Слово «создать»', desc: 'let значит «создай переменную». Пишется один раз, когда имя появляется впервые.' },
      name: { role: (py ? '1' : '2') + ' · Имя', desc: 'Как ты назовёшь «ящик». Буквы, цифры и подчёркивание, без пробелов и не с цифры. Регистр важен: name и Name — разные имена. Называй понятно: city лучше, чем c.' },
      eq: { role: (py ? '2' : '3') + ' · Знак «положить»', desc: 'Это не «равно» из математики, а «положи справа в то, что слева». Поэтому можно писать score = score + 5: сначала считается правая часть, потом результат кладётся обратно.' },
      value: { role: (py ? '3' : '4') + ' · Значение', desc: 'Что хранится. Тут текст в кавычках. Это может быть и число, и результат вычисления.' },
      semi: { role: '5 · Конец инструкции', desc: 'Как и раньше, точка с запятой завершает инструкцию.' }
    };
    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери запись по частям',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: asgParts, roles: asgRoles,
      summary: 'Итого: имя + знак «положить» + значение. Потом имя можно использовать везде, где нужно это значение.'
    });

    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null,
      title: 'Собери программу',
      lead: 'Расставь блоки так, чтобы программа вывела: Айдос 15. Один блок лишний.',
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
      summary: 'Итого: кавычки есть — текст, кавычек нет — число. От типа зависит, что делает +.'
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
      after: 'Попробуй потом в Песочнице: ' + show('"Счёт: " + 5') + ' — что получится?'
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

  function build(lang, id) { return id === 'vars' ? buildVars(lang) : buildHello(lang); }
  // все карточки повторения всех уроков для языка (id карточек уникальны между уроками)
  function allCards(lang) {
    var out = {};
    LESSONS.forEach(function (l) { Object.assign(out, build(lang, l.id).cards); });
    return out;
  }

  window.Course = { build: build, allCards: allCards, LESSONS: LESSONS, WHY: WHY, LINKS: LINKS, ROSETTA: ROSETTA, ROADMAP: ROADMAP };
})();
