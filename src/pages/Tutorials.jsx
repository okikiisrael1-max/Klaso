import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { Search, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import TutorialCard from '../components/TutorialCard'
import { db } from '../firebase/config'
import { getTimestampValue, normalizeTutorial } from '../lib/records'

const categories = ['All', '100 lvl', '200 lvl', '300 lvl', '400 lvl', '500 lvl']

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutorials = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tutorials'))
        const mapped = snapshot.docs
          .map(docSnapshot => normalizeTutorial(docSnapshot.id, docSnapshot.data()))
          .filter(item => item.status === 'published')
          .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))

        setTutorials(mapped)
      } catch {
        setTutorials([])
      } finally {
        setLoading(false)
      }
    }

    loadTutorials()
  }, [])

  const filteredTutorials = useMemo(() => {
    const q = search.trim().toLowerCase()

    return tutorials.filter(item => {
      const matchesSearch = !q || [item.title, item.tutorName, item.description].join(' ').toLowerCase().includes(q)
      const matchesCategory = category === 'All' || item.level === category
      return matchesSearch && matchesCategory
    })
  }, [category, search, tutorials])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full rounded-[30px] border mb-2.5 border-slate-200 bg-white p-5 shadow-sm lg:max-w-md">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-500" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search tutorials"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"/>
          </label>

          <div className="mt-4 flex items-start gap-2">
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categories.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full text-[12px] px-4 py-2 text-sm font-semibold transition ${
                    category === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

      <SectionHeading
        eyebrow="Library"
        title={loading ? 'Loading published tutorials...' : 'Recent video lessons'}
        description=""
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {filteredTutorials.length ? (
          filteredTutorials.map(tutorial => <TutorialCard key={tutorial.id} tutorial={tutorial} />)
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600 lg:col-span-3">
            No published tutorials yet.
          </div>
        )}
      </div>
    </main>
  )
}

export default Tutorials
