/**
 * src/components/ui/Card.tsx
 * ─────────────────────────────────────────────────────────────
 * Komponen Card yang fleksibel dengan sub-komponen:
 *   Card, Card.Header, Card.Body, Card.Footer
 * ─────────────────────────────────────────────────────────────
 */

import React from "react";

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  /** Tambahkan shadow lebih besar untuk card yang ditonjolkan */
  elevated?: boolean;
}

/** Root Card */
export function Card({ children, className = "", elevated = false }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-2xl border border-gray-100",
        elevated ? "shadow-lg" : "shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Card.Header — judul & subtitle */
Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["px-5 pt-5 pb-3 border-b border-gray-100", className].join(" ")}>
      {children}
    </div>
  );
};

/** Card.Body — konten utama */
Card.Body = function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["px-5 py-4", className].join(" ")}>
      {children}
    </div>
  );
};

/** Card.Footer — aksi atau informasi tambahan */
Card.Footer = function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["px-5 pb-5 pt-3 border-t border-gray-100", className].join(" ")}>
      {children}
    </div>
  );
};
