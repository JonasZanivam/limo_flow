import {
  Calendar,
  Car,
  FileText,
  Handshake,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const allNavGroups: NavGroup[] = [
  {
    label: 'Operação',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'DRIVER'],
      },
      {
        title: 'Agenda',
        href: '/agenda',
        icon: Calendar,
        roles: ['ADMIN', 'DRIVER'],
      },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { title: 'Clientes', href: '/clientes', icon: Users, roles: ['ADMIN'] },
      {
        title: 'Propostas',
        href: '/propostas',
        icon: FileText,
        roles: ['ADMIN'],
      },
      {
        title: 'Contratos',
        href: '/contratos',
        icon: Handshake,
        roles: ['ADMIN'],
      },
    ],
  },
  {
    label: 'Gestão',
    items: [
      {
        title: 'Financeiro',
        href: '/financeiro',
        icon: Wallet,
        roles: ['ADMIN'],
      },
      { title: 'Veículos', href: '/veiculos', icon: Car, roles: ['ADMIN'] },
      {
        title: 'Usuários',
        href: '/usuarios',
        icon: UserCog,
        roles: ['ADMIN'],
      },
      {
        title: 'Parâmetros',
        href: '/parametros',
        icon: Settings,
        roles: ['ADMIN'],
      },
    ],
  },
];

export function getNavGroupsForRole(role: UserRole): NavGroup[] {
  return allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getPageTitle(pathname: string): string {
  for (const group of allNavGroups) {
    for (const item of group.items) {
      if (item.href === '/') {
        if (pathname === '/') return item.title;
        continue;
      }

      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.title;
      }
    }
  }

  return 'LimoFlow';
}
