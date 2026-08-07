import { profile } from '@/data/profile';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';
import { Mail, Send } from 'lucide-react';

export function Contact() {
  return (
    <section id="contato" className="section-container pb-28">
      <div className="glass-card relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-primary/10 blur-3xl" />

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">Contato</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Vamos conversar?</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Aberto a feedback sobre projetos, oportunidades de estágio ou colaboração em apps de estudo.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Mail className="size-4" />
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <LinkedInIcon className="size-4" />
            LinkedIn
          </a>
        </div>

        <form
          className="mt-10 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const name = String(data.get('name') ?? '');
            const message = String(data.get('message') ?? '');
            window.location.href = `mailto:${profile.email}?subject=Contato via portfólio — ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
          }}
        >
          <label className="block sm:col-span-1">
            <span className="mb-2 block text-sm text-muted-foreground">Nome</span>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
              placeholder="Seu nome"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-2 block text-sm text-muted-foreground">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
              placeholder="seu@email.com"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm text-muted-foreground">Mensagem</span>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
              placeholder="Como posso ajudar?"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:col-span-2 sm:w-fit"
          >
            <Send className="size-4" />
            Enviar e-mail
          </button>
        </form>
      </div>
    </section>
  );
}
