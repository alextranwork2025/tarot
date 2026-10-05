const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

const colorStones = [
  { color: "Trắng", name: "Đá trắng", slug: "da-trang" },
  { color: "Đen", name: "Đá đen", slug: "da-den" },
  { color: "Xanh lam", name: "Đá xanh lam", slug: "da-xanh-lam" },
  { color: "Tím", name: "Đá tím", slug: "da-tim" },
  { color: "Xanh ngọc", name: "Đá xanh ngọc", slug: "da-xanh-ngoc" },
  { color: "Đỏ", name: "Đá đỏ", slug: "da-do" },
  { color: "Vàng", name: "Đá vàng", slug: "da-vang" },
];

const jars = [
  { icon: "🌙", name: "Nguyệt Quang", slug: "nguyet-quang", items: [["Trắng", "100%"]] },
  { icon: "🖤", name: "Hắc Giới", slug: "hac-gioi", items: [["Đen", "100%"]] },
  { icon: "🌊", name: "Lam Hải", slug: "lam-hai", items: [["Xanh lam", "70%"], ["Trắng", "30%"]] },
  { icon: "💜", name: "Tử Nguyệt", slug: "tu-nguyet", items: [["Tím", "70%"], ["Trắng", "30%"]] },
  { icon: "☯️", name: "Âm Dương", slug: "am-duong", items: [["Đen", "50%"], ["Trắng", "50%"]] },
  { icon: "🌿", name: "Thanh Mộc", slug: "thanh-moc", items: [["Xanh ngọc", "65%"], ["Trắng", "35%"]] },
  { icon: "🔥", name: "Xích Nhật", slug: "xich-nhat", items: [["Đỏ", "65%"], ["Vàng", "35%"]] },
  { icon: "🌌", name: "Tinh Hà", slug: "tinh-ha", items: [["Xanh lam", "40%"], ["Tím", "35%"], ["Trắng", "25%"]] },
  { icon: "🪷", name: "Tụ Phúc", slug: "tu-phuc", items: [["Vàng", "45%"], ["Đỏ", "30%"], ["Trắng", "25%"]] },
  { icon: "🔮", name: "Huyền Cảnh", slug: "huyen-canh", items: [["Tím", "40%"], ["Đen", "35%"], ["Xanh lam", "25%"]] },
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

function itemText(items, separator = " + ") {
  return items.map(([color]) => color).join(separator);
}

function ratioText(items, separator = " + ") {
  return items.map(([, ratio]) => ratio).join(separator);
}

function short(value, length = 320) {
  return value.length > length ? `${value.slice(0, length - 1).trim()}...` : value;
}

async function getAdminProfileId(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertColorStone(supabase, profileId, stone) {
  const payload = {
    name: stone.name,
    slug: stone.slug,
    short_description: `Danh mục màu ${stone.color.toLowerCase()} dùng để khai báo thành phần phối màu cho lọ đá.`,
    content: `## Ghi chú\nĐây là dữ liệu nền để liên kết thành phần lọ đá theo màu. Cần thay bằng loại đá cụ thể, nguồn gốc và thông tin xác thực khi có dữ liệu thật.`,
    benefits: null,
    suitable_for: null,
    elements: [],
    zodiac_signs: [],
    colors: [stone.color],
    origin: null,
    featured_image: null,
    gallery: [],
    status: "draft",
    is_featured: false,
    seo_title: null,
    seo_description: null,
    published_at: null,
    created_by: profileId,
    deleted_at: null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("stones")
    .select("id")
    .eq("slug", stone.slug)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase
      .from("stones")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase.from("stones").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

async function upsertJar(supabase, profileId, jar, stoneIdsByColor) {
  const components = itemText(jar.items);
  const ratios = ratioText(jar.items);
  const shortDescription = `${jar.icon} Lọ đá phối màu ${components} theo tỷ lệ ${ratios}.`;
  const content = [
    "## Thành phần",
    ...jar.items.map(([color, ratio]) => `- ${color}: ${ratio}`),
    "",
    "## Ghi chú nhập liệu",
    "Dữ liệu được nhập từ bảng thành phần do người quản trị cung cấp. Sản phẩm đang ở bản nháp vì cần bổ sung ảnh thật, tên loại đá cụ thể, giá tham khảo, ý nghĩa và hướng dẫn sử dụng trước khi công khai.",
  ].join("\n");

  const payload = {
    name: jar.name,
    slug: jar.slug,
    short_description: shortDescription,
    content,
    meaning: "Ý nghĩa phong thủy cần được biên soạn theo hướng biểu tượng và tham khảo, không cam kết chữa bệnh hoặc bảo đảm tài lộc.",
    usage: "Cần bổ sung hướng dẫn sử dụng và bảo quản phù hợp với chất liệu đá thực tế.",
    featured_image: null,
    gallery: [],
    price: null,
    price_label: "Liên hệ tư vấn",
    contact_message: null,
    status: "draft",
    is_featured: false,
    seo_title: jar.name,
    seo_description: short(shortDescription),
    published_at: null,
    created_by: profileId,
    deleted_at: null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("stone_jars")
    .select("id")
    .eq("slug", jar.slug)
    .maybeSingle();
  if (existingError) throw existingError;

  let jarRow;
  if (existing) {
    const { data, error } = await supabase
      .from("stone_jars")
      .update(payload)
      .eq("id", existing.id)
      .select("id,name,slug,status")
      .single();
    if (error) throw error;
    jarRow = data;
  } else {
    const { data, error } = await supabase
      .from("stone_jars")
      .insert(payload)
      .select("id,name,slug,status")
      .single();
    if (error) throw error;
    jarRow = data;
  }

  const { error: deleteError } = await supabase.from("stone_jar_items").delete().eq("stone_jar_id", jarRow.id);
  if (deleteError) throw deleteError;

  const itemPayload = jar.items.map(([color, ratio], index) => ({
    stone_jar_id: jarRow.id,
    stone_id: stoneIdsByColor[color],
    description: `${color} - ${ratio}`,
    quantity: ratio,
    display_order: index,
  }));
  const { error: itemError } = await supabase.from("stone_jar_items").insert(itemPayload);
  if (itemError) throw itemError;

  return { ...jarRow, itemCount: itemPayload.length };
}

async function main() {
  const env = readEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const profileId = await getAdminProfileId(supabase);

  const stoneIdsByColor = {};
  for (const stone of colorStones) {
    stoneIdsByColor[stone.color] = await upsertColorStone(supabase, profileId, stone);
  }

  const imported = [];
  for (const jar of jars) {
    imported.push(await upsertJar(supabase, profileId, jar, stoneIdsByColor));
  }

  const slugs = jars.map((jar) => jar.slug);
  const { data: verification, error: verifyError } = await supabase
    .from("stone_jars")
    .select("id,name,slug,status,stone_jar_items(id)")
    .in("slug", slugs)
    .order("name");
  if (verifyError) throw verifyError;

  console.log(
    JSON.stringify(
      {
        imported: imported.length,
        colorStones: Object.keys(stoneIdsByColor).length,
        verification: verification.map((jar) => ({
          name: jar.name,
          slug: jar.slug,
          status: jar.status,
          itemCount: jar.stone_jar_items.length,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
