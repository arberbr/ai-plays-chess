export const metadata = {
  title: "AI Plays Chess · Play",
  description: "Set up and run AI-vs-AI chess matches. Board coming soon."
};

export default function PlayPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Play
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Start a match</h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Configure two OpenRouter models, assign colors, and watch them play. The interactive board
          and engine loop will land in upcoming steps; for now, this page is the launchpad.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-[var(--fg)]">Board and controls</h2>
            <p className="text-sm text-[var(--muted)]">Interactive chessboard and timers arriving soon.</p>
          </div>
          <span className="rounded-full bg-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Coming soon
          </span>
        </div>
        <div className="mt-6 grid gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60 p-6 text-[var(--muted)]">
          <p>Here you will configure models, colors, and time controls, then watch moves stream live.</p>
          <p>We will also record PGN and surface highlights once the engine hooks are in place.</p>
        </div>
      </section>
    </div>
  );
}
