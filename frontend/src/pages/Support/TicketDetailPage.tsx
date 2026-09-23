import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
  Ticket as TicketIcon,
  User as UserIcon,
} from 'lucide-react';

import { supportService } from '../../services';
import { ResellerLayout } from '../../components/layouts/ResellerLayout';
import {
  TicketStatusLabels,
  TicketPriorityLabels,
} from '../../constants/enums';
import type { Ticket, TicketMessage } from '../../services/types';

const statusClass = (status?: string) => {
  const classes: Record<string, string> = {
    OPEN: 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20',
    CLOSED: 'bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10',
  };

  return classes[status || ''] || 'bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10';
};

export const TicketDetailPage = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isReseller = currentUser?.role === 'reseller';

  const loadTicket = async () => {
    if (!uuid) return;

    try {
      const [ticketRes, messagesRes] = await Promise.all([
        supportService.getTicketById(uuid),
        supportService.getMessages(uuid),
      ]);

      setTicket((ticketRes as any).data ?? (ticketRes as any));
      setMessages((messagesRes as any).data ?? (messagesRes as any) ?? []);
    } catch (error: any) {
      console.error('Error al cargar el ticket:', error);

      toast.error(
        error?.response?.data?.message || 'No pudimos cargar este ticket'
      );

      navigate('/support');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!replyText.trim() || !uuid) return;

    setIsSending(true);

    try {
      await supportService.sendMessage(uuid, { message: replyText.trim() });

      setReplyText('');

      await loadTicket();
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);

      toast.error(
        error?.response?.data?.message || 'No pudimos enviar tu mensaje'
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  const content = (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={17} />
            Mis tickets
          </button>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
              ticket.status
            )}`}
          >
            {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
              <CheckCircle2 size={13} />
            ) : (
              <Clock3 size={13} />
            )}
            {(TicketStatusLabels as any)[ticket.status || ''] || ticket.status}
          </span>
        </div>

        {/* Ticket info */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <TicketIcon size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-white sm:text-xl">
                {ticket.subject}
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                #{ticket.uuid?.slice(0, 8)} · {ticket.category || 'General'}
                {ticket.priority
                  ? ` · Prioridad ${(TicketPriorityLabels as any)[ticket.priority] || ticket.priority}`
                  : ''}
              </p>
            </div>
          </div>

          {ticket.recharge && (
            <button
              type="button"
              onClick={() => navigate('/recharges')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.07] px-3 py-2 text-xs font-semibold text-violet-300 transition hover:border-violet-400/40 hover:bg-violet-500/[0.12]"
            >
              <TicketIcon size={13} />
              Recarga vinculada: {ticket.recharge.reference}
            </button>
          )}

          {ticket.description && (
            <div className="mt-4 rounded-2xl border border-white/5 bg-black/10 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {ticket.description}
              </p>
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="mb-4 flex-1 space-y-4">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Todavía no hay mensajes en este ticket.
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.user?.uuid === currentUser?.uuid;
              const isAdminMsg = msg.type === 'ADMIN_RESPONSE' || msg.user?.role === 'admin';

              return (
                <div
                  key={msg.uuid}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl border px-4 py-3 ${
                      isMine
                        ? 'border-violet-400/20 bg-violet-500/10'
                        : isAdminMsg
                          ? 'border-emerald-400/20 bg-emerald-500/[0.06]'
                          : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {isAdminMsg ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
                      {isMine ? 'Vos' : isAdminMsg ? 'Soporte' : msg.user?.first_name || 'Usuario'}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                      {msg.message}
                    </p>

                    {(msg.created_at || msg.createdAt) && (
                      <p className="mt-1.5 text-[10px] text-slate-600">
                        {new Date(msg.created_at || msg.createdAt || '').toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        {isClosed ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-slate-500">
            Este ticket está {ticket.status === 'CLOSED' ? 'cerrado' : 'resuelto'}. Si necesitás más ayuda, creá un ticket nuevo.
          </div>
        ) : (
          <form onSubmit={handleReply} className="flex items-end gap-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribí tu mensaje..."
              rows={2}
              required
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/10"
            />

            <button
              type="submit"
              disabled={isSending || !replyText.trim()}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </form>
        )}
      </div>
    </>
  );

  if (isReseller) {
    return <ResellerLayout>{content}</ResellerLayout>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {content}
    </div>
  );
};
