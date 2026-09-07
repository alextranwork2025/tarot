import "server-only";

import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/admin";
import { stoneStatuses } from "@/lib/validations/stones";
import type { Stone, StoneDetail, StoneJar, StoneJarDetail, StoneJarItemWithStone, StoneJarSummary, StoneStatus, StoneSummary } from "@/types/stones";

type Sort = "newest" | "oldest" | "published";
export type StoneListParams = { q?: string; status?: StoneStatus | "all"; element?: string; color?: string; benefit?: string; sort?: Sort; page?: number; pageSize?: number };
export type StoneJarListParams = { q?: string; status?: StoneStatus | "all"; sort?: Sort; page?: number; pageSize?: number };

const now = () => new Date().toISOString();
const pageNumber = (page?: number) => page && page > 0 ? Math.floor(page) : 1;
const escapeLike = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");

export function parseStoneStatus(value?: string): StoneStatus | "all" {
  return value && stoneStatuses.includes(value as StoneStatus) ? value as StoneStatus : "all";
}
export function parseStoneSort(value?: string): Sort { return value === "oldest" || value === "published" ? value : "newest"; }

function applySort<T>(query: T, sort?: Sort) {
  const sortable = query as T & { order: (column: string, options: { ascending: boolean; nullsFirst?: boolean }) => T };
  if (sort === "oldest") return sortable.order("created_at", { ascending: true });
  if (sort === "published") return sortable.order("published_at", { ascending: false, nullsFirst: false });
  return sortable.order("updated_at", { ascending: false });
}

export async function getAdminStones(params: StoneListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 20;
  let query = createAdminClient().from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at", { count: "exact" }).is("deleted_at", null);
  if (params.q?.trim()) { const term = escapeLike(params.q.trim()); query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`); }
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.element) query = query.contains("elements", [params.element]);
  query = applySort(query, params.sort);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(`Không thể tải loại đá: ${error.message}`);
  return { stones: data as StoneSummary[], count: count ?? 0, page, pageSize };
}

export async function getAdminStone(id: string) {
  const { data, error } = await createAdminClient().from("stones").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error || !data) throw new Error(error ? `Không thể tải loại đá: ${error.message}` : "Không tìm thấy loại đá.");
  return data as Stone;
}

export async function getStoneOptions() {
  const { data, error } = await createAdminClient().from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at").is("deleted_at", null).order("name");
  if (error) throw new Error(`Không thể tải danh sách đá: ${error.message}`);
  return data as StoneSummary[];
}

export async function getPublishedStones(params: StoneListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 12;
  try {
    let query = createAdminClient().from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at", { count: "exact" })
      .eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
    if (params.q?.trim()) query = query.ilike("name", `%${escapeLike(params.q.trim())}%`);
    if (params.element) query = query.contains("elements", [params.element]);
    if (params.color) query = query.contains("colors", [params.color]);
    if (params.benefit) query = query.ilike("benefits", `%${escapeLike(params.benefit)}%`);
    const { data, error, count } = await query.order("is_featured", { ascending: false }).order("published_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw error;
    return { stones: data as StoneSummary[], count: count ?? 0, page, pageSize };
  } catch (error) {
    console.warn("Could not load published stones.", error);
    return { stones: [] as StoneSummary[], count: 0, page, pageSize };
  }
}

export const getPublishedStoneBySlug = cache(async (slug: string): Promise<StoneDetail | null> => {
  const admin = createAdminClient();
  const { data } = await admin.from("stones").select("*").eq("slug", slug).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).maybeSingle();
  if (!data) return null;
  const { data: links } = await admin.from("stone_jar_items").select("stone_jar_id").eq("stone_id", data.id);
  const ids = [...new Set((links ?? []).map((item) => item.stone_jar_id))];
  let jars: StoneJarSummary[] = [];
  if (ids.length) {
    const result = await admin.from("stone_jars").select("id,name,slug,short_description,featured_image,price,price_label,status,is_featured,published_at,created_at,updated_at").in("id", ids).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
    jars = (result.data ?? []) as StoneJarSummary[];
  }
  return { ...(data as Stone), jars };
});

export async function getAdminStoneJars(params: StoneJarListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 20;
  let query = createAdminClient().from("stone_jars").select("id,name,slug,short_description,featured_image,price,price_label,status,is_featured,published_at,created_at,updated_at", { count: "exact" }).is("deleted_at", null);
  if (params.q?.trim()) { const term = escapeLike(params.q.trim()); query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`); }
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  query = applySort(query, params.sort);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(`Không thể tải lọ đá: ${error.message}`);
  return { jars: data as StoneJarSummary[], count: count ?? 0, page, pageSize };
}

