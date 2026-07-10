import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import SectionHeading from './SectionHeading'
import TutorialCard from './TutorialCard'
import { db } from '../firebase/config'
import { APP_NAME } from '../config/theme'
import { getTimestampValue, normalizeTutorial } from '../lib/records'
import { PlayCircle } from 'lucide-react'

const PopularCourses = () => {
  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutorials = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tutorials'))
        const records = snapshot.docs
          .map(docSnapshot => normalizeTutorial(docSnapshot.id, docSnapshot.data()))
          .filter(item => item.status === 'published')
          .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))

        setTutorials(records)
      } catch {
        setTutorials([])
      } finally {
        setLoading(false)
      }
    }

    loadTutorials()
  }, [])

  return (
    <section>
      <SectionHeading
        eyebrow="Popular lessons"
        title={`Trending tutorials on ${APP_NAME}`}
        description={loading ? 'Loading live tutorials ...' : 'These are the latest published lessons available.'}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {tutorials.length ? tutorials.slice(0, 3).map(tutorial => <TutorialCard key={tutorial.id} tutorial={tutorial} />) : (
          <div className="rounded-[28px] text-center border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600 lg:col-span-3">
            <PlayCircle size={50} className='opacity-50 flex mx-auto' />
            No published tutorials yet.
          </div>
        )}
      </div>
    </section>
  )
}

export default PopularCourses
