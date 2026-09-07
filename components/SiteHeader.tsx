"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronDown, LogIn, Menu, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { siteSignOutAction } from "@/lib/actions/auth";
import { MobileMenu, type SiteNavigationItem } from "@/components/MobileMenu";
import type { HeaderViewer } from "@/types/header";

const siteNavigation: SiteNavigationItem[] = [
  { label: "Trang chủ", href: "/", match: ["/"] },
  {
    label: "Sản phẩm",
    match: ["/dich-vu", "/hoc-tarot", "/lo-da-phong-thuy"],
    children: [
      { label: "Trải bài", href: "/dich-vu" },
      { label: "Học Tarot", href: "/hoc-tarot" },
      { label: "Đá năng lượng", href: "/lo-da-phong-thuy" },
    ],
  },
  {
    label: "Bài viết",
    match: ["/blog", "/bai-viet/dao-nhan", "/bai-viet/review-bai-tarot", "/da-phong-thuy"],
    children: [
      { label: "Đạo nhân", href: "/bai-viet/dao-nhan" },
      { label: "Review bài Tarot", href: "/bai-viet/review-bai-tarot" },
      { label: "Đá phong thủy", href: "/da-phong-thuy" },
    ],
  },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const dropdownButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
      setOpenDropdown(null);
      setPinnedDropdown(null);
    }, 0);

    return () => window.clearTimeout(closeMenus);
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

  useEffect(() => {
    if (!openDropdown) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setPinnedDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const button = dropdownButtonRefs.current[openDropdown];
        setOpenDropdown(null);
        setPinnedDropdown(null);
        button?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  const activeHref = pathname;
  const closeNavigationDropdown = () => {
    setOpenDropdown(null);
    setPinnedDropdown(null);
  };
  const handleDropdownMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("[role=menuitem]"));
    if (!items.length) return;
    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "Home") items[0].focus();
    else if (event.key === "End") items.at(-1)?.focus();
    else if (event.key === "ArrowDown") items[(currentIndex + 1 + items.length) % items.length].focus();
    else items[(currentIndex - 1 + items.length) % items.length].focus();
  };

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

          <nav ref={navigationRef} className="hidden items-center gap-2 lg:flex" aria-label="Điều hướng chính">
            {siteNavigation.map((item) => {
              if (item.children) {
                const dropdownOpen = openDropdown === item.label;
                const itemActive = item.match.some((route) => isRouteMatch(pathname, route));
                const dropdownId = item.label === "Sản phẩm" ? "desktop-products-menu" : "desktop-articles-menu";
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      if (pinnedDropdown !== item.label) setPinnedDropdown(null);
                      setOpenDropdown(item.label);
                    }}
                    onMouseLeave={() => { if (pinnedDropdown !== item.label) setOpenDropdown(null); }}
                  >
                    <button
                      ref={(button) => { dropdownButtonRefs.current[item.label] = button; }}
                      type="button"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="menu"
                      aria-controls={dropdownId}
                      aria-current={itemActive ? "page" : undefined}
                      onClick={() => {
                        const shouldClose = dropdownOpen && pinnedDropdown === item.label;
                        setOpenDropdown(shouldClose ? null : item.label);
                        setPinnedDropdown(shouldClose ? null : item.label);
                        setAccountOpen(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          const container = event.currentTarget.parentElement;
                          setOpenDropdown(item.label);
                          setPinnedDropdown(item.label);
                          window.requestAnimationFrame(() => container?.querySelector<HTMLAnchorElement>("[role=menuitem]")?.focus());
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:bg-antique-gold/12 aria-[current=page]:text-antique-gold"
                    >
                      {item.label}
                      <ChevronDown className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} size={15} aria-hidden="true" />
                    </button>
                    {dropdownOpen ? (
                      <div className="absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-2">
                        <div id={dropdownId} role="menu" onKeyDown={handleDropdownMenuKeyDown} className="rounded-md border border-gilded/35 bg-obsidian/96 p-2 shadow-2xl shadow-black/35 backdrop-blur-xl">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              role="menuitem"
                              onClick={closeNavigationDropdown}
                              aria-current={isRouteMatch(pathname, child.href) ? "page" : undefined}
                              className="block rounded-sm px-3 py-3 text-sm text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:text-antique-gold"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
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
                  onClick={closeNavigationDropdown}
                  aria-current={activeHref === item.href ? "page" : undefined}
                  className="rounded-full px-4 py-2 text-sm font-medium text-stone-mist transition hover:bg-ivory/5 hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold aria-[current=page]:bg-antique-gold/12 aria-[current=page]:text-antique-gold"
                >
                  {item.label}
                </Link>
              );
            })}
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
                onToggle={() => { closeNavigationDropdown(); setAccountOpen((current) => !current); }}
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
              onClick={() => { closeNavigationDropdown(); setMenuOpen(true); }}
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
