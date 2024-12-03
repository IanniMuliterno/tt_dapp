import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SolanaProvider from '../components/SolanaProvider'
import WalletButton from '../components/WalletButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solana Twitter DApp',
  description: 'A decentralized Twitter-like application built on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaProvider>
          <div className="container mx-auto px-4">
            <header className="py-6">
              <h1 className="text-3xl font-bold">Solana Twitter DApp</h1>
              <WalletButton />
            </header>
            <main>{children}</main>
          </div>
        </SolanaProvider>
      </body>
    </html>
  )
}

