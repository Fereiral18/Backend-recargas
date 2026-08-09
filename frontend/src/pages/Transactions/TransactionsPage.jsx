import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileImage,
  History,
  Loader2,
  RefreshCw,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  XCircle,
  AlertCircle,
  CircleDollarSign,
  ShoppingCart,
} from "lucide-react";

import { transactionService } from "../../services";

import {
  TransactionTypeLabels,
  TransactionStatusLabels,
} from "../../constants/enums";

import { toast } from "react-toastify";

export const TransactionsPage = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  const loadData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      // Cargar balance
      const balanceResponse =
        await transactionService.getBalance(user.uuid);

      setBalance(balanceResponse.data);

      // Cargar transacciones
      const transactionsResponse =
        await transactionService.getAll({
          user_id: user.uuid,
          ...filters,
        });

      setTransactions(transactionsResponse.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);

      toast.error(
        "Error al cargar las transacciones"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      PENDING:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",
      COMPLETED:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      FAILED:
        "border-red-400/20 bg-red-400/10 text-red-300",
      CANCELLED:
        "border-white/10 bg-white/[0.05] text-white/40",
    };

    return (
      classes[status] ||
      "border-white/10 bg-white/[0.05] text-white/40"
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Clock3 size={13} />,
      COMPLETED: <CheckCircle2 size={13} />,
      FAILED: <XCircle size={13} />,
      CANCELLED: <AlertCircle size={13} />,
    };

    return (
      icons[status] || <AlertCircle size={13} />
    );
  };

  const getTypeClass = (type) => {
    const classes = {
      DEPOSIT:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      WITHDRAWAL:
        "border-orange-400/20 bg-orange-400/10 text-orange-300",
      PURCHASE:
        "border-violet-400/20 bg-violet-400/10 text-violet-300",
      REFUND:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      FEE:
        "border-red-400/20 bg-red-400/10 text-red-300",
    };

    return (
      classes[type] ||
      "border-white/10 bg-white/[0.05] text-white/40"
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      DEPOSIT: <ArrowDownLeft size={18} />,
      WITHDRAWAL: <ArrowUpRight size={18} />,
      PURCHASE: <ShoppingCart size={18} />,
      REFUND: <RefreshCw size={18} />,
      FEE: <CircleDollarSign size={18} />,
    };

    return (
      icons[type] || <Receipt size={18} />
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("es-AR");
  };

  const copyReference = async (reference) => {
    try {
      await navigator.clipboard.writeText(reference);

      toast.success("Referencia copiada");
    } catch (error) {
      console.error(
        "Error al copiar referencia:",
        error
      );
    }
  };

  const copyTransactionId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);

      toast.success("ID de transacción copiado");
    } catch (error) {
      console.error(
        "Error al copiar ID:",
        error
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />

        <div className="absolute right-[-180px] top-[12%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute bottom-[-220px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                <History size={14} />
                HISTORIAL FINANCIERO
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Mis{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Transacciones
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                Consulta tus movimientos, depósitos,
                compras y operaciones realizadas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-4
                py-3.5
                text-sm
                font-semibold
                text-white/60
                backdrop-blur-xl
                transition
                hover:border-white/20
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:inline">
                Volver
              </span>
            </button>
          </div>
        </motion.header>

        {/* =====================================================
            BALANCE
        ====================================================== */}

        {balance && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            {/* Balance glow */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-violet-600/10 blur-[100px]" />

            <div className="relative border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Wallet size={21} />
                </div>

                <div>
                  <p className="text-sm font-black">
                    Resumen de cuenta
                  </p>

                  <p className="text-xs text-white/30">
                    Estado actual de tus fondos
                  </p>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {/* Balance total */}
              <BalanceItem
                icon={<Wallet size={18} />}
                label="Balance Total"
                value={`$${parseFloat(
                  balance.total_balance || 0
                ).toFixed(2)}`}
                primary
              />

              {/* Depósitos */}
              <BalanceItem
                icon={<ArrowDownLeft size={18} />}
                label="Total Depósitos"
                value={`+$${parseFloat(
                  balance.total_deposits || 0
                ).toFixed(2)}`}
                positive
              />

              {/* Retiros */}
              <BalanceItem
                icon={<ArrowUpRight size={18} />}
                label="Total Retiros"
                value={`-$${parseFloat(
                  balance.total_withdrawals || 0
                ).toFixed(2)}`}
                negative
              />

              {/* Compras */}
              <BalanceItem
                icon={<ShoppingCart size={18} />}
                label="Total Compras"
                value={`-$${parseFloat(
                  balance.total_purchases || 0
                ).toFixed(2)}`}
                negative
              />
            </div>
          </motion.section>
        )}

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.14,
          }}
          className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <History size={18} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Filtrar movimientos
              </p>

              <p className="text-xs text-white/30">
                Encuentra rápidamente una operación
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Type */}
            <div className="relative">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="
                  w-full
                  appearance-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0d0d15]
                  px-4
                  py-3.5
                  pr-10
                  text-sm
                  font-medium
                  text-white/80
                  outline-none
                  transition
                  focus:border-violet-400/50
                  focus:ring-4
                  focus:ring-violet-500/10
                "
              >
                <option value="">
                  Todos los tipos
                </option>

                <option value="DEPOSIT">
                  Depósito
                </option>

                <option value="WITHDRAWAL">
                  Retiro
                </option>

                <option value="PURCHASE">
                  Compra
                </option>

                <option value="REFUND">
                  Reembolso
                </option>

                <option value="FEE">
                  Comisión
                </option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="
                  w-full
                  appearance-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0d0d15]
                  px-4
                  py-3.5
                  pr-10
                  text-sm
                  font-medium
                  text-white/80
                  outline-none
                  transition
                  focus:border-cyan-400/50
                  focus:ring-4
                  focus:ring-cyan-500/10
                "
              >
                <option value="">
                  Todos los estados
                </option>

                <option value="PENDING">
                  Pendiente
                </option>

                <option value="COMPLETED">
                  Completada
                </option>

                <option value="FAILED">
                  Fallida
                </option>

                <option value="CANCELLED">
                  Cancelada
                </option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

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
                  <Loader2
                    size={28}
                    className="animate-spin"
                  />
                </div>

                <p className="font-bold">
                  Cargando transacciones...
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Estamos preparando tu historial
                </p>
              </div>
            </motion.div>
          ) : transactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                rounded-3xl
                border
                border-dashed
                border-white/10
                bg-white/[0.025]
                px-6
                text-center
              "
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                  <Receipt size={34} />
                </div>
              </div>

              <h2 className="text-xl font-black sm:text-2xl">
                No tienes transacciones aún
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
                Tus movimientos aparecerán aquí cuando
                realices una operación.
              </p>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="
                  group
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.05]
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-white/70
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.09]
                  hover:text-white
                "
              >
                Ir al dashboard

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* List header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-bold text-white/80">
                    Historial de movimientos
                  </p>

                  <p className="text-xs text-white/30">
                    {transactions.length}{" "}
                    {transactions.length === 1
                      ? "transacción"
                      : "transacciones"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData()}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-white/40
                    transition
                    hover:border-white/20
                    hover:text-white
                  "
                >
                  <RefreshCw
                    size={14}
                    className="transition-transform group-hover:rotate-180"
                  />

                  Actualizar
                </button>
              </div>

              {/* Transaction cards */}
              <div className="grid gap-4">
                {transactions.map(
                  (transaction, index) => {
                    const isPositive =
                      transaction.type === "DEPOSIT" ||
                      transaction.type === "REFUND";

                    return (
                      <motion.article
                        key={transaction.uuid}
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.05,
                        }}
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-3xl
                          border
                          border-white/10
                          bg-white/[0.035]
                          shadow-2xl
                          shadow-black/20
                          backdrop-blur-xl
                          transition-all
                          duration-300
                          hover:border-white/[0.16]
                          hover:bg-white/[0.045]
                        "
                      >
                        {/* Dynamic glow */}
                        <div
                          className={`
                            pointer-events-none
                            absolute
                            -right-24
                            -top-24
                            h-56
                            w-56
                            rounded-full
                            blur-[90px]
                            transition-opacity
                            ${
                              isPositive
                                ? "bg-emerald-500/10"
                                : transaction.type ===
                                    "PURCHASE"
                                  ? "bg-violet-500/10"
                                  : "bg-cyan-500/10"
                            }
                          `}
                        />

                        {/* Header */}
                        <div className="relative flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                          <div className="flex min-w-0 items-center gap-4">
                            <div
                              className={`
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                ${getTypeClass(
                                  transaction.type
                                )}
                              `}
                            >
                              {getTypeIcon(
                                transaction.type
                              )}
                            </div>

                            <div className="min-w-0">
                              <h2 className="truncate text-base font-black sm:text-lg">
                                {
                                  TransactionTypeLabels[
                                    transaction.type
                                  ]
                                }
                              </h2>

                              <p className="mt-1 text-xs text-white/30">
                                {formatDate(
                                  transaction.created_at
                                )}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`
                              inline-flex
                              w-fit
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              ${getStatusClass(
                                transaction.status
                              )}
                            `}
                          >
                            {getStatusIcon(
                              transaction.status
                            )}

                            {
                              TransactionStatusLabels[
                                transaction.status
                              ]
                            }
                          </div>
                        </div>

                        {/* Main amount */}
                        <div className="relative px-5 pt-5 sm:px-6 sm:pt-6">
                          <div className="rounded-2xl border border-white/[0.06] bg-black/[0.12] p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                  Monto de operación
                                </p>

                                <p
                                  className={`
                                    mt-2
                                    text-2xl
                                    font-black
                                    tracking-tight
                                    sm:text-3xl
                                    ${
                                      isPositive
                                        ? "text-emerald-300"
                                        : "text-white"
                                    }
                                  `}
                                >
                                  {isPositive
                                    ? "+"
                                    : "-"}
                                  $
                                  {parseFloat(
                                    transaction.amount
                                  ).toFixed(2)}
                                </p>
                              </div>

                              <div
                                className={`
                                  flex
                                  h-11
                                  w-11
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  ${
                                    isPositive
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-violet-500/10 text-violet-400"
                                  }
                                `}
                              >
                                <CircleDollarSign
                                  size={21}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="relative p-5 sm:p-6">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {transaction.currency && (
                              <DetailItem
                                icon={
                                  <CircleDollarSign
                                    size={16}
                                  />
                                }
                                label="Moneda"
                                value={
                                  transaction.currency
                                }
                              />
                            )}

                            {transaction.fee > 0 && (
                              <DetailItem
                                icon={
                                  <CircleDollarSign
                                    size={16}
                                  />
                                }
                                label="Comisión"
                                value={`-$${parseFloat(
                                  transaction.fee
                                ).toFixed(2)}`}
                                negative
                              />
                            )}

                            <DetailItem
                              icon={
                                <Wallet size={16} />
                              }
                              label="Neto"
                              value={`$${parseFloat(
                                transaction.net_amount
                              ).toFixed(2)}`}
                              highlight
                            />

                            <DetailItem
                              icon={
                                <Receipt size={16} />
                              }
                              label="Referencia"
                              value={
                                transaction.reference
                              }
                              action={
                                transaction.reference ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyReference(
                                        transaction.reference
                                      )
                                    }
                                    className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/[0.06] hover:text-violet-300"
                                    title="Copiar referencia"
                                  >
                                    <Copy size={14} />
                                  </button>
                                ) : null
                              }
                            />

                            {transaction.transaction_id && (
                              <DetailItem
                                icon={
                                  <Receipt size={16} />
                                }
                                label="ID Transacción"
                                value={
                                  transaction.transaction_id
                                }
                                action={
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyTransactionId(
                                        transaction.transaction_id
                                      )
                                    }
                                    className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/[0.06] hover:text-cyan-300"
                                    title="Copiar ID"
                                  >
                                    <Copy size={14} />
                                  </button>
                                }
                              />
                            )}

                            {transaction.payment_method && (
                              <DetailItem
                                icon={
                                  <CreditCard size={16} />
                                }
                                label="Método de pago"
                                value={
                                  transaction.payment_method
                                }
                              />
                            )}

                            <DetailItem
                              icon={
                                <CalendarDays size={16} />
                              }
                              label="Creado"
                              value={formatDate(
                                transaction.created_at
                              )}
                            />

                            {transaction.completed_at && (
                              <DetailItem
                                icon={
                                  <CheckCircle2
                                    size={16}
                                  />
                                }
                                label="Completado"
                                value={formatDate(
                                  transaction.completed_at
                                )}
                              />
                            )}
                          </div>

                          {/* Proof */}
                          {transaction.proof_image_path && (
                            <div className="mt-5 border-t border-white/10 pt-5">
                              <a
                                href={
                                  transaction.proof_image_path
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                  group
                                  inline-flex
                                  w-full
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-violet-400/20
                                  bg-violet-500/[0.07]
                                  px-4
                                  py-3
                                  text-xs
                                  font-bold
                                  text-violet-300
                                  transition
                                  hover:border-violet-400/40
                                  hover:bg-violet-500/[0.12]
                                  sm:w-auto
                                "
                              >
                                <FileImage size={16} />

                                Ver comprobante

                                <ExternalLink
                                  size={13}
                                  className="transition-transform group-hover:translate-x-0.5"
                                />
                              </a>
                            </div>
                          )}

                          {/* Metadata */}
                          {transaction.metadata && (
                            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/[0.12] p-4">
                              <div className="mb-2 flex items-center gap-2">
                                <Sparkles
                                  size={14}
                                  className="text-violet-400"
                                />

                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                                  Información adicional
                                </span>
                              </div>

                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-[10px] leading-5 text-white/30">
                                {JSON.stringify(
                                  transaction.metadata,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        {!isLoading &&
          transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/20"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Operaciones protegidas
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Wallet size={13} />
                Balance actualizado
              </span>

              <span className="inline-flex items-center gap-1.5">
                <History size={13} />
                Historial disponible
              </span>
            </motion.div>
          )}
      </div>
    </main>
  );
};

/* =========================================================
   BALANCE ITEM
========================================================= */

const BalanceItem = ({
  icon,
  label,
  value,
  primary = false,
  positive = false,
  negative = false,
}) => {
  return (
    <div className="group relative p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${
              primary
                ? "bg-violet-500/10 text-violet-400"
                : positive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : negative
                    ? "bg-red-500/10 text-red-400"
                    : "bg-white/[0.05] text-white/40"
            }
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-lg
              font-black
              ${
                primary
                  ? "text-white"
                  : positive
                    ? "text-emerald-300"
                    : negative
                      ? "text-red-300"
                      : "text-white/80"
              }
            `}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  icon,
  label,
  value,
  highlight = false,
  negative = false,
  action,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/[0.12] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/30">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
          {label}
        </p>

        <p
          className={`
            mt-1
            truncate
            text-xs
            ${
              negative
                ? "font-bold text-red-300"
                : highlight
                  ? "font-bold text-white/90"
                  : "font-medium text-white/50"
            }
          `}
          title={String(value)}
        >
          {value}
        </p>
      </div>

      {action}
    </div>
  );
}