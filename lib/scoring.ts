export type BudgetClass = "S" | "M" | "L" | "XL";
export type Potential = 10 | 20 | 30;
export type RegionGroup = "mo" | "regions";
export type ClientType =
  | "gen_gov"
  | "gen_private"
  | "developer"
  | "investor"
  | "owner"
  | "uk"
  | "other";
export type ContactRole = "lpr" | "lvr" | "lir";
export type ContractorTimeline = "1m" | "2-3m" | "3m_plus" | "no_object_periodic" | "later";
export type Readiness = "hot" | "medium" | "cold";
export type SelectionFactor = "expertise" | "timing" | "price" | "cheapest_only";

export type QualificationState = {
  clientName?: string;
  leadSource?: "transfer" | "application";
  transferName?: string;
  transferNote?: string;
  applicationPlace?: string;
  applicationTopic?: string;

  clientType?: ClientType;
  contactRole?: ContactRole;
  region?: RegionGroup;
  budgetRub?: number;
  budgetClass?: BudgetClass;
  potential?: Potential;
  readiness?: Readiness;
  contractorTimeline?: ContractorTimeline;
  tenderWon?: boolean;
  segment?: string;
  selectionFactors?: SelectionFactor[];
  hasOgzInterest?: boolean;
  noOgzRequests?: boolean;
  siteContact?: "lpr" | "lvr" | "unknown";
  jtbdLevel?: 1 | 2;
  documentation?: string;
  mchsPrescription?: boolean;
  competitors?: boolean;
  competitorOffers?: boolean;
};

export function budgetClassFromRub(rub: number): BudgetClass {
  if (rub >= 50_000_000) return "XL";
  if (rub >= 10_000_000) return "L";
  if (rub >= 3_000_000) return "M";
  if (rub >= 500_000) return "S";
  return "S";
}

export function potentialFromBudgetRepeat(
  potential: Potential | undefined
): Potential | undefined {
  return potential;
}

export type FunnelId =
  | "focus"
  | "longterm"
  | "development"
  | "not_sql"
  | "reserve"
  | "simplified";

export type PriorityId = "urgent" | "when_resources" | "dont";

export type FunnelResult = {
  funnel: FunnelId;
  funnelLabel: string;
  block?: string;
  reasons: string[];
};

export type PriorityResult = {
  priority: PriorityId;
  label: string;
  reasons: string[];
};

const FUNNEL_LABELS: Record<FunnelId, string> = {
  focus: "ОГЗ / фокусные",
  longterm: "ОГЗ / долгосрок",
  development: "ОГЗ / развитие",
  not_sql: "ОГЗ / не SQL",
  reserve: "ОГЗ / резервная база",
  simplified: "ОГЗ / упрощённая",
};

function timelineMonths(t: ContractorTimeline | undefined): number | null {
  if (!t) return null;
  if (t === "1m") return 1;
  if (t === "2-3m") return 2.5;
  if (t === "3m_plus") return 4;
  return null;
}

function tenderOk(s: QualificationState): boolean {
  const isGen =
    s.clientType === "gen_gov" || s.clientType === "gen_private";
  if (!isGen) return true;
  return s.tenderWon === true;
}

function matchFocus(s: QualificationState): FunnelResult | null {
  const { region, budgetClass, potential, contractorTimeline } = s;
  if (!region || !budgetClass || potential === undefined) return null;
  const months = timelineMonths(contractorTimeline);
  if (months === null) return null;
  if (!tenderOk(s)) return null;

  const checks: { block: string; ok: boolean; reasons: string[] }[] = [];

  if (
    region === "mo" &&
    ["M", "L", "XL"].includes(budgetClass) &&
    potential === 30 &&
    months <= 3
  ) {
    checks.push({
      block: "фокусные — блок 1",
      ok: true,
      reasons: [
        "Регион: Москва и МО",
        `Бюджет: ${budgetClass}`,
        "Потенциал: 30",
        "Срок выбора подрядчика: до 3 месяцев",
        ...(s.tenderWon ? ["Тендер выигран"] : []),
      ],
    });
  }

  if (
    region === "regions" &&
    ["L", "XL"].includes(budgetClass) &&
    potential === 30 &&
    months <= 3
  ) {
    checks.push({
      block: "фокусные — блок 2",
      ok: true,
      reasons: [
        "Регион: регионы",
        `Бюджет: ${budgetClass}`,
        "Потенциал: 30",
        "Срок выбора подрядчика: до 3 месяцев",
        ...(s.tenderWon ? ["Тендер выигран"] : []),
      ],
    });
  }

  if (
    region === "mo" &&
    ["M", "L", "XL"].includes(budgetClass) &&
    [10, 20].includes(potential) &&
    months <= 1
  ) {
    checks.push({
      block: "фокусные — блок 3",
      ok: true,
      reasons: [
        "Регион: Москва и МО",
        `Бюджет: ${budgetClass}`,
        `Потенциал: ${potential}`,
        "Срок выбора подрядчика: до 1 месяца",
        ...(s.tenderWon ? ["Тендер выигран"] : []),
      ],
    });
  }

  const hit = checks.find((c) => c.ok);
  if (!hit) return null;
  return {
    funnel: "focus",
    funnelLabel: FUNNEL_LABELS.focus,
    block: hit.block,
    reasons: hit.reasons,
  };
}

