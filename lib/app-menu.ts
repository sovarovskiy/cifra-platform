export type AppMenuItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type AppMenuSection = {
  id: string;
  title: string;
  description: string;
  href: string;
};

/** Две главные кнопки меню */
export const MAIN_MENU_SECTIONS: AppMenuSection[] = [
  {
    id: "ogz",
    title: "ОГЗ",
    description: "Скрипт, тест, справочник и материалы по огнезащите",
    href: "/menu/ogz",
  },
  {
    id: "pozharka",
    title: "Пожарка",
    description: "Обучение и разделы по пожарной безопасности",
    href: "/menu/pozharka",
  },
];

/** Разделы внутри «ОГЗ» (бывшее плоское меню) */
export const OGZ_MENU_ITEMS: AppMenuItem[] = [
  {
    id: "ogz-script",
    title: "Скрипт квал ОГЗ",
    description: "Квалификация лида по телефону по скрипту ОГЗ",
    href: "/script/ogz",
  },
  {
    id: "sales-model",
    title: "Модель продаж",
    description: "Воронка и этапы работы с клиентом",
    href: "/sales-model",
  },
  {
    id: "jtbd",
    title: "JTBD",
    description: "Сегменты клиентов: задачи и язык продаж",
    href: "/jtbd",
  },
  {
    id: "our-objects",
    title: "Наши объекты",
    description: "Примеры реализованных проектов",
    href: "/our-objects",
  },
  {
    id: "reference",
    title: "Референс",
    description: "Справочник ОГЗ (м²) из Google Таблицы",
    href: "/reference",
  },
  {
    id: "test",
    title: "Тест",
    description: "20 случайных вопросов из банка; порог сдачи 16/20",
    href: "/test",
  },
];

/** Разделы внутри «Пожарка» */
export const POZHARKA_MENU_ITEMS: AppMenuItem[] = [
  {
    id: "obuchenie",
    title: "Обучение",
    description: "Статьи и материалы по пожарной безопасности",
    href: "/pozharka/obuchenie",
  },
];

/** Материалы внутри «Обучение» */
export const OBUCHENIE_MENU_ITEMS: AppMenuItem[] = [
  {
    id: "sp551-parkings",
    title: "Подземные паркинги и электромобили что меняет СП 551",
    description: "СП 551.1311500.2026: требования к стоянкам с электромобилями",
    href: "/pozharka/obuchenie/sp-551-parkings",
  },
];

/** @deprecated используйте OGZ_MENU_ITEMS */
export const APP_MENU_ITEMS = OGZ_MENU_ITEMS;

export function isAppHome(pathname: string): boolean {
  return pathname === "/";
}

export function isMenuPage(pathname: string): boolean {
  return pathname === "/menu" || pathname.startsWith("/menu/");
}

/** @deprecated use isMenuPage */
export function isMenuHome(pathname: string): boolean {
  return isMenuPage(pathname);
}

export function isOgzScript(pathname: string): boolean {
  return pathname.startsWith("/script/ogz");
}

export function isSalesModel(pathname: string): boolean {
  return pathname.startsWith("/sales-model");
}

export function isJtbd(pathname: string): boolean {
  return pathname.startsWith("/jtbd");
}

export function isOurObjects(pathname: string): boolean {
  return pathname.startsWith("/our-objects");
}

export function isReference(pathname: string): boolean {
  return pathname.startsWith("/reference");
}

export function isTest(pathname: string): boolean {
  return pathname.startsWith("/test");
}

export function isPozharka(pathname: string): boolean {
  return pathname.startsWith("/pozharka");
}
