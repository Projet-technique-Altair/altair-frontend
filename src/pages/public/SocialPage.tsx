import Footer from "@/components/Footer";

const githubUrl = "https://github.com/Projet-technique-Altair";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <main className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <a href="/" className="text-sm text-slate-400 transition hover:text-white">
          Back
        </a>

        <header className="mt-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
            Social channel
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            Follow Altair on GitHub.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Altair currently uses GitHub as its public technical presence. It is
            the right place to follow the project organization, repositories,
            implementation work, and engineering activity behind the platform.
          </p>
        </header>

        <nav className="mt-12" aria-label="Social sections">
          <a
            href="#github"
            className="block rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:border-orange-300/40 hover:bg-white/[0.07] md:max-w-md"
          >
            <span className="text-sm font-semibold text-white">GitHub</span>
            <span className="mt-2 block text-xs leading-5 text-slate-400">
              Project organization, repositories, code history, and technical work.
            </span>
          </a>
        </nav>

        <section
          id="github"
          className="mt-16 scroll-mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-6"
        >
          <h2 className="text-2xl font-semibold">GitHub organization</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            The Altair GitHub organization centralizes project repositories and
            technical activity. It can be used to review implementation history,
            follow repository structure, inspect public code when available, and
            understand how the platform evolves over time.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-black/10 p-4">
              Engineering updates and repository activity.
            </div>
            <div className="rounded-md border border-white/10 bg-black/10 p-4">
              Public technical visibility for the Altair project.
            </div>
            <div className="rounded-md border border-white/10 bg-black/10 p-4">
              A central place for source organization and future documentation.
            </div>
          </div>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-md border border-white/15 bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Open GitHub organization
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
