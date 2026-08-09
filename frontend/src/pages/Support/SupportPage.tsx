import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportService } from '../../services';
import {
  TicketStatusLabels,
  TicketPriorityLabels,
} from '../../constants/enums';
import { toast } from 'react-toastify';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Inbox,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Ticket,
  X,
  AlertCircle,
  Zap,
} from 'lucide-react';

export const SupportPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await supportService.getTickets();
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      toast.error('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await supportService.createTicket(formData);

      toast.success('Ticket creado exitosamente');

      setShowCreateForm(false);

      setFormData({
        subject: '',
        description: '',
        category: 'general',
        priority: 'MEDIUM',
      });

      loadTickets();
    } catch (error) {
      console.error('Error al crear ticket:', error);
      toast.error('Error al crear el ticket');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string;
        className: string;
        icon: React.ReactNode;
      }
    > = {
      OPEN: {
        label: TicketStatusLabels.OPEN,
        className:
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
        icon: <Inbox size={13} />,
      },

      IN_PROGRESS: {
        label: TicketStatusLabels.IN_PROGRESS,
        className:
          'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
        icon: <Clock3 size={13} />,
      },

      RESOLVED: {
        label: TicketStatusLabels.RESOLVED,
        className:
          'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
        icon: <CheckCircle2 size={13} />,
      },

      CLOSED: {
        label: TicketStatusLabels.CLOSED,
        className:
          'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
        icon: <ShieldCheck size={13} />,
      },
    };

    return (
      configs[status] || {
        label: status,
        className:
          'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
        icon: <AlertCircle size={13} />,
      }
    );
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<
      string,
      {
        label: string;
        className: string;
      }
    > = {
      LOW: {
        label: TicketPriorityLabels.LOW,
        className:
          'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
      },

      MEDIUM: {
        label: TicketPriorityLabels.MEDIUM,
        className:
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
      },

      HIGH: {
        label: TicketPriorityLabels.HIGH,
        className:
          'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200',
      },

      URGENT: {
        label: TicketPriorityLabels.URGENT,
        className:
          'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
      },
    };

    return (
      configs[priority] || {
        label: priority,
        className:
          'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
      }
    );
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      general: 'General',
      tecnico: 'Técnico',
      recarga: 'Recarga',
      pago: 'Pago',
      cuenta: 'Cuenta',
    };

    return categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                <Headphones className="text-white" size={23} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                    Centro de ayuda
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Soporte Técnico
                </h1>

                <p className="mt-1 max-w-xl text-sm text-slate-400">
                  Estamos aquí para ayudarte con cualquier problema o consulta.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                <ArrowLeft size={17} />
                Volver
              </button>

              {!showCreateForm && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-indigo-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-violet-600/20
                    transition
                    hover:-translate-y-0.5
                    hover:from-violet-500
                    hover:to-indigo-500
                    hover:shadow-violet-500/30
                    active:translate-y-0
                  "
                >
                  <Plus size={18} />
                  Nuevo Ticket
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Quick info */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <MessageCircle size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Soporte personalizado
                </p>
                <p className="text-sm font-bold text-white">
                  Atención directa
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Respuesta rápida
                </p>
                <p className="text-sm font-bold text-white">
                  Revisamos tu solicitud
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Atención segura
                </p>
                <p className="text-sm font-bold text-white">
                  Tus datos están protegidos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create ticket */}
        {showCreateForm && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/20 backdrop-blur-xl">
            {/* Form header */}
            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <Ticket size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Crear nuevo ticket
                    </h2>
                    <p className="text-sm text-slate-400">
                      Cuéntanos qué está ocurriendo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="Cerrar formulario"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5">
                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Asunto
                  </label>

                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ej: No se procesó mi recarga"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-950/60
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-slate-600
                      transition
                      focus:border-violet-500/60
                      focus:bg-slate-950
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-slate-200"
                    >
                      Descripción
                    </label>

                    <span className="text-xs text-slate-600">
                      Sé lo más específico posible
                    </span>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe detalladamente el problema, incluyendo cualquier mensaje de error o información relevante..."
                    rows={6}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-950/60
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-white
                      outline-none
                      placeholder:text-slate-600
                      transition
                      focus:border-violet-500/60
                      focus:bg-slate-950
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                    required
                  />
                </div>

                {/* Selects */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      Categoría
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        px-4
                        py-3
                        text-sm
                        text-white
                        outline-none
                        transition
                        focus:border-violet-500/60
                        focus:ring-4
                        focus:ring-violet-500/10
                      "
                    >
                      <option value="general">General</option>
                      <option value="tecnico">Técnico</option>
                      <option value="recarga">Recarga</option>
                      <option value="pago">Pago</option>
                      <option value="cuenta">Cuenta</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="priority"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      Prioridad
                    </label>

                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        px-4
                        py-3
                        text-sm
                        text-white
                        outline-none
                        transition
                        focus:border-violet-500/60
                        focus:ring-4
                        focus:ring-violet-500/10
                      "
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-5
                    text-sm
                    font-semibold
                    text-slate-300
                    transition
                    hover:bg-white/[0.08]
                    hover:text-white
                  "
                >
                  <X size={17} />
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-indigo-600
                    px-6
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-violet-600/20
                    transition
                    hover:-translate-y-0.5
                    hover:from-violet-500
                    hover:to-indigo-500
                  "
                >
                  <Send size={17} />
                  Crear Ticket
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Tickets */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-400">
                Historial
              </p>

              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Mis Tickets
              </h2>

              {!isLoading && tickets.length > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  {tickets.length}{' '}
                  {tickets.length === 1
                    ? 'solicitud registrada'
                    : 'solicitudes registradas'}
                </p>
              )}
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-5 w-48 rounded bg-white/10" />
                      <div className="h-3 w-24 rounded bg-white/5" />
                    </div>

                    <div className="h-7 w-24 rounded-full bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-white/5" />
                    <div className="h-3 w-3/4 rounded bg-white/5" />
                  </div>

                  <div className="mt-5 h-4 w-32 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <FileText size={28} />
              </div>

              <h3 className="text-lg font-bold text-white">
                No tienes tickets todavía
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Si necesitas ayuda con una recarga, pago, cuenta o cualquier
                otro inconveniente, puedes crear una solicitud.
              </p>

              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="
                  mt-6
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-indigo-600
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-violet-600/20
                  transition
                  hover:-translate-y-0.5
                "
              >
                <Plus size={18} />
                Crear primer ticket
              </button>
            </div>
          ) : (
            /* Ticket list */
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => {
                const status = getStatusConfig(ticket.status);
                const priority = getPriorityConfig(ticket.priority);

                return (
                  <article
                    key={ticket.uuid}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      shadow-xl
                      shadow-black/10
                      backdrop-blur-xl
                      transition
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-white/15
                      hover:bg-white/[0.06]
                    "
                  >
                    <div className="p-5 sm:p-6">
                      {/* Ticket header */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                              <Ticket size={12} />
                              {getCategoryLabel(ticket.category)}
                            </span>

                            <span className="text-xs text-slate-700">
                              #{ticket.uuid?.slice(0, 8)}
                            </span>
                          </div>

                          <h3 className="break-words text-base font-bold text-white sm:text-lg">
                            {ticket.subject}
                          </h3>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              ${priority.className}
                            `}
                          >
                            {priority.label}
                          </span>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              ${status.className}
                            `}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-5 rounded-xl border border-white/5 bg-black/10 p-4">
                        <p className="line-clamp-3 text-sm leading-6 text-slate-400">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 flex flex-col gap-4 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={14} />

                          <span>
                            Creado:{' '}
                            {new Date(ticket.created_at).toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/support/${ticket.uuid}`)
                          }
                          className="
                            group/button
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            px-4
                            text-sm
                            font-semibold
                            text-slate-300
                            transition
                            hover:border-violet-500/30
                            hover:bg-violet-500/10
                            hover:text-violet-300
                          "
                        >
                          Ver detalles
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover/button:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};