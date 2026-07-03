import type { MetadataRoute } from "next";
import { SITE_URL } from "@/core/utils/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/calendar",
        "/my-courses",
        "/profile",
        "/mentor/",
        "/activation",
        "/login",
        "/register",
        "/forgot-password",
        "/admin",
        "/admin/",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
