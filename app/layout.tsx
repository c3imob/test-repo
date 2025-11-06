import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";

import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI BlogCraft",
  description: "Generate SEO-ready blogs in minutes with AI BlogCraft"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-zinc-950">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="container mx-auto flex-1 px-4 pb-16 pt-12">{children}</main>
            <footer className="border-t border-zinc-800 bg-zinc-900/40 py-6 text-center text-sm text-zinc-400">
              Built with ❤️ using Next.js, Prisma, and the OpenAI API. <Link href="/pricing" className="text-brand underline">View plans</Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
