export const profile = {
  name: "Muhammad Gulzaib",
  first: "Muhammad",
  last: "Gulzaib",
  headline: "Senior Full Stack Engineer",
  roles: ["Laravel", "React", "AI Systems", "SaaS", "RAG & APIs"],
  email: "iigulzaib@gmail.com",
  phone: "+92 302 6999 008",
  location: "Islamabad, Pakistan",
  website: "https://gulzaib.dev",
  websiteLabel: "gulzaib.dev",
  linkedin: "https://www.linkedin.com/in/gulzaib-ai",
  github: "https://github.com/imgul",
};

export const about = {
  lead:
    "Senior Full Stack Engineer with 5+ years of experience building scalable SaaS platforms and AI-powered web applications. Expert in Laravel, React and backend architecture, with hands-on experience in AI integrations: RAG, APIs and automation systems.",
  highlight: ["5+", "years", "SaaS", "AI-powered", "Laravel,", "React", "RAG,", "AI", "integrations:", "backend"],
  more:
    "Proven track record of delivering high-performance systems, mentoring developers, and contributing to product and system design.",
  seeking: "Open to remote roles & relocation: UAE / KSA",
};

export const stats = [
  { value: 5, suffix: "+", label: "Years shipping production software" },
  { value: 5, suffix: "", label: "Teams & engagements across PK" },
  { value: 30, suffix: "%", label: "Team productivity lift through mentoring" },
  { value: 8, suffix: "", label: "Professional certifications" },
];

export const experience = [
  {
    company: "Exertlogics",
    role: "Senior Software Engineer",
    location: "Lahore, Punjab",
    period: "Sep 2024 – Jul 2025",
    url: "https://exertlogics.com",
    points: [
      "Spearheaded scalable, high-performance e-commerce platforms with PHP and React.js.",
      "Mentored junior developers and fresh graduates, lifting team productivity by 30%.",
      "Built Laravel and Python Flask APIs connecting third-party AI services into client apps.",
      "Helped hire and onboard top-tier engineers; shipped secure MVC / OOP architectures.",
    ],
    tags: ["PHP", "React", "Laravel", "Flask", "AI APIs"],
  },
  {
    company: "DW Solution Online Ltd",
    role: "PHP Laravel Developer",
    location: "Islamabad",
    period: "Jun 2024 – Sep 2024",
    url: "https://dwsolutionline.com/",
    points: [
      "Full-stack Laravel work alongside Python Flask services.",
      "Developed AI-integrated APIs and web applications.",
      "Applied security fundamentals, MVC & OOP patterns and clean coding conventions.",
    ],
    tags: ["Laravel", "Flask", "AI", "MVC"],
  },
  {
    company: "Bitz Studio",
    role: "PHP Developer",
    location: "Lahore, Pakistan",
    period: "Apr 2023 – May 2024",
    url: "https://bitzstudio.com",
    points: [
      "Scaled SaaS & enterprise apps in Core PHP, CodeIgniter, Laravel, Symfony and ReactJS on the cloud.",
      "Introduced AI-based management systems built with care in Laravel.",
      "Shipped feature-ready WordPress plugins to the WP Marketplace.",
    ],
    tags: ["Laravel", "Symfony", "CodeIgniter", "React", "WordPress"],
  },
  {
    company: "Freelance / Outsource",
    role: "Full Stack PHP Laravel Developer",
    location: "Remote",
    period: "Jan 2022 – May 2023",
    url: "",
    points: [
      "Built dynamic web solutions with Laravel: efficient, user-friendly applications.",
      "Database design, API implementation and performance optimisation.",
      "Translated client visions into functional, visually appealing experiences.",
    ],
    tags: ["Laravel", "MySQL", "APIs", "Performance"],
  },
  {
    company: "RZ Lab",
    role: "Full Stack Developer",
    location: "Lahore, Pakistan",
    period: "Feb 2022 – Jul 2022",
    url: "",
    points: [
      "Built custom and CMS-driven e-commerce solutions.",
      "Worked across PHP, Laravel, JavaScript, React, MySQL and WordPress.",
    ],
    tags: ["PHP", "Laravel", "React", "MySQL", "WordPress"],
  },
];

export const projects = [
  {
    id: "oxygen",
    index: "01",
    name: "Oxygen LMS",
    kind: "SaaS · EdTech",
    blurb: "A SaaS learning-management platform that lets schools run their day-to-day, from classrooms to reports.",
    points: [
      "Built a SaaS-based LMS for schools",
      "Designed the backend architecture using Laravel",
      "Developed core modules: attendance, reporting, user management",
    ],
    tags: ["Laravel", "MySQL", "SaaS", "Multi-tenant"],
  },
  {
    id: "ai",
    index: "02",
    name: "AI Systems",
    kind: "AI · Automation",
    blurb: "Intelligent workflows that connect language models to real business data and processes.",
    points: [
      "Built AI-integrated APIs using Python Flask",
      "Implemented RAG-based systems for intelligent workflows",
    ],
    tags: ["Python Flask", "RAG", "LLM APIs", "Automation"],
  },
];

