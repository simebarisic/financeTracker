import { useCallback, useEffect, useState } from 'react'
import { useMonth } from '../context/MonthContext.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import StatCard, { formatMoney } from '../components/StatCard.jsx'
import CategoryPieChart from '../components/CategoryPieChart.jsx'
import TrendChart from '../components/TrendChart.jsx'
import BudgetList from '../components/BudgetList.jsx'
import { fetchMonthSummary, fetchTrend, rolloverFixedExpenses } from '../api/endpoints.js'
import { apiErrorMessage } from '../api/client.js'

export default function DashboardPage() {
  const { year, month } = useMonth()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rolloverBusy, setRolloverBusy] = useState(false)
  const [rolloverMessage, setRolloverMessage] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([
      fetchMonthSummary(year, month),
      fetchTrend(6, year, month),
    ])
      .then(([summaryData, trendData]) => {
        setSummary(summaryData)
        setTrend(trendData)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load dashboard data')))
      .finally(() => setLoading(false))
  }, [year, month])

  useEffect(() => {
    load()
  }, [load])

  async function handleRollover() {
    setRolloverBusy(true)
    setRolloverMessage('')
    try {
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const created = await rolloverFixedExpenses(prevYear, prevMonth, year, month)
      setRolloverMessage(
        created.length > 0
          ? `Copied ${created.length} fixed expense(s) from last month.`
          : 'Nothing new to copy — fixed expenses for this month already exist.'
      )
      load()
    } catch (err) {
      setRolloverMessage(apiErrorMessage(err, 'Could not copy fixed expenses'))
    } finally {
      setRolloverBusy(false)
    }
  }

  if (loading && !summary) {
    return <div className="loading-state">Loading…</div>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">A snapshot of your money, month by month.</p>
        </div>
        <MonthPicker />
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {summary && (
        <>
          <div className="grid grid-stats" style={{ marginBottom: 16 }}>
            <StatCard label="Income" value={summary.totalIncome} tone="positive" />
            <StatCard
              label="Expenses"
              value={summary.totalExpenses}
              tone="negative"
              meta={`Fixed ${formatMoney(summary.totalFixedExpenses)} · Variable ${formatMoney(summary.totalVariableExpenses)}`}
            />
            <StatCard
              label="Balance"
              value={summary.balance}
              tone={Number(summary.balance) >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
              label="Unpaid fixed expenses"
              value={summary.unpaidFixedExpenses}
              meta="Still to be paid this month"
            />
          </div>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Spending by category</h2>
              </div>
              <CategoryPieChart categories={summary.categories} />
            </div>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Budgets this month</h2>
              </div>
              <BudgetList categories={summary.categories} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h2 className="card-title">Last 6 months</h2>
            </div>
            <TrendChart points={trend} />
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Fixed expenses</h2>
              <button className="btn btn-secondary btn-sm" onClick={handleRollover} disabled={rolloverBusy}>
                {rolloverBusy ? 'Copying…' : 'Copy last month’s fixed expenses'}
              </button>
            </div>
            <p className="hint" style={{ marginBottom: 0 }}>
              Rent, subscriptions, insurance — copy them from last month instead of retyping. New copies start
              as unpaid so you can tick them off as they clear.
            </p>
            {rolloverMessage && <div className="banner banner-success" style={{ marginTop: 12 }}>{rolloverMessage}</div>}
          </div>
        </>
      )}
    </div>
  )
}
