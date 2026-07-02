import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface WidgetProps {
  children: ReactNode;
}

export default function Widget({
  children,
}: WidgetProps) {
  return (
    <motion.section
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        flex
        h-full
        flex-col
        rounded-3xl
        border
        border-white/10
        bg-[#121A2F]
        p-6
        shadow-xl
        backdrop-blur-xl
      "
    >
      {children}
    </motion.section>
  );
}