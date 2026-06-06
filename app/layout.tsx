import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "@/src/styles/globals.css";
import { UserProvider } from "@/src/contexts/user-context";
import SnowplowProvider from "@/src/components/snowplow-provider";
import { siteConfig } from "@/src/lib/config";
import Chatbot from "@/src/components/chatbot";
import SignalsInspector from "@/src/components/signals-inspector";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  icons: {
    icon: '/images/logos/query.svg',
    shortcut: '/images/logos/query.svg',
    apple: '/images/logos/query.svg',
  },
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: siteConfig.seo.ogImage ? [siteConfig.seo.ogImage] : [],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PNVWRPT');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${newsreader.variable} ${inter.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PNVWRPT"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SnowplowProvider>
          <UserProvider>
            {children}
            <Chatbot />
            <SignalsInspector />
          </UserProvider>
        </SnowplowProvider>
      </body>
    </html>
  );
}
