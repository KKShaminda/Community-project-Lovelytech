import React from 'react'
import {
  ArrowRightIcon,
  ClipboardListIcon,
  HistoryIcon,
  SearchCheckIcon,
  WrenchIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
const serviceCards = [
  {
    title: 'Fast Repair',
    description: 'Come to our service place and get faster service.',
    icon: WrenchIcon,
  },
  {
    title: 'Track Repair Status',
    description: 'Check the current status of your repair request.',
    icon: SearchCheckIcon,
  },
  {
    title: 'Repair History',
    description: 'View your past repair requests and their details.',
    icon: HistoryIcon,
  },
]
export function RepairPage() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[520px] overflow-hidden bg-[#3E0F0F]">
          <img
            src="https://cdn.magicpatterns.com/patterns/figma-images/U4N7ly1FRcMpmHoHpvgODx/663-2109.png"
            alt="Technician repairing electronic hardware"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-[#3E0F0F]/75" />
          <div className="relative mx-auto flex min-h-[520px] max-w-[1280px] items-center px-5 py-16 sm:px-8">
            <div className="max-w-3xl">
              <p className="mb-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-red-200">
                Lovely Tech service centre
              </p>
              <h1 className="font-display text-4xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                Computer &amp; Mobile{' '}
                <span className="text-[#EC1C24]">Repair Services</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-red-100 sm:text-lg">
                Trusted repairs for the tech that keeps your day moving. Get
                clear updates, quality parts, and expert care from diagnosis to
                collection.
              </p>
              <Link
                to="/repair/book"
                className="mt-9 inline-flex items-center gap-3 rounded-[10px] bg-[#EC1C24] px-7 py-4 font-display font-bold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#cf1414]"
              >
                Book a Repair <ArrowRightIcon size={19} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-9 text-center">
            <p className="font-display text-sm font-bold uppercase tracking-[0.17em] text-[#EC1C24]">
              Simple, transparent care
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[#CF1414] sm:text-4xl">
              Our Repair Services
            </h2>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {serviceCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex min-h-[225px] flex-col items-center rounded-[21px] border border-zinc-100 bg-white px-6 py-8 text-center shadow-[2px_4px_18px_-12px_rgba(0,0,0,0.45)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#555555]">
                  <Icon size={34} strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#555555]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-5 text-[#777b93]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="track"
          className="bg-[#3E0F0F] px-5 py-16 text-center sm:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-2xl">
            <ClipboardListIcon
              className="mx-auto text-[#EC1C24]"
              size={42}
              strokeWidth={1.6}
            />
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Get Your Mobile Device
              <br />
              <span className="text-[#CF1414]">Repaired Today!</span>
            </h2>
            <p className="mt-6 text-base leading-7 text-zinc-200 sm:text-lg">
              We use only high-quality parts and repair everything from screens
              and batteries to complex motherboard issues. Same-day repairs are
              available for most common problems.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/repair/book"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EC1C24] px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-[#cf1414]"
              >
                Book a Repair <ArrowRightIcon size={18} />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-white/10">
                Track Your Repair <SearchCheckIcon size={18} />
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-zinc-800">
                Repair History <HistoryIcon size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
