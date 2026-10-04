// Source of truth for the Atlas. `text` is what gets embedded; `body` is what visitors read.
// Only verified résumé facts belong here.

export const projects = [
  {
    id: 'driver-analysis',
    title: 'Driver Vulnerability AI',
    kicker: 'Dell Technologies · 2026',
    body: 'AI-assisted security tooling that pairs Ghidra with locally hosted LLMs to automate Windows driver vulnerability assessment — 96% detection accuracy, with analysis cut from hours to minutes.',
    text: 'AI-assisted security analysis tool pairing the Ghidra reverse engineering framework with local large language models to automate Windows driver vulnerability assessment. 96% detection accuracy, analysis time reduced from hours to minutes. Built at Dell Technologies.',
    caseId: 'driver-analysis',
  },
  {
    id: 'examguide',
    title: 'ExamGuideAI',
    kicker: 'NLP · RAG · knowledge graphs',
    body: 'Reads a syllabus and past-year questions, ranks topics by semantic importance with SBERT embeddings, links topics whose study material overlaps by more than 35%, and clusters them into an interactive knowledge graph.',
    text: 'Exam guiding tool using retrieval-augmented generation, sentence-transformer embeddings and cosine similarity to rank syllabus topics against past-year exam questions, plus a knowledge graph with community detection that maps how concepts depend on each other.',
    caseId: 'examguide',
    url: 'https://github.com/AnshveerSinghVIT/ExamBasedNLP',
  },
  {
    id: 'vall',
    title: 'VALL Social',
    kicker: 'Founding member & designer',
    body: 'A campus social app with 600+ active users. As an initial founding member and designer, Anshveer led the design of its AI-assisted learning module and campus marketplace.',
    text: 'Campus social media network with 600+ active student users. Founding member and designer; designed an AI-assisted learning module and a campus marketplace. Built with React and MongoDB.',
    caseId: 'vall',
    url: 'https://vmedia.onrender.com/',
  },
  {
    id: 'realpro',
    title: 'RealPro Nexus',
    kicker: 'E-commerce for Lemon',
    body: 'A full-stack storefront and inventory engine for the denim brand Lemon, built with Next.js 15 and Supabase and managing 1,500+ units.',
    text: 'Full-stack e-commerce storefront and inventory management engine for a denim clothing brand, handling 1,500+ product units. Next.js 15 frontend with a Supabase PostgreSQL backend.',
    caseId: 'realpro',
    url: 'https://lemon-iota.vercel.app',
  },
  {
    id: 'self-healing',
    title: 'Self-Healing Cloud',
    kicker: 'Chaos engineering',
    body: 'An Nginx load balancer in front of three Docker replicas, with a kill switch that crashes nodes on purpose so you can watch the system recover — plus live per-node uptime, CPU and memory stats.',
    text: 'Resilient cloud infrastructure demo using chaos engineering: Nginx load balancer across three Docker container replicas, a kill switch endpoint that crashes containers, automatic recovery and live CPU, memory and uptime monitoring.',
    caseId: 'self-healing',
  },
  {
    id: 'mental-health',
    title: 'Mental Health AI',
    kicker: 'Diagnostic classifier',
    body: 'A machine-learning classifier that predicts mental-health conditions, trained with Google Cloud Vertex AI and served through a Flask app.',
    text: 'Machine learning diagnostic classifier predicting mental health conditions, trained and deployed with Google Cloud Vertex AI and served through a Flask web application.',
    caseId: 'mental-health',
    url: 'https://github.com/AnshveerSinghVIT/Mental_Health_Prediction_ML_Project',
  },
  {
    id: 'projectproduction',
    title: 'ProjectPROduction',
    kicker: 'Academic tooling',
    body: 'An automated PDF syllabus parser and academic progress tracker.',
    text: 'Automated PDF syllabus parser and academic progress tracker for students.',
  },
  {
    id: 'this-atlas',
    title: 'This Atlas',
    kicker: 'You are here',
    body: 'Every place on this map is a piece of Anshveer’s work, embedded with all-MiniLM-L6-v2 and projected with UMAP. Height is density — the mountains are where his work clusters. Rendered with hand-written WebGL2 shaders.',
    text: 'Interactive portfolio website rendered with hand-written WebGL2 shaders, sentence embeddings and UMAP dimensionality reduction, built with Next.js and React.',
  },
].map((n) => ({ ...n, type: 'project', weight: 1 }));

