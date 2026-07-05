const SectionHeading = ({ eyebrow, title, description, align = 'left' }) => {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">{title}</h2>
      {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{description}</p> : null}
    </div>
  )
}

export default SectionHeading
