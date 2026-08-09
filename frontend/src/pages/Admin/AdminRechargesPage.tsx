import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Search,
  RefreshCw,
  Smartphone,
  Mail,
  CalendarDays,
  CreditCard,
  Hash,
  Package,
  X,
  Check,
  Ban,
  ExternalLink,
  Image as ImageIcon,
  Clock3,
  CircleDollarSign,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

import { toast } from 'react-toastify';

import {
  adminRechargeService,
  type AdminRecharge,
  type RechargeStatus,
} from '../../services/admin.service';

import { rechargeService } from '../../services';

import {
  RechargeStatusLabels,
  GameOperatorLabels,
  RechargeTypeLabels,
} from '../../constants/enums';


export const AdminRechargesPage = () => {
  const navigate = useNavigate();

  const [recharges, setRecharges] = useState<AdminRecharge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedRecharge, setSelectedRecharge] =
    useState<AdminRecharge | null>(null);

  const [proofImageUrl, setProofImageUrl] =
    useState<string | null>(null);

  const [loadingProof, setLoadingProof] =
    useState<boolean>(false);

  const [searchTerm, setSearchTerm] =
    useState<string>('');

  const [filters, setFilters] = useState({
    status: 'PENDING',
    operator: '',
  });


  // ============================================
  // CARGAR RECARGAS
  // ============================================

  const loadRecharges = useCallback(async () => {
    try {
      setIsLoading(true);

      const response =
        await adminRechargeService.getAllRecharges({
          ...filters,
          search: searchTerm.trim() || undefined,
        });

      setRecharges(response.data ?? []);
    } catch (error: unknown) {
      console.error(
        'Error al cargar recargas:',
        error
      );

      toast.error('Error al cargar las recargas');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);


  // ============================================
  // AUTORIZACIÓN
  // ============================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      toast.error(
        'No tienes permisos de administrador'
      );

      navigate('/dashboard');
      return;
    }

    try {
      const user = JSON.parse(storedUser) as {
        role?: string;
      };

      if (user.role !== 'ADMIN') {
        toast.error(
          'No tienes permisos de administrador'
        );

        navigate('/dashboard');
        return;
      }

      loadRecharges();
    } catch {
      toast.error('Sesión inválida');
      navigate('/dashboard');
    }
  }, [loadRecharges, navigate]);


  // ============================================
  // FILTROS
  // ============================================

  const handleFilterChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const clearFilters = () => {
    setSearchTerm('');

    setFilters({
      status: '',
      operator: '',
    });
  };


  // ============================================
  // ACTUALIZAR ESTADO
  // ============================================

  const handleUpdateStatus = async (
    uuid: string,
    newStatus: RechargeStatus
  ) => {
    try {
      await adminRechargeService.updateRechargeStatus(
        uuid,
        newStatus
      );

      const statusText =
        newStatus === 'COMPLETED'
          ? 'aprobada'
          : newStatus === 'FAILED'
            ? 'rechazada'
            : 'actualizada';

      toast.success(
        `Recarga ${statusText} correctamente`
      );

      handleCloseModal();

      await loadRecharges();
    } catch (error: unknown) {
      console.error(
        'Error al actualizar estado:',
        error
      );

      toast.error(
        'Error al actualizar el estado'
      );
    }
  };


  // ============================================
  // VER DETALLES
  // ============================================

  const handleViewDetails = async (
    recharge: AdminRecharge
  ) => {
    setSelectedRecharge(recharge);
    setProofImageUrl(null);

    if (!recharge.proof_image_path) {
      return;
    }

    setLoadingProof(true);

    try {
      const url =
        await rechargeService.getProofImageUrl(
          recharge.uuid
        );

      setProofImageUrl(url);
    } catch (error: unknown) {
      console.error(
        'Error al cargar comprobante:',
        error
      );

      toast.error(
        'Error al cargar el comprobante'
      );
    } finally {
      setLoadingProof(false);
    }
  };


  // ============================================
  // CERRAR MODAL
  // ============================================

  const handleCloseModal = () => {
    setSelectedRecharge(null);

    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl);
    }

    setProofImageUrl(null);
    setLoadingProof(false);
  };


  // ============================================
  // HELPERS
  // ============================================

  const formatAmount = (
    amount: number | string
  ): string => {
    const numericAmount =
      typeof amount === 'string'
        ? Number.parseFloat(amount)
        : amount;

    return Number.isFinite(numericAmount)
      ? numericAmount.toFixed(2)
      : '0.00';
  };


  const formatDate = (
    date: string
  ): string => {
    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '-';
    }

    return parsedDate.toLocaleDateString(
      'es-AR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };


  const getStatusConfig = (
    status: RechargeStatus
  ) => {
    switch (status) {
      case 'PENDING':
        return {
          label:
            RechargeStatusLabels[status],
          className:
            'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
          dot:
            'bg-amber-400',
          icon:
            Clock3,
        };

      case 'COMPLETED':
        return {
          label:
            RechargeStatusLabels[status],
          className:
            'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
          dot:
            'bg-emerald-400',
          icon:
            Check,
        };

      case 'FAILED':
        return {
          label:
            RechargeStatusLabels[status],
          className:
            'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
          dot:
            'bg-red-400',
          icon:
            X,
        };

      case 'CANCELLED':
        return {
          label:
            RechargeStatusLabels[status],
          className:
            'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
          dot:
            'bg-slate-400',
          icon:
            Ban,
        };

      default:
        return {
          label: status,
          className:
            'bg-slate-500/10 text-slate-400',
          dot:
            'bg-slate-400',
          icon:
            Clock3,
        };
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Background */}
      <div className="
        pointer-events-none
        fixed
        inset-0
        overflow-hidden
      ">
        <div className="
          absolute
          -left-40
          -top-40
          h-96
          w-96
          rounded-full
          bg-violet-600/10
          blur-3xl
        " />

        <div className="
          absolute
          -bottom-40
          -right-40
          h-96
          w-96
          rounded-full
          bg-blue-600/10
          blur-3xl
        " />
      </div>


      <main className="
        relative
        mx-auto
        w-full
        max-w-[1600px]
        px-4
        py-6
        sm:px-6
        lg:px-8
      ">

        {/* ======================================
            HEADER
        ======================================= */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate('/admin')
            }
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-300
              transition
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
            "
          >
            <ArrowLeft size={17} />

            Volver al panel
          </button>


          <div className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          ">

            <div>

              <div className="
                mb-3
                flex
                items-center
                gap-3
              ">

                <div className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-500/10
                  ring-1
                  ring-violet-500/20
                ">
                  <Smartphone
                    size={22}
                    className="
                      text-violet-400
                    "
                  />
                </div>

                <span className="
                  rounded-full
                  bg-violet-500/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-violet-400
                ">
                  Administración
                </span>

              </div>


              <h1 className="
                text-2xl
                font-bold
                tracking-tight
                text-white
                sm:text-3xl
              ">
                Gestión de recargas
              </h1>

              <p className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-400
                sm:text-base
              ">
                Verifica comprobantes, revisa
                operaciones y administra el
                estado de las recargas.
              </p>

            </div>


            {/* Counter */}

            <div className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-3
            ">

              <div className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-500/10
              ">
                <Clock3
                  size={19}
                  className="
                    text-amber-400
                  "
                />
              </div>

              <div>

                <p className="
                  text-xs
                  text-slate-500
                ">
                  Recargas mostradas
                </p>

                <p className="
                  text-lg
                  font-bold
                  text-white
                ">
                  {recharges.length}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ======================================
            FILTERS
        ======================================= */}

        <section className="
          mb-6
          rounded-2xl
          border
          border-white/10
          bg-white/[0.035]
          p-4
          shadow-2xl
          shadow-black/10
          sm:p-5
        ">

          <div className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
          ">

            {/* Search */}

            <div className="
              relative
              min-w-0
              flex-1
            ">

              <Search
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="text"
                placeholder="
                  Buscar por referencia,
                  ID jugador o email...
                "
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-slate-950/60
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  transition
                  focus:border-violet-500/50
                  focus:ring-4
                  focus:ring-violet-500/10
                "
              />

            </div>


            {/* Status */}

            <div className="
              relative
              w-full
              xl:w-52
            ">

              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="
                  h-12
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-slate-950/60
                  px-4
                  pr-10
                  text-sm
                  text-slate-300
                  outline-none
                  transition
                  focus:border-violet-500/50
                  focus:ring-4
                  focus:ring-violet-500/10
                "
              >

                <option value="">
                  Todos los estados
                </option>

                <option value="PENDING">
                  Pendientes
                </option>

                <option value="COMPLETED">
                  Completadas
                </option>

                <option value="FAILED">
                  Fallidas
                </option>

                <option value="CANCELLED">
                  Canceladas
                </option>

              </select>

              <ChevronDown
                size={17}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

            </div>


            {/* Operator */}

            <div className="
              relative
              w-full
              xl:w-60
            ">

              <select
                name="operator"
                value={filters.operator}
                onChange={handleFilterChange}
                className="
                  h-12
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-slate-950/60
                  px-4
                  pr-10
                  text-sm
                  text-slate-300
                  outline-none
                  transition
                  focus:border-violet-500/50
                  focus:ring-4
                  focus:ring-violet-500/10
                "
              >

                <option value="">
                  Todos los juegos
                </option>

                <option value="FREE_FIRE">
                  Free Fire
                </option>

                <option value="PUBG_MOBILE">
                  PUBG Mobile
                </option>

                <option value="MOBILE_LEGENDS">
                  Mobile Legends
                </option>

                <option value="GENSHIN_IMPACT">
                  Genshin Impact
                </option>

                <option value="COD_MOBILE">
                  Call of Duty Mobile
                </option>

              </select>

              <ChevronDown
                size={17}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

            </div>


            {(searchTerm ||
              filters.status ||
              filters.operator) && (

              <button
                type="button"
                onClick={clearFilters}
                className="
                  h-12
                  rounded-xl
                  border
                  border-white/10
                  px-4
                  text-sm
                  font-medium
                  text-slate-400
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                Limpiar
              </button>

            )}

          </div>

        </section>


        {/* ======================================
            LOADING
        ======================================= */}

        {isLoading ? (

          <section className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
          ">

            <div className="
              hidden
              lg:block
            ">

              <div className="
                grid
                grid-cols-[2fr_1.5fr_1.2fr_1fr_1.2fr_1.4fr_1.5fr]
                gap-4
                border-b
                border-white/10
                px-6
                py-4
              ">

                {Array.from({
                  length: 7,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="
                      h-3
                      animate-pulse
                      rounded
                      bg-white/10
                    "
                  />
                ))}

              </div>


              {Array.from({
                length: 6,
              }).map((_, rowIndex) => (

                <div
                  key={rowIndex}
                  className="
                    grid
                    grid-cols-[2fr_1.5fr_1.2fr_1fr_1.2fr_1.4fr_1.5fr]
                    gap-4
                    border-b
                    border-white/5
                    px-6
                    py-5
                  "
                >

                  {Array.from({
                    length: 7,
                  }).map(
                    (_, columnIndex) => (
                      <div
                        key={columnIndex}
                        className="
                          h-4
                          animate-pulse
                          rounded
                          bg-white/5
                        "
                      />
                    )
                  )}

                </div>

              ))}

            </div>


            {/* Mobile skeleton */}

            <div className="
              space-y-3
              p-4
              lg:hidden
            ">

              {Array.from({
                length: 5,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    h-52
                    animate-pulse
                    rounded-xl
                    bg-white/5
                  "
                />

              ))}

            </div>

          </section>

        ) : recharges.length === 0 ? (

          /* ====================================
             EMPTY
          ===================================== */

          <section className="
            rounded-2xl
            border
            border-dashed
            border-white/10
            bg-white/[0.025]
            px-6
            py-16
            text-center
          ">

            <div className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-white/[0.05]
            ">
              <Smartphone
                size={28}
                className="
                  text-slate-500
                "
              />
            </div>

            <h3 className="
              text-lg
              font-semibold
              text-white
            ">
              {filters.status === 'PENDING'
                ? 'No hay recargas pendientes'
                : 'No hay recargas'}
            </h3>

            <p className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            ">
              {filters.status === 'PENDING'
                ? 'No existen recargas pendientes de verificación en este momento.'
                : 'No encontramos recargas que coincidan con los filtros seleccionados.'}
            </p>

            {(searchTerm ||
              filters.status ||
              filters.operator) && (

              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-5
                  rounded-xl
                  bg-violet-500
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-violet-400
                "
              >
                Limpiar filtros
              </button>

            )}

          </section>

        ) : (

          /* ====================================
             TABLE
          ===================================== */

          <section className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
            shadow-2xl
            shadow-black/10
          ">

            {/* Desktop */}

            <div className="
              hidden
              overflow-x-auto
              lg:block
            ">

              <table className="
                w-full
                min-w-[1150px]
              ">

                <thead>

                  <tr className="
                    border-b
                    border-white/10
                    bg-white/[0.025]
                  ">

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Usuario
                    </th>

                    <th className="
                      px-4
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Juego
                    </th>

                    <th className="
                      px-4
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      ID jugador
                    </th>

                    <th className="
                      px-4
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Monto
                    </th>

                    <th className="
                      px-4
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Estado
                    </th>

                    <th className="
                      px-4
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Fecha
                    </th>

                    <th className="
                      px-6
                      py-4
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Acción
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recharges.map((recharge) => {

                    const status =
                      getStatusConfig(
                        recharge.status
                      );

                    const StatusIcon =
                      status.icon;

                    return (

                      <tr
                        key={recharge.uuid}
                        className="
                          border-b
                          border-white/5
                          transition
                          last:border-0
                          hover:bg-white/[0.025]
                        "
                      >

                        {/* Usuario */}

                        <td className="
                          px-6
                          py-5
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-blue-500/10
                              text-blue-400
                              ring-1
                              ring-blue-500/20
                            ">
                              <User size={17} />
                            </div>

                            <div className="
                              min-w-0
                            ">

                              <p className="
                                truncate
                                text-sm
                                font-semibold
                                text-white
                              ">
                                {recharge.user
                                  ?.first_name}{' '}
                                {recharge.user
                                  ?.last_name}
                              </p>

                              <div className="
                                mt-1
                                flex
                                items-center
                                gap-1.5
                                text-xs
                                text-slate-500
                              ">
                                <Mail size={12} />

                                <span className="
                                  max-w-[200px]
                                  truncate
                                ">
                                  {recharge.user
                                    ?.email}
                                </span>
                              </div>

                            </div>

                          </div>

                        </td>


                        {/* Juego */}

                        <td className="
                          px-4
                          py-5
                        ">

                          <div>

                            <p className="
                              text-sm
                              font-semibold
                              text-white
                            ">
                              {
                                GameOperatorLabels[
                                  recharge.operator
                                ]
                              }
                            </p>

                            <p className="
                              mt-1
                              text-xs
                              text-slate-500
                            ">
                              {
                                RechargeTypeLabels[
                                  recharge.type
                                ]
                              }
                            </p>

                          </div>

                        </td>


                        {/* ID */}

                        <td className="
                          px-4
                          py-5
                        ">

                          <div className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-white/[0.04]
                            px-2.5
                            py-1.5
                          ">

                            <Hash
                              size={13}
                              className="
                                text-slate-500
                              "
                            />

                            <span className="
                              font-mono
                              text-xs
                              text-slate-300
                            ">
                              {
                                recharge.phone_number
                              }
                            </span>

                          </div>

                        </td>


                        {/* Monto */}

                        <td className="
                          px-4
                          py-5
                        ">

                          <div className="
                            flex
                            items-center
                            gap-2
                          ">

                            <div className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-emerald-500/10
                            ">
                              <CircleDollarSign
                                size={15}
                                className="
                                  text-emerald-400
                                "
                              />
                            </div>

                            <div>

                              <p className="
                                text-sm
                                font-bold
                                text-white
                              ">
                                $
                                {formatAmount(
                                  recharge.amount
                                )}
                              </p>

                              <p className="
                                text-[10px]
                                uppercase
                                text-slate-600
                              ">
                                {recharge.currency ||
                                  'USD'}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Estado */}

                        <td className="
                          px-4
                          py-5
                        ">

                          <span className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1.5
                            text-xs
                            font-semibold
                            ${status.className}
                          `}>

                            <span className={`
                              h-1.5
                              w-1.5
                              rounded-full
                              ${status.dot}
                            `} />

                            <StatusIcon
                              size={13}
                            />

                            {status.label}

                          </span>

                        </td>


                        {/* Fecha */}

                        <td className="
                          px-4
                          py-5
                        ">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-400
                          ">

                            <CalendarDays
                              size={14}
                              className="
                                text-slate-500
                              "
                            />

                            {formatDate(
                              recharge.created_at
                            )}

                          </div>

                        </td>


                        {/* Acción */}

                        <td className="
                          px-6
                          py-5
                        ">

                          {recharge.status ===
                          'PENDING' ? (

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  recharge
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-violet-500
                                px-4
                                py-2.5
                                text-xs
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-violet-500/10
                                transition
                                hover:bg-violet-400
                                hover:shadow-violet-500/20
                              "
                            >
                              <ShieldCheck
                                size={15}
                              />

                              Verificar
                            </button>

                          ) : (

                            <div className="
                              relative
                              inline-block
                            ">

                              <select
                                value={
                                  recharge.status
                                }
                                onChange={(event) =>
                                  handleUpdateStatus(
                                    recharge.uuid,
                                    event.target.value as RechargeStatus
                                  )
                                }
                                className="
                                  h-9
                                  appearance-none
                                  rounded-lg
                                  border
                                  border-white/10
                                  bg-slate-950
                                  px-3
                                  pr-8
                                  text-xs
                                  font-medium
                                  text-slate-300
                                  outline-none
                                  transition
                                  hover:border-white/20
                                  focus:border-violet-500/50
                                "
                              >

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
                                size={13}
                                className="
                                  pointer-events-none
                                  absolute
                                  right-2.5
                                  top-1/2
                                  -translate-y-1/2
                                  text-slate-500
                                "
                              />

                            </div>

                          )}

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>


            {/* ==================================
                MOBILE CARDS
            =================================== */}

            <div className="
              space-y-3
              p-3
              lg:hidden
            ">

              {recharges.map((recharge) => {

                const status =
                  getStatusConfig(
                    recharge.status
                  );

                const StatusIcon =
                  status.icon;

                return (

                  <article
                    key={recharge.uuid}
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-slate-950/50
                      p-4
                    "
                  >

                    {/* Header */}

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    ">

                      <div className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      ">

                        <div className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-500/10
                          text-blue-400
                        ">
                          <User size={17} />
                        </div>

                        <div className="
                          min-w-0
                        ">

                          <p className="
                            truncate
                            text-sm
                            font-semibold
                            text-white
                          ">
                            {recharge.user
                              ?.first_name}{' '}
                            {recharge.user
                              ?.last_name}
                          </p>

                          <p className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-500
                          ">
                            {recharge.user
                              ?.email}
                          </p>

                        </div>

                      </div>


                      <span className={`
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        px-2
                        py-1
                        text-[10px]
                        font-semibold
                        ${status.className}
                      `}>

                        <span className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${status.dot}
                        `} />

                        {status.label}

                      </span>

                    </div>


                    {/* Game */}

                    <div className="
                      mt-4
                      rounded-xl
                      border
                      border-white/5
                      bg-white/[0.025]
                      p-3
                    ">

                      <div className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      ">

                        <div>

                          <p className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-600
                          ">
                            Juego
                          </p>

                          <p className="
                            mt-1
                            text-sm
                            font-semibold
                            text-white
                          ">
                            {
                              GameOperatorLabels[
                                recharge.operator
                              ]
                            }
                          </p>

                        </div>

                        <div className="
                          text-right
                        ">

                          <p className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-600
                          ">
                            Tipo
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            text-slate-300
                          ">
                            {
                              RechargeTypeLabels[
                                recharge.type
                              ]
                            }
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Data */}

                    <div className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-3
                    ">

                      <div className="
                        rounded-xl
                        border
                        border-white/5
                        bg-white/[0.025]
                        p-3
                      ">

                        <p className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-600
                        ">
                          ID jugador
                        </p>

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                        ">

                          <Hash
                            size={13}
                            className="
                              text-slate-500
                            "
                          />

                          <span className="
                            truncate
                            font-mono
                            text-xs
                            text-slate-300
                          ">
                            {
                              recharge.phone_number
                            }
                          </span>

                        </div>

                      </div>


                      <div className="
                        rounded-xl
                        border
                        border-white/5
                        bg-white/[0.025]
                        p-3
                      ">

                        <p className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-600
                        ">
                          Monto
                        </p>

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                        ">

                          <CircleDollarSign
                            size={14}
                            className="
                              text-emerald-400
                            "
                          />

                          <span className="
                            text-sm
                            font-bold
                            text-white
                          ">
                            $
                            {formatAmount(
                              recharge.amount
                            )}
                          </span>

                        </div>

                      </div>


                      <div className="
                        col-span-2
                        rounded-xl
                        border
                        border-white/5
                        bg-white/[0.025]
                        p-3
                      ">

                        <div className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        ">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-400
                          ">

                            <CalendarDays
                              size={14}
                              className="
                                text-slate-500
                              "
                            />

                            {formatDate(
                              recharge.created_at
                            )}

                          </div>

                          <span className="
                            text-[10px]
                            uppercase
                            text-slate-600
                          ">
                            {recharge.currency ||
                              'USD'}
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* Action */}

                    {recharge.status ===
                    'PENDING' ? (

                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(
                            recharge
                          )
                        }
                        className="
                          mt-4
                          flex
                          h-11
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-violet-500
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-violet-400
                        "
                      >
                        <ShieldCheck
                          size={16}
                        />

                        Verificar recarga
                      </button>

                    ) : (

                      <div className="
                        relative
                        mt-4
                      ">

                        <select
                          value={
                            recharge.status
                          }
                          onChange={(event) =>
                            handleUpdateStatus(
                              recharge.uuid,
                              event.target.value as RechargeStatus
                            )
                          }
                          className="
                            h-11
                            w-full
                            appearance-none
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.035]
                            px-3
                            pr-9
                            text-xs
                            font-medium
                            text-slate-300
                            outline-none
                            focus:border-violet-500/50
                          "
                        >

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
                          size={15}
                          className="
                            pointer-events-none
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-500
                          "
                        />

                      </div>

                    )}

                  </article>

                );
              })}

            </div>

          </section>

        )}

      </main>


      {/* ========================================
          MODAL
      ========================================= */}

      {selectedRecharge && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/75
            p-3
            backdrop-blur-sm
            sm:p-6
          "
          onClick={handleCloseModal}
        >

          <div
            className="
              flex
              max-h-[95vh]
              w-full
              max-w-3xl
              flex-col
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-slate-950
              shadow-2xl
              shadow-black/50
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal header */}

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-white/10
              bg-white/[0.025]
              px-5
              py-4
              sm:px-6
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                  ring-1
                  ring-violet-500/20
                ">
                  <ShieldCheck
                    size={19}
                    className="
                      text-violet-400
                    "
                  />
                </div>

                <div>

                  <h2 className="
                    text-base
                    font-bold
                    text-white
                    sm:text-lg
                  ">
                    Verificar recarga
                  </h2>

                  <p className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  ">
                    Revisa la información antes
                    de aprobar la operación.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-500
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <X size={19} />
              </button>

            </div>


            {/* Modal body */}

            <div className="
              min-h-0
              flex-1
              overflow-y-auto
              p-4
              sm:p-6
            ">

              {/* Recharge info */}

              <section className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.025]
                p-4
                sm:p-5
              ">

                <div className="
                  mb-5
                  flex
                  items-center
                  gap-2
                ">

                  <Smartphone
                    size={17}
                    className="
                      text-violet-400
                    "
                  />

                  <h3 className="
                    text-sm
                    font-semibold
                    text-white
                  ">
                    Información de la recarga
                  </h3>

                </div>


                <div className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                ">

                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Usuario
                    </span>

                    <p className="
                      mt-1.5
                      break-all
                      text-sm
                      font-medium
                      text-slate-200
                    ">
                      {
                        selectedRecharge.user
                          ?.email
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Juego
                    </span>

                    <p className="
                      mt-1.5
                      text-sm
                      font-semibold
                      text-white
                    ">
                      {
                        GameOperatorLabels[
                          selectedRecharge.operator
                        ]
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Tipo
                    </span>

                    <p className="
                      mt-1.5
                      text-sm
                      text-slate-300
                    ">
                      {
                        RechargeTypeLabels[
                          selectedRecharge.type
                        ]
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Paquete
                    </span>

                    <div className="
                      mt-1.5
                      flex
                      items-center
                      gap-2
                    ">

                      <Package
                        size={14}
                        className="
                          text-slate-500
                        "
                      />

                      <p className="
                        text-sm
                        text-slate-300
                      ">
                        {
                          selectedRecharge.package ||
                          '-'
                        }
                      </p>

                    </div>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      ID jugador
                    </span>

                    <p className="
                      mt-1.5
                      font-mono
                      text-sm
                      text-slate-300
                    ">
                      {
                        selectedRecharge.phone_number
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-emerald-500/[0.04]
                    p-3
                    ring-1
                    ring-emerald-500/10
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-emerald-500/60
                    ">
                      Monto
                    </span>

                    <p className="
                      mt-1.5
                      text-xl
                      font-bold
                      text-emerald-400
                    ">
                      $
                      {formatAmount(
                        selectedRecharge.amount
                      )}

                      <span className="
                        ml-1
                        text-xs
                        font-medium
                        text-emerald-500/60
                      ">
                        {
                          selectedRecharge.currency ||
                          'USD'
                        }
                      </span>
                    </p>

                  </div>

                </div>

              </section>


              {/* Payment */}

              <section className="
                mt-4
                rounded-2xl
                border
                border-white/10
                bg-white/[0.025]
                p-4
                sm:p-5
              ">

                <div className="
                  mb-5
                  flex
                  items-center
                  gap-2
                ">

                  <CreditCard
                    size={17}
                    className="
                      text-blue-400
                    "
                  />

                  <h3 className="
                    text-sm
                    font-semibold
                    text-white
                  ">
                    Información de pago
                  </h3>

                </div>


                <div className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                ">

                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Moneda
                    </span>

                    <p className="
                      mt-1.5
                      text-sm
                      text-slate-300
                    ">
                      {
                        selectedRecharge.currency ||
                        '-'
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Método
                    </span>

                    <p className="
                      mt-1.5
                      text-sm
                      text-slate-300
                    ">
                      {
                        selectedRecharge.payment_method ||
                        '-'
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      ID transacción
                    </span>

                    <p className="
                      mt-1.5
                      break-all
                      font-mono
                      text-xs
                      text-slate-400
                    ">
                      {
                        selectedRecharge.transaction_id ||
                        '-'
                      }
                    </p>

                  </div>


                  <div className="
                    rounded-xl
                    bg-slate-950/60
                    p-3
                  ">

                    <span className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-600
                    ">
                      Referencia
                    </span>

                    <p className="
                      mt-1.5
                      break-all
                      font-mono
                      text-xs
                      text-slate-300
                    ">
                      {
                        selectedRecharge.reference ||
                        '-'
                      }
                    </p>

                  </div>

                </div>

              </section>


              {/* Proof */}

              {selectedRecharge.proof_image_path && (

                <section className="
                  mt-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.025]
                  p-4
                  sm:p-5
                ">

                  <div className="
                    mb-5
                    flex
                    items-center
                    justify-between
                    gap-3
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      <ImageIcon
                        size={17}
                        className="
                          text-amber-400
                        "
                      />

                      <h3 className="
                        text-sm
                        font-semibold
                        text-white
                      ">
                        Comprobante enviado
                      </h3>

                    </div>

                  </div>


                  <div className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-950
                  ">

                    {loadingProof ? (

                      <div className="
                        flex
                        min-h-[260px]
                        flex-col
                        items-center
                        justify-center
                        gap-3
                      ">

                        <RefreshCw
                          size={24}
                          className="
                            animate-spin
                            text-violet-400
                          "
                        />

                        <p className="
                          text-sm
                          text-slate-500
                        ">
                          Cargando comprobante...
                        </p>

                      </div>

                    ) : proofImageUrl ? (

                      <div>

                        <div className="
                          flex
                          min-h-[260px]
                          items-center
                          justify-center
                          bg-black/20
                          p-3
                          sm:p-5
                        ">

                          <img
                            src={proofImageUrl}
                            alt="Comprobante de pago"
                            className="
                              max-h-[400px]
                              max-w-full
                              rounded-xl
                              object-contain
                              shadow-2xl
                            "
                          />

                        </div>


                        <div className="
                          border-t
                          border-white/10
                          p-3
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                proofImageUrl,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }
                            className="
                              inline-flex
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.04]
                              px-4
                              py-2.5
                              text-xs
                              font-semibold
                              text-slate-300
                              transition
                              hover:bg-white/[0.08]
                              hover:text-white
                            "
                          >
                            <ExternalLink
                              size={15}
                            />

                            Abrir comprobante
                          </button>

                        </div>

                      </div>

                    ) : (

                      <div className="
                        flex
                        min-h-[220px]
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        p-6
                      ">

                        <div className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-red-500/10
                        ">
                          <ImageIcon
                            size={21}
                            className="
                              text-red-400
                            "
                          />
                        </div>

                        <p className="
                          text-sm
                          font-medium
                          text-red-400
                        ">
                          No se pudo cargar
                          el comprobante
                        </p>

                      </div>

                    )}

                  </div>

                </section>

              )}

            </div>


            {/* Modal footer */}

            <div className="
              shrink-0
              border-t
              border-white/10
              bg-white/[0.02]
              p-4
              sm:p-5
            ">

              <div className="
                grid
                grid-cols-1
                gap-2
                sm:grid-cols-3
              ">

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedRecharge.uuid,
                      'COMPLETED'
                    )
                  }
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-500
                    px-4
                    text-xs
                    font-bold
                    text-white
                    shadow-lg
                    shadow-emerald-500/10
                    transition
                    hover:bg-emerald-400
                  "
                >
                  <Check size={16} />

                  Aprobar recarga
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedRecharge.uuid,
                      'FAILED'
                    )
                  }
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-500/10
                    px-4
                    text-xs
                    font-bold
                    text-red-400
                    ring-1
                    ring-red-500/20
                    transition
                    hover:bg-red-500/20
                  "
                >
                  <X size={16} />

                  Rechazar recarga
                </button>


                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-4
                    text-xs
                    font-semibold
                    text-slate-400
                    transition
                    hover:bg-white/[0.08]
                    hover:text-white
                  "
                >
                  <X size={15} />

                  Cancelar
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};