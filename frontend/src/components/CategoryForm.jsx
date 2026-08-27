import { useEffect, useState } from 'react'
import { createCategory, updateCategory } from '../api/endpoints.js'
import { apiErrorMessage } from '../api/client.js'

const PRESET_COLORS = [
  '#2f6f4f', '#b3492f', '#8b5cf6', '#06b6d4', '#eab308',
  '#ec4899', '#3b82f6', '#14b8a6', '#64748b', '#ef4444',
]

const emptyForm = { name: '', type: 'EXPENSE', monthlyBudget: '', color: PRESET_COLORS[0] }

export default function CategoryForm({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        name: initial.name,
        type: initial.type,
        monthlyBudget: initial.monthlyBudget != null ? String(initial.monthlyBudget) : '',
        color: initial.color || PRESET_COLORS[0],
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [open, initial])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      name: form.name.trim(),
      type: form.type,
      monthlyBudget: form.type === 'EXPENSE' && form.monthlyBudget !== '' ? Number(form.monthlyBudget) : null,
      color: form.color,
    }

    setSaving(true)
    try {
      if (initial) {
        await updateCategory(initial.id, payload)
      } else {
        await createCategory(payload)
      }
      onSaved()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save category'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{initial ? 'Edit category' : 'Add category'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="banner banner-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="field">
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              disabled={!!initial}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            {initial && <span className="hint">Type can't be changed after creation.</span>}
          </div>

          {form.type === 'EXPENSE' && (
            <div className="field">
              <label>Monthly budget (optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 200"
                value={form.monthlyBudget}
                onChange={(e) => setForm((f) => ({ ...f, monthlyBudget: e.target.value }))}
              />
            </div>
          )}

          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: c,
                    border: form.color === c ? '2px solid #1a2233' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                  aria-label={c}
                />
              ))}
            </div>
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
