import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from './StatCard.jsx'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TrendChart({ points }) {
  const data = points.map((p) => ({
    label: `${MONTH_SHORT[p.month - 1]} '${String(p.year).slice(2)}`,
    Income: Number(p.totalIncome),
    Expenses: Number(p.totalExpenses),
    Balance: Number(p.balance),
  }))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#98a2b3" />
          <YAxis tick={{ fontSize: 12 }} stroke="#98a2b3" width={64} />
          <Tooltip formatter={(value) => formatMoney(value)} />
          <Legend wrapperStyle={{ fontSize: 12.5 }} />
          <Line type="monotone" dataKey="Income" stroke="#2f6f4f" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Expenses" stroke="#b3492f" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
