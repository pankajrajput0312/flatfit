import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlatFit — Fitness Tracking for Flatmates',
  description: 'Track gym, water, and protein with your flatmates',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} overflow-x-hidden`}>
      <body className="font-sans overflow-x-hidden">
        <div className="min-h-screen flex items-start justify-center bg-canvas overflow-x-hidden">
          <div className="app-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
