import {
  Calendar,
  Car,
  FileText,
  Handshake,
  LayoutDashboard,
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

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'DRIVER'] },
  { title: 'Agenda', href: '/agenda', icon: Calendar, roles: ['ADMIN', 'DRIVER'] },
  { title: 'Clientes', href: '/clientes', icon: Users, roles: ['ADMIN'] },
  { title: 'Propostas', href: '/propostas', icon: FileText, roles: ['ADMIN'] },
  { title: 'Contratos', href: '/contratos', icon: Handshake, roles: ['ADMIN'] },
  { title: 'Financeiro', href: '/financeiro', icon: Wallet, roles: ['ADMIN'] },
  { title: 'Veículos', href: '/veiculos', icon: Car, roles: ['ADMIN'] },
  { title: 'Usuários', href: '/usuarios', icon: UserCog, roles: ['ADMIN'] },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
