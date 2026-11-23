interface BlogHeaderProps {
  active?: "portfolio" | "blog";
}

/** Blog site header — shared by the blog index and post pages. */
export default function BlogHeader({ active = "blog" }: BlogHeaderProps) {
  const cls = (key: string) => (active === key ? "active" : "");
  return (
    <header className="blog-header">
      <a className="blog-brand" href="/">
        MG<span>.</span>
      </a>
      <nav className="blog-nav" aria-label="Main">
        <a className={cls("portfolio")} href="/">
          Portfolio
        </a>
        <a className={cls("blog")} href="/blog/">
          Blog
        </a>
        <a href="https://github.com/imgul">GitHub</a>
        <a href="https://www.linkedin.com/in/gulzaib-ai">LinkedIn</a>
        <a className="rss" href="/blog/feed.xml" aria-label="RSS feed">
          RSS
        </a>
      </nav>
    </header>
  );
}
