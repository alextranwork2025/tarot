import "server-only";

import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { serviceStatuses, type ServiceStatusValue } from "@/lib/validations/services";
import type { Json } from "@/types/database.types";

export type ServiceFaqItem = {
  question: string;
  answer: string;
};

export type ServiceTestimonial = {
  customer_name: string;
  content: string;
  rating: number;
};

export type PublicService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  content: string | null;
  cover_image_url: string | null;
  duration_minutes: number;
  price: number;
};

export type PublicServiceDetail = PublicService & {
  suitable_for: string | null;
  benefits: string | null;
  process: string | null;
  preparation_notes: string | null;
  faq: ServiceFaqItem[];
  testimonials: ServiceTestimonial[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type AdminService = PublicServiceDetail & {
  is_active: boolean;
  display_order: number;
  status: ServiceStatusValue;
  created_at: string;
  deleted_at: string | null;
};

export type ServiceListParams = {
  q?: string;
  status?: ServiceStatusValue | "all";
  page?: number;
  pageSize?: number;
};

type ServiceRowLike = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string | null;
  short_description?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  suitable_for?: string | null;
  benefits?: string | null;
  process?: string | null;
  preparation_notes?: string | null;
  faq?: Json | null;
  testimonials?: Json | null;
  seo_title?: string | null;
  seo_description?: string | null;
  status?: ServiceStatusValue;
  published_at?: string | null;
  deleted_at?: string | null;
};

const fallbackServices: PublicService[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Thông điệp hôm nay",
    slug: "thong-diep-hom-nay",
    description: "Rút một lá dành cho suy ngẫm nhanh.",
    short_description: "Một lá bài ngắn gọn để soi chiếu câu hỏi hiện tại.",
    content: "Phiên đọc ngắn dành cho những lúc bạn cần một điểm tựa nhẹ nhàng để nhìn lại điều đang diễn ra.",
    cover_image_url: null,
    duration_minutes: 30,
    price: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Dòng chảy thời gian",
    slug: "dong-chay-thoi-gian",
    description: "Trải ba lá: quá khứ, hiện tại và khả năng.",
    short_description: "Trải bài ba lá để nhìn mạch chuyện qua nhiều lớp thời gian.",
    content: "Phiên đọc giúp bạn quan sát quá khứ, hiện tại và hướng mở kế tiếp mà không biến Tarot thành lời phán quyết.",
    cover_image_url: null,
    duration_minutes: 60,
    price: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Hành trình bóng tối",
    slug: "hanh-trinh-bong-toi",
    description: "Phiên đọc chuyên sâu cho các khuôn mẫu nội tâm.",
    short_description: "Không gian đọc sâu cho nỗi sợ, khuôn mẫu và khả năng chuyển hóa.",
    content: "Phiên đọc chuyên sâu dành cho những câu hỏi cần thời gian, sự thành thật và một nhịp quan sát chậm rãi.",
    cover_image_url: null,
    duration_minutes: 90,
    price: 0,
  },
];

function sanitizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function parseFaq(value?: Json | null): ServiceFaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }
      const question = typeof item.question === "string" ? item.question.trim() : "";
      const answer = typeof item.answer === "string" ? item.answer.trim() : "";
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is ServiceFaqItem => Boolean(item));
}

function parseTestimonials(value?: Json | null): ServiceTestimonial[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }
      const customerName = typeof item.customer_name === "string" ? item.customer_name.trim() : "";
      const content = typeof item.content === "string" ? item.content.trim() : "";
      const rating = typeof item.rating === "number" ? item.rating : Number(item.rating);
      return customerName && content && Number.isInteger(rating) && rating >= 1 && rating <= 5
        ? { customer_name: customerName, content, rating }
        : null;
    })
    .filter((item): item is ServiceTestimonial => Boolean(item));
}

function normalizeService(service: ServiceRowLike): AdminService {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    short_description: service.short_description ?? service.description,
    content: service.content ?? service.description,
    cover_image_url: service.cover_image_url ?? null,
    suitable_for: service.suitable_for ?? null,
    benefits: service.benefits ?? null,
    process: service.process ?? null,
    preparation_notes: service.preparation_notes ?? null,
    faq: parseFaq(service.faq),
    testimonials: parseTestimonials(service.testimonials),
    seo_title: service.seo_title ?? null,
    seo_description: service.seo_description ?? null,
    duration_minutes: service.duration_minutes,
    price: service.price,
    is_active: service.is_active ?? true,
    display_order: service.display_order ?? 0,
    status: service.status ?? "published",
    published_at: service.published_at ?? service.created_at ?? null,
    created_at: service.created_at ?? new Date(0).toISOString(),
    updated_at: service.updated_at ?? null,
    deleted_at: service.deleted_at ?? null,
  };
}

