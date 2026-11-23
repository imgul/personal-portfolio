import type { Metadata, Viewport } from "next";
import "../index.css";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://gulzaib.vercel.app"),
  title: {
    default: "Muhammad Gulzaib — Full Stack Engineer · AI Systems · SaaS Founder",
    template: "%s — Muhammad Gulzaib",
  },
  description:
    "Muhammad Gulzaib is a Senior Full Stack Engineer, AI systems builder and SaaS founder based in Islamabad, Pakistan. He builds SaaS products, AI agents, startup MVPs, ERP systems and RAG pipelines with Laravel, React and Python.",
  keywords: [
    "Muhammad Gulzaib",
    "Full Stack Engineer",
    "Laravel",
    "React",
    "AI systems",
    "RAG",
    "Agentic AI",
    "SaaS",
    "Startup",
    "Islamabad",
  ],
  authors: [{ name: "Muhammad Gulzaib", url: "https://gulzaib.vercel.app" }],
  creator: "Muhammad Gulzaib",
  publisher: "Muhammad Gulzaib",
  openGraph: {
    type: "website",
    siteName: "Muhammad Gulzaib",
    url: "https://gulzaib.vercel.app",
    title: "Muhammad Gulzaib — Full Stack Engineer · AI Systems · SaaS Founder",
    description:
      "Senior Full Stack Engineer, AI systems builder and SaaS founder. Laravel, React, AI systems, RAG, SaaS — turning ideas into products people pay for.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Muhammad Gulzaib — Full Stack Engineer, AI Systems, SaaS Founder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Gulzaib — Full Stack Engineer · AI Systems · SaaS Founder",
    description:
      "Senior Full Stack Engineer, AI systems builder and SaaS founder. Laravel, React, AI systems, RAG, SaaS.",
    images: ["/og.png"],
    creator: "@gulzaib",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://gulzaib.vercel.app/",
    types: {
      "application/rss+xml": [
        { url: "/blog/feed.xml", title: "Muhammad Gulzaib — Blog" },
      ],
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: ["/apple-touch-icon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#07070b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://gulzaib.vercel.app/#person",
      name: "Muhammad Gulzaib",
      givenName: "Muhammad",
      familyName: "Gulzaib",
      jobTitle: "Senior Full Stack Engineer",
      headline: "Senior Full Stack Engineer | Laravel | React | AI Systems | SaaS",
      email: "mailto:iigulzaib@gmail.com",
      telephone: "+92-302-6999-008",
      url: "https://gulzaib.vercel.app/",
      sameAs: [
        "https://gulzaib.dev",
        "https://github.com/imgul",
        "https://www.linkedin.com/in/gulzaib-ai",
        "https://oxygenlms.com",
        "https://anysub.app",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Islamabad",
        addressCountry: "PK",
      },
      worksFor: { "@type": "Organization", name: "SynergyFlow Labs" },
      knowsAbout: [
        "Laravel",
        "React",
        "PHP",
        "Python Flask",
        "RAG",
        "Agentic AI",
        "Multi-agent systems",
        "SaaS architecture",
        "SaaS",
        "ERP",
        "MVPs",
        "Docker",
        "MySQL",
        "MongoDB",
        "OpenAI APIs",
        "Hugging Face",
        "AI automation",
        "TensorFlow",
        "PyTorch",
        "JavaScript",
        "HTML5",
        "CSS3",
        "TailwindCSS",
        "CodeIgniter",
        "Symfony",
        "CI/CD",
      ],
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Virtual University of Pakistan",
      },
      education: {
        "@type": "EducationalOccupationalCredential",
        name: "BS Software Engineering",
        credentialCategory: "Bachelor Degree",
        dateCredential: "2019-2023",
        about: "Grade A",
      },
    },
    {
      "@type": "WebSite",
      name: "Muhammad Gulzaib — Portfolio",
      url: "https://gulzaib.vercel.app/",
      description:
        "An interactive 3D, sound and haptics portfolio of Muhammad Gulzaib, Senior Full Stack Engineer, AI systems builder and SaaS founder.",
      sitelink: [{ "@type": "WebPage", name: "Blog", url: "https://gulzaib.vercel.app/blog/" }],
    },
    {
      "@type": "Blog",
      name: "Muhammad Gulzaib — Blog",
      url: "https://gulzaib.vercel.app/blog/",
      description:
        "Field notes on software engineering, AI systems, RAG, shaders and building SaaS products.",
      inLanguage: "en",
      publisher: { "@type": "Person", name: "Muhammad Gulzaib", url: "https://gulzaib.vercel.app/" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,16..72,400;0,16..72,500;0,16..72,600;1,16..72,400&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <JsonLd data={graph} />
      </body>
    </html>
  );
}
