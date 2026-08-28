import { Mail, MessageCircle, Send } from "lucide-react";
import Link from "next/link";

import { navigationItems } from "@/data/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gilded/30 bg-[#07090d] px-5 py-12 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.6fr]">
        <div>
          <Link href="/" className="font-serif text-3xl font-semibold text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold">
            Huyền Cảnh
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-mist">
            Một không gian Tarot dành cho chiêm nghiệm, biểu tượng và hành trình trở về với nội tâm.
          </p>
        </div>
        <nav className="flex flex-col gap-3" aria-label="Điều hướng chân trang">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-stone-mist transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <div>
          <div className="flex gap-3">
            {[
              { label: "Kênh hình ảnh", icon: Send },
              { label: "Cộng đồng", icon: MessageCircle },
              { label: "Email", icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href="#home" aria-label={item.label} className="grid size-11 place-items-center rounded-full border border-gilded/45 text-stone-mist transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold">
                  <Icon size={18} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-gilded/20 pt-6 text-xs leading-6 text-stone-mist">
        <p>
          Nội dung Tarot chỉ phục vụ mục đích chiêm nghiệm và tham khảo, không thay thế tư vấn y tế, pháp lý hoặc tài chính.
        </p>
        <p className="mt-2">© {year} Huyền Cảnh. All rights reserved.</p>
      </div>
    </footer>
  );
}
