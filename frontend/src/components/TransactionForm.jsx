import { useEffect, useState } from 'react'
import { createTransaction, updateTransaction } from '../api/endpoints.js'
import { apiErrorMessage } from '../api/client.js'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  type: 'EXPENSE',
  categoryId: '',
  amount: '',
  description: '',
  transactionDate: today(),
  fixed: false,
  paid: true,
}

export default function TransactionForm({ open, onClose, onSaved, categories, initial }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        type: initial.type,
        categoryId: String(initial.categoryId),
        amount: String(initial.amount),
        description: initial.description,
        transactionDate: initial.transactionDate,
        fixed: initial.fixed,
        paid: initial.paid,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [open, initial])

  if (!open) return null

  const categoriesForType = categories.filter((c) => c.type === form.type)

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'type') {
        next.categoryId = ''
        if (value === 'INCOME') next.fixed = false
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Please choose a category.')
      return
    }

    const payload = {
      type: form.type,
      categoryId: Number(form.categoryId),
      amount: Number(form.amount),
      description: form.description.trim(),
      transactionDate: form.transactionDate,
      fixed: form.type === 'EXPENSE' ? form.fixed : false,
      paid: form.paid,
    }

    setSaving(true)
    try {
      if (initial) {
        await updateTransaction(initial.id, payload)
      } else {
        await createTransaction(payload)
      }
      onSaved()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save transaction'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{initial ? 'Edit transaction' : 'Add transaction'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="banner banner-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                required
              >
                <option value="" disabled>Choose…</option>
                {categoriesForType.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={form.transactionDate}
                onChange={(e) => update('transactionDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g. Groceries, Rent, Salary…"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
            />
          </div>

          {form.type === 'EXPENSE' && (
            <div className="checkbox-field">
              <input
                id="fixed"
                type="checkbox"
                checked={form.fixed}
                onChange={(e) => update('fixed', e.target.checked)}
              />
              <label htmlFor="fixed">Fixed expense (recurring, e.g. rent or subscriptions)</label>
            </div>
          )}

          <div className="checkbox-field">
            <input
              id="paid"
              type="checkbox"
              checked={form.paid}
              onChange={(e) => update('paid', e.target.checked)}
            />
            <label htmlFor="paid">{form.type === 'INCOME' ? 'Received' : 'Paid'}</label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
