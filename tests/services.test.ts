import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { slugifyVietnamese } from "@/lib/blog/slug";
import { serviceFormSchema } from "@/lib/validations/services";

describe("service slug and validation", () => {
  it("creates URL-friendly slugs from Vietnamese service names", () => {
    expect(slugifyVietnamese("Tarot Cá Nhân")).toBe("tarot-ca-nhan");
    expect(slugifyVietnamese("Tarot Tình Cảm & Công Việc")).toBe("tarot-tinh-cam-cong-viec");
  });

  it("validates service CMS data, FAQ, and testimonials", () => {
    expect(
      serviceFormSchema.safeParse({
        name: "Tarot cá nhân",
        slug: "tarot-ca-nhan",
        description: "Mô tả dùng ở form đặt lịch",
        shortDescription: "Một mô tả ngắn cho danh sách và SEO.",
        content: "Nội dung chi tiết dịch vụ.",
        coverImageUrl: "/images/abstract-gate.svg",
        suitableFor: "Người cần soi chiếu một câu hỏi cá nhân.",
        benefits: "Rõ câu hỏi\nCó hướng quan sát mới",
        process: "Trao đổi\nTrải bài\nTổng kết",
        preparationNotes: "Chuẩn bị câu hỏi trước buổi xem.",
        faq: JSON.stringify([{ question: "Có cần chuẩn bị gì không?", answer: "Nên chuẩn bị câu hỏi chính." }]),
        testimonials: JSON.stringify([{ customer_name: "A.", content: "Phiên đọc rất rõ ràng.", rating: 5 }]),
        seoTitle: "Tarot cá nhân",
        seoDescription: "Đặt lịch Tarot cá nhân tại Huyền Cảnh.",
        status: "published",
        displayOrder: 1,
        durationMinutes: 60,
        price: 500000,
        isActive: true,
        isFeatured: true,
        deliveryModes: JSON.stringify(["online", "in_person"]),
      }).success,
    ).toBe(true);

    expect(
      serviceFormSchema.safeParse({
        name: "A",
        slug: "Slug Sai",
        status: "published",
        displayOrder: 0,
        durationMinutes: 10,
        price: -1,
        faq: "[]",
        testimonials: JSON.stringify([{ customer_name: "A.", content: "Sai rating.", rating: 6 }]),
        isActive: true,
      }).success,
    ).toBe(false);
  });

  it("sanitizes dangerous service markdown and URLs", () => {
    const sanitized = sanitizeBlogMarkdown('<script>alert(1)</script>\n[bad](javascript:alert(1))');
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("javascript:");
  });
});

describe("service data access and rendering guarantees", () => {
  it("checks duplicate slugs before saving", () => {
    const source = readFileSync(join(process.cwd(), "lib/actions/services.ts"), "utf8");
    expect(source).toContain("ensureUniqueSlug");
    expect(source).toContain(".eq(\"slug\", slug)");
    expect(source).toContain("Slug đã tồn tại");
  });

  it("only exposes published active services publicly", () => {
    const source = readFileSync(join(process.cwd(), "lib/queries/services.ts"), "utf8");
    expect(source).toContain(".eq(\"is_active\", true)");
    expect(source).toContain(".eq(\"status\", \"published\")");
    expect(source).toContain(".lte(\"published_at\", new Date().toISOString())");
    expect(source).toContain(".is(\"deleted_at\", null)");
  });

  it("hides FAQ and testimonials when they have no data", () => {
    const page = readFileSync(join(process.cwd(), "app/dich-vu/[slug]/page.tsx"), "utf8");
    expect(page).toContain("service.testimonials.length ?");
    expect(page).toContain("service.faq.length ?");
  });

  it("preselects valid service ids from the booking query string", () => {
    const bookingPage = readFileSync(join(process.cwd(), "app/dat-lich/page.tsx"), "utf8");
    const bookingForm = readFileSync(join(process.cwd(), "components/booking/BookingForm.tsx"), "utf8");
    expect(bookingPage).toContain("searchParams: Promise<{ service?: string }>");
    expect(bookingPage).toContain("services.some((service) => service.id === params.service)");
    expect(bookingForm).toContain("initialServiceId ?? services[0]?.id");
  });

  it("keeps service writes restricted by RLS and uses soft delete", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260830000000_expand_services_cms.sql"), "utf8");
    expect(migration).toContain("alter table public.services enable row level security");
    expect(migration).toContain("services_public_select_published");
    expect(migration).toContain("status = 'published'");
    expect(migration).toContain("is_active = true");
    expect(migration).toContain("services_staff_insert");
    expect(migration).toContain("services_staff_update");
    expect(migration).toContain("deleted_at is null");
    expect(migration).not.toContain("on public.services\nfor delete");
  });
});
