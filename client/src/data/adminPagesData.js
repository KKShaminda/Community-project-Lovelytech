export const REPAIR_STATUS_META = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  diagnosing: { label: 'Diagnosing', className: 'bg-blue-100 text-blue-700' },
  repairing: { label: 'Repairing', className: 'bg-indigo-100 text-indigo-700' },
  testing: { label: 'Testing', className: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
}

export const REPAIR_ORDERS = []

export const SALES_STATUS_META = {
  complete: { label: 'Complete', className: 'bg-green-100 text-green-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'Refunded', className: 'bg-red-100 text-red-600' },
}

export const SALES_LOGS = [
  {
    id: '#LT-7835',
    customer: 'Silas Uright',
    date: '2026-07-18',
    total: 12000,
    payment: 'Transfer',
    status: 'complete',
  },
  {
    id: '#LT-7832',
    customer: 'Fiona Gale',
    date: '2026-07-18',
    total: 5000,
    payment: 'Apple Pay',
    status: 'processing',
  },
  {
    id: '#LT-7828',
    customer: 'Liam Carter',
    date: '2026-07-18',
    total: 8500,
    payment: 'Card',
    status: 'refunded',
  },
]

export function formatLKR(value = 0) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}