// Единый флаг тестовой/разработческой среды.
// true — если собрано в dev-режиме (vite dev) ИЛИ передано ?test=1 / #test в URL.
// В production-сборке без query-параметра страница ведёт себя как раньше (тест-кнопки скрыты).
export const DEV_MODE: boolean =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).has('test') ||
      window.location.hash.includes('test')));
