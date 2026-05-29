import type { QualificationState } from "./scoring";
import { budgetClassFromRub } from "./scoring";

export type AnswerOption = {
  id: string;
  label: string;
  patch?: Partial<QualificationState>;
  next?: string;
  endFlow?: "non_target_a" | "non_target_b" | "non_target_c";
};

export type ScriptStep = {
  id: string;
  block: string;
  managerText: string;
  hint?: string;
  input?: "text" | "number" | "email" | "tel";
  inputKey?: keyof QualificationState;
  inputPlaceholder?: string;
  answers?: AnswerOption[];
  next?: string;
  showIf?: (s: QualificationState) => boolean;
};

/** Подстановка имени менеджера в текст скрипта */
export function formatManagerText(
  text: string,
  state: QualificationState
): string {
  const name = state.managerName?.trim() || "…";
  return text.replace(/\{\{managerName\}\}/g, name);
}

export const SCRIPT_STEPS: ScriptStep[] = [
  {
    id: "ctx_source",
    block: "Контекст",
    managerText: "Выберите источник обращения (для подстановки в открытие)",
    answers: [
      { id: "transfer", label: "Передали из скорозвона", patch: { leadSource: "transfer" }, next: "ctx_client_phone" },
      { id: "application", label: "Оставляли заявку", patch: { leadSource: "application" }, next: "ctx_client_phone" },
    ],
  },
  {
    id: "ctx_client_phone",
    block: "Контекст",
    managerText: "Номер телефона клиента",
    input: "tel",
    inputKey: "clientPhone",
    inputPlaceholder: "+7 900 000-00-00",
    next: "ctx_deal_id",
  },
  {
    id: "ctx_deal_id",
    block: "Контекст",
    managerText: "ID сделки",
    input: "text",
    inputKey: "dealId",
    inputPlaceholder: "Например: 12345",
    next: "ctx_manager_name",
  },
  {
    id: "ctx_manager_name",
    block: "Контекст",
    managerText: "Ваше имя (подставится в фразу «Меня зовут …» на следующем экране)",
    input: "text",
    inputKey: "managerName",
    inputPlaceholder: "Ваше имя",
    next: "open_1",
  },
  {
    id: "open_1",
    block: "1. Открытие",
    managerText:
      "«(Имя), добрый день! Меня зовут {{managerName}}, компания «Ориентир», специалист проектно-сметного отдела. Мне передали ваш контакт / вы оставляли заявку. Подтвердите: вам требуется огнезащита металлоконструкций?»",
    hint: "(Клиент отвечает, скорее всего, «да» - это первое согласие).",
    answers: [
      { id: "yes", label: "Да", patch: { hasOgzInterest: true }, next: "open_2" },
      { id: "no", label: "Нет / не та тема", patch: { hasOgzInterest: false }, endFlow: "non_target_b" },
    ],
  },
  {
    id: "open_2",
    block: "1. Открытие",
    managerText:
      "«Отлично. Скажите, для вас важно (вопросительная интонация) получить точный расчет, который исключит переплаты и сюрпризы при сдаче объекта?»",
    hint: "(Почти всегда «да» - второе согласие).",
    answers: [
      { id: "yes", label: "Да", next: "open_3" },
      { id: "no", label: "Нет / сомневается", next: "open_3" },
    ],
  },
  {
    id: "open_3",
    block: "1. Открытие",
    managerText:
      "«И, конечно, вы заинтересованы в том, чтобы работы прошли без проблем с экспертизой и в срок?»",
    hint: "(Третье «да» - клиент уже в потоке согласия).",
    answers: [
      { id: "yes", label: "Да", next: "open_4" },
      { id: "no", label: "Нет / сомневается", next: "open_4" },
    ],
  },
  {
    id: "open_4",
    block: "1. Открытие",
    managerText:
      "«Тогда давайте действовать профессионально. Сейчас я задам несколько коротких вопросов – это займет не больше 3 минут. Они нужны, чтобы подготовить для вас максимально точное коммерческое предложение, которое подчеркнет партнерские отношения в дальнейшем и покажет ваши выгоды работать с нами. Договорились?»",
    hint: "(Это четвёртое согласие, но оно закрепляет готовность отвечать).",
    answers: [
      { id: "yes", label: "Да", next: "obj_need" },
      { id: "no", label: "Нет", next: "obj_need" },
    ],
  },
  {
    id: "obj_need",
    block: "2. Знакомство с объектом",
    managerText: "«Расскажите подробнее в связи с чем возникла потребность?»",
    hint: "Слушаем, не перебиваем. После паузы уточняем:",
    answers: [
      { id: "new", label: "Новое строительство / реконструкция", next: "obj_type" },
      { id: "prescription", label: "Предписание МЧС", patch: { mchsPrescription: true }, next: "obj_type" },
      { id: "planned", label: "Плановые работы", next: "obj_type" },
      { id: "other", label: "Другое (зафиксировать)", next: "obj_type" },
    ],
  },
  {
    id: "obj_type",
    block: "2. Знакомство с объектом",
    managerText: "«А какое назначение объекта - склад, цех, торговый центр?»",
    answers: [
      { id: "warehouse", label: "Склад", next: "obj_region" },
      { id: "shop", label: "Цех / производство", next: "obj_region" },
      { id: "mall", label: "Торговый центр", next: "obj_region" },
      { id: "other", label: "Другое", next: "obj_region" },
    ],
  },
  {
    id: "obj_region",
    block: "2. Знакомство с объектом",
    managerText: "«Где находится объект? Какой регион? В черте города или область?»",
    answers: [
      { id: "mo", label: "Москва / Московская область", patch: { region: "mo" }, next: "obj_stage" },
      { id: "reg", label: "Регионы", patch: { region: "regions" }, next: "obj_stage" },
    ],
  },
  {
    id: "obj_stage",
    block: "2. Знакомство с объектом",
    managerText:
      "«У вас уже есть какая то документация? КМ, КМД, проект на огнезащиту, или пока все на уровне идеи?»",
    answers: [
      { id: "idea", label: "На уровне идеи", patch: { readiness: "cold", documentation: "idea" }, next: "obj_volume" },
      { id: "km", label: "Есть КМ / КМД", patch: { readiness: "medium", documentation: "km" }, next: "obj_volume" },
      { id: "ogz_proj", label: "Есть проект на ОГЗ", patch: { readiness: "medium", documentation: "ogz" }, next: "obj_volume" },
      { id: "none", label: "Документации нет", patch: { readiness: "cold", documentation: "none" }, next: "obj_volume" },
    ],
  },
  {
    id: "obj_volume",
    block: "2. Знакомство с объектом",
    managerText:
      "«Подскажите, примерный тоннаж металла известен? Может уже знаете примерную площадь покрытия? Хотя бы примерно - чтобы понимать масштаб».",
    hint: "(Фиксируем ответы; если клиент затрудняется - помогаем вариантами).",
    answers: [
      { id: "unknown", label: "Затрудняется / не знает", next: "obj_mchs" },
      { id: "known", label: "Озвучил масштаб — перейти к бюджету", next: "budget_amount" },
    ],
  },
  {
    id: "obj_mchs",
    block: "2. Знакомство с объектом",
    managerText: "«Есть ли уже предписание МЧС или работы плановые?»",
    hint: "*(Если предписание – сразу сигнал к сегменту E‑05 / F‑05).*",
    answers: [
      { id: "prescription", label: "Есть предписание МЧС", patch: { mchsPrescription: true, jtbdLevel: 2 }, next: "role_type" },
      { id: "planned", label: "Работы плановые", next: "role_type" },
      { id: "no", label: "Нет предписания", next: "role_type" },
    ],
  },
  {
    id: "role_type",
    block: "3. Квалификация роли",
    managerText: "«(Имя), вы в этом проекте выступаете как заказчик, генподрядчик или инвестор?»",
    answers: [
      { id: "gen", label: "Генподрядчик", next: "role_gov" },
      { id: "customer", label: "Заказчик", patch: { clientType: "owner" }, next: "role_lpr" },
      { id: "investor", label: "Инвестор", patch: { clientType: "investor" }, next: "role_lpr" },
      { id: "developer", label: "Застройщик / девелопер", patch: { clientType: "developer" }, next: "role_lpr" },
      { id: "uk", label: "Управляющая компания", patch: { clientType: "uk", segment: "F-05" }, next: "role_lpr" },
    ],
  },
  {
    id: "role_gov",
    block: "3. Квалификация роли",
    managerText: "«Объект финансируется из госбюджета или это частные инвестиции?»",
    answers: [
      { id: "gov", label: "Госбюджет", patch: { clientType: "gen_gov" }, next: "role_lpr" },
      { id: "private", label: "Частные инвестиции", patch: { clientType: "gen_private" }, next: "role_lpr" },
    ],
  },
  {
    id: "role_lpr",
    block: "3. Квалификация роли",
    managerText:
      "“Подскажите на чье имя составлять коммерческое предложение, кто будет принимать решение?”",
    hint: "фиксируем Ф.И.О. Важно добиться полного Ф.И.О. После уточняем его должность",
    input: "text",
    inputKey: "clientName",
    next: "role_contact",
  },
  {
    id: "role_contact",
    block: "3. Квалификация роли",
    managerText: "Роль контакта (фиксируем: ЛПР/ЛВР/ЛИР)",
    answers: [
      { id: "lpr", label: "ЛПР", patch: { contactRole: "lpr", siteContact: "lpr" }, next: "timing_stage" },
      { id: "lvr", label: "ЛВР", patch: { contactRole: "lvr", siteContact: "lvr" }, next: "timing_stage" },
      { id: "lir", label: "ЛИР", patch: { contactRole: "lir" }, next: "timing_stage" },
    ],
  },
  {
    id: "timing_stage",
    block: "4. Сроки и готовность",
    managerText:
      "«Теперь вопрос про сроки - это важно для динамики расчёта. На какой стадии стройка? Контур здания уже стоит или только фундамент?».",
    answers: [
      { id: "foundation", label: "Только фундамент", next: "timing_ogz_ready" },
      { id: "contour", label: "Контур стоит", next: "timing_contour" },
      { id: "mounting", label: "Идёт монтаж МК", patch: { readiness: "hot" }, next: "timing_ogz_start" },
      { id: "mounted", label: "МК смонтированы", patch: { readiness: "hot" }, next: "timing_ogz_start" },
    ],
  },
  {
    id: "timing_contour",
    block: "4. Сроки и готовность",
    managerText:
      "Контур будет закрытый, или открытый на этапе огнезащитной обработки?",
    answers: [
      { id: "closed", label: "Закрытый", next: "timing_ogz_ready" },
      { id: "open", label: "Открытый", next: "timing_ogz_ready" },
    ],
  },
  {
    id: "timing_ogz_ready",
    block: "4. Сроки и готовность",
    managerText: "Статус готовности к ОГЗ (по скрипту)",
    answers: [
      { id: "hot", label: "«Все МК смонтированы / идёт монтаж»", patch: { readiness: "hot" }, next: "timing_ogz_start" },
      { id: "medium", label: "«Есть документация, МК делаются»", patch: { readiness: "medium" }, next: "timing_ogz_start" },
      { id: "cold", label: "«Документации нет, МК не запускали»", patch: { readiness: "cold" }, next: "timing_ogz_start" },
    ],
  },
  {
    id: "timing_ogz_start",
    block: "4. Сроки и готовность",
    managerText:
      "«Когда планируете приступать к огнезащите? Есть жёсткие сроки сдачи, к которым нужно привязаться?»",
    answers: [
      { id: "3m", label: "До 3 месяцев", next: "timing_contractor" },
      { id: "3_6", label: "3–6 месяцев", next: "timing_contractor" },
      { id: "6p", label: "6+ месяцев", next: "timing_contractor" },
      { id: "later", label: "Когда-нибудь / в следующем году", patch: { contractorTimeline: "later" }, endFlow: "non_target_a" },
    ],
  },
  {
    id: "timing_contractor",
    block: "4. Сроки и готовность",
    managerText: "Срок выбора подрядчика",
    answers: [
      { id: "1m", label: "1 мес", patch: { contractorTimeline: "1m" }, next: "timing_emergency" },
      { id: "2_3m", label: "2–3 мес", patch: { contractorTimeline: "2-3m" }, next: "timing_emergency" },
      { id: "3p", label: "3+ мес", patch: { contractorTimeline: "3m_plus" }, next: "timing_emergency" },
      { id: "periodic", label: "Объекта сейчас нет, но бываю периодически", patch: { contractorTimeline: "no_object_periodic" }, next: "timing_emergency" },
    ],
  },
  {
    id: "timing_emergency",
    block: "4. Сроки и готовность",
    managerText: "«Сроки уже поджимают? Были срывы у предыдущих подрядчиков?»",
    hint: "*(Если да – высокая вероятность C‑02 / E‑02).*",
    answers: [
      { id: "yes", label: "Да", patch: { segment: "C-02", jtbdLevel: 2 }, next: "budget_main" },
      { id: "no", label: "Нет", next: "budget_main" },
    ],
  },
  {
    id: "budget_main",
    block: "5. Бюджет",
    managerText: "«Еще такой вопрос. Какой бюджет заложен на огнезащиту?»",
    hint: "(получаем ответ). Если не отвечает — уточняем иначе на следующем шаге.",
    input: "number",
    inputKey: "budgetRub",
    inputPlaceholder: "Сумма в рублях",
    next: "potential",
  },
  {
    id: "budget_fallback",
    block: "5. Бюджет",
    managerText:
      "Если пока не знаете - это нормально. Тогда уточню иначе: вам важнее минимальная цена или подрядчик, который гарантирует отсутствие переделок и штрафов? Это определит подход к расчёту",
    answers: [
      { id: "price", label: "Минимальная цена", patch: { selectionFactors: ["price"] }, next: "segment_branch" },
      { id: "reliable", label: "Надёжность / без переделок", patch: { selectionFactors: ["expertise"] }, next: "segment_branch" },
    ],
  },
  {
    id: "potential",
    block: "5. Потенциал",
    managerText: "Потенциал клиента (оценка по повторности спроса)",
    answers: [
      { id: "p30", label: "30 — Регулярный повторный спрос", patch: { potential: 30 }, next: "segment_branch" },
      { id: "p20", label: "20 — Есть повтор, но нерегулярный", patch: { potential: 20 }, next: "segment_branch" },
      { id: "p10", label: "10 — Разовый заказ", patch: { potential: 10 }, next: "segment_branch" },
    ],
  },
  {
    id: "segment_branch",
    block: "5. Бюджет и факторы",
    managerText: "Детализация по типу клиента (выберите подходящий блок скрипта)",
    answers: [
      { id: "gov_budget", label: "Генподрядчик гос → смета", next: "seg_gen_gov" },
      { id: "priv_factor", label: "Генподрядчик не гос → цена/надёжность", next: "seg_gen_priv" },
      { id: "dev", label: "Застройщик / девелопер", next: "seg_dev" },
      { id: "owner", label: "Собственник", next: "seg_owner" },
      { id: "uk", label: "УК (уже F-05)", next: "competition" },
      { id: "skip", label: "Пропустить (тип уже определён)", next: "competition" },
    ],
  },
  {
    id: "seg_gen_gov",
    block: "5. Бюджет и факторы",
    managerText:
      "«Вы работаете в рамках жёсткой сметы или есть возможность корректировки объёмов?»",
    answers: [
      { id: "a03", label: "Жёсткая смета", patch: { segment: "A-03", selectionFactors: ["price"] }, next: "competition" },
      { id: "a01", label: "Возможность расширения", patch: { segment: "A-01", jtbdLevel: 2 }, next: "competition" },
      { id: "a0", label: "Просто сдать объект", patch: { segment: "A-0" }, next: "competition" },
    ],
  },
  {
    id: "seg_gen_priv",
    block: "5. Бюджет и факторы",
    managerText:
      "«Для вас критична минимальная цена или надёжность, чтобы объект сдали без проблем и потом не переделывать?»",
    answers: [
      { id: "b03", label: "Цена", patch: { segment: "B-03", selectionFactors: ["price", "cheapest_only"] }, next: "competition" },
      { id: "b0", label: "Надёжность", patch: { segment: "B-0", selectionFactors: ["expertise"] }, next: "competition" },
    ],
  },
  {
    id: "seg_dev",
    block: "5. Бюджет и факторы",
    managerText:
      "«У вас сейчас плановая стройка или возникли проблемы со сроками, нужно догонять?»",
    answers: [
      { id: "c0", label: "Плановая", patch: { segment: "C-0" }, next: "competition" },
      { id: "c02", label: "Авария / догоняем", patch: { segment: "C-02", jtbdLevel: 2 }, next: "competition" },
    ],
  },
  {
    id: "seg_owner",
    block: "5. Бюджет и факторы",
    managerText:
      "«Вы строите для себя, важна прозрачность и чтобы потом в эксплуатации не было проблем? Есть ли уже предписание МЧС?»",
    answers: [
      { id: "e05", label: "Есть предписание", patch: { segment: "E-05", jtbdLevel: 2 }, next: "competition" },
      { id: "e04", label: "Стройка без предписания", patch: { segment: "E-04" }, next: "competition" },
      { id: "e02", label: "Авария сроков", patch: { segment: "E-02", jtbdLevel: 2 }, next: "competition" },
      { id: "e0", label: "Базовая потребность", patch: { segment: "E-0" }, next: "competition" },
    ],
  },
  {
    id: "competition",
    block: "6. Конкуренция",
    managerText:
      "«А других подрядчиков рассматриваете? По каким критериям планируете отсеивать - только цена или есть ещё важные моменты?»",
    answers: [
      { id: "yes_exp", label: "Да, важна экспертиза / не только цена", patch: { competitors: true, selectionFactors: ["expertise"] }, next: "competition_offers" },
      { id: "yes_price", label: "Да, в основном цена", patch: { competitors: true, selectionFactors: ["price", "cheapest_only"] }, next: "competition_offers" },
      { id: "no", label: "Нет других", patch: { competitors: false }, next: "competition_offers" },
    ],
  },
  {
    id: "competition_offers",
    block: "6. Конкуренция",
    managerText: "“Скажите, а уже есть предложения от конкурентов?”",
    answers: [
      { id: "yes", label: "Да", patch: { competitorOffers: true }, next: "competition_tender" },
      { id: "no", label: "Нет", next: "competition_tender" },
    ],
  },
  {
    id: "competition_tender",
    block: "6. Конкуренция",
    managerText: "«Тендер по объекту уже выигран или идёт тендерная оценка?»",
    answers: [
      { id: "won", label: "Тендер выигран", patch: { tenderWon: true }, next: "close_docs" },
      { id: "ongoing", label: "Идёт оценка", patch: { tenderWon: false }, next: "close_docs" },
      { id: "na", label: "Не применимо / не генподрядчик", next: "close_docs" },
    ],
  },
  {
    id: "close_docs",
    block: "7. Завершение",
    managerText:
      "«(Имя), спасибо - теперь я чётко понимаю ситуацию. Чтобы подготовить точный расчёт, мне нужен проект или чертежи КМ. Продиктуйте мне свою почту (фиксируем), могу продублировать вам информацию в ТГ, или Макс? Открытый профиль? (фиксируем). Я сейчас скину информацию о нашей компании и выполненных объектах, а вы мне в ответ пришлите имеющуюся документацию и карточку компании.",
    answers: [
      { id: "will_send", label: "Проект пришлют", next: "close_agree" },
      { id: "no_send", label: "Проект не могут скинуть", next: "close_meeting" },
    ],
  },
  {
    id: "close_agree",
    block: "7. Завершение",
    managerText:
      "Если проект скинут: «Отлично, жду. Завтра расчёт будет готов, я позвоню вам в 10:00 для согласования встречи. хорошо? (получаем согласие). До связи!»",
    answers: [{ id: "yes", label: "Согласие получено", next: "result" }],
  },
  {
    id: "close_meeting",
    block: "7. Завершение",
    managerText:
      "Если проект не могут скинуть (бумажный / не готов): «Понимаю. Тогда встречаемся у вас в офисе или на объекте - я посмотрю чертежи на месте и мы сразу сможем прикинуть варианты. Давайте выберем время...» (переход к Скрипту №2).",
    answers: [{ id: "ok", label: "Время согласовано", next: "result" }],
  },
  {
    id: "result",
    block: "Итог",
    managerText: "Результаты квалификации",
    next: undefined,
  },
];

