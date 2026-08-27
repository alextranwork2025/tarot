import { createClient } from "@/lib/supabase/server";

export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
};

const fallbackServices: PublicService[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Thông điệp hôm nay",
    description: "Rút một lá dành cho suy ngẫm nhanh.",
    duration_minutes: 30,
    price: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Dòng chảy thời gian",
    description: "Trải ba lá: quá khứ, hiện tại và khả năng.",
    duration_minutes: 60,
    price: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Hành trình bóng tối",
    description: "Phiên đọc chuyên sâu cho các khuôn mẫu nội tâm.",
    duration_minutes: 90,
    price: 0,
  },
];

export async function getActiveServices() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return fallbackServices;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id,name,description,duration_minutes,price")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return fallbackServices;
  }

  return data;
}

export async function getAllServicesForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id,name,description,duration_minutes,price,is_active,display_order")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("Không thể tải danh sách dịch vụ.");
  }

  return data;
}
