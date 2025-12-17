'use client';

import { useTheme } from './theme-provider';

const getLabel = (resolvedTheme: 'light' | 'dark') =>
  resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={getLabel(resolvedTheme)}
      aria-pressed={isDark}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition-colors duration-150 hover:border-[var(--text-muted)] hover:bg-[var(--bg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[var(--focus-ring-offset)]"
    >
      <span
        aria-hidden
        className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-muted)] text-[10px] font-semibold"
      >
        {isDark ? 'D' : 'L'}
      </span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
