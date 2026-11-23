// Build step: renders the blog into dist/ as static, crawlable HTML.
// Runs after `vite build` (which copies public/ and bundles the SPA).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPosts, renderPost, renderIndex, renderFeed, SITE, postUrl, indexUrl } from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../../dist");

function write(relPath, content) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`  blog → ${relPath}`);
}

const posts = loadPosts();
if (!posts.length) {
  console.log("  blog: no posts found in content/blog — skipping");
  process.exit(0);
}

// Blog index
write("blog/index.html", renderIndex(posts));

// One directory per post: clean URLs (/blog/<slug>/) that work on static hosts
for (const post of posts) {
  write(`blog/${post.slug}/index.html`, renderPost(post, posts));
}

// RSS feed
write("blog/feed.xml", renderFeed(posts));

// Sitemap: home + blog index + posts
const urls = [
  { loc: `${SITE.url}/`, lastmod: posts[0] ? new Date(posts[0].date).toISOString().slice(0, 10) : null, priority: "1.0", changefreq: "monthly" },
  { loc: indexUrl, lastmod: posts[0] ? new Date(posts[0].date).toISOString().slice(0, 10) : null, priority: "0.9", changefreq: "weekly" },
  ...posts.map((p) => ({
    loc: postUrl(p),
    lastmod: new Date(p.date).toISOString().slice(0, 10),
    priority: "0.7",
    changefreq: "monthly",
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);

// llms.txt — AI-engine summary, now including the blog
const postLines = posts
  .map(
    (p) =>
      `- [${p.title}](${postUrl(p)}) — ${p.description} (${p.date}, ${p.tags.join(", ")}; ~${p.minutes} min read)`
  )
  .join("\n");
const llmsTxt = `# Muhammad Gulzaib — Portfolio & Blog

> Muhammad Gulzaib is a Senior Full Stack Engineer, AI systems builder and SaaS founder based in Islamabad, Pakistan. He builds SaaS products, AI agents, startup MVPs, ERP systems and RAG pipelines with Laravel, React and Python. He is the Founder & CEO of SynergyFlow Labs and is currently seeking remote or relocation opportunities in UAE / KSA.

## The site

An interactive, motion-animated portfolio built with React, Three.js, GSAP and Lenis, featuring generative audio and haptics, plus a static, SEO-optimized blog with long-form engineering and AI-research writing.

## Blog (writing)

${postLines || "- (no posts yet)"}

## Key facts

- **Role:** Senior Full Stack Engineer · AI Systems · SaaS Founder
- **Location:** Islamabad, Pakistan (open to remote · UAE · KSA)
- **Stack:** Laravel, React, Python Flask, Docker, MySQL, Tailwind, RAG, Agentic AI, OpenAI APIs
- **Experience:** 5+ years — Founder & CEO (SynergyFlow Labs), Senior Software Engineer (Exertlogics), PHP Laravel Developer (DW Solution Online Ltd), PHP Developer (Bitz Studio), Full Stack Freelance, Full Stack Developer (RZ Lab)
- **Education:** BS Software Engineering, Virtual University of Pakistan (2019–2023, Grade A)
- **Ventures:** SynergyFlow Labs (Founder & CEO), Oxygen LMS (Founder · Architect), AnySub (Founder), ZeroExam AI (Founder), Sehat Bunyad (CTO), AI Systems (Engineer)
- **Contact:** iigulzaib@gmail.com · +92 302 6999 008 · https://gulzaib.vercel.app

## Links

- Website: https://gulzaib.vercel.app
- Blog: https://gulzaib.vercel.app/blog/
- GitHub: https://github.com/imgul
- LinkedIn: https://www.linkedin.com/in/gulzaib-ai
- Full details: [llms-full.txt](./llms-full.txt)
`;
write("llms.txt", llmsTxt);

// llms-full.txt — full content dump including blog posts
const blogSection = posts
  .map(
    (p) =>
      `## ${p.title}\n\n${p.text.trim()}\n\n---\n`
  )
  .join("\n");
let llmsFull = "";
try {
  llmsFull = fs.readFileSync(path.join(DIST, "llms-full.txt"), "utf8");
} catch {
  llmsFull = `# Muhammad Gulzaib — Complete Content\n\n${SITE.description}\n`;
}
if (!llmsFull.includes("## Blog")) {
  llmsFull = `${llmsFull.trimEnd()}\n\n## Blog\n\n${blogSection}`;
}
write("llms-full.txt", llmsFull);

console.log(`\n  blog: ${posts.length} post(s) rendered to dist/blog`);
