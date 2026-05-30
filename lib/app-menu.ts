export type AppMenuItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const APP_MENU_ITEMS: AppMenuItem[] = [
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
];

export function isAppHome(pathname: string): boolean {
  return pathname === "/";
}

export function isMenuPage(pathname: string): boolean {
  return pathname === "/menu";
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
