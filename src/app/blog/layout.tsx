import type { Metadata } from "next";
import "./blog.css";
import BlogHeader from "@/components/BlogHeader";
import BlogFooter from "@/components/BlogFooter";
import BlogProgress from "@/components/BlogProgress";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products — by Muhammad Gulzaib, Senior Full Stack Engineer and SaaS founder.",
  alternates: {
    canonical: "https://gulzaib.vercel.app/blog/",
  },
  openGraph: {
    type: "website",
    url: "https://gulzaib.vercel.app/blog/",
    siteName: "Muhammad Gulzaib",
    images: [
      {
        url: "/og-blog.png",
        width: 1200,
        height: 630,
        alt: "Muhammad Gulzaib — Blog",
      },
    ],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogProgress />
      <BlogHeader active="blog" />
      <main className="blog-shell">{children}</main>
      <BlogFooter />
    </>
  );
}
