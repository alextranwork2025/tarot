import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { slugifyVietnamese } from "@/lib/blog/slug";
import { buildStoneJarContactHref, buildStoneJarContactMessage } from "@/lib/stones/contact";
import { stoneFormSchema, stoneImageUploadSchema, stoneJarFormSchema } from "@/lib/validations/stones";

const stoneValues = {
  name: "Thach anh hong",
  slug: "thach-anh-hong",
  shortDescription: "Vien da gan voi tinh yeu va su diu dang.",
  content: "Noi dung chi tiet ve loai da phong thuy.",
  benefits: "Can bang cam xuc",
  suitableFor: "Nguoi muon nuoi duong long trac an",
  elements: "Hoa, Tho",
  zodiacSigns: "Kim Nguu, Thien Binh",
  colors: "Hong",
  origin: "Brazil",
  featuredImage: "/stone-images/stones/example.webp",
  gallery: "[]",
  status: "published",
  isFeatured: true,
  seoTitle: "Thach anh hong",
  seoDescription: "Tim hieu ve thach anh hong.",
};

describe("stone CMS validation", () => {
  it("creates URL-friendly slugs from Vietnamese stone names", () => {
    expect(slugifyVietnamese("Thạch anh tóc đỏ")).toBe("thach-anh-toc-do");
  });

  it("validates stone fields and rejects unsafe slugs", () => {
    expect(stoneFormSchema.safeParse(stoneValues).success).toBe(true);
    expect(stoneFormSchema.safeParse({ ...stoneValues, slug: "Slug Khong Hop Le" }).success).toBe(false);
  });

  it("rejects duplicate stones inside one jar", () => {
    const stoneId = "72ee99f4-51f5-45db-aa0b-f73ff20cc6d2";
    const result = stoneJarFormSchema.safeParse({
      ...stoneValues,
      meaning: "Tai loc",
      usage: "Dat tai ban lam viec",
      price: "500000",
      priceLabel: "Lien he",
      contactMessage: "",
      items: JSON.stringify([
        { stoneId, description: "Lop day", quantity: "3 vien", displayOrder: 0 },
        { stoneId, description: "Lop tren", quantity: "2 vien", displayOrder: 1 },
      ]),
    });

    expect(result.success).toBe(false);
  });

  it("limits uploads to supported images no larger than 5 MB", () => {
    expect(stoneImageUploadSchema.safeParse({ mimeType: "image/webp", size: 1024 }).success).toBe(true);
    expect(stoneImageUploadSchema.safeParse({ mimeType: "image/svg+xml", size: 1024 }).success).toBe(false);
    expect(stoneImageUploadSchema.safeParse({ mimeType: "image/png", size: 6 * 1024 * 1024 }).success).toBe(false);
  });
});

describe("stone public behavior and security", () => {
  it("builds a contact link with the jar name and detail path", () => {
    const message = buildStoneJarContactMessage("Loc An", "/lo-da-phong-thuy/loc-an");
    const href = buildStoneJarContactHref("Loc An", "/lo-da-phong-thuy/loc-an");
    expect(message).toContain("Loc An");
    expect(message).toContain("/lo-da-phong-thuy/loc-an");
    expect(decodeURIComponent(href)).toContain("Loc An");
  });

  it("enforces published-only public reads and private image access", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260907074751_add_stones_and_stone_jars.sql"), "utf8");
    expect(migration).toContain("alter table public.stones enable row level security");
    expect(migration).toContain("stone_jar_items_public_select_published");
    expect(migration).toContain("status = 'published'");
    expect(migration).toContain("published_at <= now()");
    expect(migration).toContain("deleted_at is null");
    expect(migration).toContain("'stone-images',\n  'stone-images',\n  false");
    expect(migration).toContain("stone_images_public_select_used");
    expect(migration).not.toContain("stones_staff_delete");
    expect(migration).not.toContain("stone_jars_staff_delete");
  });

  it("replaces jar items atomically through a service-role-only RPC", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260907074751_add_stones_and_stone_jars.sql"), "utf8");
    expect(migration).toContain("constraint stone_jar_items_unique_stone unique (stone_jar_id, stone_id)");
    expect(migration).toContain("create or replace function public.replace_stone_jar_items");
    expect(migration).toContain("revoke all on function public.replace_stone_jar_items(uuid, jsonb) from public, anon, authenticated");
    expect(migration).toContain("grant execute on function public.replace_stone_jar_items(uuid, jsonb) to service_role");
  });
});
