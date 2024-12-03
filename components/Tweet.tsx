'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import { addReaction, removeReaction, getProgram } from '../utils/solanaProgram'
import { PublicKey } from '@solana/web3.js'

type TweetProps = {
  tweet: {
    publicKey: PublicKey
    author: PublicKey
    topic: string
    content: string
    likes: number
    dislikes: number
  }
}

export default function Tweet({ tweet }: TweetProps) {
  const [likes, setLikes] = useState(tweet.likes)
  const [dislikes, setDislikes] = useState(tweet.dislikes)
  const { connection } = useConnection()
  const wallet = useWallet()

  const handleReaction = async (isLike: boolean) => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet')
      return
    }

    try {
      const program = getProgram(connection, wallet)
      await addReaction(program, wallet, tweet.publicKey, isLike)
      if (isLike) {
        setLikes(likes + 1)
      } else {
        setDislikes(dislikes + 1)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
      alert('Failed to add reaction')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tweet.topic}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{tweet.content}</p>
        <p className="text-sm text-gray-500 mt-2">Author: {tweet.author.toBase58()}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => handleReaction(true)}>
          <ThumbsUp className="mr-2 h-4 w-4" /> {likes}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleReaction(false)}>
          <ThumbsDown className="mr-2 h-4 w-4" /> {dislikes}
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" /> Comment
        </Button>
      </CardFooter>
    </Card>
  )
}

