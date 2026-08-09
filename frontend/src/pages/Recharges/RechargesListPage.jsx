import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  ExternalLink,
  FileImage,
  Gamepad2,
  Gem,
  History,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Wallet,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { rechargeService } from "../../services";

import {
  RechargeStatusLabels,
  GameOperatorLabels,
  RechargeTypeLabels,
  GameOperator,
  DiamondPackages,
  PBCardPackage,
} from "../../constants/enums";

import { toast } from "react-toastify";

export const RechargesListPage = () => {
  const navigate = useNavigate();

  const [recharges, setRecharges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    operator: GameOperator.FREE_FIRE,
  });

  const loadRecharges = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await rechargeService.getAll({
        user_id: user.uuid,
        ...filters,
      });

      setRecharges(response.data || []);
    } catch (error) {
      console.error("Error al cargar recargas:", error);
      toast.error("Error al cargar las recargas");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRecharges();
  }, [loadRecharges]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Función para verificar si se puede cancelar (PENDING y < 10 min)
  const canCancel = (recharge) => {
    if (recharge.status !== "PENDING") return false;

    const createdAt = new Date(recharge.created_at);
    const now = new Date();

    const diffMinutes =
      (now.getTime() - createdAt.getTime()) / (1000 * 60);

    return diffMinutes <= 10;
  };

  // Función para obtener minutos restantes
  const getMinutesLeft = (recharge) => {
    const createdAt = new Date(recharge.created_at);
    const now = new Date();

    const diffMinutes =
      (now.getTime() - createdAt.getTime()) / (1000 * 60);

    return Math.max(0, Math.ceil(10 - diffMinutes));
  };

  const handleCancel = async (uuid) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas cancelar esta recarga?"
      )
    ) {
      return;
    }

    setCancelingId(uuid);

    try {
      await rechargeService.cancel(uuid);

      toast.success("Recarga cancelada exitosamente");

      loadRecharges();
    } catch (error) {
      console.error("Error al cancelar:", error);

      toast.error(
        error.response?.data?.message ||
          "Error al cancelar la recarga"
      );
    } finally {
      setCancelingId(null);
    }
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

    return icons[status] || <AlertCircle size={13} />;
  };

  const getPackageName = (recharge) => {
    if (
      recharge.type === "DIAMONDS" &&
      recharge.package
    ) {
      return (
        DiamondPackages[recharge.package]?.label ||
        "Paquete desconocido"
      );
    } else if (recharge.type === "PB_CARD") {
      return PBCardPackage.label;
    }

    return null;
  };

  const getEmptyMessage = () => {
    if (filters.status) {
      const statusLabel = {
        PENDING: "pendientes",
        COMPLETED: "completadas",
        FAILED: "fallidas",
        CANCELLED: "canceladas",
      }[filters.status];

      return `No tienes recargas ${statusLabel}`;
    }

    return "No tienes recargas aún";
  };

  const copyReference = async (reference) => {
    try {
      await navigator.clipboard.writeText(reference);

      toast.success("Referencia copiada");
    } catch (error) {
      console.error("Error al copiar referencia:", error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                <History size={14} />
                HISTORIAL DE RECARGAS
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Mis{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Recargas
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
                Consulta el estado de tus recargas y revisa
                tus operaciones recientes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/recharges/create")}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-600
                  via-fuchsia-500
                  to-cyan-500
                  px-5
                  py-3.5
                  text-sm
                  font-black
                  text-white
                  shadow-xl
                  shadow-violet-500/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-2xl
                  hover:shadow-violet-500/30
                "
              >
                <Plus
                  size={18}
                  className="transition-transform group-hover:rotate-90"
                />

                Nueva Recarga

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="
                  inline-flex
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
          </div>
        </motion.header>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Search size={19} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Filtrar recargas
                </p>

                <p className="text-xs text-white/30">
                  Consulta rápidamente por estado
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-[250px]">
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
                  focus:border-violet-400/50
                  focus:ring-4
                  focus:ring-violet-500/10
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

                <p className="font-bold text-white">
                  Cargando tus recargas...
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Estamos buscando tus operaciones
                </p>
              </div>
            </motion.div>
          ) : recharges.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="
                flex
                min-h-[430px]
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
                <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-400">
                  <Receipt size={34} />
                </div>
              </div>

              <h2 className="text-xl font-black sm:text-2xl">
                {getEmptyMessage()}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
                {filters.status
                  ? "Prueba con otro filtro para consultar tus operaciones."
                  : "Todavía no has realizado ninguna recarga. ¡Empieza ahora y consigue tus recursos!"}
              </p>

              {!filters.status && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/recharges/create")
                  }
                  className="
                    group
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-gradient-to-r
                    from-violet-600
                    to-cyan-500
                    px-5
                    py-3.5
                    text-sm
                    font-black
                    shadow-xl
                    shadow-violet-500/20
                    transition
                    hover:-translate-y-0.5
                  "
                >
                  <Sparkles size={17} />

                  Crear primera recarga

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* List header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-bold text-white/80">
                    Tus operaciones
                  </p>

                  <p className="text-xs text-white/30">
                    {recharges.length}{" "}
                    {recharges.length === 1
                      ? "recarga encontrada"
                      : "recargas encontradas"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadRecharges()}
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

              {/* Recharge cards */}
              <div className="grid gap-4">
                {recharges.map((recharge, index) => {
                  const packageName =
                    getPackageName(recharge);

                  const isPending =
                    recharge.status === "PENDING";

                  const canBeCancelled =
                    canCancel(recharge);

                  return (
                    <motion.article
                      key={recharge.uuid}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.35,
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
                      {/* Card glow */}
                      <div
                        className={`
                          pointer-events-none
                          absolute
                          -right-24
                          -top-24
                          h-52
                          w-52
                          rounded-full
                          blur-[80px]
                          transition-opacity
                          ${
                            recharge.status ===
                            "COMPLETED"
                              ? "bg-emerald-500/10"
                              : recharge.status ===
                                  "PENDING"
                                ? "bg-amber-500/10"
                                : recharge.status ===
                                    "FAILED"
                                  ? "bg-red-500/10"
                                  : "bg-violet-500/5"
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
                              ${
                                recharge.type ===
                                "DIAMONDS"
                                  ? "bg-violet-500/10 text-violet-400"
                                  : "bg-cyan-500/10 text-cyan-400"
                              }
                            `}
                          >
                            {recharge.type ===
                            "DIAMONDS" ? (
                              <Gem size={23} />
                            ) : (
                              <Wallet size={23} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-base font-black sm:text-lg">
                                {
                                  GameOperatorLabels[
                                    recharge.operator
                                  ]
                                }
                              </h2>

                              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                                {
                                  RechargeTypeLabels[
                                    recharge.type
                                  ]
                                }
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs text-white/30">
                              {packageName}
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
                              recharge.status
                            )}
                          `}
                        >
                          {getStatusIcon(
                            recharge.status
                          )}

                          {
                            RechargeStatusLabels[
                              recharge.status
                            ]
                          }
                        </div>
                      </div>

                      {/* Details */}
                      <div className="relative p-5 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <DetailItem
                            icon={<Gamepad2 size={16} />}
                            label="ID Jugador"
                            value={
                              recharge.phone_number
                            }
                            highlight
                          />

                          <DetailItem
                            icon={<Gem size={16} />}
                            label="Paquete"
                            value={
                              packageName || "—"
                            }
                          />

                          <DetailItem
                            icon={<Wallet size={16} />}
                            label="Monto"
                            value={`$${parseFloat(
                              recharge.amount
                            ).toFixed(2)}`}
                            highlight
                          />

                          <DetailItem
                            icon={<Receipt size={16} />}
                            label="Referencia"
                            value={
                              recharge.reference
                            }
                            action={
                              recharge.reference ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyReference(
                                      recharge.reference
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

                          <DetailItem
                            icon={
                              <CalendarDays size={16} />
                            }
                            label="Fecha"
                            value={new Date(
                              recharge.created_at
                            ).toLocaleString()}
                          />

                          <DetailItem
                            icon={<ShieldCheck size={16} />}
                            label="Estado"
                            value={
                              RechargeStatusLabels[
                                recharge.status
                              ]
                            }
                          />
                        </div>

                        {/* Actions */}
                        {(recharge.proof_image_path ||
                          canBeCancelled) && (
                          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            {recharge.proof_image_path ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const url =
                                      await rechargeService.getProofImageUrl(
                                        recharge.uuid
                                      );

                                    window.open(
                                      url,
                                      "_blank"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error al cargar comprobante:",
                                      error
                                    );

                                    toast.error(
                                      "Error al cargar el comprobante"
                                    );
                                  }
                                }}
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
                                <FileImage
                                  size={16}
                                />

                                Ver comprobante

                                <ExternalLink
                                  size={13}
                                  className="transition-transform group-hover:translate-x-0.5"
                                />
                              </button>
                            ) : (
                              <div />
                            )}

                            {canBeCancelled && (
                              <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300/60">
                                  <Timer size={13} />
                                  Puedes cancelar durante los
                                  próximos{" "}
                                  {getMinutesLeft(
                                    recharge
                                  )}{" "}
                                  min
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancel(
                                      recharge.uuid
                                    )
                                  }
                                  disabled={
                                    cancelingId ===
                                    recharge.uuid
                                  }
                                  className="
                                    inline-flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-red-400/15
                                    bg-red-500/[0.05]
                                    px-4
                                    py-3
                                    text-xs
                                    font-bold
                                    text-red-300
                                    transition
                                    hover:border-red-400/30
                                    hover:bg-red-500/[0.10]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                    sm:w-auto
                                  "
                                >
                                  {cancelingId ===
                                  recharge.uuid ? (
                                    <>
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                      Cancelando...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle
                                        size={15}
                                      />
                                      Cancelar recarga
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pending notice */}
                        {isPending &&
                          !canBeCancelled && (
                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
                              <Clock3
                                size={17}
                                className="mt-0.5 shrink-0 text-amber-300/70"
                              />

                              <div>
                                <p className="text-xs font-bold text-amber-200/80">
                                  Recarga en proceso
                                </p>

                                <p className="mt-1 text-xs leading-5 text-white/30">
                                  Tu recarga está siendo
                                  verificada. Te avisaremos
                                  cuando el proceso finalice.
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer security */}
        {!isLoading && recharges.length > 0 && (
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
              <Receipt size={13} />
              Historial disponible
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Gamepad2 size={13} />
              Free Fire
            </span>
          </motion.div>
        )}
      </div>
    </main>
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
              highlight
                ? "font-bold text-white/90"
                : "font-medium text-white/50"
            }
          `}
          title={value}
        >
          {value}
        </p>
      </div>

      {action}
    </div>
  );
};