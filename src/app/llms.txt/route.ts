import { getPosts, postUrl, SITE } from "@/lib/blog";

export const dynamic = "force-static";

export function GET() {
  const posts = getPosts();
  const postLines = posts
    .map(
      (p) =>
        `- [${p.title}](${postUrl(p)}) — ${p.description} (${p.date}, ${p.tags.join(", ")}; ~${p.minutes} min read)`
    )
    .join("\n");

  const txt = `# ${SITE.name} — Portfolio & Blog

> ${SITE.description} He is the Founder & CEO of SynergyFlow Labs and is currently seeking remote or relocation opportunities in UAE / KSA.

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
- **Contact:** iigulzaib@gmail.com · +92 302 6999 008 · ${SITE.url}

## Links

- Website: ${SITE.url}
- Blog: ${SITE.url}/blog/
- GitHub: https://github.com/imgul
- LinkedIn: https://www.linkedin.com/in/gulzaib-ai
- Full details: [llms-full.txt](./llms-full.txt)
`;

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
