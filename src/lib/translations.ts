// Landing-page copy in both languages. `en` is the source of truth for the shape;
// `ru` is typed as `typeof en`, so the compiler flags any missing/extra key.

const en = {
  header: {
    navHow: "How it works",
    navProduct: "Product",
    navMac: "Mac app",
    download: "Download",
  },
  hero: {
    titleLine1: "Launch your Mac",
    titleLine2Pre: "from your ",
    titleAccent: "iPhone.",
    scene: ["You tap…", "Your Mac launches…", "You're back in flow."],
    subtitle: "Apps, sites and whole workspaces on your Mac one tap away on your iPhone.",
    ctaPrimary: "Download on the App Store",
    ctaSecondary: "See how it works",
  },
  how: {
    eyebrow: "Setup",
    titleLine1: "Download once. Pair once.",
    titleLine2: "Launch every day.",
    subtitle:
      "Pairing is the whole setup. With both devices on the same Wi-Fi, your iPhone finds your Mac and connects with a short code, with no accounts or cables.",
    steps: [
      {
        title: "Install Fiple for Mac",
        body: "The Mac app sits in your menu bar and does the launching. Set up your workspaces and Fiple Bar once.",
      },
      {
        title: "Pair your iPhone",
        body: "Open Fiple on your iPhone. It scans your local network for your Mac. Enter the 4-digit code to pair.",
      },
      {
        title: "Tap. Your Mac moves.",
        body: "Run a whole workspace or fire a single app from the Fiple Bar. No windows, docks, or Cmd-Tab.",
      },
    ],
  },
  mac: {
    eyebrow: "The Mac app",
    titleLine1: "Set it up on your Mac.",
    titleLine2: "Run it from your pocket.",
    subtitle:
      "Build your workspaces and Fiple Bar on the big screen. Everything you arrange here is instantly tappable on your iPhone.",
  },
  product: {
    eyebrow: "What Fiple does",
    title: "Anything on your Mac, one tap away on your iPhone.",
    features: [
      { title: "Apps", body: "Launch any Mac app the instant you tap it, with no Dock or Cmd-Tab." },
      { title: "Websites", body: "Open your saved sites and dashboards straight in your browser." },
      { title: "Workspaces", body: "Bundle apps and sites together, then run the whole set at once." },
      { title: "Fiple Bar", body: "Pin your most-used single apps for true one-tap launches." },
      { title: "Smart Trash", body: "Triage stale files from your phone: swipe to trash or keep, with undo. Everything goes to the macOS Trash, nothing is deleted for good." },
      { title: "Remote Terminal", body: "A full interactive Mac terminal on your iPhone, over its own encrypted channel. In the direct-download version only." },
    ],
  },
  useCases: {
    eyebrow: "Why Fiple",
    title: "Not a remote desktop. Not another dock.",
    subtitle:
      "Fiple is a second command surface for your Mac, the fastest way to start what you were about to do, whoever you are.",
  },
  download: {
    badge: "Available now",
    title: "Fiple is out for Mac & iPhone.",
    subtitle: "One universal app for your Mac and iPhone. Download it free on the App Store.",
    appStore: "Download on the App Store",
    macDirect: "Download for Mac (.dmg)",
    emailAria: "Email address",
    submitIdle: "Keep me posted",
    submitting: "Sending…",
    status: {
      default: "Prefer email? Get occasional product updates, no spam.",
      emptyEmail: "Enter your email to get updates.",
      adding: "Signing you up…",
      already: "You're already subscribed. We'll keep you posted.",
      success: "You're subscribed. We'll keep you posted on what's next.",
      error: "Something went wrong. Try again, or email us directly.",
    },
  },
  footer: {
    legalSupport: "Help & Support",
    legalPrivacy: "Privacy Policy",
    legalTerms: "Terms of Service",
    getInTouch: "Get in touch:",
    backToTop: "Back to top",
  },
  legalPage: {
    back: "Back to home",
    updated: "Last updated",
  },
  downloadPage: {
    eyebrow: "Download",
    title: "Fiple for Mac is downloading…",
    subtitle: "The full version — with Terminal.",
    ifNotStarted: "If the download didn't start,",
    retry: "click here",
    stepsHeading: "Install in three steps",
    steps: [
      "Open the downloaded Fiple-1.1.0.dmg — a window with Fiple and Applications appears.",
      "Drag Fiple into Applications right in that window (replace the old version).",
      "Launch Fiple → Settings → Terminal → enable it and set a password — the Terminal card on your iPhone comes alive on its own.",
    ],
    note: "Notarized by Apple. Requires macOS 14 or later.",
  },
  langToggle: {
    aria: "Language",
  },
};

