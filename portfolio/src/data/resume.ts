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
    company: 'Thomson Reuters',
    role: 'Desenvolvedor de Software Pleno',
    period: 'jan 2024 — presente',
    description: [
      'Desenvolvimento, manutenção e evolução de sistemas corporativos de grande porte utilizados por equipes internas, revendas, filiais e clientes finais.',
      'Full Stack com Java 17, JSP, JSF, Bootstrap e arquitetura MVC em aplicações monolíticas com deploy no WildFly; Java 21 em microserviços.',
      'Atuação na squad de suporte: novas funcionalidades, sustentação, correção de bugs, refatoração e melhorias de performance.',
      'APIs com Servlets e integrações entre sistemas corporativos; integrações assíncronas com Amazon SQS (100k+ mensagens/dia) e S3 para anexos.',
      'Busca com Apache Solr em grandes volumes de dados; Sybase 17 e PostgreSQL com SQL nativo, procedures, performance e replicação.',
      'Análise e resolução de incidentes N2/N3, troubleshooting em Java e PowerBuilder, investigação de logs e integrações.',
      'Soluções com IA: chat interno corporativo e monitoria automatizada de atendimentos com geração de relatórios.',
      'Modernização de legados, GitHub Actions, Jenkins, Datadog e ferramentas de produtividade (Cursor, Claude Code, ChatGPT).',
    ],
  },
  {
    company: 'Thomson Reuters',
    role: 'Desenvolvedor de Software Jr',
    period: 'jul 2021 — jan 2024',
    description: [
      'Sustentação dos sistemas internos SGD, ERP, GED e Domínio Atendimento (Aba Suporte), com análise, diagnóstico e resolução de incidentes.',
      'Processos de sustentação N2/N3: análise de logs, consultas SQL, validação de integrações e monitoramento de processos críticos.',
      'Relatórios gerenciais e indicadores para apoio à tomada de decisão de equipes e gestores.',
      'Views, procedures e consultas SQL otimizadas para integração com Power BI e dashboards analíticos.',
      'Priorização e encaminhamento de demandas complexas entre áreas técnicas e de negócio.',
    ],
  },
  {
    company: 'Thomson Reuters',
    role: 'Analista de Sistemas',
    period: 'jun 2015 — jul 2021',
    description: [
      'Atendimento ao cliente e suporte de aplicativos corporativos em ambiente presencial.',
      'Base técnica construída em diagnóstico de problemas, comunicação com usuários e operação de sistemas de negócio.',
    ],
  },
  {
    company: 'Projetos pessoais',
    role: 'Desenvolvedor Full Stack',
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
    institution: 'Esucri',
    degree: 'Bacharel em Sistemas de Informação',
    period: '2013 — 2017',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend & Dados',
    items: [
      'Java 8, 17 e 21',
      'Spring Boot',
      'Servlets',
      'Microserviços',
      'Sybase 9, 16 e 17',
      'PostgreSQL',
      'SQL nativo',
      'Power BI',
    ],
  },
  {
    title: 'Frontend & Web',
    items: ['JSP / JSF','React', 'TypeScript', 'Bootstrap', 'NestJS', 'REST APIs', 'TanStack Query'],
  },
  {
    title: 'Cloud, DevOps & Ferramentas',
    items: [
      'Amazon SQS',
      'Amazon S3',
      'Apache Solr',
      'WildFly',
      'GitHub Actions',
      'Jenkins',
      'Datadog',
      'Docker',
    ],
  },
];

export const resumePdfUrl = '/curriculo-jonas-zanivam.pdf';
