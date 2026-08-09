import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import LoginForm from '../../components/form/LoginForm';

export const Login = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl" />
      </div>

      {/* Grid background */}
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
            <span>Acceso seguro</span>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-10 lg:py-12">
          <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_460px] lg:gap-20">
            {/* Left content */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="hidden lg:block"
            >
              <div className="max-w-xl">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-2 text-xs font-medium text-violet-300">
                  <Zap
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                  />

                  Recargas rápidas
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                  Todo lo que necesitas
                  <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    en un solo lugar.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                  Recarga tus juegos y servicios de forma rápida,
                  sencilla y segura. Administra todo desde una
                  plataforma diseñada para ti.
                </p>

                {/* Benefits */}
                <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                      <Zap className="h-4 w-4 text-violet-400" />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      Instantáneo
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Recargas procesadas rápidamente.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      Seguro
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Protegemos tus datos y operaciones.
                    </p>
                  </div>
                </div>

                {/* Gaming decoration */}
                <div className="mt-10 flex items-center gap-3 text-slate-600">
                  <Gamepad2 className="h-5 w-5" />

                  <span className="text-xs">
                    Tu experiencia gaming comienza aquí.
                  </span>
                </div>
              </div>
            </motion.section>

            {/* Login */}
           <LoginForm />
          </div>
        </div>

        {/* Footer / reCAPTCHA */}
        <footer className="pb-2 text-center">
          <p className="mx-auto max-w-2xl text-[10px] leading-5 text-slate-600">
            Este sitio está protegido por reCAPTCHA y se aplican la{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-400"
            >
              Política de Privacidad
            </a>{' '}
            y los{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-400"
            >
              Términos de Servicio
            </a>{' '}
            de Google.
          </p>
        </footer>
      </div>
    </main>
  );
};