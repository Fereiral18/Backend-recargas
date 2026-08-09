
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Config } from './fromType';

export default function Input({
  labelId,
  type,
  value,
  onChange,
  children,
  link,
  required = false,
  placeholder,
}: Config) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  const inputType =
    isPassword && showPassword
      ? 'text'
      : type;

  const getIcon = () => {
    switch (labelId) {
      case 'name_completed':
      case 'name':
        return <User className="h-5 w-5" strokeWidth={1.8} />;

      case 'email':
        return <Mail className="h-5 w-5" strokeWidth={1.8} />;

      case 'password':
        return <LockKeyhole className="h-5 w-5" strokeWidth={1.8} />;

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {/* Label + link */}
      {(children || link) && (
        <div className="mb-2 flex items-center justify-between gap-3">
          {children && (
            <label
              htmlFor={labelId}
              className="text-sm font-medium text-slate-200"
            >
              {children}
            </label>
          )}

          {link && (
            <Link
              to={link.linkUrl}
              className="shrink-0 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              {link.linkText}
            </Link>
          )}
        </div>
      )}

      {/* Input */}
      <div className="group relative">
        {/* Left icon */}
        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            flex
            w-12
            items-center
            justify-center
            text-slate-500
            transition-colors
            duration-200
            group-focus-within:text-violet-400
          "
        >
          {getIcon()}
        </div>

        <input
          id={labelId}
          name={labelId}
          type={inputType}
          onChange={onChange}
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete={
            labelId === 'email'
              ? 'email'
              : labelId === 'password'
                ? 'current-password'
                : 'name'
          }
          className="
            h-12
            w-full
            rounded-xl
            border
            border-white/10
            bg-slate-900/60
            pl-12
            pr-4
            text-sm
            text-white
            outline-none
            transition-all
            duration-200

            placeholder:text-slate-600

            hover:border-white/20

            focus:border-violet-500/60
            focus:bg-slate-900/80
            focus:ring-4
            focus:ring-violet-500/10
          "
        />

        {/* Password visibility */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
            className="
              absolute
              inset-y-0
              right-0
              flex
              w-12
              items-center
              justify-center
              text-slate-500
              transition-colors
              hover:text-slate-300
            "
          >
            {showPassword ? (
              <EyeOff
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            ) : (
              <Eye
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
