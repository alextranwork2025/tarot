import { getAdminProfile } from "@/lib/auth/admin";
import { STONE_IMAGE_BUCKET } from "@/lib/stones/upload";
import { createAdminClient } from "@/lib/supabase/admin";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function imageContentType(objectPath: string, blobType: string) {
  if (blobType && blobType !== "application/octet-stream") return blobType;
  const extension = objectPath.split(".").pop()?.toLowerCase() ?? "";
  return contentTypes[extension] ?? "application/octet-stream";
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params; const objectPath = path.join("/");
  if (!objectPath || objectPath.includes("..")) return new Response("Not found", { status: 404 });
  const url = `/stone-images/${objectPath}`; const admin = createAdminClient(); const profile = await getAdminProfile();
  if (!profile) {
    const current = new Date().toISOString();
    const [stones, jars, bracelets] = await Promise.all([
      admin.from("stones").select("id").eq("status", "published").not("published_at", "is", null).lte("published_at", current).is("deleted_at", null).or(`featured_image.eq.${url},gallery.cs.{${url}}`).limit(1),
      admin.from("stone_jars").select("id").eq("status", "published").not("published_at", "is", null).lte("published_at", current).is("deleted_at", null).or(`featured_image.eq.${url},gallery.cs.{${url}}`).limit(1),
      admin.from("bracelets").select("id").eq("status", "published").not("published_at", "is", null).lte("published_at", current).is("deleted_at", null).or(`featured_image.eq.${url},gallery.cs.{${url}}`).limit(1),
    ]);
    if (!stones.data?.length && !jars.data?.length && !bracelets.data?.length) return new Response("Not found", { status: 404 });
  }
  const { data, error } = await admin.storage.from(STONE_IMAGE_BUCKET).download(objectPath);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": imageContentType(objectPath, data.type), "Cache-Control": profile ? "private, no-store" : "public, max-age=31536000, immutable" } });
}
