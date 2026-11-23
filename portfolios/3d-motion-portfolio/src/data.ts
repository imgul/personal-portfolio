export const profile = {
  name: "Muhammad Gulzaib",
  headline: "Senior Full Stack Engineer | Laravel | React | AI Systems | SaaS",
  email: "iigulzaib@gmail.com",
  phone: "+92 302 6999 008",
  phoneHref: "tel:+923026999008",
  location: "Islamabad, Pakistan",
  website: "https://gulzaib.dev",
  linkedin: "https://www.linkedin.com/in/gulzaib-ai",
  github: "https://github.com/imgul",
};

export const roles = ["Laravel Architect", "React Engineer", "AI Systems Builder", "SaaS Craftsman"];

export const summary = [
  "Senior Full Stack Engineer with 5+ years of experience building scalable SaaS platforms and AI-powered web applications.",
  "Expert in Laravel, React, and backend architecture with hands-on experience in AI integrations — RAG, APIs, automation systems.",
  "Proven track record of delivering high-performance systems, mentoring developers, and contributing to product and system design.",
];

export const stats = [
  { value: 5, suffix: "+", label: "Years shipping production software" },
  { value: 30, suffix: "%", label: "Team productivity lift through mentoring" },
  { value: 6, suffix: "", label: "Teams & studios across PK, remote" },
  { value: 27, suffix: "", label: "Technologies in the toolbox" },
];

export type Job = {
  company: string;
  position: string;
  period: string;
  location: string;
  url?: string;
  points: string[];
  tags: string[];
};

export const experience: Job[] = [
  {
    company: "Exertlogics",
    position: "Senior Software Engineer",
    period: "Sep 2024 – Jul 2025",
    location: "Lahore, Punjab",
    url: "https://exertlogics.com",
    points: [
      "Spearheaded scalable, high-performance e-commerce platforms with PHP and React.js.",
      "Mentored junior developers and fresh graduates — lifting team productivity by 30%.",
      "Built Laravel & Python Flask APIs that plug third-party AI services into client apps.",
      "Played a key role in hiring and onboarding top-tier engineering talent.",
    ],
    tags: ["Laravel", "React", "Flask", "AI APIs", "MVC"],
  },
  {
    company: "DW Solution Online Ltd",
    position: "PHP Laravel Developer",
    period: "Jun 2024 – Sep 2024",
    location: "Islamabad",
    url: "https://dwsolutionline.com/",
    points: [
      "Full-stack Laravel work alongside Python Flask services.",
      "Developed AI-integrated APIs and web apps with a security-first mindset.",
      "Applied MVC & OOP patterns to keep code clean and maintainable.",
    ],
    tags: ["Laravel", "Flask", "AI", "OOP"],
  },
  {
    company: "Bitz Studio",
    position: "PHP Developer",
    period: "Apr 2023 – May 2024",
    location: "Lahore, Pakistan",
    url: "https://bitzstudio.com",
    points: [
      "Scaled SaaS & enterprise apps across Core PHP, CodeIgniter, Laravel, Symfony and ReactJS — deployed to the cloud.",
      "Introduced AI-based management systems built with care on Laravel.",
      "Shipped feature-rich WordPress plugins to the WP Marketplace.",
    ],
    tags: ["Laravel", "Symfony", "CodeIgniter", "React", "Cloud"],
  },
  {
    company: "Freelance / Outsource",
    position: "Full Stack PHP Laravel Developer",
    period: "Jan 2022 – May 2023",
    location: "Remote",
    points: [
      "Delivered dynamic web solutions for clients — from database design to API implementation.",
      "Performance optimisation and translating client visions into polished experiences.",
      "Committed to quality that exceeds expectations, project after project.",
    ],
    tags: ["Laravel", "APIs", "MySQL", "Performance"],
  },
  {
    company: "RZ Lab",
    position: "Full Stack Developer",
    period: "Feb 2022 – Jul 2022",
    location: "Lahore, Pakistan",
    points: [
      "Built custom and CMS-based e-commerce solutions.",
      "Worked across PHP, Laravel, JavaScript, React, MySQL and WordPress.",
    ],
    tags: ["PHP", "React", "MySQL", "WordPress"],
  },
];

