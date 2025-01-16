import type { Metadata } from 'next';
import "./globals.css";
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: "PixLTools",
  description: "Powerful AI tools to enhance your content creation workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
