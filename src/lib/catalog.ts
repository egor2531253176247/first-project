export type Service = {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  days: number;
  material: string;
  image: string;
  features: string[];
};
export type Project = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  service: string;
  color: string;
  body: string;
  image: string;
  gallery: string[];
  material: string;
  duration: string;
  story: string;
  demo: boolean;
};
export type Material = {
  id: string;
  name: string;
  category: string;
  description: string;
};
export type Review = {
  id: string;
  name: string;
  car: string;
  text: string;
  rating: number;
};
export type Settings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  youtube: string;
  about: string;
};
export type Catalog = {
  services: Service[];
  projects: Project[];
  materials: Material[];
  reviews: Review[];
  settings: Settings;
};

export const services: Service[] = [
  {
    id: "ppf",
    name: "PPF PROTECTION",
    title: "Антигравийная защита",
    description:
      "Невидимая броня для лакокрасочного покрытия. Сохраняет заводской цвет и принимает удары на себя.",
    price: 210000,
    days: 4,
    material: "XPEL / STEK / SunTek",
    image: "/images/porsche.webp",
    features: [
      "Полиуретановая плёнка",
      "Подвороты на доступных кромках",
      "Защита от сколов и реагентов",
      "Контроль каждого элемента",
    ],
  },
  {
    id: "wrap",
    name: "VINYL WRAP",
    title: "Оклейка винилом",
    description:
      "Новый цвет. Тот же характер. Глянец, сатин, матовые и индивидуальные фактуры.",
    price: 180000,
    days: 4,
    material: "3M / Avery Dennison / Hexis",
    image: "/images/taycan.webp",
    features: [
      "Индивидуальный подбор цвета",
      "Без изменения заводской краски",
      "Глянцевые и матовые фактуры",
      "Проверка образца при дневном свете",
    ],
  },
  {
    id: "paint",
    name: "PAINT",
    title: "Профессиональная покраска",
    description:
      "От восстановления элемента до индивидуального цвета. Геометрия, подготовка, глубина отражения.",
    price: 35000,
    days: 3,
    material: "OEM color matching",
    image: "/images/porsche.webp",
    features: [
      "Компьютерный подбор оттенка",
      "Покраска в камере",
      "Контроль толщины покрытия",
      "Финишная полировка",
    ],
  },
  {
    id: "polishing",
    name: "POLISHING",
    title: "Коррекция и полировка",
    description:
      "Убираем следы времени. Восстанавливаем глубину цвета и чистоту каждого отражения.",
    price: 35000,
    days: 2,
    material: "Koch Chemie",
    image: "/images/studio.webp",
    features: [
      "Диагностика толщиномером",
      "Тестовый участок",
      "Многоэтапная коррекция",
      "Финиш без голограмм",
    ],
  },
  {
    id: "ceramic",
    name: "CERAMIC",
    title: "Керамическое покрытие",
    description:
      "Гидрофобность, блеск и более простой уход. Защита, которая работает каждый день.",
    price: 45000,
    days: 2,
    material: "Ceramic Pro / Gtechniq",
    image: "/images/taycan.webp",
    features: [
      "Подготовка поверхности",
      "Нанесение по регламенту",
      "Контролируемая выдержка",
      "Рекомендации по уходу",
    ],
  },
  {
    id: "detailing",
    name: "INTERIOR DETAILING",
    title: "Детейлинг салона",
    description:
      "Бережная очистка кожи, алькантары и текстиля. Сохраняем оригинальную фактуру материалов.",
    price: 28000,
    days: 2,
    material: "Koch Chemie",
    image: "/images/studio.webp",
    features: [
      "Уход за кожей",
      "Очистка труднодоступных зон",
      "Деликатная обработка алькантары",
      "Защита интерьерных материалов",
    ],
  },
  {
    id: "tint",
    name: "TINT",
    title: "Тонировка",
    description:
      "Приватность и комфорт с точной установкой и подбором светопропускания.",
    price: 20000,
    days: 1,
    material: "SunTek",
    image: "/images/porsche.webp",
    features: [
      "Подбор светопропускания",
      "Аккуратная установка",
      "Теплозащитные плёнки",
      "Соблюдение требований к остеклению",
    ],
  },
  {
    id: "restoration",
    name: "RESTORATION",
    title: "Реставрация элементов",
    description:
      "Восстанавливаем детали, сохраняя оригинальный характер автомобиля.",
    price: 15000,
    days: 2,
    material: "Individual restoration",
    image: "/images/studio.webp",
    features: [
      "Кожа и пластик",
      "Оптика и декоративные детали",
      "Локальное восстановление",
      "Подбор цвета и текстуры",
    ],
  },
  {
    id: "antichrome",
    name: "ANTICHROME",
    title: "Антихром",
    description:
      "Сдержанный контраст. Превращаем хромированные акценты в глянцевые или сатиновые детали.",
    price: 35000,
    days: 2,
    material: "3M / Avery Dennison",
    image: "/images/taycan.webp",
    features: [
      "Молдинги и решётки",
      "Рамки окон",
      "Глянец или сатин",
      "Единая цветовая композиция",
    ],
  },
];
export const projects: Project[] = [
  {
    id: "021",
    slug: "porsche-911-full-ppf",
    title: "PORSCHE 911 TURBO S",
    brand: "Porsche",
    service: "ppf",
    color: "Графит",
    body: "Купе",
    image: "/images/porsche.webp",
    gallery: [
      "/images/porsche.webp",
      "/images/hero.webp",
      "/images/studio.webp",
    ],
    material: "XPEL Ultimate Plus",
    duration: "4 дня",
    story:
      "Концепция полной защиты спортивного купе: плёнка на кузове, внимание к сложной геометрии бамперов и кромкам. Цель — сохранить оригинальный оттенок и чистоту отражений.",
    demo: true,
  },
  {
    id: "022",
    slug: "taycan-color-wrap",
    title: "PORSCHE TAYCAN",
    brand: "Porsche",
    service: "wrap",
    color: "Красный",
    body: "Седан",
    image: "/images/taycan.webp",
    gallery: ["/images/taycan.webp", "/images/studio.webp"],
    material: "Avery Dennison Supreme",
    duration: "5 дней",
    story:
      "Концепция смены цвета электрического спортивного седана. Глянцевая фактура подчёркивает линии кузова, а чёрные детали собирают образ.",
    demo: true,
  },
  {
    id: "023",
    slug: "911-paint-correction",
    title: "PORSCHE 911 CARRERA",
    brand: "Porsche",
    service: "polishing",
    color: "Серебристый",
    body: "Купе",
    image: "/images/studio.webp",
    gallery: ["/images/studio.webp", "/images/porsche.webp"],
    material: "Koch Chemie",
    duration: "2 дня",
    story:
      "Концепция восстановления глубины цвета и коррекции мелких дефектов покрытия с последующей защитой.",
    demo: true,
  },
  {
    id: "024",
    slug: "gt3-ceramic",
    title: "PORSCHE 911 GT3 RS",
    brand: "Porsche",
    service: "ceramic",
    color: "Серебристый",
    body: "Купе",
    image: "/images/hero.webp",
    gallery: ["/images/hero.webp", "/images/studio.webp"],
    material: "Gtechniq Crystal Serum",
    duration: "3 дня",
    story:
      "Концепция керамической защиты трекового автомобиля. Подготовка, нанесение и контроль выдержки — единый процесс.",
    demo: true,
  },
];
export const materials: Material[] = [
  ["xpel", "XPEL", "PPF", "Прозрачная полиуретановая защита кузова."],
  ["stek", "STEK", "PPF", "Защитные плёнки с различными фактурами."],
  ["suntek", "SunTek", "PPF / TINT", "Защитные и тонировочные плёнки."],
  ["3m", "3M", "WRAP", "Виниловые плёнки для изменения цвета."],
  ["avery", "Avery Dennison", "WRAP", "Премиальные цвета и покрытия."],
  ["hexis", "Hexis", "WRAP", "Фактуры для индивидуальных проектов."],
  ["ceramic", "Ceramic Pro", "CERAMIC", "Керамические защитные системы."],
  ["gtechniq", "Gtechniq", "CERAMIC", "Покрытия для кузова и стёкол."],
  [
    "koch",
    "Koch Chemie",
    "DETAILING",
    "Профессиональная химия для коррекции и ухода.",
  ],
].map(([id, name, category, description]) => ({
  id,
  name,
  category,
  description,
}));
export const defaultCatalog: Catalog = {
  services,
  projects,
  materials,
  reviews: [],
  settings: {
    name: "PRECISION",
    phone: "",
    email: "",
    address: "",
    hours: "Пн–Сб · 10:00–19:00",
    telegram: "",
    whatsapp: "",
    instagram: "",
    youtube: "",
    about:
      "Мы работаем с автомобилем как с объектом дизайна и инженерии. Каждый изгиб. Каждое отражение. Каждый миллиметр плёнки. Детали решают всё.",
  },
};
export const money = (amount: number) =>
  new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
