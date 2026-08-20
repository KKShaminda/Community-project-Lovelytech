import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Bell, CircleUserRound } from 'lucide-react'
import { getCurrentUser, isAuthenticated } from '../../services/authServices'

export function Navbar() {
  const [authState, setAuthState] = useState(() => ({
    isLoggedIn: isAuthenticated(),
    user: getCurrentUser(),
  }))

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState({
        isLoggedIn: isAuthenticated(),
        user: getCurrentUser(),
      })
    }

    // Refresh auth UI when storage changes in other tabs or focus returns.
    window.addEventListener('storage', syncAuthState)
    window.addEventListener('focus', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('focus', syncAuthState)
    }
  }, [])

  const role = (authState.user?.role || '').toLowerCase()
  const hideNavItemsForRole = authState.isLoggedIn && (role === 'admin' || role === 'receptionist')
  const accountPath =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'receptionist'
        ? '/receptionist/dashboard'
        : '/user/dashboard'

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Products', href: '#products' },
    { label: 'Services', href: '/services' },
    { label: 'Contact Us', href: '/contact-us' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#ff2020] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="Lovely Tech"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              Lovely Tech
            </span>
          </div>
        </Link>

        {!hideNavItemsForRole && (
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-black transition-colors duration-200 hover:text-[#ff2020]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          {authState.isLoggedIn ? (
            <>
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-full border border-[#ff2020] p-2.5 text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
              >
                <Bell className="h-5 w-5" />
              </button>

              <Link
                to={accountPath}
                aria-label="Account"
                className="rounded-full border border-[#ff2020] p-2.5 text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
              >
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar