import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CreditCard,
  Gamepad2,
  Headphones,
  Plus,
  Sparkles,
  Ticket,
  Wallet,
  Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { userService } from '../../services';
import { ResellerLayout } from '../../components/layouts/ResellerLayout';

// Panel exclusivo de revendedores: balance prepago, cargar saldo, y
// recargas que se descuentan del balance en vez de pagarse con Mercado
// Pago. Deliberadamente un componente separado de DashboardPage (cliente
// final) — no una variante con ifs adentro de la misma pantalla.
export const ResellerDashboardPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (parsedUser?.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      if (parsedUser?.role !== 'reseller') {
        navigate('/dashboard', { replace: true });
        return;
      }

      setUser(parsedUser);

      const dashboardResponse = await userService.getDashboard();

      setStats(dashboardResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);

      toast.error(
        'No pudimos cargar los datos del panel'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = user?.first_name || 'Revendedor';

  const balance = Number(user?.balance || 0);

  const statsCards = [
    {
      label: 'Balance disponible',
      value: `$${balance.toFixed(2)}`,
      description: 'Saldo prepago (USD)',
      icon: Wallet,
      iconClass: 'bg-emerald-500/10 text-emerald-400',
      valueClass: 'text-emerald-400',
      href: '/balance-topups',
    },
    {
      label: 'Recargas de juego',
      value: stats?.total_recharges || 0,
      description: 'Recargas realizadas',
      icon: Gamepad2,
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
      title: 'Cargar saldo',
      description: 'Sumá saldo a tu cuenta',
      icon: Wallet,
      href: '/balance-topups/create',
      iconClass:
        'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    },
    {
      title: 'Nueva recarga',
      description: 'Se descuenta de tu balance',
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
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-500" />

            <Sparkles className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
          </div>

          <p className="text-sm text-slate-500">
            Cargando tu panel de revendedor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResellerLayout>
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

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
                  Cuenta de revendedor
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Hola, {firstName} 👋
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gestioná tu saldo y tus recargas.
              </p>
            </div>

            <button
              onClick={() => navigate('/balance-topups/create')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-600/30"
            >
              <Plus className="h-4 w-4" />

              Cargar saldo

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
            className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/20 via-cyan-600/10 to-slate-900 p-6 shadow-2xl shadow-emerald-950/20 sm:p-8"
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-32 right-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Wallet className="h-4 w-4 text-emerald-300" />
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
                  Se descuenta al instante en cada recarga que hagas.
                </p>
              </div>

              <div className="hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] md:flex">
                <Wallet
                  className="h-12 w-12 text-emerald-400"
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

              <Zap className="h-5 w-5 text-emerald-400" />
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
            className="mt-8 overflow-hidden rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.06] via-emerald-500/[0.06] to-slate-900/[0.06] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Gamepad2 className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    ¿Necesitás más saldo?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Subí el comprobante y un admin lo acredita.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/balance-topups/create')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cargar saldo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
      </div>
    </ResellerLayout>
  );
};
