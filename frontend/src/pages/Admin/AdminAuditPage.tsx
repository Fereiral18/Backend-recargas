import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  RefreshCw,
  TrendingUp,
  Gamepad2,
  Wallet,
  ArrowDownLeft,
  ShoppingCart,
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { AdminLayout } from "../../components/layouts/AdminLayout";
import {
  adminFinanceService,
  type RevenueStats,
  type SupplierBalance,
} from "../../services/admin.service";

const formatMoney = (value: number, currency: string) =>
  `$${Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

interface DateRange {
  from: string; // yyyy-mm-dd, vacío = sin límite inferior
  to: string; // yyyy-mm-dd, vacío = sin límite superior
}

// El backend compara created_at >= from AND created_at < to -- "to" se
// manda como el día siguiente para que la fecha elegida quede incluida
// entera, no cortada a las 00:00.
const rangeToApiParams = ({ from, to }: DateRange) => {
  const params: { from?: string; to?: string } = {};

  if (from) {
    params.from = new Date(`${from}T00:00:00`).toISOString();
  }

  if (to) {
    const exclusiveTo = new Date(`${to}T00:00:00`);
    exclusiveTo.setDate(exclusiveTo.getDate() + 1);
    params.to = exclusiveTo.toISOString();
  }

  return params;
};

const formatRangeLabel = ({ from, to }: DateRange) => {
  if (!from && !to) return "Todo el tiempo";

  const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("es-AR");

  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `Desde ${fmt(from)}`;
  return `Hasta ${fmt(to)}`;
};

export const AdminAuditPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [appliedRange, setAppliedRange] = useState<DateRange>({ from: "", to: "" });
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [supplierBalance, setSupplierBalance] = useState<SupplierBalance | null>(null);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  const loadData = async (selectedRange: DateRange = appliedRange) => {
    setIsLoading(true);

    try {
      const revenueStats = await adminFinanceService.getRevenueStats(
        rangeToApiParams(selectedRange)
      );
      setRevenue(revenueStats);
    } catch (error) {
      console.error("Error al cargar ingresos:", error);
      toast.error("No pudimos cargar los ingresos");
    }

    // El saldo con FZR Cards es un dato de "ahora mismo", no depende del
    // período elegido -- se pide siempre igual.
    try {
      const balance = await adminFinanceService.getSupplierBalance();
      setSupplierBalance(balance);
      setSupplierError(null);
    } catch (error: any) {
      console.error("Error al consultar el saldo con FZR Cards:", error);
      setSupplierBalance(null);
      setSupplierError(
        error?.response?.data?.message || "No pudimos consultar el saldo con el proveedor"
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyRange = () => {
    setAppliedRange(range);
    loadData(range);
  };

  const handleClearRange = () => {
    const cleared = { from: "", to: "" };
    setRange(cleared);
    setAppliedRange(cleared);
    loadData(cleared);
  };

  // El spinner de pantalla completa solo se muestra en la carga inicial --
  // al cambiar de período no queremos que el selector desaparezca junto con
  // el resto de la página.
  if (isLoading && !revenue) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500" />
            <p className="text-sm text-slate-500">Cargando auditoría...</p>
          </div>
        </div>
      </AdminLayout>
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
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/20">
                <TrendingUp size={28} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    Auditoría
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Ingresos y saldo con el proveedor
                </h1>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Datos en tiempo real: cuánto entra por clientes y revendedores, y cuánto tenemos disponible en FZR Cards.
                </p>
              </div>
            </div>

            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-white/[0.08] hover:text-blue-400 disabled:opacity-60"
            >
              <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </motion.header>

        {/* SALDO CON FZR CARDS */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Landmark size={18} />
            </div>

            <div>
              <h2 className="font-black text-white">Nuestro saldo con FZR Cards</h2>
              <p className="text-xs text-slate-600">
                Lo que tenemos cargado para pedir recargas al proveedor ahora mismo -- no es plata de ningún cliente ni revendedor, y no cambia con el período elegido.
              </p>
            </div>
          </div>

          {supplierError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5">
              <ShieldAlert size={22} className="shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200/80">{supplierError}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-600/10 via-blue-600/5 to-slate-900 p-6 shadow-xl shadow-cyan-950/10">
              <p className="text-xs font-medium text-slate-500">Saldo disponible</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-cyan-300">
                ${Number(supplierBalance?.balance || 0).toFixed(2)}{" "}
                <span className="text-lg font-bold text-cyan-500/60">
                  {supplierBalance?.currency || "USD"}
                </span>
              </p>
            </div>
          )}
        </section>

        {/* INGRESOS */}
        <section>
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <TrendingUp size={18} />
              </div>

              <div>
                <h2 className="font-black text-white">
                  Ingresos por tipo de venta{" "}
                  <span className="font-medium text-violet-400">· {formatRangeLabel(appliedRange)}</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Neto de reembolsos. ARS y USD se muestran por separado a propósito -- sumarlos daría un número sin sentido.
                </p>
              </div>
            </div>

            {/* Filtro de período */}
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Desde
                </label>
                <input
                  type="date"
                  value={range.from}
                  max={range.to || undefined}
                  onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-400/50"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Hasta
                </label>
                <input
                  type="date"
                  value={range.to}
                  min={range.from || undefined}
                  onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-400/50"
                />
              </div>

              <button
                onClick={handleApplyRange}
                disabled={isLoading || (!range.from && !range.to)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-500 px-4 text-xs font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Filtrar
              </button>

              {(appliedRange.from || appliedRange.to) && (
                <button
                  onClick={handleClearRange}
                  disabled={isLoading}
                  title="Ver todo el tiempo"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* B2C */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <p className="font-black text-white">Clientes finales</p>
                    <p className="text-xs text-slate-500">Pagado con Mercado Pago</p>
                  </div>
                </div>
              </div>

              <p className="text-3xl font-black tracking-tight text-white">
                {formatMoney(revenue?.b2c.net ?? 0, "ARS")}
              </p>
              <p className="mt-1 text-xs text-slate-600">Ingreso neto</p>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <ShoppingCart size={11} /> Bruto
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {formatMoney(revenue?.b2c.gross ?? 0, "ARS")}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <ArrowDownLeft size={11} /> Reembolsado
                  </p>
                  <p className="mt-1 text-sm font-bold text-red-300">
                    {formatMoney(revenue?.b2c.refunded ?? 0, "ARS")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Operaciones
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{revenue?.b2c.count ?? 0}</p>
                </div>
              </div>
            </div>

            {/* RESELLER */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Wallet size={22} />
                  </div>
                  <div>
                    <p className="font-black text-white">Revendedores</p>
                    <p className="text-xs text-slate-500">Pagado con balance prepago</p>
                  </div>
                </div>
              </div>

              <p className="text-3xl font-black tracking-tight text-white">
                {formatMoney(revenue?.reseller.net ?? 0, "USD")}
              </p>
              <p className="mt-1 text-xs text-slate-600">Ingreso neto</p>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <ShoppingCart size={11} /> Bruto
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {formatMoney(revenue?.reseller.gross ?? 0, "USD")}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <ArrowDownLeft size={11} /> Reembolsado
                  </p>
                  <p className="mt-1 text-sm font-bold text-red-300">
                    {formatMoney(revenue?.reseller.refunded ?? 0, "USD")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Operaciones
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{revenue?.reseller.count ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};
