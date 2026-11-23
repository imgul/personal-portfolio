export const profile = {
  name: "Muhammad Gulzaib",
  short: "MG",
  headline: "Senior Full Stack Engineer | Laravel | React | AI Systems | SaaS",
  email: "iigulzaib@gmail.com",
  phone: "+92 302 6999 008",
  location: "Islamabad, Pakistan",
  website: "https://gulzaib.dev",
  linkedin: "https://www.linkedin.com/in/gulzaib-ai",
  github: "https://github.com/imgul",
};

export const rotating = ["SaaS products", "AI agents", "startup MVPs", "ERP systems", "RAG pipelines"];

export const marquee = [
  "Laravel",
  "React",
  "Agentic AI",
  "RAG",
  "SaaS Architecture",
  "Python Flask",
  "Startups",
  "OpenAI APIs",
  "MVPs",
  "Docker",
  "PHP",
  "Next.js",
];

export const aboutParagraphs = [
  "Senior Full Stack Engineer with 5+ years of experience building scalable SaaS platforms and AI-powered web applications.",
  "Expert in Laravel, React and backend architecture, with hands-on experience in AI integrations — RAG, APIs and automation systems.",
  "Proven track record of delivering high-performance systems, mentoring developers, and contributing to product and system design.",
];

export const stats = [
  { value: 5, suffix: "+", label: "Years shipping software" },
  { value: 30, suffix: "%", label: "Team productivity lift from mentoring" },
  { value: 6, suffix: "", label: "Ventures & products built" },
  { value: 30, suffix: "+", label: "Technologies in the toolbox" },
];

export interface Venture {
  name: string;
  role: string;
  status: string;
  blurb: string;
  tags: string[];
  url?: string;
  accent: string;
  wide?: boolean;
}

export const ventures: Venture[] = [
  {
    name: "SynergyFlow Labs",
    role: "Founder & CEO",
    status: "Founded Jan 2025",
    blurb:
      "My AI-focused technology company. Agentic AI SaaS, rapid MVP development, ERP systems, custom business software and AI integrations — products over billable hours.",
    tags: ["Agentic AI", "SaaS", "MVPs", "ERP"],
    accent: "#c6ff3d",
    wide: true,
  },
  {
    name: "Oxygen LMS",
    role: "Founder · Architect",
    status: "Building",
    blurb:
      "A SaaS platform for schools, built on Laravel — attendance, reporting and user management today, growing toward a complete education OS: fees, HR, parent apps and AI teaching assistants.",
    tags: ["Laravel", "EdTech", "SaaS"],
    url: "https://oxygenlms.com",
    accent: "#3de8ff",
  },
  {
    name: "AnySub",
    role: "Founder",
    status: "Building in public",
    blurb:
      "“Any subscription. One system.” An operating system for subscriptions — track SaaS tools and trials, manage budgets, keep audit trails and let teams comment on spend.",
    tags: ["Subscriptions", "FinOps", "Product"],
    url: "https://anysub.app",
    accent: "#8b6cff",
  },
  {
    name: "ZeroExam AI",
    role: "Founder",
    status: "R&D",
    blurb:
      "Starting with a tool that lets teachers generate structured exam papers from subjects and topics — then heading toward AI checking of written answers for competitive exams.",
    tags: ["AI", "EdTech", "LLMs"],
    accent: "#ff5c8a",
  },
  {
    name: "Sehat Bunyad",
    role: "CTO",
    status: "Health-tech startup",
    blurb:
      "Leading technology as CTO at a healthcare startup shortlisted for the NIC Lahore Cohort 3 incubation programme.",
    tags: ["HealthTech", "Leadership", "Product"],
    accent: "#ffb23d",
  },
  {
    name: "AI Systems",
    role: "Engineer",
    status: "Shipped",
    blurb:
      "AI-integrated APIs built with Python Flask and Laravel, plus RAG-based systems powering intelligent workflows inside client applications.",
    tags: ["Flask", "RAG", "APIs"],
    accent: "#3dffb0",
  },
];

