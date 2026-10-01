import SmoothScroll from '@/components/site/SmoothScroll';
import Preloader from '@/components/site/Preloader';
import Cursor from '@/components/site/Cursor';
import Nav from '@/components/site/Nav';
import CommandPalette from '@/components/site/CommandPalette';
import CaseDrawer from '@/components/site/CaseDrawer';
import Toast from '@/components/site/Toast';
import Hero from '@/components/site/Hero';
import Manifesto from '@/components/site/Manifesto';
import Numbers from '@/components/site/Numbers';
import Interlude from '@/components/site/Interlude';
import Work from '@/components/site/Work';
import Campus from '@/components/site/Campus';
import Arsenal from '@/components/site/Arsenal';
import ExperienceSection from '@/components/site/ExperienceSection';
import Beyond from '@/components/site/Beyond';
import Contact from '@/components/site/Contact';
import AskAI from '@/components/site/AskAI';
import EasterEggs from '@/components/site/EasterEggs';
import ViewToggle from '@/components/ViewToggle';
import { profile } from '@/lib/data';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Vellore Institute of Technology' },
  url: 'https://anshveersingh.vercel.app',
  image: 'https://anshveersingh.vercel.app/profile4.jpg',
  sameAs: profile.socials.map((s) => s.url),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#work" className="skip-link">
        Skip to work
      </a>
      <SmoothScroll />
      <Preloader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Numbers />
        <Interlude />
        <Work />
        <Campus />
        <Arsenal />
        <ExperienceSection />
        <Beyond />
        <Contact />
      </main>
      <CommandPalette />
      <CaseDrawer />
      <AskAI />
      <ViewToggle current="editorial" />
      <EasterEggs />
      <Toast />
    </>
  );
}
