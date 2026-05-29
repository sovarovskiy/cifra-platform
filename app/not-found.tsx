import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card-panel max-w-md p-8 text-center">
        <h1 className="text-lg font-bold text-slate-900">Страница не найдена</h1>
        <p className="mt-2 text-sm text-slate-600">
          Откройте приложение со страницы входа:
        </p>
        <Link href="/login" className="btn-primary mt-4 inline-block">
          Перейти на вход
        </Link>
      </div>
    </div>
  );
}
