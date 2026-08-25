"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { SacredGeometry } from "@/components/SacredGeometry";

type MysticalCardProps = {
  title?: string;
  children?: ReactNode;
  compact?: boolean;
};

export function MysticalCard({
  title = "The Inner Gate",
  children,
  compact = false,
}: MysticalCardProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), {
    stiffness: 120,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-7, 7]), {
    stiffness: 120,
    damping: 22,
  });

  return (
    <motion.div
      className={`group relative mx-auto aspect-[2/3] w-full max-w-[320px] rounded-[28px] border border-antique-gold/70 bg-card-deep p-4 shadow-2xl shadow-black/35 ${
        compact ? "max-w-[260px]" : ""
      }`}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width);
        pointerY.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        pointerX.set(0.5);
        pointerY.set(0.5);
      }}
    >
      <div className="absolute -inset-8 -z-10 rounded-full bg-antique-gold/20 blur-3xl transition group-hover:bg-antique-gold/30" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-gilded/80 bg-[radial-gradient(circle_at_50%_18%,rgba(184,146,79,0.22),transparent_33%),linear-gradient(160deg,rgba(23,75,72,0.5),rgba(23,19,27,0.95)_45%,rgba(113,31,48,0.38))] p-6">
        <div className="absolute inset-4 rounded-[18px] border border-antique-gold/30" />
        <SacredGeometry className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-antique-gold/60" />
        <div className="relative z-10 flex items-center justify-between text-antique-gold">
          <Sparkles size={18} strokeWidth={1.4} aria-hidden="true" />
          <span className="text-xs uppercase tracking-[0.24em]">Huyền Cảnh</span>
        </div>
        <div className="relative z-10 mt-auto text-center">
          <p className="font-serif text-3xl font-semibold leading-tight text-ivory">{title}</p>
          {children ? <div className="mt-5 text-sm leading-7 text-stone-mist">{children}</div> : null}
        </div>
      </div>
    </motion.div>
  );
}
