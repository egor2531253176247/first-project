import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/account", "/api/"],
    },
    ...(process.env.STUDIO_URL
      ? { sitemap: process.env.STUDIO_URL + "/sitemap.xml" }
      : {}),
  };
}
