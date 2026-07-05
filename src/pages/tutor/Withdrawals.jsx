import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { Banknote, Clock3, Landmark, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../../firebase/config'
import { useUserProfile } from '../../hooks/useUserProfile'
import RoleGate from '../../components/RoleGate'
import StatusPill from '../../components/StatusPill'

const formatCurrency = value => `NGN ${Number(value || 0).toLocaleString()}`

const getTimestampValue = value => {
  if (!value) {
    return 0
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  return 0
}

const WithdrawalsContent = () => {
  const { user, profile } = useUserProfile()
  const [tutorials, setTutorials] = useState([])
  const [purchases, setPurchases] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const loadRecords = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const [tutorialSnapshot, purchaseSnapshot, withdrawalSnapshot] = await Promise.all([
          getDocs(collection(db, 'tutorials')),
          getDocs(collection(db, 'tutorialPurchases')),
          getDocs(collection(db, 'withdrawalRequests')),
        ])

        setTutorials(
          tutorialSnapshot.docs
            .map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }))
            .filter(item => item.tutorId === user.uid),
        )
        setPurchases(purchaseSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
        setWithdrawals(withdrawalSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
      } catch {
        setTutorials([])
        setPurchases([])
        setWithdrawals([])
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [user])

  const summary = useMemo(() => {
    const tutorialIds = new Set(tutorials.map(item => item.id))
    const approvedSales = purchases.filter(item => tutorialIds.has(item.tutorialId) && item.status === 'approved')
    const pendingSales = purchases.filter(item => tutorialIds.has(item.tutorialId) && item.status === 'pending')
    const tutorWithdrawals = withdrawals.filter(item => item.tutorId === user?.uid)

    const grossRevenue = approvedSales.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const reservedWithdrawals = tutorWithdrawals
      .filter(item => ['pending', 'approved', 'paid'].includes(item.status))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const availableBalance = Math.max(0, grossRevenue - reservedWithdrawals)
    const pendingRequests = tutorWithdrawals.filter(item => item.status === 'pending').length

    return {
      approvedSales,
      pendingSales,
      tutorWithdrawals,
      grossRevenue,
      availableBalance,
      pendingRequests,
    }
  }, [purchases, tutorials, user?.uid, withdrawals])

  const handleSubmit = async event => {
    event.preventDefault()

    if (!profile || profile.tutorStatus !== 'approved') {
      toast.error('Your tutor profile must be approved before withdrawals are available.')
      return
    }

    const requestedAmount = Number(amount)

    if (!requestedAmount || requestedAmount <= 0) {
      toast.error('Enter a valid withdrawal amount.')
      return
    }

    if (requestedAmount > summary.availableBalance) {
      toast.error('Requested amount is above your available balance.')
      return
    }

    if (!bankName || !accountName || !accountNumber) {
      toast.error('Please complete your payout details.')
      return
    }

    try {
      setSubmitting(true)
      const withdrawalId = `${user.uid}_${Date.now()}`

      await setDoc(doc(db, 'withdrawalRequests', withdrawalId), {
        tutorId: user.uid,
        tutorName: profile?.fullName || user.displayName || '',
        tutorEmail: user.email || '',
        amount: requestedAmount,
        bankName,
        accountName,
        accountNumber,
        note,
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      setAmount('')
      setBankName('')
      setAccountName('')
      setAccountNumber('')
      setNote('')
      toast.success('Withdrawal request submitted for admin review.')
      setWithdrawals(prev => [
        {
          id: withdrawalId,
          tutorId: user.uid,
          tutorName: profile?.fullName || user.displayName || '',
          tutorEmail: user.email || '',
          amount: requestedAmount,
          bankName,
          accountName,
          accountNumber,
          note,
          status: 'pending',
          createdAt: new Date(),
        },
        ...prev,
      ])
    } catch (error) {
      toast.error(error.message || 'Unable to submit withdrawal request.')
    } finally {
      setSubmitting(false)
    }
  }

  const isApproved = profile?.tutorStatus === 'approved'

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading withdrawals...</div>
      </main>
    )
  }

  if (!isApproved) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor withdrawals</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Withdrawals unlock after tutor approval</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Once the admin approves your tutor profile, you will be able to request payouts from your revenue balance.
          </p>
          <Link to="/tutor/apply" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Complete approval
          </Link>
        </section>
      </main>
    )
  }

  const recentWithdrawals = [...summary.tutorWithdrawals].sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Tutor withdrawals</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Request payout from your revenue</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Submit your bank details and request a payout. Admin will review and approve the request manually.
            </p>
          </div>
          <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-left sm:text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Available balance</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(summary.availableBalance)}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Gross revenue', formatCurrency(summary.grossRevenue), Wallet],
            ['Pending requests', summary.pendingRequests, Clock3],
            ['Lessons sold', summary.approvedSales.length, Banknote],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-[24px] bg-slate-50 p-5">
              <Icon size={18} className="text-sky-600" />
              <p className="mt-3 text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={handleSubmit} className="rounded-[28px] bg-slate-950 p-6 text-white">
            <div className="flex items-center gap-3">
              <Landmark size={20} className="text-sky-300" />
              <h2 className="text-xl font-bold">New withdrawal request</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Your request will stay in pending review until the admin manually approves it.
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-200">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={event => setAmount(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">Bank name</label>
                <input
                  value={bankName}
                  onChange={event => setBankName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="First Bank"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">Account name</label>
                <input
                  value={accountName}
                  onChange={event => setAccountName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">Account number</label>
                <input
                  value={accountNumber}
                  onChange={event => setAccountNumber(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-200">Note</label>
                <textarea
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
                  placeholder="Optional note for the admin"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
            >
              <Banknote size={18} />
              {submitting ? 'Submitting...' : 'Request payout'}
            </button>
          </form>

          <div className="rounded-[28px] bg-slate-50 p-6">
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-sky-600" />
              <h2 className="text-xl font-bold text-slate-950">Recent requests</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Track the status of every payout request in one place.
            </p>

            <div className="mt-5 grid gap-4">
              {recentWithdrawals.length ? (
                recentWithdrawals.map(request => (
                  <article key={request.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{formatCurrency(request.amount)}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {request.bankName} - {request.accountName}
                        </p>
                      </div>
                      <StatusPill status={request.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{request.note || 'No note added.'}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  No withdrawal requests yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const Withdrawals = () => (
  <RoleGate allowedRoles={['tutor']} fallback="Loading tutor withdrawals...">
    <WithdrawalsContent />
  </RoleGate>
)

export default Withdrawals
