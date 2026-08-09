import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Trophy,
  Headphones,
  CreditCard,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  Clock3,
  Users,
  ChevronRight,
  Star,
  CircleDollarSign,
  BadgeCheck,
  Flame,
  Crown,
  WalletCards,
} from "lucide-react";

interface Game {
  name: string;
  subtitle: string;
  image: string;
  color: string;
  href: string;
  badge?: string;
}

const games: Game[] = [
  {
    name: "Free Fire",
    subtitle: "Diamantes",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85",
    color: "from-orange-500/80 via-red-500/30 to-transparent",
    href: "/recharges/free-fire",
    badge: "POPULAR",
  },
  {
    name: "Mobile Legends",
    subtitle: "Diamantes",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85",
    color: "from-blue-500/80 via-purple-500/30 to-transparent",
    href: "/recharges/mobile-legends",
    badge: "HOT",
  },
  {
    name: "PUBG Mobile",
    subtitle: "UC",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85",
    color: "from-yellow-500/80 via-orange-500/30 to-transparent",
    href: "/recharges/pubg-mobile",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Entrega instantánea",
    description:
      "Tus diamantes y créditos llegan automáticamente después del pago.",
    color: "cyan",
  },
  {
    icon: ShieldCheck,
    title: "Compra protegida",
    description:
      "Tus datos y pagos están protegidos con tecnología segura.",
    color: "green",
  },
  {
    icon: WalletCards,
    title: "Pagos simples",
    description:
      "Paga rápidamente utilizando tu método de pago favorito.",
    color: "purple",
  },
  {
    icon: Headphones,
    title: "Soporte siempre",
    description:
      "Estamos disponibles para ayudarte cuando tengas cualquier duda.",
    color: "orange",
  },
];

