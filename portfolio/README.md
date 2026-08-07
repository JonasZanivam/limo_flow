# Portfólio — Jonas Zanivam

Site pessoal com currículo e showcase de projetos de estudo.

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

## Personalizar

Edite os arquivos em `src/data/`:

| Arquivo | Conteúdo |
|---------|----------|
| `profile.ts` | Nome, bio, links sociais |
| `projects.ts` | Apps de estudo |
| `resume.ts` | Experiência, formação e skills |

Para o PDF do currículo, coloque o arquivo em:

```
public/curriculo-jonas-zanivam.pdf
```

## Build

```bash
npm run build
npm run preview
```

A pasta `dist/` pode ser publicada em GitHub Pages, Vercel, Netlify ou na mesma VPS do LimoFlow.
