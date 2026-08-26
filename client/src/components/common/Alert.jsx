import React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const VARIANTS = {
  success: {
    container: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
    iconColor: 'text-emerald-600',
    closeButton: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/60',
    defaultIcon: CheckCircle2,
  },
  error: {
    container: 'bg-[#fff0f0] border-[#ffb4b4] text-red-900',
    iconColor: 'text-[#ff2020]',
    closeButton: 'text-[#ff2020] hover:text-red-800 hover:bg-red-100/60',
    defaultIcon: AlertCircle,
  },
  warning: {
    container: 'bg-amber-50/90 border-amber-200 text-amber-900',
    iconColor: 'text-amber-600',
    closeButton: 'text-amber-600 hover:text-amber-800 hover:bg-amber-100/60',
    defaultIcon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50/90 border-blue-200 text-blue-900',
    iconColor: 'text-blue-600',
    closeButton: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/60',
    defaultIcon: Info,
  },
}

export function Alert({
  type = 'error',
  variant,
  title,
  message,
  children,
  onClose,
  className = '',
  icon: CustomIcon,
  action,
}) {
  const selectedType = variant || type || 'error'
  const config = VARIANTS[selectedType] || VARIANTS.error
  const IconComponent = CustomIcon || config.defaultIcon

  const content = children || message
  if (!content && !title) return null

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-xs transition-all duration-200 ${config.container} ${className}`}
    >
      {IconComponent && (
        <div className="shrink-0 mt-0.5">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold leading-5 mb-0.5">{title}</h4>}
        {content && <div className="leading-5 break-words">{content}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className={`shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 transition-colors duration-150 cursor-pointer ${config.closeButton}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
