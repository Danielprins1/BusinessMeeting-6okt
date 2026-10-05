import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/tokens.css';
import '@/styles/components.css';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Verzin geloofwaardige nepantwoorden en raad welk antwoord echt is.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        {/* Lettertypes; vervang of verwijder deze regels bij een ander design (zie tokens.css). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
