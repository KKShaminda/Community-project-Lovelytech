import { useEffect, useMemo, useState } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { getAllUsers, suspendUser, unsuspendUser } from '../../services/userServices'

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatRole = (role) => {
  if (!role) return 'User'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const statStyles = [
  'text-emerald-700',
  'text-blue-700',
  'text-red-700',
  'text-neutral-700',
]

function MetricCard({ label, value, detail, accentClass }) {
  return (
    <article className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
      <p className="text-xs font-medium tracking-wide text-neutral-700">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
      <p className={`mt-2 text-sm ${accentClass}`}>{detail}</p>
    </article>
  )
}

function CustomerRow({ customer, onToggleSuspend, loadingId }) {
  return (
    <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_1fr_1fr_0.8fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
          {customer.fullname
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{customer.fullname}</p>
          <p className="text-[11px] text-neutral-500">{customer.email}</p>
        </div>
      </div>
      <span className="text-neutral-700">{customer.phone}</span>
      <span className="text-neutral-700">{formatRole(customer.role)}</span>
      <span className="text-neutral-700">{customer.addresses?.length || 0} saved</span>
      <span className="text-neutral-700">{formatDate(customer.createdAt)}</span>
      <div className="flex items-center justify-end gap-3">
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${customer.isSuspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {customer.isSuspended ? 'Suspended' : 'Active'}
        </span>
        <button
          type="button"
          disabled={loadingId === customer._id}
          onClick={() => onToggleSuspend(customer)}
          className="rounded-lg bg-[#ef2027] px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
        >
          {customer.isSuspended ? 'Unsuspend' : 'Suspend'}
        </button>
      </div>
    </div>
  )
}

export function CustomersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllUsers()
      setUsers(response?.users || [])
    } catch (err) {
      setError(err.message || 'Unable to load customers.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return users

    return users.filter((user) =>
      [user.fullname, user.email, user.phone, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
  }, [searchTerm, users])

  const stats = useMemo(() => {
    const activeCount = users.filter((user) => !user.isSuspended).length
    const suspendedCount = users.filter((user) => user.isSuspended).length
    const adminCount = users.filter((user) => user.role === 'admin').length
    const revenueImpact = users.length * 128

    return [
      { label: 'TOTAL CUSTOMERS', value: users.length.toLocaleString('en-US'), detail: '+12% from last month', accentClass: 'text-emerald-700' },
      { label: 'ACTIVE ACCOUNTS', value: activeCount.toLocaleString('en-US'), detail: `${suspendedCount} suspended`, accentClass: 'text-blue-700' },
      { label: 'ADMIN ACCOUNTS', value: adminCount.toLocaleString('en-US'), detail: 'Role filtered', accentClass: 'text-neutral-700' },
      { label: 'REV. IMPACT', value: `LKR ${Math.round(revenueImpact)}k`, detail: 'Quarterly projection', accentClass: 'text-neutral-700' },
    ]
  }, [users])

  const handleToggleSuspend = async (customer) => {
    setLoadingId(customer._id)
    setError('')

    try {
      if (customer.isSuspended) {
        await unsuspendUser(customer._id)
      } else {
        await suspendUser(customer._id)
      }
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Unable to update customer status.')
    } finally {
      setLoadingId('')
    }
  }

  return (
    <AdminShell
      activeSection="customers"
      action={
        <button type="button" onClick={loadUsers} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black">
          Refresh
        </button>
      }
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">Customers</p>
          <p className="mt-1 text-sm text-neutral-700">Customer directory, account status, and admin actions.</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-[#efefef] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="px-2 text-sm font-medium text-neutral-900">Customer Directory</h2>
          <label className="flex min-w-0 flex-1 items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 shadow-inner lg:max-w-md">
            <span className="mr-3 text-neutral-500">⌕</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer name, email, phone, role..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-300 bg-white">
          <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_1fr_1fr_0.8fr] bg-[#d8d8d8] px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500">
            <span>Name & Contact</span>
            <span>Phone</span>
            <span>Role</span>
            <span>Saved Addresses</span>
            <span>Joined</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-neutral-600">Loading customers...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((customer) => (
              <CustomerRow
                key={customer._id}
                customer={customer}
                onToggleSuspend={handleToggleSuspend}
                loadingId={loadingId}
              />
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-neutral-600">No customers match the current search.</div>
          )}

          <div className="flex items-center justify-between border-t border-neutral-200 bg-[#efefef] px-6 py-3 text-sm text-neutral-800">
            <p>Showing 1-{Math.min(filteredUsers.length || 1, filteredUsers.length || 1)} of {users.length} customers</p>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white">◀</button>
              <button type="button" className="rounded-md bg-[#ef2027] px-3 py-1 text-[11px] font-semibold text-white">1</button>
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white">▶</button>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}

export default CustomersPage