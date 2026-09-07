import type { MetadataRoute } from "next";

import { getPublishedBlogSitemapEntries } from "@/lib/queries/blog";
import { getPublishedServiceSitemapEntries } from "@/lib/queries/services";
import { getPublishedStoneSitemapEntries } from "@/lib/queries/stones";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, services, stoneContent] = await Promise.all([
    getPublishedBlogSitemapEntries(),
    getPublishedServiceSitemapEntries(),
    getPublishedStoneSitemapEntries(),
  ]);
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/dich-vu`, lastModified: new Date() },
    { url: `${baseUrl}/da-phong-thuy`, lastModified: new Date() },
    { url: `${baseUrl}/lo-da-phong-thuy`, lastModified: new Date() },
    ...services.map((service) => ({
      url: `${baseUrl}/dich-vu/${service.slug}`,
      lastModified: new Date(service.updated_at ?? new Date()),
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
    })),
    ...stoneContent.stones.map((stone) => ({
      url: `${baseUrl}/da-phong-thuy/${stone.slug}`,
      lastModified: new Date(stone.updated_at),
    })),
    ...stoneContent.jars.map((jar) => ({
      url: `${baseUrl}/lo-da-phong-thuy/${jar.slug}`,
      lastModified: new Date(jar.updated_at),
    })),
  ];
}
