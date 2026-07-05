import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import DashBoard from './pages/admin/DashBoard'
import SignUp from './pages/SignUp'
import DashBoardTutor from './pages/tutor/DashBoard'
import TutorApply from './pages/tutor/TutorApply'
import CourseDetailsTutor from './pages/tutor/CourseDetailsTutor'
import Withdrawals from './pages/tutor/Withdrawals'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Purchases from './pages/Purchases'
import Explore from './pages/Explore'
import Tutorials from './pages/Tutorials'
import TutorialDetails from './pages/TutorialDetails'
import TutorialPayment from './pages/TutorialPayment'
import CBTPractice from './pages/CBTPractice'
import TutorProfile from './pages/TutorProfile'
import Header from './components/Header'
import Footer from './components/Footer'
import RoleGate from './components/RoleGate'
import PwaBanner from './components/PwaBanner'

const App = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGate allowedRoles={['admin']}>
                <DashBoard />
              </RoleGate>
            }
          />
          <Route
            path="/tutor/dashboard"
            element={
              <RoleGate allowedRoles={['tutor']}>
                <DashBoardTutor />
              </RoleGate>
            }
          />
          <Route
            path="/tutor/upload"
            element={
              <RoleGate allowedRoles={['tutor']}>
                <CourseDetailsTutor />
              </RoleGate>
            }
          />
          <Route
            path="/tutor/withdrawals"
            element={
              <RoleGate allowedRoles={['tutor']}>
                <Withdrawals />
              </RoleGate>
            }
          />
          <Route
            path="/tutor/apply"
            element={
              <RoleGate>
                <TutorApply />
              </RoleGate>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <RoleGate>
                <Profile />
              </RoleGate>
            }
          />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/purchases"
            element={
              <RoleGate>
                <Purchases />
              </RoleGate>
            }
          />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/:tutorialId" element={<TutorialDetails />} />
          <Route
            path="/tutorials/:tutorialId/pay"
            element={
              <RoleGate>
                <TutorialPayment />
              </RoleGate>
            }
          />
          <Route path="/tutors/:tutorId" element={<TutorProfile />} />
          <Route path="/cbt" element={<CBTPractice />} />
          <Route path="*" element={<h1 className="px-4 py-12 text-3xl font-bold text-slate-950 sm:px-6 lg:px-8">404 Not Found</h1>} />
        </Routes>
      </main>
      <Footer />
      <PwaBanner />
      <Toaster position="top-right" />
    </>
  )
}

export default App
