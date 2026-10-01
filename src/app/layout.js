import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import DynamicFavicon from '@/components/DynamicFavicon';
import './globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });

export const metadata = {
  metadataBase: new URL('https://anshveersingh.vercel.app'),
  title: 'Anshveer Singh | Portfolio',
  description: 'Computer Science Engineer & Full Stack Developer specializing in Next.js, AI/ML, and 3D Web Experiences.',
  alternates: { canonical: '/' },
  verification: { google: '1ba373CS3xnI5qUCFtb9udYOybsMHxriHarRen4Ng20' },
  keywords: [
    'Anshveer Singh', 'Portfolio', 'Computer Science Engineer', 'Full Stack Developer', 'Next.js Developer',
    'React Developer', '3D Web Design', 'Three.js', 'AI/ML Engineer', 'Software Engineer India',
    'Vellore Institute of Technology', 'Vellore', 'VIT Vellore', 'VIT', 'AI/ML', 'Bengaluru', 'Karnataka',
    'Machine Learning', 'Artificial Intelligence', 'Engineer',
  ],
  openGraph: {
    title: 'Anshveer Singh | Portfolio',
    description: 'Computer Science Engineer & Full Stack Developer',
    url: 'https://anshveersingh.vercel.app',
    siteName: 'Anshveer Singh Portfolio',
    images: [{ url: '/profile1.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
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
