import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CircleUserRound, Menu, X } from 'lucide-react'
import { getCurrentUser, isAuthenticated } from '../../services/authServices'
import { getCartCount } from '../../utils/cartStorage'
import { NotificationBell } from '../common/NotificationBell'

export function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(() => getCartCount())
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

    const handleCartUpdate = () => {
      setCartCount(getCartCount())
    }

    // Refresh auth and cart UI when storage changes or focus returns.
    window.addEventListener('storage', syncAuthState)
    window.addEventListener('focus', syncAuthState)
    window.addEventListener('cart-updated', handleCartUpdate)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('focus', syncAuthState)
      window.removeEventListener('cart-updated', handleCartUpdate)
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

  // Dynamic Navigation Items based on authentication state
  const publicNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Service', href: '/services' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact Us', href: '/contact-us' },
  ]

  const loggedInNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Cart', href: '/cart' },
    { label: 'Orders', href: '/orders' },
    { label: 'Repair', href: '/repair' },
  ]

  const navItems = authState.isLoggedIn ? loggedInNavItems : publicNavItems

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#ff2020] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="Lovely Tech"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Lovely Tech
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {!hideNavItemsForRole && (
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative text-sm font-semibold transition-colors duration-200 ${active ? 'text-[#ff2020]' : 'text-gray-800 hover:text-[#ff2020]'
                    }`}
                >
                  {item.label}
                  {item.href === '/cart' && cartCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff2020] px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Action: Account & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {authState.isLoggedIn ? (
            <>
              <NotificationBell />

              <Link
                to={accountPath}
                aria-label="Account"
                className="rounded-full border border-[#ff2020] p-2.5 text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-white"
              >
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-white"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:text-black lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col space-y-3">
            {!hideNavItemsForRole &&
              navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 text-base font-semibold ${isActive(item.href) ? 'text-[#ff2020]' : 'text-gray-800'
                    }`}
                >
                  <span>{item.label}</span>
                  {item.href === '/cart' && cartCount > 0 && (
                    <span className="rounded-full bg-[#ff2020] px-2 py-0.5 text-xs text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            {authState.isLoggedIn ? (
              <Link
                to={accountPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-semibold text-gray-800"
              >
                <CircleUserRound size={18} />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-semibold text-[#ff2020]"
              >
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar