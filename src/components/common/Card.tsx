import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
      rounded-3xl
      border
      border-white/10
     bg-[#111827]/70
      backdrop-blur-xl
      shadow-2xl
      transition-all
      duration-300
      hover:border-violet-500/60
      hover:shadow-violet-500/20
      hover:-translate-y-1
      ${className}
    `}
    >
      {children}
    </div>
  );
}