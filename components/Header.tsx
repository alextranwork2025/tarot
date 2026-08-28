import { SiteHeader } from "@/components/SiteHeader";
import { getHeaderViewer } from "@/lib/auth/site";

export async function Header() {
  const viewer = await getHeaderViewer();

  return <SiteHeader viewer={viewer} />;
}
