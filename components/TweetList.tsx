'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import Tweet from './Tweet'
import { fetchTweets, getProgram } from '../utils/solanaProgram'

export default function TweetList() {
  const [tweets, setTweets] = useState([])
  const { connection } = useConnection()
  const wallet = useWallet()

  useEffect(() => {
    const fetchTweetsData = async () => {
      if (wallet.publicKey) {
        try {
          const program = getProgram(connection, wallet)
          const fetchedTweets = await fetchTweets(program)
          setTweets(fetchedTweets)
        } catch (error) {
          console.error('Error fetching tweets:', error)
        }
      }
    }

    fetchTweetsData()
  }, [connection, wallet.publicKey])

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <Tweet key={tweet.publicKey.toBase58()} tweet={tweet} />
      ))}
    </div>
  )
}

