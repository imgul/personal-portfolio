// Blog rendering library — shared by the build script (scripts/blog/build.mjs)
// and the Vite dev middleware (scripts/blog/dev-plugin.mjs).
// Renders Markdown posts into fully static, SEO/GEO/AIEO-ready HTML pages.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import hljs from "highlight.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, "../../content/blog");
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

const TAG_COLORS = {
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
export const tagColor = (tag) => TAG_COLORS[tag] || "#c6ff3d";

const HLJS_THEME = `
.hljs{color:#eae9f2;background:transparent}
.hljs-comment,.hljs-quote{color:#6b6a80;font-style:italic}
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type{color:#ff9ecd}
.hljs-string,.hljs-regexp,.hljs-doctag,.hljs-meta .hljs-string{color:#a7f3a0}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-link{color:#ffd166}
.hljs-title,.hljs-section,.hljs-name,.hljs-selector-id,.hljs-selector-class{color:#7ee0ff}
.hljs-attr,.hljs-attribute,.hljs-variable,.hljs-template-variable,.hljs-class .hljs-title{color:#e0c1ff}
.hljs-built_in,.hljs-builtin-name{color:#ffd166}
.hljs-meta{color:#6b6a80}
.hljs-deletion{color:#ff5c8a;background:rgba(255,92,138,.12)}
.hljs-addition{color:#a7f3a0;background:rgba(167,243,160,.12)}
`;

const CSS = `
:root{
  --ink:#07070b; --ink-2:#0d0d14; --paper:#eae9f2; --paper-soft:#d8d7e2;
  --lime:#c6ff3d; --violet:#8b6cff; --hot:#ff5c8a; --muted:#8a8899; --line:rgba(234,233,242,.12);
  --font-display:"Space Grotesk",ui-sans-serif,system-ui,sans-serif;
  --font-body:"Newsreader",Georgia,"Times New Roman",serif;
  --font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,monospace;
}
*{box-sizing:border-box}
html{overflow-x:hidden;overflow-x:clip;max-width:100%}
body{
  margin:0;background:var(--ink);color:var(--paper-soft);
  font-family:var(--font-body);font-size:1.0625rem;line-height:1.75;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
  overflow-x:hidden;overflow-x:clip;
}
::selection{background:rgba(198,255,61,.28);color:#fff}
:focus-visible{outline:2px solid var(--lime);outline-offset:2px;border-radius:4px}
a{color:var(--lime);text-decoration:none;transition:color .15s ease}
a:hover{color:#fff}
img,svg{max-width:100%;height:auto}

/* progress bar */
#progress{position:fixed;top:0;left:0;height:2px;width:0;background:var(--lime);z-index:60;box-shadow:0 0 12px rgba(198,255,61,.6)}

/* site header */
.site-header{
  position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;
  padding:14px clamp(1rem,4vw,3rem);border-bottom:1px solid var(--line);
  background:rgba(7,7,11,.82);backdrop-filter:blur(12px);
}
.brand{font-family:var(--font-display);font-weight:800;font-size:1.15rem;letter-spacing:-.01em;color:var(--paper)}
.brand span{color:var(--lime)}
.site-nav{display:flex;align-items:center;gap:1.5rem;font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.14em}
.site-nav a{color:var(--paper-soft);transition:color .15s ease}
.site-nav a:hover{color:var(--lime)}
.site-nav a.active{color:var(--lime)}
.site-nav .rss{opacity:.65}
@media(max-width:640px){.site-nav{gap:1rem;font-size:.7rem}}

.shell{max-width:1120px;margin:0 auto;padding:clamp(2rem,5vw,4rem) clamp(1rem,4vw,3rem) 3rem}

/* index hero */
.blog-hero{max-width:760px;margin-bottom:3.5rem}
.eyebrow{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.22em;color:var(--lime)}
.blog-hero h1{font-family:var(--font-display);font-weight:800;letter-spacing:-.02em;line-height:1.05;font-size:clamp(2.2rem,5vw,3.6rem);margin:.6rem 0 1rem;color:var(--paper)}
.blog-hero p{color:var(--muted);font-size:1.1rem;max-width:60ch}
.blog-hero .rss-note{margin-top:1.2rem;font-family:var(--font-mono);font-size:.78rem;color:var(--muted)}

/* post list */
.post-list{display:flex;flex-direction:column;gap:1.25rem}
.post-card{
  display:block;border:1px solid var(--line);border-radius:16px;padding:1.4rem 1.6rem;
  background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));
  transition:border-color .2s ease,transform .2s ease,background .2s ease;
}
.post-card:hover{border-color:rgba(198,255,61,.45);transform:translateY(-2px);background:linear-gradient(180deg,rgba(198,255,61,.06),rgba(255,255,255,.012))}
.post-meta{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);display:flex;flex-wrap:wrap;gap:.7rem;align-items:center}
.post-meta .dot{opacity:.5}
.post-card h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.01em;line-height:1.25;font-size:1.4rem;margin:.5rem 0 .45rem;color:var(--paper)}
.post-card p{margin:0;color:var(--paper-soft);font-size:.98rem}
.tag-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.85rem}
.tag{font-family:var(--font-mono);font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--paper-soft);border:1px solid var(--line);border-radius:999px;padding:.22rem .7rem}

/* article layout */
.article-wrap{display:grid;grid-template-columns:1fr;gap:2rem}
@media(min-width:1120px){.article-wrap{grid-template-columns:minmax(0,1fr) 240px;gap:3rem}}
.article{max-width:720px;margin:0 auto;width:100%}
@media(min-width:1120px){.article{margin:0}}
.crumbs{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:1.6rem}
.crumbs a{color:var(--muted)}
.crumbs a:hover{color:var(--lime)}
.crumbs .sep{margin:0 .5rem;opacity:.5}
.article h1{font-family:var(--font-display);font-weight:800;letter-spacing:-.025em;line-height:1.1;font-size:clamp(1.9rem,4.4vw,2.9rem);margin:.4rem 0 1rem;color:var(--paper)}
.article .lede{color:var(--paper-soft);font-size:1.12rem;margin:0 0 1.4rem}
.article .post-meta{margin-bottom:1.6rem}
.banner{width:100%;height:auto;border-radius:16px;border:1px solid var(--line);display:block;margin:0 0 2.2rem}

/* prose */
.prose{font-family:var(--font-body)}
.prose p{margin:1.2rem 0}
.prose h2{font-family:var(--font-display);font-weight:700;letter-spacing:-.015em;font-size:1.55rem;line-height:1.3;color:var(--paper);margin:2.6rem 0 .9rem;scroll-margin-top:90px}
.prose h2::before{content:"";display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--lime);margin-right:.6rem;transform:translateY(-2px);box-shadow:0 0 12px rgba(198,255,61,.5)}
.prose h3{font-family:var(--font-display);font-weight:700;font-size:1.18rem;color:var(--paper);margin:2rem 0 .7rem;scroll-margin-top:90px}
.prose ul,.prose ol{margin:1.2rem 0;padding-left:1.4rem}
.prose li{margin:.45rem 0}
.prose li::marker{color:var(--lime)}
.prose strong{color:var(--paper)}
.prose em{color:var(--paper-soft)}
.prose blockquote{
  margin:1.6rem 0;padding:.2rem 0 .2rem 1.2rem;border-left:3px solid var(--lime);
  color:var(--paper);font-style:italic;font-size:1.1rem;
}
.prose blockquote p{margin:.5rem 0}
.prose hr{border:none;border-top:1px solid var(--line);margin:2.6rem 0}
.prose table{width:100%;border-collapse:collapse;margin:1.4rem 0;font-size:.92rem;display:block;overflow-x:auto}
.prose th,.prose td{border:1px solid var(--line);padding:.55rem .8rem;text-align:left}
.prose th{background:rgba(255,255,255,.04);color:var(--paper);font-family:var(--font-mono);font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}
.prose img{border-radius:12px;border:1px solid var(--line);margin:1.6rem 0}

/* code blocks — scroll inside, never the page */
.prose pre{
  margin:1.4rem 0;padding:1.1rem 1.3rem;border-radius:12px;border:1px solid var(--line);
  background:var(--ink-2);overflow-x:auto;font-size:.86rem;line-height:1.6;
}
.prose code{font-family:var(--font-mono);font-size:.88em}
.prose :not(pre)>code{background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:6px;padding:.12rem .4rem;color:#dff5a8;white-space:nowrap}
.prose pre code{background:none;border:none;padding:0;color:inherit;white-space:pre}

/* TOC */
.toc{position:relative}
@media(min-width:1120px){.toc{position:sticky;top:100px;align-self:start}}
.toc-title{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.18em;color:var(--muted);margin-bottom:.9rem}
.toc ol{list-style:none;margin:0;padding:0;border-left:1px solid var(--line)}
.toc li{margin:0}
.toc a{display:block;padding:.32rem 0 .32rem .9rem;margin-left:-1px;border-left:2px solid transparent;font-family:var(--font-sans,var(--font-body));font-size:.86rem;color:var(--paper-soft);line-height:1.4;transition:color .15s ease,border-color .15s ease}
.toc a:hover,.toc a.active{color:var(--lime);border-left-color:var(--lime)}
.toc li.lvl-3 a{padding-left:1.9rem;font-size:.8rem;color:var(--muted)}
.toc .toc-empty{color:var(--muted);font-size:.85rem}
@media(max-width:1119px){.toc-mobile{margin:0 0 2rem}}
.toc-mobile details{border:1px solid var(--line);border-radius:12px;padding:.8rem 1rem;background:rgba(255,255,255,.02)}
.toc-mobile summary{cursor:pointer;font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.14em;color:var(--paper-soft);list-style:none}
.toc-mobile summary::-webkit-details-marker{display:none}
.toc-mobile summary::after{content:"+";color:var(--lime);float:right}
.toc-mobile details[open] summary::after{content:"–"}
.toc-mobile ol{margin:.8rem 0 0;padding-left:1.1rem;font-size:.9rem}

/* post footer */
.post-foot{margin-top:3rem;padding-top:1.6rem;border-top:1px solid var(--line)}
.share{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;font-family:var(--font-mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:1.8rem}
.share a{border:1px solid var(--line);border-radius:999px;padding:.4rem .9rem;color:var(--paper-soft)}
.share a:hover{border-color:var(--lime);color:var(--lime)}
.post-nav{display:grid;grid-template-columns:1fr;gap:1rem}
@media(min-width:760px){.post-nav{grid-template-columns:1fr 1fr}}
.post-nav a{border:1px solid var(--line);border-radius:14px;padding:1rem 1.2rem;display:block;transition:border-color .2s ease}
.post-nav a:hover{border-color:rgba(198,255,61,.45)}
.post-nav .label{font-family:var(--font-mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.post-nav .title{font-family:var(--font-display);font-weight:600;color:var(--paper);margin-top:.3rem;line-height:1.3}
.post-nav .next{text-align:right}

.back-link{display:inline-block;margin-top:2rem;font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.14em;color:var(--paper-soft)}
.back-link:hover{color:var(--lime)}

/* site footer */
.site-footer{border-top:1px solid var(--line);margin-top:4rem;padding:2.4rem clamp(1rem,4vw,3rem);font-family:var(--font-mono);font-size:.78rem;color:var(--muted)}
.site-footer .footer-inner{max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center}
.site-footer a{color:var(--paper-soft)}
.site-footer a:hover{color:var(--lime)}
.site-footer .links{display:flex;gap:1.4rem;flex-wrap:wrap}

.fonts{font-family:var(--font-sans,var(--font-body))}
`;

// ---------- helpers ----------

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// JSON-LD must not contain raw </script>
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function isoDate(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 220)) };
}

