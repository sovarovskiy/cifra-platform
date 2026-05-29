"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card-panel max-w-md p-8 text-center">
        <h1 className="text-lg font-bold text-slate-900">Ошибка загрузки</h1>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        {error.digest && (
          <p className="mt-1 text-xs text-slate-400">Код: {error.digest}</p>
        )}
        <button type="button" className="btn-primary mt-6" onClick={reset}>
          Повторить
        </button>
        <a href="/login" className="btn-secondary mt-3">
          На страницу входа
        </a>
      </div>
    </div>
  );
}
