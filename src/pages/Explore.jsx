import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import TutorCard from '../components/TutorCard'
import { db } from '../firebase/config'
import { APP_NAME } from '../config/theme'
import { getTimestampValue, normalizeUserRecord } from '../lib/records'

const Explore = () => {
  const [tutors, setTutors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const approvedTutors = snapshot.docs
          .map(docSnapshot => normalizeUserRecord(docSnapshot.id, docSnapshot.data()))
          .filter(user => user.role === 'tutor' && user.tutorStatus === 'approved')
          .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))
          .map(user => ({
            id: user.uid,
            name: user.fullName || user.displayName || 'Verified tutor',
            title: user.title || 'Approved instructor',
            specialty: user.bio || `Approved by the ${APP_NAME} admin team and ready to teach.`,
            students: user.studentCount ? `${user.studentCount} students` : 'Ready for enrollment',
            rating: user.rating || 4.9,
            level: 'Verified tutor',
            accent: user.accent || 'from-sky-500 to-cyan-400',
          }))

        setTutors(approvedTutors)
      } catch {
        setTutors([])
      } finally {
        setLoading(false)
      }
    }

    loadTutors()
  }, [])

  const filteredTutors = useMemo(() => {
    const queryValue = search.trim().toLowerCase()

    if (!queryValue) {
      return tutors
    }

    return tutors.filter(tutor =>
      [tutor.name, tutor.title, tutor.specialty]
        .join(' ')
        .toLowerCase()
        .includes(queryValue),
    )
  }, [search, tutors])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Explore</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">Discover approved tutors and the topics they teach.</h1>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-500" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search tutors or topics"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </section>

      <SectionHeading
        eyebrow="Verified tutors"
        title="Browse the tutors students can trust"
        description={loading ? 'Loading approved tutors from Firestore...' : 'These are the tutor profiles surfaced for learners.'}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {filteredTutors.length ? (
          filteredTutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600 lg:col-span-3">
            No approved tutors match your search yet.
          </div>
        )}
      </div>

      <div className="mt-12 rounded-[32px] bg-slate-950 px-6 py-8 text-white md:flex md:items-center md:justify-between md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Want to teach?</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">Upload your ID or verified credential and request approval.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Once the admin approves your request, your tutor dashboard will unlock tutorial uploads.
          </p>
        </div>

        <Link
          to="/tutor/apply"
          className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 md:mt-0"
        >
          Start application
        </Link>
      </div>
    </main>
  )
}

export default Explore
