import client from './client'

// --- Auth ---
export const login = (username, password) =>
  client.post('/auth/login', { username, password }).then((r) => r.data)

export const changePassword = (currentPassword, newPassword) =>
  client.put('/auth/password', { currentPassword, newPassword }).then((r) => r.data)

// --- Categories ---
export const fetchCategories = () => client.get('/categories').then((r) => r.data)

export const createCategory = (payload) => client.post('/categories', payload).then((r) => r.data)

export const updateCategory = (id, payload) => client.put(`/categories/${id}`, payload).then((r) => r.data)

export const deleteCategory = (id) => client.delete(`/categories/${id}`)

// --- Transactions ---
export const fetchTransactions = (year, month) =>
  client.get('/transactions', { params: { year, month } }).then((r) => r.data)

export const createTransaction = (payload) => client.post('/transactions', payload).then((r) => r.data)

export const updateTransaction = (id, payload) =>
  client.put(`/transactions/${id}`, payload).then((r) => r.data)

export const setTransactionPaid = (id, paid) =>
  client.patch(`/transactions/${id}/paid`, { paid }).then((r) => r.data)

export const deleteTransaction = (id) => client.delete(`/transactions/${id}`)

export const rolloverFixedExpenses = (fromYear, fromMonth, toYear, toMonth) =>
  client
    .post('/transactions/rollover', { fromYear, fromMonth, toYear, toMonth })
    .then((r) => r.data)

export const exportTransactionsCsv = (year, month) =>
  client
    .get('/transactions/export', { params: { year, month }, responseType: 'blob' })
    .then((r) => r.data)

export const importTransactionsCsv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client
    .post('/transactions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

// --- Dashboard ---
export const fetchMonthSummary = (year, month) =>
  client.get('/dashboard/summary', { params: { year, month } }).then((r) => r.data)

export const fetchTrend = (months, endYear, endMonth) =>
  client
    .get('/dashboard/trend', { params: { months, endYear, endMonth } })
    .then((r) => r.data)
