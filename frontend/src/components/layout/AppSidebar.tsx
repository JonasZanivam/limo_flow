import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/use-auth';
import { ROLE_LABELS } from '@/types/auth';
import { cn } from '@/lib/utils';
import { getNavGroupsForRole } from './nav-items';

type AppSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navGroups = getNavGroupsForRole(user.role);

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={cn('flex h-full flex-col bg-sidebar text-sidebar-foreground', className)}>
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          LimoFlow
        </p>
        <p className="mt-1 text-sm text-sidebar-foreground/70">
          CRM de limousine
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-4 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent font-medium text-primary'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          'size-4 shrink-0',
                          isActive ? 'text-primary' : 'text-sidebar-foreground/60',
                        )}
                      />
                      {item.title}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent/40 px-3 py-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {user.email}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
