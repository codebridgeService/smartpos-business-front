import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/context";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartPOS - Business & Point of Sale",
  description: "Modern POS and multi-tenant business management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=Nunito:ital,wght@0,300..1000;1,300..1000&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('smartpos_theme');
                  var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  var appearance = localStorage.getItem('smartpos_appearance_settings');
                  if (appearance) {
                    var parsed = JSON.parse(appearance);
                    if (parsed.fontFamily && parsed.fontFamily !== 'Default' && parsed.fontFamily !== 'Nunito') {
                      document.documentElement.style.setProperty('--app-font', '"' + parsed.fontFamily + '", sans-serif');
                      document.documentElement.setAttribute('data-font-family', parsed.fontFamily);
                      var styleEl = document.createElement('style');
                      styleEl.id = 'smartpos-dynamic-font';
                      styleEl.textContent = ':root, html, body, button, input, select, textarea, h1, h2, h3, h4, h5, h6, p, span, a, label, div, table, td, th { font-family: "' + parsed.fontFamily + '", sans-serif !important; } code, kbd, samp, pre, .font-mono { font-family: var(--font-mono, monospace) !important; }';
                      document.head.appendChild(styleEl);
                    } else {
                      var oldStyle = document.getElementById('smartpos-dynamic-font');
                      if (oldStyle) oldStyle.remove();
                      document.documentElement.removeAttribute('data-font-family');
                      document.documentElement.style.removeProperty('--app-font');
                    }
                    if (parsed.selectedAccent) {
                      var accentMap = {
                        orange: '#FE9F43',
                        purple: '#7059FF',
                        blue: '#2E7DFF',
                        bronze: '#C85A17'
                      };
                      var themeMap = {
                        orange: 'orange',
                        purple: 'purple',
                        blue: 'blue',
                        bronze: 'amber'
                      };
                      var hex = accentMap[parsed.selectedAccent] || '#FE9F43';
                      var themeColorId = themeMap[parsed.selectedAccent] || 'orange';
                      document.documentElement.style.setProperty('--primary-accent', hex);
                      document.documentElement.style.setProperty('--primary', hex);
                      document.documentElement.style.setProperty('--primary-500', hex);
                      document.documentElement.style.setProperty('--primary-600', hex);
                      document.documentElement.setAttribute('data-theme-color', themeColorId);
                    }
                    if (parsed.sidebarSize) {
                      var sizeMap = { 'Small - 85px': '85px', 'Medium - 200px': '200px', 'Default - 240px': '240px', 'Large - 260px': '260px' };
                      var w = sizeMap[parsed.sidebarSize] || '240px';
                      document.documentElement.style.setProperty('--sidebar-width', w);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
