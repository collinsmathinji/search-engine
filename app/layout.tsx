import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BountyLab Recruit | Find developers by skills & activity',
  description: 'Developer recruiting app powered by BountyLab — search developers, discover repos, build your pipeline.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app">
        <Header />
        <main className="app__main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
