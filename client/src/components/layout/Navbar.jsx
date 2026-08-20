import { Link } from 'react-router-dom'
import { useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'

export function Navbar() {
  const navItems = [
<<<<<<< HEAD
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Products', href: '#products' },
    { label: 'Services', href: '#services' },
    { label: 'Contact Us', href: '#contact-us' },
=======
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Products', href: '#products' },
    { label: 'Services', href: '/services' },
    { label: 'Contact Us', href: '/contact-us' },
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#ff2020] bg-white/95 backdrop-blur-xl">
<<<<<<< HEAD
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
=======
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
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

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar