# 🚘 LimoFlow

Mini CRM web para serviços de limousine em casamentos — React + NestJS + PostgreSQL.

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, React Router
- **Backend:** NestJS, Prisma, PostgreSQL, JWT
- **Infra:** Docker Compose (PostgreSQL)

## Pré-requisitos

- Node.js 20+ (testado com v24)
- Docker Desktop em execução
- Git

## Setup rápido

```bash
# 1. Banco de dados
cp .env.example .env
docker compose up -d

# 2. Backend
cd backend
cp ../.env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev

# 3. Frontend (outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## URLs

| Serviço    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:5173      |
| API        | http://localhost:3000      |
| Health     | http://localhost:3000/health |
| PostgreSQL | localhost:5432             |

## Credenciais demo (seed)

| Perfil    | E-mail                    | Senha     |
|-----------|---------------------------|-----------|
| Admin     | admin@limoflow.com        | admin123  |
| Motorista | motorista@limoflow.com    | driver123 |

## Estrutura

```
limo_flow/
├── docker-compose.yml
├── backend/          # NestJS + Prisma
└── frontend/         # React + Vite
```

## Branches

- `develop` — desenvolvimento ativo
- `master` — estável (PRs quando features estiverem prontas)

## Roadmap

Ver issues do repositório para o roadmap completo.

- [x] Scaffold monorepo
- [ ] Auth JWT + roles
- [ ] Clientes e Veículos
- [ ] Agenda
- [ ] Propostas e Contratos
- [ ] Financeiro
- [ ] Checklist
- [ ] Dashboard
- [ ] WhatsApp wa.me
