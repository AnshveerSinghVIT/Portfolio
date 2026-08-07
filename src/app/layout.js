import { Inter } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // 1. Set the Base to your permanent Vercel link
  metadataBase: new URL('https://anshveersingh.vercel.app'),
  title: "Anshveer Singh | Portfolio",
  description: "Computer Science Engineer & Full Stack Developer specializing in Next.js, AI/ML, and 3D Web Experiences.",
  
  // 2. This tells Google that the Vercel version is the master copy
  alternates: {
    canonical: '/',
  },

  // Verification for Google Console
  verification: {
    google: "1ba373CS3xnI5qUCFtb9udYOybsMHxriHarRen4Ng20",
  },

  // 3. Your keywords remain untouched
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

  // 4. OpenGraph updated to Vercel so your link previews stay safe long-term
  openGraph: {
    title: "Anshveer Singh | Portfolio",
    description: "Computer Science Engineer & Full Stack Developer",
    url: "https://anshveersingh.vercel.app", 
    siteName: "Anshveer Singh Portfolio",
    images: [
      {
        url: "/profile1.jpg", 
        width: 1200, 
        height: 630, 
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}