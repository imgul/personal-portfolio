import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getPosts, indexUrl, postUrl, formatDate, isoDate, SITE } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products — by Muhammad Gulzaib, Senior Full Stack Engineer and SaaS founder.",
  alternates: { canonical: indexUrl },
  openGraph: {
    type: "website",
    url: indexUrl,
    title: "Blog — Muhammad Gulzaib",
    description:
      "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products.",
    images: [
      { url: "/og-blog.png", width: 1200, height: 630, alt: "Muhammad Gulzaib — Blog" },
    ],
  },
};

export default function BlogIndexPage() {
  const posts = getPosts();

  const listJson = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} — Blog`,
    description:
      "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products.",
    url: indexUrl,
    inLanguage: "en",
    publisher: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: postUrl(p),
      })),
    },
  };

  return (
    <>
      <JsonLd data={listJson} />
      <section className="blog-hero">
        <p className="blog-eyebrow">Field notes · Writing</p>
        <h1>Notes on shipping software, AI systems and products.</h1>
        <p>
          Long-form writing on the engineering decisions behind agentic AI, RAG pipelines, web
          graphics and the business of building products — by Muhammad Gulzaib.
        </p>
        <p className="rss-note">
          Subscribe via <a href="/blog/feed.xml">RSS feed</a> to get every post.
        </p>
      </section>

      {posts.length ? (
        <div className="post-list">
          {posts.map((p) => (
            <a className="post-card" key={p.slug} href={`/blog/${p.slug}/`}>
              <div className="post-meta">
                <time dateTime={isoDate(p.date)}>{formatDate(p.date)}</time>
                <span className="dot">·</span>
                <span>{p.minutes} min read</span>
              </div>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="tag-row">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p style={{ color: "#8a8899" }}>No posts yet — coming soon.</p>
      )}
    </>
  );
}
