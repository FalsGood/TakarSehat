/**
 * src/components/ui/Button.tsx
 * ─────────────────────────────────────────────────────────────
 * Komponen Button yang dapat digunakan ulang di seluruh aplikasi.
 * Mendukung berbagai varian dan ukuran.
 * ─────────────────────────────────────────────────────────────
 */

import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  isLoading?: boolean;
  children:  React.ReactNode;
}

// Peta kelas Tailwind untuk setiap varian
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus:ring-brand-300",
  secondary:
    "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 focus:ring-teal-300",
  outline:
    "border-2 border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-200",
  ghost:
    "text-brand-600 hover:bg-brand-50 focus:ring-brand-200",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-300",
};

// Peta kelas Tailwind untuk setiap ukuran
const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size    = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {/* Spinner saat loading */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
