import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/categories', label: 'Categories' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout({ children }) {
  const { username, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">€</span>
          <span className="label">Finance Tracker</span>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              <span className="label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="hint label">Signed in as {username}</div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 8 }} onClick={logout}>
            <span className="label">Log out</span>
          </button>
        </div>
      </aside>
      <main className="main-area">{children}</main>
    </div>
  )
}
