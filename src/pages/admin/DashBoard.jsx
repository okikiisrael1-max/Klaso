import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import {
  Banknote,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  School2,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  Users,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../firebase/config'
import { useUserProfile } from '../../hooks/useUserProfile'
import StatusPill from '../../components/StatusPill'
import { formatCurrency, getTimestampValue, normalizePurchase, normalizeTutorial, normalizeUserRecord } from '../../lib/records'
import { questionBank } from '../../data/questionBank'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'applications', label: 'Applications', icon: ShieldAlert },
  { id: 'tutorials', label: 'Tutorials', icon: School2 },
  { id: 'purchases', label: 'Purchases', icon: TicketCheck },
  { id: 'withdrawals', label: 'Withdrawals', icon: Banknote },
  { id: 'cbt', label: 'CBT Bank', icon: Clock3 },
]

const DashBoard = () => {
  const { user, loading } = useUserProfile()
  const [activeTab, setActiveTab] = useState('overview')
  const [applications, setApplications] = useState([])
  const [paymentRequests, setPaymentRequests] = useState([])
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [users, setUsers] = useState([])
  const [tutorials, setTutorials] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationSnapshot, paymentSnapshot, withdrawalSnapshot, userSnapshot, tutorialSnapshot] = await Promise.all([
          getDocs(collection(db, 'tutorApplications')),
          getDocs(collection(db, 'tutorialPurchases')),
          getDocs(collection(db, 'withdrawalRequests')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'tutorials')),
        ])

        setApplications(applicationSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
        setPaymentRequests(paymentSnapshot.docs.map(docSnapshot => normalizePurchase(docSnapshot.id, docSnapshot.data())))
        setWithdrawalRequests(withdrawalSnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })))
        setUsers(userSnapshot.docs.map(docSnapshot => normalizeUserRecord(docSnapshot.id, docSnapshot.data())))
        setTutorials(tutorialSnapshot.docs.map(docSnapshot => normalizeTutorial(docSnapshot.id, docSnapshot.data())))
      } catch {
        setApplications([])
        setPaymentRequests([])
        setWithdrawalRequests([])
        setUsers([])
        setTutorials([])
      }
    }

    loadData()
  }, [])

  const pendingApplications = useMemo(() => applications.filter(application => application.status === 'pending'), [applications])
  const approvedApplications = useMemo(() => applications.filter(application => application.status === 'approved'), [applications])
  const pendingPayments = useMemo(() => paymentRequests.filter(request => request.status === 'pending'), [paymentRequests])
  const approvedPayments = useMemo(() => paymentRequests.filter(request => request.status === 'approved'), [paymentRequests])
  const pendingWithdrawals = useMemo(() => withdrawalRequests.filter(request => request.status === 'pending'), [withdrawalRequests])
  const approvedWithdrawals = useMemo(() => withdrawalRequests.filter(request => request.status === 'approved'), [withdrawalRequests])
  const paidWithdrawals = useMemo(() => withdrawalRequests.filter(request => request.status === 'paid'), [withdrawalRequests])

  const revenueMetrics = useMemo(() => {
    const approvedRevenue = approvedPayments.reduce((sum, request) => sum + Number(request.amount || 0), 0)
    const pendingRevenue = pendingPayments.reduce((sum, request) => sum + Number(request.amount || 0), 0)
    const payoutReserved = approvedWithdrawals.reduce((sum, request) => sum + Number(request.amount || 0), 0)
    const payoutCompleted = paidWithdrawals.reduce((sum, request) => sum + Number(request.amount || 0), 0)

    return {
      approvedRevenue,
      pendingRevenue,
      payoutReserved,
      payoutCompleted,
    }
  }, [approvedPayments, approvedWithdrawals, paidWithdrawals, pendingPayments])

  const overviewCards = [
    ['Registered users', users.length],
    ['Pending applications', pendingApplications.length],
    ['Approved tutors', approvedApplications.length],
    ['Published tutorials', tutorials.filter(item => item.status === 'published').length],
    ['Pending payments', pendingPayments.length],
    ['Pending withdrawals', pendingWithdrawals.length],
    ['Approved revenue', formatCurrency(revenueMetrics.approvedRevenue)],
  ]

  const recentActivity = [
    ...pendingApplications.map(item => ({
      key: `app-${item.id}`,
      label: 'Tutor application',
      title: item.fullName || item.email || 'Application',
      status: item.status,
      time: getTimestampValue(item.submittedAt),
    })),
    ...pendingPayments.map(item => ({
      key: `pay-${item.id}`,
      label: 'Payment request',
      title: item.tutorialTitle || 'Tutorial payment',
      status: item.status,
      time: getTimestampValue(item.createdAt),
    })),
    ...pendingWithdrawals.map(item => ({
      key: `with-${item.id}`,
      label: 'Withdrawal request',
      title: formatCurrency(item.amount),
      status: item.status,
      time: getTimestampValue(item.createdAt),
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 8)

  const updateUserRecord = async (record, payload) => {
    try {
      await updateDoc(doc(db, 'users', record.uid), payload)
      setUsers(prev => prev.map(item => (item.uid === record.uid ? { ...item, ...payload } : item)))
      toast.success('User updated.')
    } catch {
      toast.error('Unable to update this user.')
    }
  }

  const handleUserRoleChange = async (record, role) => {
    await updateUserRecord(record, {
      role,
      tutorStatus:
        role === 'student' ? 'draft' : role === 'tutor' ? record.tutorStatus || 'pending' : 'approved',
      updatedAt: serverTimestamp(),
    })
  }

  const handleTutorDecision = async (application, status) => {
    try {
      await updateDoc(doc(db, 'tutorApplications', application.id), {
        status,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'users', application.uid), {
        role: status === 'approved' ? 'tutor' : 'student',
        tutorStatus: status,
        approvedAt: status === 'approved' ? serverTimestamp() : null,
      })

      setApplications(prev => prev.map(item => (item.id === application.id ? { ...item, status } : item)))
      setUsers(prev => prev.map(item => (item.uid === application.uid ? { ...item, role: status === 'approved' ? 'tutor' : 'student', tutorStatus: status } : item)))
      toast.success(`Application ${status}.`)
    } catch {
      toast.error('Unable to update the application.')
    }
  }

  const handlePaymentDecision = async (request, status) => {
    try {
      await updateDoc(doc(db, 'tutorialPurchases', request.id), {
        status,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
        accessGrantedAt: status === 'approved' ? serverTimestamp() : null,
      })

      setPaymentRequests(prev => prev.map(item => (item.id === request.id ? { ...item, status } : item)))
      toast.success(`Payment ${status}.`)
    } catch {
      toast.error('Unable to update the payment request.')
    }
  }

  const handleWithdrawalDecision = async (request, status) => {
    try {
      const payload = {
        status,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
      }

      if (status === 'approved') {
        payload.approvedAt = serverTimestamp()
      }

      if (status === 'paid') {
        payload.paidAt = serverTimestamp()
      }

      await updateDoc(doc(db, 'withdrawalRequests', request.id), payload)

      setWithdrawalRequests(prev => prev.map(item => (item.id === request.id ? { ...item, status } : item)))
      toast.success(`Withdrawal ${status}.`)
    } catch {
      toast.error('Unable to update the withdrawal request.')
    }
  }

  const handleTutorialStatus = async (record, status) => {
    try {
      await updateDoc(doc(db, 'tutorials', record.id), {
        status,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
      })

      setTutorials(prev => prev.map(item => (item.id === record.id ? { ...item, status } : item)))
      toast.success(`Tutorial marked as ${status}.`)
    } catch {
      toast.error('Unable to update the tutorial.')
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">Loading admin dashboard...</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Admin dashboard</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Manage users, tutorials, payments, and withdrawals</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          This control center keeps the platform operations in one place. You can review tutor applications, update user roles, and manage tutorial access.
        </p>

        <div className="-mx-1 mt-8 flex gap-3 overflow-x-auto pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map(([label, value]) => (
                <div key={label} className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Approved revenue', revenueMetrics.approvedRevenue, Banknote],
                ['Pending revenue', revenueMetrics.pendingRevenue, Clock3],
                ['Reserved payouts', revenueMetrics.payoutReserved, Banknote],
                ['Paid out', revenueMetrics.payoutCompleted, ShieldCheck],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-[24px] bg-slate-50 p-5">
                  <Icon size={18} className="text-sky-600" />
                  <p className="mt-3 text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <Clock3 className="text-slate-600" size={20} />
                <h2 className="text-xl font-bold text-slate-950">Recent activity</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {recentActivity.length ? (
                  recentActivity.map(item => (
                    <div key={item.key} className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                          <p className="mt-1 font-semibold text-slate-950">{item.title}</p>
                        </div>
                        <StatusPill status={item.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'users' ? (
          <div className="mt-8 grid gap-4">
            {users.length ? (
              users.map(record => (
                <article key={record.uid} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{record.fullName || record.email}</h3>
                        <StatusPill status={record.tutorStatus} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{record.email}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold">Role:</span> {record.role}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold">Specialty:</span> {record.specialty || 'Not set'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleUserRoleChange(record, 'student')} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                        Make student
                      </button>
                      <button type="button" onClick={() => handleUserRoleChange(record, 'tutor')} className="rounded-full border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700">
                        Make tutor
                      </button>
                      <button type="button" onClick={() => handleUserRoleChange(record, 'admin')} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                        Make admin
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">No users found.</div>
            )}
          </div>
        ) : null}

        {activeTab === 'applications' ? (
          <div className="mt-8 grid gap-4">
            {pendingApplications.length ? (
              pendingApplications.map(application => (
                <article key={application.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{application.fullName}</h3>
                        <StatusPill status={application.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{application.email}</p>
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Specialty:</span> {application.specialty || 'Not provided'}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold">Credential:</span> {application.credentialType || 'Not provided'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => handleTutorDecision(application, 'approved')} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button type="button" onClick={() => handleTutorDecision(application, 'rejected')} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">No pending tutor applications.</div>
            )}
          </div>
        ) : null}

        {activeTab === 'tutorials' ? (
          <div className="mt-8 grid gap-4">
            {tutorials.length ? (
              tutorials.map(record => (
                <article key={record.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{record.courseTitle || record.title}</h3>
                        <StatusPill status={record.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {record.courseCode || 'No code'} | {record.level} | {record.duration || 'No duration'}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{record.department || 'Department not set'}</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(record.price)}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => handleTutorialStatus(record, 'published')} className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                        Publish
                      </button>
                      <button type="button" onClick={() => handleTutorialStatus(record, 'draft')} className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                        Draft
                      </button>
                      <button type="button" onClick={() => handleTutorialStatus(record, 'archived')} className="rounded-full bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700">
                        Archive
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">No tutorials found.</div>
            )}
          </div>
        ) : null}

        {activeTab === 'purchases' ? (
          <div className="mt-8 grid gap-4">
            {paymentRequests.length ? (
              paymentRequests.map(request => (
                <article key={request.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{request.tutorialTitle || 'Tutorial payment'}</h3>
                        <StatusPill status={request.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Requested by {request.userName || request.userEmail}</p>
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Amount:</span> {formatCurrency(request.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold">Reference:</span> {request.paymentRef || 'None'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => handlePaymentDecision(request, 'approved')} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        <CheckCircle2 size={16} />
                        Confirm
                      </button>
                      <button type="button" onClick={() => handlePaymentDecision(request, 'rejected')} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">No purchase requests found.</div>
            )}
          </div>
        ) : null}

        {activeTab === 'withdrawals' ? (
          <div className="mt-8 grid gap-4">
            {pendingWithdrawals.length ? (
              pendingWithdrawals.map(request => (
                <article key={request.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{request.tutorName || request.tutorEmail}</h3>
                        <StatusPill status={request.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {request.bankName} | {request.accountName} | {request.accountNumber}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Amount:</span> {formatCurrency(request.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{request.note || 'No note provided.'}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => handleWithdrawalDecision(request, 'approved')} className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                        <CheckCircle2 size={16} />
                        Approve payout
                      </button>
                      <button type="button" onClick={() => handleWithdrawalDecision(request, 'rejected')} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-600">No pending withdrawal requests.</div>
            )}

            {approvedWithdrawals.length ? (
              <div className="mt-6 grid gap-4">
                <h3 className="text-lg font-semibold text-slate-950">Approved withdrawals</h3>
                {approvedWithdrawals.map(request => (
                  <article key={request.id} className="rounded-[28px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{request.tutorName || request.tutorEmail}</p>
                        <p className="mt-1 text-sm text-slate-600">{formatCurrency(request.amount)}</p>
                      </div>
                      <StatusPill status={request.status} />
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'cbt' ? (
          <div className="mt-8 grid gap-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <Clock3 size={20} className="text-sky-600" />
                <h2 className="text-xl font-bold text-slate-950">Local CBT bank</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Update `frontend/src/data/questionBank.js` to add question sets quickly. The practice page will pick them up automatically.
              </p>
            </div>

            {questionBank.length ? (
              questionBank.map(set => (
                <article key={set.id} className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">{set.courseTitle || set.courseCode}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {set.courseCode || 'No code'} | {set.level || 'Any level'} | {set.department || 'No department'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{set.questions?.length || 0} questions</p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                No question sets have been added yet.
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default DashBoard
