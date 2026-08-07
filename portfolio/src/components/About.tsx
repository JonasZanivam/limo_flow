import { profile } from '@/data/profile';
import { Code2, Rocket, Target } from 'lucide-react';

const pillars = [
  {
    icon: Code2,
    title: 'Código com propósito',
    text: 'Prefiro projetos que simulam cenários reais — com auth, persistência, testes e deploy.',
  },
  {
    icon: Rocket,
    title: 'Aprendizado contínuo',
    text: 'Cada stack nova entra em um projeto de estudo antes de virar padrão no dia a dia.',
  },
  {
    icon: Target,
    title: 'Entrega completa',
    text: 'Do layout responsivo ao monitoramento em produção — penso no ciclo inteiro.',
  },
];

export function About() {
  return (
    <section id="sobre" className="section-container">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">Sobre</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quem sou eu</h2>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="grid gap-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card flex gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
