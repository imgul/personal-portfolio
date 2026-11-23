// Blog content + rendering library (server-only).
// Reads Markdown posts with frontmatter from content/blog and renders them to
// HTML with syntax highlighting, heading anchors and a table of contents.
// Used by the App Router blog pages and route handlers (feed/sitemap/llms).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import hljs from "highlight.js";

export const SITE = {
  name: "Muhammad Gulzaib",
  url: "https://gulzaib.vercel.app",
  description:
    "Muhammad Gulzaib is a Senior Full Stack Engineer, AI systems builder and SaaS founder based in Islamabad, Pakistan.",
  ogImage: "https://gulzaib.vercel.app/og-blog.png",
  author: {
    name: "Muhammad Gulzaib",
    url: "https://gulzaib.vercel.app",
    email: "iigulzaib@gmail.com",
  },
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  html: string;
  text: string;
  words: number;
  minutes: number;
  toc: TocItem[];
}

export const TAG_COLORS: Record<string, string> = {
  AI: "#8b6cff",
  Agents: "#c6ff3d",
  RAG: "#3de8ff",
  Web: "#ff5c8a",
  "Three.js": "#ffb23d",
  GSAP: "#3dffb0",
  Audio: "#ff5c8a",
  Laravel: "#c6ff3d",
  Startups: "#8b6cff",
  Career: "#3de8ff",
  SaaS: "#c6ff3d",
  GLSL: "#ffb23d",
};

export const tagColor = (tag: string) => TAG_COLORS[tag] || "#c6ff3d";

export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isoDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function readingTime(text: string): { words: number; minutes: number } {
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 220)) };
}

// Highlight code blocks and inject heading ids (for the TOC / deep links).
function renderMarkdown(content: string): { html: string; toc: TocItem[] } {
  let html = marked.parse(content, { async: false }) as string;

  html = html.replace(
    /<pre><code(?:\s+class="language-([a-z0-9+-]+)")?>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, lang: string, code: string) => {
      const plain = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
      let out: string;
      try {
        out =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(plain, { language: lang }).value
            : hljs.highlightAuto(plain).value;
      } catch {
        out = plain.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      const cls = lang ? ` class="hljs language-${lang}"` : ' class="hljs"';
      return `<pre><code${cls}>${out}</code></pre>`;
    }
  );

  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "");
    return `<h${level} id="${slugify(text)}">${inner}</h${level}>`;
  });

  const toc: TocItem[] = [];
  const re = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    toc.push({ level: Number(m[1]), text: m[3].replace(/<[^>]+>/g, ""), id: m[2] });
  }

  return { html, toc };
}

function loadPost(file: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw) as {
    data: { title?: string; description?: string; date?: string; tags?: string[] };
    content: string;
  };
  const slug = slugify(file.replace(/\.md$/, ""));
  const { html, toc } = renderMarkdown(content);
  const { words, minutes } = readingTime(content.replace(/```[\s\S]*?```/g, " "));
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date || file,
    tags: Array.isArray(data.tags) ? data.tags : [],
    html,
    text: content,
    words,
    minutes,
    toc,
  };
}

export function getPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md")).sort();
  const posts = files.map(loadPost);
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return getPosts().map((p) => p.slug);
}

export const postUrl = (post: Post) => `${SITE.url}/blog/${post.slug}/`;
export const indexUrl = `${SITE.url}/blog/`;
