/** Google Таблица «Референс ОГЗ менеджер (м2)» */
export const REFERENCE_SHEET_ID =
  process.env.REFERENCE_SHEET_ID ?? "1OJY-dYcUARWjrVY09q0e_-Tmb61LrIsNe2HD34vEuhU";

export const REFERENCE_SHEET_GID =
  process.env.REFERENCE_SHEET_GID ?? "1224303232";

export const REFERENCE_SHEET_TITLE = "Референс ОГЗ менеджер (м2)";

/** Только таблица, без панелей редактирования (режим просмотра) */
export function getReferenceEmbedUrl(): string {
  const params = new URLSearchParams({
    gid: REFERENCE_SHEET_GID,
    single: "true",
    widget: "false",
    headers: "true",
    chrome: "false",
  });
  return `https://docs.google.com/spreadsheets/d/${REFERENCE_SHEET_ID}/htmlembed?${params}`;
}

/** Экспорт вкладки в PDF (нужен доступ «читатель» по ссылке или сервисный аккаунт) */
export function getReferencePdfExportUrl(): string {
  const params = new URLSearchParams({
    format: "pdf",
    gid: REFERENCE_SHEET_GID,
    portrait: "true",
    size: "A4",
    scale: "2",
    fitw: "true",
    gridlines: "true",
    printtitle: "false",
    sheetnames: "false",
    pagenum: "false",
    fzr: "false",
  });
  return `https://docs.google.com/spreadsheets/d/${REFERENCE_SHEET_ID}/export?${params.toString()}`;
}

export const REFERENCE_SETUP_HINT =
  "Чтобы референс открывался в приложении, в Google Таблице: «Настройки доступа» → «Все, у кого есть ссылка» → «Читатель». Либо настройте GOOGLE_SERVICE_ACCOUNT_JSON на сервере.";
