import { useCallback, useEffect, useState } from 'react'
import CategoryForm from '../components/CategoryForm.jsx'
import { formatMoney } from '../components/StatCard.jsx'
import { deleteCategory, fetchCategories } from '../api/endpoints.js'
import { apiErrorMessage } from '../api/client.js'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load categories')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(c) {
    setEditing(c)
    setFormOpen(true)
  }

  function handleSaved() {
    setFormOpen(false)
    load()
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete category "${c.name}"? This only works if no transactions use it.`)) return
    try {
      await deleteCategory(c.id)
      load()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete category'))
    }
  }

  const income = categories.filter((c) => c.type === 'INCOME')
  const expense = categories.filter((c) => c.type === 'EXPENSE')

  function renderGroup(title, list) {
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
        </div>
        {list.length === 0 ? (
          <div className="empty-state">No categories yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  {title === 'Expense categories' && <th>Monthly budget</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge" style={{ background: '#f2f4f7', color: '#344054' }}>
                        <span className="badge-dot" style={{ background: c.color || '#98a2b3' }} />
                        {c.name}
                      </span>
                    </td>
                    {title === 'Expense categories' && (
                      <td>{c.monthlyBudget != null ? formatMoney(c.monthlyBudget) : '—'}</td>
                    )}
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize income and expenses, and set monthly budgets.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add category</button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          {renderGroup('Expense categories', expense)}
          {renderGroup('Income categories', income)}
        </>
      )}

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        initial={editing}
      />
    </div>
  )
}
