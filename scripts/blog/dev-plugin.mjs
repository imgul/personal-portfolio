// Vite dev plugin: serves blog pages (index, posts, feed) from content/blog
// without writing artifacts to disk — keeps dev fully working on /blog/*.
import { loadPosts, renderPost, renderIndex, renderFeed } from "./lib.mjs";

export default function blogDevPlugin() {
  let cache = null;
  function getPosts() {
    if (!cache) cache = loadPosts();
    return cache;
  }

  return {
    name: "blog-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || "").split("?")[0]);
        const m = url.match(/^\/blog(?:\/(.*))?\/?$/);
        if (!m) return next();

        const rest = (m[1] || "").replace(/\/$/, "");
        if (rest === "" || rest === "index") {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(renderIndex(getPosts()));
          return;
        }
        if (rest === "feed.xml") {
          res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
          res.end(renderFeed(getPosts()));
          return;
        }
        const post = getPosts().find((p) => p.slug === rest);
        if (!post) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderPost(post, getPosts()));
      });
    },
  };
}