export const lessons = [
  {
    n: "01",
    title: "Validate before you build",
    text: "A POS SaaS taught me that customers needed offline + online. Months of code can't outrun a requirement you never asked about.",
  },
  {
    n: "02",
    title: "Distribution beats features",
    text: "Great engineering doesn't sell itself. Sales channels, demos and pilots come before the roadmap.",
  },
  {
    n: "03",
    title: "Real users, not feature lists",
    text: "School staff don't want more modules — they want simple, mobile-first tools they'll actually open every day.",
  },
  {
    n: "04",
    title: "Small & profitable wins",
    text: "A narrow product with paying customers beats a giant vision with none. Start tiny, earn the right to expand.",
  },
];

export const agents = [
  { name: "Research", log: "Scanning sources, competitors and pricing signals…" },
  { name: "Planning", log: "Breaking the goal into milestones and owners…" },
  { name: "Coding", log: "Drafting a Laravel module and its test suite…" },
  { name: "Operations", log: "Provisioning environments, queues and monitors…" },
  { name: "Marketing", log: "Writing the launch narrative and landing copy…" },
  { name: "Sales", log: "Qualifying leads and preparing follow-ups…" },
  { name: "Support", log: "Answering customers with RAG over the docs…" },
];

export const agentCaps = ["Tool use", "Memory", "RAG", "Autonomous workflows", "Human-in-the-loop"];

export interface Job {
  period: string;
  position: string;
  company: string;
  location: string;
  url?: string;
  points: string[];
}

export const experience: Job[] = [
  {
    period: "Jan 2025 — Present",
    position: "Founder & CEO",
    company: "SynergyFlow Labs",
    location: "Islamabad",
    points: [
      "Building agentic AI SaaS products, MVPs and ERP systems.",
      "Delivering custom business software and AI integrations for clients.",
      "Turning an individual-developer career into a product company.",
    ],
  },
  {
    period: "Sep 2024 — Jul 2025",
    position: "Senior Software Engineer",
    company: "Exertlogics",
    location: "Lahore",
    url: "https://exertlogics.com",
    points: [
      "Led development of scalable e-commerce platforms in PHP and React.js.",
      "Mentored juniors and fresh graduates — lifting team productivity by 30%.",
      "Built Laravel and Python Flask APIs connecting third-party AI services to client apps.",
      "Helped hire and onboard top-tier engineers; shaped secure MVC/OOP architecture.",
    ],
  },
  {
    period: "Jun 2024 — Sep 2024",
    position: "PHP Laravel Developer",
    company: "DW Solution Online Ltd",
    location: "Islamabad",
    url: "https://dwsolutionline.com/",
    points: [
      "Full-stack Laravel work alongside Python Flask services.",
      "Developed AI-integrated APIs and web apps with strong security fundamentals.",
    ],
  },
  {
    period: "Apr 2023 — May 2024",
    position: "PHP Developer",
    company: "Bitz Studio",
    location: "Lahore",
    url: "https://bitzstudio.com",
    points: [
      "Scaled SaaS and enterprise apps in Core PHP, CodeIgniter, Laravel, Symfony and React — deployed to the cloud.",
      "Introduced AI-based management systems built with Laravel.",
      "Published feature-ready WordPress plugins to the WP marketplace.",
    ],
  },
  {
    period: "Jan 2022 — May 2023",
    position: "Full Stack Laravel Developer",
    company: "Freelance",
    location: "Remote",
    points: [
      "Delivered dynamic web solutions: database design, API implementation and performance optimisation.",
      "Translated client visions into functional, polished web experiences.",
    ],
  },
  {
    period: "Feb 2022 — Jul 2022",
    position: "Full Stack Developer",
    company: "RZ Lab",
    location: "Lahore",
    points: ["PHP, Laravel, JavaScript, React, MySQL and WordPress — custom and CMS-based e-commerce."],
  },
];

export interface SkillGroup {
  name: string;
  blurb: string;
  items: { n: string; l?: number }[];
}