async function hydrateJar(jar: StoneJar, publishedOnly = false): Promise<StoneJarDetail> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin.from("stone_jar_items").select("*").eq("stone_jar_id", jar.id).order("display_order");
  if (error) throw new Error(`Không thể tải thành phần lọ đá: ${error.message}`);
  const stoneIds = (rows ?? []).map((item) => item.stone_id);
  let stoneQuery = admin.from("stones").select("id,name,slug,short_description,elements,colors,featured_image,status,is_featured,published_at,created_at,updated_at").in("id", stoneIds).is("deleted_at", null);
  if (publishedOnly) stoneQuery = stoneQuery.eq("status", "published").not("published_at", "is", null).lte("published_at", now());
  const stones = stoneIds.length ? await stoneQuery : { data: [] };
  const map = new Map((stones.data ?? []).map((stone) => [stone.id, stone as StoneSummary]));
  const items = (rows ?? []).flatMap((item) => map.has(item.stone_id) ? [{ ...item, stone: map.get(item.stone_id)! } as StoneJarItemWithStone] : []);
  return { ...jar, items };
}

export async function getAdminStoneJar(id: string) {
  const { data, error } = await createAdminClient().from("stone_jars").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error || !data) throw new Error(error ? `Không thể tải lọ đá: ${error.message}` : "Không tìm thấy lọ đá.");
  return hydrateJar(data as StoneJar);
}

export async function getPublishedStoneJars(params: StoneJarListParams = {}) {
  const page = pageNumber(params.page), pageSize = params.pageSize ?? 12;
  try {
    let query = createAdminClient().from("stone_jars").select("id,name,slug,short_description,featured_image,price,price_label,status,is_featured,published_at,created_at,updated_at", { count: "exact" }).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
    if (params.q?.trim()) query = query.ilike("name", `%${escapeLike(params.q.trim())}%`);
    const { data, error, count } = await query.order("is_featured", { ascending: false }).order("published_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw error;
    return { jars: data as StoneJarSummary[], count: count ?? 0, page, pageSize };
  } catch (error) {
    console.warn("Could not load published stone jars.", error);
    return { jars: [] as StoneJarSummary[], count: 0, page, pageSize };
  }
}

export const getPublishedStoneJarBySlug = cache(async (slug: string): Promise<StoneJarDetail | null> => {
  const { data } = await createAdminClient().from("stone_jars").select("*").eq("slug", slug).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).maybeSingle();
  if (!data) return null;
  return hydrateJar(data as StoneJar, true);
});

export async function getRelatedStoneJars(jar: StoneJarDetail, limit = 3) {
  const stoneIds = jar.items.map((item) => item.stone_id);
  if (!stoneIds.length) return [];
  const admin = createAdminClient();
  const { data: links } = await admin.from("stone_jar_items").select("stone_jar_id").in("stone_id", stoneIds).neq("stone_jar_id", jar.id).limit(30);
  const ids = [...new Set((links ?? []).map((item) => item.stone_jar_id))].slice(0, limit);
  if (!ids.length) return [];
  const { data } = await admin.from("stone_jars").select("id,name,slug,short_description,featured_image,price,price_label,status,is_featured,published_at,created_at,updated_at").in("id", ids).eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null);
  return (data ?? []) as StoneJarSummary[];
}

export async function getPublishedStoneSitemapEntries() {
  const admin = createAdminClient();
  const [stones, jars] = await Promise.all([
    admin.from("stones").select("slug,updated_at").eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).limit(500),
    admin.from("stone_jars").select("slug,updated_at").eq("status", "published").not("published_at", "is", null).lte("published_at", now()).is("deleted_at", null).limit(500),
  ]);
  return { stones: stones.data ?? [], jars: jars.data ?? [] };
}
