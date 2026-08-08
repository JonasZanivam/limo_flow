export type Project = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  status: 'Em desenvolvimento' | 'Concluído' | 'Em estudo';
  repoUrl?: string;
  demoUrl?: string;
  appUrl?: string;
  highlights: string[];
  accent: 'gold' | 'blue' | 'emerald';
};

export const projects: Project[] = [
  {
    id: 'limoflow',
    title: 'LimoFlow',
    description: 'Mini CRM para serviços de limousine em casamentos e eventos.',
    longDescription:
      'Aplicação full stack com agenda, propostas, contratos, financeiro, checklists e dashboard. Inclui autenticação JWT com roles, testes E2E com Playwright e stack de observabilidade com Grafana.',
    tags: ['React', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker', 'Grafana'],
    status: 'Em desenvolvimento',
    repoUrl: 'https://github.com/JonasZanivam/limo_flow',
    appUrl: '/limoflow/',
    highlights: [
      'Auth JWT com perfis Admin e Motorista',
      'CRUD de clientes, veículos e eventos',
      'Deploy automatizado via GitHub Actions',
      'Logs e traces com OpenTelemetry',
    ],
    accent: 'gold',
  },
  {
    id: 'my-recipe',
    title: 'My Recipe',
    description: 'App para escrever e guardar receitas culinárias.',
    longDescription:
      'Aplicação full stack multi-usuário para criar, organizar e buscar receitas com ingredientes e passos. Autenticação JWT, deploy Docker na mesma VPS do portfólio.',
    tags: ['React', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker'],
    status: 'Em desenvolvimento',
    repoUrl: 'https://github.com/JonasZanivam/my_recipe',
    appUrl: '/my-recipe/',
    highlights: [
      'Receitas com ingredientes e modo de preparo',
      'Busca por título e tags',
      'Multi-usuário com login e registro',
      'Deploy em jonjon.tech/my-recipe/',
    ],
    accent: 'emerald',
  },
  // {
  //   id: 'meu-app',
  //   title: 'Meu App',
  //   description: 'Breve descrição.',
  //   longDescription: 'Detalhes do projeto...',
  //   tags: ['React', 'Node'],
  //   status: 'Em estudo',
  //   repoUrl: 'https://github.com/JonasZanivam/meu-app',
  //   highlights: ['Destaque 1', 'Destaque 2'],
  //   accent: 'blue',
  // },
];
