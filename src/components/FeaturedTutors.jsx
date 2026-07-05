import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import SectionHeading from './SectionHeading'
import TutorCard from './TutorCard'
import { db } from '../firebase/config'
import { getTimestampValue, normalizeUserRecord } from '../lib/records'

const FeaturedTutors = () => {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const records = snapshot.docs
          .map(docSnapshot => normalizeUserRecord(docSnapshot.id, docSnapshot.data()))
          .filter(user => user.role === 'tutor' && user.tutorStatus === 'approved')
          .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))
          .slice(0, 3)
          .map(user => ({
            id: user.uid,
            name: user.fullName || 'Approved tutor',
            title: user.title || 'University tutor',
            specialty: user.specialty || user.bio || 'Verified and ready to teach.',
            students: user.studentCount ? `${user.studentCount} students` : 'Open for enrollment',
            rating: user.rating || 5,
            level: 'Verified tutor',
            accent: 'from-sky-500 to-cyan-400',
          }))

        setTutors(records)
      } catch {
        setTutors([])
      } finally {
        setLoading(false)
      }
    }

    loadTutors()
  }, [])

  return (
    <section>
      <SectionHeading
        eyebrow="Featured tutors"
        title="Learn from verified tutors"
        description={loading ? 'Loading approved tutor profiles from Firestore...' : 'These profiles are pulled directly from the users collection.'}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {tutors.length ? (
          tutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600 lg:col-span-3">
            No approved tutors yet. Once an admin approves tutor accounts, they will appear here automatically.
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedTutors

