import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMonth } from '../context/MonthContext.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import { formatMoney } from '../components/StatCard.jsx'
import {
  deleteTransaction,
  exportTransactionsCsv,
  fetchCategories,
  fetchTransactions,
  importTransactionsCsv,
  setTransactionPaid,
} from '../api/endpoints.js'
import { apiErrorMessage } from '../api/client.js'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'INCOME', label: 'Income' },
  { key: 'EXPENSE', label: 'Expenses' },
  { key: 'UNPAID', label: 'Unpaid' },
]

export default function TransactionsPage() {
  const { year, month } = useMonth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchTransactions(year, month), fetchCategories()])
      .then(([txns, cats]) => {
        setTransactions(txns)
        setCategories(cats)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load transactions')))
      .finally(() => setLoading(false))
  }, [year, month])

  useEffect(() => {
    load()
  }, [load])

  // Categories offered in the dropdown follow the type filter (Income/Expenses)
  const categoryOptions = useMemo(() => {
    const list = filter === 'INCOME' || filter === 'EXPENSE'
      ? categories.filter((c) => c.type === filter)
      : categories
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, filter])

  function changeFilter(key) {
    setFilter(key)
    if ((key === 'INCOME' || key === 'EXPENSE') && categoryFilter !== 'ALL') {
      const cat = categories.find((c) => String(c.id) === categoryFilter)
      if (cat && cat.type !== key) setCategoryFilter('ALL')
    }
  }

  const filtered = transactions.filter((t) => {
    if (categoryFilter !== 'ALL' && String(t.categoryId) !== categoryFilter) return false
    if (filter === 'INCOME') return t.type === 'INCOME'
    if (filter === 'EXPENSE') return t.type === 'EXPENSE'
    if (filter === 'UNPAID') return !t.paid
    return true
  })

  // Grouped view: one section per category with count and net subtotal
  const groups = useMemo(() => {
    const map = new Map()
    for (const t of filtered) {
      const key = t.categoryId ?? 'none'
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: t.categoryName || 'Uncategorized',
          color: t.categoryColor || '#98a2b3',
          items: [],
          total: 0,
        })
      }
      const g = map.get(key)
      g.items.push(t)
      g.total += (t.type === 'INCOME' ? 1 : -1) * Number(t.amount)
    }
    return [...map.values()].sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
  }, [filtered])

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(t) {
    setEditing(t)
    setFormOpen(true)
  }

  function handleSaved() {
    setFormOpen(false)
    load()
  }

  async function handleTogglePaid(t) {
    try {
      await setTransactionPaid(t.id, !t.paid)
      load()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update transaction'))
    }
  }

  async function handleDelete(t) {
    if (!window.confirm(`Delete "${t.description}"?`)) return
    try {
      await deleteTransaction(t.id)
      load()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete transaction'))
    }
  }

  async function handleExport() {
    try {
      const blob = await exportTransactionsCsv(year, month)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${year}-${String(month).padStart(2, '0')}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not export CSV'))
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMessage('')
    try {
      const result = await importTransactionsCsv(file)
      setImportMessage(
        `Imported ${result.imported} transaction(s).` +
          (result.errors?.length ? ` ${result.errors.length} row(s) had errors.` : '')
      )
      load()
    } catch (err) {
      setImportMessage(apiErrorMessage(err, 'Import failed'))
    } finally {
      e.target.value = ''
    }
  }

  function renderRow(t) {
    return (
      <tr key={t.id}>
        <td>{t.transactionDate}</td>
        <td>{t.description}</td>
        <td>
          <span className="badge" style={{ background: '#f2f4f7', color: '#344054' }}>
            <span className="badge-dot" style={{ background: t.categoryColor || '#98a2b3' }} />
            {t.categoryName}
          </span>
        </td>
        <td>
          {t.fixed && <span className="badge badge-fixed">Fixed</span>}
          {!t.fixed && t.type === 'EXPENSE' && <span className="badge badge-fixed">Variable</span>}
        </td>
        <td>
          <button
            className={`badge ${t.paid ? 'badge-paid' : 'badge-unpaid'}`}
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => handleTogglePaid(t)}
            title="Click to toggle"
          >
            {t.paid ? (t.type === 'INCOME' ? 'Received' : 'Paid') : 'Unpaid'}
          </button>
        </td>
        <td className={`amount-cell ${t.type === 'INCOME' ? 'income' : 'expense'}`} style={{ textAlign: 'right' }}>
          {t.type === 'INCOME' ? '+' : '−'}{formatMoney(t.amount)}
        </td>
        <td>
          <div className="row-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t)}>Delete</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Everything you earned and spent this month.</p>
        </div>
        <MonthPicker />
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {importMessage && <div className="banner banner-success">{importMessage}</div>}

      <div className="card">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-pill ${filter === f.key ? 'active' : ''}`}
              onClick={() => changeFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <select
            className={`filter-pill ${categoryFilter !== 'ALL' ? 'active' : ''}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className={`filter-pill ${groupByCategory ? 'active' : ''}`}
            onClick={() => setGroupByCategory((v) => !v)}
            title="Group transactions by category"
          >
            Group by category
          </button>
          <div className="spacer" />
          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add transaction
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No transactions match this view yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupByCategory
                  ? groups.map((g) => (
                      <Fragment key={g.key}>
                        <tr className="group-row">
                          <td colSpan={5}>
                            <span className="badge-dot" style={{ background: g.color }} />
                            <strong>{g.name}</strong>
                            <span className="group-count">{g.items.length} transaction{g.items.length === 1 ? '' : 's'}</span>
                          </td>
                          <td className={`amount-cell ${g.total >= 0 ? 'income' : 'expense'}`} style={{ textAlign: 'right' }}>
                            {g.total >= 0 ? '+' : '−'}{formatMoney(Math.abs(g.total))}
                          </td>
                          <td></td>
                        </tr>
                        {g.items.map(renderRow)}
                      </Fragment>
                    ))
                  : filtered.map(renderRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        categories={categories}
        initial={editing}
      />
    </div>
  )
}
