import React, { useEffect } from 'react'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

export function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'warning'
  isLoading = false,
  onConfirm,
  onCancel,
  icon: CustomIcon,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel?.()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  const confirmBtnStyles =
    confirmVariant === 'danger'
      ? 'bg-[#ff2020] hover:bg-[#e11b1b] text-white shadow-sm shadow-red-200 focus:ring-[#ff2020]/20'
      : confirmVariant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500/20'
      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-500/20'

  const iconBgStyles =
    confirmVariant === 'danger'
      ? 'bg-red-50 text-[#ff2020] border-red-100'
      : confirmVariant === 'warning'
      ? 'bg-amber-50 text-amber-600 border-amber-100'
      : 'bg-slate-50 text-slate-700 border-slate-100'

  const DefaultIcon = confirmVariant === 'danger' ? Trash2 : AlertTriangle
  const IconComponent = CustomIcon || DefaultIcon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
        onClick={() => {
          if (!isLoading) onCancel?.()
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-7 text-left shadow-2xl transition-all duration-200 border border-slate-100 animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconBgStyles}`}>
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 leading-6">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-4 ${confirmBtnStyles}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
