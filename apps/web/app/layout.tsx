import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'COSMOS — Astrology Platform',
  description:
    'A multi-tradition astrology platform supporting Western, Vedic, and Hellenistic astrological calculations and interpretations.',
  keywords: ['astrology', 'natal chart', 'birth chart', 'vedic', 'western', 'hellenistic', 'cosmos'],
  authors: [{ name: 'COSMOS' }],
  openGraph: {
    title: 'COSMOS — Astrology Platform',
    description: 'Multi-tradition astrology calculations and interpretations.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-cosmos-void text-cosmos-mist font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
