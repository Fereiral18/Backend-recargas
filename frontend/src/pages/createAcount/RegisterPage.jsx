import { motion } from 'framer-motion';
import {
  ArrowRight,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import RegisterForm from '../../components/form/RegisterForm';

export const RegisterPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/20 transition-transform duration-200 group-hover:scale-105">
              <Sparkles
                className="h-5 w-5 text-white"
                strokeWidth={2}
              />
            </div>

            <div>
              <span className="block text-base font-bold tracking-tight text-white sm:text-lg">
                DiamantesFree
              </span>

              <span className="hidden text-[10px] text-slate-500 sm:block">
                Recargas rápidas y seguras
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <ShieldCheck
              className="h-4 w-4 text-emerald-400"
              strokeWidth={1.8}
            />

            <span>Plataforma segura</span>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-8 sm:py-10 lg:py-12">
          <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_460px] lg:gap-20">

            {/* Left */}
            <motion.section
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="hidden lg:block"
            >
              <div className="max-w-xl">

                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-2 text-xs font-medium text-violet-300">
                  <Sparkles
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                  />

                  Únete a nuestra comunidad
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                  Crea tu cuenta y
                  <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    comienza a recargar.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                  Regístrate gratis y disfruta de una experiencia
                  sencilla para gestionar tus recargas, juegos y
                  servicios desde un solo lugar.
                </p>

                {/* Benefits */}
                <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                      <Zap
                        className="h-4 w-4 text-violet-400"
                        strokeWidth={2}
                      />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      Recargas rápidas
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Realiza tus operaciones de forma sencilla.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <ShieldCheck
                        className="h-4 w-4 text-emerald-400"
                        strokeWidth={2}
                      />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      Cuenta segura
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Protegemos tus datos y operaciones.
                    </p>
                  </div>

                </div>

                {/* Gaming decoration */}
                <div className="mt-10 flex items-center gap-3 text-slate-600">
                  <Gamepad2
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />

                  <span className="text-xs">
                    Todo tu mundo gaming, en un solo lugar.
                  </span>
                </div>
              </div>
            </motion.section>

            {/* Register */}
            <motion.section
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.55,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">

                {/* Heading */}
                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-violet-500/20">
                    <Sparkles
                      className="h-5 w-5 text-violet-400"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    ¡Regístrate en segundos!
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Crea tu cuenta y comienza a disfrutar de
                    nuestras recargas.
                  </p>
                </div>

                {/* Form */}
                <RegisterForm />

                {/* Terms */}
                <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.025] p-3.5">
                  <p className="text-center text-[11px] leading-5 text-slate-500">
                    Al registrarte aceptas nuestras{' '}
                    <a
                      href="#"
                      className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                    >
                      condiciones de servicio
                    </a>{' '}
                    y nuestra{' '}
                    <a
                      href="#"
                      className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                    >
                      política de privacidad
                    </a>
                    .
                  </p>
                </div>

                {/* Login */}
                <div className="mt-6 border-t border-white/10 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    ¿Ya estás recargando con nosotros?{' '}
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1 font-semibold text-violet-400 transition-colors hover:text-violet-300"
                    >
                      Inicia sesión
                      <ArrowRight
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
                    </Link>
                  </p>
                </div>
              </div>

              {/* Mobile security */}
              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600 sm:hidden">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-emerald-500"
                />

                <span>
                  Tus datos están protegidos
                </span>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-2 text-center">
          <p className="mx-auto max-w-2xl text-[10px] leading-5 text-slate-600">
            Al utilizar DiamantesFree aceptas nuestras políticas
            y condiciones de servicio.
          </p>
        </footer>
      </div>
    </main>
  );
};

