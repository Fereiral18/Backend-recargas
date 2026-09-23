import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Gamepad2,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  DollarSign,
  Ticket,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Zap,
  Headphones,
  UserCog,
  CircleDollarSign,
  Wallet,
} from "lucide-react";

import { rechargeService, supportService } from "../../services";

import { adminUserService } from "../../services/admin.service";
import { toast } from "react-toastify";
import { AdminLayout } from "../../components/layouts/AdminLayout";

interface AdminStats {
  users: {
    total: number;
  };

  recharges: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    todayTotal: number;
    todayPending: number;
    todayAmount: number;
  };

  tickets: {
    open: number;
    total: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  iconClass: string;
  onClick?: () => void;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
  onClick,
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`
        group relative overflow-hidden
        rounded-2xl border border-white/10
        bg-white/[0.035] p-5
        transition-all duration-300
        hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055] hover:shadow-xl hover:shadow-black/20
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/[0.03] blur-2xl transition group-hover:bg-blue-500/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs font-medium text-slate-600">
              {description}
            </p>
          )}
        </div>

        <div
          className={`
            flex h-12 w-12 shrink-0 items-center justify-center
            rounded-2xl ${iconClass}
            transition-transform duration-300
            group-hover:scale-110
          `}
        >
          {icon}
        </div>
      </div>

      {onClick && (
        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-600 transition group-hover:text-blue-400">
          Ver detalles
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      )}
    </motion.div>
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<AdminStats>({
    users: {
      total: 0,
    },

    recharges: {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      todayTotal: 0,
      todayPending: 0,
      todayAmount: 0,
    },

    tickets: {
      open: 0,
      total: 0,
    },
  });

  const loadStats = async () => {
    try {
      setIsLoading(true);

      const [
        usersRes,
        rechargesRes,
        ticketsRes,
      ] = await Promise.all([
        adminUserService.getStats(),
        rechargeService.getStats(),
        supportService
          .getStats()
          .catch(() => ({
            open: 0,
            total: 0,
          })),
      ]);

      setStats({
        users:
          usersRes?.data ||
          usersRes || {
            total: 0,
          },

        recharges:
          rechargesRes || {
            total: 0,
            pending: 0,
            completed: 0,
            failed: 0,
            todayTotal: 0,
            todayPending: 0,
            todayAmount: 0,
          },

        tickets:
          ticketsRes?.data ||
          ticketsRes || {
            open: 0,
            total: 0,
          },
      });
    } catch (error) {
      console.error(
        "Error al cargar estadísticas:",
        error
      );

      toast.error(
        "Error al cargar las estadísticas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (user?.role !== "admin") {
      toast.error(
        "No tienes permisos de administrador"
      );

      navigate("/dashboard");
      return;
    }

    loadStats();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-500/20">
              <ShieldCheck size={30} />
            </div>

            <div className="absolute -bottom-1 -right-1 h-5 w-5 animate-pulse rounded-full border-4 border-slate-950 bg-emerald-500" />
          </div>

          <h2 className="text-lg font-black text-white">
            Cargando panel
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Obteniendo estadísticas...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <main className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/20">
                  <ShieldCheck size={28} />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      Administrador
                    </span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Panel de Administración
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Supervisa usuarios, recargas y soporte desde un solo lugar.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadStats}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-white/[0.08] hover:text-blue-400 disabled:opacity-60"
              >
                <RefreshCw size={17} />
                Actualizar estadísticas
              </button>
            </div>
          </div>
        </motion.header>

        {/* ALERTS */}
        {(stats.recharges.pending > 0 ||
          stats.tickets.open > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle
                size={18}
                className="text-amber-500"
              />

              <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">
                Requieren atención
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {stats.recharges.pending > 0 && (
                <button
                  onClick={() =>
                    navigate("/admin/recharges")
                  }
                  className="group flex items-center gap-4 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Clock3 size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-amber-200">
                      {stats.recharges.pending} recargas pendientes
                    </p>

                    <p className="mt-0.5 text-sm text-amber-300/70">
                      Requieren verificación.
                    </p>
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-amber-500 transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}

              {stats.tickets.open > 0 && (
                <button
                  onClick={() =>
                    navigate("/admin/tickets")
                  }
                  className="group flex items-center gap-4 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    <Ticket size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-blue-200">
                      {stats.tickets.open} tickets abiertos
                    </p>

                    <p className="mt-0.5 text-sm text-blue-300/70">
                      Requieren atención del equipo.
                    </p>
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-blue-400 transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}
            </div>
          </motion.section>
        )}

        {/* TODAY */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays size={18} />
            </div>

            <div>
              <h2 className="font-black text-white">
                Resumen de Hoy
              </h2>

              <p className="text-xs text-slate-600">
                Actividad registrada durante el día
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              title="Pendientes hoy"
              value={stats.recharges.todayPending}
              description="Esperando verificación"
              icon={<Clock3 size={22} />}
              iconClass="bg-amber-500/10 text-amber-400"
              onClick={() =>
                navigate("/admin/recharges")
              }
              delay={0.05}
            />

            <StatCard
              title="Recargas hoy"
              value={stats.recharges.todayTotal}
              description="Operaciones registradas"
              icon={<Gamepad2 size={22} />}
              iconClass="bg-blue-500/10 text-blue-400"
              delay={0.1}
            />

            <StatCard
              title="Procesado hoy"
              value={`$${Number(
                stats.recharges.todayAmount || 0
              ).toFixed(2)}`}
              description="Monto total procesado"
              icon={<DollarSign size={22} />}
              iconClass="bg-emerald-500/10 text-emerald-400"
              delay={0.15}
            />
          </div>
        </section>

        {/* GENERAL STATS */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <CircleDollarSign size={18} />
            </div>

            <div>
              <h2 className="font-black text-white">
                Estadísticas Generales
              </h2>

              <p className="text-xs text-slate-600">
                Resumen general de la plataforma
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Usuarios registrados"
              value={stats.users.total}
              description="Usuarios en la plataforma"
              icon={<Users size={22} />}
              iconClass="bg-indigo-500/10 text-indigo-400"
              onClick={() =>
                navigate("/admin/users")
              }
              delay={0.2}
            />

            <StatCard
              title="Total de recargas"
              value={stats.recharges.total}
              description="Todas las operaciones"
              icon={<Gamepad2 size={22} />}
              iconClass="bg-violet-500/10 text-violet-400"
              onClick={() =>
                navigate("/admin/recharges")
              }
              delay={0.25}
            />

            <StatCard
              title="Recargas completadas"
              value={stats.recharges.completed}
              description="Operaciones exitosas"
              icon={<CheckCircle2 size={22} />}
              iconClass="bg-emerald-500/10 text-emerald-400"
              delay={0.3}
            />

            <StatCard
              title="Recargas fallidas"
              value={stats.recharges.failed}
              description="Operaciones rechazadas"
              icon={<XCircle size={22} />}
              iconClass="bg-red-500/10 text-red-400"
              delay={0.35}
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Zap size={18} />
            </div>

            <div>
              <h2 className="font-black text-white">
                Acciones Rápidas
              </h2>

              <p className="text-xs text-slate-600">
                Accede rápidamente a las funciones administrativas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* RECHARGES */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/recharges")}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-all duration-300">
                <Gamepad2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Recargas de juego</p>
                <p className="mt-0.5 truncate text-xs text-slate-600 transition-colors group-hover:text-slate-500">
                  {stats.recharges.pending} pendientes de revisión
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </motion.button>

            {/* USERS */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/users")}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition-all duration-300">
                <UserCog className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Gestionar usuarios</p>
                <p className="mt-0.5 truncate text-xs text-slate-600 transition-colors group-hover:text-slate-500">
                  {stats.users.total} registrados
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </motion.button>

            {/* SUPPORT */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/tickets")}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all duration-300">
                <Headphones className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Tickets de soporte</p>
                <p className="mt-0.5 truncate text-xs text-slate-600 transition-colors group-hover:text-slate-500">
                  {stats.tickets.open} abiertos
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </motion.button>

            {/* BALANCE TOP-UPS */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/balance-topups")}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition-all duration-300">
                <Wallet className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Saldo de revendedores</p>
                <p className="mt-0.5 truncate text-xs text-slate-600 transition-colors group-hover:text-slate-500">
                  Revisá y aprobá solicitudes de carga
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </motion.button>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};
