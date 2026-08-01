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
| **Grafana** | http://localhost:3030       |

## Observabilidade (Grafana + Loki + Tempo)

Stack local para **logs** e **traces** da API:

```bash
# Subir PostgreSQL + Grafana/Loki/Tempo/Promtail
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

No `backend/.env`, ative:

```env
LOG_TO_FILE=true
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

Reinicie o backend (`npm run start:dev`). Os logs JSON vão para `backend/logs/app.log` e o Promtail envia para o Loki.

### Acessar Grafana

| Campo | Valor |
|-------|-------|
| URL | http://localhost:3030 |
| Usuário | `admin` |
| Senha | `admin` |

### Ver logs

1. Grafana → **Explore** (ícone de bússola)
2. Datasource: **Loki**
3. Query: `{job="limoflow-api"}`
4. Run query

### Ver traces

1. Grafana → **Explore**
2. Datasource: **Tempo**
3. Search → Service Name: `limoflow-api`

> **Nota:** Enquanto o backend roda com `npm run start:dev` no host (não em Docker), os logs vão via arquivo `backend/logs/app.log`. Traces vão via OTLP para o Tempo na porta 4318.

Documentação completa: [docs/observabilidade.md](docs/observabilidade.md)

## Testes

```bash
# Unitários + E2E API (backend)
cd backend && npm test && npm run test:e2e

# E2E UI + API (Playwright)
cd e2e && npm install && npx playwright install chromium && npm test
```

Documentação completa: [docs/testes.md](docs/testes.md)

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
- [x] Auth JWT + roles (backend)
- [x] Auth frontend (login + rotas protegidas)
- [x] Clientes e Veículos
- [x] Agenda
- [x] Propostas e Contratos
- [x] Financeiro
- [ ] Checklist
- [x] Dashboard
- [x] WhatsApp wa.me
