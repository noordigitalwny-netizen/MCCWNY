import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muslim Community Center of WNY - Admin Portal",
  description: "Admin portal for managing members, students, financial transactions, bank uploads, and reports for MCCWNY.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
      </body>
    </html>
  );
}
