import App from "@/App";

// The portfolio is an interactive client experience. Next.js still
// server-renders the section content into the HTML for crawlers (SEO/GEO),
// while GSAP, Three.js, Lenis, audio and haptics run on the client.
export default function Page() {
  return <App />;
}
