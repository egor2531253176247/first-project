import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/db";
import { articles } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.STUDIO_URL;
  if (!base) return [];
  const catalog = getCatalog();
  return [
    "",
    "/services",
    "/projects",
    "/studio",
    "/contact",
    "/configurator",
    "/blog",
    ...catalog.services.map((s) => "/services/" + s.id),
    ...catalog.projects.map((p) => "/projects/" + p.slug),
    ...articles.map((a) => "/blog/" + a.slug),
  ].map((path) => ({
    url: base.replace(/\/$/, "") + path,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