export const skillGroups: { name: string; skills: { name: string; level: number }[] }[] = [
  {
    name: "Frontend",
    skills: [
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
    name: "Backend",
    skills: [
      { name: "PHP", level: 5 },
      { name: "Laravel", level: 5 },
      { name: "CodeIgniter", level: 5 },
      { name: "Symfony", level: 4 },
      { name: "Python Flask", level: 4 },
      { name: "RAG / AI APIs", level: 4 },
      { name: "Shopify", level: 4 },
    ],
  },
  {
    name: "Data",
    skills: [
      { name: "MySQL", level: 5 },
      { name: "MongoDB", level: 3 },
    ],
  },
  {
    name: "DevOps",
    skills: [
      { name: "Git & GitHub", level: 5 },
      { name: "CLI & Linux", level: 5 },
      { name: "Apache/NginX", level: 4 },
      { name: "Docker", level: 3 },
      { name: "Cloud Deployment", level: 3 },
      { name: "CI/CD", level: 3 },
    ],
  },
  {
    name: "Craft",
    skills: [
      { name: "OOP", level: 5 },
      { name: "Design Patterns", level: 4 },
      { name: "PHPUnit Testing", level: 4 },
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
    "Management Head — Technological Advancement Society (TAS by VU)",
    "Active member — Business Management Society (BMS)",
    "Technical Editor & editorial board member — VU Bytes magazine",
    "Student Ambassador — Google Student Developer Club",
    "Campus Expert — GitHub Education",
    "Hosted bootcamps & student awareness programs, on campus and online",
  ],
  learned: ["SOLID", "Software Architecture", "Microservices", "DevOps", "SaaS", "Data Science", "AI", "Team Leadership"],
};

export const certifications = [
  { title: "Complete Data Science, Machine Learning, Deep Learning, and NLP Bootcamp", issuer: "KRISHAI Technologies", date: "Nov 2024" },
  { title: "Beginning Laravel (2023) — From Novice to Professional", issuer: "TutsPrime", date: "May 2023" },
  { title: "Web Development Masterclass — Online Certification Course", issuer: "YouAccel Training", date: "Feb 2023" },
  { title: "Modern PHP Web Development w/ MySQL, GitHub & Heroku", issuer: "Learn IT University", date: "Feb 2023" },
  { title: "Complete React Developer Masterclass for Beginners (2022)", issuer: "Data Is Good Academy", date: "Jan 2023" },
  { title: "Certified Web Professional — E-Commerce Specialist (CWP)", issuer: "IBM", date: "Oct 2022" },
  { title: "Install NGINX, PHP, MySQL, SSL & WordPress on Ubuntu", issuer: "YouAccel Training", date: "Sep 2022" },
  { title: "JavaScript, Bootstrap, & PHP — Certification for Beginners", issuer: "YouAccel Training", date: "Apr 2022" },
];

export const interests = [
  { icon: "🧠", name: "AI & ML Innovation", text: "Exploring Agentic AI, RAG and generative AI to build intelligent systems." },
  { icon: "🌱", name: "Open Source Advocacy", text: "Contributing to open-source projects to solve real-world problems." },
  { icon: "⚡", name: "Digital Transformation", text: "Leveraging AI and automation to optimise business processes." },
  { icon: "🤝", name: "Tech Community", text: "Hackathons, bootcamps and summits to stay ahead of the curve." },
  { icon: "🧭", name: "Minimalist Travel", text: "Immersing in diverse cultures to inspire creativity and broaden perspectives." },
  { icon: "⚖️", name: "Social Impact", text: "Advocating for ethical AI and using technology to drive positive change." },
];

export const languages = [
  { name: "English", fluency: "Proficient", level: 0.9 },
  { name: "Urdu", fluency: "Native", level: 1 },
];
