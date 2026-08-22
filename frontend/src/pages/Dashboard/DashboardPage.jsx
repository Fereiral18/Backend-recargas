import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Diamond,
  Gamepad2,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { authService, userService } from '../../services';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const dashboardResponse = await userService.getDashboard();

      setStats(dashboardResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);

      toast.error(
        'No pudimos cargar los datos del dashboard'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();

    navigate('/login');
  };

  const firstName = user?.first_name || 'Usuario';

  const balance = Number(user?.balance || 0);

  const statsCards = [
    {
      label: 'Balance disponible',
      value: `$${balance.toFixed(2)}`,
      description: 'Saldo disponible',
      icon: Wallet,
      iconClass: 'bg-emerald-500/10 text-emerald-400',
      valueClass: 'text-emerald-400',
      href: '/profile',
    },
    {
      label: 'Recargas',
      value: stats?.total_recharges || 0,
      description: 'Recargas realizadas',
      icon: Diamond,
      iconClass: 'bg-violet-500/10 text-violet-400',
      valueClass: 'text-white',
      href: '/recharges',
    },
    {
      label: 'Transacciones',
      value: stats?.total_transactions || 0,
      description: 'Operaciones realizadas',
      icon: BarChart3,
      iconClass: 'bg-blue-500/10 text-blue-400',
      valueClass: 'text-white',
      href: '/transactions',
    },
    {
      label: 'Tickets abiertos',
      value: stats?.open_tickets || 0,
      description: 'Solicitudes pendientes',
      icon: Ticket,
      iconClass: 'bg-orange-500/10 text-orange-400',
      valueClass: 'text-white',
      href: '/support',
    },
  ];

  const quickActions = [
    {
      title: 'Nueva recarga',
      description: 'Recarga tu juego favorito',
      icon: Plus,
      href: '/recharges/create',
      iconClass:
        'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white',
    },
    {
      title: 'Transacciones',
      description: 'Consulta tus movimientos',
      icon: CreditCard,
      href: '/transactions',
      iconClass:
        'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
    },
    {
      title: 'Soporte',
      description: '¿Necesitas ayuda?',
      icon: Headphones,
      href: '/support',
      iconClass:
        'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
    },
    {
      title: 'Configuración',
      description: 'Administra tu cuenta',
      icon: Settings,
      href: '/profile',
      iconClass:
        'bg-slate-500/10 text-slate-400 group-hover:bg-slate-500 group-hover:text-white',
    },
  ];

  const navigation = [
    {
      label: 'Inicio',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Recargas',
      icon: Diamond,
      href: '/recharges',
    },
    {
      label: 'Transacciones',
      icon: BarChart3,
      href: '/transactions',
    },
    {
      label: 'Soporte',
      icon: CircleHelp,
      href: '/support',
    },
    {
      label: 'Mi perfil',
      icon: User,
      href: '/profile',
    },
  ];

  if (user?.role === 'ADMIN') {
    navigation.push({
      label: 'Administración',
      icon: ShieldCheck,
      href: '/admin',
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-violet-500" />

            <Sparkles className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-violet-400" />
          </div>

          <p className="text-sm text-slate-500">
            Cargando tu dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
        >
          {mobileMenu ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>

          <span className="text-sm font-bold">
            DiamantesFree
          </span>
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
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                DiamantesFree
              </p>

              <p className="text-[10px] text-slate-500">
                Recargas rápidas
              </p>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="mx-4 mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-violet-500/20">
              <User className="h-5 w-5 text-violet-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Menú principal
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/dashboard';

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
                        ? 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/10'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      isActive
                        ? 'text-violet-400'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />

              <span className="text-[11px] text-slate-400">
                Plataforma segura
              </span>
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
      <section className="relative min-h-screen lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                <span className="text-xs font-medium text-emerald-400">
                  Cuenta activa
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Hola, {firstName} 👋
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                ¿Qué deseas hacer hoy?
              </p>
            </div>

            <button
              onClick={() => navigate('/recharges/create')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-600/30"
            >
              <Plus className="h-4 w-4" />

              Nueva recarga

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </motion.div>

          {/* Balance Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="relative mb-6 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-slate-900 p-6 shadow-2xl shadow-violet-950/20 sm:p-8"
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-32 right-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Wallet className="h-4 w-4 text-violet-300" />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Balance disponible
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    ${balance.toFixed(2)}
                  </span>

                  <span className="text-sm font-medium text-emerald-400">
                    USD
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Disponible para realizar tus próximas recargas.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] md:flex">
                <Diamond
                  className="h-12 w-12 text-violet-400"
                  strokeWidth={1.2}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.button
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15 + index * 0.05,
                  }}
                  onClick={() => navigate(stat.href)}
                  className="group text-left"
                >
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055] hover:shadow-xl hover:shadow-black/20">
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-slate-700 transition-colors group-hover:text-slate-400" />
                    </div>

                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p
                      className={`mt-1 text-2xl font-bold tracking-tight ${stat.valueClass}`}
                    >
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">
                      {stat.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Quick actions */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Acciones rápidas
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Accede rápidamente a las funciones principales.
                </p>
              </div>

              <Zap className="h-5 w-5 text-violet-400" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <motion.button
                    key={action.title}
                    whileHover={{
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    onClick={() => navigate(action.href)}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${action.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {action.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-600 transition-colors group-hover:text-slate-500">
                        {action.description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          {/* Bottom banner */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.4,
            }}
            className="mt-8 overflow-hidden rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.06] via-violet-500/[0.06] to-indigo-500/[0.06] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Gamepad2 className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    ¿Listo para tu próxima partida?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Realiza una recarga y sigue disfrutando.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/recharges/create')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Recargar ahora
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};