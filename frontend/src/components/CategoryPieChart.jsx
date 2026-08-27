import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from './StatCard.jsx'

const FALLBACK_COLORS = [
  '#2f6f4f', '#b3492f', '#8b5cf6', '#06b6d4', '#eab308',
  '#ec4899', '#3b82f6', '#14b8a6', '#64748b', '#ef4444',
]

export default function CategoryPieChart({ categories }) {
  const data = categories
    .filter((c) => Number(c.spent) > 0)
    .map((c, idx) => ({
      name: c.name,
      value: Number(c.spent),
      color: c.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
    }))

  if (data.length === 0) {
    return <div className="empty-state">No expenses recorded for this month yet.</div>
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(value)} />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 12.5 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