// Highlight code blocks in rendered HTML and add heading ids for the TOC.
function highlightAndAnchor(html) {
  // code blocks: <pre><code class="language-x">...</code></pre>
  return html.replace(/<pre><code(?:\s+class="language-([a-z0-9+-]+)")?>([\s\S]*?)<\/code><\/pre>/gi, (_m, lang, code) => {
    const plain = code
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
    let out;
    try {
      out = lang && hljs.getLanguage(lang) ? hljs.highlight(plain, { language: lang }).value : escapeHtml(plain);
    } catch {
      out = escapeHtml(plain);
    }
    const cls = lang ? ` class="hljs language-${lang}"` : ' class="hljs"';
    return `<pre><code${cls}>${out}</code></pre>`;
  }).replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    return `<h${level} id="${slugify(text)}">${inner}</h${level}>`;
  });
}

function extractToc(html) {
  const toc = [];
  const re = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    toc.push({ level: Number(m[1]), text: m[3].replace(/<[^>]+>/g, ""), id: m[2] });
  }
  return toc;
}

// ---------- content loading ----------

export function loadPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md")).sort();
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = slugify(file.replace(/\.md$/, ""));
    const rendered = highlightAndAnchor(marked.parse(content, { async: false }));
    const { words, minutes } = readingTime(content.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`\-]/g, " "));
    const toc = extractToc(rendered);
    return {
      slug,
      file,
      title: data.title || slug,
      description: data.description || "",
      date: data.date || file,
      tags: Array.isArray(data.tags) ? data.tags : [],
      html: rendered,
      text: content,
      words,
      minutes,
      toc,
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

export const postUrl = (post) => `${SITE.url}/blog/${post.slug}/`;
export const indexUrl = `${SITE.url}/blog/`;

// ---------- shared partials ----------

function head({ title, description, canonical, ogType, extra }) {
  const url = canonical;
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta name="theme-color" content="#07070b" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(SITE.name)} — Blog" href="/blog/feed.xml" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="${SITE.ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(SITE.name)} — Blog" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE.ogImage}" />
  <meta name="twitter:creator" content="@gulzaib" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,16..72,400;0,16..72,500;0,16..72,600;1,16..72,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
  <style>${CSS}${HLJS_THEME}</style>
${extra || ""}`;
}

