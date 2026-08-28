import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huyền Cảnh | Tarot và hành trình nội tâm",
  description:
    "Huyền Cảnh là không gian Tarot tiếng Việt dành cho chiêm nghiệm, biểu tượng và hành trình tự nhận thức sâu sắc.",
  openGraph: {
    title: "Huyền Cảnh | Tarot và hành trình nội tâm",
    description:
      "Khám phá Tarot như một tấm gương biểu tượng cho đối thoại nội tâm và chuyển hóa cá nhân.",
    type: "website",
    locale: "vi_VN",
    siteName: "Huyền Cảnh",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${beVietnam.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
