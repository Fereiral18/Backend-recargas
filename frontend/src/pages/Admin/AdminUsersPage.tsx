import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Ban,
  RefreshCw,
  Mail,
  Phone,
  CalendarDays,
  Wallet,
  ChevronDown,
} from 'lucide-react';

import { toast } from 'react-toastify';

import {
  adminUserService,
  type AdminUser,
  type AdminUserFilters,
  type UserRole,
  type UserStatus,
} from '../../services/admin.service';

import { AdminLayout } from '../../components/layouts/AdminLayout';


export const AdminUsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [filters, setFilters] = useState<AdminUserFilters>({
    role: '',
    status: '',
  });

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await adminUserService.getAllUsers({
        ...filters,
        search: searchTerm.trim() || undefined,
      });

      setUsers(response.data ?? []);
    } catch (error: unknown) {
      console.error('Error al cargar usuarios:', error);

      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      toast.error('No tienes permisos de administrador');
      navigate('/dashboard');
      return;
    }

    try {
      const user = JSON.parse(storedUser) as {
        role?: string;
      };

      if (user.role !== 'admin') {
        toast.error('No tienes permisos de administrador');
        navigate('/dashboard');
        return;
      }

      loadUsers();
    } catch {
      toast.error('Sesión inválida');
      navigate('/dashboard');
    }
  }, [loadUsers, navigate]);


  const handleFilterChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleChangeRole = async (
    uuid: string,
    newRole: UserRole
  ) => {
    try {
      await adminUserService.changeUserRole(
        uuid,
        newRole
      );

      toast.success('Rol actualizado correctamente');

      await loadUsers();
    } catch (error: unknown) {
      console.error('Error al cambiar rol:', error);

      toast.error('Error al cambiar el rol');
    }
  };


  const handleChangeStatus = async (
    uuid: string,
    newStatus: UserStatus
  ) => {
    try {
      await adminUserService.changeUserStatus(
        uuid,
        newStatus
      );

      toast.success('Estado actualizado correctamente');

      await loadUsers();
    } catch (error: unknown) {
      console.error(
        'Error al cambiar estado:',
        error
      );

      toast.error('Error al cambiar el estado');
    }
  };


  const handleCreditBalance = async (user: AdminUser) => {
    const amountInput = window.prompt(
      `Monto a acreditar a ${user.first_name} ${user.last_name} (USD):`
    );

    if (!amountInput) return;

    const amount = Number.parseFloat(amountInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Ingresá un monto válido');
      return;
    }

    const note = window.prompt('Nota (opcional) — ej: transferencia recibida por fuera:') || undefined;

    try {
      await adminUserService.creditBalance(user.uuid, amount, note);
      toast.success('Saldo acreditado correctamente');
      await loadUsers();
    } catch (error: unknown) {
      console.error('Error al acreditar saldo:', error);
      toast.error('Error al acreditar saldo');
    }
  };


  const getInitials = (user: AdminUser): string => {
    const firstInitial =
      user.first_name?.charAt(0)?.toUpperCase() ?? '';

    const lastInitial =
      user.last_name?.charAt(0)?.toUpperCase() ?? '';

    return `${firstInitial}${lastInitial}`;
  };


  const getFullName = (user: AdminUser): string => {
    return `${user.first_name} ${user.last_name}`.trim();
  };


  const getStatusConfig = (
    status: UserStatus
  ) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Activo',
          className:
            'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: UserCheck,
        };

      case 'INACTIVE':
        return {
          label: 'Inactivo',
          className:
            'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
          dot: 'bg-slate-400',
          icon: UserX,
        };

      case 'SUSPENDED':
        return {
          label: 'Suspendido',
          className:
            'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
          dot: 'bg-amber-400',
          icon: RefreshCw,
        };

      case 'BANNED':
        return {
          label: 'Baneado',
          className:
            'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
          dot: 'bg-red-400',
          icon: Ban,
        };

      default:
        return {
          label: status,
          className:
            'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
          dot: 'bg-slate-400',
          icon: Users,
        };
    }
  };


  const getRoleConfig = (role: UserRole) => {
    if (role === 'admin') {
      return {
        label: 'Administrador',
        className:
          'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
        icon: ShieldCheck,
      };
    }

    if (role === 'reseller') {
      return {
        label: 'Revendedor',
        className:
          'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
        icon: Wallet,
      };
    }

    return {
      label: 'Usuario',
      className:
        'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
      icon: Users,
    };
  };


  const formatBalance = (
    balance: AdminUser['balance']
  ): string => {
    const numericBalance =
      typeof balance === 'string'
        ? Number.parseFloat(balance)
        : Number(balance ?? 0);

    return Number.isFinite(numericBalance)
      ? numericBalance.toFixed(2)
      : '0.00';
  };


  const formatDate = (
    date: string
  ): string => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString(
      'es-AR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };


  const clearFilters = () => {
    setSearchTerm('');

    setFilters({
      role: '',
      status: '',
    });
  };


  return (
    <AdminLayout>
      <main className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-3">

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
                  <Users
                    size={22}
                    className="text-violet-400"
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
                Gestión de usuarios
              </h1>

              <p className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-400
                sm:text-base
              ">
                Administra usuarios, roles, estados y
                consulta su información de cuenta.
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
                bg-blue-500/10
              ">
                <Users
                  size={19}
                  className="text-blue-400"
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Usuarios encontrados
                </p>

                <p className="text-lg font-bold text-white">
                  {users.length}
                </p>
              </div>
            </div>

          </div>
        </div>


        {/* Filters */}
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
            <div className="relative min-w-0 flex-1">

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
                placeholder="Buscar por email, nombre o teléfono..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
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


            {/* Role */}
            <div className="relative w-full xl:w-52">

              <select
                name="role"
                value={filters.role}
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
                  Todos los roles
                </option>

                <option value="user">
                  Usuarios
                </option>

                <option value="reseller">
                  Revendedores
                </option>

                <option value="admin">
                  Administradores
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


            {/* Status */}
            <div className="relative w-full xl:w-52">

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

                <option value="active">
                  Activos
                </option>

                <option value="INACTIVE">
                  Inactivos
                </option>

                <option value="SUSPENDED">
                  Suspendidos
                </option>

                <option value="BANNED">
                  Baneados
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


            {/* Clear */}
            {(searchTerm ||
              filters.role ||
              filters.status) && (
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
                  xl:shrink-0
                "
              >
                Limpiar
              </button>
            )}

          </div>
        </section>


        {/* Loading */}
        {isLoading ? (
          <div className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
          ">

            <div className="hidden overflow-x-auto 2xl:block">

              <div className="min-w-[1100px]">

                <div className="
                  grid
                  grid-cols-[2fr_2fr_1.3fr_1.3fr_1.3fr_1.2fr_1.4fr_2fr]
                  gap-4
                  border-b
                  border-white/10
                  px-6
                  py-4
                ">
                  {Array.from({ length: 8 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="
                          h-3
                          animate-pulse
                          rounded
                          bg-white/10
                        "
                      />
                    )
                  )}
                </div>


                {Array.from({ length: 6 }).map(
                  (_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="
                        grid
                        grid-cols-[2fr_2fr_1.3fr_1.3fr_1.3fr_1.2fr_1.4fr_2fr]
                        gap-4
                        border-b
                        border-white/5
                        px-6
                        py-5
                      "
                    >
                      {Array.from({ length: 8 }).map(
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
                  )
                )}

              </div>
            </div>


            {/* Mobile skeleton */}
            <div className="space-y-3 p-4 2xl:hidden">

              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="
                      h-40
                      animate-pulse
                      rounded-xl
                      bg-white/5
                    "
                  />
                )
              )}

            </div>

          </div>
        ) : users.length === 0 ? (

          /* Empty */
          <div className="
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
              <Users
                size={28}
                className="text-slate-500"
              />
            </div>

            <h3 className="
              text-lg
              font-semibold
              text-white
            ">
              No hay usuarios
            </h3>

            <p className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            ">
              No encontramos usuarios que coincidan
              con los filtros seleccionados.
            </p>

            {(searchTerm ||
              filters.role ||
              filters.status) && (
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

          </div>

        ) : (

          /* Users */
          <section className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
            shadow-2xl
            shadow-black/10
          ">

            {/* Desktop table */}
            <div className="hidden overflow-x-auto 2xl:block">

              <table className="w-full min-w-[1100px]">

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
                      Contacto
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
                      Rol
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
                      Balance
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
                      Registro
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
                      Acciones
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {users.map((user) => {

                    const status =
                      getStatusConfig(user.status);

                    const role =
                      getRoleConfig(user.role);

                    const StatusIcon =
                      status.icon;

                    const RoleIcon =
                      role.icon;

                    return (
                      <tr
                        key={user.uuid}
                        className="
                          border-b
                          border-white/5
                          transition
                          last:border-0
                          hover:bg-white/[0.025]
                        "
                      >

                        {/* User */}
                        <td className="px-6 py-5">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-gradient-to-br
                              from-violet-500/20
                              to-blue-500/20
                              text-sm
                              font-bold
                              text-violet-300
                              ring-1
                              ring-white/10
                            ">
                              {getInitials(user)}
                            </div>

                            <div className="min-w-0">

                              <p className="
                                truncate
                                text-sm
                                font-semibold
                                text-white
                              ">
                                {getFullName(user)}
                              </p>

                              <p className="
                                mt-0.5
                                text-xs
                                text-slate-500
                              ">
                                ID: {user.uuid.slice(0, 8)}...
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Contact */}
                        <td className="px-4 py-5">

                          <div className="space-y-1.5">

                            <div className="
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-slate-300
                            ">
                              <Mail
                                size={14}
                                className="text-slate-500"
                              />

                              <span className="max-w-[220px] truncate">
                                {user.email}
                              </span>
                            </div>

                            <div className="
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-slate-500
                            ">
                              <Phone size={14} />

                              <span>
                                {user.phone || 'Sin teléfono'}
                              </span>
                            </div>

                          </div>

                        </td>


                        {/* Role */}
                        <td className="px-4 py-5">

                          <span className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1.5
                            text-xs
                            font-semibold
                            ${role.className}
                          `}>

                            <RoleIcon size={13} />

                            {role.label}

                          </span>

                        </td>


                        {/* Status */}
                        <td className="px-4 py-5">

                          <span className={`
                            inline-flex
                            items-center
                            gap-2
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

                            <StatusIcon size={13} />

                            {status.label}

                          </span>

                        </td>


                        {/* Balance */}
                        <td className="px-4 py-5">

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
                              <Wallet
                                size={14}
                                className="text-emerald-400"
                              />
                            </div>

                            <span className="
                              text-sm
                              font-semibold
                              text-white
                            ">
                              ${formatBalance(user.balance)}
                            </span>

                          </div>

                        </td>


                        {/* Date */}
                        <td className="px-4 py-5">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-400
                          ">
                            <CalendarDays
                              size={14}
                              className="text-slate-500"
                            />

                            {formatDate(user.created_at)}
                          </div>

                        </td>


                        {/* Actions */}
                        <td className="px-6 py-5">

                          <div className="
                            flex
                            min-w-[280px]
                            gap-2
                          ">

                            <div className="relative">

                              <select
                                value={user.role}
                                onChange={(event) =>
                                  handleChangeRole(
                                    user.uuid,
                                    event.target.value as UserRole
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
                                <option value="user">
                                  Usuario
                                </option>

                                <option value="reseller">
                                  Revendedor
                                </option>

                                <option value="admin">
                                  Admin
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


                            <div className="relative">

                              <select
                                value={user.status}
                                onChange={(event) =>
                                  handleChangeStatus(
                                    user.uuid,
                                    event.target.value as UserStatus
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
                                <option value="active">
                                  Activo
                                </option>

                                <option value="INACTIVE">
                                  Inactivo
                                </option>

                                <option value="SUSPENDED">
                                  Suspendido
                                </option>

                                <option value="BANNED">
                                  Baneado
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

                            {user.role === 'reseller' && (
                              <button
                                type="button"
                                onClick={() => handleCreditBalance(user)}
                                className="
                                  inline-flex
                                  h-9
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-emerald-400/20
                                  bg-emerald-500/[0.08]
                                  px-3
                                  text-xs
                                  font-semibold
                                  text-emerald-300
                                  transition
                                  hover:border-emerald-400/40
                                  hover:bg-emerald-500/[0.14]
                                "
                                title="Acreditar saldo directo"
                              >
                                <Wallet size={13} />
                                Saldo
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>


            {/* Mobile cards */}
            <div className="
              space-y-3
              p-3
              2xl:hidden
            ">

              {users.map((user) => {

                const status =
                  getStatusConfig(user.status);

                const role =
                  getRoleConfig(user.role);

                const StatusIcon =
                  status.icon;

                const RoleIcon =
                  role.icon;

                return (
                  <article
                    key={user.uuid}
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-slate-950/50
                      p-4
                    "
                  >

                    {/* User header */}
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
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-violet-500/20
                          to-blue-500/20
                          text-sm
                          font-bold
                          text-violet-300
                          ring-1
                          ring-white/10
                        ">
                          {getInitials(user)}
                        </div>

                        <div className="min-w-0">

                          <p className="
                            truncate
                            text-sm
                            font-semibold
                            text-white
                          ">
                            {getFullName(user)}
                          </p>

                          <p className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-500
                          ">
                            {user.email}
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


                    {/* Information */}
                    <div className="
                      mt-4
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
                          Rol
                        </p>

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                        ">

                          <RoleIcon
                            size={14}
                            className="text-violet-400"
                          />

                          <span className="
                            text-xs
                            font-medium
                            text-slate-300
                          ">
                            {role.label}
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
                          Balance
                        </p>

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                        ">

                          <Wallet
                            size={14}
                            className="text-emerald-400"
                          />

                          <span className="
                            text-xs
                            font-semibold
                            text-white
                          ">
                            ${formatBalance(user.balance)}
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
                          Teléfono
                        </p>

                        <div className="
                          mt-2
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                        ">

                          <Phone
                            size={14}
                            className="shrink-0 text-slate-500"
                          />

                          <span className="
                            truncate
                            text-xs
                            text-slate-300
                          ">
                            {user.phone || '-'}
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
                          Registro
                        </p>

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                        ">

                          <CalendarDays
                            size={14}
                            className="text-slate-500"
                          />

                          <span className="
                            text-xs
                            text-slate-300
                          ">
                            {formatDate(
                              user.created_at
                            )}
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* Actions */}
                    <div className="
                      mt-4
                      grid
                      grid-cols-1
                      gap-2
                      sm:grid-cols-2
                    ">

                      <div className="relative">

                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleChangeRole(
                              user.uuid,
                              event.target.value as UserRole
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
                            transition
                            focus:border-violet-500/50
                          "
                        >
                          <option value="user">
                            Cambiar a Usuario
                          </option>

                          <option value="reseller">
                            Cambiar a Revendedor
                          </option>

                          <option value="admin">
                            Cambiar a Admin
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


                      <div className="relative">

                        <select
                          value={user.status}
                          onChange={(event) =>
                            handleChangeStatus(
                              user.uuid,
                              event.target.value as UserStatus
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
                            transition
                            focus:border-violet-500/50
                          "
                        >
                          <option value="active">
                            Activo
                          </option>

                          <option value="INACTIVE">
                            Inactivo
                          </option>

                          <option value="SUSPENDED">
                            Suspendido
                          </option>

                          <option value="BANNED">
                            Baneado
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

                      {user.role === 'reseller' && (
                        <button
                          type="button"
                          onClick={() => handleCreditBalance(user)}
                          className="
                            mt-3
                            inline-flex
                            h-10
                            w-full
                            items-center
                            justify-center
                            gap-1.5
                            rounded-xl
                            border
                            border-emerald-400/20
                            bg-emerald-500/[0.08]
                            text-xs
                            font-semibold
                            text-emerald-300
                            transition
                            hover:border-emerald-400/40
                            hover:bg-emerald-500/[0.14]
                          "
                        >
                          <Wallet size={14} />
                          Acreditar saldo
                        </button>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

      </main>
    </AdminLayout>
  );
};