function header(active) {
  const nav = (href, label, key) =>
    `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`;
  return `<header class="site-header">
  <a class="brand" href="/">MG<span>.</span></a>
  <nav class="site-nav" aria-label="Main">
    ${nav("/", "Portfolio", "portfolio")}
    ${nav("/blog/", "Blog", "blog")}
    ${nav("https://github.com/imgul", "GitHub", "github")}
    ${nav("https://www.linkedin.com/in/gulzaib-ai", "LinkedIn", "linkedin")}
    <a class="rss" href="/blog/feed.xml" aria-label="RSS feed">RSS</a>
  </nav>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-inner">
    <span>© ${new Date().getFullYear()} Muhammad Gulzaib · Built with React, Three.js &amp; GSAP</span>
    <nav class="links" aria-label="Footer">
      <a href="/">Portfolio</a>
      <a href="/blog/">Blog</a>
      <a href="/blog/feed.xml">RSS</a>
      <a href="https://github.com/imgul">GitHub</a>
      <a href="mailto:iigulzaib@gmail.com">Email</a>
    </nav>
  </div>
</footer>`;
}

function progressScript() {
  return `<script>
(function(){
  var bar=document.getElementById("progress");
  if(!bar)return;
  function up(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?Math.min(100,(h.scrollTop||document.body.scrollTop||0)/max*100):0)+"%";
  }
  window.addEventListener("scroll",up,{passive:true});
  window.addEventListener("resize",up);
  up();
})();
</script>`;
}

