
import React from 'react';
import { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

import { Config } from './fromType';
import Input from './Input';

interface Props {
  config: Config[];
  isLoading: boolean;
  btnText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function Form({
  config,
  isLoading,
  btnText,
  onChange,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-5"
    >
      {/* Inputs */}
      <div className="space-y-5">
        {config.map((input, index) => (
          <motion.div
            key={input.labelId}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.08,
            }}
          >
            <Input
              labelId={input.labelId}
              labelText={input.labelText}
              type={input.type}
              onChange={onChange}
              value={input.value}
              link={input.link}
              required={input.required}
              placeholder={input.placeholder}
            />
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-white/10" />

        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-medium text-slate-500">
          O
        </span>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.01 } : undefined}
        whileTap={!isLoading ? { scale: 0.98 } : undefined}
        className="
          group
          relative
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2
          overflow-hidden
          rounded-xl
          bg-gradient-to-r
          from-violet-600
          to-indigo-600
          px-5
          text-sm
          font-semibold
          text-white
          shadow-lg
          shadow-violet-600/20
          outline-none
          transition-all
          duration-200

          hover:from-violet-500
          hover:to-indigo-500
          hover:shadow-xl
          hover:shadow-violet-600/25

          focus:ring-4
          focus:ring-violet-500/20

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {/* Shine effect */}
        {!isLoading && (
          <span
            className="
              absolute
              inset-0
              -translate-x-full
              bg-gradient-to-r
              from-transparent
              via-white/10
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-full
            "
          />
        )}

        <span className="relative flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2
                className="h-5 w-5 animate-spin"
                strokeWidth={2}
              />

              <span>
                Procesando...
              </span>
            </>
          ) : (
            <>
              <span>
                {btnText}
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
                strokeWidth={2}
              />
            </>
          )}
        </span>
      </motion.button>
    </form>
  );
}
