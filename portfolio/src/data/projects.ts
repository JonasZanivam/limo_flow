export type Project = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  status: 'Em desenvolvimento' | 'Concluído' | 'Em estudo';
  repoUrl?: string;
  demoUrl?: string;
  highlights: string[];
  accent: 'gold' | 'blue' | 'emerald';
};

export const projects: Project[] = [
  {
    id: 'limoflow',
    title: 'LimoFlow',
    description: 'Mini CRM para serviços de limousine em casamentos.',
    longDescription:
      'Aplicação full stack com agenda, propostas, contratos, financeiro, checklists e dashboard. Inclui autenticação JWT com roles, testes E2E com Playwright e stack de observabilidade com Grafana, Loki e Tempo.',
    tags: ['React', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker', 'Grafana'],
    status: 'Em desenvolvimento',
    repoUrl: 'https://github.com/JonasZanivam/limo_flow',
    highlights: [
      'Auth JWT com perfis Admin e Motorista',
      'CRUD de clientes, veículos e eventos',
      'Deploy automatizado via GitHub Actions',
      'Logs e traces com OpenTelemetry',
    ],
    accent: 'gold',
  },
  // Adicione mais projetos de estudo abaixo, por exemplo:
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
