import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { ArrowRight, Banknote, Clock3, LockKeyhole, UploadCloud, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase/config'
import { useUserProfile } from '../../hooks/useUserProfile'
import StatusPill from '../../components/StatusPill'
import { formatCurrency, getTimestampValue, normalizeTutorial } from '../../lib/records'

const TutorDashBoard = () => {
  const { user, profile, loading } = useUserProfile()
  const [tutorials, setTutorials] = useState([])
  const [purchases, setPurchases] = useState([])
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        return
      }

        try {
          const [tutorialSnapshot, purchaseSnapshot, withdrawalSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'tutorials'), orderBy('createdAt', 'desc'))),
            getDocs(collection(db, 'tutorialPurchases')),
            getDocs(collection(db, 'withdrawalRequests')),
          ])

        setTutorials(tutorialSnapshot.docs.map(docSnapshot => normalizeTutorial(docSnapshot.id, docSnapshot.data())).filter(item => item.tutorId === user.uid))
        setPurchases(purchaseSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
        setWithdrawals(withdrawalSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
      } catch {
        setTutorials([])
        setPurchases([])
        setWithdrawals([])
      }
    }

    loadData()
  }, [user])

  const approved = profile?.tutorStatus === 'approved'

  const metrics = useMemo(() => {
    const tutorialIds = new Set(tutorials.map(item => item.id))
    const approvedSales = purchases.filter(item => tutorialIds.has(item.tutorialId) && item.status === 'approved')
    const pendingSales = purchases.filter(item => tutorialIds.has(item.tutorialId) && item.status === 'pending')
    const tutorWithdrawals = withdrawals.filter(item => item.tutorId === user?.uid)

    const grossRevenue = approvedSales.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const reservedWithdrawals = tutorWithdrawals
      .filter(item => ['pending', 'approved', 'paid'].includes(item.status))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const availableBalance = Math.max(0, grossRevenue - reservedWithdrawals)

    return {
      approvedSales,
      pendingSales,
      tutorWithdrawals,
      grossRevenue,
      availableBalance,
    }
  }, [purchases, tutorials, user?.uid, withdrawals])

  const stats = useMemo(
    () => [
      { label: 'Approval status', value: profile?.tutorStatus || 'draft' },
      { label: 'Published lessons', value: tutorials.length },
      { label: 'Gross revenue', value: formatCurrency(metrics.grossRevenue) },
      { label: 'Available to withdraw', value: formatCurrency(metrics.availableBalance) },
    ],
    [metrics.availableBalance, metrics.grossRevenue, profile?.tutorStatus, tutorials.length],
  )

  const recentTutorials = useMemo(() => [...tutorials].sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)), [tutorials])
  const recentWithdrawals = useMemo(
    () => [...metrics.tutorWithdrawals].sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)),
    [metrics.tutorWithdrawals],
  )

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading tutor dashboard...</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor dashboard</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Manage lessons, revenue, and payouts</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Your workspace shows what you have published, what students have paid for, and what is ready for withdrawal.
            </p>
          </div>
          <StatusPill status={profile?.tutorStatus || 'draft'} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(item => (
            <div key={item.label} className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        {!approved ? (
          <div className="mt-8 rounded-[28px] bg-amber-50 p-6 text-amber-900">
            <div className="flex items-center gap-3">
              <LockKeyhole size={20} />
              <h2 className="text-lg font-semibold">Uploads and payouts unlock after admin approval</h2>
            </div>
            <p className="mt-3 text-sm leading-6">
              Complete your tutor application and wait for approval before you can upload lessons or withdraw revenue.
            </p>
            <Link
              to="/tutor/apply"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-950 px-5 py-3 font-semibold text-white transition hover:bg-amber-900"
            >
              Review application
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3 text-slate-950">
                <UploadCloud size={20} className="text-sky-600" />
                <h2 className="text-lg font-semibold">Publish a new tutorial</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Add a lesson title, price, and video file. Students will request access and admin will approve the payment manually.
              </p>
              <Link
                to="/tutor/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Open upload page
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="flex items-center gap-3 text-slate-950">
                <Wallet size={20} className="text-sky-600" />
                <h2 className="text-lg font-semibold">Withdraw your balance</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Request a manual payout anytime your available balance is positive.
              </p>
              <Link
                to="/tutor/withdrawals"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-sky-500 hover:text-sky-600"
              >
                Go to withdrawals
                <Banknote size={18} />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <Clock3 size={20} className="text-sky-600" />
              <h2 className="text-xl font-bold text-slate-950">Recent tutorials</h2>
            </div>
                <div className="mt-4 grid gap-4">
              {recentTutorials.length ? (
                recentTutorials.map(item => (
                  <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.courseTitle || item.title}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.courseCode || 'No course code'} | {item.level} | {item.duration || 'No duration'}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                          {item.faculty || 'Faculty not set'} | {item.department || 'Department not set'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No tutorials uploaded yet.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-sky-600" />
              <h2 className="text-xl font-bold text-slate-950">Revenue and withdrawals</h2>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">Approved sales</p>
                <p className="mt-2 text-2xl font-black">{metrics.approvedSales.length}</p>
                <p className="mt-2 text-sm text-slate-300">{formatCurrency(metrics.grossRevenue)}</p>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Pending sales</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{metrics.pendingSales.length}</p>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Withdrawal history</p>
                <div className="mt-4 grid gap-3">
                  {recentWithdrawals.length ? (
                    recentWithdrawals.slice(0, 4).map(item => (
                      <div key={item.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{formatCurrency(item.amount)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.bankName} | {item.accountName}
                            </p>
                          </div>
                          <StatusPill status={item.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                      No withdrawal requests yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TutorDashBoard
