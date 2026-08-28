"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronDown, LogIn, Menu, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { siteSignOutAction } from "@/lib/actions/auth";
import { MobileMenu, type SiteNavigationItem } from "@/components/MobileMenu";
import type { HeaderViewer } from "@/types/header";

const siteNavigation: SiteNavigationItem[] = [
  { label: "Trang chủ", href: "/", match: ["/"] },
  { label: "Dịch vụ", href: "/#readings", anchorId: "readings", match: ["/#readings"] },
  { label: "Bài viết", href: "/blog", match: ["/blog"] },
  { label: "Giới thiệu", href: "/gioi-thieu", match: ["/gioi-thieu"] },
];

const customerLinks = [
  { label: "Lịch hẹn của tôi", href: "/khach-hang" },
  { label: "Thông tin cá nhân", href: "/khach-hang/ho-so" },
  { label: "Đổi mật khẩu", href: "/khach-hang/doi-mat-khau" },
];

function isRouteMatch(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

type SiteHeaderProps = {
  viewer: HeaderViewer;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeMenus = window.setTimeout(() => {
      setMenuOpen(false);
      setAccountOpen(false);
    }, 0);

    return () => window.clearTimeout(closeMenus);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sections = ["home", "readings", "about"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveAnchor(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -58% 0px", threshold: [0.08, 0.2, 0.45] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  const activeHref = useMemo(() => {
    if (pathname === "/") {
      return activeAnchor === "home" ? "/" : `/#${activeAnchor}`;
    }

    const activeItem = siteNavigation.find((item) =>
      item.match.some((route) => route !== "/" && isRouteMatch(pathname, route)),
    );

    return activeItem?.href ?? pathname;
  }, [activeAnchor, pathname]);

  return (
    <>
      <header
        className={`sticky inset-x-0 top-0 z-40 border-b transition duration-300 ${
          scrolled
            ? "border-gilded/35 bg-obsidian/90 shadow-xl shadow-black/20 backdrop-blur-xl"
            : "border-gilded/20 bg-obsidian/78 backdrop-blur-lg"
        }`}
      >
        <div className="mx-auto grid h-18 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 md:h-20 md:px-8 lg:grid-cols-[minmax(170px,1fr)_auto_minmax(220px,1fr)]">
          <Link
            href="/"
            className="justify-self-start font-serif text-2xl font-semibold leading-none text-ivory transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Huyền Cảnh
          </Link>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Điều hướng chính">
            {siteNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activeHref === item.href ? "page" : undefined}
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:bg-antique-gold/12 aria-[current=page]:text-antique-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dat-lich"
              aria-current={pathname.startsWith("/dat-lich") ? "page" : undefined}
              className="hidden min-h-11 items-center justify-center gap-2 rounded-full border border-antique-gold bg-antique-gold px-5 text-xs font-semibold uppercase tracking-[0.14em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory sm:inline-flex"
            >
              <CalendarDays size={16} aria-hidden="true" />
              Đặt lịch
            </Link>

            <div className="hidden md:block" ref={accountRef}>
              <AccountControl
                viewer={viewer}
                open={accountOpen}
                onToggle={() => setAccountOpen((current) => !current)}
                onClose={() => setAccountOpen(false)}
                pathname={pathname}
              />
            </div>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-gilded/45 text-ivory transition hover:border-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold lg:hidden"
              aria-label="Mở menu"
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        activeHref={activeHref}
        navItems={siteNavigation}
        viewer={viewer}
        bookingActive={isRouteMatch(pathname, "/dat-lich")}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

function AccountControl({
  viewer,
  open,
  onToggle,
  onClose,
  pathname,
}: {
  viewer: HeaderViewer;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  pathname: string;
}) {
  if (viewer.kind === "guest") {
    return (
      <Link
        href="/khach-hang/login"
        aria-current={pathname.startsWith("/khach-hang/login") ? "page" : undefined}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gilded/50 px-4 text-sm font-semibold text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
      >
        <LogIn size={16} aria-hidden="true" />
        Đăng nhập
      </Link>
    );
  }

  if (viewer.kind === "staff") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-gilded/50 px-4 text-sm font-semibold text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
        >
          Quản trị
        </Link>
        <form action={siteSignOutAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-gilded/50 px-4 text-sm font-semibold text-stone-mist transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 max-w-[190px] items-center justify-center gap-2 rounded-full border border-gilded/50 px-4 text-sm font-semibold text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="customer-account-menu"
        onClick={onToggle}
      >
        <UserRound size={16} aria-hidden="true" />
        <span className="truncate">{viewer.name}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id="customer-account-menu"
          role="menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-md border border-gilded/35 bg-obsidian/96 p-2 shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          {customerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={onClose}
              className="block rounded-sm px-3 py-2.5 text-sm text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold"
            >
              {link.label}
            </Link>
          ))}
          <form action={siteSignOutAction} className="mt-1 border-t border-gilded/25 pt-1">
            <button
              type="submit"
              role="menuitem"
              className="block w-full rounded-sm px-3 py-2.5 text-left text-sm text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
