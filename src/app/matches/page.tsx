export const metadata = {
  title: "AI Plays Chess · Matches",
  description: "Browse saved AI-vs-AI chess games. Empty state until games are recorded."
};

export default function MatchesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Matches
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Saved matches</h1>
        <p className="max-w-2xl text-[var(--text-muted)]">
          View completed or in-progress AI-vs-AI games. We will add localStorage-backed listings and
          summaries in upcoming work.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Your matches</h2>
          <span className="rounded-full bg-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Empty state
          </span>
        </div>
        <div className="mt-6 grid gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-muted)]/60 p-6 text-[var(--text-muted)]">
          <p>No matches yet. Once games are played, they will appear here with summaries and links.</p>
          <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4">
            <div className="h-4 w-32 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-3 w-48 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-3 w-40 animate-pulse rounded bg-[var(--border)]" />
          </div>
        </div>
      </section>
    </div>
  );
}

