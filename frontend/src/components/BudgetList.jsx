import { formatMoney } from './StatCard.jsx'

export default function BudgetList({ categories }) {
  const withBudget = categories.filter((c) => c.type === 'EXPENSE' && c.budget != null)

  if (withBudget.length === 0) {
    return <div className="empty-state">No budgets set. Add a monthly budget on a category to track it here.</div>
  }

  return (
    <div>
      {withBudget.map((c) => {
        const pct = c.percentUsed != null ? Math.min(c.percentUsed, 100) : 0
        const barColor = c.overBudget ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--primary)'
        return (
          <div className="budget-row" key={c.categoryId}>
            <div className="budget-row-top">
              <span>{c.name}</span>
              <span>
                {formatMoney(c.spent)} / {formatMoney(c.budget)}
                {c.overBudget && (
                  <strong style={{ color: 'var(--danger)', marginLeft: 6 }}>over</strong>
                )}
              </span>
            </div>
            <div className="budget-track">
              <div className="budget-fill" style={{ width: `${pct}%`, background: barColor }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