// ---------- page renderers ----------

export function renderPost(post, posts) {
  const url = postUrl(post);
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const prev = idx < posts.length - 1 ? posts[idx + 1] : null; // older post
  const next = idx > 0 ? posts[idx - 1] : null; // newer post
  const related = posts.filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))).slice(0, 2);
  const relatedList = related.length ? related : posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const tocItems = post.toc
    .map((t) => `<li class="lvl-${t.level}"><a href="#${t.id}" data-toc="${t.id}">${escapeHtml(t.text)}</a></li>`)
    .join("\n");
  const published = isoDate(post.date);
  const tocJson = jsonLd({
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
    publisher: {
      "@type": "Person",
      name: SITE.author.name,
      url: SITE.author.url,
    },
  });
  const crumbsJson = jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: indexUrl },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  });

  const tocHtml = post.toc.length
    ? `<nav class="toc" aria-label="Table of contents">
      <p class="toc-title">On this page</p>
      <ol>
      ${tocItems}
      </ol>
    </nav>`
    : `<nav class="toc" aria-label="Table of contents"><p class="toc-empty">Short read — no sections.</p></nav>`;
  const tocMobileHtml = post.toc.length
    ? `<div class="toc-mobile"><details><summary>On this page</summary><ol>${tocItems}</ol></details></div>`
    : "";

  const tagsHtml = post.tags.map((t) => `<a class="tag" href="/blog/#tag-${slugify(t)}">${escapeHtml(t)}</a>`).join("");

  const twitter = `<meta name="twitter:label1" content="Written by" />
  <meta name="twitter:data1" content="${escapeHtml(SITE.author.name)}" />`;

  return `<!doctype html>
<html lang="en">
<head>
${head({
    title: `${post.title} — ${SITE.name}`,
    description: post.description,
    canonical: url,
    ogType: "article",
    extra: `  <meta property="article:published_time" content="${published}" />
  <meta property="article:modified_time" content="${published}" />
  <meta property="article:tag" content="${escapeHtml(post.tags.join(", "))}" />
  <meta property="article:author" content="${escapeHtml(SITE.author.name)}" />
  ${twitter}
  <script type="application/ld+json">${tocJson}</script>
  <script type="application/ld+json">${crumbsJson}</script>`,
  })}
</head>
<body>
<div id="progress" role="progressbar" aria-label="Reading progress"></div>
${header("blog")}
<main class="shell">
  <div class="article-wrap">
    <article class="article">
      <p class="crumbs"><a href="/">Home</a><span class="sep">/</span><a href="/blog/">Blog</a></p>
      <div class="post-meta">
        <time datetime="${published}">${formatDate(post.date)}</time>
        <span class="dot">·</span>
        <span>${post.minutes} min read</span>
        <span class="dot">·</span>
        <span>${post.words.toLocaleString()} words</span>
      </div>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="lede">${escapeHtml(post.description)}</p>
      <div class="tag-row">${tagsHtml}</div>
      ${postTocBanner(post)}
      <div class="prose">${post.html}</div>
      <div class="post-foot">
        <div class="share">
          <span>Share</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + " — " + SITE.name)}&url=${encodeURIComponent(url)}" rel="noopener">Twitter / X</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" rel="noopener">LinkedIn</a>
          <a href="${url}" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href);return false;">Copy link</a>
        </div>
        ${relatedList.length ? `<div class="post-nav" aria-label="More posts">${relatedList
            .map(
              (r) =>
                `<a href="/blog/${r.slug}/"><span class="label">Keep reading</span><span class="title">${escapeHtml(r.title)}</span></a>`
            )
            .join("")}</div>` : ""}
        <div class="post-nav">
          ${prev ? `<a href="/blog/${prev.slug}/"><span class="label">← Older</span><span class="title">${escapeHtml(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a class="next" href="/blog/${next.slug}/"><span class="label">Newer →</span><span class="title">${escapeHtml(next.title)}</span></a>` : '<span></span>'}
        </div>
        <a class="back-link" href="/blog/">← Back to all posts</a>
      </div>
    </article>
    ${tocHtml}
  </div>
</main>
${footer()}
${tocMobileHtml && tocMobileHtml ? `<script>document.querySelector(".toc-mobile")&&(function(){var d=document.querySelector(".toc-mobile details");window.addEventListener("hashchange",function(){if(location.hash)d&&d.setAttribute("open","");});})();</script>` : ""}
${progressScript()}
</body>
</html>`;
}

function postTocBanner(post) {
  // Decorative inline-SVG banner, consistent with the portfolio's dark aesthetic
  const colors = post.tags.map(tagColor);
  const c1 = colors[0] || "#c6ff3d";
  const c2 = colors[1] || "#8b6cff";
  return `<svg class="banner" viewBox="0 0 1200 320" role="img" aria-label="Decorative banner" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c0c14"/>
      <stop offset="1" stop-color="#100e1a"/>
    </linearGradient>
    <linearGradient id="g${c1.replace("#", "")}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c1}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${c2}" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="320" rx="16" fill="url(#bg)"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M${-100 + i * 100} 330 L${120 + i * 100} -40" stroke="url(#g${c1.replace("#", "")})" stroke-opacity="0.10" stroke-width="2"/>`).join("")}
  <circle cx="960" cy="80" r="120" stroke="${c1}" stroke-opacity="0.18" stroke-width="2"/>
  <circle cx="960" cy="80" r="70" stroke="${c2}" stroke-opacity="0.25" stroke-width="2"/>
  <rect x="56" y="56" width="120" height="8" rx="4" fill="${c1}" opacity="0.9"/>
  <rect x="56" y="84" width="220" height="6" rx="3" fill="#eae9f2" opacity="0.25"/>
