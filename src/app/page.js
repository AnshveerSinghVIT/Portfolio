import Experience from '@/components/Experience';
import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      
      {/* --- VISUAL LAYER (For Humans) --- */}
      <BackgroundAnimation />
      <section className="relative z-10">
        <Experience />
      </section>

      {/* --- SEO LAYER (For Robots) --- 
          Hidden from view, but readable by search engines. 
          Contains all data from your 3D scene.
      */}
      <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 z-0 pointer-events-none">
        
        {/* HEADER */}
        <header>
          <h1>Anshveer Singh</h1>
          <h2>Computer Science & Engineering Student at VIT, Vellore</h2>
          <p>
            Full Stack Developer and Machine Learning Engineer based in Bengaluru, India.
            Specializing in Next.js, AI/ML, and 3D Web Experiences.
          </p>
          
        </header>

        {/* SKILLS / TECHNICAL ARSENAL */}
        <section>
          <h3>Technical Skills</h3>
          <ul>
            <li><strong>Languages:</strong> Python, TypeScript, C++, Java, SQL, JavaScript</li>
            <li><strong>Frameworks:</strong> Next.js 15, React, Node.js, Tailwind CSS, Prisma, Flask</li>
            <li><strong>Cloud & DevOps:</strong> AWS EC2, Google Vertex AI, Supabase, PostgreSQL, Vercel, Docker, Git</li>
            <li><strong>Soft Skills:</strong> Leadership, Adaptability, Problem Solving</li>
          </ul>
        </section>

        {/* PROJECTS */}
        <section>
          <h3>Engineering Projects</h3>
          
          <article>
            <h4><a href="https://github.com/AnshveerSinghVIT/Mental_Health_Prediction_ML_Project">Mental Health AI Prediction</a></h4>
            <p>Diagnostic Classifier developed using Machine Learning, Python, and Flask. Achieved high accuracy in predicting mental health conditions.</p>
          </article>

          <article>
            <h4><a href="https://lemon-iota.vercel.app">RealPro Nexus</a></h4>
            <p>E-commerce and Inventory Engine capable of managing 1500+ units. Built with Next.js, Supabase, and Tailwind CSS.</p>
          </article>

          <article>
            <h4><a href="https://vmedia.onrender.com/">Vall Social</a></h4>
            <p>Campus Social Network platform built with React and MongoDB.</p>
          </article>
        </section>

        {/* EXPERIENCE */}
        <section>
          <h3>Professional Experience</h3>
          <article>
            <h4>Machine Learning Developer Intern - Smartbridge (Google Partner)</h4>
            <p>May 2025 - June 2025</p>
            <p>Developed Mental Health Prediction Models using Google Cloud Vertex AI and worked on AI Chatbots.</p>
            <ul>
              <li><a href="https://skillwallet.smartinternz.com/internships/google_developers/d0e7b521c18b09876cb7693e42880dba">View Internship Certificate</a></li>
              <li><a href="https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly">Credly Badges</a></li>
              <li><a href="https://www.skills.google/public_profiles/a0bfdad5-777c-4017-8384-8199118381ff">Google Skills Profile</a></li>
            </ul>
          </article>
        </section>

        {/* CONTACT & LINKS */}
        <footer>
          <h3>Contact Information</h3>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:singhanshveer73@gmail.com">singhanshveer73@gmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+917795478003">+91 7795478003</a></li>
            <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/anshveer-singh-3523b728b/">Anshveer Singh LinkedIn</a></li>
            <li><strong>GitHub:</strong> <a href="https://github.com/AnshveerSinghVIT/">AnshveerSinghVIT</a></li>
            <li><strong>Resume:</strong> <a href="https://drive.google.com/file/d/17Pp8wXhmL6BGtctHEXfqwqHOK5MEcSo4/view">Download PDF Resume</a></li>
            <li><strong>Location:</strong> Bengaluru, India</li>
          </ul>
        </footer>

      </div>
    </main>
  );
}