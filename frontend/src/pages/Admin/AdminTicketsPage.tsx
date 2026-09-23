import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  CalendarDays,
  Tag,
  UserPlus,
  Eye,
  X,
  Send,
  MessageSquare,
  ChevronDown,
  Inbox,
  Loader2,
} from "lucide-react";

import { adminSupportService } from "../../services/admin.service";
import { supportService } from "../../services";
import type { TicketMessage } from "../../services/types";
import {
  TicketStatusLabels,
  TicketPriorityLabels,
} from "../../constants/enums";
import { toast } from "react-toastify";
import { AdminLayout } from "../../components/layouts/AdminLayout";

interface UserData {
  uuid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface TicketData {
  uuid: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_to?: string | null;
  user?: UserData;
  assigned_to_user?: UserData | null;
  recharge?: {
    uuid: string;
    reference: string;
    operator: string;
    package?: string | null;
    status: string;
  } | null;
}

interface Filters {
  status: string;
  priority: string;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierto" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "RESOLVED", label: "Resuelto" },
  { value: "CLOSED", label: "Cerrado" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export const AdminTicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
  });

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await adminSupportService.getAllTickets({
        ...filters,
        search: searchTerm,
      });

      setTickets(response.data || []);
    } catch (error) {
      console.error("Error al cargar tickets:", error);
      toast.error("Error al cargar los tickets");
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user?.role !== "admin") {
      toast.error("No tienes permisos de administrador");
      navigate("/dashboard");
      return;
    }

    loadTickets();
  }, [loadTickets, navigate]);

  const handleFilterChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadMessages = async (ticketUuid: string) => {
    setLoadingMessages(true);

    try {
      const response = await supportService.getMessages(ticketUuid);
      setMessages((response as any).data ?? (response as any) ?? []);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      toast.error("No pudimos cargar el historial del ticket");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleViewTicket = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setMessages([]);
    setShowModal(true);
    loadMessages(ticket.uuid);
  };

  const handleUpdateStatus = async (
    uuid: string,
    newStatus: string
  ) => {
    try {
      await adminSupportService.updateTicketStatus(uuid, newStatus);

      toast.success("Estado actualizado exitosamente");

      await loadTickets();

      if (selectedTicket?.uuid === uuid) {
        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleAssignTicket = async (uuid: string) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      await adminSupportService.assignTicket(uuid, user.uuid);

      toast.success("Ticket asignado exitosamente");

      await loadTickets();
    } catch (error) {
      console.error("Error al asignar ticket:", error);
      toast.error("Error al asignar el ticket");
    }
  };

  const handleReply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!replyMessage.trim()) {
      toast.error("Escribe un mensaje");
      return;
    }

    if (!selectedTicket) return;

    try {
      await adminSupportService.replyToTicket(
        selectedTicket.uuid,
        replyMessage
      );

      toast.success("Respuesta enviada");

      setReplyMessage("");

      await loadMessages(selectedTicket.uuid);
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      toast.error("Error al enviar la respuesta");
    }
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<
      string,
      {
        badge: string;
        icon: React.ReactNode;
      }
    > = {
      OPEN: {
        badge:
          "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
        icon: <Inbox size={14} />,
      },
      IN_PROGRESS: {
        badge:
          "bg-blue-500/10 text-blue-300 ring-blue-500/20",
        icon: <Clock3 size={14} />,
      },
      RESOLVED: {
        badge:
          "bg-violet-500/10 text-violet-300 ring-violet-500/20",
        icon: <CheckCircle2 size={14} />,
      },
      CLOSED: {
        badge:
          "bg-white/5 text-slate-400 ring-white/10",
        icon: <CheckCircle2 size={14} />,
      },
    };

    return (
      styles[status] || {
        badge:
          "bg-white/5 text-slate-400 ring-white/10",
        icon: <Ticket size={14} />,
      }
    );
  };

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: "bg-white/5 text-slate-400 ring-white/10",
      MEDIUM:
        "bg-amber-500/10 text-amber-300 ring-amber-500/20",
      HIGH:
        "bg-orange-500/10 text-orange-300 ring-orange-500/20",
      URGENT:
        "bg-red-500/10 text-red-300 ring-red-500/20",
    };

    return (
      styles[priority] ||
      "bg-white/5 text-slate-400 ring-white/10"
    );
  };

  const getInitials = (ticket: TicketData) => {
    const first = ticket.user?.first_name?.[0] || "";
    const last = ticket.user?.last_name?.[0] || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const progressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const urgentTickets = tickets.filter(
    (ticket) => ticket.priority === "URGENT"
  ).length;

  return (
    <AdminLayout>
      <main className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <MessageSquare size={27} />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Gestión de Tickets
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Administra y responde las solicitudes de soporte.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadTickets}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-white/[0.08] hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={isLoading ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total de tickets",
              value: totalTickets,
              icon: Ticket,
              iconClass:
                "bg-blue-500/10 text-blue-400",
            },
            {
              label: "Tickets abiertos",
              value: openTickets,
              icon: Inbox,
              iconClass:
                "bg-emerald-500/10 text-emerald-400",
            },
            {
              label: "En progreso",
              value: progressTickets,
              icon: Clock3,
              iconClass:
                "bg-violet-500/10 text-violet-400",
            },
            {
              label: "Prioridad urgente",
              value: urgentTickets,
              icon: AlertTriangle,
              iconClass:
                "bg-red-500/10 text-red-400",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.055]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-400" />

            <h2 className="font-bold text-white">
              Filtros y búsqueda
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px]">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Buscar por asunto, usuario o email..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/50 focus:bg-blue-500/[0.04] focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* STATUS */}
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-slate-950 px-4 pr-10 text-sm font-semibold text-slate-300 outline-none transition hover:border-white/20 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">
                  Todos los estados
                </option>

                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            {/* PRIORITY */}
            <div className="relative">
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-slate-950 px-4 pr-10 text-sm font-semibold text-slate-300 outline-none transition hover:border-white/20 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">
                  Todas las prioridades
                </option>

                {PRIORITY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
        >
          {isLoading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Loader2
                  size={28}
                  className="animate-spin text-blue-400"
                />
              </div>

              <p className="font-bold text-white">
                Cargando tickets...
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Estamos obteniendo las solicitudes de soporte.
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
                <Inbox size={30} />
              </div>

              <h3 className="text-lg font-bold text-white">
                No hay tickets
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                No encontramos tickets que coincidan con los
                filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Usuario
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Ticket
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Categoría
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Prioridad
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Asignado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {tickets.map((ticket, index) => {
                    const statusStyles =
                      getStatusStyles(ticket.status);

                    return (
                      <motion.tr
                        key={ticket.uuid}
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.025,
                        }}
                        className="group transition hover:bg-white/[0.03]"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-black text-white shadow-sm">
                              {getInitials(ticket)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">
                                {ticket.user?.first_name}{" "}
                                {ticket.user?.last_name}
                              </p>

                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                <Mail size={11} />

                                <span className="max-w-[170px] truncate">
                                  {ticket.user?.email}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* SUBJECT */}
                        <td className="max-w-[250px] px-5 py-4">
                          <p className="truncate text-sm font-bold text-white">
                            {ticket.subject}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-slate-600">
                            #{ticket.uuid.slice(0, 8)}
                          </p>

                          {ticket.recharge && (
                            <p className="mt-1 inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                              Recarga {ticket.recharge.reference}
                            </p>
                          )}
                        </td>

                        {/* CATEGORY */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300">
                            <Tag size={12} />
                            {ticket.category}
                          </span>
                        </td>

                        {/* PRIORITY */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-black ring-1 ring-inset ${getPriorityStyles(
                              ticket.priority
                            )}`}
                          >
                            {
                              TicketPriorityLabels[
                                ticket.priority
                              ]
                            }
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black ring-1 ring-inset ${statusStyles.badge}`}
                          >
                            {statusStyles.icon}

                            {
                              TicketStatusLabels[
                                ticket.status
                              ]
                            }
                          </span>
                        </td>

                        {/* ASSIGNED */}
                        <td className="px-5 py-4">
                          {ticket.assigned_to_user ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                <User size={15} />
                              </div>

                              <span className="max-w-[130px] truncate text-xs font-bold text-slate-300">
                                {
                                  ticket
                                    .assigned_to_user
                                    .first_name
                                }{" "}
                                {
                                  ticket
                                    .assigned_to_user
                                    .last_name
                                }
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-600">
                              Sin asignar
                            </span>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarDays size={14} />

                            {new Date(
                              ticket.created_at
                            ).toLocaleDateString()}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleViewTicket(ticket)
                              }
                              title="Ver ticket"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                            >
                              <Eye size={16} />
                            </button>

                            {!ticket.assigned_to && (
                              <button
                                onClick={() =>
                                  handleAssignTicket(
                                    ticket.uuid
                                  )
                                }
                                title="Asignarme ticket"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                              >
                                <UserPlus size={16} />
                              </button>
                            )}

                            <div className="relative">
                              <select
                                value={ticket.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    ticket.uuid,
                                    e.target.value
                                  )
                                }
                                title="Cambiar estado"
                                className="h-9 appearance-none rounded-lg border border-white/10 bg-slate-950 pl-3 pr-8 text-xs font-bold text-slate-300 outline-none transition hover:border-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/10"
                              >
                                {STATUS_OPTIONS.map(
                                  (option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  )
                                )}
                              </select>

                              <ChevronDown
                                size={13}
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE CARDS */}
          {tickets.length > 0 && (
            <div className="space-y-3 p-3 2xl:hidden">
              {tickets.map((ticket) => {
                const statusStyles = getStatusStyles(ticket.status);

                return (
                  <article
                    key={ticket.uuid}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-black text-white shadow-sm">
                          {getInitials(ticket)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {ticket.user?.first_name} {ticket.user?.last_name}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                            <Mail size={11} className="shrink-0" />
                            {ticket.user?.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black ring-1 ring-inset ${statusStyles.badge}`}
                      >
                        {statusStyles.icon}
                        {TicketStatusLabels[ticket.status]}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.025] p-3">
                      <p className="truncate text-sm font-bold text-white">{ticket.subject}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-600">
                        #{ticket.uuid.slice(0, 8)}
                      </p>

                      {ticket.recharge && (
                        <p className="mt-1.5 inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                          Recarga {ticket.recharge.reference}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Categoría
                        </p>
                        <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <Tag size={12} />
                          {ticket.category}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Prioridad
                        </p>
                        <span
                          className={`mt-1.5 inline-flex rounded-lg px-2 py-0.5 text-[10px] font-black ring-1 ring-inset ${getPriorityStyles(
                            ticket.priority
                          )}`}
                        >
                          {TicketPriorityLabels[ticket.priority]}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Asignado
                        </p>
                        {ticket.assigned_to_user ? (
                          <p className="mt-1.5 truncate text-xs font-bold text-slate-300">
                            {ticket.assigned_to_user.first_name} {ticket.assigned_to_user.last_name}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs font-semibold text-slate-600">Sin asignar</p>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Fecha
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <CalendarDays size={13} />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <Eye size={15} />
                        Ver ticket
                      </button>

                      {!ticket.assigned_to && (
                        <button
                          onClick={() => handleAssignTicket(ticket.uuid)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-400"
                        >
                          <UserPlus size={15} />
                          Asignarme
                        </button>
                      )}

                      <div className="relative col-span-1 sm:col-span-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.uuid, e.target.value)}
                          className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-slate-950 pl-3 pr-9 text-xs font-bold text-slate-300 outline-none transition hover:border-white/20 focus:border-blue-400/50"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              Cambiar a: {option.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 px-6 py-6 text-white sm:px-8">
                <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 ring-1 ring-white/10">
                      <Ticket size={13} />
                      Ticket de soporte
                    </div>

                    <h2 className="text-xl font-black leading-tight sm:text-2xl">
                      {selectedTicket.subject}
                    </h2>

                    <p className="mt-2 font-mono text-xs text-slate-400">
                      ID: {selectedTicket.uuid}
                    </p>

                    {selectedTicket.recharge && (
                      <button
                        onClick={() => navigate('/admin/recharges')}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 ring-1 ring-white/10 transition hover:bg-white/20"
                      >
                        Recarga vinculada: {selectedTicket.recharge.reference}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(92vh-150px)] overflow-y-auto">
                <div className="space-y-6 p-5 sm:p-8">
                  {/* USER CARD */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 font-black text-white">
                        {getInitials(selectedTicket)}
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          {
                            selectedTicket.user
                              ?.first_name
                          }{" "}
                          {
                            selectedTicket.user
                              ?.last_name
                          }
                        </p>

                        <p className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Mail size={13} />

                          {
                            selectedTicket.user?.email
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                      <Ticket size={16} />
                      Información del ticket
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Categoría
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {selectedTicket.category}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Prioridad
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-black ring-1 ring-inset ${getPriorityStyles(
                            selectedTicket.priority
                          )}`}
                        >
                          {
                            TicketPriorityLabels[
                              selectedTicket.priority
                            ]
                          }
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Estado
                        </p>

                        <span
                          className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black ring-1 ring-inset ${
                            getStatusStyles(
                              selectedTicket.status
                            ).badge
                          }`}
                        >
                          {
                            getStatusStyles(
                              selectedTicket.status
                            ).icon
                          }

                          {
                            TicketStatusLabels[
                              selectedTicket.status
                            ]
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                      Descripción
                    </h3>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* CONVERSATION */}
                  <div>
                    <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                      Conversación
                    </h3>

                    {loadingMessages ? (
                      <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Cargando historial...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
                        Todavía no hay mensajes en este ticket.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isAdminMsg =
                            msg.type === "ADMIN_RESPONSE" ||
                            msg.user?.role === "admin";

                          return (
                            <div
                              key={msg.uuid}
                              className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl border px-4 py-3 ${
                                  isAdminMsg
                                    ? "border-emerald-400/20 bg-emerald-500/[0.08]"
                                    : "border-white/10 bg-white/[0.04]"
                                }`}
                              >
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <User size={11} />
                                  {isAdminMsg
                                    ? "Soporte"
                                    : `${msg.user?.first_name || "Usuario"} ${msg.user?.last_name || ""}`.trim()}
                                </div>

                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                  {msg.message}
                                </p>

                                {(msg.created_at || msg.createdAt) && (
                                  <p className="mt-1.5 text-[10px] text-slate-600">
                                    {new Date(
                                      msg.created_at || msg.createdAt || ""
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* REPLY */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquare
                        size={18}
                        className="text-blue-400"
                      />

                      <h3 className="text-lg font-black text-white">
                        Responder al usuario
                      </h3>
                    </div>

                    <form
                      onSubmit={handleReply}
                      className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4 sm:p-5"
                    >
                      <textarea
                        value={replyMessage}
                        onChange={(e) =>
                          setReplyMessage(e.target.value)
                        }
                        placeholder="Escribe una respuesta clara y profesional..."
                        rows={5}
                        required
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
                      />

                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                          <Send size={17} />
                          Enviar respuesta
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};
