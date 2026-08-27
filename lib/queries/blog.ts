import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { blogStatuses } from "@/lib/validations/blog";
import type { BlogPostDetail, BlogPostStatus, BlogPostSummary } from "@/types/blog";

export type BlogListParams = {
  q?: string;
  status?: BlogPostStatus | "all";
  sort?: "newest" | "oldest" | "published";
  page?: number;
  pageSize?: number;
};

function sanitizePage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export function parseBlogStatus(value?: string): BlogPostStatus | "all" {
  if (!value || value === "all") {
    return "all";
  }

  return blogStatuses.includes(value as BlogPostStatus) ? (value as BlogPostStatus) : "all";
}

async function hydrateAuthors<T extends { author_id: string | null }>(rows: T[]) {
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id).filter((id): id is string => Boolean(id))));
  if (authorIds.length === 0) {
    return rows.map((row) => ({ ...row, profiles: null }));
  }

  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id,full_name").in("id", authorIds);
  const authors = new Map((data ?? []).map((profile) => [profile.id, { full_name: profile.full_name }]));
  return rows.map((row) => ({ ...row, profiles: row.author_id ? authors.get(row.author_id) ?? null : null }));
}

export async function getAdminBlogPosts(params: BlogListParams) {
  const admin = createAdminClient();
  const page = sanitizePage(params.page);
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_image_url,status,author_id,published_at,created_at,updated_at", { count: "exact" })
    .is("deleted_at", null);

  if (params.q?.trim()) {
    const term = escapeLike(params.q.trim());
    query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.sort === "oldest") {
    query = query.order("updated_at", { ascending: true });
  } else if (params.sort === "published") {
    query = query.order("published_at", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    throw new Error(`Không thể tải bài viết: ${error.message}`);
  }

  const posts = await hydrateAuthors(data);
  return { posts: posts as BlogPostSummary[], count: count ?? 0, page, pageSize };
}

export async function getAdminBlogPost(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_image_url,status,author_id,published_at,created_at,updated_at,deleted_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error ? `Không thể tải bài viết: ${error.message}` : "Không tìm thấy bài viết.");
  }

  const [post] = await hydrateAuthors([data]);
  return post as BlogPostDetail;
}

export async function getPublishedBlogPosts(params: { page?: number; pageSize?: number } = {}) {
  const admin = createAdminClient();
  const page = sanitizePage(params.page);
  const pageSize = params.pageSize ?? 9;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await admin
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_image_url,status,author_id,published_at,created_at,updated_at", { count: "exact" })
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Không thể tải bài viết đã xuất bản: ${error.message}`);
  }

  const posts = await hydrateAuthors(data);
  return { posts: posts as BlogPostSummary[], count: count ?? 0, page, pageSize };
}

export async function getLatestPublishedBlogPosts(limit = 3) {
  const result = await getPublishedBlogPosts({ page: 1, pageSize: limit });
  return result.posts;
}

export async function getBlogPostBySlug(slug: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_image_url,status,author_id,published_at,created_at,updated_at,deleted_at")
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể tải bài viết: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [post] = await hydrateAuthors([data]);
  return post as BlogPostDetail;
}

export async function getPublishedBlogSitemapEntries() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("slug,updated_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(500);

  if (error) {
    return [];
  }

  return data;
}
