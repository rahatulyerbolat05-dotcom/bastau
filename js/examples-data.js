/* Сгенерировано tools/build-examples.js из исходников программ — не править руками. */
window.EXAMPLES = {
 "builtAt": "2026-11-08",
 "projects": [
  {
   "id": "qalta",
   "name": "Қalta",
   "icon": "wallet",
   "tagline": "Учёт расходов в одну строку: пишешь «кофе 2800 вчера» — приложение само находит сумму, день и категорию. Есть бот для Telegram.",
   "stack": [
    "JavaScript",
    "PWA",
    "Firebase",
    "Cloudflare Worker"
   ],
   "stat": "4 218 строк кода",
   "where": "D:\\qalta-app",
   "commit": "152953b (+ правки без коммита)",
   "tree": [
    [
     "src/parse.js",
     "Разбор фразы: сумма, день, время, «расход или доход»"
    ],
    [
     "src/cat.js",
     "Угадывает категорию по тексту («Магнум» → продукты); работает и в приложении, и в боте"
    ],
    [
     "src/logic.js",
     "Чистая логика без экрана: баланс, бюджеты, долги — поэтому её легко проверять тестами"
    ],
    [
     "src/component.js",
     "Состояние приложения и обработчики нажатий"
    ],
    [
     "sync-engine.js",
     "Синхронизация между устройствами: сначала сохраняет у тебя, потом отправляет в Firebase"
    ],
    [
     "bot/",
     "Бот: одна строка в чате — одна запись у тебя в данных (Telegram работает на Cloudflare Workers)"
    ],
    [
     "firestore.rules",
     "Правила базы: кто и что может читать и записывать"
    ],
    [
     "tests/",
     "15 файлов с тестами"
    ],
    [
     "tools/build.js",
     "Склеивает исходники из src/ в один готовый index.html"
    ]
   ],
   "snippets": [
    {
     "id": "q-words",
     "title": "Слова-числа на трёх языках",
     "file": "src/parse.js",
     "lines": "78–91",
     "lang": "js",
     "code": "var NUMW = Object.create(null);\nfunction nw(kind, v, list) { list.split(\" \").forEach(function (w) { NUMW[w] = { k: kind, v: v }; }); }\nnw(\"u\", 0, \"ноль нуль нөл zero\");\n[[\"один одна одно бір one\", 1], [\"два две екі two\", 2], [\"три үш three\", 3], [\"четыре төрт four\", 4], [\"пять бес five\", 5], [\"шесть алты six\", 6],\n [\"семь жеті seven\", 7], [\"восемь сегіз eight\", 8], [\"девять тоғыз nine\", 9], [\"десять он ten\", 10], [\"одиннадцать eleven\", 11], [\"двенадцать twelve\", 12],\n [\"тринадцать thirteen\", 13], [\"четырнадцать fourteen\", 14], [\"пятнадцать fifteen\", 15], [\"шестнадцать sixteen\", 16], [\"семнадцать seventeen\", 17],\n [\"восемнадцать eighteen\", 18], [\"девятнадцать nineteen\", 19], [\"двадцать жиырма twenty\", 20], [\"тридцать отыз thirty\", 30], [\"сорок қырық forty\", 40],\n [\"пятьдесят елу fifty\", 50], [\"шестьдесят алпыс sixty\", 60], [\"семьдесят жетпіс seventy\", 70], [\"восемьдесят сексен eighty\", 80], [\"девяносто тоқсан ninety\", 90],\n [\"сто\", 100], [\"двести\", 200], [\"триста\", 300], [\"четыреста\", 400], [\"пятьсот\", 500], [\"шестьсот\", 600], [\"семьсот\", 700], [\"восемьсот\", 800], [\"девятьсот\", 900]\n].forEach(function (p) { nw(\"u\", p[1], p[0]); });\nnw(\"h\", 100, \"жүз hundred\");\nnw(\"s\", 1000, \"тысяча тысячи тысяч тыща тыщи тыщ мың thousand thousands\");\nnw(\"s\", 1000000, \"миллион миллиона миллионов million millions\");\nnw(\"f\", 1.5, \"полторы полтора\");",
     "nums": [
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91
     ],
     "bridge": "Строка в кавычках — тот же текст, что в print(\"Hello, World!\"). Здесь строки — это данные: слова, которые приложение должно узнать.",
     "notes": [
      "`NUMW` — словарь: по слову быстро находится, что оно значит (ключ → значение).",
      "`nw(\"u\", 0, \"ноль нуль нөл zero\")` — вызов функции со строкой в кавычках, как `print(\"…\")`. Внутри `split(\" \")` режет строку на слова.",
      "В одной строке русские, казахские и английские слова: «две тысячи», «екі мың» и «two thousand» дают 2000.",
      "`forEach` повторяет действие для каждого элемента списка — это цикл."
     ]
    },
    {
     "id": "q-when",
     "title": "Не записывать расходы из будущего",
     "file": "src/parse.js",
     "lines": "296–304",
     "lang": "js",
     "code": "function phraseTs(p, nowTs) {\n  if (!p || (!p.ymd && !p.time)) return { ts: null, future: false };\n  var today = ymdOf(nowTs), day = p.ymd || today;\n  if (day === today && !p.time) return { ts: null, future: false };\n  var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(day), hm = (p.time || hhmmOf(nowTs)).split(\":\");\n  var t = new Date(+m[1], +m[2] - 1, +m[3], +hm[0], +hm[1], 0, 0).getTime();\n  if (t > nowTs) return { ts: null, future: true };\n  return { ts: t, future: false };\n}",
     "nums": [
      296,
      297,
      298,
      299,
      300,
      301,
      302,
      303,
      304
     ],
     "bridge": "Функция не печатает, а возвращает ответ (`return`) — его получает тот, кто её вызвал.",
     "notes": [
      "`if (…) return {…}` — условие с ранним выходом: если считать нечего, сразу отвечаем.",
      "`new Date(год, месяц - 1, …)`: месяцы в JavaScript считаются с нуля, отсюда `- 1`.",
      "Функция возвращает объект `{ ts, future }` — сразу два ответа.",
      "`t > nowTs` — дата оказалась в будущем: приложение скажет об этом, а не запишет расход."
     ]
    },
    {
     "id": "q-test",
     "title": "Тест: как люди пишут суммы",
     "file": "tests/parse.test.js",
     "lines": "11–18",
     "lang": "js",
     "code": "test(\"amounts as people type them\", () => {\n  const cases = {\n    \"кофе 2800\": 2800, \"кофе 2 800\": 2800, \"кофе 2.800\": 2800, \"кофе 2,800\": 2800, \"1 500 000 машина\": 1500000,\n    \"2,5к продукты\": 2500, \"5к\": 5000, \"1.5 млн машина\": 1500000, \"2 тыс такси\": 2000, \"3 мың нан\": 3000,\n    \"500₸ хлеб\": 500, \"3500 тг аптека\": 3500, \"2800.50 бензин\": 2801, \"кофе2800\": 2800\n  };\n  for (const [text, amount] of Object.entries(cases)) assert.equal(parse(text).amount, amount, text);\n});",
     "nums": [
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18
     ],
     "bridge": "Так же, как в уроке ты сверял вывод с ожидаемым: тест сравнивает ответ программы с тем, что должно получиться.",
     "notes": [
      "`cases` — список пар «что написал человек → какая сумма должна получиться».",
      "`for (const [text, amount] of Object.entries(cases))` — цикл проверяет все случаи подряд.",
      "`assert.equal(parse(text).amount, amount, text)` — если сумма не совпала, тест покажет, на какой фразе.",
      "Таких тестов много: они ловят поломку раньше, чем её увидишь ты."
     ]
    },
    {
     "id": "q-bot",
     "title": "Бот: пускаем только запросы от Telegram",
     "file": "bot/worker.js",
     "lines": "30–41",
     "lang": "js",
     "code": "async function onTelegram(request, env) {\n  if (request.method !== \"POST\") return new Response(\"method not allowed\", { status: 405 });\n  // only Telegram knows the secret given to setWebhook\n  if (!core.sameSecret(request.headers.get(\"X-Telegram-Bot-Api-Secret-Token\"), env.TG_SECRET)) return new Response(\"forbidden\", { status: 403 });\n  let update;\n  try { update = await request.json(); } catch (e) { return new Response(\"bad request\", { status: 400 }); }\n  // Work first, answer after: if the Worker is stopped half-way (CPU limit, crash), Telegram gets no \"ok\" and\n  // delivers the update again, and the operation id derived from the message makes the repeat land on the\n  // same document. Ordinary errors are told to the person inside handleUpdate and answered \"ok\".\n  await getBot(env, \"tg\").handleUpdate(update);\n  return new Response(\"ok\");\n}",
     "nums": [
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41
     ],
     "bridge": "Сначала проверка, потом работа: как в уроке «прочитай ошибку» — программа сама отсекает неправильный вход.",
     "notes": [
      "`request.method !== \"POST\"` — отвечаем только на нужный тип запроса, остальным — 405.",
      "`sameSecret(…)` — проверка секретного слова: его знают только твой бот и Telegram. Чужой запрос получает 403.",
      "`try { … } catch` — если пришёл мусор вместо JSON, бот не падает, а отвечает 400.",
      "Комментарий объясняет порядок «сначала работа, потом ответ»: если сервер оборвётся, Telegram повторит сообщение, и запись не задвоится."
     ]
    },
    {
     "id": "q-rules",
     "title": "Правила базы данных",
     "file": "firestore.rules",
     "lines": "13–29",
     "lang": "js",
     "code": "match /users/{uid} {\n  function isOwner() {\n    return request.auth != null && request.auth.uid == uid;\n  }\n  function stamps(d) {\n    return d._u is number && d._u > 0 && d._u <= 4102444800000\n      && d._d is string && d._d.size() <= 64;\n  }\n  function tombstone(d) {\n    return d.keys().hasOnly(['_del', '_u', '_d']) && d._del == true && stamps(d);\n  }\n  function amount(n) {\n    return n is number && n >= -999999999 && n <= 999999999;\n  }\n  function moment(n) {\n    return n is number && n > 0 && n < 8640000000000000;\n  }",
     "nums": [
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29
     ],
     "bridge": "Тот же принцип «проверь вход», только в самой базе: даже если кто-то обойдёт приложение, база не примет лишнее.",
     "notes": [
      "`isOwner()` — читать и писать данные может только их владелец (по `uid`).",
      "`amount(n)` — сумма ограничена ±999 999 999; `moment(n)` — время должно быть разумным числом.",
      "`stamps(d)` — у каждой записи должны быть время правки и идентификатор устройства: по ним работает синхронизация.",
      "Это не JavaScript, а язык правил Firestore — но `function`, `return` и `&&` читаются так же."
     ]
    }
   ]
  },
  {
   "id": "raspisanie",
   "name": "Расписание колледжа",
   "icon": "cal",
   "tagline": "Расписание на телефоне: само определяет, числитель сейчас или знаменатель, а все пары берёт из одного файла данных.",
   "stack": [
    "JavaScript",
    "HTML",
    "GitHub Pages"
   ],
   "stat": "1 351 строк кода",
   "where": "D:\\Raspesanya",
   "commit": "f59e350",
   "tree": [
    [
     "schedule-data.js",
     "Единственный файл, который меняется при обновлении расписания: пары, преподаватели, кабинеты"
    ],
    [
     "index.html",
     "Экран и вся логика: выбор недели, календарь, показ пар. Данные читает из schedule-data.js"
    ]
   ],
   "snippets": [
    {
     "id": "r-data",
     "title": "Один файл данных: функции P() и SPLIT()",
     "file": "schedule-data.js",
     "lines": "21–39",
     "lang": "js",
     "code": "var WEEK_ANCHOR = \"2026-09-07\";\n\n// Дата последней правки этого файла (YYYY-MM-DD) — показывается внизу страницы, по ней видно, что телефон\n// взял свежие данные. После КАЖДОЙ правки меняй её и ?v=... у <script src=\"schedule-data.js\"> в index.html.\nvar DATA_UPDATED = \"2026-10-20\";\n\nfunction P(pair, name, teacher, room) {\n  return { pair: pair, name: name, teacher: teacher, room: room || \"413\" };\n}\nfunction SPLIT(pair, numCls, denomCls) {\n  // numCls / denomCls можно передать как null — значит в эту неделю пары просто нет.\n  return {\n    pair: pair,\n    split: true,\n    num:   numCls   ? { pair: pair, room: \"413\", name: numCls.name,   teacher: numCls.teacher,   room2: numCls.room }   : null,\n    denom: denomCls ? { pair: pair, room: \"413\", name: denomCls.name, teacher: denomCls.teacher, room2: denomCls.room } : null\n  };\n}\n// (room2 переопределяет аудиторию по умолчанию для конкретного варианта, если нужно)",
     "nums": [
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39
     ],
     "bridge": "В первой строке — та же строка в кавычках, что в Hello World, только теперь она запоминается под именем.",
     "notes": [
      "`var WEEK_ANCHOR = \"2026-09-07\";` — опорная дата: от неё дальше считаются недели.",
      "`P(пара, предмет, преподаватель, кабинет)` — маленькая функция-заготовка; `room || \"413\"` значит «если кабинет не указан — 413».",
      "`SPLIT` — пара, у которой на числителе и знаменателе разные предметы; `условие ? a : null` — «если есть — собрать запись, иначе ничего».",
      "`DATA_UPDATED` — дата последней правки: по ней видно, что телефон взял свежие данные."
     ]
    },
    {
     "id": "r-week",
     "title": "Числитель или знаменатель?",
     "file": "index.html",
     "lines": "496–504",
     "lang": "js",
     "code": "var anchorParts = WEEK_ANCHOR.split(\"-\").map(Number);\nvar ANCHOR = Date.UTC(anchorParts[0], anchorParts[1]-1, anchorParts[2]);\nfunction weekType(date){\n  var d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());\n  var days = Math.floor((d - ANCHOR) / 86400000);\n  var week = Math.floor(days / 7);\n  var mod = ((week % 2) + 2) % 2;\n  return mod === 0 ? \"denom\" : \"num\";\n}",
     "nums": [
      496,
      497,
      498,
      499,
      500,
      501,
      502,
      503,
      504
     ],
     "bridge": "Запусти пример: функция получает дату и отвечает одним словом — как print выводит одно слово.",
     "notes": [
      "`Math.floor((d - ANCHOR) / 86400000)` — сколько дней прошло от опорной даты (в сутках 86 400 000 миллисекунд).",
      "`% 2` — остаток от деления на 2: чётная неделя или нечётная.",
      "`((week % 2) + 2) % 2` — чтобы даты до опорной тоже считались верно: обычный остаток там уходит в минус.",
      "`mod === 0 ? \"denom\" : \"num\"` — выбор из двух вариантов одной строкой."
     ],
     "demo": {
      "lang": "js",
      "code": "// Опорная дата из schedule-data.js и функция из index.html\nvar WEEK_ANCHOR = \"2026-09-07\";\nvar anchorParts = WEEK_ANCHOR.split(\"-\").map(Number);\nvar ANCHOR = Date.UTC(anchorParts[0], anchorParts[1]-1, anchorParts[2]);\nfunction weekType(date){\n  var d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());\n  var days = Math.floor((d - ANCHOR) / 86400000);\n  var week = Math.floor(days / 7);\n  var mod = ((week % 2) + 2) % 2;\n  return mod === 0 ? \"denom\" : \"num\";\n}\n\nconsole.log(\"7 сентября 2026:\", weekType(new Date(2026, 8, 7)));\nconsole.log(\"14 сентября 2026:\", weekType(new Date(2026, 8, 14)));\nconsole.log(\"9 ноября 2026:\", weekType(new Date(2026, 10, 9)));\n",
      "out": "7 сентября 2026: denom\n14 сентября 2026: num\n9 ноября 2026: num",
      "expect": [
       "7 сентября 2026: denom",
       "14 сентября 2026: num",
       "9 ноября 2026: num"
      ]
     }
    }
   ]
  },
  {
   "id": "raspisanie-green",
   "name": "Расписание школьника",
   "icon": "bell",
   "tagline": "То же приложение в зелёном стиле с напоминанием за час до первого урока: уведомление в телефоне и файл для календаря.",
   "stack": [
    "JavaScript",
    "Service Worker",
    "iCalendar (.ics)"
   ],
   "stat": "1 577 строк кода",
   "where": "D:\\Raspisanie-green",
   "commit": "fda9553",
   "tree": [
    [
     "schedule-data.js",
     "Данные расписания — единственный файл, который меняется"
    ],
    [
     "index.html",
     "Экран, логика, напоминания и сборка файла календаря"
    ],
    [
     "sw.js",
     "Service worker из 14 строк — нужен только для уведомлений"
    ]
   ],
   "snippets": [
    {
     "id": "g-sw",
     "title": "Service worker: реакция на события",
     "file": "sw.js",
     "lines": "1–14",
     "lang": "js",
     "code": "/* Минимальный service worker: нужен только затем, чтобы телефон мог показывать уведомления\n   (в мобильных браузерах new Notification() запрещён, работает только registration.showNotification).\n   Ничего не кэширует и не перехватывает запросы — приложение всегда берётся свежим. */\nself.addEventListener(\"install\", function () { self.skipWaiting(); });\nself.addEventListener(\"activate\", function (e) { e.waitUntil(self.clients.claim()); });\nself.addEventListener(\"notificationclick\", function (e) {\n  e.notification.close();\n  e.waitUntil(\n    self.clients.matchAll({ type: \"window\", includeUncontrolled: true }).then(function (list) {\n      for (var i = 0; i < list.length; i++) { if (\"focus\" in list[i]) return list[i].focus(); }\n      return self.clients.openWindow(self.registration.scope);\n    })\n  );\n});",
     "nums": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14
     ],
     "bridge": "`addEventListener` — «когда случится событие, сделай вот это». Ты тоже пишешь программу, которая ждёт, а не только выполняется сверху вниз.",
     "notes": [
      "Service worker — маленькая программа, которая живёт отдельно от страницы. Здесь она нужна только для уведомлений: в телефонах `new Notification()` запрещён.",
      "`function () { … }` передаётся как значение: «вот что сделать, когда событие случится».",
      "`notificationclick`: по нажатию на уведомление показать уже открытое окно (`focus`) или открыть новое (`openWindow`).",
      "В комментарии честно сказано, что он ничего не кэширует, — приложение всегда берётся свежим."
     ]
    },
    {
     "id": "g-ics",
     "title": "Файл календаря: переносим длинные строки",
     "file": "index.html",
     "lines": "1335–1344",
     "lang": "js",
     "code": "function icsFold(line){   // строки ≤ 75 октетов, UTF-8-символы не режем\n  var enc = new TextEncoder(), parts = [], cur = \"\", bytes = 0;\n  Array.from(line).forEach(function(ch){\n    var n = enc.encode(ch).length;\n    if (bytes + n > 73){ parts.push(cur); cur = \" \"; bytes = 1; }\n    cur += ch; bytes += n;\n  });\n  parts.push(cur);\n  return parts.join(\"\\r\\n\");\n}",
     "nums": [
      1335,
      1336,
      1337,
      1338,
      1339,
      1340,
      1341,
      1342,
      1343,
      1344
     ],
     "bridge": "Цикл по буквам и подсчёт байтов: кириллица занимает 2 байта, поэтому считать надо не символы, а байты.",
     "notes": [
      "`.ics` — файл календаря; по стандарту строка не длиннее 75 байт, длиннее — переносится и начинается с пробела.",
      "`Array.from(line).forEach(…)` — цикл по символам строки.",
      "`new TextEncoder().encode(ch).length` — сколько байт занимает символ.",
      "`parts.join(\"\\r\\n\")` — склеить куски через перенос строки. Та же идея работает в Бастау, когда ты скачиваешь напоминание."
     ],
     "demo": {
      "lang": "js",
      "code": "// Функция из приложения-расписания\nfunction icsFold(line){   // строки ≤ 75 октетов, UTF-8-символы не режем\n  var enc = new TextEncoder(), parts = [], cur = \"\", bytes = 0;\n  Array.from(line).forEach(function(ch){\n    var n = enc.encode(ch).length;\n    if (bytes + n > 73){ parts.push(cur); cur = \" \"; bytes = 1; }\n    cur += ch; bytes += n;\n  });\n  parts.push(cur);\n  return parts.join(\"\\r\\n\");\n}\n\nvar длинная = \"SUMMARY:\" + \"Уроки начнутся в 13:25 \".repeat(5);\nconsole.log(icsFold(длинная));\n",
      "out": "SUMMARY:Уроки начнутся в 13:25 Уроки начнутся \n в 13:25 Уроки начнутся в 13:25 Уроки начнутс\n я в 13:25 Уроки начнутся в 13:25",
      "expect": [
       "SUMMARY:Уроки"
      ]
     }
    }
   ]
  },
  {
   "id": "shopping",
   "name": "Список покупок",
   "icon": "cart",
   "tagline": "Поход в магазин вдвоём: общий список по короткому коду, план и факт с ценами, отчёты и диаграммы. Работает без интернета.",
   "stack": [
    "JavaScript",
    "PWA",
    "Firebase",
    "Google Apps Script"
   ],
   "stat": "2 992 строк кода",
   "where": "D:\\Claude\\shopping-list",
   "commit": "0e4085e",
   "tree": [
    [
     "js/logic.js",
     "Чистая логика: количества, деньги, итоги — без экрана, поэтому проверяется тестами"
    ],
    [
     "js/catalog.js",
     "Каталог товаров и разделов"
    ],
    [
     "js/sync.js",
     "Общий список по коду для двух телефонов"
    ],
    [
     "js/charts.js",
     "Диаграммы отчёта"
    ],
    [
     "js/store.js",
     "Хранение на телефоне"
    ],
    [
     "sw.js",
     "Работа без интернета"
    ],
    [
     "apps-script/",
     "Выгрузка в Google Таблицу"
    ],
    [
     "test/",
     "11 файлов с тестами"
    ]
   ],
   "snippets": [
    {
     "id": "s-qty",
     "title": "Количества без ошибок округления",
     "file": "js/logic.js",
     "lines": "18–30",
     "lang": "js",
     "code": "function roundQty(q) { return Math.round(q * 1000) / 1000; }\nfunction clampQty(q) { return Math.min(Math.max(roundQty(q), 0), 100000); }\n\n/** Следующее количество при нажатии «+» / «−». Не уходит ниже нуля. */\nfunction stepQty(q, step, dir) { return clampQty((+q || 0) + dir * (step || 1)); }\n\nfunction fmtNum(n) {\n  return String(roundQty(n)).replace(\".\", \",\");\n}\nfunction fmtQty(q, unit) { return fmtNum(q) + (unit ? \" \" + unit : \"\"); }\nfunction fmtMoney(n) {\n  return Math.round(n).toLocaleString(\"ru-RU\") + \" ₸\";\n}",
     "nums": [
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30
     ],
     "bridge": "Запусти пример: сначала ты увидишь, что компьютер считает 0.1 + 0.2 не совсем точно — и как приложение с этим справляется.",
     "notes": [
      "`Math.round(q * 1000) / 1000` — округляем до тысячных, чтобы «0.30000000000000004» не попало на экран.",
      "`Math.min(Math.max(x, 0), 100000)` — «зажать» число между нулём и верхним пределом: ниже нуля количество не уйдёт.",
      "`.replace(\".\", \",\")` — в России дробь пишут через запятую.",
      "`toLocaleString(\"ru-RU\")` — сам ставит пробелы в числе: `12 345 ₸`."
     ],
     "demo": {
      "lang": "js",
      "code": "// Функции из js/logic.js\nfunction roundQty(q) { return Math.round(q * 1000) / 1000; }\nfunction clampQty(q) { return Math.min(Math.max(roundQty(q), 0), 100000); }\n\n/** Следующее количество при нажатии «+» / «−». Не уходит ниже нуля. */\nfunction stepQty(q, step, dir) { return clampQty((+q || 0) + dir * (step || 1)); }\n\nfunction fmtNum(n) {\n  return String(roundQty(n)).replace(\".\", \",\");\n}\nfunction fmtQty(q, unit) { return fmtNum(q) + (unit ? \" \" + unit : \"\"); }\nfunction fmtMoney(n) {\n  return Math.round(n).toLocaleString(\"ru-RU\") + \" ₸\";\n}\n\nconsole.log(0.1 + 0.2);                 // как считает компьютер\nconsole.log(stepQty(0.1, 0.1, 1));      // шаг «+»\nconsole.log(stepQty(0, 0.5, -1));       // ниже нуля не уйдёт\nconsole.log(fmtQty(2.5, \"кг\"));         // запятая и единица\nconsole.log(fmtMoney(12345));           // деньги с пробелами\n",
      "out": "0.30000000000000004\n0.2\n0\n2,5 кг\n12 345 ₸",
      "expect": [
       "0.30000000000000004",
       "0.2",
       "0",
       "2,5 кг",
       "12 345 ₸"
      ]
     }
    },
    {
     "id": "s-code",
     "title": "Короткий код для второго телефона",
     "file": "js/sync.js",
     "lines": "56–63",
     "lang": "js",
     "code": "function newPairCode(cryptoImpl) {\n  var c = cryptoImpl || (typeof crypto !== \"undefined\" ? crypto : null);\n  var alphabet = \"abcdefghijkmnpqrstuvwxyz23456789\", bytes = new Uint8Array(4), code = \"\";\n  if (c && c.getRandomValues) c.getRandomValues(bytes);\n  else for (var i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);\n  for (var j = 0; j < 4; j++) code += alphabet[bytes[j] % alphabet.length];\n  return code;\n}",
     "nums": [
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63
     ],
     "bridge": "Цикл `for` собирает строку из четырёх знаков — как будто ты четыре раза написал символ в print и склеил.",
     "notes": [
      "`alphabet` — только удобные знаки: нет `l`, `o`, `0`, `1`, которые путают.",
      "`getRandomValues` — случайные числа, пригодные для защиты; `% alphabet.length` превращает их в номер буквы.",
      "Если случайных чисел нет, запасной путь — `Math.random()` (ветка `else`).",
      "Запусти пример несколько раз: код каждый раз новый. Живёт он 15 минут и подходит один раз."
     ],
     "demo": {
      "lang": "js",
      "code": "// Функция из js/sync.js\nfunction newPairCode(cryptoImpl) {\n  var c = cryptoImpl || (typeof crypto !== \"undefined\" ? crypto : null);\n  var alphabet = \"abcdefghijkmnpqrstuvwxyz23456789\", bytes = new Uint8Array(4), code = \"\";\n  if (c && c.getRandomValues) c.getRandomValues(bytes);\n  else for (var i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);\n  for (var j = 0; j < 4; j++) code += alphabet[bytes[j] % alphabet.length];\n  return code;\n}\n\nconsole.log(newPairCode());\nconsole.log(newPairCode());\nconsole.log(newPairCode());\n",
      "out": null,
      "outNote": "Код каждый раз новый.",
      "expectRegex": [
       "^[a-km-z2-9]{4}$"
      ]
     }
    }
   ]
  },
  {
   "id": "zadaniya",
   "name": "Задания группы",
   "icon": "check",
   "tagline": "Все задания, лекции и файлы группы в одном месте: отметки «сделано», личные заметки, вход через Google.",
   "stack": [
    "JavaScript (модули)",
    "Firebase",
    "GitHub Pages"
   ],
   "stat": null,
   "where": "исходники в архиве на твоём ПК",
   "commit": null,
   "tree": [
    [
     "assets/js/model.js",
     "Чистые функции данных (без экрана и сети) — под тесты"
    ],
    [
     "assets/js/views/",
     "Экраны: предметы, задания, материал, профиль, вход"
    ],
    [
     "assets/js/backend.js",
     "Договор «что умеет бэкенд»: настоящий Firebase и тестовая подмена"
    ],
    [
     "assets/js/ui.js, theme.js",
     "Общие кусочки интерфейса и темы"
    ],
    [
     "dist/",
     "Собранный сайт, который лежит на GitHub Pages"
    ],
    [
     "dist/firestore.rules",
     "Правила доступа в базе"
    ]
   ],
   "snippets": [
    {
     "id": "z-status",
     "title": "Три статуса задания по кругу",
     "file": "assets/js/model.js",
     "lines": "31–46",
     "lang": "js",
     "code": "export const STATUS_LABEL = /** @type {Record<Status,string>} */ ({\n  todo: 'Не начато',\n  doing: 'В процессе',\n  done: 'Готово',\n});\n\n/** @param {Progress|undefined} progress @param {string} id @returns {Status} */\nexport function statusOf(progress, id) {\n  const s = progress?.[id]?.s;\n  return s === 'doing' || s === 'done' ? s : 'todo';\n}\n\n/** @param {Status} s @returns {Status} */\nexport function nextStatus(s) {\n  return s === 'todo' ? 'doing' : s === 'doing' ? 'done' : 'todo';\n}",
     "nums": [
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46
     ],
     "bridge": "Здесь нет print: функции только принимают значения и возвращают ответ — именно так устроена логика приложений.",
     "notes": [
      "`STATUS_LABEL` — объект «код статуса → подпись на экране»: в данных хранится `done`, а человек видит «Готово».",
      "`progress?.[id]?.s` — «безопасный доступ»: если записи нет, будет `undefined`, а не ошибка.",
      "`nextStatus` — вложенные условия `? :` замыкают круг: не начато → в процессе → готово → не начато.",
      "В начале файла стоит `// @ts-check`, а над функциями — комментарии `@param`: редактор по ним проверяет типы."
     ]
    }
   ]
  },
  {
   "id": "cleanup",
   "name": "Инструменты уборки диска и фото",
   "icon": "folder",
   "tagline": "Скрипты на Python и PowerShell: скопировать фото с iPhone, разложить по годам и категориям, заменить дубликаты ссылками и отменить всё, если что-то пошло не так.",
   "stack": [
    "Python",
    "PowerShell"
   ],
   "stat": "760 строк кода",
   "where": "D:\\Cleanup",
   "commit": null,
   "tree": [
    [
     "Copy-iPhone.ps1",
     "Копирует фото с iPhone по одному файлу; на телефоне ничего не удаляет и не меняет"
    ],
    [
     "Sort-Photos.py",
     "Раскладывает фото по годам и месяцам, скриншоты — по категориям (по тексту на них)"
    ],
    [
     "Link-Duplicates.py",
     "Одинаковые файлы заменяет жёсткими ссылками: для тебя ничего не пропадает"
    ],
    [
     "Undo-Sort.py",
     "Возвращает всё на места по журналу moves-*.csv"
    ],
    [
     "Backup-ToFlash.py",
     "Вторая копия на флешку с контрольными суммами"
    ],
    [
     "Cleanup-Disk.ps1",
     "Очистка диска: без флага -Execute ничего не удаляет"
    ],
    [
     "GUIDE-for-Claude.md",
     "Памятка, как всё это запускать безопасно"
    ]
   ],
   "snippets": [
    {
     "id": "c-dry",
     "title": "По умолчанию — только план, ничего не меняется",
     "file": "Sort-Photos.py",
     "lines": "16–17, 26–27",
     "lang": "py",
     "code": "python Sort-Photos.py                # plan + report only\npython Sort-Photos.py --execute      # do it\n…\nap.add_argument(\"--execute\", action=\"store_true\")\na = ap.parse_args()",
     "nums": [
      16,
      17,
      0,
      26,
      27
     ],
     "bridge": "Это урок про осторожность: программа, которая работает с твоими файлами, сначала показывает, что сделает, и ждёт явного «делай».",
     "notes": [
      "Строки 16–17 — начало справки: без параметров скрипт только строит план и отчёт.",
      "`ap.add_argument(\"--execute\", action=\"store_true\")` — параметр командной строки без значения: нет флага — `False`.",
      "`a = ap.parse_args()` читает то, что ты набрал после имени скрипта. Дальше в коде реальные действия выполняются только при `a.execute`.",
      "Такие правила («сначала только план», журнал операций, отмена) появились после уборки диска, когда удаление «безопасных» данных программы дважды её сломало."
     ]
    },
    {
     "id": "c-regex",
     "title": "Шаблоны поиска: сумма, ссылка, телефон, дата",
     "file": "Sort-Photos.py",
     "lines": "51–55",
     "lang": "py",
     "code": "RE_AMOUNT = re.compile(r\"(\\d[\\d\\s.,]{0,12}\\d|\\d)\\s?(₸|тг\\b|тенге|kzt|руб\\w*|₽|\\$|usd|eur|€)\", re.I)\nRE_URL = re.compile(r\"(https?://\\S+|www\\.\\S+|\\b[\\w-]+\\.(?:com|kz|ru|org|net|io|me|app)\\b\\S*)\", re.I)\nRE_PHONE = re.compile(r\"(?:\\+7|\\b8)[\\s\\-()]*7\\d{2}[\\s\\-()]*\\d{3}[\\s\\-]*\\d{2}[\\s\\-]*\\d{2}\")\nRE_MAIL = re.compile(r\"[\\w.+-]+@[\\w-]+\\.[\\w.]+\")\nRE_DATE = re.compile(r\"\\b\\d{1,2}[./]\\d{1,2}[./]\\d{2,4}\\b\")",
     "nums": [
      51,
      52,
      53,
      54,
      55
     ],
     "bridge": "Запусти пример на Python: он находит в обычном тексте сумму, адрес сайта, номер телефона и дату — так скрипт разбирает текст со скриншотов.",
     "notes": [
      "`re.compile(r\"…\")` — заранее собранный шаблон поиска; `r` перед кавычками значит «не трогай обратные слеши».",
      "`\\d` — цифра, `\\s` — пробел, `|` — «или», `{0,12}` — «от 0 до 12 раз».",
      "`re.I` — не различать заглавные и строчные.",
      "`.search(text).group(0)` — найти первое совпадение и показать найденный кусок."
     ],
     "demo": {
      "lang": "py",
      "code": "import re\n\nRE_AMOUNT = re.compile(r\"(\\d[\\d\\s.,]{0,12}\\d|\\d)\\s?(₸|тг\\b|тенге|kzt|руб\\w*|₽|\\$|usd|eur|€)\", re.I)\nRE_URL = re.compile(r\"(https?://\\S+|www\\.\\S+|\\b[\\w-]+\\.(?:com|kz|ru|org|net|io|me|app)\\b\\S*)\", re.I)\nRE_PHONE = re.compile(r\"(?:\\+7|\\b8)[\\s\\-()]*7\\d{2}[\\s\\-()]*\\d{3}[\\s\\-]*\\d{2}[\\s\\-]*\\d{2}\")\nRE_MAIL = re.compile(r\"[\\w.+-]+@[\\w-]+\\.[\\w.]+\")\nRE_DATE = re.compile(r\"\\b\\d{1,2}[./]\\d{1,2}[./]\\d{2,4}\\b\")\n\ntext = \"Оплата 2 800 ₸ на kaspi.kz — звонить +7 701 123 45 67 (чек от 07.11.2026)\"\nprint(RE_AMOUNT.search(text).group(0))\nprint(RE_URL.search(text).group(0))\nprint(RE_PHONE.search(text).group(0))\nprint(RE_DATE.search(text).group(0))\n",
      "out": "2 800 ₸\nkaspi.kz\n+7 701 123 45 67\n07.11.2026",
      "expect": [
       "2 800 ₸",
       "kaspi.kz",
       "+7 701 123 45 67",
       "07.11.2026"
      ]
     }
    }
   ]
  },
  {
   "id": "transcriber",
   "name": "Транскрибатор испанского",
   "icon": "text",
   "tagline": "Скрипт на Python: берёт испанский текст (мексиканский вариант) и записывает, как он читается, русскими буквами, с ударениями.",
   "stack": [
    "Python"
   ],
   "stat": "225 строк кода",
   "where": "D:\\Claude\\Suffluer",
   "commit": null,
   "tree": [
    [
     "transcriber.py",
     "Один файл: словари букв, правила ударения и чтение текста из консоли или из файла"
    ]
   ],
   "snippets": [
    {
     "id": "t-dict",
     "title": "Словари: «буква → буква»",
     "file": "transcriber.py",
     "lines": "14–27",
     "lang": "py",
     "code": "ACUTE = \"\\u0301\"          # значок ударения\nE_LETTER = \"э\"            # можно поменять на \"е\", если так читать привычнее\n\nVOWELS = \"aeiouáéíóúü\"\nWEAK = \"iuü\"              # слабые гласные (без ударного знака)\nACCENTED = \"áéíóú\"\n\nVOWEL_MAP = {\n    \"a\": \"а\", \"á\": \"а\",\n    \"e\": E_LETTER, \"é\": E_LETTER,\n    \"i\": \"и\", \"í\": \"и\",\n    \"o\": \"о\", \"ó\": \"о\",\n    \"u\": \"у\", \"ú\": \"у\", \"ü\": \"у\",\n}",
     "nums": [
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27
     ],
     "bridge": "Тот же Python, что в уроке: строки в кавычках, только теперь их много и они собраны в таблицу соответствий.",
     "notes": [
      "Константы пишут ЗАГЛАВНЫМИ: это договорённость «не менять по ходу программы».",
      "`VOWEL_MAP = { \"a\": \"а\", … }` — словарь: слева испанская буква, справа русская.",
      "Одна и та же русская «а» стоит и у `\"a\"`, и у `\"á\"` — ударение обрабатывается отдельно.",
      "Комментарий после `#` объясняет, что можно поменять: `\"э\"` на `\"е\"`."
     ]
    },
    {
     "id": "t-main",
     "title": "Главная часть: print, input и функции",
     "file": "transcriber.py",
     "lines": "192–225",
     "lang": "py",
     "code": "def transcribe_text(text):\n    return WORD_RE.sub(lambda m: transcribe_word(m.group()), text)\n\n\ndef process(text):\n    for line in text.splitlines():\n        if line.strip():\n            print(line)\n            print(transcribe_text(line))\n        print()\n\n\ndef main():\n    if len(sys.argv) > 1:\n        with open(sys.argv[1], encoding=\"utf-8\") as f:\n            process(f.read())\n        return\n\n    print(\"Вставь испанский текст. Пустая строка - конец ввода.\\n\")\n    lines = []\n    while True:\n        try:\n            line = input()\n        except EOFError:\n            break\n        if not line.strip():\n            break\n        lines.append(line)\n    print()\n    process(\"\\n\".join(lines))\n\n\nif __name__ == \"__main__\":\n    main()",
     "nums": [
      192,
      193,
      194,
      195,
      196,
      197,
      198,
      199,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207,
      208,
      209,
      210,
      211,
      212,
      213,
      214,
      215,
      216,
      217,
      218,
      219,
      220,
      221,
      222,
      223,
      224,
      225
     ],
     "bridge": "Здесь живут `print` и `input` — команда, которую ты написал сегодня, и её «парная»: input читает то, что ввёл человек.",
     "notes": [
      "`def` — своя функция. `process(text)` в цикле берёт строки и для каждой печатает оригинал и транскрипцию.",
      "`print()` без аргументов печатает пустую строку — так между строками появляется просвет.",
      "`while True` + `input()` — читаем строки, пока человек не пришлёт пустую.",
      "`if __name__ == \"__main__\": main()` — «запусти main, только если файл запущен напрямую, а не подключён как модуль»."
     ]
    }
   ]
  },
  {
   "id": "bastau",
   "name": "Бастау (то, что ты сейчас открыл)",
   "icon": "code",
   "tagline": "Это приложение: урок Hello World, повторения по расписанию и песочница. Посмотри, как устроены его «мозги».",
   "stack": [
    "JavaScript",
    "Pyodide (Python в браузере)",
    "PWA"
   ],
   "stat": "2 241 строк кода",
   "where": "D:\\bastau",
   "commit": "1d8a913 (+ правки без коммита)",
   "tree": [
    [
     "js/core.js",
     "Чистая логика (тестируется в Node): повторения, серия, проверка ответов, подсветка кода"
    ],
    [
     "js/course.js",
     "Тексты и данные урока"
    ],
    [
     "js/steps.js",
     "Каждый тип шага: предсказание, блоки, пропуски, код, вопросы"
    ],
    [
     "js/runner.js, py-worker.js, js-worker.js",
     "Запуск твоего кода в отдельном потоке с таймаутом 5 секунд"
    ],
    [
     "js/app.js",
     "Вкладки, плеер урока, повторение, песочница, прогресс"
    ],
    [
     "tests/",
     "Проверки логики и сквозные прогоны урока"
    ]
   ],
   "snippets": [
    {
     "id": "b-schedule",
     "title": "Когда карточка вернётся",
     "file": "js/core.js",
     "lines": "33–48",
     "lang": "js",
     "code": "function schedule(card, outcome, now) {\n  var c = Object.assign({}, card);\n  c.reps = (c.reps || 0) + 1;\n  c.last = now;\n  if (outcome === 'again') {\n    c.lapses = (c.lapses || 0) + 1;\n    c.stage = Math.max(0, c.stage - 2);\n    c.due = now + 10 * 60000;\n    c.relearn = true;\n    return c;\n  }\n  if (c.relearn) { c.relearn = false; outcome = 'hard'; }\n  if (outcome === 'good') c.stage = Math.min(c.stage + 1, INTERVALS.length - 1);\n  c.due = addDays(startOfDay(now), INTERVALS[c.stage]);\n  return c;\n}",
     "nums": [
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48
     ],
     "bridge": "Вот код, который после урока решает, когда тебе завтра вернуть Hello World: вспомнил — интервал растёт, не вспомнил — вернёмся через 10 минут.",
     "notes": [
      "`outcome` — одно из трёх слов: `\"good\"`, `\"hard\"`, `\"again\"` — ответ сравнивается строками в кавычках.",
      "`Math.max(0, c.stage - 2)` — не вспомнил: шаг назад, но не ниже нуля.",
      "`Math.min(c.stage + 1, INTERVALS.length - 1)` — вспомнил: шаг вперёд, но не дальше последнего интервала (потолок).",
      "Функция не меняет карточку, а возвращает новую копию: так проще тестировать (см. `tests/core.test.js`)."
     ]
    },
    {
     "id": "b-check",
     "title": "Как приложение сверяет твой вывод",
     "file": "js/core.js",
     "lines": "115–127",
     "lang": "js",
     "code": "function checkOutput(actual, expected) {\n  var a = normOut(actual), e = normOut(expected);\n  if (a === e) return { ok: true };\n  if (a === '') return { ok: false, code: 'empty', msg: 'Программа ничего не вывела. Выводит на экран только команда вывода — проверь, что она есть и что ты нажал «Запустить».' };\n  if (a.toLowerCase() === e.toLowerCase()) return { ok: false, code: 'case', msg: 'Заглавные и строчные буквы — разные символы. Сравни регистр букв.' };\n  if (a.replace(/\\s+/g, '') === e.replace(/\\s+/g, '')) return { ok: false, code: 'space', msg: 'Слова верные, но пробелы или переносы строк отличаются.' };\n  var al = a.split('\\n'), el = e.split('\\n');\n  if (al.length !== el.length) return { ok: false, code: 'lines', msg: 'Нужно строк: ' + el.length + ', выведено: ' + al.length + '. Каждая команда вывода печатает свою строку.' };\n  for (var i = 0; i < el.length; i++) {\n    if (al[i] !== el[i]) return { ok: false, code: 'diff', line: i + 1, msg: 'Строка ' + (i + 1) + ' отличается от нужной. Сравни посимвольно: знаки препинания, пробелы, регистр.' };\n  }\n  return { ok: false, code: 'diff', msg: 'Вывод отличается от нужного.' };\n}",
     "nums": [
      115,
      116,
      117,
      118,
      119,
      120,
      121,
      122,
      123,
      124,
      125,
      126,
      127
     ],
     "bridge": "Когда ты запускаешь программу в уроке, твой вывод сравнивается с ожидаемым — вот эта функция. Поэтому «hello» с маленькой буквы получает отдельную подсказку.",
     "notes": [
      "Цепочка `if … return`: сначала самый частый случай (всё верно), потом пустой вывод, потом регистр, пробелы, число строк.",
      "`a.toLowerCase() === e.toLowerCase()` — совпадает без учёта регистра → подсказка «заглавные и строчные — разные символы».",
      "`a.split(\"\\n\")` — разрезать вывод на строки; цикл `for` ищет первую отличающуюся.",
      "Каждый ответ — объект с полем `code`: по нему интерфейс понимает, какую подсказку показать."
     ]
    }
   ]
  }
 ]
};
