import { monthLabel, useMonth } from '../context/MonthContext.jsx'

export default function MonthPicker() {
  const { year, month, goPrev, goNext, goToday } = useMonth()

  return (
    <div className="month-picker">
      <button onClick={goPrev} aria-label="Previous month">‹</button>
      <span className="label">{monthLabel(year, month)}</span>
      <button onClick={goNext} aria-label="Next month">›</button>
      <button className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }} onClick={goToday}>
        Today
      </button>
    </div>
  )
}