const steps = [
  {
    number: "01",
    title: "Elige tu juego",
    description:
      "Selecciona el juego que quieres recargar desde nuestra plataforma.",
    icon: Gamepad2,
  },
  {
    number: "02",
    title: "Selecciona tu paquete",
    description:
      "Elige la cantidad de diamantes, monedas o créditos que necesitas.",
    icon: CircleDollarSign,
  },
  {
    number: "03",
    title: "Realiza el pago",
    description:
      "Completa tu pago y recibe la recarga directamente en tu cuenta.",
    icon: CheckCircle2,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

export const Home = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#03050d] text-white">


{/* ========================================================= */}
{/* HERO */}
{/* ========================================================= */}

<section className="relative isolate overflow-hidden bg-[#03050d]">

  {/* ======================================================= */}
  {/* BACKGROUND */}
  {/* ======================================================= */}

  <div className="pointer-events-none absolute inset-0 -z-20">

    {/* Base */}

    <div className="absolute inset-0 bg-[#03050d]" />

    {/* Cyan glow */}

    <div
      className="
        absolute
        -left-[180px]
        -top-[180px]
        h-[500px]
        w-[500px]
        rounded-full
        bg-cyan-500/20
        blur-[130px]
      "
    />

    {/* Purple glow */}

    <div
      className="
        absolute
        -right-[180px]
        top-[80px]
        h-[500px]
        w-[500px]
        rounded-full
        bg-purple-600/20
        blur-[130px]
      "
    />

    {/* Bottom glow */}

    <div
      className="
        absolute
        -bottom-[300px]
        left-1/2
        h-[500px]
        w-[500px]
        -translate-x-1/2
        rounded-full
        bg-blue-600/10
        blur-[130px]
      "
    />

    {/* Grid */}

    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "55px 55px",
      }}
    />

  </div>

  {/* ======================================================= */}
  {/* MAIN CONTAINER */}
  {/* ======================================================= */}

  <div
    className="
      relative
      mx-auto
      flex
      w-full
      max-w-7xl
      flex-col
      gap-16
      px-5
      py-20
      sm:px-6
      sm:py-24
      lg:min-h-[760px]
      lg:flex-row
      lg:items-center
      lg:gap-12
      lg:px-8
      lg:py-24
      xl:gap-16
    "
  >

    {/* ===================================================== */}
    {/* LEFT CONTENT */}
    {/* ===================================================== */}

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="
        relative
        z-10
        w-full
        min-w-0
        lg:w-[52%]
        lg:max-w-[680px]
      "
    >

      {/* Badge */}

      <motion.div
        variants={itemVariants}
        className="
          mb-7
          inline-flex
          max-w-full
          items-center
          gap-2
          rounded-full
          border
          border-cyan-400/20
          bg-cyan-400/[0.08]
          px-4
          py-2
          text-xs
          font-semibold
          text-cyan-300
          shadow-[0_0_30px_rgba(34,211,238,0.08)]
          backdrop-blur-xl
          sm:text-sm
        "
      >

        <span className="relative flex h-2 w-2 shrink-0">

          <span
            className="
              absolute
              inline-flex
              h-full
              w-full
              animate-ping
              rounded-full
              bg-cyan-400
              opacity-75
            "
          />

          <span
            className="
              relative
              inline-flex
              h-2
              w-2
              rounded-full
              bg-cyan-400
            "
          />

        </span>

        <span className="truncate">
          Recargas rápidas · Seguras · Instantáneas
        </span>

      </motion.div>

      {/* Heading */}

      <motion.h1
        variants={itemVariants}
        className="
          max-w-[700px]
          text-5xl
          font-black
          leading-[0.96]
          tracking-[-0.045em]
          sm:text-6xl
          lg:text-7xl
          xl:text-[80px]
        "
      >

        Recarga.

        <br />

        <span
          className="
            bg-gradient-to-r
            from-cyan-300
            via-blue-400
            to-purple-500
            bg-clip-text
            text-transparent
          "
        >
          Juega.
        </span>

        <br />

        <span className="text-white">
          Domina.
        </span>

      </motion.h1>

      {/* Description */}

      <motion.p
        variants={itemVariants}
        className="
          mt-7
          max-w-xl
          text-base
          leading-7
          text-slate-400
          sm:text-lg
        "
      >
        Compra diamantes, monedas y créditos para tus juegos
        favoritos en segundos. Sin complicaciones, sin esperas.
      </motion.p>

      {/* =================================================== */}
      {/* CTA */}
      {/* =================================================== */}

      <motion.div
        variants={itemVariants}
        className="
          mt-9
          flex
          w-full
          flex-col
          gap-3
          sm:w-auto
          sm:flex-row
        "
      >

        <Link
          to="/recharges"
          className="
            group
            inline-flex
            min-h-[54px]
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-gradient-to-r
            from-cyan-400
            via-blue-500
            to-purple-500
            px-7
            py-4
            font-black
            text-slate-950
            shadow-[0_10px_40px_rgba(34,211,238,0.18)]
            transition
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_15px_50px_rgba(34,211,238,0.28)]
            sm:w-auto
          "
        >

          <Zap
            size={19}
            fill="currentColor"
          />

          Recargar ahora

          <ArrowRight
            size={19}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />

        </Link>

        <a
          href="#games"
          className="
            group
            inline-flex
            min-h-[54px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-7
            py-4
            font-bold
            text-white
            backdrop-blur-xl
            transition
            duration-300
            hover:-translate-y-1
            hover:border-white/20
            hover:bg-white/[0.08]
            sm:w-auto
          "
        >

          Explorar juegos

          <ChevronRight
            size={18}
            className="
              transition-transform
              group-hover:translate-x-1
            "
          />

        </a>

      </motion.div>

      {/* =================================================== */}
      {/* TRUST */}
      {/* =================================================== */}

      <motion.div
        variants={itemVariants}
        className="
          mt-9
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-3
          text-xs
          text-slate-500
          sm:text-sm
        "
      >

        <div className="flex items-center gap-2">
          <CheckCircle2
            size={16}
            className="shrink-0 text-green-400"
          />
          Pago protegido
        </div>

        <div className="flex items-center gap-2">
          <Zap
            size={16}
            className="shrink-0 text-cyan-400"
          />
          Entrega automática
        </div>

        <div className="flex items-center gap-2">
          <BadgeCheck
            size={16}
            className="shrink-0 text-purple-400"
          />
          100% verificado
        </div>

      </motion.div>

      {/* =================================================== */}
      {/* STATS */}
      {/* =================================================== */}

      <motion.div
        variants={itemVariants}
        className="
          mt-10
          grid
          max-w-xl
          grid-cols-3
          border-t
          border-white/10
          pt-6
        "
      >

        <div className="min-w-0">

          <p className="text-xl font-black sm:text-3xl">
            10K+
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-sm">
            Jugadores
          </p>

        </div>

        <div className="min-w-0 border-l border-white/10 pl-4 sm:pl-6">

          <p className="text-xl font-black sm:text-3xl">
            50K+
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-sm">
            Recargas
          </p>

        </div>

        <div className="min-w-0 border-l border-white/10 pl-4 sm:pl-6">

          <p className="text-xl font-black sm:text-3xl">
            99.9%
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-sm">
            Disponibilidad
          </p>

        </div>

      </motion.div>

    </motion.div>

    {/* ===================================================== */}
    {/* RIGHT VISUAL */}
    {/* ===================================================== */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        x: 40,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
      }}
      transition={{
        duration: 0.9,
        ease: "easeOut",
      }}
      className="
        relative
        z-10
        mx-auto
        w-full
        min-w-0
        max-w-[570px]
        lg:w-[48%]
        lg:max-w-[570px]
      "
    >

      {/* Glow */}

      <div
        className="
          pointer-events-none
          absolute
          inset-8
          rounded-full
          bg-cyan-400/20
          blur-[100px]
        "
      />

      {/* =================================================== */}
      {/* MAIN CARD */}
      {/* =================================================== */}

      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          w-full
          overflow-hidden
          rounded-[1.75rem]
          border
          border-white/10
          bg-white/[0.055]
          p-2
          shadow-[0_30px_100px_rgba(0,0,0,0.45)]
          backdrop-blur-2xl
          sm:rounded-[2rem]
        "
      >

        {/* Image container */}

        <div
          className="
            relative
            w-full
            overflow-hidden
            rounded-[1.4rem]
            sm:rounded-[1.6rem]
          "
        >

          <img
            src="https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=1400&q=90"
            alt="Gaming"
            className="
              block
              h-[390px]
              w-full
              object-cover
              sm:h-[450px]
              lg:h-[500px]
            "
          />

          {/* Image overlay */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#03050d]
              via-[#03050d]/20
              to-transparent
            "
          />

          {/* Image content */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              p-5
              sm:p-7
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-[10px]
                font-black
                tracking-[0.18em]
                text-cyan-300
                sm:text-xs
                sm:tracking-[0.2em]
              "
            >

              <Zap
                size={14}
                fill="currentColor"
              />

              RECARGA INSTANTÁNEA

            </div>

            <h2
              className="
                text-2xl
                font-black
                sm:text-3xl
                lg:text-4xl
              "
            >
              Potencia tu partida.
            </h2>

            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Tus diamantes. Tu juego. Tu momento.
            </p>

          </div>

        </div>

      

      </motion.div>

    </motion.div>

  </div>

</section>



      {/* ========================================================= */}
      {/* GAMES */}
      {/* ========================================================= */}

      <section
        id="games"
        className="relative px-6 py-28 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
          >

            <div>

              <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                <Gamepad2 size={17} />
                Juegos disponibles
              </div>

              <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                Elige tu próximo
                <span className="text-cyan-400"> boost.</span>
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                Encuentra tu juego favorito y consigue tus créditos
                sin perder tiempo.
              </p>

            </div>

            <Link
              to="/recharges"
              className="group flex items-center gap-2 font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              Ver todos
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">

            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-80px",
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >

                <Link
                  to={game.href}
                  className="group relative block overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.035] shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-white/20"
                >

                  <div className="relative h-[390px] overflow-hidden">

                    <img
                      src={game.image}
                      alt={game.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${game.color}`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Badge */}

                    {game.badge && (
                      <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-black tracking-widest text-white backdrop-blur-md">
                        <Flame size={12} className="text-orange-400" />
                        {game.badge}
                      </div>
                    )}

                    {/* Content */}

                    <div className="absolute inset-x-0 bottom-0 p-6">

                      <p className="mb-2 text-xs font-black uppercase tracking-widest text-cyan-300">
                        {game.subtitle}
                      </p>

                      <div className="flex items-end justify-between gap-4">

                        <h3 className="text-3xl font-black tracking-tight">
                          {game.name}
                        </h3>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition duration-300 group-hover:rotate-[-5deg] group-hover:bg-white/20">
                          <ArrowRight size={19} />
                        </div>

                      </div>

                    </div>

                  </div>

                </Link>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* BENEFITS */}
      {/* ========================================================= */}

      <section className="relative border-y border-white/[0.06] bg-white/[0.018] px-6 py-28 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >

            <div className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-purple-400">
              La diferencia
            </div>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Todo lo que necesitas
              <span className="text-cyan-400"> en un solo lugar.</span>
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Diseñamos nuestra plataforma para que recargar sea
              rápido, sencillo y seguro.
            </p>

          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map((benefit, index) => {

              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-xl transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.06]"
                >

                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 transition duration-300 group-hover:scale-110 group-hover:bg-cyan-400/15">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-lg font-black">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>

                </motion.div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS */}
      {/* ========================================================= */}

      <section className="relative px-6 py-28 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Steps */}

            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
            >

              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                Cómo funciona
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                De cero a
                <span className="text-purple-400"> recargado.</span>
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-slate-400">
                Tres pasos. Sin procesos complicados. Sin esperas
                innecesarias.
              </p>

              <div className="mt-10 space-y-4">

                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="group flex gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                        <Icon size={21} />
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center gap-3">

                          <span className="text-xs font-black text-slate-600">
                            {step.number}
                          </span>

                          <h3 className="font-black">
                            {step.title}
                          </h3>

                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </motion.div>

            {/* Dashboard */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              className="relative"
            >

              <div className="absolute inset-10 rounded-full bg-purple-500/15 blur-[100px]" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080d1b] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-7">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-white/10 pb-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10">
                      <Gamepad2
                        size={19}
                        className="text-orange-400"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-600">
                        Última recarga
                      </p>

                      <h3 className="mt-0.5 font-black">
                        Free Fire
                      </h3>
                    </div>

                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-green-400/10 px-3 py-1.5 text-xs font-black text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Completada
                  </div>

                </div>

                {/* Balance */}

                <div className="py-9 text-center">

                  <motion.div
                    animate={{
                      rotate: [0, 4, -4, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 shadow-[0_0_50px_rgba(34,211,238,0.08)]"
                  >
                    <span className="text-5xl">
                      💎
                    </span>
                  </motion.div>

                  <p className="mt-5 text-xs uppercase tracking-widest text-slate-600">
                    Recarga realizada
                  </p>

                  <p className="mt-2 text-5xl font-black tracking-tight">
                    5,600
                  </p>

                  <p className="mt-1 font-bold text-cyan-400">
                    Diamantes
                  </p>

                </div>

                {/* Stats */}

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.035] p-5">

                    <Clock3
                      size={18}
                      className="text-cyan-400"
                    />

                    <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-600">
                      Tiempo
                    </p>

                    <p className="mt-1 font-black">
                      12 segundos
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.035] p-5">

                    <ShieldCheck
                      size={18}
                      className="text-green-400"
                    />

                    <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-600">
                      Seguridad
                    </p>

                    <p className="mt-1 font-black">
                      Protegida
                    </p>

                  </div>

                </div>

                {/* Progress */}

                <div className="mt-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-xs text-slate-500">
                      Estado de la recarga
                    </span>

                    <span className="text-xs font-bold text-green-400">
                      100%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: "100%",
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.4,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400"
                    />

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* TOURNAMENTS */}
      {/* ========================================================= */}

      <section
        id="tournaments"
        className="relative overflow-hidden px-6 py-28 lg:px-8"
      >

        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-500/10" />

        <div className="relative mx-auto max-w-7xl">

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090e1d] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-12 lg:p-14"
          >

            {/* Decorative glow */}

            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-purple-500/20 blur-[100px]" />

            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">

              <div>

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/10 bg-yellow-400/10 px-4 py-2 text-xs font-black tracking-widest text-yellow-400">
                  <Trophy size={15} />
                  TORNEOS SEMANALES
                </div>

                <h2 className="text-4xl font-black leading-[1.05] sm:text-5xl">
                  Juega.
                  <br />
                  Compite.
                  <br />
                  <span className="text-yellow-400">
                    Gana premios.
                  </span>
                </h2>

                <p className="mt-5 max-w-lg leading-7 text-slate-400">
                  Participa en nuestros torneos y compite contra
                  otros jugadores. Los mejores se llevan premios
                  exclusivos.
                </p>

                <Link
                  to="/tournaments"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-black text-slate-950 transition hover:-translate-y-1 hover:bg-yellow-50"
                >
                  Ver torneos
                  <ArrowRight size={18} />
                </Link>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center backdrop-blur-xl">

                  <Trophy
                    className="mx-auto text-yellow-400"
                    size={30}
                  />

                  <p className="mt-4 text-3xl font-black">
                    100+
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Torneos realizados
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center backdrop-blur-xl">

                  <Users
                    className="mx-auto text-cyan-400"
                    size={30}
                  />

                  <p className="mt-4 text-3xl font-black">
                    5K+
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Jugadores
                  </p>

                </div>

                <div className="col-span-2 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.04] p-6 text-center">

                  <div className="flex items-center justify-center gap-2 text-xs font-black tracking-widest text-slate-500">
                    <Star
                      size={14}
                      className="text-yellow-400"
                      fill="currentColor"
                    />
                    PREMIOS ENTREGADOS
                  </div>

                  <p className="mt-2 text-4xl font-black text-yellow-400">
                    +$10,000
                  </p>

                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* CTA */}
      {/* ========================================================= */}

      <section className="px-6 py-28 lg:px-8">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.08] via-blue-500/[0.06] to-purple-500/[0.08] p-10 text-center shadow-[0_30px_100px_rgba(34,211,238,0.05)] sm:p-16"
        >

          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
              <Sparkles size={25} />
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              ¿Listo para subir de nivel?
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
              Haz tu primera recarga y consigue los créditos que
              necesitas para seguir jugando.
            </p>

            <Link
              to="/recharges"
              className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-400/30"
            >
              Empezar ahora

              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

        </motion.div>

      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-white/[0.06] bg-[#02040a] px-6 py-14 lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">

          {/* Brand */}

          <div className="md:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/10">
                <Gamepad2
                  size={22}
                  className="text-slate-950"
                />
              </div>

              <span className="text-xl font-black tracking-tight">
                RECARGAS
              </span>

            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              Tu plataforma para conseguir diamantes, monedas y
              créditos para tus juegos favoritos de forma rápida,
              segura y automática.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-500">
                <ShieldCheck
                  size={14}
                  className="text-green-400"
                />
                Compra segura
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-500">
                <Zap
                  size={14}
                  className="text-cyan-400"
                />
                Entrega rápida
              </div>

            </div>

          </div>

          {/* Platform */}

          <div>

            <h3 className="font-black">
              Plataforma
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-500">

              <Link
                to="/recharges"
                className="block transition hover:text-cyan-400"
              >
                Recargas
              </Link>

              <Link
                to="/tournaments"
                className="block transition hover:text-cyan-400"
              >
                Torneos
              </Link>

              <Link
                to="/support"
                className="block transition hover:text-cyan-400"
              >
                Soporte
              </Link>

            </div>

          </div>

          {/* Security */}

          <div>

            <h3 className="font-black">
              Seguridad
            </h3>

            <div className="mt-5 space-y-4 text-sm text-slate-500">

              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-green-400"
                />
                Pagos seguros
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-400"
                />
                Recargas verificadas
              </div>

              <div className="flex items-center gap-2">
                <Headphones
                  size={17}
                  className="text-purple-400"
                />
                Soporte disponible
              </div>

            </div>

          </div>

        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/[0.06] pt-7 text-center text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <p>
            © 2026 Recargas. Todos los derechos reservados.
          </p>

          <div className="flex justify-center gap-5 sm:justify-end">
            <span className="cursor-pointer transition hover:text-slate-400">
              Privacidad
            </span>

            <span className="cursor-pointer transition hover:text-slate-400">
              Términos
            </span>
          </div>

        </div>

      </footer>

    </main>
  );
};