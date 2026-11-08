/* Содержание: урок «Hello, World!» для Python и JavaScript, карточки повторения, пояснения «почему так». */
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

  var ROADMAP = ['Переменные и типы данных', 'Ввод и условия', 'Циклы'];

  function build(lang) {
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

  window.Course = { build: build, WHY: WHY, LINKS: LINKS, ROSETTA: ROSETTA, ROADMAP: ROADMAP };
})();
