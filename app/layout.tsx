import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { AuthModalProvider } from './components/AuthModalContext'
import { ThemeProvider } from './components/ThemeProvider'
import { Footer } from './components/Footer'
import { Toaster } from './components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Peque Diario - Acompañando el crecimiento de tu hijo',
  description: 'La app integral para padres que acompaña el crecimiento de tu hijo desde el nacimiento. Registro de crecimiento, sueño, alimentación, hitos y control de esfínteres.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-192x192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8CCFE0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} app-container`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('peque-diario-theme') || 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <AuthModalProvider>
              <div className="safe-area">
                {children}
              </div>
              <Footer />
              <Toaster />
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}