function matchLongterm(s: QualificationState): FunnelResult | null {
  const { region, budgetClass, potential, contractorTimeline } = s;
  if (
    region === "mo" &&
    budgetClass &&
    ["M", "L", "XL"].includes(budgetClass) &&
    potential === 30 &&
    contractorTimeline === "3m_plus" &&
    tenderOk(s)
  ) {
    return {
      funnel: "longterm",
      funnelLabel: FUNNEL_LABELS.longterm,
      block: "долгосрок — блок 1",
      reasons: [
        "Регион: Москва и МО",
        `Бюджет: ${budgetClass}`,
        "Потенциал: 30",
        "Срок выбора подрядчика: более 3 месяцев",
        ...(s.tenderWon ? ["Тендер выигран"] : []),
      ],
    };
  }
  return null;
}

function matchDevelopment(s: QualificationState): FunnelResult | null {
  const { region, budgetClass, potential, contractorTimeline } = s;
  if (
    region === "mo" &&
    budgetClass &&
    ["M", "L", "XL"].includes(budgetClass) &&
    potential === 30 &&
    contractorTimeline === "no_object_periodic"
  ) {
    return {
      funnel: "development",
      funnelLabel: FUNNEL_LABELS.development,
      block: "развитие — блок 1",
      reasons: [
        "Регион: Москва и МО",
        `Бюджет: ${budgetClass}`,
        "Потенциал: 30",
        "Объекта сейчас нет, но запросы бывают периодически",
      ],
    };
  }
  return null;
}

function matchNotSql(s: QualificationState): FunnelResult | null {
  const { region, budgetClass, potential } = s;
  if (
    region === "mo" &&
    budgetClass === "S" &&
    potential !== undefined &&
    [10, 20].includes(potential)
  ) {
    return {
      funnel: "not_sql",
      funnelLabel: FUNNEL_LABELS.not_sql,
      block: "не SQL — блок 1",
      reasons: [
        "Регион: Москва и МО",
        "Бюджет: S",
        `Потенциал: ${potential}`,
      ],
    };
  }
  return null;
}

function matchReserve(s: QualificationState): FunnelResult | null {
  if (s.noOgzRequests) {
    return {
      funnel: "reserve",
      funnelLabel: FUNNEL_LABELS.reserve,
      block: "резервная база — блок 1",
      reasons: ["Нет запросов по ОГЗ"],
    };
  }
  return null;
}

export function calculateFunnel(s: QualificationState): FunnelResult {
  const order = [
    matchReserve,
    matchNotSql,
    matchDevelopment,
    matchFocus,
    matchLongterm,
  ];

  for (const fn of order) {
    const r = fn(s);
    if (r) return r;
  }

  if (s.hasOgzInterest !== false) {
    return {
      funnel: "simplified",
      funnelLabel: FUNNEL_LABELS.simplified,
      reasons: ["Есть интерес к ОГЗ, не подошли критерии других воронок"],
    };
  }

  return {
    funnel: "simplified",
    funnelLabel: FUNNEL_LABELS.simplified,
    reasons: ["Упрощённая воронка по умолчанию"],
  };
}

