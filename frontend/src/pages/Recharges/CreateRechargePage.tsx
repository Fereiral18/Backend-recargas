import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Gamepad2,
  Gem,
  Hash,
  Loader2,
  LockKeyhole,
  Phone,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

import { toast } from "react-toastify";

import { rechargeService, paymentService } from "../../services";
import { ResellerLayout } from "../../components/layouts/ResellerLayout";
import type { RechargePackage } from "../../services/types";

import {
  GameOperator,
  RechargeType,
  GameOperatorLabels,
  RechargeTypeLabels,
} from "../../constants/enums";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.35 },
  }),
};

export const CreateRechargePage = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isReseller = currentUser?.role === "reseller";

  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState<RechargePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await rechargeService.getPackages(GameOperator.FREE_FIRE);
        setPackages(data.filter((pkg) => pkg.active));
      } catch (error) {
        console.error("Error al cargar el catálogo de paquetes:", error);
        toast.error("No pudimos cargar los paquetes disponibles");
      } finally {
        setIsLoadingPackages(false);
      }
    };

    loadPackages();
  }, []);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPackage) {
      toast.error("Selecciona un paquete");
      return;
    }

    if (!phoneNumber) {
      toast.error("Ingresá tu ID de jugador");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await rechargeService.create({
        operator: GameOperator.FREE_FIRE,
        type: selectedPackage.type,
        package: selectedPackage.package,
        phone_number: phoneNumber,
      });

      const rechargeUuid = created.uuid;

      if (isReseller) {
        // El revendedor ya pagó (se le debitó el balance al crear la
        // recarga) y la entrega con el proveedor se dispara sola, sin
        // Mercado Pago ni aprobación de un admin de por medio.
        toast.success("Recarga pagada con tu balance. Se está entregando automáticamente.");
        navigate("/recharges");
        return;
      }

      const preference = await paymentService.createMercadoPagoPreference(rechargeUuid);

      // Redirección completa del navegador: Mercado Pago (o el checkout
      // simulado si MP_MOCK_MODE está activo en el backend) toma el control
      // desde acá y nos devuelve a /recharges cuando termine.
      window.location.href = preference.data.init_point;
    } catch (error: any) {
      console.error("Error al crear la recarga:", error);

      toast.error(
        error?.response?.data?.message || "Error al iniciar la recarga"
      );

      setIsSubmitting(false);
    }
  };

  const goBack = () => navigate("/dashboard");

  const content = (
    <>
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {!isReseller && (
            <button
              type="button"
              onClick={goBack}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">
            <LockKeyhole size={14} />
            {isReseller ? "Se descuenta de tu balance al instante" : "Pago 100% automático con Mercado Pago"}
          </div>
        </div>

        {/* Main heading */}
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <Sparkles size={14} />
            NUEVA RECARGA
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Recarga tu{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              juego favorito
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            {isReseller ? (
              <>
                Seleccioná el paquete, el ID del jugador, y se descuenta directo de tu balance
                {currentUser?.balance !== undefined && (
                  <> (actual: <span className="font-bold text-white">${Number(currentUser.balance).toFixed(2)} USD</span>)</>
                )}
                .
              </>
            ) : (
              "Selecciona tu paquete, introducí tu ID de jugador y pagá con Mercado Pago. La recarga se entrega sola apenas se confirma el pago."
            )}
          </p>
        </motion.div>

        <motion.form
          variants={pageVariants}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_350px]"
        >
          <div className="space-y-6">
            {/* Game */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <Gamepad2 size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/35">
                      Juego seleccionado
                    </p>

                    <h2 className="mt-0.5 text-lg font-bold">
                      {GameOperatorLabels[GameOperator.FREE_FIRE]}
                    </h2>
                  </div>

                  <div className="ml-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      <Check size={12} />
                      Disponible
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 rounded-2xl border border-orange-400/15 bg-gradient-to-r from-orange-500/10 to-transparent p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
                    <Gamepad2 size={24} className="text-white" />
                  </div>

                  <div>
                    <p className="font-bold text-white">Free Fire</p>
                    <p className="text-xs text-white/40">Recargas instantáneas y seguras</p>
                  </div>

                  <BadgeCheck className="ml-auto text-cyan-400" size={21} />
                </div>
              </div>
            </section>

            {/* Packages */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <SectionTitle
                icon={<Zap size={20} />}
                title="Selecciona tu paquete"
                description="Precios actualizados, definidos por el equipo"
              />

              {isLoadingPackages ? (
                <div className="mt-6 flex items-center justify-center gap-3 py-10 text-white/40">
                  <Loader2 size={20} className="animate-spin" />
                  Cargando paquetes...
                </div>
              ) : packages.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm text-white/40">
                  Todavía no hay paquetes cargados para Free Fire. Volvé a intentarlo más tarde.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {packages.map((pkg, index) => {
                    const selected = selectedPackage?.uuid === pkg.uuid;

                    return (
                      <motion.button
                        key={pkg.uuid}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                          selected
                            ? "border-violet-400/60 bg-violet-500/[0.12] shadow-lg shadow-violet-500/10"
                            : "border-white/10 bg-black/10 hover:border-violet-400/30 hover:bg-white/[0.05]"
                        }`}
                      >
                        {selected && (
                          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}

                        <div
                          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                            selected ? "bg-violet-500/20 text-violet-300" : "bg-white/[0.06] text-white/50"
                          }`}
                        >
                          {pkg.type === RechargeType.PB_CARD ? <CreditCard size={21} /> : <Gem size={21} />}
                        </div>

                        <p className="text-lg font-black">{pkg.diamonds ?? pkg.name}</p>

                        <p className="mt-1 text-xs text-white/40">{pkg.name}</p>

                        <div className="mt-4 flex items-end justify-between gap-2">
                          <div>
                            <span className="text-xs text-white/30">Precio</span>
                            <p className="mt-0.5 text-lg font-bold text-white">
                              ${Number(isReseller ? pkg.reseller_price_usd : pkg.b2c_price_ars).toFixed(2)}
                              <span className="ml-1 text-xs font-normal text-white/30">
                                {isReseller ? "USD" : "ARS"}
                              </span>
                            </p>
                          </div>

                          {selected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Player ID */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <SectionTitle
                icon={<Hash size={20} />}
                title="Datos del jugador"
                description="Introduce el identificador donde recibirás la recarga"
              />

              <div className="mt-5">
                <label htmlFor="phone_number" className="mb-2.5 block text-sm font-semibold text-white/80">
                  Número telefónico / ID del jugador
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/25 transition-colors group-focus-within:text-violet-400">
                    <Phone size={19} />
                  </div>

                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Ej: 123456789"
                    pattern="^[a-zA-Z0-9+\-\s]{5,}$"
                    title="ID debe tener mínimo 5 caracteres"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition-all focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/30">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-400/70" />
                  <span>
                    Verificá que tu ID sea correcto. La recarga se enviará exactamente al identificador indicado.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <RechargeSummary
              selectedPackage={selectedPackage}
              phoneNumber={phoneNumber}
              disabled={!selectedPackage || !phoneNumber}
              isLoading={isSubmitting}
              isReseller={isReseller}
            />

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/25">
              <LockKeyhole size={13} />
              Tus datos están protegidos
            </div>
          </aside>
        </motion.form>
      </div>
    </>
  );

  if (isReseller) {
    return <ResellerLayout>{content}</ResellerLayout>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute right-[-180px] top-[15%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />
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

/* =========================================================
   COMPONENTS
========================================================= */

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SectionTitle = ({ icon, title, description }: SectionTitleProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-white/35">{description}</p>
      </div>
    </div>
  );
};

interface RechargeSummaryProps {
  selectedPackage: RechargePackage | null;
  phoneNumber: string;
  disabled: boolean;
  isLoading: boolean;
  isReseller: boolean;
}

const RechargeSummary = ({ selectedPackage, phoneNumber, disabled, isLoading, isReseller }: RechargeSummaryProps) => {
  const price = selectedPackage
    ? Number(isReseller ? selectedPackage.reseller_price_usd : selectedPackage.b2c_price_ars)
    : 0;
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-white/10 p-5">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300">
            <Receipt size={20} />
          </div>

          <div>
            <p className="text-xs text-white/35">Resumen de compra</p>
            <h2 className="font-bold">Tu pedido</h2>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Gamepad2 size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">Free Fire</p>
              <p className="text-xs text-white/35">
                {selectedPackage ? RechargeTypeLabels[selectedPackage.type] : "Elegí un paquete"}
              </p>
            </div>
          </div>

          {selectedPackage && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-violet-500/[0.06] p-3">
              <div className="flex items-center gap-2">
                <Gem size={16} className="text-violet-400" />
                <span className="text-sm text-white/60">{selectedPackage.name}</span>
              </div>

              <span className="text-sm font-bold text-white">
                ${price.toFixed(2)} {isReseller ? "USD" : "ARS"}
              </span>
            </div>
          )}
        </div>

        {phoneNumber && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white/35">ID jugador</span>
            <span className="max-w-[60%] truncate text-right text-xs font-semibold text-white/70">
              {phoneNumber}
            </span>
          </div>
        )}

        <div className="h-px bg-white/10" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-white/35">Total a {isReseller ? "descontar" : "pagar"}</p>
            <p className="mt-1 text-3xl font-black tracking-tight">
              ${price.toFixed(2)}
            </p>
          </div>

          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <Wallet size={13} />
            {isReseller ? "Mi balance" : "Mercado Pago"}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isReseller ? "Procesando..." : "Redirigiendo a Mercado Pago..."}
            </>
          ) : (
            <>
              {isReseller ? "Comprar con mi balance" : "Pagar con Mercado Pago"}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] leading-4 text-white/25">
          <ShieldCheck size={13} />
          {isReseller
            ? "Se descuenta al instante; la entrega la gestiona el equipo"
            : "Se entrega solo, apenas se confirma el pago"}
        </div>
      </div>
    </div>
  );
};
