import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { BookOpen, CalendarDays, ReceiptText, ShieldCheck, TicketSlash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db } from '../firebase/config'
import { useUserProfile } from '../hooks/useUserProfile'
import StatusPill from '../components/StatusPill'
import { formatCurrency, getTimestampValue, normalizePurchase } from '../lib/records'

const Purchases = () => {
  const { user, profile, loading: profileLoading } = useUserProfile()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user) {
        setPurchases([])
        setLoading(false)
        return
      }

      try {
        const snapshot = await getDocs(collection(db, 'tutorialPurchases'))
        const records = snapshot.docs.map(docSnapshot => normalizePurchase(docSnapshot.id, docSnapshot.data()))
        setPurchases(records.filter(record => record.userId === user.uid).sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)))
      } catch {
        setPurchases([])
      } finally {
        setLoading(false)
      }
    }

    loadPurchases()
  }, [user])

  const stats = useMemo(
    () => [
      ['Total purchases', purchases.length],
      ['Approved access', purchases.filter(item => item.status === 'approved').length],
      ['Pending review', purchases.filter(item => item.status === 'pending').length],
      ['Rejected', purchases.filter(item => item.status === 'rejected').length],
    ],
    [purchases],
  )

  if (profileLoading || loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading your purchases...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Purchases</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Log in to view your purchases</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Your approved tutorial access and pending payment requests are tied to your account.
          </p>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Log in
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Purchases</p>
            <h1 className="mt-3 text-2xl font-black text-slate-950">Track every tutorial request and approval in one place</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {profile?.fullName || user.displayName || 'Your account'} can see each tutorial purchase, payment proof, and approval status here.
            </p>
          </div>

          <div className="grid gap-3 grid-cols-2 xl:min-w-[440px] xl:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-[22px] bg-slate-50 p-4">
                <p className="text-[10px] uppercase text-center text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-center text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {purchases.length ? (
            purchases.map(purchase => (
              <article key={purchase.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={purchase.status} />
                      {purchase.courseCode ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{purchase.courseCode}</span> : null}
                      {purchase.level ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{purchase.level}</span> : null}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{purchase.tutorialTitle || 'Tutorial purchase'}</h2>
                      <p className="mt-1 text-sm text-slate-600">{purchase.userEmail}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Amount</p>
                        <p className="mt-2 text-lg font-bold text-slate-950">{formatCurrency(purchase.amount)}</p>
                      </div>
                      <div className="rounded-[20px] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Payment ref</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{purchase.paymentRef || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:min-w-[220px]">
                    <Link
                      to={`/tutorials/${purchase.tutorialId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <BookOpen size={16} />
                      Open tutorial
                    </Link>
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Requested</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        <CalendarDays size={14} className="mr-1 inline-block" />
                        {purchase.createdAt ? new Date(getTimestampValue(purchase.createdAt)).toLocaleDateString() : 'Awaiting timestamp'}
                      </p>
                    </div>
                    {purchase.status === 'approved' ? (
                      <div className="rounded-[20px] bg-emerald-50 p-4 text-emerald-900">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <ShieldCheck size={16} />
                          Access granted
                        </p>
                      </div>
                    ) : purchase.status === 'pending' ? (
                      <div className="rounded-[20px] bg-amber-50 p-4 text-amber-900">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <ReceiptText size={16} />
                          Waiting for admin review
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-[20px] bg-rose-50 p-4 text-rose-900">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <TicketSlash size={16} />
                          Request not approved
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {purchase.proofUrl ? (
                  <a
                    href={purchase.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-sky-600 hover:underline"
                  >
                    View uploaded proof
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600 md:col-span-2">
              No tutorial purchases yet. When you request access to a lesson, the payment record will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Purchases
