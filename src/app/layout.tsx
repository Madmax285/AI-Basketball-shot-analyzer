
import type { Metadata } from 'next';
import './globals.css';
import { LayoutShell } from '@/components/layout-shell';

export const metadata: Metadata = {
  title: 'VolunteerBridge — AI-powered volunteer coordination',
  description: 'Matching passionate volunteers with impactful NGO missions using AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
