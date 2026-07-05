import { ArrowRight, BadgeCheck, ShieldCheck, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import Banner from '../components/Banner'
import FeaturedTutors from '../components/FeaturedTutors'
import PopularCourses from '../components/PopularCourses'
import SectionHeading from '../components/SectionHeading'
import { learningTracks } from '../data/catalog'

const iconMap = {
  video: Video,
  shield: ShieldCheck,
  check: BadgeCheck,
}

const Home = () => {
  return (
    <main className="bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#f8fafc_38%,_#ffffff_100%)]">
      <Banner />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
             [
              "Expert Tutors",
              "Learn from experienced educators carefully reviewed before publishing.",
              "Quality"
            ],
            [
              "Video Learning",
              "High-quality tutorials designed to help students learn at their own pace.",
              "HD"
            ],
            [
              "CBT Practice",
              "Prepare with realistic computer-based tests and instant feedback.",
              "24/7"
            ],
            [
              "Progress Tracking",
              "Monitor your learning journey and stay motivated with your achievements.",
              "Live"
            ],
          ].map(([title, description, value]) => (
            <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-black text-slate-950">{value}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PopularCourses />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A clean path from tutor application to published lessons"
          description="Tutors upload an identity or verified credential before approval. Admins review the application in Firestore, and only approved tutors can upload tutorial videos."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {learningTracks.map(track => {
            const Icon = iconMap[track.icon]

            return (
              <article key={track.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{track.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{track.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-6 rounded-[36px] bg-slate-950 px-6 py-10 text-white md:flex-row md:items-end md:justify-between md:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">For tutors</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Upload your verified credential, then start teaching.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">
              Apply as a tutor, let the admin verify your identity or credential, and once you are approved, publish tutorial videos directly from your dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[280px]">
            <Link
              to="/tutor/apply"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Apply for approval
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/tutorials"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Browse tutorials
              <Video size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FeaturedTutors />
      </section>
    </main>
  )
}

export default Home
