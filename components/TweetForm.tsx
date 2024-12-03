'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createTweet, getProgram } from '../utils/solanaProgram'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TweetForm() {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { connection } = useConnection()
  const wallet = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wallet.publicKey) {
      setError('Please connect your wallet')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const program = getProgram(connection, wallet)
      await createTweet(program, wallet, topic, content)
      setTopic('')
      setContent('')
      alert('Tweet created successfully!')
    } catch (error) {
      console.error('Error creating tweet:', error)
      setError('Failed to create tweet. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={32}
        required
      />
      <Textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        required
      />
      <Button type="submit" disabled={!wallet.publicKey || isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Tweet'}
      </Button>
    </form>
  )
}

