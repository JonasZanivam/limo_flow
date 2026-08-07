export type Experience = {
  company: string;
  role: string;
  period: string;
  description: string[];
};

export type Education = {
  institution: string;
  degree: string;
  period: string;
  description?: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export const experience: Experience[] = [
  {
    company: 'Projetos pessoais',
    role: 'Desenvolvedor Full Stack (estudo)',
    period: '2024 — presente',
    description: [
      'Desenvolvimento do LimoFlow: CRM web com React, NestJS e PostgreSQL.',
      'Configuração de CI/CD, Docker e observabilidade em ambiente de produção.',
      'Escrita de testes automatizados (Jest, Playwright) e documentação técnica.',
    ],
  },
];

export const education: Education[] = [
  {
    institution: 'Formação contínua',
    degree: 'Desenvolvimento Web Full Stack',
    period: '2024 — presente',
    description:
      'Cursos, documentação oficial e projetos práticos em JavaScript/TypeScript, React, Node.js e bancos relacionais.',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'React Router'],
  },
  {
    title: 'Backend',
    items: ['NestJS', 'Prisma', 'PostgreSQL', 'JWT', 'REST APIs', 'Zod'],
  },
  {
    title: 'DevOps & Qualidade',
    items: ['Docker', 'GitHub Actions', 'Grafana', 'Playwright', 'Jest', 'Linux/VPS'],
  },
];

export const resumePdfUrl = '/curriculo-jonas-zanivam.pdf';