export type Skill = { name: string; level?: number };
export const skillGroups: { title: string; hue: string; items: Skill[] }[] = [
  {
    title: "Frontend",
    hue: "#22d3ee",
    items: [
      { name: "HTML5", level: 5 },
      { name: "CSS3", level: 5 },
      { name: "TailwindCSS", level: 5 },
      { name: "Bootstrap 5", level: 5 },
      { name: "SASS/LESS", level: 5 },
      { name: "JavaScript", level: 5 },
      { name: "jQuery", level: 5 },
      { name: "ReactJS", level: 4 },
      { name: "VueJS", level: 3 },
    ],
  },
  {
    title: "Backend & Data",
    hue: "#c8ff00",
    items: [
      { name: "PHP", level: 5 },
      { name: "Laravel", level: 5 },
      { name: "CodeIgniter", level: 5 },
      { name: "Symfony", level: 4 },
      { name: "MySQL", level: 5 },
      { name: "MongoDB", level: 3 },
      { name: "Shopify", level: 4 },
      { name: "OOP", level: 5 },
      { name: "Design Patterns", level: 4 },
      { name: "PHPUnit Testing", level: 4 },
    ],
  },
  {
    title: "DevOps & Tooling",
    hue: "#ff4d8d",
    items: [
      { name: "Git & GitHub", level: 5 },
      { name: "CLI & Linux", level: 5 },
      { name: "Apache/NginX", level: 4 },
      { name: "Docker", level: 3 },
      { name: "Cloud Deployment", level: 3 },
      { name: "CI/CD", level: 3 },
    ],
  },
  {
    title: "AI Engineering",
    hue: "#a78bfa",
    items: [
      { name: "RAG Systems" },
      { name: "AI API Integration" },
      { name: "Python Flask" },
      { name: "Agentic AI" },
      { name: "Automation" },
    ],
  },
];

export const education = {
  school: "Virtual University of Pakistan",
  degree: "BS Software Engineering",
  area: "Computer Science",
  grade: "Grade A",
  period: "Feb 2019 – Apr 2023",
  url: "https://vu.edu.pk",
  highlights: [
    { role: "Management Head", org: "Technological Advancement Society (TAS by VU)" },
    { role: "Technical Editor & Writer", org: "VU Bytes magazine, Editorial Board" },
    { role: "Student Ambassador", org: "Google Student Developer Club" },
    { role: "Campus Expert", org: "GitHub Education" },
    { role: "Active Member", org: "Business Management Society (BMS)" },
    { role: "Bootcamp Host", org: "On-campus & remote learning sessions" },
  ],
  learned: [
    "Software Architecture",
    "Microservices",
    "DevOps",
    "SOLID Principles",
    "Data Structures",
    "Data Science",
    "AI",
    "SaaS Development",
    "Team Management",
    "Technical Writing",
  ],
};

export const certifications = [
  { title: "Complete Data Science, Machine Learning, Deep Learning, and NLP Bootcamp", issuer: "KRISHAI Technologies", date: "Nov 2024" },
  { title: "Beginning Laravel (2023): From Novice to Professional", issuer: "TutsPrime", date: "May 2023" },
  { title: "Web Development Masterclass", issuer: "YouAccel Training", date: "Feb 2023" },
  { title: "Modern PHP Web Development w/ MySQL, GitHub & Heroku", issuer: "Learn IT University", date: "Feb 2023" },
  { title: "Complete React Developer Masterclass (2022)", issuer: "Data Is Good Academy", date: "Jan 2023" },
  { title: "Certified Web Professional: E-Commerce Specialist (CWP)", issuer: "IBM", date: "Oct 2022" },
  { title: "Install NGINX, PHP, MySQL, SSL & WordPress on Ubuntu", issuer: "YouAccel Training", date: "Sep 2022" },
  { title: "JavaScript, Bootstrap, & PHP Certification", issuer: "YouAccel Training", date: "Apr 2022" },
];

export const interests = [
  { name: "AI & Machine Learning", text: "Exploring Agentic AI, RAG and generative AI to build intelligent systems.", glyph: "01" },
  { name: "Open Source Advocacy", text: "Contributing to open-source projects to solve real-world problems.", glyph: "02" },
  { name: "Digital Transformation", text: "Leveraging AI and automation to optimise business processes.", glyph: "03" },
  { name: "Tech Community", text: "Hackathons, bootcamps and summits to stay ahead of the trends.", glyph: "04" },
  { name: "Minimalist Travel", text: "Immersing in diverse cultures to inspire creativity and broaden perspectives.", glyph: "05" },
  { name: "Social Impact", text: "Advocating for ethical AI and using technology to drive positive change.", glyph: "06" },
];

export const languages = [
  { name: "English", level: "Proficient" },
  { name: "Urdu", level: "Native" },
];

export const marqueeWords = [
  "Laravel", "React", "AI Systems", "SaaS", "RAG", "Python Flask", "PHP", "Tailwind", "MySQL", "Docker", "APIs", "Automation",
];
