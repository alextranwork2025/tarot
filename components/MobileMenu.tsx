"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { MouseEvent } from "react";

import { navigationItems } from "@/data/navigation";

const mobileNavigation = [
  ...navigationItems,
  { label: "Blog", href: "/blog" },
  { label: "Đặt lịch", href: "/dat-lich" },
  { label: "Tra cứu", href: "/tra-cuu-lich-hen" },
  { label: "Tài khoản", href: "/khach-hang/login" },
];

type MobileMenuProps = {
  open: boolean;
  activeHref: string;
  onClose: () => void;
};

export function MobileMenu({ open, activeHref, onClose }: MobileMenuProps) {
  const reduceMotion = useReducedMotion();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.blur();
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-label="Đóng menu"
            onClick={onClose}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[min(88vw,360px)] flex-col border-l border-gilded/40 bg-obsidian/95 p-6 shadow-2xl shadow-black/50 md:hidden"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <a href="#home" className="font-serif text-2xl text-ivory" onClick={handleClick}>
                Huyền Cảnh
              </a>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-gilded/45 text-ivory transition hover:border-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
                aria-label="Đóng menu"
                onClick={onClose}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-12 flex flex-col gap-3" aria-label="Điều hướng di động">
              {mobileNavigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleClick}
                  aria-current={activeHref === item.href ? "page" : undefined}
                  className="rounded-sm border-b border-gilded/20 px-1 py-4 text-lg text-stone-mist transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href="/dat-lich"
              onClick={handleClick}
              className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full border border-antique-gold bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.16em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory"
            >
              Đặt lịch
            </a>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
