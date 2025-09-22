import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Providers } from "@/components/Providers";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookings - Admin",
  description: "Handle bookings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 p-6">
              <div className="flex justify-start gap-2 flex-row items-center">
              <SidebarTrigger />
              <Breadcrumbs />
              </div>
              {children}
            </main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
