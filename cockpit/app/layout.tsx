import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Mission Control Cockpit',
  description: 'Operational dashboard for Mission Control',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="font-semibold">Cockpit v0</div>
              <nav className="text-sm flex gap-4">
                <a className="hover:underline" href="/">Dashboard</a>
                <a className="hover:underline" href="/board/Company">Company</a>
                <a className="hover:underline" href="/board/Ritmo">Ritmo</a>
                <a className="hover:underline" href="/agents">Agents</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
