import { tagColor, type Post } from "@/lib/blog";

/** Decorative inline-SVG banner, consistent with the portfolio's dark aesthetic. */
export default function BlogBanner({ post }: { post: Post }) {
  const colors = post.tags.map(tagColor);
  const c1 = colors[0] || "#c6ff3d";
  const c2 = colors[1] || "#8b6cff";
  const gid = `g${c1.replace("#", "")}`;
  const lines = Array.from({ length: 14 }, (_, i) => (
    <path
      key={i}
      d={`M${-100 + i * 100} 330 L${120 + i * 100} -40`}
      stroke={`url(#${gid})`}
      strokeOpacity={0.1}
      strokeWidth={2}
    />
  ));
  return (
    <svg
      className="banner"
      viewBox="0 0 1200 320"
      role="img"
      aria-label="Decorative banner"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0c0c14" />
          <stop offset="1" stopColor="#100e1a" />
        </linearGradient>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c1} stopOpacity={0.9} />
          <stop offset="1" stopColor={c2} stopOpacity={0.9} />
        </linearGradient>
      </defs>
      <rect width="1200" height="320" rx="16" fill="url(#bbg)" />
      {lines}
      <circle cx="960" cy="80" r="120" stroke={c1} strokeOpacity={0.18} strokeWidth={2} />
      <circle cx="960" cy="80" r="70" stroke={c2} strokeOpacity={0.25} strokeWidth={2} />
      <rect x="56" y="56" width="120" height="8" rx="4" fill={c1} opacity={0.9} />
      <rect x="56" y="84" width="220" height="6" rx="3" fill="#eae9f2" opacity={0.25} />
    </svg>
  );
}