const ru: typeof en = {
  header: {
    navHow: "Как это работает",
    navProduct: "Возможности",
    navMac: "Приложение для Mac",
    download: "Скачать",
  },
  hero: {
    titleLine1: "Запускайте Mac",
    titleLine2Pre: "прямо с ",
    titleAccent: "iPhone.",
    scene: ["Вы касаетесь…", "Mac запускается…", "И вы снова в потоке."],
    subtitle: "Приложения, сайты и целые рабочие пространства Mac в одном касании на iPhone.",
    ctaPrimary: "Скачать в App Store",
    ctaSecondary: "Как это работает",
  },
  how: {
    eyebrow: "Настройка",
    titleLine1: "Установите один раз. Подключите один раз.",
    titleLine2: "Запускайте каждый день.",
    subtitle:
      "Вся настройка сводится к сопряжению. Когда оба устройства в одной сети Wi-Fi, iPhone находит ваш Mac и подключается по короткому коду, без аккаунтов и кабелей.",
    steps: [
      {
        title: "Установите Fiple для Mac",
        body: "Приложение для Mac живёт в строке меню и выполняет запуск. Настройте рабочие пространства и Fiple Bar один раз.",
      },
      {
        title: "Подключите iPhone",
        body: "Откройте Fiple на iPhone, и он найдёт ваш Mac в локальной сети. Введите 4-значный код для сопряжения.",
      },
      {
        title: "Тап, и Mac действует.",
        body: "Запустите целое рабочее пространство или одно приложение из Fiple Bar. Без окон, дока и Cmd-Tab.",
      },
    ],
  },
  mac: {
    eyebrow: "Приложение для Mac",
    titleLine1: "Настройте на Mac.",
    titleLine2: "Запускайте из кармана.",
    subtitle:
      "Собирайте рабочие пространства и Fiple Bar на большом экране. Всё, что вы здесь настроите, мгновенно доступно по тапу на iPhone.",
  },
  product: {
    eyebrow: "Что умеет Fiple",
    title: "Что угодно на вашем Mac в одном тапе на iPhone.",
    features: [
      { title: "Приложения", body: "Запускайте любое приложение Mac в момент тапа, без дока и Cmd-Tab." },
      { title: "Сайты", body: "Открывайте сохранённые сайты и дашборды прямо в браузере." },
      { title: "Рабочие пространства", body: "Соберите приложения и сайты вместе и запускайте весь набор сразу." },
      { title: "Fiple Bar", body: "Закрепите самые нужные приложения для запуска в один тап." },
      { title: "Smart Trash", body: "Разбирайте залежавшиеся файлы с телефона: свайп — в корзину или оставить, с отменой. Всё уходит в Корзину macOS, ничего не удаляется навсегда." },
      { title: "Remote Terminal", body: "Полноценный интерактивный терминал Mac на iPhone по отдельному зашифрованному каналу. Только в версии, скачанной с сайта." },
    ],
  },
  useCases: {
    eyebrow: "Почему Fiple",
    title: "Не удалённый рабочий стол. И не ещё один док.",
    subtitle:
      "Fiple становится второй панелью управления вашим Mac: самый быстрый способ начать то, что вы собирались сделать, кем бы вы ни были.",
  },
  download: {
    badge: "Уже доступно",
    title: "Fiple вышел для Mac и iPhone.",
    subtitle: "Одно универсальное приложение для Mac и iPhone. Скачайте бесплатно в App Store.",
    appStore: "Скачать в App Store",
    macDirect: "Скачать для Mac (.dmg)",
    emailAria: "Адрес эл. почты",
    submitIdle: "Держите в курсе",
    submitting: "Отправляем…",
    status: {
      default: "Предпочитаете email? Иногда шлём новости о продукте, без спама.",
      emptyEmail: "Введите email, чтобы получать новости.",
      adding: "Подписываем вас…",
      already: "Вы уже подписаны. Будем держать в курсе.",
      success: "Вы подписаны. Расскажем, что дальше.",
      error: "Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.",
    },
  },
  footer: {
    legalSupport: "Помощь и поддержка",
    legalPrivacy: "Политика конфиденциальности",
    legalTerms: "Условия использования",
    getInTouch: "Связаться:",
    backToTop: "Наверх",
  },
  legalPage: {
    back: "На главную",
    updated: "Обновлено",
  },
  downloadPage: {
    eyebrow: "Загрузка",
    title: "Fiple для Mac скачивается…",
    subtitle: "Полная версия — с Терминалом.",
    ifNotStarted: "Если скачивание не началось,",
    retry: "нажмите сюда",
    stepsHeading: "Установка за три шага",
    steps: [
      "Откройте скачанный Fiple-1.1.0.dmg — появится окно с Fiple и папкой Applications.",
      "Перетащите Fiple в Applications прямо в этом окне (замените старую версию).",
      "Запустите Fiple → Settings → Terminal → включите и задайте пароль — карточка Terminal на iPhone оживёт сама.",
    ],
    note: "Приложение нотаризовано Apple. Требуется macOS 14 или новее.",
  },
  langToggle: {
    aria: "Язык",
  },
};

