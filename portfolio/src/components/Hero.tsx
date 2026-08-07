import { profile } from '@/data/profile';
import { GitHubIcon } from '@/components/SocialIcons';
import { ArrowDown, MapPin } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-20 size-80 rounded-full bg-accent-blue/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Portfólio & projetos de estudo
        </p>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Olá, eu sou{' '}
          <span className="gradient-text">{profile.name}</span>
        </h1>

        <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">{profile.role}</p>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {profile.tagline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            {profile.location}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="#projetos"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Minhas apps
        </a>
          <a
            href="#curriculo"
            className="glass-card rounded-xl px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/40"
          >
            Meu currículo
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {profile.highlights.map((item) => (
            <div key={item.label} className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        <a
          href="#sobre"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce text-muted-foreground md:inline-flex"
          aria-label="Rolar para sobre"
        >
          <ArrowDown className="size-5" />
        </a>
      </div>
    </section>
  );
}
