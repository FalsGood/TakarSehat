/**
 * src/components/ui/Input.tsx
 * ─────────────────────────────────────────────────────────────
 * Komponen Input yang digunakan di form registrasi, login,
 * dan form lainnya di seluruh aplikasi.
 * ─────────────────────────────────────────────────────────────
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;    // Pesan error validasi (dari Zod atau server)
  hint?:     string;    // Pesan bantuan opsional
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input field */}
      <input
        id={inputId}
        className={[
          "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white",
          "border rounded-xl outline-none transition-colors duration-150",
          "placeholder:text-gray-400",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />

      {/* Pesan error */}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}

      {/* Pesan bantuan */}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
