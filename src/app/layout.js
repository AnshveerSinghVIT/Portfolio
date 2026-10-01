import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import DynamicFavicon from '@/components/DynamicFavicon';
import { SITE_URL } from '@/lib/site';
import './globals.css';
import './sections.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', preload: false });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });

const DESCRIPTION =
  'Anshveer Singh — software engineer working across AI/ML and full-stack. CS at VIT Vellore (9.34 CGPA), ex-intern at Dell Technologies, building LLM tooling, RAG systems and immersive web experiences.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Anshveer Singh | Software Engineer — AI/ML & Full-Stack', template: '%s | Anshveer Singh' },
  description: DESCRIPTION,
  applicationName: 'Anshveer Singh Portfolio',
  authors: [{ name: 'Anshveer Singh', url: SITE_URL }],
  creator: 'Anshveer Singh',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  alternates: { canonical: '/' },
  verification: { google: '1ba373CS3xnI5qUCFtb9udYOybsMHxriHarRen4Ng20' },
  keywords: [
    'Anshveer Singh', 'Portfolio', 'Computer Science Engineer', 'Full Stack Developer', 'Next.js Developer',
    'React Developer', '3D Web Design', 'Three.js', 'AI/ML Engineer', 'Software Engineer India',
    'Vellore Institute of Technology', 'Vellore', 'VIT Vellore', 'VIT', 'AI/ML', 'Bengaluru', 'Karnataka',
    'Machine Learning', 'Artificial Intelligence', 'Engineer', 'Dell Technologies', 'RAG', 'LLM', 'Ghidra',
  ],
  openGraph: {
    title: 'Anshveer Singh — Software Engineer, AI/ML & Full-Stack',
    description: DESCRIPTION,
    url: '/',
    siteName: 'Anshveer Singh Portfolio',
    locale: 'en_US',
    type: 'profile',
    firstName: 'Anshveer',
    lastName: 'Singh',
  },
  twitter: { card: 'summary_large_image', title: 'Anshveer Singh — Software Engineer', description: DESCRIPTION },
};

export const viewport = { themeColor: '#efece6' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
