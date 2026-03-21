
import type { Metadata } from "next";
import { Alegreya, Belleza } from "next/font/google";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";

const fontBody = Alegreya({ 
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const fontHeadline = Belleza({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "Savor Happiness | ทุกคำคือความสุข",
  description: "ลิ้มรสทุกช่วงเวลาที่พิเศษกับกาแฟและเบเกอรี่อบสดใหม่ ส่งตรงถึงบ้านคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${fontBody.variable} ${fontHeadline.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
