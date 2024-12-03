'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletButton() {
  const { publicKey } = useWallet()

  return (
    <div className="flex justify-end mb-4">
      <WalletMultiButton />
      {publicKey && (
        <p className="ml-4 self-center">
          Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </p>
      )}
    </div>
  )
}

