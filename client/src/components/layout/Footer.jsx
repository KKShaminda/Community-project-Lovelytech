import { Mail, MapPin, Phone } from 'lucide-react'

const infoLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '/services' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Q & A', href: '#q-and-a' },
]

export function Footer() {
  return (
    <footer className=" bg-black text-white">
      <div className="mx-auto max-w-full pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 text-center lg:grid-cols-[1fr_1fr_1fr] lg:items-start lg:text-left">
          <div className="flex flex-col items-center px-6 lg:items-start">
            <img src="/Logo white.png" alt="Lovely Tech" className="h-40 w-40 object-contain" />
            <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">Lovely Tech</h2>
          </div>

          <div className="flex flex-col items-center lg:items-start lg:pl-16">
            <h3 className="text-2xl font-semibold">Info</h3>
            <ul className="mt-3 space-y-2 text-base text-white/85">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-[#ff2020]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <h3 className="text-2xl font-semibold">Contact</h3>
            <ul className="mt-4 space-y-3 text-base text-white/85">
              <li className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="mt-0.5 text-[#ff2020]">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>Thalgahawila Juction, Millewa, Horana</span>
              </li>
              <li className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="mt-0.5 text-[#ff2020]">
                  <Mail className="h-5 w-5" />
                </span>
                <a
                  href="mailto:lovelytech.lk@gmail.com"
                  className="transition-colors hover:text-[#ff2020]"
                >
                  lovelytech.lk@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="mt-0.5 text-[#ff2020]">
                  <Phone className="h-5 w-5" />
                </span>
                <a
                  href="tel:+94770290008"
                  className="transition-colors hover:text-[#ff2020]"
                >
                  +94 77 029 0008
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center text-sm text-white/70">
          Copyright © 2025. All Rights Reserved by LovelyTech
        </div>
      </div>
    </footer>
  )
}

export default Footer

