# Portfólio — Jonas Zanivam

Site pessoal servido na **raiz do domínio** (`/`). O LimoFlow abre em `/limoflow/` no mesmo deploy de produção.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4

## Desenvolvimento

```bash
cd portfolio
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

## Produção (junto com LimoFlow)

No deploy da VPS, o container `frontend` serve:

| Caminho | App |
|---------|-----|
| `/` | Portfólio |
| `/limoflow/` | LimoFlow |
| `/api/` | API NestJS |

Build unificado via `web/Dockerfile`.

## Personalizar

Edite os arquivos em `src/data/`:

| Arquivo | Conteúdo |
|---------|----------|
| `profile.ts` | Nome, bio, links sociais |
| `projects.ts` | Apps (use `appUrl: '/limoflow/'` para apps neste domínio) |
| `resume.ts` | Experiência, formação e skills |

Para o PDF do currículo:

```
public/curriculo-jonas-zanivam.pdf
```

## Build local

```bash
npm run build
npm run preview
```