export function getStep(id: string): ScriptStep | undefined {
  return SCRIPT_STEPS.find((s) => s.id === id);
}

export function applyPatch(
  state: QualificationState,
  patch?: Partial<QualificationState>
): QualificationState {
  if (!patch) return state;
  const next = { ...state, ...patch };
  if (patch.budgetRub !== undefined) {
    next.budgetClass = budgetClassFromRub(patch.budgetRub);
  }
  if (patch.selectionFactors) {
    next.selectionFactors = [
      ...new Set([...(state.selectionFactors ?? []), ...patch.selectionFactors]),
    ];
  }
  return next;
}

export function resolveNext(
  step: ScriptStep,
  answer: AnswerOption | null,
  state: QualificationState
): string | "result" | "non_target" {
  if (answer?.endFlow) return "non_target";
  if (answer?.next) return answer.next;
  if (step.next) return step.next;
  return "result";
}

export const NON_TARGET_TEXTS = {
  non_target_a: {
    title: "Ситуация А",
    managerText:
      "«(Имя), спасибо за откровенность. Мы работаем с проектами, которые находятся в активной фазе стройки и где есть жёсткие сроки. Ваш случай пока больше относится к категории «стратегическое планирование». Чтобы не тратить ваше время сейчас и не забрасывать вас информационным спамом, давайте поступим так: я сделаю пометку в системе, и мы вернёмся к вам через полгода-год, когда у вас появятся конкретные сроки. Вы не против, если я вам напомню о себе?»",
  },
  non_target_b: {
    title: "Ситуация Б",
    managerText:
      "«(Имя), поняла вас, спасибо за уточнение. Значит, я обратилась не совсем по адресу. Не буду отвлекать вас дальше. Если вдруг у коллег возникнет потребность в огнезащите - буду признательна, если передадите наш контакт. Всего доброго!»",
  },
  non_target_c: {
    title: "Ситуация В",
    managerText:
      "«(Имя), спасибо за информацию. Мы, как правило, фокусируемся на более крупных и сложных объектах, чтобы давать клиентам максимальную экспертизу. Ваш объём, скорее всего, будет не самым выгодным для нас с экономической точки зрения, и мы не сможем дать вам лучшее ценовое предложение на рынке. Поэтому, чтобы не вводить вас в заблуждение, предлагаю вам поискать подрядчика, для которого такие объёмы будут профильными. Спасибо за звонок и удачи в поиске!»",
  },
};
