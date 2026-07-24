import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'

const contactItems = [
  {
    icon: MapPin,
    label: 'Thalgahawila Juction, Millewa, Horana',
  },
  {
    icon: Phone,
    label: '+94 77 029 0008',
    href: 'tel:+94770290008',
  },
  {
    icon: MessageCircle,
    label: '+94 71 029 0008',
    href: 'https://wa.me/94710290008',
  },
  {
    icon: Mail,
    label: 'lovelytech.lk@gmail.com',
    href: 'mailto:lovelytech.lk@gmail.com',
  },
  {
    icon: Facebook,
    label: 'Lovely Tech',
    href: '#',
  },
  {
    icon: Globe,
    label: 'lovelytech.lk',
    href: '#',
  },
  {
    icon: Instagram,
    label: '@lovely_tech',
    href: '#',
  },
]

function Field({ label, type = 'text', placeholder, as: Component = 'input' }) {
  const sharedClassName =
    'mt-2 w-full rounded-xl border border-black/40 bg-white px-4 py-2.5 text-sm text-black outline-none transition-shadow placeholder:text-black/35 focus:border-[#ff2020] focus:shadow-[0_0_0_3px_rgba(255,32,32,0.12)]'

  return (
    <label className="block text-sm font-medium text-black/90">
      <span>{label}</span>
      <Component
        type={type}
        placeholder={placeholder}
        className={Component === 'textarea' ? `${sharedClassName} min-h-28 resize-none` : sharedClassName}
      />
    </label>
  )
}

export function ContactUsPage() {
  return (
    <Layout>
      <main className="bg-white text-black">
        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-6xl rounded-4xl bg-[#efefef] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0">
              <div className="px-2 py-2 sm:px-8 sm:py-6 lg:pr-10">
                <form className="space-y-4">
                  <Field label="Name" placeholder="Name" />
                  <Field label="Phone Number" placeholder="Phone Number" />
                  <Field label="Email*" type="email" placeholder="Email" />
                  <Field label="Message*" placeholder="Message" as="textarea" />

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-xl bg-[#1f1f2b] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              <div className="border-t border-[#ff4d4d] px-2 py-2 sm:px-8 sm:py-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pr-2">
                <div className="max-w-xl">
                  <h1 className="text-lg font-semibold tracking-tight text-[#ff2020] sm:text-[1.05rem]">
                    Lovely Tech Contact Details
                  </h1>
                  <div className="mt-2 h-px w-full bg-black/30" />

                  <p className="mt-4 max-w-md text-sm leading-6 text-black/85">
                    Interested in working with us, for us, or just want to say hello?
                    You can visit us in person at our shop or give us a call.
                  </p>

                  <div className="mt-5 h-px w-full bg-black/30" />

                  <div className="mt-5">
                    <h2 className="text-xl font-semibold text-black">Lovely Tech</h2>

                    <ul className="mt-4 space-y-1.5 text-sm text-black">
                      {contactItems.map(({ icon: Icon, label, href }) => {
                        const content = (
                          <>
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                            <span>{label}</span>
                          </>
                        )

                        return (
                          <li key={label} className="flex items-start gap-2">
                            {href && href !== '#' ? (
                              <a href={href} className="flex items-start gap-2 transition-colors hover:text-[#ff2020]">
                                {content}
                              </a>
                            ) : (
                              <div className="flex items-start gap-2">{content}</div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default ContactUsPage