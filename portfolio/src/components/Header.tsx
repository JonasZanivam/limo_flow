import { profile } from '@/data/profile';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';
import { Mail, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#projetos', label: 'Apps' },
  { href: '#curriculo', label: 'Currículo' },
  { href: '#contato', label: 'Contato' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-border bg-background/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#" className="text-lg font-semibold tracking-tight">
          <span className="gradient-text">{profile.name.split(' ')[0]}</span>
          <span className="text-muted-foreground">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-4" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Fale comigo
          </a>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-muted-foreground">
                <GitHubIcon className="size-5" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground">
                <LinkedInIcon className="size-5" />
              </a>
              <a href={`mailto:${profile.email}`} className="text-muted-foreground">
                <Mail className="size-5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
