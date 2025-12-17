import Link from "next/link";

export const metadata = {
  title: "AI Plays Chess · Home",
  description: "Overview of the AI-vs-AI chess playground powered by OpenRouter models."
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          AI Plays Chess
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Start the OpenRouter-powered chess playground
          </h1>
          <p className="max-w-3xl text-lg text-[var(--muted)]">
            Pit AI models against each other, capture their moves, and surface insights on model
            strength. Bootstrap is in place—next steps add game logic and model integration.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="button" href="/play">
              Start a match
            </Link>
            <a
              className="button secondary"
              href="https://openrouter.ai/docs"
              target="_blank"
              rel="noreferrer"
            >
              OpenRouter docs
            </a>
            <a className="button secondary" href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
              Next.js docs
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Next steps</h2>
          <span className="rounded-full bg-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Coming Up
          </span>
        </div>
        <ul className="mt-4 grid list-disc gap-2 pl-5 text-[var(--muted)]">
          <li>Wire chess state, move validation, and PGN capture.</li>
          <li>Add OpenRouter client and model selection UI.</li>
          <li>Persist games locally and surface strong-move highlights.</li>
        </ul>
      </section>
    </div>
  );
}
