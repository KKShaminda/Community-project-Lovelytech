export const REPAIR_STATUS_META = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  ready: { label: 'Ready', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
}

export const REPAIR_ORDERS = [
  {
    id: '#LT-7829',
    customer: 'Marcus Thorne',
    device: 'MacBook Pro M2 - Logic Board',
    issue: 'Liquid damage detected. Device powers on but display is unstable.',
    status: 'pending',
    technician: 'Unassigned',
    amount: 185000,
    createdAt: '2026-07-18',
  },
  {
    id: '#LT-7821',
    customer: 'Elena Rodriguez',
    device: 'iPhone 15 Ultra - Camera Array',
    issue: 'OIS failure in primary lens. Replacement module ordered.',
    status: 'in-progress',
    technician: 'David K.',
    amount: 95000,
    createdAt: '2026-07-17',
  },
  {
    id: '#LT-7815',
    customer: 'Julian Vane',
    device: 'PS5 Pro - Thermal Management',
    issue: 'Heatsink cleaning completed. Stress test passed.',
    status: 'ready',
    technician: 'Sarah J.',
    amount: 65000,
    createdAt: '2026-07-16',
  },
]

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