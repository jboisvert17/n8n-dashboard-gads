import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { Providers } from '@/components/Providers';
import { MainContent } from '@/components/MainContent';
import './globals.css';

export const metadata: Metadata = {
  title: 'Google Ads Dashboard | MCC',
  description: 'Dashboard MCC pour gérer vos comptes Google Ads',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-dark-900 text-gray-100 antialiased">
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Contenu principal */}
            <MainContent>
              {children}
            </MainContent>
          </div>
        </Providers>
      </body>
    </html>
  );
}

