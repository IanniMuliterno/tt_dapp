import TweetForm from '../components/TweetForm'
import TweetList from '../components/TweetList'

export default function Home() {
  return (
    <div className="space-y-8">
      <TweetForm />
      <TweetList />
    </div>
  )
}

