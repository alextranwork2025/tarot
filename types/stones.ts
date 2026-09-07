import type { Database, StoneContentStatus } from "@/types/database.types";

export type StoneStatus = StoneContentStatus;
export type Stone = Database["public"]["Tables"]["stones"]["Row"];
export type StoneJar = Database["public"]["Tables"]["stone_jars"]["Row"];
export type StoneJarItem = Database["public"]["Tables"]["stone_jar_items"]["Row"];

export type StoneSummary = Pick<
  Stone,
  "id" | "name" | "slug" | "short_description" | "elements" | "colors" | "featured_image" | "status" | "is_featured" | "published_at" | "created_at" | "updated_at"
>;

export type StoneJarSummary = Pick<
  StoneJar,
  "id" | "name" | "slug" | "short_description" | "featured_image" | "price" | "price_label" | "status" | "is_featured" | "published_at" | "created_at" | "updated_at"
>;

export type StoneJarItemWithStone = StoneJarItem & {
  stone: StoneSummary;
};

export type StoneJarDetail = StoneJar & {
  items: StoneJarItemWithStone[];
};

export type StoneDetail = Stone & {
  jars: StoneJarSummary[];
};
