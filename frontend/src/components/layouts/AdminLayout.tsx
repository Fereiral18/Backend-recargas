import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Ticket,
  TrendingUp,
  User,
  UserCog,
  Wallet,
  X,
} from 'lucide-react';

import { authService } from '../../services';

interface AdminLayoutProps {
  children: ReactNode;
}

// Recargas (venta de diamantes/paquetes al cliente final) y Cargas de saldo
// (crédito prepago para revendedores) son dos flujos de negocio distintos
// que se confundían fácil en el menú -- íconos y nombres separados a
// propósito para que se note de un vistazo cuál es cuál.
const navigation = [
  { label: 'Inicio', icon: LayoutDashboard, href: '/admin' },
  { label: 'Recargas de juego', icon: Gamepad2, href: '/admin/recharges' },
  { label: 'Usuarios', icon: UserCog, href: '/admin/users' },
  { label: 'Tickets', icon: Ticket, href: '/admin/tickets' },
  { label: 'Saldo de revendedores', icon: Wallet, href: '/balance-topups' },
  { label: 'Auditoría', icon: TrendingUp, href: '/admin/audit' },
];

// Shell persistente para las 4 secciones del panel de admin (Inicio,
// Recargas, Usuarios, Tickets). Antes cada página tenía su propio header
// con "Volver al panel"/"Cerrar sesión" y no había navegación fija entre
// secciones — igual que en el panel de cliente/revendedor, ahora el
// sidebar queda montado una sola vez y no desaparece al navegar.
export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Mobile header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
        >
          {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">Panel Admin</span>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <User className="h-4 w-4 text-slate-300" />
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 flex-col
          border-r border-white/10 bg-slate-950/95 backdrop-blur-xl
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">DiamantesFree</p>
              <p className="text-[10px] text-slate-500">Panel de Administración</p>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="mx-4 mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-blue-500/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation -- scroll propio: si la lista de secciones no entra
            en pantallas bajas (notebooks 1366x768), que se desplace ella
            sola en vez de apretar o tapar el logout de abajo. */}
        <nav className="mt-4 flex-1 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Menú principal
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenu(false);
                  }}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/10'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span className="text-[11px] text-slate-400">Cuenta de administrador</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <section className="relative min-h-screen pt-16 lg:pl-72 lg:pt-0">{children}</section>
    </div>
  );
};
