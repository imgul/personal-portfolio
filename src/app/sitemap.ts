import type { MetadataRoute } from "next";
import { getPosts, postUrl, indexUrl, SITE } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const latest = posts[0] ? new Date(posts[0].date).toISOString().slice(0, 10) : null;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/`,
      lastModified: latest ?? new Date().toISOString().slice(0, 10),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: indexUrl,
      lastModified: latest ?? new Date().toISOString().slice(0, 10),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const p of posts) {
    entries.push({
      url: postUrl(p),
      lastModified: new Date(p.date).toISOString().slice(0, 10),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
