import './globals.css';
import { AuthGate } from '@/components/AuthGate';
import { AppShell } from '@/components/AppShell';

export const metadata = {
  title: 'Bhumi Founder Intelligence',
  description: 'Standalone Founder dashboard for Bhumi Amartya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </body>
    </html>
  );
}
