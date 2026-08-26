import toast from 'react-hot-toast'

export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...options,
  })
}

export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    ...options,
  })
}

export const showInfoToast = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    ...options,
  })
}

export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    ...options,
  })
}

export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

export default toast