export const experience = [
  {
    id: 'dell',
    title: 'Dell Technologies',
    kicker: 'Undergraduate Intern · Jun–Jul 2026',
    body: 'Undergraduate intern in Bengaluru, secured through on-campus testing and interviews. Worked on two projects, including LLM-assisted driver vulnerability analysis.',
    text: 'Undergraduate software engineering intern at Dell Technologies in Bengaluru, June to July 2026, secured through on-campus tests and interviews; worked on two projects including AI security analysis.',
    weight: 1,
  },
  {
    id: 'smartbridge',
    title: 'Smartbridge',
    kicker: 'ML training programme · May–Jun 2025',
    body: 'A remote machine-learning industrial training programme built on Google Cloud tooling, where Anshveer trained and deployed models on Vertex AI.',
    text: 'Remote machine learning summer industrial training programme using Google Cloud Vertex AI to train and deploy models, including a mental health classifier.',
    weight: 0.85,
    url: 'https://skillwallet.smartinternz.com/internships/google_developers/d0e7b521c18b09876cb7693e42880dba',
  },
].map((n) => ({ ...n, type: 'experience' }));

export const education = [
  {
    id: 'vit',
    title: 'VIT Vellore',
    kicker: 'B.Tech CSE · Class of 2027',
    body: 'Bachelor of Technology in Computer Science & Engineering at Vellore Institute of Technology.',
    text: 'Bachelor of Technology in Computer Science and Engineering at Vellore Institute of Technology university, class of 2027.',
    weight: 0.95,
  },
  {
    id: 'cgpa',
    title: '9.34 CGPA',
    kicker: '9.59 GPA in semester five',
    body: 'A 9.34 cumulative GPA at VIT, with a 9.59 in his fifth semester.',
    text: 'Academic grades: 9.34 cumulative GPA at university, 9.59 GPA in the fifth semester.',
    weight: 0.6,
  },
].map((n) => ({ ...n, type: 'education' }));

export const places = [
  {
    id: 'bengaluru',
    title: 'Bengaluru',
    kicker: 'Home',
    body: 'Home city — and where he interned at Dell Technologies.',
    text: 'Bengaluru, Karnataka, India — home city and location of the Dell Technologies internship.',
  },
  {
    id: 'vellore',
    title: 'Vellore',
    kicker: 'Tamil Nadu',
    body: 'The campus town of VIT, where he studies.',
    text: 'Vellore, Tamil Nadu, India — the university campus town.',
  },
].map((n) => ({ ...n, type: 'place', weight: 0.5 }));

const skill = (id, title, text, usedIn = []) => ({ id, title, text, usedIn, type: 'skill', weight: 0.42 });

export const skills = [
  skill('python', 'Python', 'Python programming language for machine learning, data and backend scripting.', ['examguide', 'mental-health']),
  skill('typescript', 'TypeScript', 'TypeScript, typed JavaScript for web applications.'),
  skill('javascript', 'JavaScript', 'JavaScript programming for web frontends and Node.js.', ['this-atlas']),
  skill('java', 'Java', 'Java object-oriented programming language.'),
  skill('cpp', 'C++', 'C++ systems programming language, used for data structures and algorithms.'),
  skill('sql', 'SQL', 'SQL queries for relational databases.'),
  skill('llms', 'LLMs', 'Large language models, running local LLMs for automated analysis.', ['driver-analysis']),
  skill('rag', 'RAG', 'Retrieval-augmented generation combining search over documents with language models.', ['examguide']),
  skill('agents', 'AI Agents', 'Autonomous AI agents that use tools and language models to complete tasks.'),
  skill('prompting', 'Prompt Engineering', 'Prompt engineering for large language models.'),
  skill('nlp', 'NLP', 'Natural language processing, sentence embeddings and semantic similarity.', ['examguide']),
  skill('vertex', 'Vertex AI', 'Google Cloud Vertex AI for training and deploying machine learning models.', ['mental-health', 'smartbridge']),
  skill('sklearn', 'Scikit-learn', 'Scikit-learn machine learning library for classification models.'),
  skill('nextjs', 'Next.js', 'Next.js React framework for full-stack web apps.', ['realpro', 'this-atlas']),
  skill('react', 'React', 'React library for building user interfaces.', ['vall', 'this-atlas']),
  skill('nodejs', 'Node.js', 'Node.js JavaScript runtime for backend servers.'),
  skill('flask', 'Flask', 'Flask Python web framework for serving models and APIs.', ['mental-health', 'self-healing']),
  skill('prisma', 'Prisma', 'Prisma ORM for type-safe database access.'),
  skill('tailwind', 'Tailwind CSS', 'Tailwind CSS utility-first styling for web interfaces.', ['realpro']),
  skill('webgl', 'WebGL & Three.js', 'WebGL shaders and Three.js for 3D graphics and interactive web experiences.', ['this-atlas']),
  skill('postgres', 'PostgreSQL', 'PostgreSQL relational database.', ['realpro']),
  skill('mongodb', 'MongoDB', 'MongoDB document database.', ['vall']),
  skill('supabase', 'Supabase', 'Supabase backend platform with PostgreSQL, auth and storage.', ['realpro']),
  skill('docker', 'Docker', 'Docker containers for packaging and running services.', ['self-healing']),
  skill('aws', 'AWS EC2', 'Amazon Web Services EC2 virtual servers in the cloud.'),
  skill('gcp', 'Google Cloud', 'Google Cloud Platform cloud services.', ['smartbridge']),
  skill('git', 'Git', 'Git version control and collaboration.'),
  skill('ghidra', 'Ghidra', 'Ghidra reverse engineering framework for binary and driver analysis.', ['driver-analysis']),
  skill('yara', 'YARA', 'YARA rules for malware and pattern detection in binaries.'),
  skill('static-analysis', 'Static Analysis', 'Static analysis of binaries and code to find security vulnerabilities.', ['driver-analysis']),
  skill('linux', 'Linux', 'Linux operating system and command line.'),
  skill('maven', 'Maven', 'Maven build tool for Java projects.'),
];

