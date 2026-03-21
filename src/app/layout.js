import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // 1. Single, correct metadataBase pointing to your new domain
  metadataBase: new URL('https://anshveersingh.in'),
  title: "Anshveer Singh | Portfolio",
  description: "Computer Science Engineer & Full Stack Developer specializing in Next.js, AI/ML, and 3D Web Experiences.",
  
  // 2. Canonical tag ensures Google ignores the old vercel.app link
  alternates: {
    canonical: '/',
  },

  // Verification for Google Console
  verification: {
    google: "1ba373CS3xnI5qUCFtb9udYOybsMHxriHarRen4Ng20",
  },

  // 3. Your complete keyword list (with "Artificial" spelling fixed)
  keywords: [
    "Anshveer Singh",
    "Portfolio",
    "Computer Science Engineer",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "3D Web Design",
    "Three.js",
    "AI/ML Engineer",
    "Software Engineer India",
    "Vellore Institute of Technology",
    "Vellore",
    "VIT Vellore",
    "VIT",
    "AI/ML",
    "Bengaluru",
    "Karnataka",
    "Machine Learning",
    "Artificial Intelligence", 
    "Engineer"
  ],

  // 4. OpenGraph updated to point to the new .in domain
  openGraph: {
    title: "Anshveer Singh | Portfolio",
    description: "Computer Science Engineer & Full Stack Developer",
    url: "https://anshveersingh.in", 
    siteName: "Anshveer Singh Portfolio",
    images: [
      {
        url: "/profile.jpg", 
        width: 1200, // Standardized for best display on LinkedIn/Twitter
        height: 630, // Standardized for best display on LinkedIn/Twitter
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}