import { NavLink, Outlet } from 'react-router-dom';
import { navItems } from './nav-items';
import { cn } from '@/lib/utils';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="border-b border-sidebar-border px-6 py-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            LimoFlow
          </p>
          <p className="mt-1 text-sm text-sidebar-foreground/70">
            CRM de limousine
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )
              }
            >
              <item.icon className="size-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b px-4 py-4 md:px-8">
          <h1 className="text-lg font-semibold">LimoFlow</h1>
          <p className="text-sm text-muted-foreground">
            Scaffold inicial — módulos em desenvolvimento
          </p>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
