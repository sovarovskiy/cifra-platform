import type { AnswerOption } from "./script-engine";

/** Все ответы в мастере — один стиль (бирюзовая кнопка) */
export function answerButtonClass(_answer: AnswerOption): string {
  return "btn-wizard";
}
