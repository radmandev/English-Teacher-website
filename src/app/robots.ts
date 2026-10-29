import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/ar/dashboard", "/ar/account", "/ar/admin", "/ar/learn"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
