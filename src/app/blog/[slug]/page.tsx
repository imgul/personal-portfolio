import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlogBanner from "@/components/BlogBanner";
import TocNav from "@/components/TocNav";
import {
  getPost,
  getPosts,
  getPostSlugs,
  postUrl,
  indexUrl,
  formatDate,
  isoDate,
  SITE,
} from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = postUrl(post);
  const published = isoDate(post.date);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: SITE.name,
      images: [{ url: "/og-blog.png", width: 1200, height: 630, alt: post.title }],
      publishedTime: published,
      modifiedTime: published,
      tags: post.tags,
      authors: [SITE.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-blog.png"],
    },
    other: {
      "article:published_time": published,
      "article:modified_time": published,
      "article:tag": post.tags.join(", "),
      "article:author": SITE.author.name,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const posts = getPosts();
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const older = idx < posts.length - 1 ? posts[idx + 1] : null;
  const newer = idx > 0 ? posts[idx - 1] : null;
  const related = posts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);
  const relatedList = related.length ? related : posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const url = postUrl(post);
  const published = isoDate(post.date);

  const postJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: published,
    dateModified: published,
    inLanguage: "en",
    keywords: post.tags.join(", "),
    articleSection: "Blog",
    wordCount: post.words,
    author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url, email: SITE.author.email },
    publisher: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
  };
  const crumbsJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: indexUrl },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const tocItems = post.toc.map((t) => (
    <li key={t.id} className={`lvl-${t.level}`}>
      <a href={`#${t.id}`}>{t.text}</a>
    </li>
  ));
  const tocMobile = post.toc.length ? (
    <div className="toc-mobile">
      <details>
        <summary>On this page</summary>
        <ol>{tocItems}</ol>
      </details>
    </div>
  ) : null;

  return (
    <>
      <JsonLd data={postJson} />
      <JsonLd data={crumbsJson} />
      <div className="article-wrap">
        <article className="article">
          <p className="crumbs">
            <a href="/">Home</a>
            <span className="sep">/</span>
            <a href="/blog/">Blog</a>
          </p>
          <div className="post-meta">
            <time dateTime={published}>{formatDate(post.date)}</time>
            <span className="dot">·</span>
            <span>{post.minutes} min read</span>
            <span className="dot">·</span>
            <span>{post.words.toLocaleString()} words</span>
          </div>
          <h1>{post.title}</h1>
          <p className="lede">{post.description}</p>
          <div className="tag-row">
            {post.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <BlogBanner post={post} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          <div className="post-foot">
            <div className="share">
              <span>Share</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title + " — " + SITE.name
                )}&url=${encodeURIComponent(url)}`}
                rel="noopener noreferrer"
              >
                Twitter / X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>

            {relatedList.length > 0 && (
              <div className="post-nav" aria-label="More posts">
                {relatedList.map((r) => (
                  <a key={r.slug} href={`/blog/${r.slug}/`}>
                    <span className="label">Keep reading</span>
                    <span className="title">{r.title}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="post-nav">
              {older ? (
                <a href={`/blog/${older.slug}/`}>
                  <span className="label">← Older</span>
                  <span className="title">{older.title}</span>
                </a>
              ) : (
                <span />
              )}
              {newer ? (
                <a className="next" href={`/blog/${newer.slug}/`}>
                  <span className="label">Newer →</span>
                  <span className="title">{newer.title}</span>
                </a>
              ) : (
                <span />
              )}
            </div>

            <a className="back-link" href="/blog/">
              ← Back to all posts
            </a>
          </div>
        </article>

        <TocNav toc={post.toc} />
      </div>
      {tocMobile}
    </>
  );
}
