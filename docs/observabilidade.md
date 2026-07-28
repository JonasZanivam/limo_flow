# Observabilidade — LimoFlow

Stack local para logs e traces da API durante o desenvolvimento.

## Arquitetura

```text
┌─────────────────┐     ┌───────────┐     ┌───────┐     ┌─────────┐
│  Backend (Pino) │────▶│ app.log   │────▶│Promtail│────▶│  Loki   │
│  npm run dev    │     │ logs/     │     └───────────┘     └───┬────┘
└────────┬────────┘                                           │
         │ OTLP :4318                                          ▼
         └──────────────────────────────────────────────▶ Grafana :3030
                              ┌─────────┐                      ▲
                              │  Tempo  │──────────────────────┘
                              └─────────┘
```

| Componente | Função | Porta |
|------------|--------|-------|
| **Grafana** | UI de visualização | 3030 |
| **Loki** | Armazenamento de logs | 3100 |
| **Promtail** | Coleta logs do arquivo | — |
| **Tempo** | Armazenamento de traces | 3200 / 4318 |

## Subir o stack

```bash
# Na raiz do projeto
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

## Configurar o backend

No `backend/.env`:

```env
LOG_LEVEL=info
LOG_TO_FILE=true
OTEL_ENABLED=true
OTEL_SERVICE_NAME=limoflow-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

Reinicie o backend:

```bash
cd backend
npm run start:dev
```

## Acessar Grafana

| Campo | Valor |
|-------|-------|
| URL | http://localhost:3030 |
| Usuário | `admin` |
| Senha | `admin` |

## Ver logs (passo a passo)

1. Gere tráfego na API (login, `/health`, etc.)
2. Confirme que existe `backend/logs/app.log`
3. Abra Grafana → **Explore** (ícone de bússola)
4. Datasource: **Loki**
5. Query:

```logql
{job="limoflow-api"}
```

6. Clique em **Run query**

### Filtros úteis

```logql
{job="limoflow-api"} |= "login"
{job="limoflow-api"} | json | level="warn"
{job="limoflow-api"} | json | requestId="SEU-REQUEST-ID"
```

### Validar via terminal (sem Grafana)

```bash
curl -G "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="limoflow-api"}' \
  --data-urlencode 'limit=5'
```

Se retornar `"status":"success"` com entradas em `data.result`, os logs estão chegando.

## Ver traces

1. Grafana → **Explore**
2. Datasource: **Tempo**
3. **Search** → Service Name: `limoflow-api`
4. Execute uma request na API antes (ex.: `POST /auth/login`)

## Segurança dos logs

O Pino **redige automaticamente**:

- `Authorization` header
- `password` no body
- `refreshToken` no body

Nunca logamos credenciais em texto claro.

## Produção

Em produção, configure:

- `OTEL_ENABLED=true` com endpoint do collector (Grafana Cloud, Datadog, etc.)
- `LOG_TO_FILE=false` (use stdout + agente do orchestrator)
- Altere senha padrão do Grafana
- Retenção do Loki conforme política da empresa
