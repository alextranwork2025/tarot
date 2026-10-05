const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const bucket = "stone-images";
const sourceDir = path.join("app", "admin", "Huyen_Canh_RAW_30_anh");

const jars = [
  { slug: "nguyet-quang", files: ["01_Nguyet_Quang_Chinh_dien.png", "02_Nguyet_Quang_Goc_nghieng.png", "03_Nguyet_Quang_Can_canh.png"] },
  { slug: "hac-gioi", files: ["04_Hac_Gioi_Chinh_dien.png", "05_Hac_Gioi_Goc_nghieng.png", "06_Hac_Gioi_Can_canh.png"] },
  { slug: "lam-hai", files: ["07_Lam_Hai_Chinh_dien.png", "08_Lam_Hai_Goc_nghieng.png", "09_Lam_Hai_Can_canh.png"] },
  { slug: "tu-nguyet", files: ["10_Tu_Nguyet_Chinh_dien.png", "11_Tu_Nguyet_Goc_nghieng.png", "12_Tu_Nguyet_Can_canh.png"] },
  { slug: "am-duong", files: ["13_Am_Duong_Chinh_dien.png", "14_Am_Duong_Goc_nghieng.png", "15_Am_Duong_Can_canh.png"] },
  { slug: "thanh-moc", files: ["16_Thanh_Moc_Chinh_dien.png", "17_Thanh_Moc_Goc_nghieng.png", "18_Thanh_Moc_Can_canh.png"] },
  { slug: "xich-nhat", files: ["19_Xich_Nhat_Chinh_dien.png", "20_Xich_Nhat_Goc_nghieng.png", "21_Xich_Nhat_Can_canh.png"] },
  { slug: "tinh-ha", files: ["22_Tinh_Ha_Chinh_dien.png", "23_Tinh_Ha_Goc_nghieng.png", "24_Tinh_Ha_Can_canh.png"] },
  { slug: "tu-phuc", files: ["25_Tu_Phuc_Chinh_dien.png", "26_Tu_Phuc_Goc_nghieng.png", "27_Tu_Phuc_Can_canh.png"] },
  { slug: "huyen-canh", files: ["28_Huyen_Canh_Chinh_dien.png", "29_Huyen_Canh_Goc_nghieng.png", "30_Huyen_Canh_Can_canh.png"] },
];

function readEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

function assertSourceFiles() {
  const missing = jars.flatMap((jar) =>
    jar.files.filter((file) => !fs.existsSync(path.join(sourceDir, file))).map((file) => `${jar.slug}: ${file}`),
  );
  if (missing.length) {
    throw new Error(`Missing source images:\n${missing.join("\n")}`);
  }
}

async function uploadJarImages(supabase, jar) {
  const urls = [];
  for (const file of jar.files) {
    const localPath = path.join(sourceDir, file);
    const storagePath = `jars/${jar.slug}/${file}`;
    const { error } = await supabase.storage.from(bucket).upload(storagePath, fs.readFileSync(localPath), {
      contentType: "image/png",
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`Upload failed for ${file}: ${error.message}`);
    urls.push(`/stone-images/${storagePath}`);
  }
  return urls;
}

async function main() {
  assertSourceFiles();

  const env = readEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results = [];
  for (const jar of jars) {
    const { data: existing, error: existingError } = await supabase
      .from("stone_jars")
      .select("id,name,slug")
      .eq("slug", jar.slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) throw new Error(`Stone jar not found: ${jar.slug}`);

    const urls = await uploadJarImages(supabase, jar);
    const { data, error } = await supabase
      .from("stone_jars")
      .update({ featured_image: urls[0], gallery: urls })
      .eq("id", existing.id)
      .select("name,slug,featured_image,gallery")
      .single();
    if (error) throw error;

    results.push({ name: data.name, slug: data.slug, featuredImage: data.featured_image, galleryCount: data.gallery.length });
  }

  console.log(JSON.stringify({ updated: results.length, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
