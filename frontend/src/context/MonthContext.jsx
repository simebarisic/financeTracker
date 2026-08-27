import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const MonthContext = createContext(null)

export function MonthProvider({ children }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12

  const goPrev = useCallback(() => {
    setYear((y) => (month === 1 ? y - 1 : y))
    setMonth((m) => (m === 1 ? 12 : m - 1))
  }, [month])

  const goNext = useCallback(() => {
    setYear((y) => (month === 12 ? y + 1 : y))
    setMonth((m) => (m === 12 ? 1 : m + 1))
  }, [month])

  const goToday = useCallback(() => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
  }, [])

  const value = useMemo(
    () => ({ year, month, setYear, setMonth, goPrev, goNext, goToday }),
    [year, month, goPrev, goNext, goToday]
  )

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth must be used within MonthProvider')
  return ctx
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function monthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}
