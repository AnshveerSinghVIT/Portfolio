export const profile = {
  name: 'Anshveer Singh',
  first: 'Anshveer',
  last: 'Singh',
  role: 'Software engineer — AI/ML & full-stack',
  school: 'B.Tech Computer Science & Engineering — VIT, Vellore',
  location: 'Bengaluru, India',
  coords: '12.9716° N, 77.5946° E',
  timezone: 'Asia/Kolkata',
  email: 'singhanshveer73@gmail.com',
  phone: '+91 7795478003',
  resume: 'https://drive.google.com/file/d/17Pp8wXhmL6BGtctHEXfqwqHOK5MEcSo4/view',
  socials: [
    { label: 'GitHub', handle: '@AnshveerSinghVIT', url: 'https://github.com/AnshveerSinghVIT/' },
    { label: 'LinkedIn', handle: 'in/anshveer-singh', url: 'https://www.linkedin.com/in/anshveer-singh-3523b728b/' },
    { label: 'Credly', handle: 'badges', url: 'https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly' },
    { label: 'Google Skills', handle: 'profile', url: 'https://www.skills.google/public_profiles/a0bfdad5-777c-4017-8384-8199118381ff' },
  ],
  photos: [
    { src: '/profile4.jpg', alt: 'Portrait of Anshveer Singh' },
    { src: '/profile1.jpg', alt: 'Anshveer in front of ISRO rocket models' },
    { src: '/profile2.jpg', alt: 'Anshveer at dinner' },
    { src: '/profile3.jpg', alt: 'Anshveer at a café' },
  ],
};

export const manifesto =
  'I build software where models meet people — AI that earns its place, full-stack products that ship, and interfaces you want to keep exploring.';

export const stats = [
  { value: 9.34, decimals: 2, label: 'CGPA at VIT Vellore', note: '9.59 GPA in semester five' },
  { value: 96, suffix: '%', label: 'Detection accuracy', note: 'LLM-assisted driver vulnerability analysis at Dell' },
  { value: 600, suffix: '+', label: 'Active users', note: 'on VALL, the campus app I helped found' },
  { value: 1500, suffix: '+', label: 'Units managed', note: 'by the RealPro Nexus inventory engine' },
];

export const projects = [
  {
    id: 'driver-analysis',
    title: 'Driver Vulnerability AI',
    kind: 'LLM-assisted security analysis',
    context: 'Dell Technologies · 2026',
    stack: ['Ghidra', 'Local LLMs', 'Static analysis'],
    visual: 'security',
    accent: '#0672cb',
    url: null,
    summary:
      'AI-assisted security tooling that pairs Ghidra with locally hosted large language models to automate vulnerability assessment of Windows drivers.',
    points: ['96% detection accuracy', 'Analysis time cut from hours to minutes', 'Built during my undergraduate internship at Dell Technologies'],
    note: 'Internal work — shared at a high level.',
  },
  {
    id: 'realpro',
    title: 'RealPro Nexus',
    kind: 'E-commerce platform for Lemon',
    context: 'Full-stack build',
    stack: ['Next.js 15', 'Supabase', 'Tailwind CSS'],
    image: '/lemon.png',
    accent: '#c99400',
    url: 'https://lemon-iota.vercel.app',
    urlLabel: 'Visit live site',
    summary: 'A full-stack storefront and inventory engine for the denim brand Lemon — built with Next.js 15 and Supabase, managing 1,500+ units.',
    points: ['Inventory engine handling 1,500+ product units', 'Next.js 15 frontend on a Supabase backend', 'Storefront line: “Where life gives you lemons”'],
  },
  {
    id: 'vall',
    title: 'VALL Social',
    kind: 'Campus social network',
    context: 'Founding member & designer',
    stack: ['React', 'MongoDB'],
    image: '/vall.png',
    accent: '#2f6bff',
    url: 'https://vmedia.onrender.com/',
    urlLabel: 'Visit live site',
    summary:
      'A campus social app with 600+ active users. As an initial founding member and designer, I led the design of its AI-assisted learning module and campus marketplace.',
    points: ['600+ active users', 'Designed the AI-assisted learning module', 'Designed the campus marketplace'],
  },
  {
    id: 'examguide',
    title: 'ExamGuideAI',
    kind: 'AI exam strategist',
    context: 'NLP · RAG · knowledge graphs',
    stack: ['Python', 'Sentence-Transformers', 'RAG', 'NetworkX'],
    visual: 'graph',
    accent: '#0f9d6b',
    url: 'https://github.com/AnshveerSinghVIT/ExamBasedNLP',
    urlLabel: 'View source',
    summary:
      'Reads a syllabus and past-year questions, ranks topics by semantic importance and maps how concepts depend on one another.',
    points: [
      'SBERT embeddings match syllabus topics to past-year questions by meaning, not keywords',
      'Links topics whose study material overlaps by more than 35%',
      'Community detection clusters topics into an interactive knowledge graph',
    ],
  },
  {
    id: 'self-healing',
    title: 'Self-Healing Cloud',
    kind: 'Resilient infrastructure',
    context: 'Chaos engineering',
    stack: ['Docker', 'Nginx', 'Flask'],
    visual: 'cloud',
    accent: '#ff5a1f',
    url: null,
    summary:
      'A load-balanced cluster built to survive its own failures: Nginx fronts three containerised replicas, and a kill switch lets you crash nodes on purpose and watch the system recover.',
    points: ['Nginx load balancer across three Docker replicas', 'Chaos “kill switch” endpoint to crash a container on demand', 'Live per-node uptime, CPU and memory stats'],
  },
  {
    id: 'mental-health',
    title: 'Mental Health AI',
    kind: 'Diagnostic classifier',
    context: 'Smartbridge ML programme',
    stack: ['Python', 'Vertex AI', 'Flask'],
    visual: 'ml',
    accent: '#7c5cff',
    url: 'https://github.com/AnshveerSinghVIT/Mental_Health_Prediction_ML_Project',
    urlLabel: 'View source',
    summary: 'A machine-learning classifier that predicts mental-health conditions, built with Google Cloud Vertex AI and served through Flask.',
    points: ['Built during the Smartbridge ML training programme', 'Trained with Vertex AI', 'Served through a Flask web app'],
  },
];

