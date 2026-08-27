import { useCallback, useEffect, useRef, useState } from 'react'
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

  const filtered = transactions.filter((t) => {
    if (filter === 'INCOME') return t.type === 'INCOME'
    if (filter === 'EXPENSE') return t.type === 'EXPENSE'
    if (filter === 'UNPAID') return !t.paid
    return true
  })

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
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
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
                {filtered.map((t) => (
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
                ))}
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
