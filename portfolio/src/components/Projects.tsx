import { projects, type Project } from '@/data/projects';
import { ExternalLink, FolderGit2, Rocket } from 'lucide-react';

const accentStyles: Record<Project['accent'], string> = {
  gold: 'border-primary/30 bg-primary/5 text-primary',
  blue: 'border-accent-blue/30 bg-accent-blue/5 text-accent-blue',
  emerald: 'border-accent-emerald/30 bg-accent-emerald/5 text-accent-emerald',
};

const statusStyles: Record<Project['status'], string> = {
  'Em desenvolvimento': 'bg-primary/15 text-primary',
  Concluído: 'bg-accent-emerald/15 text-accent-emerald',
  'Em estudo': 'bg-accent-blue/15 text-accent-blue',
};

export function Projects() {
  return (
    <section id="projetos" className="section-container">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">Apps</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Minhas apps</h2>
        <p className="mt-4 text-muted-foreground">
          Confira os projetos que desenvolvi abaixo. Clique em &quot;Abrir app&quot; para acessar o
          sistema ou &quot;Repositório&quot; para acessar o código fonte no GitHub.
        </p>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <article
            key={project.id}
            className={`glass-card overflow-hidden border-l-4 p-6 sm:p-8 ${accentStyles[project.accent].split(' ')[0]}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground">{project.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.appUrl && (
                  <a
                    href={project.appUrl}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Rocket className="size-4" />
                    Abrir app
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <FolderGit2 className="size-4" />
                    Repositório
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ExternalLink className="size-4" />
                    Demo
                  </a>
                )}
              </div>
            </div>

            <p className="mt-4 leading-relaxed text-muted-foreground">{project.longDescription}</p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${accentStyles[project.accent]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
