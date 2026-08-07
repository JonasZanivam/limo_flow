# Deploy na VPS Hostinger

Guia para publicar o LimoFlow em uma VPS (Hostinger ou similar) com **Docker** e **GitHub Actions**.

## Arquitetura

```
Internet → Nginx (frontend container, porta 80)
              ├── /              → Portfólio (site pessoal)
              ├── /limoflow/*    → LimoFlow (CRM React)
              └── /api/*         → NestJS (backend container)
                                    └── PostgreSQL
```

- **CI**: testes + build a cada push/PR em `develop`/`master`
- **CD**: deploy automático via SSH a cada push em `develop`

## 1. Preparar a VPS

Requisitos:

- Ubuntu 22.04+ (ou Debian)
- 2 GB RAM mínimo (recomendado)
- Docker + Docker Compose plugin
- Portas **80** (e **443** se usar HTTPS no host) abertas

### Bootstrap rápido

```bash
# Na VPS, como root:
git clone https://github.com/JonasZanivam/limo_flow.git /opt/limoflow
cd /opt/limoflow
bash scripts/vps-bootstrap.sh
```

Ou instale Docker manualmente: https://docs.docker.com/engine/install/ubuntu/

## 2. Configurar variáveis de ambiente

```bash
cd /opt/limoflow
cp .env.production.example .env
nano .env
```

Preencha obrigatoriamente:

| Variável | Exemplo |
|----------|---------|
| `FRONTEND_URL` | `https://limoflow.seudominio.com.br` |
| `POSTGRES_PASSWORD` | senha forte |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 48` |
| `SEED_ADMIN_PASSWORD` | senha inicial do admin |

No **primeiro deploy**, mantenha `RUN_SEED=true`. Depois mude para `false`.

## 3. Primeiro deploy manual

```bash
cd /opt/limoflow
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker compose -f docker-compose.prod.yml ps
```

Acesse `http://IP-DA-VPS` (ou seu domínio apontando para a VPS).

| URL | Conteúdo |
|-----|----------|
| `/` | Portfólio (currículo, contato, apps) |
| `/limoflow/` | Sistema LimoFlow (login) |
| `/api/health` | Health check da API |

## 4. HTTPS (recomendado)

O compose expõe HTTP na porta 80. Opções:

### A) Certbot no host (simples)

```bash
apt install certbot
certbot certonly --standalone -d limoflow.seudominio.com.br
```

Configure um Nginx/Caddy **no host** fazendo proxy para `localhost:80` com SSL.
Ou monte os certificados no container frontend (requer ajuste extra).

### B) Cloudflare (mais fácil)

- Aponte o domínio para a VPS via Cloudflare
- Ative proxy SSL (Flexible ou Full)
- `FRONTEND_URL` deve ser `https://seudominio.com.br`

## 5. GitHub Actions — secrets

No repositório GitHub: **Settings → Secrets and variables → Actions**

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP ou domínio da VPS |
| `VPS_USER` | Usuário SSH (`root` ou `deploy`) |
| `VPS_SSH_KEY` | Chave privada SSH (conteúdo completo) |
| `VPS_APP_PATH` | `/opt/limoflow` |
| `VPS_SSH_PORT` | (opcional) padrão `22` |

### Chave SSH na VPS

```bash
# No seu computador:
ssh-keygen -t ed25519 -C "github-actions-limoflow" -f limoflow_deploy

# Copie a chave pública para a VPS:
ssh-copy-id -i limoflow_deploy.pub root@IP-DA-VPS

# Cole o conteúdo de limoflow_deploy (privada) no secret VPS_SSH_KEY
```

Garanta que o usuário SSH pode rodar Docker:

```bash
usermod -aG docker deploy
```

## 6. Fluxo de deploy automático

1. Merge em **`master`** (produção)
2. **CI** valida testes e build Docker
3. **Deploy VPS** conecta via SSH, faz `git pull origin master` e `docker compose up -d --build`

Deploy manual: **Actions → Deploy VPS → Run workflow**

## 7. Comandos úteis na VPS

```bash
cd /opt/limoflow

# Ver logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Parar
docker compose -f docker-compose.prod.yml down

# Backup do Postgres
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U limoflow limoflow > backup-$(date +%F).sql
```

## 8. Observabilidade (opcional)

A stack Grafana/Loki/Tempo continua disponível para dev:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

Em produção na VPS, por padrão o compose de produção **não** inclui Grafana — reduz consumo de RAM.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Login não mantém sessão | Confirme `FRONTEND_URL` com o domínio exato (com `https`) |
| 502 no /api | `docker compose logs backend` — migrations ou env faltando |
| JWT error em prod | Secrets com menos de 32 chars ou contendo `change-me` |
| Porta 80 ocupada | Mude `HTTP_PORT=8080` no `.env` |
