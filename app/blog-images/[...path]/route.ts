import { NextResponse } from "next/server";

import { BLOG_IMAGE_BUCKET } from "@/lib/blog/upload";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const objectPath = path.join("/");

  if (!/^(cover|content)\/[a-f0-9-]+\.(jpg|png|webp)$/.test(objectPath)) {
    return NextResponse.json({ error: "Không tìm thấy ảnh." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: usage } = await admin
    .from("blog_posts")
    .select("id")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .or(`cover_image_url.eq./blog-images/${objectPath},content.ilike.%${objectPath}%`)
    .limit(1);

  if (!usage?.length) {
    return NextResponse.json({ error: "Không tìm thấy ảnh." }, { status: 404 });
  }

  const { data, error } = await admin.storage.from(BLOG_IMAGE_BUCKET).download(objectPath);
  if (error || !data) {
    return NextResponse.json({ error: "Không thể tải ảnh." }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "content-type": data.type || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
