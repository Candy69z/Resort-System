import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { MockDataProvider } from "@/lib/mock-data-context";
import DashboardShell from "@/components/DashboardShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lampang Resort — Management Dashboard",
  description: "Internal PMS & POS system for Lampang nature resort",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-screen">
        <I18nProvider>
          <AuthProvider>
            <MockDataProvider>
              <DashboardShell>{children}</DashboardShell>
            </MockDataProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
