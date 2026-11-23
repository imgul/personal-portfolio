/** Blog site footer — shared by the blog index and post pages. */
export default function BlogFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="blog-footer">
      <div className="footer-inner">
        <span>
          © {year} Muhammad Gulzaib · Built with React, Three.js &amp; GSAP
        </span>
        <nav className="links" aria-label="Footer">
          <a href="/">Portfolio</a>
          <a href="/blog/">Blog</a>
          <a href="/blog/feed.xml">RSS</a>
          <a href="https://github.com/imgul">GitHub</a>
          <a href="mailto:iigulzaib@gmail.com">Email</a>
        </nav>
      </div>
    </footer>
  );
}