export function calculatePriority(s: QualificationState): PriorityResult {
  const urgent: string[] = [];
  const against: string[] = [];
  const neutral: string[] = [];

  if (
    s.clientType &&
    ["gen_gov", "gen_private", "developer"].includes(s.clientType)
  ) {
    urgent.push("Тип клиента: целевой (генподрядчик / застройщик)");
  }

  if (s.potential === 30) urgent.push("Потенциал: 30 (регулярный спрос)");
  if (s.potential === 20)
    neutral.push("Потенциал: 20 (нерегулярный повтор)");
  if (s.potential === 10) against.push("Потенциал: 10 (разовый)");

  if (s.contactRole === "lpr") urgent.push("Контакт: ЛПР");
  if (s.contactRole === "lvr") neutral.push("Контакт: ЛВР");
  if (s.contactRole === "lir") against.push("Контакт: ЛИР");

  if (s.region === "mo" && s.budgetClass && ["L", "XL"].includes(s.budgetClass))
    urgent.push(`Регион+чек: МО (${s.budgetClass})`);
  if (s.region === "regions" && s.budgetClass === "XL")
    urgent.push("Регион+чек: регионы (XL)");
  if (s.region === "mo" && s.budgetClass === "S")
    against.push("Регион+чек: МО (S)");
  if (s.region === "regions" && s.budgetClass && ["S", "M"].includes(s.budgetClass))
    against.push(`Регион+чек: регионы (${s.budgetClass})`);

  if (s.readiness === "hot")
    urgent.push("Готовность: МК смонтированы / идёт монтаж");
  if (s.readiness === "medium")
    neutral.push("Готовность: есть документация, МК в работе");
  if (s.readiness === "cold")
    against.push("Готовность: нет документации, МК не запускали");

  if (s.contractorTimeline === "1m" || s.contractorTimeline === "2-3m")
    urgent.push("Срок выбора подрядчика: 1–2 мес");
  if (s.contractorTimeline === "3m_plus")
    against.push("Срок выбора подрядчика: 3+ мес");

  if (s.selectionFactors?.includes("cheapest_only"))
    against.push("Фактор: только самый дешёвый подрядчик");
  if (s.selectionFactors?.includes("expertise"))
    urgent.push("Фактор: важна экспертиза");

  if (s.jtbdLevel === 2) urgent.push("JTBD объекта: уровень 2");
  if (s.jtbdLevel === 1) neutral.push("JTBD объекта: уровень 1");

  const score = urgent.length * 2 - against.length * 2 + neutral.length * 0.5;

  if (against.length >= 3 || score < 0) {
    return {
      priority: "dont",
      label: "Точно не делаем",
      reasons: [...against, ...neutral.map((n) => `~ ${n}`)],
    };
  }
  if (urgent.length >= 4 && against.length <= 1) {
    return {
      priority: "urgent",
      label: "Точно нужно делать (срочно)",
      reasons: urgent,
    };
  }
  return {
    priority: "when_resources",
    label: "Когда будут возможности по ресурсу",
    reasons: [...urgent, ...neutral, ...against.map((a) => `⚠ ${a}`)],
  };
}

export const SEGMENT_PHRASES: Record<string, string> = {
  "A-0":
    "«Я сделаю полноценный расчёт «под ключ». На встрече покажу, как мы возьмём на себя все вопросы – от проекта до сдачи документов, чтобы вы вообще забыли про огнезащиту и спокойно сдали объект без проблем с контролирующими органами.»",
  "A-01":
    "«Цифру «на глаз» я не отправлю – она будет неточной. Я сделаю полноценный расчёт, и мы обязательно встретимся, чтобы я показала, из чего складывается цена и, главное, как мы можем легально обосновать объёмы перед стройнадзором и заказчиком, чтобы вы защитили свою смету и избежали проблем на приёмке.»",
  "A-03":
    "«Я подготовлю для вас максимально конкурентный расчёт с учётом требований госзаказчика. На встрече покажу, как мы фиксируем стоимость и объёмы, чтобы в процессе не возникло ни одной доплаты, и при этом всё прошло госприёмку без проблем.»",
  "B-0":
    "«Я подготовлю для вас расчёт «под ключ», и мы встретимся, чтобы я показала, как мы закроем все вопросы по проекту, материалам и документам, чтобы вы вообще забыли про огнезащиту и спокойно сдали объект.»",
  "B-03":
    "«Я сделаю для вас максимально конкурентный расчёт. На встрече я покажу, как мы фиксируем стоимость и объёмы, чтобы в процессе у вас не возникло ни одной доплаты или неожиданного перерасхода. Вы получите именно ту цену, которую видите в КП.»",
  "C-0":
    "«Я подготовлю расчёт с акцентом на сроки. На встрече мы детально разберём график работ и покажем, как мы встроимся в ваше «окно», чтобы огнезащита не сорвала общий план стройки и вы сдали объект вовремя без лишних забот.»",
  "C-02":
    "«Я сделаю срочный расчёт. На встрече мы обсудим, как мы сможем выйти на объект в ближайшие дни, нагнать отставание и снять риск штрафов и неустоек – с гарантией качества и соблюдения технологии.»",
  "E-0":
    "«Я сделаю для вас прозрачный расчёт. Мы встретимся, и я покажу, как мы выполним работы так, чтобы вы получили качественный объект, который не доставит хлопот в эксплуатации, и при этом не переплатили.»",
  "E-02":
    "«Я подготовлю для вас срочный расчёт. На встрече мы обсудим, как мы сможем выйти на объект в ближайшие дни, нагнать отставание и снять риск штрафов и неустоек – с гарантией качества и прохождения всех проверок.»",
  "E-04":
    "«Я сделаю для вас прозрачный расчёт. Мы встретимся, и я покажу, как мы выполним работы без ущерба для вашего основного бизнеса, поэтапно, с гарантией получения заключения МЧС и полным пакетом документов.»",
  "E-05":
    "«Я подготовлю для вас поэтапный план работ. На встрече мы разберём, как закрыть предписание без остановки деятельности, поэтапно, с гарантией положительного заключения МЧС и полным комплектом документов.»",
  "F-05":
    "«Я подготовлю для вас поэтапный план работ. На встрече мы разберём, как закрыть предписание без остановки арендаторов, поэтапно, с гарантией положительного заключения МЧС и полным пакетом документов.»",
};
