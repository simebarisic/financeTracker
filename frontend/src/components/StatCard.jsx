const formatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatMoney(value) {
  return formatter.format(Number(value ?? 0))
}

export default function StatCard({ label, value, tone, meta }) {
  const toneClass = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : ''
  return (
    <div className="card stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${toneClass}`}>{formatMoney(value)}</span>
      {meta && <span className="stat-meta">{meta}</span>}
    </div>
  )
}
