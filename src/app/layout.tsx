// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Chewy } from 'next/font/google'; // ✅ Combined import
import { AuthProvider } from '@/context/AuthContext';
import { UploaderProvider } from '@/context/UploaderContext';
import PageLoaderWrapper from '../components/PageLoaderWrapper';
import StripeWrapper from '../components/StripeWrapper';
import { Toaster } from '@/components/ui/toaster';
import UploadingOverlay from '@/components/UploadingOverlay';

const inter = Inter({ subsets: ['latin'] });
const chewy = Chewy({ weight: '400', subsets: ['latin'], display: 'swap' }); // ✅ Setup

export const metadata: Metadata = {
  title: 'KnotReels – Watch, Create, Connect',
  description: 'A creative content platform for sharing powerful microfilms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-background text-foreground ${inter.className} ${chewy.className}`}>

        <AuthProvider>
          <UploaderProvider>
            <StripeWrapper>
              <PageLoaderWrapper>
                <UploadingOverlay />
                {children}
                <Toaster />
              </PageLoaderWrapper>
            </StripeWrapper>
          </UploaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}