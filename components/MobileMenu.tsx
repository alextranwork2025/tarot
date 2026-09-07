"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown, LogIn, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { siteSignOutAction } from "@/lib/actions/auth";
import type { HeaderViewer } from "@/types/header";

export type SiteNavigationItem = {
  label: string;
  href?: string;
  match: string[];
  anchorId?: string;
  children?: Array<{ label: string; href: string }>;
};

type MobileMenuProps = {
  open: boolean;
  activeHref: string;
  navItems: SiteNavigationItem[];
  viewer: HeaderViewer;
  bookingActive: boolean;
  onClose: () => void;
};

const customerLinks = [
  { label: "Lịch hẹn của tôi", href: "/khach-hang" },
  { label: "Thông tin cá nhân", href: "/khach-hang/ho-so" },
  { label: "Đổi mật khẩu", href: "/khach-hang/doi-mat-khau" },
];

export function MobileMenu({
  open,
  activeHref,
  navItems,
  viewer,
  bookingActive,
  onClose,
}: MobileMenuProps) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const closeMenu = useCallback(() => {
    setExpandedItem(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-label="Đóng menu điều hướng"
            onClick={closeMenu}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            id="site-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed right-0 top-0 z-50 flex h-dvh w-[min(88vw,380px)] flex-col overflow-y-auto border-l border-gilded/40 bg-obsidian/96 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl lg:hidden"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="font-serif text-2xl text-ivory" onClick={closeMenu}>
                Huyền Cảnh
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                className="grid size-11 place-items-center rounded-full border border-gilded/45 text-ivory transition hover:border-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
                aria-label="Đóng menu"
                onClick={closeMenu}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-2" aria-label="Điều hướng di động">
              {navItems.map((item) => {
                const itemActive = item.match.some((route) => activeHref === route || activeHref.startsWith(`${route}/`));
                if (item.children) {
                  const expanded = expandedItem === item.label;
                  const submenuId = item.label === "Sản phẩm" ? "mobile-products-menu" : "mobile-articles-menu";
                  return (
                    <div key={item.label} className="border-b border-gilded/20">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-haspopup="true"
                        aria-controls={submenuId}
                        aria-current={itemActive ? "page" : undefined}
                        onClick={() => setExpandedItem(expanded ? null : item.label)}
                        className="flex min-h-14 w-full items-center justify-between rounded-sm px-1 py-4 text-left text-lg text-stone-mist transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
                      >
                        {item.label}
                        <ChevronDown className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} size={18} aria-hidden="true" />
                      </button>
                      {expanded ? (
                        <div id={submenuId} className="grid gap-1 pb-3 pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMenu}
                              aria-current={activeHref === child.href || activeHref.startsWith(`${child.href}/`) ? "page" : undefined}
                              className="rounded-sm px-3 py-3 text-base text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (!item.href) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    className="rounded-sm border-b border-gilded/20 px-1 py-4 text-lg text-stone-mist transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto grid gap-5 pt-8">
              <Link
                href="/dat-lich"
                onClick={closeMenu}
                aria-current={bookingActive ? "page" : undefined}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-antique-gold bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.14em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory"
              >
                <CalendarDays size={17} aria-hidden="true" />
                Đặt lịch
              </Link>
              <div className="border-t border-gilded/25 pt-5">
                <MobileAccount viewer={viewer} onClose={closeMenu} />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function MobileAccount({
  viewer,
  onClose,
}: {
  viewer: HeaderViewer;
  onClose: () => void;
}) {
  if (viewer.kind === "guest") {
    return (
      <Link
        href="/khach-hang/login"
        onClick={onClose}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-gilded/50 px-4 text-base font-semibold text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
      >
        <LogIn size={18} aria-hidden="true" />
        Đăng nhập
      </Link>
    );
  }

  if (viewer.kind === "staff") {
    return (
      <div className="space-y-3">
        <Link
          href="/admin"
          onClick={onClose}
          className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-ivory transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
        >
          <ShieldCheck size={18} aria-hidden="true" />
          Quản trị
        </Link>
        <form action={siteSignOutAction}>
          <button
            type="submit"
            className="block min-h-11 text-base font-semibold text-stone-mist transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-antique-gold">{viewer.name}</p>
      <div className="flex flex-col gap-1">
        {customerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-sm py-2 text-base text-stone-mist transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            {link.label}
          </Link>
        ))}
        <form action={siteSignOutAction} className="pt-1">
          <button
            type="submit"
            className="block min-h-11 text-base font-semibold text-stone-mist transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}
