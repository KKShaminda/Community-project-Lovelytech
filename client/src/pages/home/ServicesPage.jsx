import {
  Headphones,
  LaptopMinimal,
  PackageSearch,
  Smartphone,
  Wrench,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'

const services = [
  {
    icon: Smartphone,
    title: 'Mobile Phone Repairs',
    points: [
      'Diagnosis and fixing of hardware and software issues.',
      'Screen replacements, battery changes, and performance tuning.',
      'Fast repair turnaround with status tracking for customers.',
    ],
  },
  {
    icon: LaptopMinimal,
    title: 'Laptop & Computer Repairs',
    points: [
      'Hardware repairs (motherboard, keyboard, display, etc.).',
      'Software installations, virus removal, and system upgrades.',
      'Data backup and recovery solutions.',
    ],
  },
  {
    icon: PackageSearch,
    title: 'Mobile & PC Accessories Sales',
    points: [
      'High-quality accessories such as chargers, cases, cables, keyboards, and earphones.',
      'Latest mobile and computer components from trusted brands.',
      'Affordable prices with warranty and after-sales support.',
    ],
  },
  {
    icon: Smartphone,
    title: 'Reseller Support and Bulk Orders',
    points: [
      'Supplying mobile and PC accessories to local resellers at wholesale prices.',
      'Real-time stock availability and special discounts for resellers.',
      'Order tracking and fast delivery services.',
    ],
  },
  {
    icon: Wrench,
    title: 'Repair Job Management',
    points: [
      'Online repair booking and job tracking through the management system.',
      'Customers and cashiers can monitor repair progress at each stage.',
      'Automated notifications and updates.',
    ],
  },
  {
    icon: Headphones,
    title: 'After-Sales & Customer Support',
    points: [
      'Technical assistance after repair or purchase.',
      'Warranty handling and product exchange services.',
      'Friendly customer service for troubleshooting and feedback.',
    ],
  },
]

export function ServicesPage() {
  return (
    <Layout>
      <main className="bg-[#ffffff] text-black pt-6">
        <section className="border-b border-black bg-black px-4 py-2 pt-6 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-full px-4">
            <h1 className="text-sm font-semibold uppercase tracking-[0.28em] text-white sm:text-base">
              Services
            </h1>
          </div>
        </section>

        <section className="bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-full px-4">
            <p className="max-w-none text-[0.95rem] leading-7 text-black/85 sm:text-[1rem]">
              All our services are designed to meet the unique needs of every
              customer and reseller we work with. From diagnosing and repairing
              devices to sourcing genuine accessories and managing bulk reseller
              orders, we ensure quality and care in every step. Lovely Tech
              works closely with each client to provide quick, transparent
              times, clear communication, and reliable after-service support.
            </p>

            <p className="mt-4 max-w-5xl text-[0.95rem] font-semibold leading-7 text-black sm:text-[1rem]">
              With everything from repairs to reselling under one roof, we’re
              here to keep your tech running smoothly.
            </p>
          </div>
        </section>

        <section className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-full gap-4 md:grid-cols-2">
            {services.map(({ icon: Icon, title, points }) => (
              <article key={title} className="overflow-hidden bg-[#ececec]">
                <div className="flex items-center gap-3 bg-[#3d3d3d] px-4 py-3 text-white">
                  <Icon className="h-8 w-8 shrink-0 text-white" />
                  <h2 className="text-[1.03rem] font-semibold leading-tight sm:text-[1.08rem]">
                    {title}
                  </h2>
                </div>

                <div className="bg-[#ececec] px-4 py-4">
                  <ul className="space-y-2 text-sm leading-6 text-black/90 sm:text-[0.96rem]">
                    {points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default ServicesPage