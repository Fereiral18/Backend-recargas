import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, authService } from '../../services';
import { toast } from 'react-toastify';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { ResellerLayout } from '../../components/layouts/ResellerLayout';

import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  CheckCircle2,
  Edit3,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';

interface Profile {
  uuid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  balance?: number | string;
  status?: string;
  created_at?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const ProfilePage = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser?.role === 'admin';
  const isReseller = currentUser?.role === 'reseller';

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();

      const data = response.data;

      setProfile(data);

      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userService.updateProfile(formData);

      toast.success('Perfil actualizado exitosamente');

      setIsEditing(false);

      await loadProfile();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleLogout = () => {
    authService.logout();

    toast.info('Sesión cerrada');

    navigate('/login');
  };

  const getInitials = () => {
    const firstName = profile?.first_name?.charAt(0) || '';
    const lastName = profile?.last_name?.charAt(0) || '';

    return `${firstName}${lastName}`.toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    if (profile?.role === 'admin') return 'Administrador';
    if (profile?.role === 'reseller') return 'Revendedor';
    return 'Usuario';
  };

  const getStatusLabel = () => {
    if (profile?.status?.toLowerCase() === 'active') {
      return 'Activo';
    }

    return profile?.status || 'Desconocido';
  };

  const formatBalance = () => {
    return Number(profile?.balance || 0).toFixed(2);
  };

  const formatDate = () => {
    if (!profile?.created_at) {
      return '-';
    }

    return new Date(profile.created_at).toLocaleDateString(
      'es-ES',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
          </div>

          <p className="text-sm font-medium text-slate-400">
            Cargando tu perfil...
          </p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                <UserRound
                  size={23}
                  className="text-white"
                />
              </div>

              <div>
                <span className="mb-1 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                  Cuenta
                </span>

                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Mi Perfil
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Administra tu información personal y cuenta.
                </p>
              </div>
            </div>

            {!isAdmin && !isReseller && (
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
                Volver al Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Profile hero */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/20 backdrop-blur-xl">
          {/* Cover */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.15),transparent_35%)]" />

            <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/5" />

            <div className="absolute -right-20 -top-10 h-48 w-48 rounded-full border border-white/5" />
          </div>

          <div className="relative px-5 pb-6 sm:px-7">
            {/* Avatar */}
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-slate-950 bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-violet-900/30 sm:h-28 sm:w-28 sm:text-3xl">
                  {getInitials()}
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {profile?.first_name} {profile?.last_name}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                      <Mail size={14} />
                      {profile?.email}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 ring-1 ring-inset ring-violet-400/20">
                      <ShieldCheck size={13} />
                      {getRoleLabel()}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                      <CheckCircle2 size={13} />
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="
                    inline-flex
                    min-h-11
                    w-full
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
                    sm:w-auto
                  "
                >
                  <Edit3 size={17} />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Balance highlight */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-5 backdrop-blur-xl sm:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Wallet size={19} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Balance
              </span>
            </div>

            <p className="text-3xl font-black tracking-tight text-white">
              ${formatBalance()}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Saldo disponible
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays size={19} />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Miembro desde
            </p>

            <p className="mt-1 text-sm font-bold capitalize text-white">
              {formatDate()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={19} />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Estado de cuenta
            </p>

            <p className="mt-1 text-sm font-bold text-emerald-400">
              {getStatusLabel()}
            </p>
          </div>
        </div>

        {/* Main information */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300">
                <User size={19} />
              </div>

              <div>
                <h2 className="text-base font-bold text-white">
                  Información personal
                </h2>

                <p className="text-xs text-slate-500">
                  Datos asociados a tu cuenta.
                </p>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <>
              {/* Details */}
              <div className="divide-y divide-white/5">
                <div className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-7">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <User size={14} />
                    Nombre
                  </div>

                  <p className="break-words text-sm font-semibold text-white">
                    {profile?.first_name || 'No especificado'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-7">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <User size={14} />
                    Apellido
                  </div>

                  <p className="break-words text-sm font-semibold text-white">
                    {profile?.last_name || 'No especificado'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-7">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <AtSign size={14} />
                    Email
                  </div>

                  <p className="break-all text-sm font-semibold text-white">
                    {profile?.email || 'No especificado'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-7">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Phone size={14} />
                    Teléfono
                  </div>

                  <p className="break-words text-sm font-semibold text-white">
                    {profile?.phone || 'No especificado'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-7">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Wallet size={14} />
                    Balance
                  </div>

                  <p className="text-sm font-black text-violet-400">
                    ${formatBalance()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-white/10 bg-black/10 px-5 py-5 sm:flex-row sm:justify-between sm:px-7">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-violet-500/20
                    bg-violet-500/10
                    px-5
                    text-sm
                    font-bold
                    text-violet-300
                    transition
                    hover:bg-violet-500/15
                    hover:text-violet-200
                  "
                >
                  <Edit3 size={17} />
                  Editar información
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/5
                    px-5
                    text-sm
                    font-bold
                    text-red-400
                    transition
                    hover:border-red-500/30
                    hover:bg-red-500/10
                    hover:text-red-300
                  "
                >
                  <LogOut size={17} />
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* First name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Nombre
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        py-3
                        pl-11
                        pr-4
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
                </div>

                {/* Last name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Apellido
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        py-3
                        pl-11
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition
                        focus:border-violet-500/60
                        focus:bg-slate-950
                        focus:ring-4
                        focus:ring-violet-500/10
                      "
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        py-3
                        pl-11
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition
                        focus:border-violet-500/60
                        focus:bg-slate-950
                        focus:ring-4
                        focus:ring-violet-500/10
                      "
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Teléfono
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Ej: +54 11 1234 5678"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-slate-950/60
                        py-3
                        pl-11
                        pr-4
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
                    />
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
                  <Save size={17} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );

  if (isAdmin) {
    return <AdminLayout>{content}</AdminLayout>;
  }

  if (isReseller) {
    return <ResellerLayout>{content}</ResellerLayout>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {content}
    </div>
  );
};