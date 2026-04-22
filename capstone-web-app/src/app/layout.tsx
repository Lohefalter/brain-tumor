import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brain Tumor Classification — UCSF-PDGM-v5',
  description: 'Experiment dashboard for HGG/LGG glioma classification',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen`}>
        <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
            <span className="font-semibold text-sm text-zinc-100 mr-2">
              Brain Tumor Dashboard
            </span>
            <span className="text-zinc-700 text-xs hidden sm:block">UCSF-PDGM-v5 · HGG vs LGG</span>
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/runs"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Runs
              </Link>
              <Link
                href="/about"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
