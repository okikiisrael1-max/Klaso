const styles = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  paid: 'bg-sky-100 text-sky-800',
  draft: 'bg-slate-100 text-slate-700',
}

const StatusPill = ({ status }) => {
  const normalized = status || 'draft'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[normalized] || styles.draft}`}>
      {normalized}
    </span>
  )
}

export default StatusPill
