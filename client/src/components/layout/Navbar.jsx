import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, ShoppingCart } from 'lucide-react'
import { getCartCount } from '../../utils/cartStorage'

export function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(() => getCartCount())

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(getCartCount())
    }
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Cart', href: '/cart' },
    { label: 'Orders', href: '/orders' },
    { label: 'Repair', href: '/repair' },
  ]

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

        {/* Right Action: Account & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/user/dashboard"
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-800 transition hover:text-[#ff2020] sm:inline-flex"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700">
              <User size={16} />
            </div>
            <span>Account</span>
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-[#ff2020] px-4 py-2 text-xs font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Sign In
          </Link>

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
            {navItems.map((item) => (
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
            <Link
              to="/user/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-base font-semibold text-gray-800"
            >
              <User size={18} />
              <span>My Account</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar