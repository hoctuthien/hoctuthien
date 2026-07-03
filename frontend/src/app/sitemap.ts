import type { MetadataRoute } from "next";
import { SITE_URL } from "@/core/utils/site";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:5050").replace(/\/$/, "");

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/courses", changeFrequency: "daily", priority: 0.9 },
  { path: "/mentorship", changeFrequency: "daily", priority: 0.8 },
  { path: "/campaigns", changeFrequency: "weekly", priority: 0.6 },
  { path: "/leaderboard", changeFrequency: "weekly", priority: 0.5 },
  { path: "/transparency", changeFrequency: "weekly", priority: 0.5 },
];

async function fetchJson(path: string): Promise<any | null> {
  try {
    // revalidate định kỳ (1 giờ) để sitemap.xml có thể được cache/tạo tĩnh
    // thay vì luôn bị đánh dấu dynamic do dùng no-store.
    const res = await fetch(`${BACKEND_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`[sitemap] Failed to fetch ${path}:`, error);
    return null;
  }
}

function extractList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [coursesPayload, postsPayload, mentorsPayload] = await Promise.all([
    fetchJson("/api/v1/courses?status=ACTIVE&limit=1000"),
    fetchJson("/api/v1/posts"),
    fetchJson("/api/v1/mentor-profiles?limit=1000"),
  ]);

  const courseEntries: MetadataRoute.Sitemap = extractList(coursesPayload).map((course: any) => ({
    url: `${SITE_URL}/courses/detail/${course.id}`,
    lastModified: course.updatedAt ? new Date(course.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = extractList(postsPayload)
    .filter((post: any) => post.status === "published" && post.slug)
    .map((post: any) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const mentorEntries: MetadataRoute.Sitemap = extractList(mentorsPayload)
    .filter((mentor: any) => mentor.isApproved)
    .map((mentor: any) => ({
      url: `${SITE_URL}/mentors/${mentor.id}`,
      lastModified: mentor.updatedAt ? new Date(mentor.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticEntries, ...courseEntries, ...postEntries, ...mentorEntries];
}