const course = (id, title, text) => ({ id, title, text, type: 'course', weight: 0.32 });

export const courses = [
  course('dsa', 'Data Structures & Algorithms', 'Data structures and algorithms, design and analysis of algorithms coursework.'),
  course('os', 'Operating Systems', 'Operating systems coursework: processes, scheduling, memory and file systems.'),
  course('networks', 'Computer Networks', 'Computer networks coursework: protocols, routing and the internet.'),
  course('dbms', 'Database Systems', 'Database systems coursework: relational models, SQL and transactions.'),
  course('compilers', 'Compiler Design', 'Compiler design coursework: parsing, code generation and optimisation.'),
  course('toc', 'Theory of Computation', 'Theory of computation coursework: automata, grammars and computability.'),
  course('crypto', 'Cryptography & Network Security', 'Cryptography and network security coursework: encryption, protocols and attacks.'),
  course('cloud', 'Cloud Computing', 'Cloud computing and cloud architecture design coursework.'),
  course('ai-course', 'Artificial Intelligence', 'Artificial intelligence coursework: search, reasoning and machine learning.'),
  course('se', 'Software Engineering', 'Software engineering coursework: requirements, design, testing and process.'),
  course('architecture', 'Computer Architecture', 'Computer architecture and organisation coursework, microprocessors and embedded systems.'),
  course('maths', 'Maths for CS', 'Probability and statistics, linear algebra, discrete mathematics and graph theory coursework.'),
];

export const life = [
  {
    id: 'chess',
    title: 'Chess',
    kicker: 'Off the clock',
    body: 'Loves playing chess — where he practises thinking several moves ahead.',
    text: 'Plays chess: strategy, planning and thinking several moves ahead.',
  },
  {
    id: 'karate',
    title: 'Shito-Ryu Karate',
    kicker: 'Brown Belt (1st)',
    body: 'Holds a Brown Belt (1st) in Shito-Ryu karate — discipline on and off the mat.',
    text: 'Martial arts: brown belt in Shito-Ryu karate, discipline and training.',
  },
  {
    id: 'hackathons',
    title: 'Game-dev Hackathons',
    kicker: 'Builds under pressure',
    body: 'Has taken part in game-development hackathons.',
    text: 'Participated in game development hackathons, building games quickly in teams.',
  },
  {
    id: 'badges',
    title: 'Certifications',
    kicker: 'Credly · Google Cloud AI Boost',
    body: 'Machine-learning certifications and Google Cloud AI Boost badges.',
    text: 'Machine learning certifications and Google Cloud AI Boost skill badges.',
    url: 'https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly',
  },
  {
    id: 'curiosity',
    title: 'New Tools',
    kicker: 'Habit',
    body: 'Loves exploring new tools — which is how this map happened.',
    text: 'Curiosity: loves exploring and trying new developer tools and technologies.',
  },
].map((n) => ({ ...n, type: 'life', weight: 0.55 }));

export const tour = [
  { id: null, caption: 'This is a map of Anshveer’s work. Every place is a project, skill or experience, positioned by what it means — related things sit close together.' },
  { id: 'vit', caption: 'It starts in Vellore: B.Tech Computer Science at VIT, class of 2027, with a 9.34 CGPA.' },
  { id: 'dell', caption: 'In 2026 he interned at Dell Technologies in Bengaluru, secured through on-campus tests and interviews.' },
  { id: 'driver-analysis', caption: 'There he paired Ghidra with local LLMs to assess Windows drivers — 96% detection accuracy, hours down to minutes.' },
  { id: 'examguide', caption: 'ExamGuideAI uses the same idea as this map: sentence embeddings that place related concepts near each other.' },
  { id: 'vall', caption: 'VALL Social reached 600+ students; he was a founding member and designed its learning module and marketplace.' },
  { id: 'self-healing', caption: 'And he likes breaking things on purpose — a cluster that survives its own crashes.' },
  { id: 'chess', caption: 'Off the clock: chess and a brown belt in Shito-Ryu karate.' },
  { id: null, caption: 'Now explore. Search the map with any phrase, or ask a question and his AI will answer.' },
];
