"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/MobileMenu";
import { navigationItems } from "@/data/navigation";

const primaryNavigation = [
  ...navigationItems,
  { label: "Đặt lịch", href: "/dat-lich" },
  { label: "Tra cứu", href: "/tra-cuu-lich-hen" },
  { label: "Tài khoản", href: "/khach-hang/login" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.querySelector(item.href))
      .filter((section): section is Element => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.08, 0.2, 0.45] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 transition duration-500 ${
          scrolled
            ? "border-b border-gilded/30 bg-obsidian/82 shadow-xl shadow-black/25 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <a
            href="#home"
            className="font-serif text-2xl font-semibold text-ivory transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Huyền Cảnh
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Điều hướng chính">
            {primaryNavigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeHref === item.href ? "page" : undefined}
                className="py-2 text-sm font-medium text-stone-mist transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/dat-lich"
              className="hidden min-h-11 items-center justify-center rounded-full border border-antique-gold/70 bg-antique-gold/10 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-antique-gold transition hover:bg-antique-gold hover:text-obsidian focus:outline-none focus:ring-2 focus:ring-antique-gold sm:inline-flex"
            >
              Đặt lịch
            </a>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-gilded/45 text-ivory transition hover:border-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold md:hidden"
              aria-label="Mở menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} activeHref={activeHref} onClose={() => setMenuOpen(false)} />
    </>
  );
}
