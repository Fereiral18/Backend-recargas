import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileImage,
  History,
  Loader2,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import { balanceTopUpService } from "../../services";
import type { BalanceTopUpRequest } from "../../services/types";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { ResellerLayout } from "../../components/layouts/ResellerLayout";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    APPROVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    REJECTED: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return classes[status] || "border-white/10 bg-white/[0.05] text-white/40";
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock3 size={13} />,
    APPROVED: <CheckCircle2 size={13} />,
    REJECTED: <XCircle size={13} />,
  };

  return icons[status] || <Clock3 size={13} />;
};

export const BalanceTopUpsListPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<BalanceTopUpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";
  const isReseller = currentUser?.role === "reseller";

  const loadRequests = useCallback(async () => {
    try {
      const response = await balanceTopUpService.getAll(statusFilter || undefined);
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      toast.error("Error al cargar las solicitudes de saldo");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleViewProof = async (uuid: string) => {
    try {
      const url = await balanceTopUpService.getProofImageUrl(uuid);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al cargar comprobante:", error);
      toast.error("Error al cargar el comprobante");
    }
  };

  const handleApprove = async (uuid: string) => {
    const reviewNote = window.prompt(
      "Nota (opcional) — ej: verificado contra el resumen de cuenta:"
    );

    if (reviewNote === null) return;

    setActioningId(uuid);

    try {
      await balanceTopUpService.approve(uuid, reviewNote || undefined);
      toast.success("Solicitud aprobada, saldo acreditado");
      loadRequests();
    } catch (error: any) {
      console.error("Error al aprobar:", error);
      toast.error(error?.response?.data?.message || "Error al aprobar la solicitud");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (uuid: string) => {
    const reviewNote = window.prompt("Motivo del rechazo:");

    if (reviewNote === null) return;

    setActioningId(uuid);

    try {
      await balanceTopUpService.reject(uuid, reviewNote || undefined);
      toast.success("Solicitud rechazada");
      loadRequests();
    } catch (error: any) {
      console.error("Error al rechazar:", error);
      toast.error(error?.response?.data?.message || "Error al rechazar la solicitud");
    } finally {
      setActioningId(null);
    }
  };

  const content = (
    <>
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                <History size={14} />
                {isAdmin ? "SOLICITUDES DE SALDO" : "MI HISTORIAL"}
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {isAdmin ? (
                  <>
                    Cargas de{" "}
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                      saldo
                    </span>
                  </>
                ) : (
                  <>
                    Mi{" "}
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                      saldo
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                {isAdmin
                  ? "Revisá los comprobantes y aprobá o rechazá cada solicitud."
                  : "Consultá el estado de tus solicitudes de carga de saldo."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/balance-topups/create")}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30"
                >
                  <Plus size={18} className="transition-transform group-hover:rotate-90" />
                  Cargar saldo
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}

              {!isAdmin && !isReseller && (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white/60 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  <ArrowLeft size={17} />
                  <span className="hidden sm:inline">Volver</span>
                </button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5"
        >
          <div className="relative w-full sm:w-[250px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d0d15] px-4 py-3.5 pr-10 text-sm font-medium text-white/80 outline-none transition focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobada</option>
              <option value="REJECTED">Rechazada</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
            />
          </div>
        </motion.section>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[400px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]"
            >
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Loader2 size={28} className="animate-spin" />
                </div>
                <p className="font-bold text-white">Cargando solicitudes...</p>
              </div>
            </motion.div>
          ) : requests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-400">
                  <Wallet size={34} />
                </div>
              </div>

              <h2 className="text-xl font-black sm:text-2xl">
                {isAdmin ? "No hay solicitudes" : "Todavía no cargaste saldo"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
                {isAdmin
                  ? "Cuando un revendedor pida cargar saldo, va a aparecer acá."
                  : "Transferí a la cuenta indicada y subí el comprobante para cargar saldo."}
              </p>

              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/balance-topups/create")}
                  className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3.5 text-sm font-black shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  <Sparkles size={17} />
                  Cargar saldo
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
              {requests.map((request, index) => (
                <motion.article
                  key={request.uuid}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.045]"
                >
                  <div className="relative flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                        <Wallet size={23} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black">
                          ${Number(request.amount).toFixed(2)} USD
                        </h2>

                        {isAdmin && request.user && (
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/30">
                            <User size={12} />
                            {request.user.first_name} {request.user.last_name} · {request.user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      {statusLabels[request.status] || request.status}
                    </div>
                  </div>

                  <div className="relative p-5 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailItem
                        icon={<Calendar size={16} />}
                        label="Fecha"
                        value={new Date(request.created_at).toLocaleString()}
                      />

                      {request.note && (
                        <DetailItem icon={<Receipt size={16} />} label="Referencia" value={request.note} />
                      )}

                      {request.review_note && (
                        <DetailItem
                          icon={<ShieldCheck size={16} />}
                          label="Nota del admin"
                          value={request.review_note}
                        />
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => handleViewProof(request.uuid)}
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.07] px-4 py-3 text-xs font-bold text-violet-300 transition hover:border-violet-400/40 hover:bg-violet-500/[0.12] sm:w-auto"
                      >
                        <FileImage size={16} />
                        Ver comprobante
                        <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </button>

                      {isAdmin && request.status === "PENDING" && (
                        <div className="flex w-full gap-2 sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleApprove(request.uuid)}
                            disabled={actioningId === request.uuid}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3 text-xs font-bold text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/[0.14] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                          >
                            {actioningId === request.uuid ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Check size={15} />
                            )}
                            Aprobar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(request.uuid)}
                            disabled={actioningId === request.uuid}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3 text-xs font-bold text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.10] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                          >
                            <X size={15} />
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  if (isAdmin) {
    return <AdminLayout>{content}</AdminLayout>;
  }

  if (isReseller) {
    return <ResellerLayout>{content}</ResellerLayout>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute right-[-180px] top-[10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-220px] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {content}
    </main>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem = ({ icon, label, value }: DetailItemProps) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/[0.12] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/30">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{label}</p>
        <p className="mt-1 truncate text-xs font-medium text-white/50" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
};