function toPublicService(service: ServiceRowLike): PublicService {
  const normalized = normalizeService(service);
  return {
    id: normalized.id,
    name: normalized.name,
    slug: normalized.slug,
    description: normalized.description,
    short_description: normalized.short_description,
    content: normalized.content,
    cover_image_url: normalized.cover_image_url,
    duration_minutes: normalized.duration_minutes,
    price: normalized.price,
  };
}

function fallbackDetail(slug: string): PublicServiceDetail | null {
  const service = fallbackServices.find((item) => item.slug === slug);
  if (!service) {
    return null;
  }

  return {
    ...service,
    suitable_for: null,
    benefits: null,
    process: null,
    preparation_notes: null,
    faq: [],
    testimonials: [],
    seo_title: null,
    seo_description: null,
    published_at: null,
    updated_at: null,
  };
}

export function parseServiceStatus(value?: string): ServiceStatusValue | "all" {
  if (!value || value === "all") {
    return "all";
  }

  return serviceStatuses.includes(value as ServiceStatusValue) ? (value as ServiceStatusValue) : "all";
}

export async function getActiveServices() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return fallbackServices;
  }

  const supabase = await createClient();
  const full = await supabase
    .from("services")
    .select("id,name,slug,description,short_description,content,cover_image_url,duration_minutes,price")
    .eq("is_active", true)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!full.error) {
    return full.data;
  }

  const legacy = await supabase
    .from("services")
    .select("id,name,slug,description,duration_minutes,price")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return legacy.error ? fallbackServices : legacy.data.map((service) => toPublicService(service));
}

export async function getAllServicesForAdmin() {
  const admin = createAdminClient();
  const full = await admin
    .from("services")
    .select("id,name,slug,description,short_description,content,cover_image_url,duration_minutes,price,is_active,display_order,status,published_at,created_at,updated_at,deleted_at")
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!full.error) {
    return full.data.map((service) => normalizeService(service));
  }

  const legacy = await admin
    .from("services")
    .select("id,name,slug,description,duration_minutes,price,is_active,display_order,created_at,updated_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (legacy.error) {
    throw new Error("Không thể tải danh sách dịch vụ.");
  }

  return legacy.data.map((service) => normalizeService(service));
}

export async function getAdminServices(params: ServiceListParams) {
  const admin = createAdminClient();
  const page = sanitizePage(params.page);
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("services")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (params.q?.trim()) {
    const term = escapeLike(params.q.trim());
    query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const full = await query
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!full.error) {
    return {
      services: full.data.map((service) => normalizeService(service)),
      count: full.count ?? 0,
      page,
      pageSize,
    };
  }

  let legacyQuery = admin
    .from("services")
    .select("id,name,slug,description,duration_minutes,price,is_active,display_order,created_at,updated_at", { count: "exact" });

  if (params.q?.trim()) {
    const term = escapeLike(params.q.trim());
    legacyQuery = legacyQuery.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const legacy = await legacyQuery
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (legacy.error) {
    throw new Error("Không thể tải danh sách dịch vụ.");
  }

  return {
    services: legacy.data.map((service) => normalizeService(service)),
    count: legacy.count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminService(id: string) {
  const admin = createAdminClient();
  const full = await admin
    .from("services")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!full.error && full.data) {
    return normalizeService(full.data);
  }

  const legacy = await admin
    .from("services")
    .select("id,name,slug,description,duration_minutes,price,is_active,display_order,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (legacy.error || !legacy.data) {
    throw new Error(legacy.error ? "Không thể tải dịch vụ." : "Không tìm thấy dịch vụ.");
  }

  return normalizeService(legacy.data);
}

export const getPublishedServiceBySlug = cache(async (slug: string) => {
  const admin = createAdminClient();
  const full = await admin
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (!full.error && full.data) {
    return normalizeService(full.data) as PublicServiceDetail;
  }

  const legacy = await admin
    .from("services")
    .select("id,name,slug,description,duration_minutes,price,is_active,display_order,created_at,updated_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (legacy.error) {
    return fallbackDetail(slug);
  }

  return legacy.data ? (normalizeService(legacy.data) as PublicServiceDetail) : fallbackDetail(slug);
});

export async function getPublishedServiceSitemapEntries() {
  const admin = createAdminClient();
  const full = await admin
    .from("services")
    .select("slug,updated_at")
    .eq("status", "published")
    .eq("is_active", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .limit(500);

  if (!full.error) {
    return full.data;
  }

  const legacy = await admin
    .from("services")
    .select("slug,updated_at")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(500);

  return legacy.error ? [] : legacy.data;
}
