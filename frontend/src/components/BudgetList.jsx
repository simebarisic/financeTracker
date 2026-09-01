import { formatMoney } from './StatCard.jsx'

const GROUPS = [
  { key: 'NEEDS', label: 'Needs', pct: 0.5 },
  { key: 'WANTS', label: 'Wants', pct: 0.3 },
  { key: 'SAVINGS', label: 'Savings', pct: 0.2 },
]

function sumSpent(categories) {
  return categories.reduce((acc, c) => acc + Number(c.spent ?? 0), 0)
}

function CategoryRow({ c }) {
  const pct = c.percentUsed != null ? Math.min(c.percentUsed, 100) : 0
  const barColor = c.overBudget ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--primary)'
  return (
    <div className="budget-row budget-row-nested">
      <div className="budget-row-top">
        <span>{c.name}</span>
        <span>
          {c.budget != null ? (
            <>
              {formatMoney(c.spent)} / {formatMoney(c.budget)}
              {c.overBudget && <strong style={{ color: 'var(--danger)', marginLeft: 6 }}>over</strong>}
            </>
          ) : (
            formatMoney(c.spent)
          )}
        </span>
      </div>
      {c.budget != null && (
        <div className="budget-track">
          <div className="budget-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      )}
    </div>
  )
}

export default function BudgetList({ categories, totalIncome }) {
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const grouped = GROUPS.map((g) => ({
    ...g,
    categories: expenseCategories.filter((c) => c.budgetGroup === g.key),
  }))
  // Categories with an individual budget but no Needs/Wants/Savings group assigned yet —
  // keep showing these so nothing that used to appear here disappears.
  const other = expenseCategories.filter((c) => c.budgetGroup == null && c.budget != null)

  const hasAnyGrouped = grouped.some((g) => g.categories.length > 0)

  if (!hasAnyGrouped && other.length === 0) {
    return (
      <div className="empty-state">
        No budgets set. Add a monthly budget — and optionally a Needs/Wants/Savings group — on a
        category to track it here.
      </div>
    )
  }

  const income = Number(totalIncome ?? 0)

  return (
    <div>
      {grouped.map((g) => {
        if (g.categories.length === 0) return null
        const spent = sumSpent(g.categories)
        const target = income * g.pct
        const pct = target > 0 ? Math.min((spent / target) * 100, 100) : 0
        const overTarget = target > 0 && spent > target
        const barColor = overTarget ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--primary)'
        return (
          <div className="budget-group" key={g.key}>
            <div className="budget-row-top budget-group-top">
              <span>
                {g.label}
                <span className="hint" style={{ marginLeft: 6 }}>
                  ({Math.round(g.pct * 100)}% target)
                </span>
              </span>
              <span>
                {formatMoney(spent)} / {income > 0 ? formatMoney(target) : '—'}
                {overTarget && <strong style={{ color: 'var(--danger)', marginLeft: 6 }}>over</strong>}
              </span>
            </div>
            {income > 0 && (
              <div className="budget-track budget-track-group">
                <div className="budget-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            )}
            {g.categories.map((c) => (
              <CategoryRow c={c} key={c.categoryId} />
            ))}
          </div>
        )
      })}

      {other.length > 0 && (
        <div className="budget-group">
          <div className="budget-row-top budget-group-top">
            <span>Other budgets</span>
          </div>
          <p className="hint" style={{ marginTop: 0 }}>
            Not assigned to a Needs/Wants/Savings group yet.
          </p>
          {other.map((c) => (
            <CategoryRow c={c} key={c.categoryId} />
          ))}
        </div>
      )}

      {income === 0 && hasAnyGrouped && (
        <p className="hint" style={{ marginTop: 12 }}>
          No income logged this month yet, so group targets (50/30/20 of income) can't be calculated.
        </p>
      )}
    </div>
  )
}
