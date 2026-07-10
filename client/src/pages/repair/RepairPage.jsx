import React from 'react'
import {
  ArrowRightIcon,
  ClipboardListIcon,
  HistoryIcon,
  SearchCheckIcon,
  WrenchIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'

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
    <Layout>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative isolate min-h-[520px] overflow-hidden bg-[#3E0F0F]">
          <img
            src="src/assets/repair_page_01.png"
            alt="Technician repairing electronic hardware"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
          />

          <div className="absolute inset-0 bg-[#3E0F0F]/75" />

          <div className="relative mx-auto flex min-h-[520px] max-w-[1280px] items-center px-5 py-16 sm:px-8">
            <div className="max-w-3xl">
              
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
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
                className="mt-9 inline-flex items-center gap-3 rounded-lg bg-[#EC1C24] px-7 py-4 font-bold text-white transition hover:bg-[#cf1414]"
              >
                Book a Repair
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-[1080px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-10 text-center">
            

            <h2 className="mt-3 text-3xl font-bold text-[#CF1414] sm:text-4xl">
              Our Repair Services
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {serviceCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex min-h-[225px] flex-col items-center rounded-2xl border border-zinc-100 bg-white px-6 py-8 text-center shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#555555]">
                  <Icon size={34} strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#555555]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777b93]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#3E0F0F] px-5 py-16 text-center sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <ClipboardListIcon
              size={42}
              strokeWidth={1.6}
              className="mx-auto text-[#EC1C24]"
            />

            <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EC1C24] px-6 py-3.5 font-bold text-white transition hover:bg-[#cf1414]"
              >
                Book a Repair
                <ArrowRightIcon size={18} />
              </Link>

              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 px-6 py-3.5 font-bold text-white hover:bg-white/10">
                <SearchCheckIcon size={18} />
                Track Your Repair
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 font-bold text-white hover:bg-zinc-800">
                <HistoryIcon size={18} />
                Repair History
              </button>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}