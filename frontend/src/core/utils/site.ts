/**
 * URL công khai (canonical) của trang web, dùng thống nhất cho metadata,
 * sitemap, robots.txt và OpenGraph — tránh mỗi nơi hardcode một domain khác nhau.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://hoctuthien.com"
).replace(/\/$/, "");
