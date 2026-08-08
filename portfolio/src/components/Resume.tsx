import { education, experience, resumePdfUrl, skillGroups } from '@/data/resume';
import { Briefcase, Download, GraduationCap } from 'lucide-react';

export function Resume() {
  return (
    <section id="curriculo" className="section-container">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">Currículo</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Experiência & formação</h2>
          <p className="mt-4 text-muted-foreground">
            Confira minha experiência e formação abaixo.
          </p>
        </div>

        <a
          href={resumePdfUrl}
          download
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <Download className="size-4" />
          Baixar PDF
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Briefcase className="size-5 text-primary" />
              <h3 className="text-xl font-semibold">Experiência</h3>
            </div>
            <div className="space-y-6">
              {experience.map((item) => (
                <div key={`${item.company}-${item.period}`} className="glass-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.role}</p>
                      <p className="text-primary">{item.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {item.description.map((line) => (
                      <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">▹</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <h3 className="text-xl font-semibold">Formação</h3>
            </div>
            <div className="space-y-4">
              {education.map((item) => (
                <div key={item.institution} className="glass-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.degree}</p>
                      <p className="text-sm text-primary">{item.institution}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                  </div>
                  {item.description && (
                    <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-semibold">Habilidades</h3>
          <div className="space-y-4">
            {skillGroups.map((group) => (
              <div key={group.title} className="glass-card p-5">
                <p className="mb-3 text-sm font-medium text-primary">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
