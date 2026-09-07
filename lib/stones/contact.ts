const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

export function buildStoneJarContactMessage(name: string, path: string, customMessage?: string | null) {
  if (customMessage?.trim()) return customMessage.replaceAll("[Tên lọ đá]", name).replaceAll("[Đường dẫn trang chi tiết]", `${siteUrl}${path}`);
  return `Xin chào Huyền Cảnh, tôi muốn được tư vấn về lọ đá ${name} – ${siteUrl}${path}.`;
}

export function buildStoneJarContactHref(name: string, path: string, customMessage?: string | null) {
  const message = buildStoneJarContactMessage(name, path, customMessage);
  if (!contactUrl) return `mailto:?subject=${encodeURIComponent(`Tư vấn lọ đá ${name}`)}&body=${encodeURIComponent(message)}`;
  if (contactUrl.includes("{message}")) return contactUrl.replace("{message}", encodeURIComponent(message));
  if (contactUrl.startsWith("tel:")) return contactUrl;
  const separator = contactUrl.includes("?") ? "&" : "?";
  return `${contactUrl}${separator}text=${encodeURIComponent(message)}`;
}
