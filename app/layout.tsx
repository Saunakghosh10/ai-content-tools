import type { Metadata } from 'next';
import "./globals.css";
import { GeistSans, GeistMono } from 'geist/font';
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from '@/components/navigation';

export const metadata: Metadata = {
  title: "AI Content Tools",
  description: "AI-powered tools for content creation and SEO optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
