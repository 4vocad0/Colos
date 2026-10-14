import type { Metadata } from "next";
import './globals.css';
import Navbar from './components/Navbar';   
export const metadata: Metadata = {
  title: 'Kolos',
  description: 'Aplikacja do zarządzania planami treningowymi i społecznością fitness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
    <html lang="pl">
      <body className="
        min-h-screen 
        bg-[#111315]
        text-white
        p-8
        md:p-12
        bg-[radial-gradient(circle_at_top_right,#3a3500,transparent_35%)]
      ">
        <Navbar />

        {children}
      </body>
    </html>
  );
}
