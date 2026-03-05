"use client";

import { motion } from "framer-motion";

interface ReceiptCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function ReceiptCard({ children, index = 0, className = "" }: ReceiptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