export const packages = [
  {
    id: "front",
    name: "FRONT PACKAGE",
    title: "Передняя часть",
    price: 85000,
    days: "2–3 дня",
    zones: ["hood", "bumper", "fenders", "mirrors"],
  },
  {
    id: "track",
    name: "TRACK PACKAGE",
    title: "Зоны повышенного риска",
    price: 125000,
    days: "3–4 дня",
    zones: ["hood", "bumper", "fenders", "mirrors", "rockers"],
  },
  {
    id: "full",
    name: "FULL BODY",
    title: "Полная защита",
    price: 210000,
    days: "4–5 дней",
    zones: ["hood", "bumper", "fenders", "mirrors", "rockers", "doors", "roof"],
  },
];
export const colors = [
  {
    id: "graphite",
    name: "Graphite Black",
    hex: "#353638",
    brand: "Avery Dennison",
    code: "SW900-180",
    finish: "Satin",
  },
  {
    id: "red",
    name: "Racing Red",
    hex: "#c9252c",
    brand: "3M",
    code: "2080-G13",
    finish: "Gloss",
  },
  {
    id: "silver",
    name: "Liquid Silver",
    hex: "#a2a7ac",
    brand: "Avery Dennison",
    code: "SW900-803",
    finish: "Metallic",
  },
  {
    id: "green",
    name: "British Racing Green",
    hex: "#245348",
    brand: "Hexis",
    code: "HX20300B",
    finish: "Gloss",
  },
  {
    id: "blue",
    name: "Midnight Blue",
    hex: "#294c76",
    brand: "3M",
    code: "2080-M227",
    finish: "Matte",
  },
  {
    id: "sand",
    name: "Desert Sand",
    hex: "#a59070",
    brand: "Avery Dennison",
    code: "SW900-256",
    finish: "Satin",
  },
  {
    id: "shift",
    name: "Aurora Shift",
    hex: "#706a99",
    brand: "Avery Dennison",
    code: "SW900-673",
    finish: "Color shift",
  },
  {
    id: "carbon",
    name: "Carbon Black",
    hex: "#252525",
    brand: "3M",
    code: "2080-CFS12",
    finish: "Carbon",
  },
];
export const extras = [
  { id: "antichrome", name: "Антихром", price: 35000 },
  { id: "roof", name: "Контрастная крыша", price: 18000 },
  { id: "mirrors", name: "Корпуса зеркал", price: 8000 },
];
export const stages = [
  "CHECK-IN",
  "PREPARATION",
  "INSTALLATION",
  "QUALITY CONTROL",
  "READY",
];
export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "ESTIMATE SENT",
  "BOOKED",
  "IN PROGRESS",
  "COMPLETED",
  "LOST",
];
export const process = [
  ["CONSULTATION", "Слушаем задачу. Подбираем решение и материалы."],
  ["INSPECTION", "Оцениваем состояние покрытия и геометрию деталей."],
  ["PREPARATION", "Очищаем, обезжириваем и готовим поверхность."],
  ["INSTALLATION", "Работаем с каждым элементом по отдельности."],
  ["FINISHING", "Проверяем кромки, стыки и чистоту отражений."],
  ["QUALITY CONTROL", "Контролируем результат при направленном свете."],
  ["DELIVERY", "Передаём автомобиль и рекомендации по уходу."],
];
export const faq = [
  [
    "Что выбрать: PPF или керамику?",
    "PPF защищает от механических повреждений и сколов. Керамика упрощает уход и улучшает гидрофобность, но не заменяет плёнку. Решения можно комбинировать.",
  ],
  [
    "Сколько времени занимает полная оклейка?",
    "Обычно от 4 до 5 рабочих дней. Точный срок зависит от кузова, подготовки и выбранного материала; его согласовываем до начала работ.",
  ],
  [
    "Можно ли вернуть заводской цвет после винила?",
    "Качественная плёнка снимается профессионально. Перед оклейкой мы проверяем состояние покрытия; перекрашенные детали требуют отдельной оценки.",
  ],
  [
    "Когда можно мыть автомобиль после оклейки?",
    "Обычно через 7–10 дней, но приоритет имеет инструкция производителя конкретной плёнки. Не направляйте струю высокого давления на кромки.",
  ],
  [
    "Цена в конфигураторе окончательная?",
    "Это предварительный ориентир. Точная смета формируется после осмотра автомобиля и выбора конкретных материалов.",
  ],
];
export const articles = [
  {
    slug: "how-to-choose-ppf",
    title: "КАК ВЫБРАТЬ PPF",
    category: "PROTECTION",
    read: "5 минут",
    image: "/images/porsche.webp",
    paragraphs: [
      "Выбирайте полиуретановую плёнку по задаче: защита передней части, зон риска или всего кузова. Толщина — только один параметр; важны прозрачность, качество клеевого слоя и условия гарантии производителя.",
      "Попросите показать образец под направленным светом. Сравните чистоту отражений и фактуру поверхности. Уточните, какие кромки можно подвернуть и где конструкция требует видимого края.",
      "Качество установки важнее эффектной упаковки. До работы нужны диагностика покрытия, согласование подготовки и письменное описание объёма защиты.",
    ],
  },
  {
    slug: "ppf-or-ceramic",
    title: "PPF ИЛИ КЕРАМИКА?",
    category: "GUIDE",
    read: "4 минуты",
    image: "/images/hero.webp",
    paragraphs: [
      "Плёнка принимает на себя удары мелких камней. Керамика уменьшает сцепление загрязнений с поверхностью и добавляет гидрофобность. Эти технологии решают разные задачи.",
      "Для трассовых поездок в первую очередь имеет смысл защитить бампер, капот, крылья и зеркала. Для регулярного городского ухода керамическое покрытие может стать следующим шагом.",
      "Комбинированная схема — PPF на зонах риска и совместимое покрытие на остальных поверхностях. Совместимость и режим ухода определяются производителем.",
    ],
  },
  {
    slug: "matte-wrap-care",
    title: "УХОД ЗА МАТОВОЙ ПЛЁНКОЙ",
    category: "CARE",
    read: "3 минуты",
    image: "/images/studio.webp",
    paragraphs: [
      "Матовая поверхность требует нейтральных моющих составов без полирующих добавок. Абразивная обработка меняет фактуру, поэтому локальную полировку матовой плёнки не проводят.",
      "Птичий помёт, насекомых и следы реагентов удаляйте своевременно. Сначала размягчите загрязнение, затем снимите его мягкой салфеткой без сильного давления.",
      "Не подносите сопло мойки высокого давления к кромкам. Для сложных пятен обратитесь к установщику и используйте рекомендации производителя материала.",
    ],
  },
  {
    slug: "vinyl-lifetime",
    title: "СКОЛЬКО СЛУЖИТ ВИНИЛ",
    category: "WRAP",
    read: "4 минуты",
    image: "/images/taycan.webp",
    paragraphs: [
      "Срок службы зависит от линейки плёнки, климата и расположения элемента. Горизонтальные поверхности получают больше солнечного излучения, поэтому стареют быстрее.",
      "Гарантия на материал и гарантия на установку — разные условия. До начала работ уточните обе и сохраните документы с кодом материала.",
      "Регулярно осматривайте плёнку. Изменение фактуры, трещины или подъём края — повод показать автомобиль специалисту, а не откладывать демонтаж.",
    ],
  },
];