export const alsoBuilt = [{ title: 'ProjectPROduction', kind: 'PDF syllabus parser & academic progress tracker' }];

export const skills = {
  'AI & ML': ['LLMs', 'RAG', 'AI Agents', 'Prompt Engineering', 'NLP', 'Vertex AI', 'Scikit-learn'],
  Languages: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'SQL'],
  'Web & Backend': ['Next.js', 'React', 'Node.js', 'Flask', 'Prisma', 'Tailwind CSS', 'Three.js'],
  Data: ['PostgreSQL', 'MongoDB', 'Supabase'],
  'Cloud & DevOps': ['Docker', 'AWS EC2', 'Google Cloud', 'Git'],
  Security: ['Ghidra', 'YARA', 'Static Analysis', 'Linux', 'Maven'],
  'Core CS': ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'DBMS', 'Compiler Design', 'Theory of Computation', 'Cryptography', 'Cloud Computing'],
};

export const experience = [
  {
    company: 'Dell Technologies',
    role: 'Undergraduate Intern',
    period: 'Jun — Jul 2026',
    place: 'Bengaluru',
    image: '/dell.jpg',
    body: 'Worked on two projects, including AI-assisted security analysis that pairs Ghidra with local LLMs to automate Windows driver vulnerability assessment — 96% detection accuracy, with analysis cut from hours to minutes. Secured through on-campus testing and interviews.',
    links: [],
  },
  {
    company: 'Smartbridge',
    role: 'ML Summer Industrial Internship Training',
    period: 'May — Jun 2025',
    place: 'Remote',
    body: 'A remote industry training programme built on Google Cloud tooling. Learned to train and deploy models on Vertex AI, including a mental-health diagnostic classifier.',
    links: [
      { label: 'Programme certificate', url: 'https://skillwallet.smartinternz.com/internships/google_developers/d0e7b521c18b09876cb7693e42880dba' },
      { label: 'Credly badges', url: 'https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly' },
      { label: 'Google Skills profile', url: 'https://www.skills.google/public_profiles/a0bfdad5-777c-4017-8384-8199118381ff' },
    ],
  },
];

export const campus = {
  title: 'Vellore Institute of Technology',
  degree: 'B.Tech, Computer Science & Engineering',
  classOf: '2027',
  cgpa: '9.34',
  best: '9.59 GPA in semester five',
  coursework: ['Artificial Intelligence', 'NLP', 'Software Engineering', 'Design & Analysis of Algorithms', 'Operating Systems', 'Computer Networks', 'Compiler Design', 'Theory of Computation', 'Cryptography & Network Security', 'Cloud Architecture', 'Embedded Systems', 'Linear Algebra'],
  photos: [
    {
      src: '/campus/technology-tower.jpg',
      title: 'Technology Tower',
      caption: 'The landmark academic block of the Vellore campus.',
      credit: 'Wikindinator',
      license: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Technology_Tower(VIT).jpg',
    },
    {
      src: '/campus/campus-dusk.jpg',
      title: 'Campus at dusk',
      caption: 'Covered walkways, hostel towers and the hills beyond.',
      credit: 'Jishnu12684',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Vellore_Institue_of_Technology.jpg',
    },
    {
      src: '/campus/hostel-towers.jpg',
      title: 'S & T blocks',
      caption: 'The men’s hostel towers, lit up after dark.',
      credit: 'Bleu3117',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:S-MH_and_T-MH_VIT,_Vellore_Campus.jpg',
    },
    {
      src: '/campus/main-building.jpg',
      title: 'Main building',
      caption: 'Lit up for Riviera, the annual cultural fest.',
      credit: 'Manoj Prajwal Bhattaram',
      license: 'CC BY 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:VIT_main_building.jpg',
    },
    {
      src: '/campus/h-block.jpg',
      title: 'Hostel H block',
      caption: 'Golden hour on the older side of campus.',
      credit: 'Manoj Prajwal',
      license: 'CC BY-SA 3.0',
      source: "https://commons.wikimedia.org/wiki/File:VIT_Men's_hostel_H_block.jpg",
    },
  ],
};

export const timeline = [
  { year: '2025', text: 'Smartbridge ML programme — first models trained on Vertex AI' },
  { year: '2026', text: 'Undergraduate intern at Dell Technologies, Bengaluru' },
  { year: '2027', text: 'Class of 2027 — B.Tech CSE' },
];

export const beyond = {
  belt: 'Brown Belt (1st)',
  style: 'Shito-Ryu karate',
  hackathons: 'Game-development hackathons',
  certs: 'ML certifications & Google Cloud AI Boost badges',
};

export const sections = [
  { id: 'top', label: 'Index' },
  { id: 'work', label: 'Work' },
  { id: 'campus', label: 'Campus' },
  { id: 'arsenal', label: 'Arsenal' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export const aiSectionMap = { intro: 'top', skills: 'arsenal', projects: 'work', experience: 'experience', contact: 'contact' };
