import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, web3, utils, BN, Idl } from '@project-serum/anchor'

// Fallback IDL
const fallbackIdl: Idl = {
  version: "0.1.0",
  name: "twitter_dapp",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "tweet", isMut: true, isSigner: false },
        { name: "tweetAuthority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "topic", type: "string" },
        { name: "content", type: "string" }
      ]
    }
  ],
  accounts: [
    {
      name: "Tweet",
      type: {
        kind: "struct",
        fields: [
          { name: "tweetAuthor", type: "publicKey" },
          { name: "topic", type: { array: ["u8", 32] } },
          { name: "topicLength", type: "u8" },
          { name: "content", type: { array: ["u8", 500] } },
          { name: "likes", type: "u64" },
          { name: "dislikes", type: "u64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
}

const programID = new PublicKey('5p8zwC7vtT6zwLEF8kvj7EcQ5UKsYT5NDTqhBwtQ5fvd')
const TWEET_SEED = 'TWEET_SEED'
const TWEET_REACTION_SEED = 'TWEET_REACTION_SEED'
const COMMENT_SEED = 'COMMENT_SEED'

export const getProgram = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
  return new Program(fallbackIdl, programID, provider)
}

export const createTweet = async (program: Program, wallet: any, topic: string, content: string) => {
  const [tweetPDA] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(topic),
      utils.bytes.utf8.encode(TWEET_SEED),
      wallet.publicKey.toBuffer(),
    ],
    program.programId
  )

  try {
    await program.methods
      .initialize(topic, content)
      .accounts({
        tweet: tweetPDA,
        tweetAuthority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    return tweetPDA
  } catch (error) {
    console.error('Error creating tweet:', error)
    throw error
  }
}

export const addReaction = async (program: Program, wallet: any, tweet: PublicKey, isLike: boolean) => {
  const [reactionPDA] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(TWEET_REACTION_SEED),
      wallet.publicKey.toBuffer(),
      tweet.toBuffer(),
    ],
    program.programId
  )

  try {
    await program.methods
      .addReaction(isLike ? { like: {} } : { dislike: {} })
      .accounts({
        tweet,
        tweetReaction: reactionPDA,
        reactionAuthor: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  } catch (error) {
    console.error('Error adding reaction:', error)
    throw error
  }
}

export const removeReaction = async (program: Program, wallet: any, tweet: PublicKey) => {
  const [reactionPDA] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(TWEET_REACTION_SEED),
      wallet.publicKey.toBuffer(),
      tweet.toBuffer(),
    ],
    program.programId
  )

  try {
    await program.methods
      .reactionRemove()
      .accounts({
        tweet,
        tweetReaction: reactionPDA,
        reactionAuthor: wallet.publicKey,
      })
      .rpc()
  } catch (error) {
    console.error('Error removing reaction:', error)
    throw error
  }
}

export const addComment = async (program: Program, wallet: any, tweet: PublicKey, content: string) => {
  const contentHash = utils.sha256.hash(content)
  const [commentPDA] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(COMMENT_SEED),
      wallet.publicKey.toBuffer(),
      contentHash,
      tweet.toBuffer(),
    ],
    program.programId
  )

  try {
    await program.methods
      .commentTweet(content)
      .accounts({
        tweet,
        comment: commentPDA,
        commentAuthor: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export const removeComment = async (program: Program, wallet: any, comment: PublicKey) => {
  try {
    await program.methods
      .commentRemove()
      .accounts({
        comment,
        commentAuthor: wallet.publicKey,
      })
      .rpc()
  } catch (error) {
    console.error('Error removing comment:', error)
    throw error
  }
}

export const fetchTweets = async (program: Program) => {
  try {
    const tweets = await program.account.tweet.all()
    return tweets.map((tweet) => ({
      publicKey: tweet.publicKey,
      author: tweet.account.tweetAuthor,
      topic: utils.bytes.utf8.decode(tweet.account.topic).replace(/\0/g, ''),
      content: utils.bytes.utf8.decode(tweet.account.content).replace(/\0/g, ''),
      likes: tweet.account.likes.toNumber(),
      dislikes: tweet.account.dislikes.toNumber(),
    }))
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return []
  }
}

export const fetchComments = async (program: Program, tweetPublicKey: PublicKey) => {
  try {
    const comments = await program.account.comment.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: tweetPublicKey.toBase58(),
        },
      },
    ])
    return comments.map((comment) => ({
      publicKey: comment.publicKey,
      author: comment.account.commentAuthor,
      content: utils.bytes.utf8.decode(comment.account.content).replace(/\0/g, ''),
    }))
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

