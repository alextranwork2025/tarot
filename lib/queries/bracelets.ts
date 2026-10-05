import "server-only";

import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/admin";
import { stoneStatuses } from "@/lib/validations/stones";
import type { Bracelet, BraceletDetail, BraceletStatus, BraceletSummary, SiteContactSettings } from "@/types/bracelets";
import type { StoneSummary } from "@/types/stones";

type Sort = "newest" | "oldest" | "display";
export type BraceletListParams = { q?: string; status?: BraceletStatus | "all"; stoneId?: string; beadSize?: string; sort?: Sort; page?: number; pageSize?: number };

const now = () => new Date().toISOString();
const pageNumber = (page?: number) => page && page > 0 ? Math.floor(page) : 1;
const escapeLike = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");

export function parseBraceletStatus(value?: string): BraceletStatus | "all" {
  return value && stoneStatuses.includes(value as BraceletStatus) ? value as BraceletStatus : "all";
}

export function parseBraceletSort(value?: string): Sort {
  return value === "oldest" || value === "display" ? value : "newest";
}

function applySort<T>(query: T, sort?: Sort): T {
  type Orderable = { order: (column: string, options: { ascending: boolean; nullsFirst?: boolean }) => Orderable };
  const sortable = query as unknown as Orderable;
  if (sort === "oldest") return sortable.order("created_at", { ascending: true }) as unknown as T;
  if (sort === "display") return sortable.order("display_order", { ascending: true }).order("updated_at", { ascending: false }) as unknown as T;
  return sortable.order("updated_at", { ascending: false }) as unknown as T;
}

async function hydrateSummaries(rows: Bracelet[]): Promise<BraceletSummary[]> {
  if (!rows.length) return [];
  const admin = createAdminClient();
  const braceletIds = rows.map((row) => row.id);
  const { data: links } = await admin.from("bracelet_stones").select("bracelet_id,stone_id,display_order").in("bracelet_id", braceletIds).order("display_order");
  const stoneIds = [...new Set((links ?? []).map((item) => item.stone_id))];
  const { data: stones } = stoneIds.length
    ? await admin.from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at").in("id", stoneIds)
    : { data: [] as StoneSummary[] };
  const stoneMap = new Map((stones ?? []).map((stone) => [stone.id, stone as StoneSummary]));
  const byBracelet = new Map<string, StoneSummary[]>();
  for (const link of links ?? []) {
    const stone = stoneMap.get(link.stone_id);
    if (!stone) continue;
    byBracelet.set(link.bracelet_id, [...(byBracelet.get(link.bracelet_id) ?? []), stone]);
  }
  return rows.map((row) => ({ ...row, stones: byBracelet.get(row.id) ?? [] }));
}

async function braceletIdsForStone(stoneId?: string) {
  if (!stoneId) return null;
  const { data } = await createAdminClient().from("bracelet_stones").select("bracelet_id").eq("stone_id", stoneId);
  return (data ?? []).map((item) => item.bracelet_id);
}

export async function getAdminBracelets(params: BraceletListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 20;
  let query = createAdminClient().from("bracelets").select("*", { count: "exact" }).is("deleted_at", null);
  if (params.q?.trim()) { const term = escapeLike(params.q.trim()); query = query.or(`name.ilike.%${term}%,product_code.ilike.%${term}%,slug.ilike.%${term}%`); }
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.beadSize) query = query.contains("bead_sizes_mm", [Number(params.beadSize)] as never);
  const ids = await braceletIdsForStone(params.stoneId);
  if (ids && ids.length === 0) return { bracelets: [] as BraceletSummary[], count: 0, page, pageSize };
  if (ids?.length) query = query.in("id", ids);
  query = applySort(query, params.sort);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(`Không thể tải vòng tay: ${error.message}`);
  return { bracelets: await hydrateSummaries((data ?? []) as Bracelet[]), count: count ?? 0, page, pageSize };
}

export async function getPublishedBracelets(params: BraceletListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 12;
  try {
    let query = createAdminClient().from("bracelets").select("*", { count: "exact" })
      .eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
    if (params.q?.trim()) query = query.ilike("name", `%${escapeLike(params.q.trim())}%`);
    if (params.beadSize) query = query.contains("bead_sizes_mm", [Number(params.beadSize)] as never);
    const ids = await braceletIdsForStone(params.stoneId);
    if (ids && ids.length === 0) return { bracelets: [] as BraceletSummary[], count: 0, page, pageSize };
    if (ids?.length) query = query.in("id", ids);
    const { data, error, count } = await query.order("is_featured", { ascending: false }).order("display_order", { ascending: true }).order("published_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw error;
    return { bracelets: await hydrateSummaries((data ?? []) as Bracelet[]), count: count ?? 0, page, pageSize };
  } catch (error) {
    console.warn("Could not load published bracelets.", error);
    return { bracelets: [] as BraceletSummary[], count: 0, page, pageSize };
  }
}

export async function getAdminBracelet(id: string): Promise<BraceletDetail> {
  const { data, error } = await createAdminClient().from("bracelets").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error || !data) throw new Error(error ? `Không thể tải vòng tay: ${error.message}` : "Không tìm thấy vòng tay.");
  const [detail] = await hydrateSummaries([data as Bracelet]);
  return detail as BraceletDetail;
}

export const getPublishedBraceletBySlug = cache(async (slug: string): Promise<BraceletDetail | null> => {
  const { data } = await createAdminClient().from("bracelets").select("*").eq("slug", slug).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).maybeSingle();
  if (!data) return null;
  const [detail] = await hydrateSummaries([data as Bracelet]);
  return detail as BraceletDetail;
});

export async function getRelatedBracelets(bracelet: BraceletDetail, limit = 3) {
  const stoneIds = bracelet.stones.map((stone) => stone.id);
  if (!stoneIds.length) return [];
  const { data: links } = await createAdminClient().from("bracelet_stones").select("bracelet_id").in("stone_id", stoneIds).neq("bracelet_id", bracelet.id).limit(30);
  const ids = [...new Set((links ?? []).map((item) => item.bracelet_id))].slice(0, limit);
  if (!ids.length) return [];
  const { data } = await createAdminClient().from("bracelets").select("*").in("id", ids).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
  return hydrateSummaries((data ?? []) as Bracelet[]);
}

export async function getBraceletFilterOptions() {
  const [stones, bracelets] = await Promise.all([
    createAdminClient().from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at").is("deleted_at", null).order("name"),
    createAdminClient().from("bracelets").select("bead_sizes_mm").is("deleted_at", null),
  ]);
  const beadSizes = [...new Set((bracelets.data ?? []).flatMap((row) => row.bead_sizes_mm as number[]))].sort((a, b) => a - b);
  return { stones: (stones.data ?? []) as StoneSummary[], beadSizes };
}

export async function getContactSettings(): Promise<SiteContactSettings> {
  const { data, error } = await createAdminClient().from("site_contact_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Không thể tải cấu hình tư vấn: ${error.message}`);
  return data ?? { id: 1, zalo_url: null, facebook_url: null, updated_by: null, updated_at: new Date().toISOString() };
}

export async function getPublishedBraceletSitemapEntries() {
  const { data } = await createAdminClient().from("bracelets").select("slug,updated_at").eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).limit(500);
  return data ?? [];
}
