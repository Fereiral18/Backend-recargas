import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CircleHelp,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Wallet,
  X,
} from 'lucide-react';

import { authService } from '../../services';

interface ResellerLayoutProps {
  children: ReactNode;
}

// Mismo criterio que en AdminLayout: "Recargas de juego" (venta al cliente
// final del revendedor) y "Mi saldo" (su balance prepago) son dos cosas
// distintas y se confundían con el mismo ícono de billetera para las dos.
// El revendedor no tiene Usuarios ni gestión de Tickets -- solo ve y
// responde los suyos desde Soporte, nunca administra los de otros.
const navigation = [
  { label: 'Inicio', icon: LayoutDashboard, href: '/reseller' },
  { label: 'Recargas de juego', icon: Gamepad2, href: '/recharges' },
  { label: 'Mi saldo', icon: Wallet, href: '/balance-topups' },
  { label: 'Transacciones', icon: BarChart3, href: '/transactions' },
  { label: 'Soporte', icon: CircleHelp, href: '/support' },
  { label: 'Mi perfil', icon: User, href: '/profile' },
];

// Shell persistente para el panel de revendedor (Inicio, Recargas,
// Saldo, Soporte, Perfil) -- antes cada pantalla tenía su propio header
// suelto y el sidebar desaparecía apenas se navegaba fuera de /reseller.
export const ResellerLayout = ({ children }: ResellerLayoutProps) => {
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
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">Panel Revendedor</span>
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
          <Link to="/reseller" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-600/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">DiamantesFree</p>
              <p className="text-[10px] text-slate-500">Panel de Revendedor</p>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="mx-4 mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-emerald-500/20">
              <User className="h-5 w-5 text-emerald-400" />
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
                        ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/10'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] text-slate-400">Cuenta de revendedor</span>
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