export const skillGroups: SkillGroup[] = [
  {
    name: "Backend",
    blurb: "The engine room — where I'm deepest.",
    items: [
      { n: "PHP", l: 5 },
      { n: "Laravel", l: 5 },
      { n: "CodeIgniter", l: 5 },
      { n: "Symfony", l: 4 },
      { n: "Python Flask", l: 4 },
      { n: "OOP", l: 5 },
      { n: "Design Patterns", l: 4 },
      { n: "PHPUnit", l: 4 },
    ],
  },
  {
    name: "Frontend",
    blurb: "Interfaces people actually enjoy.",
    items: [
      { n: "JavaScript", l: 5 },
      { n: "HTML5", l: 5 },
      { n: "CSS3", l: 5 },
      { n: "TailwindCSS", l: 5 },
      { n: "Bootstrap 5", l: 5 },
      { n: "SASS/LESS", l: 5 },
      { n: "jQuery", l: 5 },
      { n: "ReactJS", l: 4 },
      { n: "VueJS", l: 3 },
    ],
  },
  {
    name: "Data & Infra",
    blurb: "Shipping, scaling and keeping it up.",
    items: [
      { n: "MySQL", l: 5 },
      { n: "Git & GitHub", l: 5 },
      { n: "CLI & Linux", l: 5 },
      { n: "Apache/NginX", l: 4 },
      { n: "Shopify", l: 4 },
      { n: "MongoDB", l: 3 },
      { n: "Docker", l: 3 },
      { n: "Cloud Deployment", l: 3 },
      { n: "CI/CD", l: 3 },
    ],
  },
  {
    name: "AI Systems",
    blurb: "My current obsession — in production and in R&D.",
    items: [
      { n: "RAG" },
      { n: "Agentic AI" },
      { n: "Multi-agent systems" },
      { n: "OpenAI APIs" },
      { n: "Hugging Face" },
      { n: "AI automation" },
      { n: "TensorFlow" },
      { n: "PyTorch" },
    ],
  },
];

export const education = {
  school: "Virtual University of Pakistan",
  degree: "BS Software Engineering",
  period: "2019 — 2023",
  grade: "Grade A",
  points: [
    "Management Head, Technological Advancement Society (TAS by VU).",
    "Technical Editor & editorial board member of VU Bytes, the university magazine.",
    "Student Ambassador for Google Student Developer Club and Campus Expert for GitHub Education.",
    "Ran bootcamps and student-awareness programmes on campus and online.",
    "Studied architecture, SOLID, microservices, DevOps, SaaS, data science and AI.",
  ],
};

export const certs = [
  { title: "Complete Data Science, Machine Learning, Deep Learning & NLP Bootcamp", issuer: "KRISHAI Technologies", date: "Nov 2024" },
  { title: "Beginning Laravel (2023) — From Novice to Professional", issuer: "TutsPrime", date: "May 2023" },
  { title: "Web Development Masterclass", issuer: "YouAccel Training", date: "Feb 2023" },
  { title: "Modern PHP Web Development w/ MySQL, GitHub & Heroku", issuer: "Learn IT University", date: "Feb 2023" },
  { title: "Complete React Developer Masterclass", issuer: "Data Is Good Academy", date: "Jan 2023" },
  { title: "Certified Web Professional — E-Commerce Specialist (CWP)", issuer: "IBM", date: "Oct 2022" },
  { title: "Install NGINX, PHP, MySQL, SSL & WordPress on Ubuntu", issuer: "YouAccel Training", date: "Sep 2022" },
  { title: "JavaScript, Bootstrap & PHP — Certification for Beginners", issuer: "YouAccel Training", date: "Apr 2022" },
];

export const interests = [
  { icon: "✲", name: "AI & Machine Learning", text: "Exploring agentic AI, RAG and generative AI to build intelligent systems." },
  { icon: "◈", name: "Open Source", text: "Contributing to open-source projects to solve real-world problems." },
  { icon: "⟁", name: "Digital Transformation", text: "Leveraging AI and automation to optimise business processes." },
  { icon: "⌘", name: "Tech Community", text: "Hackathons, bootcamps and summits to stay ahead of the curve." },
  { icon: "△", name: "Minimalist Travel", text: "Mountains, hiking and road trips — immersing in cultures to spark creativity." },
  { icon: "☼", name: "Social Impact", text: "Advocating ethical AI and using technology to drive positive change." },
];

export const languages = [
  { name: "English", level: "Proficient", pct: 85 },
  { name: "Urdu", level: "Native", pct: 100 },
];
