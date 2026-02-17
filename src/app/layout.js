import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://anshveersingh.vercel.app'),
  title: "Anshveer Singh | Portfolio",
  description: "Computer Science Engineer & Full Stack Developer specializing in Next.js, AI/ML, and 3D Web Experiences.",
  // Verification for Google Console
  verification: {
    google: "1ba373CS3xnI5qUCFtb9udYOybsMHxriHarRen4Ng20",
  },
  // Add keywords here
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
    "Artifical Intelligence",
    "Engineer"
  ],
  // Optional: Add OpenGraph for better sharing on LinkedIn/Twitter
  openGraph: {
    title: "Anshveer Singh | Portfolio",
    description: "Computer Science Engineer & Full Stack Developer",
    url: "https://anshveersingh.vercel.app",
    siteName: "Anshveer Singh Portfolio",
    images: [
      {
        url: "/profile.jpg", // Ensure this image exists in your public folder
        width: 800,
        height: 600,
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