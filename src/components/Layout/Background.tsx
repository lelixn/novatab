import { motion } from "framer-motion";
import Stars from "./Stars";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#070B1D]">

      {/* Purple Glow */}

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
          absolute
          -left-40
          -top-40
          h-[600px]
          w-[600px]
          rounded-full
          bg-violet-600/20
          blur-[180px]
        "
      />

      {/* Blue Glow */}

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-0
          right-0
          h-[650px]
          w-[650px]
          rounded-full
          bg-blue-500/20
          blur-[200px]
        "
      />
    <Stars />
    </div>
  );
}