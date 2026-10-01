export const profile = {
  name: 'Anshveer Singh',
  first: 'Anshveer',
  last: 'Singh',
  role: 'Full-stack & ML Engineer',
  school: 'Computer Science & Engineering — VIT, Vellore',
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
};

export const manifesto =
  'I build software that sits where models meet people — full-stack products that ship fast, machine learning that earns its place, and interfaces you want to keep exploring.';

export const projects = [
  {
    id: 'realpro',
    index: '01',
    title: 'RealPro Nexus',
    kind: 'E-commerce & inventory engine',
    stack: ['Next.js', 'Supabase', 'Tailwind CSS'],
    image: '/lemon.png',
    accent: '#d9a000',
    url: 'https://lemon-iota.vercel.app',
    urlLabel: 'Visit live site',
    summary:
      'A storefront and inventory backbone for 1,500+ units, built with Next.js on top of Supabase.',
    points: [
      'Inventory engine handling 1,500+ product units',
      'Next.js frontend with a Supabase backend',
      'Storefront design: "Where life gives you lemons"',
    ],
  },
  {
    id: 'mental-health',
    index: '02',
    title: 'Mental Health AI',
    kind: 'Diagnostic classifier',
    stack: ['Python', 'Machine Learning', 'Flask'],
    image: null,
    accent: '#7c5cff',
    url: 'https://github.com/AnshveerSinghVIT/Mental_Health_Prediction_ML_Project',
    urlLabel: 'View source',
    summary:
      'A machine-learning classifier that predicts mental-health conditions, served through a lightweight Flask interface.',
    points: [
      'Machine-learning classification of mental-health conditions',
      'Served through a Flask web app',
      'Related modelling work done on Vertex AI during the Smartbridge × Google internship',
    ],
  },
  {
    id: 'vall',
    index: '03',
    title: 'Vall Social',
    kind: 'Campus social network',
    stack: ['React', 'MongoDB'],
    image: '/vall.png',
    accent: '#2f6bff',
    url: 'https://vmedia.onrender.com/',
    urlLabel: 'Visit live site',
    summary:
      'A social platform for campus life, built with React and MongoDB.',
    points: [
      'Campus social network built in React',
      'MongoDB backend',
      'Deployed on Render',
    ],
  },
];

export const skills = {
  Languages: ['Python', 'TypeScript', 'JavaScript', 'C++', 'Java', 'SQL'],
  Frameworks: ['Next.js', 'React', 'Node.js', 'Tailwind CSS', 'Prisma', 'Flask', 'Three.js'],
  'Cloud & Data': ['AWS EC2', 'Google Vertex AI', 'Supabase', 'PostgreSQL', 'MongoDB', 'Vercel'],
  Tooling: ['Git', 'Docker', 'REST APIs'],
  Human: ['Leadership', 'Adaptability', 'Problem solving'],
};

export const experience = [
  {
    company: 'Smartbridge × Google',
    role: 'Machine Learning Developer Intern',
    period: 'May — Jun 2025',
    body: 'Built mental-health prediction models on Google Cloud Vertex AI and worked on conversational AI chatbots as part of the Google Developers internship track.',
    links: [
      { label: 'Internship certificate', url: 'https://skillwallet.smartinternz.com/internships/google_developers/d0e7b521c18b09876cb7693e42880dba' },
      { label: 'Credly badges', url: 'https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly' },
      { label: 'Google Skills profile', url: 'https://www.skills.google/public_profiles/a0bfdad5-777c-4017-8384-8199118381ff' },
    ],
  },
  {
    company: 'Vellore Institute of Technology',
    role: 'B.Tech, Computer Science & Engineering',
    period: 'Ongoing',
    body: 'Studying CS at VIT Vellore while shipping side projects across web, ML and 3D on the web.',
    links: [],
  },
];

export const sections = [
  { id: 'top', label: 'Index' },
  { id: 'work', label: 'Work' },
  { id: 'arsenal', label: 'Arsenal' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];
