import { profile } from '@/data/profile';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {year} {profile.name}. Todos os direitos reservados.
        </p>
        <p>
          Repositório:{' '}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            github.com/JonasZanivam
          </a>
        </p>
      </div>
    </footer>
  );
}
