import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileImage,
  Gamepad2,
  Gem,
  Hash,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Phone,
  Receipt,
  ShieldCheck,
  Sparkles,
  Upload,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

import { toast } from "react-toastify";

import { rechargeService } from "../../services";

import {
  GameOperator,
  RechargeType,
  GameOperatorLabels,
  RechargeTypeLabels,
  DiamondPackages,
  PBCardPackage,
} from "../../constants/enums";

type RechargeFormData = {
  operator: GameOperator;
  type: RechargeType;
  package: string | null;
  phone_number: string;
  amount: string;
};

type ProofFormData = {
  currency: string;
  payment_method: string;
  proof_image: File | null;
  transaction_id: string;
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.25,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.35,
    },
  }),
};

export const CreateRechargePage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<RechargeFormData>({
    operator: GameOperator.FREE_FIRE,
    type: RechargeType.DIAMONDS,
    package: null,
    phone_number: "",
    amount: "",
  });

  const [proofData, setProofData] = useState<ProofFormData>({
    currency: "USDT",
    payment_method: "",
    proof_image: null,
    transaction_id: "",
  });

  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.5).toFixed(2);
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const fee = parseFloat(calculateFee());

    return (amount + fee).toFixed(2);
  };

  const selectedDiamondPackage =
    formData.type === RechargeType.DIAMONDS && formData.package
      ? DiamondPackages[formData.package]
      : null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      if (value === RechargeType.PB_CARD) {
        setFormData((prev) => ({
          ...prev,
          type: value as RechargeType,
          package: "PB_CARD",
          amount: PBCardPackage.priceWithFee.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          type: value as RechargeType,
          package: null,
          amount: "",
        }));
      }

      return;
    }

    if (
      name === "package" &&
      formData.type === RechargeType.DIAMONDS
    ) {
      const selectedPackage = DiamondPackages[value];

      if (!selectedPackage) return;

      const priceWithFee = (selectedPackage.price * 1.5).toFixed(2);

      setFormData((prev) => ({
        ...prev,
        package: value,
        amount: priceWithFee,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectRechargeType = (type: RechargeType) => {
    if (type === RechargeType.PB_CARD) {
      setFormData((prev) => ({
        ...prev,
        type,
        package: "PB_CARD",
        amount: PBCardPackage.priceWithFee.toString(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        type,
        package: null,
        amount: "",
      }));
    }
  };

  const selectDiamondPackage = (key: string) => {
    const selectedPackage = DiamondPackages[key];

    if (!selectedPackage) return;

    const priceWithFee = (selectedPackage.price * 1.5).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      package: key,
      amount: priceWithFee,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.phone_number || !formData.amount) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (!formData.package) {
      toast.error("Selecciona un paquete");
      return;
    }

    setStep(2);
  };

  const handleProofChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProofData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida");
      return;
    }

    setProofData((prev) => ({
      ...prev,
      proof_image: file,
    }));
  };

  const handleProofSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !proofData.currency ||
      !proofData.payment_method ||
      !proofData.proof_image ||
      !proofData.transaction_id
    ) {
      toast.error("Por favor completa todos los campos del comprobante");
      return;
    }

    setIsLoading(true);

    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const formDataToSend = new FormData();

      formDataToSend.append("user_id", user.uuid);
      formDataToSend.append("operator", formData.operator);
      formDataToSend.append("type", formData.type);
      formDataToSend.append(
        "phone_number",
        formData.phone_number
      );
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append(
        "package",
        formData.package || ""
      );
      formDataToSend.append("currency", proofData.currency);
      formDataToSend.append(
        "payment_method",
        proofData.payment_method
      );
      formDataToSend.append(
        "transaction_id",
        proofData.transaction_id
      );
      formDataToSend.append(
        "proof_image",
        proofData.proof_image
      );

      await rechargeService.createWithFile(formDataToSend);

      toast.success("¡Recarga enviada para verificación!");

      setTimeout(() => {
        navigate("/recharges");
      }, 1200);
    } catch (error: any) {
      console.error("Error al crear recarga:", error);

      toast.error(
        error?.response?.data?.message ||
          "Error al crear la recarga"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      {/* Background effects */}
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

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-xl
              border border-white/10
              bg-white/[0.04]
              px-4
              py-2.5
              text-sm
              font-medium
              text-white/70
              backdrop-blur-xl
              transition
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
            "
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            <span>
              {step === 2 ? "Volver al pedido" : "Dashboard"}
            </span>
          </button>

          <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">
            <LockKeyhole size={14} />
            Compra segura
          </div>
        </div>

        {/* Main heading */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <Sparkles size={14} />
            {step === 1
              ? "NUEVA RECARGA"
              : "VERIFICACIÓN DE PAGO"}
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {step === 1 ? (
              <>
                Recarga tu{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  juego favorito
                </span>
              </>
            ) : (
              <>
                Confirma tu{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  pago
                </span>
              </>
            )}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            {step === 1
              ? "Selecciona tu paquete, introduce tu ID de jugador y continúa con el pago."
              : "Completa los datos de tu pago para que podamos verificar y procesar tu recarga."}
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            <ProgressStep
              number={1}
              label="Recarga"
              active={step === 1}
              completed={step > 1}
            />

            <div
              className={`mx-3 h-px flex-1 transition-all duration-500 sm:mx-5 ${
                step > 1
                  ? "bg-gradient-to-r from-violet-500 to-cyan-400"
                  : "bg-white/10"
              }`}
            />

            <ProgressStep
              number={2}
              label="Pago"
              active={step === 2}
              completed={false}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step-one"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
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
                          {GameOperatorLabels[
                            GameOperator.FREE_FIRE
                          ]}
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
                        <Gamepad2
                          size={24}
                          className="text-white"
                        />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          Free Fire
                        </p>
                        <p className="text-xs text-white/40">
                          Recargas instantáneas y seguras
                        </p>
                      </div>

                      <BadgeCheck
                        className="ml-auto text-cyan-400"
                        size={21}
                      />
                    </div>
                  </div>
                </section>

                {/* Recharge type */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                  <SectionTitle
                    icon={<Zap size={20} />}
                    title="¿Qué quieres comprar?"
                    description="Elige el tipo de recarga"
                  />

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <RechargeTypeCard
                      title="Diamantes"
                      description="Obtén diamantes para Free Fire"
                      icon={<Gem size={25} />}
                      selected={
                        formData.type === RechargeType.DIAMONDS
                      }
                      gradient="from-violet-500/20 to-fuchsia-500/5"
                      iconClass="text-violet-400"
                      onClick={() =>
                        selectRechargeType(
                          RechargeType.DIAMONDS
                        )
                      }
                    />

                    <RechargeTypeCard
                      title="Tarjeta PB"
                      description="Compra una tarjeta PB"
                      icon={<CreditCard size={25} />}
                      selected={
                        formData.type === RechargeType.PB_CARD
                      }
                      gradient="from-cyan-500/20 to-blue-500/5"
                      iconClass="text-cyan-400"
                      onClick={() =>
                        selectRechargeType(
                          RechargeType.PB_CARD
                        )
                      }
                    />
                  </div>
                </section>

                {/* Diamonds packages */}
                {formData.type === RechargeType.DIAMONDS && (
                  <motion.section
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6"
                  >
                    <SectionTitle
                      icon={<Gem size={20} />}
                      title="Selecciona tu paquete"
                      description="Elige la cantidad de diamantes que deseas"
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(DiamondPackages).map(
                        ([key, pkg], index) => {
                          const priceWithFee = (
                            pkg.price * 1.5
                          ).toFixed(2);

                          const selected =
                            formData.package === key;

                          return (
                            <motion.button
                              key={key}
                              custom={index}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              type="button"
                              onClick={() =>
                                selectDiamondPackage(key)
                              }
                              className={`
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                p-4
                                text-left
                                transition-all
                                duration-300
                                ${
                                  selected
                                    ? "border-violet-400/60 bg-violet-500/[0.12] shadow-lg shadow-violet-500/10"
                                    : "border-white/10 bg-black/10 hover:border-violet-400/30 hover:bg-white/[0.05]"
                                }
                              `}
                            >
                              {selected && (
                                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500">
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                  />
                                </div>
                              )}

                              <div
                                className={`
                                  mb-4
                                  flex
                                  h-11
                                  w-11
                                  items-center
                                  justify-center
                                  rounded-xl
                                  transition-transform
                                  group-hover:scale-110
                                  ${
                                    selected
                                      ? "bg-violet-500/20 text-violet-300"
                                      : "bg-white/[0.06] text-white/50"
                                  }
                                `}
                              >
                                <Gem size={21} />
                              </div>

                              <p className="text-lg font-black">
                                {pkg.total}
                              </p>

                              <p className="mt-1 text-xs text-white/40">
                                Diamantes
                              </p>

                              <div className="mt-4 flex items-end justify-between gap-2">
                                <div>
                                  <span className="text-xs text-white/30">
                                    Precio
                                  </span>

                                  <p className="mt-0.5 text-lg font-bold text-white">
                                    ${priceWithFee}
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
                        }
                      )}
                    </div>
                  </motion.section>
                )}

                {/* PB Card */}
                {formData.type === RechargeType.PB_CARD && (
                  <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.12] via-white/[0.035] to-blue-500/[0.05] p-6"
                  >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/20">
                        <CreditCard
                          size={29}
                          className="text-white"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                          Tarjeta seleccionada
                        </p>

                        <h3 className="mt-1 text-xl font-black">
                          {PBCardPackage.label}
                        </h3>

                        <p className="mt-1 text-sm text-white/40">
                          Recarga mediante tarjeta PB
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-white/35">
                          Total
                        </p>

                        <p className="text-2xl font-black text-cyan-300">
                          ${PBCardPackage.priceWithFee}
                        </p>
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* Player ID */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                  <SectionTitle
                    icon={<Hash size={20} />}
                    title="Datos del jugador"
                    description="Introduce el identificador donde recibirás la recarga"
                  />

                  <div className="mt-5">
                    <label
                      htmlFor="phone_number"
                      className="mb-2.5 block text-sm font-semibold text-white/80"
                    >
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
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Ej: 123456789"
                        pattern="^[a-zA-Z0-9+\-\s]{5,}$"
                        title="ID debe tener mínimo 5 caracteres"
                        required
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/20
                          py-4
                          pl-12
                          pr-4
                          text-sm
                          text-white
                          outline-none
                          placeholder:text-white/20
                          transition-all
                          focus:border-violet-400/50
                          focus:bg-violet-500/[0.04]
                          focus:ring-4
                          focus:ring-violet-500/10
                        "
                      />
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/30">
                      <ShieldCheck
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-400/70"
                      />
                      <span>
                        Verifica que tu ID sea correcto. La
                        recarga se enviará exactamente al
                        identificador indicado.
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Summary */}
              <aside className="lg:sticky lg:top-6 lg:h-fit">
                <RechargeSummary
                  type={formData.type}
                  packageData={selectedDiamondPackage}
                  amount={formData.amount}
                  fee={calculateFee()}
                  total={calculateTotal()}
                  phoneNumber={formData.phone_number}
                  disabled={
                    !formData.package ||
                    !formData.phone_number
                  }
                  isLoading={isLoading}
                  onSubmit={() => {}}
                />

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/25">
                  <LockKeyhole size={13} />
                  Tus datos están protegidos
                </div>
              </aside>
            </motion.form>
          ) : (
            <motion.form
              key="step-two"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleProofSubmit}
              className="grid gap-6 lg:grid-cols-[1fr_350px]"
            >
              <div className="space-y-6">
                {/* Order summary */}
                <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] via-white/[0.035] to-cyan-500/[0.05] p-5 shadow-2xl shadow-violet-950/20 sm:p-6">
                  <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <Receipt size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                        Resumen de compra
                      </p>

                      <h2 className="mt-1 truncate text-lg font-bold">
                        {GameOperatorLabels[
                          GameOperator.FREE_FIRE
                        ]}
                      </h2>

                      <p className="mt-1 text-sm text-white/40">
                        {RechargeTypeLabels[formData.type]}
                        {selectedDiamondPackage
                          ? ` · ${selectedDiamondPackage.total} Diamantes`
                          : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/30">
                        Total
                      </p>
                      <p className="text-xl font-black text-white">
                        ${formData.amount}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                  <SectionTitle
                    icon={<WalletCards size={20} />}
                    title="Información del pago"
                    description="Indica cómo realizaste el pago"
                  />

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="currency"
                        className="mb-2.5 block text-sm font-semibold text-white/80"
                      >
                        Moneda de pago
                      </label>

                      <div className="relative">
                        <CircleDollarSign
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                        />

                        <select
                          id="currency"
                          name="currency"
                          value={proofData.currency}
                          onChange={handleProofChange}
                          required
                          className="
                            w-full
                            appearance-none
                            rounded-2xl
                            border
                            border-white/10
                            bg-[#0d0d15]
                            py-4
                            pl-12
                            pr-4
                            text-sm
                            text-white
                            outline-none
                            transition
                            focus:border-violet-400/50
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                        >
                          <option value="USDT">USDT</option>
                          <option value="PAYPAL">PayPal</option>
                          <option value="TRANSFERENCIA">
                            Transferencia Bancaria
                          </option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="payment_method"
                        className="mb-2.5 block text-sm font-semibold text-white/80"
                      >
                        Método de pago
                      </label>

                      <input
                        type="text"
                        id="payment_method"
                        name="payment_method"
                        value={proofData.payment_method}
                        onChange={handleProofChange}
                        placeholder="Ej: Binance, PayPal..."
                        required
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/20
                          px-4
                          py-4
                          text-sm
                          text-white
                          outline-none
                          placeholder:text-white/20
                          transition
                          focus:border-violet-400/50
                          focus:ring-4
                          focus:ring-violet-500/10
                        "
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="transaction_id"
                        className="mb-2.5 block text-sm font-semibold text-white/80"
                      >
                        ID de transacción
                      </label>

                      <div className="relative">
                        <Hash
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                        />

                        <input
                          type="text"
                          id="transaction_id"
                          name="transaction_id"
                          value={proofData.transaction_id}
                          onChange={handleProofChange}
                          placeholder="Ej: 0x123abc456def..."
                          required
                          className="
                            w-full
                            rounded-2xl
                            border
                            border-white/10
                            bg-black/20
                            py-4
                            pl-12
                            pr-4
                            text-sm
                            text-white
                            outline-none
                            placeholder:text-white/20
                            transition
                            focus:border-violet-400/50
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Upload */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                  <SectionTitle
                    icon={<FileImage size={20} />}
                    title="Comprobante de pago"
                    description="Sube una captura clara de tu comprobante"
                  />

                  <label
                    htmlFor="proof_image"
                    className={`
                      group
                      relative
                      mt-6
                      flex
                      min-h-[220px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-3xl
                      border-2
                      border-dashed
                      p-6
                      text-center
                      transition-all
                      ${
                        proofData.proof_image
                          ? "border-emerald-400/40 bg-emerald-400/[0.05]"
                          : "border-white/10 bg-black/10 hover:border-violet-400/40 hover:bg-violet-500/[0.04]"
                      }
                    `}
                  >
                    <input
                      type="file"
                      id="proof_image"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!proofData.proof_image}
                      className="hidden"
                    />

                    {proofData.proof_image ? (
                      <>
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                          <Check size={28} />
                        </div>

                        <p className="max-w-full truncate px-4 text-sm font-bold text-white">
                          {proofData.proof_image.name}
                        </p>

                        <p className="mt-1 text-xs text-emerald-400/70">
                          Comprobante seleccionado correctamente
                        </p>

                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50">
                          <ImagePlus size={14} />
                          Cambiar imagen
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 transition-transform group-hover:scale-110">
                          <Upload size={27} />
                        </div>

                        <p className="font-bold text-white">
                          Sube tu comprobante
                        </p>

                        <p className="mt-2 max-w-sm text-xs leading-5 text-white/35">
                          Haz clic para seleccionar una imagen
                          desde tu dispositivo
                        </p>

                        <span className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/50">
                          PNG, JPG o WEBP
                        </span>
                      </>
                    )}
                  </label>
                </section>
              </div>

              {/* Payment sidebar */}
              <aside className="lg:sticky lg:top-6 lg:h-fit">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="border-b border-white/10 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        <Receipt size={19} />
                      </div>

                      <div>
                        <p className="text-xs text-white/35">
                          Resumen
                        </p>
                        <p className="font-bold">
                          Tu recarga
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <SummaryRow
                      label="Juego"
                      value="Free Fire"
                    />

                    <SummaryRow
                      label="Tipo"
                      value={RechargeTypeLabels[formData.type]}
                    />

                    <SummaryRow
                      label="ID jugador"
                      value={formData.phone_number || "—"}
                    />

                    <div className="my-4 h-px bg-white/10" />

                    <div className="flex items-end justify-between gap-4">
                      <span className="text-sm text-white/40">
                        Total a pagar
                      </span>

                      <span className="text-3xl font-black bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                        ${formData.amount}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="
                        group
                        relative
                        mt-3
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        overflow-hidden
                        rounded-2xl
                        bg-gradient-to-r
                        from-violet-600
                        via-fuchsia-500
                        to-cyan-500
                        px-5
                        py-4
                        text-sm
                        font-black
                        text-white
                        shadow-xl
                        shadow-violet-500/20
                        transition-all
                        hover:-translate-y-0.5
                        hover:shadow-2xl
                        hover:shadow-violet-500/30
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar recarga
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-white/25">
                      <ShieldCheck size={13} />
                      Verificaremos tu comprobante antes de procesar
                    </div>
                  </div>
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

interface ProgressStepProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

const ProgressStep = ({
  number,
  label,
  active,
  completed,
}: ProgressStepProps) => {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <div
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          text-xs
          font-black
          transition-all
          duration-300
          ${
            completed
              ? "border-cyan-400 bg-cyan-400 text-black"
              : active
                ? "border-violet-400 bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                : "border-white/10 bg-white/[0.04] text-white/30"
          }
        `}
      >
        {completed ? <Check size={15} /> : number}
      </div>

      <span
        className={`hidden text-sm font-semibold sm:block ${
          active || completed
            ? "text-white"
            : "text-white/30"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SectionTitle = ({
  icon,
  title,
  description,
}: SectionTitleProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-white/35">
          {description}
        </p>
      </div>
    </div>
  );
};

interface RechargeTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  gradient: string;
  iconClass: string;
  onClick: () => void;
}

const RechargeTypeCard = ({
  title,
  description,
  icon,
  selected,
  gradient,
  iconClass,
  onClick,
}: RechargeTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        text-left
        transition-all
        duration-300
        ${
          selected
            ? "border-violet-400/50 bg-violet-500/[0.10] shadow-lg shadow-violet-500/10"
            : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/[0.04]"
        }
      `}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white/[0.05]
            ${iconClass}
            transition-transform
            group-hover:scale-110
          `}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-white/35">
            {description}
          </p>
        </div>

        <div
          className={`
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            transition-all
            ${
              selected
                ? "border-violet-400 bg-violet-500 text-white"
                : "border-white/15 text-transparent"
            }
          `}
        >
          <Check size={13} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
};

interface RechargeSummaryProps {
  type: RechargeType;
  packageData: any;
  amount: string;
  fee: string;
  total: string;
  phoneNumber: string;
  disabled: boolean;
  isLoading: boolean;
  onSubmit: () => void;
}

const RechargeSummary = ({
  type,
  packageData,
  amount,
  fee,
  total,
  phoneNumber,
  disabled,
  isLoading,
}: RechargeSummaryProps) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-white/10 p-5">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300">
            <Receipt size={20} />
          </div>

          <div>
            <p className="text-xs text-white/35">
              Resumen de compra
            </p>

            <h2 className="font-bold">
              Tu pedido
            </h2>
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
              <p className="text-sm font-bold">
                Free Fire
              </p>

              <p className="text-xs text-white/35">
                {RechargeTypeLabels[type]}
              </p>
            </div>
          </div>

          {packageData && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-violet-500/[0.06] p-3">
              <div className="flex items-center gap-2">
                <Gem
                  size={16}
                  className="text-violet-400"
                />

                <span className="text-sm text-white/60">
                  {packageData.total} diamantes
                </span>
              </div>

              <span className="text-sm font-bold text-white">
                ${amount}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <SummaryRow
            label="Precio"
            value={`$${amount || "0.00"}`}
          />

          <SummaryRow
            label="Comisión"
            value={`$${fee}`}
          />

          {phoneNumber && (
            <SummaryRow
              label="ID jugador"
              value={phoneNumber}
            />
          )}
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-white/35">
              Total a pagar
            </p>

            <p className="mt-1 text-3xl font-black tracking-tight">
              ${total}
            </p>
          </div>

          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck size={13} />
            Seguro
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="
            group
            relative
            flex
            w-full
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-2xl
            bg-gradient-to-r
            from-violet-600
            via-fuchsia-500
            to-cyan-500
            px-5
            py-4
            text-sm
            font-black
            text-white
            shadow-xl
            shadow-violet-500/20
            transition-all
            hover:-translate-y-0.5
            hover:shadow-2xl
            hover:shadow-violet-500/30
            disabled:cursor-not-allowed
            disabled:opacity-30
            disabled:shadow-none
          "
        >
          {isLoading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Procesando...
            </>
          ) : (
            <>
              Continuar al pago
              <ChevronRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] leading-4 text-white/25">
          <LockKeyhole size={13} />
          Pago protegido y verificación manual
        </div>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow = ({
  label,
  value,
}: SummaryRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-xs font-semibold text-white/70">
        {value}
      </span>
    </div>
  );
};