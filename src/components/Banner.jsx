import { ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import banner from '../assets/banner-img.png'
import { APP_NAME, theme } from '../config/theme'

const Banner = () => {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
      <div className="space-y-4">
        <div className={theme.ui.brandPill}>
          <ShieldCheck size={16} />
          Verified tutors only
        </div>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-7xl">
            Watch tutorials. Pass CBT. Teach after approval.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            {APP_NAME} connects students with approved tutors, keeps tutor credentials in Cloudinary, and stores application and tutorial data in Firestore.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/tutorials"
            className={theme.ui.darkButton}
          >
            <PlayCircle size={18} />
            Browse tutorials
          </Link>
          <Link
            to="/tutor/apply"
            className={theme.ui.secondaryButton}
          >
            Become a tutor
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-sky-200 via-cyan-100 to-white blur-3xl" />
        <img src={banner} alt={`${APP_NAME} preview`} className="relative mx-auto w-full max-w-2xl rounded-[36px] border border-slate-200 bg-white shadow-2xl" />
      </div>
    </section>
  )
}

export default Banner
