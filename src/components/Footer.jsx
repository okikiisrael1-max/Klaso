import { Link } from 'react-router-dom'
import { APP_NAME } from '../config/theme'

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm">Copyright {new Date().getFullYear()} {APP_NAME}. Built for verified tutors and serious learners.</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/explore" className="transition hover:text-white">Explore</Link>
          <Link to="/tutorials" className="transition hover:text-white">Tutorials</Link>
          <Link to="/purchases" className="transition hover:text-white">Purchases</Link>
          <Link to="/tutor/apply" className="transition hover:text-white">Tutor approval</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
