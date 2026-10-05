import type { Database, BraceletAvailability, StoneContentStatus } from "@/types/database.types";
import type { StoneSummary } from "@/types/stones";

export type BraceletStatus = StoneContentStatus;
export type BraceletAvailabilityValue = BraceletAvailability;
export type Bracelet = Database["public"]["Tables"]["bracelets"]["Row"];
export type BraceletStone = Database["public"]["Tables"]["bracelet_stones"]["Row"];
export type SiteContactSettings = Database["public"]["Tables"]["site_contact_settings"]["Row"];

export type BraceletSummary = Pick<
  Bracelet,
  | "id"
  | "product_code"
  | "name"
  | "slug"
  | "featured_image"
  | "short_description"
  | "bead_sizes_mm"
  | "wrist_sizes_cm"
  | "price"
  | "availability"
  | "status"
  | "is_featured"
  | "display_order"
  | "published_at"
  | "created_at"
  | "updated_at"
> & {
  stones: StoneSummary[];
};

export type BraceletDetail = Bracelet & {
  stones: StoneSummary[];
};
