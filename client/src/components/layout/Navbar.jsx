import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  Bell,
  CircleUserRound,
  Menu,
  X,
  LogOut,
  User,
  Package,
  ShoppingCart,
  Wrench,
  ChevronDown,
} from 'lucide-react'
import { getCurrentUser, isAuthenticated, logoutUser } from '../../services/authServices'
import { getCartCount } from '../../utils/cartStorage'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(() => getCartCount())
  const [authState, setAuthState] = useState(() => ({
    isLoggedIn: isAuthenticated(),
    user: getCurrentUser(),
  }))

  const userMenuRef = useRef(null)

  // Sync auth and cart state whenever location changes or events fire
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

    // Immediate sync on render/route change
    syncAuthState()
    handleCartUpdate()

    // Refresh auth and cart UI on events
    window.addEventListener('auth-updated', syncAuthState)
    window.addEventListener('storage', syncAuthState)
    window.addEventListener('focus', syncAuthState)
    window.addEventListener('cart-updated', handleCartUpdate)

    return () => {
      window.removeEventListener('auth-updated', syncAuthState)
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('focus', syncAuthState)
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    await logoutUser()
    navigate('/login')
  }

  const role = (authState.user?.role || '').toLowerCase()
  const isStaffRole = role === 'admin' || role === 'receptionist'
  const hideNavItemsForRole = authState.isLoggedIn && isStaffRole
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
    { label: 'About Us', href: '/about-us' },
    { label: 'Services', href: '/services' },
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

  const userName =
    authState.user?.name ||
    authState.user?.username ||
    authState.user?.email?.split('@')[0] ||
    'User'
  const userEmail = authState.user?.email || ''
  const displayRole = authState.user?.role
    ? authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1).toLowerCase()
    : 'Customer'

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
                  className={`relative text-sm font-semibold transition-colors duration-200 ${
                    active ? 'text-[#ff2020]' : 'text-gray-800 hover:text-[#ff2020]'
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
            <div className="relative flex items-center gap-2" ref={userMenuRef}>
              <Link
                to={accountPath}
                aria-label="Notifications"
                className="rounded-full border border-[#ff2020] p-2.5 text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-white"
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* User Avatar & Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-[#ff2020] px-3 py-1.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-white"
                aria-expanded={userMenuOpen}
                aria-label="User Account Menu"
              >
                <CircleUserRound className="h-5 w-5" />
                <span className="hidden max-w-[100px] truncate md:inline">{userName}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                  {/* User Profile Header */}
                  <div className="border-b border-gray-100 pb-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff2020]/10 text-[#ff2020] font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{userName}</p>
                        {userEmail && (
                          <p className="truncate text-xs text-gray-500">{userEmail}</p>
                        )}
                        <span className="mt-0.5 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-[#ff2020]">
                          {displayRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Links */}
                  <div className="py-2 space-y-1">
                    <Link
                      to={accountPath}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff2020] transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{isStaffRole ? 'Dashboard' : 'My Profile & Dashboard'}</span>
                    </Link>

                    {!isStaffRole && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff2020] transition-colors"
                        >
                          <Package className="h-4 w-4 text-gray-500" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/cart"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff2020] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShoppingCart className="h-4 w-4 text-gray-500" />
                            <span>Cart</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="rounded-full bg-[#ff2020] px-2 py-0.5 text-xs font-bold text-white">
                              {cartCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          to="/repair"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff2020] transition-colors"
                        >
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span>Repair Services</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-[#ff2020] hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          {authState.isLoggedIn && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff2020] text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{userName}</p>
                {userEmail && <p className="truncate text-xs text-gray-500">{userEmail}</p>}
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-3">
            {!hideNavItemsForRole &&
              navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 text-base font-semibold ${
                    isActive(item.href) ? 'text-[#ff2020]' : 'text-gray-800'
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
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <Link
                  to={accountPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-semibold text-gray-800 hover:text-[#ff2020]"
                >
                  <CircleUserRound size={18} />
                  <span>{isStaffRole ? 'Dashboard' : 'My Profile & Dashboard'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 py-2 text-base font-semibold text-[#ff2020] hover:underline"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-semibold text-[#ff2020]"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar