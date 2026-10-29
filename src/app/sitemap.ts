import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await db.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  const pages = ["", "/courses", "/how-it-works", "/about", "/faq", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}/ar${p}` })),
    ...courses.map((c) => ({ url: `${SITE_URL}/ar/courses/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
