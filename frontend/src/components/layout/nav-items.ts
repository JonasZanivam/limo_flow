import { Calendar, Car, FileText, Handshake, LayoutDashboard, Users, Wallet } from 'lucide-react';

export const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Agenda', href: '/agenda', icon: Calendar },
  { title: 'Clientes', href: '/clientes', icon: Users },
  { title: 'Propostas', href: '/propostas', icon: FileText },
  { title: 'Contratos', href: '/contratos', icon: Handshake },
  { title: 'Financeiro', href: '/financeiro', icon: Wallet },
  { title: 'Veículos', href: '/veiculos', icon: Car },
] as const;
