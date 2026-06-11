import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { WhatsAppButton } from "@/frontend/components/layout/whatsapp-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "CS Store | Tranças, Cabelos, Cosméticos e Acessórios";
const siteDescription =
  "Loja especializada em tranças, cabelos, cosméticos e acessórios para beleza.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.storecs.com.br"),
  title: {
    default: siteTitle,
    template: "%s | CS Store",
  },
  description: siteDescription,
  applicationName: "CS Store",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "CS Store",
    "tranças",
    "cabelos",
    "cosméticos",
    "acessórios",
    "beleza",
    "Almenara",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://www.storecs.com.br",
    siteName: "CS Store",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/banners/banner1.webp",
        width: 1200,
        height: 630,
        alt: "CS Store - Tranças, cabelos, cosméticos e acessórios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/banners/banner1.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppButton />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
