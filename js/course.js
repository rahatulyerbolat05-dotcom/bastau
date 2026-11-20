/* Содержание: уроки дней 1–5 (Hello, World!; переменные и типы; условия; цикл while; цикл for) для Python и JavaScript, карточки повторения, пояснения «почему так». */
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
    { id: 'loops', day: 4, title: 'Циклы: повторяй, пока…', minutes: 20 },
    { id: 'for', day: 5, title: 'Цикл for: повтори N раз', minutes: 20 },
    { id: 'lists', day: 6, title: 'Списки: много значений под одним именем', minutes: 20 },
    { id: 'funcs', day: 7, title: 'Функции: свои команды', minutes: 20 },
    // другие направления: у них своя нумерация дней и своя страница (track)
    { id: 'html1', day: 1, title: 'Первая страница: теги', minutes: 15, track: 'html' },
    { id: 'html2', day: 2, title: 'Списки, ссылки, картинки', minutes: 15, track: 'html' },
    { id: 'logic1', day: 1, title: 'Закономерности', minutes: 10, track: 'logic' },
    { id: 'logic2', day: 2, title: 'И, ИЛИ, НЕ', minutes: 10, track: 'logic' },
    { id: 'math1', day: 1, title: 'Остаток от деления', minutes: 15, track: 'math' },
    { id: 'math2', day: 2, title: 'Проценты и округление', minutes: 15, track: 'math' }
  ];
  var ROADMAP = ['Словари и объекты', 'Первый проект: калькулятор сметы'];
  var TRACKS = [
    { id: 'html', title: 'HTML и интерфейсы', icon: 'text', about: 'Вёрстка страниц: теги, списки, ссылки, картинки. Результат видно сразу в живом просмотре.', soon: ['Таблицы', 'Формы и кнопки', 'CSS: цвета и шрифты'] },
    { id: 'logic', title: 'Логические задачи', icon: 'bulb', about: 'Закономерности, условия, перебор вариантов — тренировка головы программиста. Решать в уме, без кода.', soon: ['Перебор вариантов', 'Задачи на взвешивание'] },
    { id: 'math', title: 'Математика для кода', icon: 'layers', about: 'Только то, что нужно в программировании: остаток, проценты, округление. Задачи решаются кодом на твоём языке.', soon: ['Двоичная система', 'Координаты и площади'] }
  ];

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

  /* ======================= День 5: цикл for ======================= */
  function buildFor(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, set = k.set, show = k.show, prog = k.prog;
    // forN: повторить n раз (счётчик 0..n-1); forR: счётчик от a до b включительно
    var forHeadN = function (n) { return py ? 'for i in range(' + n + '):' : 'for (let i = 0; i < ' + n + '; i++) {'; };
    var forHeadR = function (a, b) { return py ? 'for i in range(' + a + ', ' + (b + 1) + '):' : 'for (let i = ' + a + '; i <= ' + b + '; i++) {'; };
    var wrap = function (head, body) { return head + '\n' + k.ind(body) + (py ? '' : '\n}'); };
    var forN = function (n, body) { return wrap(forHeadN(n), body); };
    var forR = function (a, b, body) { return wrap(forHeadR(a, b), body); };
    var rep = function (word, n) { var a = []; for (var i = 0; i < n; i++) a.push(word); return a.join('\n'); };
    var needFor = function (code, maxOuts, msgOuts) {
      if (!k.has(code, /\bfor\b/)) return { ok: false, msg: 'Здесь нужен цикл for: одна команда вывода внутри цикла вместо нескольких подряд.' };
      if (k.outs(code) > maxOuts) return { ok: false, msg: msgOuts };
      return { ok: true };
    };

    var defs = {};

    defs['f-fill'] = {
      kind: 'fill', card: 'f-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Допиши цикл', prompt: 'Цикл должен повториться 5 раз. Впиши недостающее.',
      tpl: py ? ['for i in ', { b: 0 }, '(', { b: 1 }, '):'] : ['for (let i = 0; i ', { b: 0 }, ' 5; i', { b: 1 }, ') {'],
      blanks: py ? [{ accept: ['range'], label: 'команда, которая даёт числа' }, { accept: ['5'], label: 'сколько раз' }]
        : [{ accept: ['<'], label: 'знак сравнения' }, { accept: ['++'], label: 'увеличить на 1' }],
      okText: py ? 'range(5) даёт пять чисел: 0, 1, 2, 3, 4. Сколько чисел — столько кругов.' : 'Пока i меньше 5, цикл работает. i++ после каждого круга прибавляет к i единицу.',
      hintText: py ? 'Первый пропуск — слово range. Второй — число повторов: 5.' : 'Первый пропуск — знак «меньше»: <. Второй — два плюса: ++.'
    };

    defs['f-debug-syntax'] = {
      kind: 'code', mode: 'debug', card: 'f-debug-syntax', tag: 'Найди ошибку', why: 'debug',
      title: 'Сломанный for', prompt: 'Программа должна три раза вывести Ура, но не запускается. Запусти, прочитай подсказку под ошибкой и исправь.',
      starter: py ? 'for i in range(3)\n    print("Ура")' : 'for let i = 0; i < 3; i++ {\n  console.log("Ура");\n}',
      expect: 'Ура\nУра\nУра',
      preface: py ? 'Строка с for заканчивается двоеточием — так же, как строки с if и while.' : 'У for, как у if и while, всё, что управляет циклом, стоит в круглых скобках.',
      hints: py ? ['Посмотри на конец первой строки.', 'После range(3) нужно двоеточие.', 'Должно быть так: for i in range(3):']
        : ['Посмотри, что стоит сразу после слова for.', 'Три части цикла нужно взять в круглые скобки.', 'Должно быть так: for (let i = 0; i < 3; i++) {'],
      solution: forN(3, show('"Ура"'))
    };

    defs['f-debug-off'] = {
      kind: 'code', mode: 'debug', card: 'f-debug-off', tag: 'Найди ошибку', why: 'debug',
      title: 'Счёт с нуля', prompt: 'Нужно вывести числа от 1 до 5. Программа выводит от 0 до 4. Ошибки нет — цикл начинает не с того числа. Исправь.',
      starter: forN(5, show('i')), expect: '1\n2\n3\n4\n5',
      validate: function (out, code) {
        var r = k.outOk(out, '1\n2\n3\n4\n5'); if (!r.ok) return r;
        return needFor(code, 1, 'Не добавляй команды вывода. Исправь сам цикл.');
      },
      hints: py ? ['range(5) даёт числа 0, 1, 2, 3, 4 — счёт идёт с нуля.', 'У range может быть два числа: с какого начать и перед каким остановиться.', 'Замени range(5) на range(1, 6).']
        : ['Цикл начинается с i = 0 и работает, пока i < 5.', 'Начать нужно с 1, а закончить на 5 включительно.', 'Должно быть так: for (let i = 1; i <= 5; i++) {'],
      solution: forR(1, 5, show('i'))
    };

    defs['f-write-hello'] = {
      kind: 'code', mode: 'write', card: 'f-write-hello', tag: 'Напиши сам', why: 'make',
      title: 'Четыре раза', prompt: 'Выведи слово Привет четыре раза, каждое на своей строке. Используй цикл for.',
      starter: '', expect: rep('Привет', 4),
      validate: function (out, code) {
        var r = k.outOk(out, rep('Привет', 4)); if (!r.ok) return r;
        return needFor(code, 1, 'Команда вывода должна быть одна — внутри цикла.');
      },
      hints: [
        'Нужна одна строка с for и одна команда вывода внутри.',
        py ? 'Число повторов стоит в скобках у range.' : 'Цикл работает, пока i меньше числа повторов.',
        'Каркас:\n' + forN('...', show('"Привет"'))
      ],
      solution: forN(4, show('"Привет"'))
    };

    defs['f-write-sum'] = {
      kind: 'code', mode: 'write', card: 'f-write-sum', tag: 'Напиши сам', why: 'make',
      title: 'Сумма чисел', prompt: 'Посчитай сумму чисел от 1 до 5 и выведи её. Создай переменную total со значением 0 и в цикле прибавляй к ней счётчик i.',
      starter: '', expect: '15',
      validate: function (out, code) {
        var r = k.outOk(out, '15'); if (!r.ok) return r;
        var need = needFor(code, 1, 'Команда вывода нужна одна — после цикла.'); if (!need.ok) return need;
        if (!k.has(code, /total[ \t]*=[ \t]*total[ \t]*\+|total[ \t]*\+=/)) return { ok: false, msg: 'Ответ верный, но его нужно посчитать: в цикле прибавляй счётчик к total — ' + set('total', 'total + i') };
        return { ok: true };
      },
      hints: [
        'Перед циклом: ' + asg('total', '0') + ' Это «копилка», в которую складываются числа.',
        'В цикле счётчик должен пройти числа 1, 2, 3, 4, 5. На каждом круге: ' + set('total', 'total + i'),
        'Каркас:\n' + prog(asg('total', '0'), forR(1, 5, '...'), show('total'))
      ],
      solution: prog(asg('total', '0'), forR(1, 5, set('total', 'total + i')), show('total'))
    };

    var qs = {};
    qs['f-q-count'] = {
      kind: 'mcq', card: 'f-q-count', tag: 'Вспомни', why: 'retrieval',
      q: 'Сколько раз программа выведет x?', code: forN(4, show('"x"')), out: rep('x', 4),
      options: [{ text: '4 раза', correct: true }, { text: '3 раза' }, { text: '5 раз' }, { text: 'Без остановки' }],
      explain: py ? 'range(4) даёт четыре числа: 0, 1, 2, 3. Сколько чисел — столько кругов.' : 'i проходит значения 0, 1, 2, 3 — четыре круга. Когда i стало 4, условие i < 4 неверно.'
    };
    qs['f-q-first'] = {
      kind: 'mcq', card: 'f-q-first', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: forN(3, show('i')), out: '0\n1\n2',
      options: [{ text: '0, 1, 2', correct: true }, { text: '1, 2, 3' }, { text: '0, 1, 2, 3' }, { text: '3' }],
      explain: py ? 'range(3) начинает с нуля и останавливается перед тройкой: 0, 1, 2.' : 'Счётчик начинается с 0 и растёт, пока меньше 3: 0, 1, 2.'
    };
    qs['f-q-range'] = {
      kind: 'mcq', card: 'f-q-range', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: forR(2, 4, show('i')), out: '2\n3\n4',
      options: [{ text: '2, 3, 4', correct: true }, { text: '2, 3, 4, 5' }, { text: '0, 1, 2, 3, 4' }, { text: '2, 5' }],
      explain: py ? 'range(2, 5) начинает с 2 и останавливается перед 5: выходит 2, 3, 4.' : 'Счётчик начинается с 2 и растёт, пока не больше 4: 2, 3, 4.'
    };
    qs['f-q-why'] = {
      kind: 'mcq', card: 'f-q-why', tag: 'Вспомни', why: 'retrieval',
      q: 'Чем for удобнее while, когда нужно повторить что-то заранее известное число раз?',
      options: [
        { text: 'Счётчик создаётся и увеличивается сам — его нельзя забыть', correct: true },
        { text: 'for работает быстрее' },
        { text: 'В for можно писать больше команд' },
        { text: 'Ничем: for нельзя использовать со счётчиком' }
      ],
      explain: 'В while счётчик нужно создать до цикла и увеличивать внутри. Забыл увеличить — цикл не остановится. В for всё это записано в одной строке.'
    };
    qs['f-q-total'] = {
      kind: 'mcq', card: 'f-q-total', tag: 'Вспомни', why: 'retrieval',
      q: 'Что выведет эта программа?', code: prog(asg('total', '0'), forN(3, set('total', 'total + 2')), show('total')), out: '6',
      options: [{ text: '6', correct: true }, { text: '2' }, { text: '3' }, { text: '2, 4, 6' }],
      explain: 'Цикл делает три круга и каждый раз прибавляет 2: получается 2, 4, 6. Вывод стоит после цикла, поэтому на экране только итог — 6.'
    };

    var steps = [];

    steps.push({
      id: 'goal', kind: 'intro', tag: 'Цель',
      title: 'Сегодня цикл станет короче',
      lead: 'В прошлом уроке на счётчик уходило три строки: создать, проверить, увеличить. Цикл for собирает всё это в одну — и забыть про счётчик уже нельзя.',
      flow: { code: forN(3, show('"Привет"')), out: rep('Привет', 3) },
      points: ['Угадаешь, с какого числа начинается счёт', 'Разберёшь строку с for', 'Починишь цикл, который считает не оттуда', 'Напишешь цикл, который складывает числа'],
      foot: '≈ 20 минут.',
      simple: 'while — это «повторяй, пока…». for — это «повтори столько-то раз». Если ты заранее знаешь число повторов — пять отжиманий, десять шагов — удобнее for.'
    });

    steps.push({
      id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Сначала угадай',
      question: 'Цикл делает три круга и каждый раз выводит свой счётчик i. Какие числа появятся на экране?',
      code: forN(3, show('i')), expected: '0\n1\n2',
      options: [
        { id: 'a', text: '0, 1, 2', correct: true },
        { id: 'b', text: '1, 2, 3' },
        { id: 'c', text: '0, 1, 2, 3' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: {
        ok: 'Верно. Счёт идёт с нуля: три круга — это 0, 1 и 2.',
        bad: 'Почти все сначала отвечают «1, 2, 3». Но в программировании счёт обычно идёт с нуля: три круга — это 0, 1 и 2. Кругов всё равно три.',
        dk: 'Запомни главное: счёт идёт с нуля. Три круга — это 0, 1 и 2.'
      },
      simple: 'Представь этажи в лифте, где первый этаж подписан «0». Этажей три, но на кнопках 0, 1 и 2. Со счётчиком в цикле так же.'
    });

    steps.push({
      id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true,
      title: 'Разбери строку с for',
      lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: py ? [{ key: 'kw', text: 'for' }, { key: 'name', text: ' i' }, { key: 'eq', text: ' in ' }, { key: 'cond', text: 'range(3)' }, { key: 'colon', text: ':' }]
        : [{ key: 'kw', text: 'for' }, { key: 'paren', text: ' (' }, { key: 'name', text: 'let i = 0;' }, { key: 'cond', text: ' i < 3;' }, { key: 'value', text: ' i++' }, { key: 'paren', text: ')' }, { key: 'brace', text: ' {' }],
      roles: py ? {
        kw: { role: '1 · Слово «для»', desc: 'for по-английски «для». Вся строка читается так: «для каждого i из набора чисел».' },
        name: { role: '2 · Счётчик', desc: 'Переменная i создаётся сама. На каждом круге в неё попадает следующее число.' },
        eq: { role: '3 · Слово «из»', desc: 'in значит «из»: счётчик берёт числа из того, что написано справа.' },
        cond: { role: '4 · Набор чисел', desc: 'range(3) даёт три числа: 0, 1, 2. Сколько чисел — столько кругов. Счёт идёт с нуля.' },
        colon: { role: '5 · Двоеточие', desc: 'Как у if и while: дальше с отступом идут команды, которые повторяются.' }
      } : {
        kw: { role: '1 · Слово «для»', desc: 'for по-английски «для». В скобках после него — три части через точку с запятой.' },
        paren: { role: '2 · Круглые скобки', desc: 'В них всё управление циклом: начало, условие и шаг.' },
        name: { role: '3 · Начало', desc: 'Счётчик i создаётся один раз, перед первым кругом, и равен 0.' },
        cond: { role: '4 · Условие', desc: 'Проверяется перед каждым кругом, как в while. Пока i меньше 3, цикл работает.' },
        value: { role: '5 · Шаг', desc: 'Выполняется после каждого круга. i++ — короткая запись для i = i + 1.' },
        brace: { role: '6 · Фигурная скобка', desc: 'Открывает команды, которые повторяются. В конце их закрывает скобка }.' }
      },
      summary: py ? 'Итого: for + счётчик + in + набор чисел. Создавать и увеличивать счётчик вручную не нужно.' : 'Итого: начало; условие; шаг. Это те же три действия, что в while, только в одной строке.',
      simple: {
        text: 'Вот один и тот же цикл двумя способами. Сверху — как в прошлом уроке, снизу — через for. Делают они одно и то же.',
        code: prog(asg('i', '0'), k.loop('i < 3', prog(show('i'), set('i', 'i + 1'))), '', forN(3, show('i'))),
        after: 'В for три строки про счётчик превратились в одну. Забыть увеличить его уже нельзя.'
      }
    });

    steps.push({
      id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict',
      title: 'Счёт не с нуля',
      question: 'Цикл может начинаться с любого числа. Что выведет эта программа?',
      code: forR(1, 3, show('i')), expected: '1\n2\n3',
      options: [
        { id: 'a', text: '1, 2, 3', correct: true },
        { id: 'b', text: '1, 2, 3, 4' },
        { id: 'c', text: '0, 1, 2, 3' },
        { id: 'd', text: '1, 2' },
        { id: 'dk', text: 'Не знаю — проверим', dk: true }
      ],
      after: py ? {
        ok: 'Верно. range(1, 4) начинает с 1 и останавливается перед 4.',
        bad: 'У range два числа: с какого начать и перед каким остановиться. range(1, 4) — это 1, 2, 3. Само число 4 не входит.',
        dk: 'У range два числа: с какого начать и перед каким остановиться. range(1, 4) — это 1, 2, 3.'
      } : {
        ok: 'Верно. Счётчик начинается с 1 и идёт, пока не больше 3.',
        bad: 'Смотри на три части: начинаем с i = 1, работаем, пока i <= 3, после каждого круга прибавляем 1. Получается 1, 2, 3.',
        dk: 'Начинаем с i = 1, работаем, пока i <= 3, после каждого круга прибавляем 1. Получается 1, 2, 3.'
      }
    });

    var pTok = py ? ['for i in range(3):', '    print("Ура")', 'print("Конец")', '    print("Конец")']
      : ['for (let i = 0; i < 3; i++) {', '  console.log("Ура");', '}', 'console.log("Конец");', '  console.log("Конец");'];
    var pBad = pTok[pTok.length - 1];
    steps.push({
      id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true,
      title: 'Собери программу',
      lead: 'Собери программу: три раза Ура, а в самом конце один раз Конец. Одна строка лишняя.',
      tokens: pTok, solutions: [pTok.slice(0, pTok.length - 1)],
      tipIf: (function () { var o = {}; o[pBad] = py ? 'У этой строки есть отступ — значит, она внутри цикла, и Конец выведется на каждом круге.' : 'Эта строка стоит внутри цикла — Конец выведется на каждом круге.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Начни со строки с for.' : 'Порядок такой: строка с for, команда внутри цикла, а Конец — после цикла.'; },
      okText: py ? 'Строка с отступом повторяется. Строка без отступа выполняется один раз, после цикла.' : 'То, что внутри фигурных скобок, повторяется. То, что после них, выполняется один раз.',
      hint: 'Сначала строка с for. Внутри цикла — вывод Ура. После цикла — вывод Конец.'
    });

    steps.push(Object.assign({ id: 'fill', novice: true }, defs['f-fill']));

    steps.push({
      id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify',
      title: 'Больше повторов',
      prompt: 'Программа выводит Привет три раза. Измени одно число так, чтобы она вывела Привет пять раз.',
      starter: forN(3, show('"Привет"')), expect: rep('Привет', 5),
      unchangedMsg: 'Поменяй число повторов в строке с for — и запусти снова.',
      validate: function (out, code) {
        var r = k.outOk(out, rep('Привет', 5)); if (!r.ok) return r;
        return needFor(code, 1, 'Не добавляй команды вывода. Измени число в строке с for.');
      },
      hints: ['Число повторов стоит в строке с for.', 'Сейчас там 3, а нужно 5.', forHeadN(5)],
      solution: forN(5, show('"Привет"'))
    });

    steps.push(Object.assign({ id: 'debug1' }, defs['f-debug-syntax']));
    steps.push(Object.assign({ id: 'debug2' }, defs['f-debug-off']));
    steps.push(Object.assign({ id: 'make1' }, defs['f-write-hello'], {
      prompt: 'Теперь сам. Редактор пуст. Выведи слово Привет четыре раза, каждое на своей строке. Используй цикл for.'
    }));
    steps.push(Object.assign({ id: 'make2' }, defs['f-write-sum'], {
      simple: {
        text: 'total — это копилка. Сначала в ней 0. На каждом круге ты кладёшь туда очередное число: 1, потом 2, потом 3, 4 и 5. В конце заглядываешь в копилку — там 15.',
        code: prog(asg('total', '0'), set('total', 'total + 1'), set('total', 'total + 2')),
        after: 'Это два первых круга, записанные вручную. Цикл делает то же самое сам, подставляя вместо числа счётчик i.'
      }
    }));

    steps.push({
      id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval',
      title: 'Проверка без подсказок',
      lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['f-q-count'], qs['f-q-first'], qs['f-q-range'], qs['f-q-why'], qs['f-q-total']]
    });

    steps.push({
      id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-for',
      title: 'Объясни своими словами',
      prompt: 'Объясни другу по шагам: что происходит на каждом круге и что программа выведет в конце?',
      code: prog(asg('total', '0'), forR(1, 3, set('total', 'total + i')), show('total')), min: 40,
      model: 'Сначала в total лежит 0. Цикл делает три круга, счётчик i принимает значения 1, 2 и 3. На каждом круге к total прибавляется i: получается 1, потом 3, потом 6. После цикла программа выводит total — на экране будет 6.'
    });

    steps.push({
      id: 'done', kind: 'done', tag: 'Готово', title: 'Цикл for освоен', rosetta: false,
      lead: 'Теперь у тебя два цикла: while — когда повторяешь «пока…», и for — когда знаешь число повторов. Вместе с переменной-копилкой это уже настоящие вычисления.'
    });

    var cards = Object.assign({}, defs, qs);
    return { id: 'for', title: 'Цикл for: повтори N раз', day: 5, minutes: 20, steps: steps, cards: cards, lang: lang };
  }

  /* ======================= День 6: списки ======================= */
  function buildLists(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, set = k.set, show = k.show, prog = k.prog;
    var FR = '["яблоко", "груша", "слива"]';
    var LEN = function (x) { return py ? 'len(' + x + ')' : x + '.length'; };
    var ADD = function (x, v) { return py ? x + '.append(' + v + ')' : x + '.push(' + v + ');'; };
    var each = function (item, list, body) { return (py ? 'for ' + item + ' in ' + list + ':' : 'for (const ' + item + ' of ' + list + ') {') + '\n' + k.ind(body) + (py ? '' : '\n}'); };
    var needFor = function (code, msg) { return k.has(code, /\bfor\b/) ? { ok: true } : { ok: false, msg: msg || 'Здесь нужен цикл for по списку.' }; };

    var defs = {};
    defs['ls-fill'] = {
      kind: 'fill', card: 'ls-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Первый элемент', prompt: 'Выведи первый элемент списка fruits. Впиши номер.',
      tpl: [k.OUT + '(fruits[', { b: 0 }, '])' + k.END],
      blanks: [{ accept: ['0'], label: 'номер элемента' }],
      okText: 'Счёт в списке начинается с нуля: первый элемент — fruits[0].',
      hintText: 'Номер первого элемента — не единица.'
    };
    defs['ls-debug-index'] = {
      kind: 'code', mode: 'debug', card: 'ls-debug-index', tag: 'Найди ошибку', why: 'debug',
      title: 'Номера с нуля', prompt: 'Нужно вывести последний элемент — слива. Программа ' + (py ? 'падает с ошибкой' : 'выводит undefined') + '. Исправь номер.',
      starter: prog(asg('fruits', FR), show('fruits[3]')), expect: 'слива',
      preface: 'В списке из трёх элементов номера 0, 1 и 2. Номера 3 там просто нет.',
      hints: ['Сколько элементов в списке и с какого номера начинается счёт?', 'Если номера 0, 1, 2, то последний — 2.', 'Замени fruits[3] на fruits[2].'],
      solution: prog(asg('fruits', FR), show('fruits[2]'))
    };
    defs['ls-debug-add'] = {
      kind: 'code', mode: 'debug', card: 'ls-debug-add', tag: 'Найди ошибку', why: 'debug',
      title: 'Как добавить элемент', prompt: 'Программа должна добавить в список киви и вывести его. Но команда добавления неверная. Исправь.',
      starter: prog(asg('fruits', FR), py ? 'fruits.add("киви")' : 'fruits.add("киви");', show('fruits[3]')), expect: 'киви',
      hints: ['Прочитай ошибку: у списка нет команды add.', py ? 'В Python элемент в конец списка добавляет append.' : 'В JavaScript элемент в конец списка добавляет push.', 'Замени add на ' + (py ? 'append' : 'push') + '.'],
      solution: prog(asg('fruits', FR), ADD('fruits', '"киви"'), show('fruits[3]'))
    };
    defs['ls-write-each'] = {
      kind: 'code', mode: 'write', card: 'ls-write-each', tag: 'Напиши сам', why: 'make',
      title: 'Каждый по очереди', prompt: 'Создай список nums с числами 5, 10 и 15. Выведи каждое число на своей строке с помощью цикла for.',
      starter: '', expect: '5\n10\n15',
      validate: function (out, code) {
        var r = k.outOk(out, '5\n10\n15'); if (!r.ok) return r;
        if (!k.has(code, /\[\s*5\s*,\s*10\s*,\s*15\s*\]/)) return { ok: false, msg: 'Создай список: ' + asg('nums', '[5, 10, 15]') };
        if (k.outs(code) > 1) return { ok: false, msg: 'Команда вывода должна быть одна — внутри цикла.' };
        return needFor(code);
      },
      hints: ['Сначала список в квадратных скобках, потом цикл по нему.', 'Цикл по списку: ' + (py ? 'for n in nums:' : 'for (const n of nums) {'), 'Каркас:\n' + prog(asg('nums', '[5, 10, 15]'), each('n', 'nums', show('n')))],
      solution: prog(asg('nums', '[5, 10, 15]'), each('n', 'nums', show('n')))
    };
    defs['ls-write-sum'] = {
      kind: 'code', mode: 'write', card: 'ls-write-sum', tag: 'Напиши сам', why: 'make',
      title: 'Сумма покупок', prompt: 'В списке prices лежат цены: 300, 450 и 250. Посчитай сумму в цикле (копилка total) и выведи её.',
      starter: asg('prices', '[300, 450, 250]') + '\n', expect: '1000',
      validate: function (out, code) {
        var r = k.outOk(out, '1000'); if (!r.ok) return r;
        if (!k.has(code, /total[ \t]*=[ \t]*total[ \t]*\+|total[ \t]*\+=/)) return { ok: false, msg: 'Сумму нужно накопить в цикле: ' + set('total', 'total + p') };
        return needFor(code);
      },
      hints: ['Копилка total начинается с 0.', 'В цикле по prices прибавляй каждую цену к total.', 'Каркас:\n' + prog(asg('total', '0'), each('p', 'prices', set('total', 'total + p')), show('total'))],
      solution: prog(asg('prices', '[300, 450, 250]'), asg('total', '0'), each('p', 'prices', set('total', 'total + p')), show('total'))
    };

    var qs = {};
    qs['ls-q-first'] = { kind: 'mcq', card: 'ls-q-first', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: prog(asg('a', '["А", "Б", "В"]'), show('a[1]')), out: 'Б',
      options: [{ text: 'Б', correct: true }, { text: 'А' }, { text: 'В' }, { text: 'Ошибка' }], explain: 'Номера начинаются с нуля: a[0] — А, a[1] — Б.' };
    qs['ls-q-len'] = { kind: 'mcq', card: 'ls-q-len', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: prog(asg('a', '[4, 8, 15, 16]'), show(LEN('a'))), out: '4',
      options: [{ text: '4', correct: true }, { text: '3' }, { text: '16' }, { text: '43' }], explain: (py ? 'len' : '.length') + ' — количество элементов. Их четыре, хотя последний номер — 3.' };
    qs['ls-q-last'] = { kind: 'mcq', card: 'ls-q-last', tag: 'Вспомни', why: 'retrieval', q: 'В списке 5 элементов. Какой номер у последнего?',
      options: [{ text: '4', correct: true }, { text: '5' }, { text: '0' }, { text: '6' }], explain: 'Номера идут 0, 1, 2, 3, 4. Последний на единицу меньше количества.' };
    qs['ls-q-add'] = { kind: 'mcq', card: 'ls-q-add', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: prog(asg('a', '[1, 2]'), ADD('a', '3'), show(LEN('a'))), out: '3',
      options: [{ text: '3', correct: true }, { text: '2' }, { text: '6' }, { text: 'Ошибка' }], explain: (py ? 'append' : 'push') + ' добавил элемент в конец, стало три элемента.' };
    qs['ls-q-loop'] = { kind: 'mcq', card: 'ls-q-loop', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: prog(asg('total', '0'), each('x', '[2, 3, 5]', set('total', 'total + x')), show('total')), out: '10',
      options: [{ text: '10', correct: true }, { text: '5' }, { text: '235' }, { text: '2, 3, 5' }], explain: 'Цикл по очереди прибавил 2, 3 и 5. Вывод после цикла показал итог — 10.' };

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — много значений под одним именем',
      lead: 'Переменная хранит одно значение. Список хранит сразу несколько, по порядку: покупки, оценки, этажи дома.',
      flow: { code: prog(asg('fruits', FR), show('fruits[0]')), out: 'яблоко' },
      points: ['Угадаешь, какой элемент достанет программа', 'Поймёшь, почему счёт с нуля', 'Добавишь элемент и пройдёшь по списку циклом', 'Посчитаешь сумму покупок'], foot: '≈ 20 минут.',
      simple: 'Список — как подъезд: у каждой квартиры свой номер, а все вместе они под одной крышей. Только нумерация в программировании начинается с нуля.' });
    steps.push({ id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Сначала угадай', question: 'Что выведет эта программа?',
      code: prog(asg('fruits', FR), show('fruits[1]')), expected: 'груша',
      options: [{ id: 'a', text: 'груша', correct: true }, { id: 'b', text: 'яблоко' }, { id: 'c', text: 'слива' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: номера начинаются с нуля, поэтому fruits[1] — второй элемент.', bad: 'Почти все сначала отвечают «яблоко». Но номера в списке начинаются с нуля: fruits[0] — яблоко, fruits[1] — груша.', dk: 'Номера начинаются с нуля: fruits[0] — первый элемент, fruits[1] — второй.' } });
    steps.push({ id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true, title: 'Разбери запись списка', lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: (py ? [] : [{ key: 'kw', text: 'let' }]).concat([{ key: 'name', text: (py ? '' : ' ') + 'fruits' }, { key: 'eq', text: ' = ' }, { key: 'paren', text: '[' }, { key: 'value', text: '"яблоко", "груша"' }, { key: 'paren', text: ']' }]),
      roles: { kw: { role: 'Слово «создать»', desc: 'Как и с обычной переменной, let пишут один раз.' }, name: { role: 'Имя списка', desc: 'Одно имя на все элементы. Обычно во множественном числе: fruits, prices.' }, eq: { role: 'Знак «запомни»', desc: 'Справа — что запомнить под этим именем.' }, paren: { role: 'Квадратные скобки', desc: 'Открывают и закрывают список.' }, value: { role: 'Элементы', desc: 'Значения через запятую. Каждое получает свой номер: 0, 1, 2…' } },
      summary: 'Итого: имя + квадратные скобки + элементы через запятую. Достать элемент: имя[номер].' });
    steps.push({ id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true, title: 'Собери программу',
      lead: 'Собери программу, которая выводит каждый фрукт на своей строке. Одна строка лишняя.',
      tokens: py ? ['fruits = ["яблоко", "груша"]', 'for f in fruits:', '    print(f)', '    print(fruits)'] : ['let fruits = ["яблоко", "груша"];', 'for (const f of fruits) {', '  console.log(f);', '}', '  console.log(fruits);'],
      solutions: [py ? ['fruits = ["яблоко", "груша"]', 'for f in fruits:', '    print(f)'] : ['let fruits = ["яблоко", "груша"];', 'for (const f of fruits) {', '  console.log(f);', '}']],
      tipIf: (function () { var o = {}; o[py ? '    print(fruits)' : '  console.log(fruits);'] = 'Эта строка выведет весь список целиком на каждом круге, а нужен один элемент — f.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Начни со списка: цикл идёт по нему.' : 'Порядок: список, строка с for, вывод одного элемента.'; },
      okText: 'Цикл for по списку на каждом круге кладёт в f следующий элемент.', hint: 'Список, потом for, внутри — вывод f.' });
    steps.push(Object.assign({ id: 'fill', novice: true }, defs['ls-fill']));
    steps.push({ id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Сколько элементов?', question: 'Что выведет эта программа?',
      code: prog(asg('fruits', FR), show(LEN('fruits'))), expected: '3',
      options: [{ id: 'a', text: '3', correct: true }, { id: 'b', text: '2' }, { id: 'c', text: 'слива' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: элементов три, хотя последний номер — 2.', bad: (py ? 'len' : '.length') + ' считает элементы, а не номера. Элементов три.', dk: (py ? 'len' : '.length') + ' — количество элементов: здесь три.' } });
    steps.push({ id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify', title: 'Добавь в список',
      prompt: 'Программа выводит количество фруктов: 3. Добавь в список четвёртый фрукт — киви, чтобы вывелось 4.',
      starter: prog(asg('fruits', FR), show(LEN('fruits'))), expect: '4', unchangedMsg: 'Добавь «киви» в квадратные скобки или командой добавления — и запусти снова.',
      validate: function (out, code) {
        var r = k.outOk(out, '4'); if (!r.ok) return r;
        if (code.indexOf('киви') === -1) return { ok: false, msg: 'Добавь в список именно «киви».' };
        if (!k.has(code, py ? /len\(/ : /\.length/)) return { ok: false, msg: 'Не вписывай 4 руками: пусть программа считает элементы сама.' };
        return { ok: true };
      },
      hints: ['Элементы перечисляются через запятую внутри квадратных скобок.', 'Можно дописать "киви" в скобки или добавить командой ' + (py ? 'append' : 'push') + '.', asg('fruits', '["яблоко", "груша", "слива", "киви"]')],
      solution: prog(asg('fruits', '["яблоко", "груша", "слива", "киви"]'), show(LEN('fruits'))) });
    steps.push(Object.assign({ id: 'debug1' }, defs['ls-debug-index']));
    steps.push(Object.assign({ id: 'debug2' }, defs['ls-debug-add']));
    steps.push(Object.assign({ id: 'make1' }, defs['ls-write-each']));
    steps.push(Object.assign({ id: 'make2' }, defs['ls-write-sum'], { simple: 'Это та же копилка, что в уроке про for. Только теперь цикл проходит не по числам 1–5, а по ценам из списка.' }));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['ls-q-first'], qs['ls-q-len'], qs['ls-q-last'], qs['ls-q-add'], qs['ls-q-loop']] });
    steps.push({ id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-lists', title: 'Объясни своими словами',
      prompt: 'Объясни другу: что такое список, почему первый элемент — номер 0, и что выведет эта программа?', code: prog(asg('a', '[7, 8, 9]'), show('a[0] + a[2]')), min: 40,
      model: 'Список хранит несколько значений под одним именем, у каждого свой номер. Номера начинаются с нуля, поэтому a[0] — это 7, а a[2] — 9. Программа сложит их и выведет 16.' });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Списки освоены', rosetta: false, lead: 'Теперь ты хранишь сразу много значений и обходишь их циклом. Почти любая программа работает со списками: товары, сообщения, этажи, модули дома.' });
    return { id: 'lists', title: 'Списки: много значений под одним именем', day: 6, minutes: 20, steps: steps, cards: Object.assign({}, defs, qs), lang: lang };
  }

  /* ======================= День 7: функции ======================= */
  function buildFuncs(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, show = k.show, prog = k.prog;
    var fn = function (name, args, body) { return (py ? 'def ' + name + '(' + args + '):' : 'function ' + name + '(' + args + ') {') + '\n' + k.ind(body) + (py ? '' : '\n}'); };
    var ret = function (x) { return 'return ' + x + k.END; };
    var call = function (x) { return x + k.END; };
    var GREET = fn('greet', 'name', show('"Привет, " + name'));
    var AREA = fn('area', 'w, h', ret('w * h'));
    var hasDef = function (code, name) { return k.has(code, py ? new RegExp('\\bdef\\s+' + name + '\\s*\\(') : new RegExp('\\bfunction\\s+' + name + '\\s*\\(|\\b' + name + '\\s*=\\s*(\\([^)]*\\)|\\w+)\\s*=>')); };

    var defs = {};
    defs['fn-fill'] = {
      kind: 'fill', card: 'fn-fill', tag: 'Заполни пропуски', why: 'completion',
      title: 'Верни результат', prompt: 'Функция double должна отдавать число, умноженное на 2. Впиши слово, которое отдаёт результат.',
      tpl: py ? ['def double(x): ', { b: 0 }, ' x * 2'] : ['function double(x) { ', { b: 0 }, ' x * 2; }'],
      blanks: [{ accept: ['return'], label: 'слово' }],
      okText: 'return отдаёт результат туда, откуда функцию вызвали.', hintText: 'Это слово по-английски значит «вернуть».'
    };
    defs['fn-debug-return'] = {
      kind: 'code', mode: 'debug', card: 'fn-debug-return', tag: 'Найди ошибку', why: 'debug',
      title: 'Функция молчит', prompt: 'double(4) должна дать 8, а программа выводит ' + (py ? 'None' : 'undefined') + '. Исправь функцию.',
      starter: prog(fn('double', 'x', call('x * 2')), '', show('double(4)')), expect: '8',
      preface: 'Функция посчитала x * 2, но никому не отдала результат. Без return она возвращает «ничего».',
      hints: ['Что функция делает с результатом x * 2?', 'Чтобы отдать результат, нужно слово return.', 'Строка внутри функции: ' + ret('x * 2')],
      solution: prog(fn('double', 'x', ret('x * 2')), '', show('double(4)'))
    };
    defs['fn-debug-args'] = {
      kind: 'code', mode: 'debug', card: 'fn-debug-args', tag: 'Найди ошибку', why: 'debug',
      title: 'Не хватает значения', prompt: 'Площадь комнаты 3 на 4 должна быть 12. Программа ' + (py ? 'падает с ошибкой' : 'выводит NaN') + '. Исправь вызов.',
      starter: prog(AREA, '', show('area(3)')), expect: '12',
      hints: ['Сколько значений ждёт функция area в скобках?', 'Функция ждёт два значения: ширину и длину.', 'Вызов должен быть таким: area(3, 4)'],
      solution: prog(AREA, '', show('area(3, 4)'))
    };
    defs['fn-write-square'] = {
      kind: 'code', mode: 'write', card: 'fn-write-square', tag: 'Напиши сам', why: 'make',
      title: 'Квадрат числа', prompt: 'Напиши функцию square, которая возвращает число, умноженное само на себя. Выведи square(7).',
      starter: '', expect: '49',
      validate: function (out, code) {
        var r = k.outOk(out, '49'); if (!r.ok) return r;
        if (!hasDef(code, 'square')) return { ok: false, msg: 'Создай функцию: ' + (py ? 'def square(n):' : 'function square(n) {') };
        if (!k.has(code, /\breturn\b/) && !(!py && /=>/.test(code))) return { ok: false, msg: 'Функция должна вернуть результат через return.' };
        if (!k.has(code, /square\s*\(\s*7\s*\)/)) return { ok: false, msg: 'Вызови функцию: square(7)' };
        return { ok: true };
      },
      hints: ['Сначала опиши функцию, потом вызови её.', 'Внутри одна строка: ' + ret('n * n'), 'Каркас:\n' + prog(fn('square', 'n', ret('...')), '', show('square(7)'))],
      solution: prog(fn('square', 'n', ret('n * n')), '', show('square(7)'))
    };
    defs['fn-write-max'] = {
      kind: 'code', mode: 'write', card: 'fn-write-max', tag: 'Напиши сам', why: 'make',
      title: 'Большее из двух', prompt: 'Напиши функцию bigger(a, b), которая возвращает большее из двух чисел. Выведи bigger(8, 3), а на следующей строке bigger(2, 9).',
      starter: '', expect: '8\n9',
      validate: function (out, code) {
        var r = k.outOk(out, '8\n9'); if (!r.ok) return r;
        if (!hasDef(code, 'bigger')) return { ok: false, msg: 'Создай функцию bigger.' };
        if (!k.has(code, /\breturn\b/)) return { ok: false, msg: 'Функция должна вернуть ответ через return.' };
        if (!k.has(code, /\bif\b/) && !k.has(code, /\bmax\s*\(/) && !k.has(code, /\?/)) return { ok: false, msg: 'Пусть функция сама выбирает большее: сравни a и b через if.' };
        return { ok: true };
      },
      hints: ['Внутри функции сравни a и b.', 'Если a > b — верни a, иначе — верни b.', 'Каркас:\n' + fn('bigger', 'a, b', k.iff('a > b', ret('a'), ret('b')))],
      solution: prog(fn('bigger', 'a, b', k.iff('a > b', ret('a'), ret('b'))), '', show('bigger(8, 3)'), show('bigger(2, 9)'))
    };

    var qs = {};
    qs['fn-q-call'] = { kind: 'mcq', card: 'fn-q-call', tag: 'Вспомни', why: 'retrieval', q: 'Сколько раз выведется «Привет»?', code: prog(fn('hi', '', show('"Привет"')), '', call('hi()'), call('hi()')), out: 'Привет\nПривет',
      options: [{ text: 'Два', correct: true }, { text: 'Один' }, { text: 'Три' }, { text: 'Ни разу' }], explain: 'Описание функции само ничего не делает. Каждый вызов hi() выполняет её заново — вызовов два.' };
    qs['fn-q-define'] = { kind: 'mcq', card: 'fn-q-define', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: fn('hi', '', show('"Привет"')),
      out: '', options: [{ text: 'Ничего', correct: true }, { text: 'Привет' }, { text: 'hi' }, { text: 'Ошибка' }], explain: 'Функция только описана, но её ни разу не вызвали. Значит, команды внутри не выполнились.' };
    qs['fn-q-return'] = { kind: 'mcq', card: 'fn-q-return', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: prog(fn('add', 'a, b', ret('a + b')), '', show('add(2, 3) * 10')), out: '50',
      options: [{ text: '50', correct: true }, { text: '5' }, { text: '23' }, { text: '2310' }], explain: 'add(2, 3) вернула 5, и уже это число умножилось на 10.' };
    qs['fn-q-param'] = { kind: 'mcq', card: 'fn-q-param', tag: 'Вспомни', why: 'retrieval', q: 'Что такое name в строке ' + (py ? 'def greet(name):' : 'function greet(name) {') + '?',
      options: [{ text: 'Параметр: имя для значения, которое передадут при вызове', correct: true }, { text: 'Название функции' }, { text: 'Текст, который выведется' }, { text: 'Ошибка: так писать нельзя' }], explain: 'Параметр — это переменная функции. При вызове greet("Аян") в name окажется «Аян».' };
    qs['fn-q-why'] = { kind: 'mcq', card: 'fn-q-why', tag: 'Вспомни', why: 'retrieval', q: 'Зачем нужны функции?',
      options: [{ text: 'Чтобы написать действие один раз и вызывать его много раз', correct: true }, { text: 'Чтобы программа работала без компьютера' }, { text: 'Они нужны только для вывода текста' }, { text: 'Чтобы заменить переменные' }], explain: 'Функция — это действие с именем. Её пишут один раз, а пользуются сколько угодно, с разными значениями.' };

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — свои команды',
      lead: 'Ты уже пользовался чужими командами: ' + k.OUT + ', ' + (py ? 'len' : 'push') + '. Функция — это твоя команда: один раз описал, дальше вызываешь по имени.',
      flow: { code: prog(GREET, '', call('greet("Аян")')), out: 'Привет, Аян' },
      points: ['Опишешь функцию и вызовешь её', 'Передашь в неё значения', 'Научишь её возвращать результат', 'Напишешь функцию, которая сама выбирает'], foot: '≈ 20 минут.',
      simple: 'Функция — как рецепт с названием. Ты один раз записал «как сварить чай», а потом просто говоришь «свари чай» — и неважно, для кого: для себя или для гостя.' });
    steps.push({ id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Сначала угадай', question: 'Что выведет эта программа?',
      code: prog(GREET, '', call('greet("Аян")'), call('greet("Алия")')), expected: 'Привет, Аян\nПривет, Алия',
      options: [{ id: 'a', text: 'Привет, Аян и Привет, Алия', correct: true }, { id: 'b', text: 'Только Привет, Аян' }, { id: 'c', text: 'Привет, name' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: функцию вызвали дважды, и каждый раз в name попадало своё имя.', bad: 'Функцию вызвали два раза. При каждом вызове в name попадает то, что стоит в скобках: сначала «Аян», потом «Алия».', dk: 'Каждый вызов выполняет функцию заново, а в name попадает значение из скобок.' } });
    steps.push({ id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true, title: 'Разбери описание функции', lead: 'Нажми на каждую часть — узнаешь её роль.',
      parts: py ? [{ key: 'kw', text: 'def' }, { key: 'name', text: ' greet' }, { key: 'paren', text: '(name)' }, { key: 'colon', text: ':' }] : [{ key: 'kw', text: 'function' }, { key: 'name', text: ' greet' }, { key: 'paren', text: '(name)' }, { key: 'brace', text: ' {' }],
      roles: { kw: { role: 'Слово «функция»', desc: py ? 'def — сокращение от define, «описать».' : 'function — «функция».' }, name: { role: 'Имя функции', desc: 'По нему функцию потом вызывают: greet(…).' }, paren: { role: 'Параметры', desc: 'В скобках — имена для значений, которые передадут при вызове. Их может не быть совсем: ().' }, colon: { role: 'Двоеточие', desc: 'Дальше с отступом — тело функции: что она делает.' }, brace: { role: 'Фигурная скобка', desc: 'Открывает тело функции; в конце его закрывает }.' } },
      summary: 'Итого: описание ничего не выполняет. Команды внутри сработают только при вызове: greet("Аян").' });
    steps.push({ id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true, title: 'Собери программу',
      lead: 'Собери программу, которая описывает функцию и вызывает её. Одна строка лишняя.',
      tokens: py ? ['def hello():', '    print("Привет")', 'hello()', 'hello'] : ['function hello() {', '  console.log("Привет");', '}', 'hello();', 'hello;'],
      solutions: [py ? ['def hello():', '    print("Привет")', 'hello()'] : ['function hello() {', '  console.log("Привет");', '}', 'hello();']],
      tipIf: (function () { var o = {}; o[py ? 'hello' : 'hello;'] = 'Без скобок функция не вызывается — это просто её имя.'; return o; })(),
      failMsg: function (r) { return r.wrongAt === 0 ? 'Начни с описания функции.' : 'Порядок: описание, тело, вызов со скобками.'; },
      okText: 'Сначала описали, потом вызвали — со скобками.', hint: 'Строка с ' + (py ? 'def' : 'function') + ', потом тело, потом вызов hello().' });
    steps.push(Object.assign({ id: 'fill', novice: true }, defs['fn-fill']));
    steps.push({ id: 'predict2', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Вывести или вернуть?', question: 'Что выведет эта программа?',
      code: prog(fn('double', 'x', ret('x * 2')), '', show('double(5) + 1')), expected: '11',
      options: [{ id: 'a', text: '11', correct: true }, { id: 'b', text: '10' }, { id: 'c', text: '6' }, { id: 'd', text: 'Ошибка' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: double(5) вернула 10, и с этим числом можно дальше считать.', bad: 'return отдаёт результат наружу. double(5) превратилась в 10, к нему прибавили 1 — получилось 11.', dk: 'double(5) вернула 10, к нему прибавили 1 — 11.' } });
    steps.push({ id: 'modify', kind: 'code', mode: 'modify', tag: 'Измени', why: 'modify', title: 'Другая комната',
      prompt: 'Функция area считает площадь. Сейчас выводится площадь комнаты 3 на 4. Поменяй вызов так, чтобы вывелась площадь комнаты 5 на 6.',
      starter: prog(AREA, '', show('area(3, 4)')), expect: '30', unchangedMsg: 'Поменяй числа в вызове area(…) — и запусти снова.',
      validate: function (out, code) {
        var r = k.outOk(out, '30'); if (!r.ok) return r;
        if (!k.has(code, /area\s*\(\s*5\s*,\s*6\s*\)|area\s*\(\s*6\s*,\s*5\s*\)/)) return { ok: false, msg: 'Посчитай через функцию: area(5, 6).' };
        return { ok: true };
      },
      hints: ['Функцию трогать не нужно — только вызов.', 'Числа в скобках вызова — это w и h.', show('area(5, 6)')],
      solution: prog(AREA, '', show('area(5, 6)')) });
    steps.push(Object.assign({ id: 'debug1' }, defs['fn-debug-return']));
    steps.push(Object.assign({ id: 'debug2' }, defs['fn-debug-args']));
    steps.push(Object.assign({ id: 'make1' }, defs['fn-write-square']));
    steps.push(Object.assign({ id: 'make2' }, defs['fn-write-max'], { simple: 'Внутри функции можно всё, что ты уже знаешь: условия, циклы, списки. Здесь — условие из Дня 3, только вместо вывода стоит return.' }));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Пять вопросов по памяти. Перед ответом отметь, насколько ты уверен.',
      questions: [qs['fn-q-call'], qs['fn-q-define'], qs['fn-q-return'], qs['fn-q-param'], qs['fn-q-why']] });
    steps.push({ id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-funcs', title: 'Объясни своими словами',
      prompt: 'Объясни другу: что делает эта программа по шагам и чем return отличается от вывода?', code: prog(AREA, '', show('area(2, 3) + area(1, 4)')), min: 40,
      model: 'Функция area принимает ширину и длину и возвращает их произведение. area(2, 3) возвращает 6, area(1, 4) — 4. Эти числа складываются, и выводится 10. return отдаёт число программе, чтобы с ним можно было считать дальше, а вывод только показывает его на экране.' });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Функции освоены', rosetta: false, lead: 'Переменные, условия, циклы, списки и функции — основа любой программы. Дальше это всё складывается в настоящие проекты, например в калькулятор сметы.' });
    return { id: 'funcs', title: 'Функции: свои команды', day: 7, minutes: 20, steps: steps, cards: Object.assign({}, defs, qs), lang: lang };
  }

  /* ======================= HTML ======================= */
  function htmlText(el) { return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function sameText(a, b) { return a.replace(/[.!]+$/, '').toLowerCase() === b.replace(/[.!]+$/, '').toLowerCase(); }
  function htmlMcq(id, q, code, options, explain) { return { kind: 'mcq', card: id, tag: 'Вспомни', why: 'retrieval', q: q, code: code, codeLang: 'html', options: options, explain: explain }; }

  function buildHtml1() {
    var defs = {};
    defs['h-h1'] = { kind: 'html', card: 'h-h1', tag: 'Напиши сам', title: 'Первый заголовок', prompt: 'Сделай на странице главный заголовок с текстом: Мой первый сайт',
      starter: '', hints: ['Главный заголовок — тег h1.', 'Открывающий тег, текст, закрывающий тег со слешем.', '<h1>…</h1>'], solution: '<h1>Мой первый сайт</h1>',
      validate: function (doc) {
        var h1 = doc.querySelector('h1');
        if (!h1) return { ok: false, msg: 'На странице нет тега h1. Главный заголовок пишут так: <h1>текст</h1>' };
        if (!sameText(htmlText(h1), 'Мой первый сайт')) return { ok: false, msg: 'В заголовке должно быть ровно: Мой первый сайт. Сейчас: ' + (htmlText(h1) || 'пусто') + '.' };
        return { ok: true };
      } };
    defs['h-p'] = { kind: 'html', card: 'h-p', tag: 'Измени', title: 'Второй абзац', prompt: 'Под первым абзацем добавь второй с текстом: Я учу HTML.',
      starter: '<h1>Обо мне</h1>\n<p>Меня зовут Аян.</p>\n', hints: ['Каждый абзац — свой тег p.', 'Новый абзац: <p>…</p> на новой строке.', '<p>Я учу HTML.</p>'], solution: '<h1>Обо мне</h1>\n<p>Меня зовут Аян.</p>\n<p>Я учу HTML.</p>',
      validate: function (doc) {
        var ps = doc.querySelectorAll('p');
        if (ps.length < 2) return { ok: false, msg: 'Абзацев должно быть два. Каждый — в своём теге p.' };
        if (!Array.prototype.some.call(ps, function (p) { return sameText(htmlText(p), 'Я учу HTML'); })) return { ok: false, msg: 'Во втором абзаце должен быть текст: Я учу HTML.' };
        return { ok: true };
      } };
    defs['h-close'] = { kind: 'html', card: 'h-close', tag: 'Найди ошибку', title: 'Всё стало огромным', prompt: 'Абзац должен быть обычным текстом, а он стал таким же крупным, как заголовок. Найди и исправь ошибку.',
      preface: 'Браузер не ругается на ошибки в HTML. Он молча пытается угадать, что ты имел в виду, — и часто угадывает не так.',
      starter: '<h1>Заголовок\n<p>Обычный абзац текста.</p>\n', hints: ['Посмотри, где заканчивается заголовок.', 'У h1 нет закрывающего тега, поэтому абзац оказался внутри заголовка.', 'После слова «Заголовок» допиши </h1>.'], solution: '<h1>Заголовок</h1>\n<p>Обычный абзац текста.</p>\n',
      validate: function (doc) {
        var h1 = doc.querySelector('h1');
        if (!h1) return { ok: false, msg: 'Заголовок h1 пропал — верни его.' };
        if (h1.querySelector('p')) return { ok: false, msg: 'Абзац всё ещё внутри заголовка. Закрой h1 до начала абзаца.' };
        if (!doc.querySelector('p')) return { ok: false, msg: 'Абзац p пропал — верни его.' };
        return { ok: true };
      } };
    defs['h-levels'] = { kind: 'html', card: 'h-levels', tag: 'Напиши сам', title: 'Уровни заголовков', prompt: 'Сделай главный заголовок «Рецепт», а под ним заголовок второго уровня «Ингредиенты».',
      starter: '', hints: ['Главный заголовок — h1, второго уровня — h2.', 'Сначала h1, потом h2.', '<h1>Рецепт</h1>\n<h2>…</h2>'], solution: '<h1>Рецепт</h1>\n<h2>Ингредиенты</h2>',
      validate: function (doc) {
        var h1 = doc.querySelector('h1'), h2 = doc.querySelector('h2');
        if (!h1 || !sameText(htmlText(h1), 'Рецепт')) return { ok: false, msg: 'Нужен главный заголовок h1 с текстом «Рецепт».' };
        if (!h2 || !sameText(htmlText(h2), 'Ингредиенты')) return { ok: false, msg: 'Нужен заголовок второго уровня h2 с текстом «Ингредиенты».' };
        if (h1.compareDocumentPosition(h2) & 2) return { ok: false, msg: 'Главный заголовок должен стоять выше второго.' };
        return { ok: true };
      } };
    var qs = {};
    qs['h-q-tag'] = htmlMcq('h-q-tag', 'Что такое тег в HTML?', null, [{ text: 'Метка в угловых скобках, которая говорит, что это за часть страницы', correct: true }, { text: 'Цвет текста' }, { text: 'Адрес сайта' }, { text: 'Команда, которая считает числа' }], 'Тег — это метка: <h1> значит «заголовок», <p> — «абзац». Браузер по тегам решает, как показать текст.');
    qs['h-q-close'] = htmlMcq('h-q-close', 'Чем закрывающий тег отличается от открывающего?', '<p>Текст</p>', [{ text: 'Перед именем стоит слеш: </p>', correct: true }, { text: 'Он пишется заглавными буквами' }, { text: 'Ничем' }, { text: 'Он в круглых скобках' }], 'Закрывающий тег повторяет имя открывающего, но со слешем: <p> … </p>.');
    qs['h-q-see'] = htmlMcq('h-q-see', 'Что увидит человек на странице?', '<p>Привет!</p>', [{ text: 'Привет!', correct: true }, { text: '<p>Привет!</p>' }, { text: 'p Привет! p' }, { text: 'Пустую страницу' }], 'Теги браузер не показывает: он использует их как указания. На экране только текст.');
    qs['h-q-h1'] = htmlMcq('h-q-h1', 'Какой заголовок по умолчанию самый крупный?', null, [{ text: 'h1', correct: true }, { text: 'h6' }, { text: 'h3' }, { text: 'Все одинаковые' }], 'Заголовки идут от h1 до h6 — от главного к самому мелкому. Как в оглавлении книги: глава, раздел, подраздел.');
    qs['h-q-forgive'] = htmlMcq('h-q-forgive', 'Что делает браузер, если в HTML есть ошибка?', null, [{ text: 'Молча пытается угадать и показывает страницу как получится', correct: true }, { text: 'Показывает сообщение об ошибке' }, { text: 'Не открывает страницу' }, { text: 'Исправляет ошибку в файле' }], 'В отличие от Python и JavaScript, HTML не падает с ошибкой. Поэтому ошибку видно только по тому, как выглядит страница.');

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня ты сделаешь первую веб-страницу',
      lead: 'Любая страница в интернете — это текст с метками-тегами. Метки говорят браузеру: это заголовок, это абзац, это картинка.',
      flow: { code: '<h1>Привет!</h1>\n<p>Это моя страница.</p>', out: 'Привет!\nЭто моя страница.' },
      points: ['Поймёшь, что такое тег', 'Сделаешь заголовок и абзацы', 'Починишь незакрытый тег', 'Увидишь результат сразу, как в браузере'], foot: '≈ 15 минут. Справа от редактора — живой просмотр страницы.',
      simple: 'HTML — не язык программирования: он ничего не считает. Это разметка, как пометки маркером в тексте: «это заголовок», «это абзац».' });
    steps.push(Object.assign({ id: 'see' }, qs['h-q-see'], { title: 'Сначала угадай' }));
    steps.push({ id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true, title: 'Разбери элемент', lead: 'Нажми на каждую часть.',
      parts: [{ key: 'kw', text: '<h1>' }, { key: 'value', text: 'Привет!' }, { key: 'semi', text: '</h1>' }],
      roles: { kw: { role: '1 · Открывающий тег', desc: 'Имя тега в угловых скобках: здесь начинается заголовок.' }, value: { role: '2 · Содержимое', desc: 'То, что человек увидит на странице.' }, semi: { role: '3 · Закрывающий тег', desc: 'То же имя, но со слешем: здесь заголовок заканчивается.' } },
      summary: 'Итого: открыл тег — написал содержимое — закрыл тот же тег. Вместе это называется элемент.' });
    steps.push({ id: 'parsons', kind: 'parsons', tag: 'Собери из блоков', why: 'parsons', novice: true, card: null, lines: true, title: 'Собери страницу',
      lead: 'Собери страницу: сверху заголовок «Мой город», под ним абзац. Одна строка лишняя.',
      tokens: ['<h1>Мой город</h1>', '<p>Усть-Каменогорск стоит на Иртыше.</p>', '<p>Мой город</h1>'], solutions: [['<h1>Мой город</h1>', '<p>Усть-Каменогорск стоит на Иртыше.</p>']],
      tipIf: { '<p>Мой город</h1>': 'Тег открыт как p, а закрыт как h1. Открывающий и закрывающий теги должны совпадать.' },
      failMsg: function () { return 'Сверху — заголовок, под ним — абзац.'; }, okText: 'Браузер показывает элементы сверху вниз, в том же порядке, что в разметке.', hint: 'Сначала h1, потом p.' });
    steps.push(Object.assign({ id: 'make1' }, defs['h-h1']));
    steps.push(Object.assign({ id: 'modify' }, defs['h-p']));
    steps.push(Object.assign({ id: 'debug1' }, defs['h-close']));
    steps.push(Object.assign({ id: 'make2' }, defs['h-levels']));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Четыре вопроса по памяти.', questions: [qs['h-q-tag'], qs['h-q-close'], qs['h-q-h1'], qs['h-q-forgive']] });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Первая страница готова', rosetta: false, lead: 'Ты знаешь, что такое тег, и умеешь делать заголовки и абзацы. В песочнице теперь есть вкладка HTML — там можно верстать что угодно.' });
    return { id: 'html1', title: 'Первая страница: теги', day: 1, minutes: 15, steps: steps, cards: Object.assign({}, defs, qs), keyLang: 'all', stepLang: 'html', track: 'html' };
  }

  function buildHtml2() {
    var defs = {};
    var LIST = '<ul>\n  <li>Хлеб</li>\n  <li>Молоко</li>\n</ul>';
    defs['h-ul'] = { kind: 'html', card: 'h-ul', tag: 'Напиши сам', title: 'Список покупок', prompt: 'Сделай маркированный список из трёх пунктов: Хлеб, Молоко, Яйца.',
      starter: '', hints: ['Весь список — тег ul, каждый пункт — тег li.', 'Пункты li стоят внутри ul.', LIST], solution: '<ul>\n  <li>Хлеб</li>\n  <li>Молоко</li>\n  <li>Яйца</li>\n</ul>',
      validate: function (doc) {
        var ul = doc.querySelector('ul');
        if (!ul) return { ok: false, msg: 'Нужен список: тег ul.' };
        var li = ul.querySelectorAll('li'), want = ['Хлеб', 'Молоко', 'Яйца'];
        if (li.length !== 3) return { ok: false, msg: 'Пунктов li внутри ul должно быть три, сейчас: ' + li.length + '.' };
        for (var i = 0; i < 3; i++) if (!sameText(htmlText(li[i]), want[i])) return { ok: false, msg: 'Пункт ' + (i + 1) + ' должен быть «' + want[i] + '».' };
        return { ok: true };
      } };
    defs['h-ol'] = { kind: 'html', card: 'h-ol', tag: 'Напиши сам', title: 'Нумерованный список', prompt: 'Шаги важны по порядку. Сделай нумерованный список: Измерить комнату, Начертить план, Посчитать площадь.',
      starter: '', hints: ['Нумерованный список — ol (ordered list).', 'Внутри — те же li.', '<ol>\n  <li>…</li>\n</ol>'], solution: '<ol>\n  <li>Измерить комнату</li>\n  <li>Начертить план</li>\n  <li>Посчитать площадь</li>\n</ol>',
      validate: function (doc) {
        var ol = doc.querySelector('ol');
        if (!ol) return { ok: false, msg: doc.querySelector('ul') ? 'Это маркированный список ul. Для номеров нужен ol.' : 'Нужен нумерованный список: тег ol.' };
        if (ol.querySelectorAll('li').length !== 3) return { ok: false, msg: 'Пунктов li должно быть три.' };
        return { ok: true };
      } };
    defs['h-a'] = { kind: 'html', card: 'h-a', tag: 'Напиши сам', title: 'Ссылка', prompt: 'Сделай ссылку с текстом «Википедия», которая ведёт на https://ru.wikipedia.org',
      starter: '', hints: ['Ссылка — тег a.', 'Куда ведёт — в атрибуте href, в кавычках.', '<a href="https://ru.wikipedia.org">…</a>'], solution: '<a href="https://ru.wikipedia.org">Википедия</a>',
      validate: function (doc) {
        var a = doc.querySelector('a');
        if (!a) return { ok: false, msg: 'Нужна ссылка: тег a.' };
        var href = (a.getAttribute('href') || '').replace(/\/+$/, '');
        if (href !== 'https://ru.wikipedia.org') return { ok: false, msg: 'Адрес в href должен быть https://ru.wikipedia.org — сейчас: ' + (href || 'пусто') + '.' };
        if (!sameText(htmlText(a), 'Википедия')) return { ok: false, msg: 'Текст ссылки должен быть «Википедия».' };
        return { ok: true };
      } };
    defs['h-img'] = { kind: 'html', card: 'h-img', tag: 'Напиши сам', title: 'Картинка с описанием', prompt: 'Вставь картинку из файла house.jpg с описанием «Мой дом». Файла нет — браузер покажет описание вместо картинки, так и должно быть.',
      starter: '', hints: ['Картинка — тег img. Закрывающего тега у него нет.', 'Файл — в атрибуте src, описание — в alt.', '<img src="house.jpg" alt="…">'], solution: '<img src="house.jpg" alt="Мой дом">',
      validate: function (doc) {
        var img = doc.querySelector('img');
        if (!img) return { ok: false, msg: 'Нужен тег img.' };
        if ((img.getAttribute('src') || '') !== 'house.jpg') return { ok: false, msg: 'Файл указывают в src: src="house.jpg".' };
        if (!sameText((img.getAttribute('alt') || '').trim(), 'Мой дом')) return { ok: false, msg: 'Добавь описание: alt="Мой дом". Его читают программы для незрячих и показывают, если картинка не загрузилась.' };
        return { ok: true };
      } };
    defs['h-href'] = { kind: 'html', card: 'h-href', tag: 'Найди ошибку', title: 'Ссылка не нажимается', prompt: 'Текст выглядит как обычный, и по нему нельзя перейти. Исправь, чтобы ссылка вела на https://ru.wikipedia.org',
      starter: '<a>Википедия</a>\n', hints: ['Чего не хватает тегу a?', 'Без атрибута href браузер не знает, куда вести.', '<a href="https://ru.wikipedia.org">Википедия</a>'], solution: '<a href="https://ru.wikipedia.org">Википедия</a>\n',
      validate: function (doc) { return defs['h-a'].validate(doc); } };
    var qs = {};
    qs['h-q-ulol'] = htmlMcq('h-q-ulol', 'Чем ul отличается от ol?', null, [{ text: 'ul — с точками, ol — с номерами', correct: true }, { text: 'ul — для ссылок, ol — для картинок' }, { text: 'Ничем' }, { text: 'ol нельзя вкладывать в страницу' }], 'ul — unordered list, неупорядоченный: пункты с точками. ol — ordered list: пункты с номерами.');
    qs['h-q-li'] = htmlMcq('h-q-li', 'Какой тег у одного пункта списка?', null, [{ text: 'li', correct: true }, { text: 'ul' }, { text: 'p' }, { text: 'item' }], 'li — list item, пункт списка. Он всегда стоит внутри ul или ol.');
    qs['h-q-href'] = htmlMcq('h-q-href', 'Где у ссылки указан адрес, куда она ведёт?', '<a href="https://kaz.kz">Сайт</a>', [{ text: 'В атрибуте href', correct: true }, { text: 'В тексте между тегами' }, { text: 'В закрывающем теге' }, { text: 'Адрес не нужен' }], 'Атрибут — это дополнительная настройка внутри открывающего тега. href говорит, куда вести.');
    qs['h-q-alt'] = htmlMcq('h-q-alt', 'Зачем картинке атрибут alt?', null, [{ text: 'Описание: его читают программы для незрячих и показывают, если картинка не загрузилась', correct: true }, { text: 'Это размер картинки' }, { text: 'Это адрес файла' }, { text: 'Он нужен только для красоты' }], 'alt делает страницу доступной. Хорошее описание говорит, что на картинке, а не «картинка1».');
    qs['h-q-void'] = htmlMcq('h-q-void', 'Как правильно вставить картинку?', null, [{ text: '<img src="a.jpg" alt="Дом">', correct: true }, { text: '<img>a.jpg</img>' }, { text: '<picture a.jpg>' }, { text: '<img src=a.jpg></img alt>' }], 'У img нет содержимого и закрывающего тега: всё нужное — в атрибутах src и alt.');

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — списки, ссылки и картинки',
      lead: 'Три вещи, без которых не обходится почти ни одна страница: перечень, переход на другую страницу и изображение.',
      flow: { code: LIST, out: '• Хлеб\n• Молоко' }, points: ['Сделаешь маркированный и нумерованный список', 'Сделаешь ссылку', 'Вставишь картинку с описанием', 'Узнаешь, что такое атрибут'], foot: '≈ 15 минут.' });
    steps.push(Object.assign({ id: 'see' }, qs['h-q-ulol'], { title: 'Сначала угадай' }));
    steps.push({ id: 'anatomy', kind: 'anatomy', tag: 'Разбор', why: 'worked', novice: true, title: 'Разбери ссылку', lead: 'Нажми на каждую часть.',
      parts: [{ key: 'kw', text: '<a' }, { key: 'name', text: ' href=' }, { key: 'value', text: '"https://ru.wikipedia.org">' }, { key: 'eq', text: 'Википедия' }, { key: 'semi', text: '</a>' }],
      roles: { kw: { role: '1 · Тег ссылки', desc: 'a — anchor, «якорь».' }, name: { role: '2 · Атрибут', desc: 'Дополнительная настройка внутри открывающего тега. href — куда вести.' }, value: { role: '3 · Значение атрибута', desc: 'Адрес в кавычках. Открывающий тег заканчивается знаком >.' }, eq: { role: '4 · Текст ссылки', desc: 'То, на что человек нажимает.' }, semi: { role: '5 · Закрывающий тег', desc: 'Конец ссылки.' } },
      summary: 'Итого: атрибуты пишут внутри открывающего тега: имя="значение".' });
    steps.push(Object.assign({ id: 'make1' }, defs['h-ul']));
    steps.push(Object.assign({ id: 'make2' }, defs['h-ol']));
    steps.push(Object.assign({ id: 'make3' }, defs['h-a']));
    steps.push(Object.assign({ id: 'debug1' }, defs['h-href']));
    steps.push(Object.assign({ id: 'make4' }, defs['h-img']));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Четыре вопроса по памяти.', questions: [qs['h-q-li'], qs['h-q-href'], qs['h-q-alt'], qs['h-q-void']] });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Списки, ссылки и картинки освоены', rosetta: false, lead: 'Из этих элементов уже можно собрать простую страницу-визитку: заголовок, абзац о себе, список навыков и ссылку на контакт.' });
    return { id: 'html2', title: 'Списки, ссылки, картинки', day: 2, minutes: 15, steps: steps, cards: Object.assign({}, defs, qs), keyLang: 'all', stepLang: 'html', track: 'html' };
  }

  /* ======================= Логика ======================= */
  function lgMcq(id, q, options, explain) { return { kind: 'mcq', card: id, tag: 'Задача', why: 'retrieval', q: q, options: options, explain: explain }; }
  function lgFill(id, title, prompt, tpl, accept, okText, hintText) { return { kind: 'fill', card: id, tag: 'Задача', why: 'retrieval', title: title, prompt: prompt, tpl: tpl, blanks: [{ accept: accept, label: 'ответ' }], okText: okText, hintText: hintText }; }

  function buildLogic1(lang) {
    var c = {};
    c['lg-seq-double'] = lgFill('lg-seq-double', 'Продолжи ряд', 'Какое число следующее?', ['2, 4, 8, 16, ', { b: 0 }], ['32'], 'Каждое число вдвое больше предыдущего: 16 × 2 = 32. Так растёт память компьютеров: 2, 4, 8, 16, 32 гигабайта.', 'Сравни соседние числа: во сколько раз растёт каждое?');
    c['lg-seq-step'] = lgFill('lg-seq-step', 'Продолжи ряд', 'Какое число следующее?', ['10, 7, 4, 1, ', { b: 0 }], ['-2', '−2', '–2'], 'Каждый раз вычитаем 3: 1 − 3 = −2. Ряд не обязан останавливаться на нуле.', 'На сколько уменьшается каждое число?');
    c['lg-seq-square'] = lgMcq('lg-seq-square', 'Какое число следующее: 1, 4, 9, 16, …?', [{ text: '25', correct: true }, { text: '20' }, { text: '32' }, { text: '24' }], 'Это квадраты: 1×1, 2×2, 3×3, 4×4. Дальше 5×5 = 25. Разница между соседями растёт: 3, 5, 7, 9.');
    c['lg-seq-fib'] = lgMcq('lg-seq-fib', 'Какое число следующее: 1, 1, 2, 3, 5, 8, …?', [{ text: '13', correct: true }, { text: '11' }, { text: '16' }, { text: '10' }], 'Каждое число — сумма двух предыдущих: 5 + 8 = 13. Это ряд Фибоначчи.');
    c['lg-odd'] = lgMcq('lg-odd', 'Какое число лишнее: 2, 4, 7, 8, 10?', [{ text: '7', correct: true }, { text: '2' }, { text: '10' }, { text: '8' }], 'Все числа чётные, кроме 7.');
    c['lg-seq-alt'] = lgMcq('lg-seq-alt', 'Какое число следующее: 1, 10, 2, 20, 3, 30, …?', [{ text: '4', correct: true }, { text: '40' }, { text: '31' }, { text: '33' }], 'Это два ряда вперемешку: 1, 2, 3, … и 10, 20, 30, … Следующим идёт первый ряд: 4.');
    c['lg-loop'] = lgMcq('lg-loop', 'Цикл начинает с 1 и на каждом круге умножает число на 3. Какое число будет на четвёртом круге?', [{ text: '27', correct: true }, { text: '12' }, { text: '81' }, { text: '9' }], '1, 3, 9, 27 — четвёртое число 27. Найти правило ряда — значит понять, что делает цикл.');

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — закономерности',
      lead: 'Программист постоянно ищет правило: как меняются данные от шага к шагу. Это тот же навык, что продолжить числовой ряд.',
      points: ['Найдёшь правило в рядах чисел', 'Увидишь ряды, которые растут неравномерно', 'Свяжешь закономерность с циклом'], foot: '≈ 10 минут. Решай в уме или на бумаге.',
      simple: 'Смотри не на числа, а на то, что происходит между ними: сколько прибавили, во сколько раз умножили.' });
    steps.push(Object.assign({ id: 's1' }, c['lg-seq-double']));
    steps.push(Object.assign({ id: 's2' }, c['lg-seq-step']));
    steps.push(Object.assign({ id: 's3' }, c['lg-seq-square'], { title: 'Ряд с подвохом' }));
    steps.push(Object.assign({ id: 's4' }, c['lg-seq-fib'], { title: 'Знаменитый ряд' }));
    steps.push(Object.assign({ id: 's5' }, c['lg-odd'], { title: 'Найди лишнее' }));
    steps.push(Object.assign({ id: 's6' }, c['lg-seq-alt'], { title: 'Два ряда в одном' }));
    steps.push(Object.assign({ id: 's7' }, c['lg-loop'], { title: 'Ряд и цикл' }));
    steps.push({ id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-logic1', title: 'Объясни своими словами', code: '1, 3, 7, 15, 31', min: 30,
      prompt: 'Какое правило у этого ряда и какое число будет следующим?', model: 'Каждое число — предыдущее, умноженное на 2, плюс 1: 1×2+1 = 3, 3×2+1 = 7 и так далее. Следующее: 31×2+1 = 63.' });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Закономерности найдены', rosetta: false, lead: 'Ты ищешь правило, а не угадываешь число. Именно так пишут циклы: сначала понимают, что меняется на каждом шаге.' });
    return { id: 'logic1', title: 'Закономерности', day: 1, minutes: 10, steps: steps, cards: c, keyLang: 'all', track: 'logic' };
  }

  function buildLogic2(lang) {
    var py = lang !== 'js';
    var AND = py ? 'and' : '&&', OR = py ? 'or' : '||', NOT = py ? 'not' : '!';
    var T = 'истина', F = 'ложь';
    var c = {};
    c['lg-and'] = lgMcq('lg-and', 'Дверь открывается, если есть ключ И ты знаешь код. Ключ есть, кода не знаешь. Откроется?', [{ text: 'Нет', correct: true }, { text: 'Да' }, { text: 'Откроется наполовину' }, { text: 'Нельзя сказать' }], 'И (' + AND + ') истинно, только когда верны обе части. Здесь одна ложна — значит, ложно всё.');
    c['lg-or'] = lgMcq('lg-or', 'Скидка положена, если ты студент ИЛИ пенсионер. Ты студент. Скидка будет?', [{ text: 'Да', correct: true }, { text: 'Нет' }, { text: 'Только половина' }, { text: 'Нельзя сказать' }], 'ИЛИ (' + OR + ') истинно, если верна хотя бы одна часть.');
    c['lg-not'] = lgMcq('lg-not', 'Утверждение: «идёт дождь». Дождь идёт. Чему равно НЕ «идёт дождь»?', [{ text: 'Ложь', correct: true }, { text: 'Истина' }, { text: 'Дождь' }, { text: 'Нельзя сказать' }], 'НЕ (' + NOT + ') переворачивает значение: истина становится ложью и наоборот.');
    c['lg-and-fill'] = lgFill('lg-and-fill', 'Посчитай', 'Чему равно выражение? Впиши «истина» или «ложь».', ['истина И ложь = ', { b: 0 }], [F, 'Ложь', 'false', 'False'], 'Для И нужны обе истины. Одна ложь делает всё ложным.', 'И — это «и то, и другое».');
    c['lg-or-fill'] = lgFill('lg-or-fill', 'Посчитай', 'Чему равно выражение? Впиши «истина» или «ложь».', ['ложь ИЛИ ложь = ', { b: 0 }], [F, 'Ложь', 'false', 'False'], 'ИЛИ ложно только в одном случае — когда обе части ложны.', 'Есть ли здесь хоть одна истина?');
    c['lg-combo'] = lgMcq('lg-combo', 'В кино пускают, если (тебе 16 или больше ИЛИ ты со взрослым) И НЕ зал полон. Тебе 14, ты со взрослым, зал не полон. Пустят?', [{ text: 'Да', correct: true }, { text: 'Нет' }, { text: 'Только со взрослым после 16' }, { text: 'Нельзя сказать' }], 'В скобках: ложь ИЛИ истина = истина. НЕ «зал полон» = истина. Истина И истина = истина.');
    c['lg-code'] = lgMcq('lg-code', 'Как в ' + (py ? 'Python' : 'JavaScript') + ' записать «возраст от 18 и есть паспорт»?', [{ text: 'age >= 18 ' + AND + ' passport', correct: true }, { text: 'age >= 18 ' + OR + ' passport' }, { text: 'age >= 18 ' + NOT + ' passport' }, { text: 'age >= 18 + passport' }], 'Обе части должны быть верны — значит, И: ' + AND + '.');

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — И, ИЛИ, НЕ',
      lead: 'Условие в программе — это вопрос с ответом «да» или «нет». Три слова позволяют склеивать такие вопросы: И, ИЛИ, НЕ.',
      points: ['Поймёшь, когда И даёт истину', 'Поймёшь, когда ИЛИ даёт истину', 'Научишься переворачивать значение через НЕ', 'Запишешь условие на ' + (py ? 'Python' : 'JavaScript')], foot: '≈ 10 минут. В коде эти слова пишутся так: ' + AND + ', ' + OR + ', ' + NOT + '.',
      simple: 'И — строгий охранник: пропускает, только если всё в порядке. ИЛИ — добрый: хватает одного пропуска. НЕ — говорит наоборот.' });
    steps.push(Object.assign({ id: 's1' }, c['lg-and'], { title: 'Задача про дверь' }));
    steps.push(Object.assign({ id: 's2' }, c['lg-or'], { title: 'Задача про скидку' }));
    steps.push(Object.assign({ id: 's3' }, c['lg-not'], { title: 'Наоборот' }));
    steps.push(Object.assign({ id: 's4' }, c['lg-and-fill']));
    steps.push(Object.assign({ id: 's5' }, c['lg-or-fill']));
    steps.push(Object.assign({ id: 's6' }, c['lg-combo'], { title: 'Всё вместе' }));
    steps.push(Object.assign({ id: 's7' }, c['lg-code'], { title: 'Теперь в коде' }));
    steps.push({ id: 'explain', kind: 'explain', tag: 'Объясни', why: 'selfexp', noteKey: 'explain-logic2', title: 'Объясни своими словами', min: 30,
      prompt: 'Объясни другу разницу между И и ИЛИ на своём примере из жизни.', model: 'И истинно, только если верны обе части: «пойду гулять, если тепло И нет дождя» — нужны оба условия. ИЛИ истинно, если верна хотя бы одна: «пойду гулять, если тепло ИЛИ есть зонт».' });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Логика условий освоена', rosetta: false, lead: 'Теперь ты можешь собирать сложные условия из простых. Это ровно то, что стоит после if в программах.' });
    return { id: 'logic2', title: 'И, ИЛИ, НЕ', day: 2, minutes: 10, steps: steps, cards: c, keyLang: 'all', track: 'logic' };
  }

  /* ======================= Математика для кода ======================= */
  function buildMath1(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, show = k.show, prog = k.prog;
    var IDIV = function (a, b) { return py ? a + ' // ' + b : 'Math.floor(' + a + ' / ' + b + ')'; };
    var c = {};
    c['m-q-mod'] = { kind: 'mcq', card: 'm-q-mod', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: show('17 % 5'), out: '2', options: [{ text: '2', correct: true }, { text: '3' }, { text: '3.4' }, { text: '12' }], explain: '17 = 5 × 3 + 2. Остаток — 2.' };
    c['m-q-even'] = { kind: 'mcq', card: 'm-q-even', tag: 'Вспомни', why: 'retrieval', q: 'Как проверить, что число n чётное?', options: [{ text: 'n % 2 == 0', correct: true }, { text: 'n / 2 == 0' }, { text: 'n % 2 == 1' }, { text: 'n == 2' }], explain: 'Чётное число делится на 2 без остатка: остаток 0.' };
    c['m-q-small'] = { kind: 'mcq', card: 'm-q-small', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: show('3 % 10'), out: '3', options: [{ text: '3', correct: true }, { text: '0' }, { text: '10' }, { text: '0.3' }], explain: '3 меньше 10, поэтому 10 не помещается ни разу, и весь остаток — 3.' };
    c['m-q-idiv'] = { kind: 'mcq', card: 'm-q-idiv', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: show(IDIV('17', '5')), out: '3', options: [{ text: '3', correct: true }, { text: '3.4' }, { text: '2' }, { text: '4' }], explain: 'Целая часть от деления: 5 помещается в 17 три раза.' };
    c['m-q-clock'] = { kind: 'mcq', card: 'm-q-clock', tag: 'Вспомни', why: 'retrieval', q: 'Сейчас 22 часа. Сколько будет через 5 часов? Какое выражение это считает?', options: [{ text: '(22 + 5) % 24', correct: true }, { text: '22 + 5' }, { text: '(22 + 5) / 24' }, { text: '22 % 5' }], explain: '27 % 24 = 3: будет 3 часа ночи. Остаток «заворачивает» время по кругу.' };
    c['m-even'] = { kind: 'code', mode: 'write', card: 'm-even', tag: 'Напиши сам', why: 'make', title: 'Чётное или нечётное', prompt: 'В n лежит 7. Если n чётное — выведи чётное, иначе — нечётное. Проверку делай через остаток %.',
      starter: asg('n', '7') + '\n', expect: 'нечётное',
      validate: function (out, code) { var r = k.outOk(out, 'нечётное'); if (!r.ok) return r; if (!k.has(code, /%\s*2/)) return { ok: false, msg: 'Проверь через остаток от деления на 2: n % 2' }; if (!k.has(code, /\bif\b/)) return { ok: false, msg: 'Нужно условие if.' }; return { ok: true }; },
      hints: ['Чётное число делится на 2 без остатка.', 'Условие: n % 2 == 0', 'Каркас:\n' + k.iff('n % 2 == 0', show('"чётное"'), show('"нечётное"'))],
      solution: prog(asg('n', '7'), k.iff('n % 2 == 0', show('"чётное"'), show('"нечётное"'))) };
    c['m-every'] = { kind: 'code', mode: 'write', card: 'm-every', tag: 'Напиши сам', why: 'make', title: 'Каждое третье', prompt: 'Выведи числа от 1 до 12, которые делятся на 3 без остатка. Используй цикл и %.',
      starter: '', expect: '3\n6\n9\n12',
      validate: function (out, code) { var r = k.outOk(out, '3\n6\n9\n12'); if (!r.ok) return r; if (!k.has(code, /%\s*3/)) return { ok: false, msg: 'Проверяй делимость через остаток: i % 3 == 0' }; if (!k.has(code, /\b(for|while)\b/)) return { ok: false, msg: 'Нужен цикл по числам от 1 до 12.' }; return { ok: true }; },
      hints: ['Цикл по числам от 1 до 12.', 'Внутри — условие: остаток от деления на 3 равен нулю.', py ? 'for i in range(1, 13):\n    if i % 3 == 0:\n        print(i)' : 'for (let i = 1; i <= 12; i++) {\n  if (i % 3 == 0) {\n    console.log(i);\n  }\n}'],
      solution: py ? 'for i in range(1, 13):\n    if i % 3 == 0:\n        print(i)' : 'for (let i = 1; i <= 12; i++) {\n  if (i % 3 == 0) {\n    console.log(i);\n  }\n}' };
    c['m-modules'] = { kind: 'code', mode: 'write', card: 'm-modules', tag: 'Задача', why: 'make', title: 'Модули в ряд', prompt: 'Длина участка 23 метра, модуль дома — 6 метров. Выведи на одной строке, сколько целых модулей поместится, а на следующей — сколько метров останется.',
      starter: prog(asg('plot', '23'), asg('module', '6')) + '\n', expect: '3\n5',
      validate: function (out, code) { var r = k.outOk(out, '3\n5'); if (!r.ok) return r; if (!k.has(code, /%/)) return { ok: false, msg: 'Остаток посчитай через %.' }; if (!k.has(code, /plot/) || !k.has(code, /module/)) return { ok: false, msg: 'Считай через переменные plot и module, а не готовыми числами.' }; return { ok: true }; },
      hints: ['Сколько раз 6 помещается в 23 — это целочисленное деление.', py ? 'Целое деление в Python: plot // module' : 'Целое деление в JavaScript: Math.floor(plot / module)', 'Остаток: plot % module'],
      solution: prog(asg('plot', '23'), asg('module', '6'), show(IDIV('plot', 'module')), show('plot % module')) };

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — остаток от деления',
      lead: 'Знак % в программировании — не проценты, а остаток от деления. Это одна из самых полезных операций: чётность, «каждый третий», время по кругу.',
      flow: { code: show('17 % 5'), out: '2' }, points: ['Посчитаешь остаток в уме и в коде', 'Проверишь число на чётность', 'Выберешь каждое третье число', 'Посчитаешь, сколько модулей влезет на участок'], foot: '≈ 15 минут.',
      simple: 'Раздай 17 конфет пятерым поровну: каждому по 3, и 2 останутся. Эти 2 — и есть остаток: 17 % 5 = 2.' });
    steps.push({ id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Сначала угадай', question: 'Что выведет эта программа?', code: show('10 % 3'), expected: '1',
      options: [{ id: 'a', text: '1', correct: true }, { id: 'b', text: '3' }, { id: 'c', text: '3.33' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: 10 = 3 × 3 + 1.', bad: '% — это не деление и не проценты, а остаток: 3 помещается в 10 три раза, остаётся 1.', dk: '% — остаток от деления: 10 = 3 × 3 + 1, остаток 1.' } });
    steps.push(Object.assign({ id: 'q1' }, c['m-q-mod'], { title: 'Ещё раз' }));
    steps.push(Object.assign({ id: 'make1' }, c['m-even']));
    steps.push(Object.assign({ id: 'make2' }, c['m-every']));
    steps.push(Object.assign({ id: 'make3' }, c['m-modules'], { simple: 'Целое деление отвечает «сколько раз помещается», остаток — «сколько не поместилось». Они всегда идут парой.' }));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Четыре вопроса по памяти.', questions: [c['m-q-even'], c['m-q-small'], c['m-q-idiv'], c['m-q-clock']] });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Остаток освоен', rosetta: false, lead: '% и целое деление встретятся тебе постоянно: в расписаниях, сетках колонн, раскладке плитки и модулей.' });
    return { id: 'math1', title: 'Остаток от деления', day: 1, minutes: 15, steps: steps, cards: c, lang: lang, track: 'math' };
  }

  function buildMath2(lang) {
    var k = kit(lang), py = k.py, asg = k.asg, show = k.show, prog = k.prog;
    var ROUND = function (x) { return py ? 'round(' + x + ')' : 'Math.round(' + x + ')'; };
    var CEIL = function (x) { return py ? 'math.ceil(' + x + ')' : 'Math.ceil(' + x + ')'; };
    var FLOOR = function (x) { return py ? 'math.floor(' + x + ')' : 'Math.floor(' + x + ')'; };
    var IMP = py ? 'import math\n' : '';
    var c = {};
    c['m-q-pct'] = { kind: 'mcq', card: 'm-q-pct', tag: 'Вспомни', why: 'retrieval', q: 'Сколько будет 20% от 3000?', options: [{ text: '600', correct: true }, { text: '60' }, { text: '2400' }, { text: '1500' }], explain: '20% — это 20/100 = 0.2. 3000 × 0.2 = 600.' };
    c['m-q-ceil'] = { kind: 'mcq', card: 'm-q-ceil', tag: 'Вспомни', why: 'retrieval', q: 'В машину помещается 20 листов фанеры, везти нужно 45. Какая операция даст число рейсов?', options: [{ text: 'Округление вверх: ceil(45 / 20) = 3', correct: true }, { text: 'Обычное округление: round(45 / 20) = 2' }, { text: 'Округление вниз: floor(45 / 20) = 2' }, { text: 'Остаток: 45 % 20 = 5' }], explain: 'Даже 5 оставшихся листов требуют ещё одного рейса. Когда «неполное» всё равно занимает целую единицу — округляют вверх.' };
    c['m-q-floor'] = { kind: 'mcq', card: 'm-q-floor', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: IMP + show(FLOOR('7.9')), out: '7', options: [{ text: '7', correct: true }, { text: '8' }, { text: '7.9' }, { text: '0.9' }], explain: 'floor округляет вниз, до ближайшего целого, не большего числа.' };
    c['m-q-half'] = { kind: 'mcq', card: 'm-q-half', tag: 'Вспомни', why: 'retrieval', q: 'Что выведет эта программа?', code: show(ROUND('2.5')), out: py ? '2' : '3',
      options: py ? [{ text: '2', correct: true }, { text: '3' }, { text: '2.5' }, { text: 'Ошибка' }] : [{ text: '3', correct: true }, { text: '2' }, { text: '2.5' }, { text: 'Ошибка' }],
      explain: py ? 'Подвох: Python округляет половину к ближайшему чётному. round(2.5) = 2, а round(3.5) = 4. Для денег такие мелочи важны.' : 'Math.round округляет половину вверх: 2.5 → 3. В Python было бы 2 — там половина идёт к ближайшему чётному.' };
    c['m-q-share'] = { kind: 'mcq', card: 'm-q-share', tag: 'Вспомни', why: 'retrieval', q: 'Цена выросла с 2000 до 2500. На сколько процентов?', options: [{ text: '25%', correct: true }, { text: '20%' }, { text: '500%' }, { text: '50%' }], explain: 'Рост — 500. От старой цены это 500 / 2000 = 0.25, то есть 25%. Процент всегда считают от того, с чем сравнивают.' };
    c['m-discount'] = { kind: 'code', mode: 'write', card: 'm-discount', tag: 'Задача', why: 'make', title: 'Цена со скидкой', prompt: 'Цена 2000, скидка 15%. Посчитай и выведи цену со скидкой.',
      starter: prog(asg('price', '2000'), asg('discount', '15')) + '\n', expect: '1700',
      validate: function (out, code) { var r = k.outOk(String(out).replace(/\.0+(\n|$)/g, '$1'), '1700'); if (!r.ok) return r; if (!k.has(code, /price/) || !k.has(code, /discount/) || !k.has(code, /100/)) return { ok: false, msg: 'Посчитай через переменные: price * (100 - discount) / 100' }; return { ok: true }; },
      hints: ['Скидка 15% — значит, платишь 85% цены.', '85% от цены: price * 85 / 100', 'Через переменные: price * (100 - discount) / 100'],
      solution: prog(asg('price', '2000'), asg('discount', '15'), show(py ? 'price * (100 - discount) // 100' : 'price * (100 - discount) / 100')) };
    c['m-buses'] = { kind: 'code', mode: 'write', card: 'm-buses', tag: 'Задача', why: 'make', title: 'Сколько рейсов', prompt: 'Нужно перевезти 45 листов фанеры, в машину помещается 20. Выведи, сколько нужно рейсов.',
      starter: IMP + prog(asg('sheets', '45'), asg('per_trip', '20')) + '\n', expect: '3',
      validate: function (out, code) { var r = k.outOk(out, '3'); if (!r.ok) return r; if (!k.has(code, /ceil/)) return { ok: false, msg: 'Округли вверх: ' + CEIL('sheets / per_trip') }; return { ok: true }; },
      hints: ['45 / 20 = 2.25 — неполный рейс тоже рейс.', 'Нужно округление вверх.', show(CEIL('sheets / per_trip'))],
      solution: IMP + prog(asg('sheets', '45'), asg('per_trip', '20'), show(CEIL('sheets / per_trip'))) };

    var steps = [];
    steps.push({ id: 'goal', kind: 'intro', tag: 'Цель', title: 'Сегодня — проценты и округление',
      lead: 'Скидки, налоги, сметы, количество материалов — всё это проценты и округление. Ошибка в одном знаке здесь стоит денег.',
      flow: { code: show('2000 * 15 / 100'), out: '300' + (py ? '.0' : '') }, points: ['Посчитаешь процент и цену со скидкой', 'Выберешь правильное округление', 'Узнаешь подвох с округлением половины'], foot: '≈ 15 минут.',
      simple: 'Процент — это сотая часть. 15% от 2000 — это 2000, разделённое на 100 и умноженное на 15.' });
    steps.push({ id: 'predict1', kind: 'predict', tag: 'Предсказание', why: 'predict', title: 'Сначала угадай', question: 'Что выведет эта программа?', code: show('3000 * 20 / 100'), expected: py ? '600.0' : '600',
      options: [{ id: 'a', text: py ? '600.0' : '600', correct: true }, { id: 'b', text: '60' }, { id: 'c', text: '2400' }, { id: 'dk', text: 'Не знаю — проверим', dk: true }],
      after: { ok: 'Верно: 20% от 3000 — это 600.' + (py ? ' «.0» появилось, потому что деление / в Python всегда даёт дробное число.' : ''), bad: '20% — это 20 сотых: 3000 / 100 × 20 = 600.', dk: '20% от 3000: 3000 × 20 / 100 = 600.' } });
    steps.push(Object.assign({ id: 'q1' }, c['m-q-pct'], { title: 'Процент в уме' }));
    steps.push(Object.assign({ id: 'make1' }, c['m-discount']));
    steps.push(Object.assign({ id: 'q2' }, c['m-q-ceil'], { title: 'Какое округление?' }));
    steps.push(Object.assign({ id: 'make2' }, c['m-buses']));
    steps.push(Object.assign({ id: 'q3' }, c['m-q-half'], { title: 'Подвох с половиной' }));
    steps.push({ id: 'quiz', kind: 'quiz', tag: 'Вспомни', why: 'retrieval', title: 'Проверка без подсказок', lead: 'Два вопроса по памяти.', questions: [c['m-q-floor'], c['m-q-share']] });
    steps.push({ id: 'done', kind: 'done', tag: 'Готово', title: 'Проценты и округление освоены', rosetta: false, lead: 'Это основа любой сметы: цена материалов, наценка, скидка подрядчика и число машин для доставки.' });
    return { id: 'math2', title: 'Проценты и округление', day: 2, minutes: 15, steps: steps, cards: c, lang: lang, track: 'math' };
  }

  var BUILDERS = { hello: buildHello, vars: buildVars, cond: buildCond, loops: buildLoops, 'for': buildFor, lists: buildLists, funcs: buildFuncs,
    html1: buildHtml1, html2: buildHtml2, logic1: buildLogic1, logic2: buildLogic2, math1: buildMath1, math2: buildMath2 };
  function build(lang, id) { return (BUILDERS[id] || buildHello)(lang); }
  // все карточки повторения всех уроков для языка (id карточек уникальны между уроками)
  function allCards(lang) {
    var out = {};
    LESSONS.forEach(function (l) { Object.assign(out, build(lang, l.id).cards); });
    return out;
  }

  window.Course = { build: build, allCards: allCards, LESSONS: LESSONS, TRACKS: TRACKS, WHY: WHY, LINKS: LINKS, ROSETTA: ROSETTA, ROADMAP: ROADMAP };
})();
