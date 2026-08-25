import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'

import { AdminShell } from '../../components/admin/AdminShell'
import Alert from '../../components/common/Alert'
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
    <tr className="hover:bg-neutral-50 transition-colors border-b border-neutral-200 last:border-b-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
            {customer.fullname
              ? customer.fullname
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()
              : "U"}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 leading-tight">{customer.fullname}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">{customer.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-neutral-700">{customer.phone || 'N/A'}</td>
      <td className="px-6 py-4 text-neutral-700 font-medium">{formatRole(customer.role)}</td>
      <td className="px-6 py-4 text-neutral-700">{customer.addresses?.length || 0} saved</td>
      <td className="px-6 py-4 text-neutral-700">{formatDate(customer.createdAt)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-4">
          {customer.isSuspended ? (
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700" title="Suspended">
              <X size={14} strokeWidth={3} />
            </span>
          ) : (
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" title="Active">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
          <button
            type="button"
            disabled={loadingId === customer._id}
            onClick={() => onToggleSuspend(customer)}
            className={`w-24 rounded-lg py-2 text-[11px] font-semibold text-white cursor-pointer transition text-center disabled:opacity-60 disabled:cursor-not-allowed ${
              customer.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#ef2027] hover:bg-[#ef2027]/90'
            }`}
          >
            {customer.isSuspended ? 'Unsuspend' : 'Suspend'}
          </button>
        </div>
      </td>
    </tr>
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
        toast.success(`Account unsuspended for ${customer.fullname || 'customer'}.`)
      } else {
        await suspendUser(customer._id)
        toast.success(`Account suspended for ${customer.fullname || 'customer'}.`)
      }
      await loadUsers()
    } catch (err) {
      const errText = err.message || 'Unable to update customer status.'
      setError(errText)
      toast.error(errText)
    } finally {
      setLoadingId('')
    }
  }

  return (
    <AdminShell
      activeSection="customers"
      action={
        <button type="button" onClick={loadUsers} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black cursor-pointer">
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
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mt-4"
          />
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-300 bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#d8d8d8] text-[11px] font-bold uppercase tracking-wide text-red-500 border-b border-neutral-200">
                <th className="px-6 py-3">Name & Contact</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Saved Addresses</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-neutral-600">Loading customers...</td>
                </tr>
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
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-neutral-600">No customers match the current search.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-neutral-200 bg-[#efefef] px-6 py-3 text-sm text-neutral-800">
            <p>Showing 1-{Math.min(filteredUsers.length || 1, filteredUsers.length || 1)} of {users.length} customers</p>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">◀</button>
              <button type="button" className="rounded-md bg-[#ef2027] px-3 py-1 text-[11px] font-semibold text-white cursor-pointer">1</button>
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">▶</button>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}

export default CustomersPage