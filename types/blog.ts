export type BlogPostStatus = "draft" | "published" | "archived";

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: BlogPostStatus;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null } | null;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
  deleted_at: string | null;
};
