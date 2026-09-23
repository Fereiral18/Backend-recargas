
'use client';

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

import useLogin from '../../Hooks/use-login';
import { AuthContext } from '../../core/AuthContext/authContext';

export default function LoginForm() {
  const { email, password, isLoading, onChange, handleLogin } = useLogin();

  const navigate = useNavigate();
  const { setUserInfo } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await handleLogin();

    if (result.success) {
      setUserInfo(result.user);

      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.user?.role === 'reseller') {
        navigate('/reseller');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 sm:h-96 sm:w-96" />

        <div className="absolute -bottom-32 -right-32 h-72 w-72 sm:h-96 sm:w-96" />

        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="mb-7 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              type: 'spring',
              stiffness: 180,
            }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/25"
          >
            <Sparkles className="h-8 w-8 text-white" strokeWidth={2.2} />
          </motion.div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Bienvenido de nuevo
          </h1>

          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400 sm:text-base">
            Ingresa a tu cuenta y continúa disfrutando de tus recargas.
          </p>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Correo electrónico
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail
                    className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-violet-400"
                    strokeWidth={1.8}
                  />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={onChange}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/60 pl-12 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-white/20 focus:border-violet-500/60 focus:bg-slate-900/80 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Contraseña
                </label>

                <Link
                  to="/password-reset"
                  className="text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockKeyhole
                    className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-violet-400"
                    strokeWidth={1.8}
                  />
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={onChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/60 pl-12 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-white/20 focus:border-violet-500/60 focus:bg-slate-900/80 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-slate-300 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.8} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : undefined}
              whileTap={!isLoading ? { scale: 0.98 } : undefined}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg"
            >
              {/* Button shine */}
              {!isLoading && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}

              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* Security message */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3.5">
            <div className="mt-0.5 shrink-0">
              <ShieldCheck
                className="h-4 w-4 text-emerald-400"
                strokeWidth={2}
              />
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Tus datos están protegidos. Nunca compartiremos tu información
              personal con terceros.
            </p>
          </div>
        </motion.div>

        {/* Register */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-slate-500">
            ¿Todavía no tienes una cuenta?{' '}
            <Link
              to="/create"
              className="font-semibold text-violet-400 transition-colors hover:text-violet-300"
            >
              Crear cuenta
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-slate-600">
          Acceso seguro · Tu información está protegida
        </p>
      </motion.div>
    </div>
  );
}