</svg>`;
}

export function renderIndex(posts) {
  const url = indexUrl;
  const cards = posts
    .map((p) => {
      const published = isoDate(p.date);
      const tags = p.tags.map((t) => `<a class="tag" href="/blog/#tag-${slugify(t)}">${escapeHtml(t)}</a>`).join("");
      return `<a class="post-card" href="/blog/${p.slug}/">
        <div class="post-meta">
          <time datetime="${published}">${formatDate(p.date)}</time>
          <span class="dot">·</span>
          <span>${p.minutes} min read</span>
        </div>
        <h2>${escapeHtml(p.title)}</h2>
        <p>${escapeHtml(p.description)}</p>
        <div class="tag-row">${tags}</div>
      </a>`;
    })
    .join("\n");

  const listJson = jsonLd({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} — Blog`,
    description: "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products.",
    url: url,
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
  });

  return `<!doctype html>
<html lang="en">
<head>
${head({
    title: `Blog — ${SITE.name}`,
    description:
      "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products — by Muhammad Gulzaib, Senior Full Stack Engineer and SaaS founder.",
    canonical: url,
    ogType: "website",
    extra: `<script type="application/ld+json">${listJson}</script>`,
  })}
</head>
<body>
<div id="progress" role="progressbar" aria-label="Reading progress"></div>
${header("blog")}
<main class="shell">
  <section class="blog-hero">
    <p class="eyebrow">Field notes · Writing</p>
    <h1>Notes on shipping software, AI systems and products.</h1>
    <p>Long-form writing on the engineering decisions behind agentic AI, RAG pipelines, web graphics and the business of building products — by Muhammad Gulzaib.</p>
    <p class="rss-note">Subscribe via <a href="/blog/feed.xml">RSS feed</a> to get every post.</p>
  </section>
  ${posts.length ? `<div class="post-list" data-list>${cards}</div>` : `<p style="color:var(--muted)">No posts yet — coming soon.</p>`}
</main>
${footer()}
${progressScript()}
</body>
</html>`;
}

export function renderFeed(posts) {
  const items = posts
    .slice(0, 20)
    .map((p) => {
      const url = postUrl(p);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Blog</title>
    <link>${escapeXml(SITE.url)}/blog/</link>
    <atom:link href="${escapeXml(SITE.url)}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml("Field notes on software engineering, AI systems, RAG, shaders and building SaaS products.")}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}
