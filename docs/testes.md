# Testes — LimoFlow

## Visão geral

| Tipo | Ferramenta | Local | Comando |
|------|------------|-------|---------|
| Unitários (backend) | Jest | `backend/src/**/*.spec.ts` | `cd backend && npm test` |
| E2E API (backend) | Jest + Supertest | `backend/test/*.e2e-spec.ts` | `cd backend && npm run test:e2e` |
| E2E UI + API | Playwright | `e2e/tests/` | `cd e2e && npm test` |

## Pré-requisitos

- PostgreSQL rodando (`docker compose up -d`)
- Migrations e seed aplicados (`npm run db:migrate && npm run db:seed` no backend)
- Para Playwright local: backend e frontend rodando (ou deixe o Playwright subir via `webServer`)

## Testes unitários (backend)

Cobrem lógica isolada com mocks:

- `auth.service.spec.ts` — login, refresh, rejeição de credenciais
- `users.service.spec.ts` — CRUD, conflitos, auto-remoção
- `roles.guard.spec.ts` — permissões ADMIN/DRIVER

```bash
cd backend
npm test
npm run test:cov   # com cobertura
```

## Testes E2E da API (backend)

Testam a aplicação NestJS completa contra o banco real:

- `test/app.e2e-spec.ts` — rota raiz e health
- `test/auth.e2e-spec.ts` — fluxo login → users → refresh → logout

```bash
cd backend
npm run test:e2e
```

## Testes Playwright (UI + API)

### Setup (primeira vez)

```bash
cd e2e
npm install
npx playwright install chromium
```

### Executar

```bash
cd e2e
npm test              # headless
npm run test:ui       # interface visual
npm run test:headed   # browser visível
npm run report        # relatório HTML
```

### O que é testado

**`tests/frontend.spec.ts`**
- Dashboard carrega com sidebar
- Navegação para Clientes

**`tests/api-auth.spec.ts`**
- `GET /health`
- `POST /auth/login` (admin demo)
- `GET /users` sem token → 401

### Variáveis de ambiente (opcional)

```env
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@limoflow.com
SEED_ADMIN_PASSWORD=admin123
```

## CI (futuro)

Sugestão de pipeline:

1. `docker compose up -d postgres`
2. `backend`: migrate, seed, `npm test`, `npm run test:e2e`
3. `e2e`: `npx playwright install --with-deps && npm test`

## Adicionar novos testes

- **Regra de negócio nova** → unitário em `*.spec.ts` junto ao service/guard
- **Endpoint novo** → `backend/test/<modulo>.e2e-spec.ts`
- **Fluxo de UI** → `e2e/tests/<feature>.spec.ts`
