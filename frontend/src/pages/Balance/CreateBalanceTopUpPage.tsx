import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  FileText,
  ImagePlus,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
} from "lucide-react";

import { toast } from "react-toastify";

import { balanceTopUpService } from "../../services";
import { ResellerLayout } from "../../components/layouts/ResellerLayout";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const CreateBalanceTopUpPage = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isReseller = currentUser?.role === "reseller";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida");
      return;
    }

    setProofImage(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Ingresá un monto válido");
      return;
    }

    if (!proofImage) {
      toast.error("Adjuntá el comprobante de la transferencia");
      return;
    }

    setIsSubmitting(true);

    try {
      await balanceTopUpService.create({
        amount: parsedAmount,
        note: note || undefined,
        proof_image: proofImage,
      });

      toast.success("Solicitud enviada, queda pendiente de revisión");

      navigate("/balance-topups");
    } catch (error: any) {
      console.error("Error al solicitar carga de saldo:", error);

      toast.error(
        error?.response?.data?.message || "Error al enviar la solicitud"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {!isReseller && (
            <button
              type="button"
              onClick={() => navigate("/balance-topups")}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
              <span>Mis solicitudes</span>
            </button>
          )}

          <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">
            <LockKeyhole size={14} />
            Revisión manual por un admin
          </div>
        </div>

        <motion.div variants={pageVariants} initial="initial" animate="animate" className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <Sparkles size={14} />
            CARGAR SALDO
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Cargá saldo a tu{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              cuenta
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
            Transferí por fuera de la plataforma (USDT, banco, etc.), subí el comprobante y un admin lo va a revisar y acreditar a tu balance.
          </p>
        </motion.div>

        <motion.form
          variants={pageVariants}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <SectionTitle
              icon={<CircleDollarSign size={20} />}
              title="Monto transferido"
              description="En USD, el mismo que vas a poder usar para comprar recargas"
            />

            <div className="mt-5">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/25 transition-colors group-focus-within:text-violet-400">
                  $
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="200.00"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition-all focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <SectionTitle
              icon={<FileText size={20} />}
              title="Referencia (opcional)"
              description="Banco, wallet, TXID — lo que ayude a identificar tu transferencia"
            />

            <div className="mt-5">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Transferencia USDT TRC20, TXID 0xabc..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition-all focus:border-violet-400/50 focus:bg-violet-500/[0.04] focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <SectionTitle
              icon={<Upload size={20} />}
              title="Comprobante de la transferencia"
              description="Sube una captura clara del comprobante"
            />

            <label
              htmlFor="proof_image"
              className={`group relative mt-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
                proofImage
                  ? "border-emerald-400/40 bg-emerald-400/[0.05]"
                  : "border-white/10 bg-black/10 hover:border-violet-400/40 hover:bg-violet-500/[0.04]"
              }`}
            >
              <input
                type="file"
                id="proof_image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {proofImage ? (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                    <Check size={28} />
                  </div>

                  <p className="max-w-full truncate px-4 text-sm font-bold text-white">
                    {proofImage.name}
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

                  <p className="font-bold text-white">Sube tu comprobante</p>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-white/35">
                    Haz clic para seleccionar una imagen desde tu dispositivo
                  </p>

                  <span className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/50">
                    PNG, JPG o WEBP
                  </span>
                </>
              )}
            </label>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              <>
                <Wallet size={18} />
                Enviar solicitud
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-white/25">
            <ShieldCheck size={13} />
            Un admin va a verificar la transferencia antes de acreditar el saldo
          </div>
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