const kz: typeof en = {
  header: {
    navHow: "Қалай жұмыс істейді",
    navProduct: "Мүмкіндіктер",
    navMac: "Mac қосымшасы",
    download: "Жүктеу",
  },
  hero: {
    titleLine1: "Mac-ты",
    titleLine2Pre: "iPhone-нан ",
    titleAccent: "басқарыңыз.",
    scene: ["Сіз түртесіз…", "Mac іске қосылады…", "Қайта ағыныңыздасыз."],
    subtitle: "Mac-тағы қосымшалар, сайттар мен жұмыс кеңістіктері iPhone-да бір түртуде.",
    ctaPrimary: "App Store-дан жүктеу",
    ctaSecondary: "Қалай жұмыс істейтінін көру",
  },
  how: {
    eyebrow: "Баптау",
    titleLine1: "Бір рет жүктеңіз. Бір рет жұптаңыз.",
    titleLine2: "Күн сайын іске қосыңыз.",
    subtitle:
      "Барлық баптау жұптауға саяды. Екі құрылғы бір Wi-Fi желісінде болғанда, iPhone сіздің Mac-ты тауып, қысқа код арқылы жалғанады, аккаунтсыз әрі кабельсіз.",
    steps: [
      {
        title: "Fiple-ды Mac-қа орнатыңыз",
        body: "Mac қосымшасы мәзір жолағында тұрып, іске қосуды атқарады. Жұмыс кеңістіктері мен Fiple Bar-ды бір рет баптаңыз.",
      },
      {
        title: "iPhone-ды жұптаңыз",
        body: "iPhone-да Fiple-ды ашыңыз, ол жергілікті желіден Mac-ты іздейді. Жұптау үшін 4 таңбалы кодты енгізіңіз.",
      },
      {
        title: "Түртіңіз. Mac әрекет етеді.",
        body: "Бүкіл жұмыс кеңістігін немесе Fiple Bar-дан бір қосымшаны іске қосыңыз. Терезесіз, доксыз, Cmd-Tab-сыз.",
      },
    ],
  },
  mac: {
    eyebrow: "Mac қосымшасы",
    titleLine1: "Mac-та баптаңыз.",
    titleLine2: "Қалтаңыздан іске қосыңыз.",
    subtitle:
      "Жұмыс кеңістіктері мен Fiple Bar-ды үлкен экранда жинаңыз. Мұнда баптағаныңыздың бәрі iPhone-да бір түртумен қолжетімді.",
  },
  product: {
    eyebrow: "Fiple не істей алады",
    title: "Mac-тағы кез келген нәрсе iPhone-да бір түртуде.",
    features: [
      { title: "Қосымшалар", body: "Кез келген Mac қосымшасын түрткен сәтте іске қосыңыз, доксыз әрі Cmd-Tab-сыз." },
      { title: "Сайттар", body: "Сақталған сайттарыңыз бен дашбордтарды тікелей браузерде ашыңыз." },
      { title: "Жұмыс кеңістіктері", body: "Қосымшаларды және сайттарды біріктіріп, бүкіл жиынтықты бірден іске қосыңыз." },
      { title: "Fiple Bar", body: "Ең қажет қосымшаларды бекітіп, бір түртумен іске қосыңыз." },
      { title: "Smart Trash", body: "Ескі файлдарды телефоннан сұрыптаңыз: свайп — Себетке немесе қалдыру, болдырмау мүмкіндігімен. Барлығы macOS Себетіне түседі, ештеңе біржола жойылмайды." },
      { title: "Remote Terminal", body: "iPhone-да Mac-тың толыққанды интерактивті терминалы, бөлек шифрланған арна арқылы. Тек сайттан жүктелген нұсқада." },
    ],
  },
  useCases: {
    eyebrow: "Неге Fiple",
    title: "Қашықтағы жұмыс үстелі емес. Тағы бір док та емес.",
    subtitle:
      "Fiple сіздің Mac-ыңыз үшін екінші басқару беті болады: кім болсаңыз да, жасамақ болған ісіңізді бастаудың ең жылдам жолы.",
  },
  download: {
    badge: "Қолжетімді",
    title: "Fiple шықты Mac пен iPhone-ға.",
    subtitle: "Mac пен iPhone-ға арналған бір әмбебап қосымша. App Store-дан тегін жүктеңіз.",
    appStore: "App Store-дан жүктеу",
    macDirect: "Mac үшін жүктеу (.dmg)",
    emailAria: "Электрондық пошта",
    submitIdle: "Хабардар етіп тұрыңыз",
    submitting: "Жіберілуде…",
    status: {
      default: "Email қалайсыз ба? Анда-санда өнім жаңалықтарын жібереміз, спамсыз.",
      emptyEmail: "Жаңалықтар алу үшін email енгізіңіз.",
      adding: "Сізді жазудамыз…",
      already: "Сіз әлдеқашан жазылғансыз. Хабардар етіп тұрамыз.",
      success: "Сіз жазылдыңыз. Не боларын хабарлап тұрамыз.",
      error: "Бірдеңе дұрыс болмады. Қайта көріңіз немесе бізге тікелей жазыңыз.",
    },
  },
  footer: {
    legalSupport: "Көмек және қолдау",
    legalPrivacy: "Құпиялылық саясаты",
    legalTerms: "Пайдалану шарттары",
    getInTouch: "Байланыс:",
    backToTop: "Жоғарыға",
  },
  legalPage: {
    back: "Басты бетке",
    updated: "Жаңартылды",
  },
  downloadPage: {
    eyebrow: "Жүктеу",
    title: "Fiple Mac үшін жүктелуде…",
    subtitle: "Толық нұсқа — Терминалмен бірге.",
    ifNotStarted: "Жүктеу басталмаса,",
    retry: "мына жерді басыңыз",
    stepsHeading: "Үш қадаммен орнату",
    steps: [
      "Жүктелген Fiple-1.1.0.dmg файлын ашыңыз — Fiple мен Applications қалтасы бар терезе пайда болады.",
      "Fiple-ді дәл сол терезеде Applications қалтасына сүйреңіз (ескі нұсқаны алмастырыңыз).",
      "Fiple-ді іске қосыңыз → Settings → Terminal → қосып, құпиясөз орнатыңыз — iPhone-дағы Terminal карточкасы өзі жанданады.",
    ],
    note: "Қосымша Apple тарапынан нотаризацияланған. macOS 14 немесе одан жаңасы қажет.",
  },
  langToggle: {
    aria: "Тіл",
  },
};

export type Messages = typeof en;

export const messages: Record<"en" | "ru" | "kz", Messages> = { en, ru, kz };
