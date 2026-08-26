import { Link } from "react-router-dom";
import {
  Headphones,
  LaptopMinimal,
  PackageSearch,
  ShoppingBag,
  Smartphone,
  Wrench,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import homeImage from "../../assets/hero.png";
import homePlaceholderImage from "../../assets/Home 2.png";
import appleLogo from "../../assets/apple.svg";
import huaweiLogo from "../../assets/huawei.svg";
import lgLogo from "../../assets/lg.svg";
import miLogo from "../../assets/mi.svg";
import samsungLogo from "../../assets/samsung.svg";
import sonyLogo from "../../assets/sony.svg";
import vivoLogo from "../../assets/vivo.svg";

const brandLogos = [
  { name: "Apple", src: appleLogo },
  { name: "Samsung", src: samsungLogo },
  { name: "LG", src: lgLogo },
  { name: "Sony", src: sonyLogo },
  { name: "Mi", src: miLogo },
  { name: "Vivo", src: vivoLogo },
  { name: "Huawei", src: huaweiLogo },
];

const services = [
  { icon: Smartphone, title: "Mobile Phone Repairs" },
  { icon: LaptopMinimal, title: "Laptop & Computer Repairs" },
  { icon: ShoppingBag, title: "Mobile & PC Accessories Sales" },
  { icon: PackageSearch, title: "Reseller Support and Bulk Orders" },
  { icon: Wrench, title: "Repair Job Management" },
  { icon: Headphones, title: "After-Sales & Customer Support" },
];

export function HomePage() {
  return (
    <Layout>
      <main className="bg-white text-black">
        <section className="relative overflow-hidden border-b border-[#ff2020] bg-[#050707] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${homeImage})` }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,65,72,0.28),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.78)_100%)]" />

          <div className="relative mx-auto flex min-h-136 w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:min-h-164 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-[3.8rem] lg:leading-[1.05]">
                Smart Solutions for Mobile & PC Accessories and Repairs
              </h1>
            </div>

            <div className="mt-8 grid flex-1 items-center gap-8 lg:grid-cols-[40%_60%] lg:gap-16">
              <div className="flex flex-col items-center gap-5 text-center">
                <img
                  src="/Logo%20white.png"
                  alt="Lovely Tech"
                  className="w-full max-w-60 drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)] sm:max-w-45 lg:max-w-60"
                />

                <p className="max-w-md text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-[2.1rem]">
                  Be lovely. Be Techy.
                </p>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="max-w-xl text-justify ">
                  <p className="text-sm leading-7 text-white/85 sm:text-[1rem] sm:leading-8">
                    Lovely Tech is dedicated to supporting our local community
                    by providing reliable mobile and computer repair services,
                    high-quality accessories, and smooth reseller partnerships.
                    We work hard to ensure that everyone - from individual
                    customers to business resellers - receives quick,
                    transparent, and affordable tech solutions.
                  </p>

                  <Link
                    to="/about-us"
                    className="mt-7 inline-flex items-center rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-medium text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
                  >
                    Learn More &gt;&gt;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-y border-black/15 bg-white py-6">
          <div className="mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-black/20 py-5 px-10">
              {brandLogos.map(({ name, src }) => (
                <span
                  key={name}
                  className="flex min-w-22 items-center justify-center px-2"
                >
                  <img
                    src={src}
                    alt={name}
                    className="h-10 w-auto max-w-37.5 object-contain opacity-90 transition-opacity duration-200 hover:opacity-100 sm:h-12"
                  />
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="bg-white py-10 sm:py-14">
          <div className="mx-auto w-full">
            <h2 className="text-center text-xl font-semibold text-[#ff2020] sm:text-2xl">
              Lovely Tech offers the following Services
            </h2>

            <div className="mt-8 grid gap-px overflow-hidden rounded-sm bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] md:grid-cols-2 xl:grid-cols-3">
              {services.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex min-h-36 items-center gap-4 bg-[#3a3a3a] px-6 py-7 text-white"
                >
                  <Icon className="h-10 w-10 shrink-0 text-white" />
                  <h3 className="text-lg font-semibold leading-snug">
                    {title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about-us" className="bg-white pb-10 pt-2 sm:pb-14">
          <div className="mx-auto grid w-full gap-0 lg:grid-cols-2">
            <div className="relative min-h-88 overflow-hidden bg-[#120404]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${homePlaceholderImage})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,35,35,0.4),rgba(0,0,0,0.1)),radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]" />
            </div>

            <div className="bg-[#f7cdd0] px-6 py-8 sm:px-8 sm:py-10">
              <h3 className="text-2xl font-extrabold uppercase tracking-tight text-black underline decoration-[#ff2020] decoration-2 underline-offset-8">
                Join our reseller team
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-black/90 sm:text-base">
                Join our growing network of resellers and become part of a
                trusted tech community. As a Lovely Tech reseller, you&apos;ll
                enjoy special wholesale discounts, priority access to new
                products, and fast delivery on every order.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-black/90 sm:text-base">
                We support your business growth with reliable service,
                transparent pricing, and ongoing partnership opportunities.
              </p>

              <Link
                to="/signup"
                className="mt-6 inline-flex items-center rounded-full border border-black px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
              >
                Join Us
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-linear-to-b from-[#EC1C24] to-black py-20 text-white sm:py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 sm:px-6 lg:px-8">
            <h2 className="max-w-4xl text-4xl font-light tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Get started with{" "}
              <span className="font-extrabold">Lovely Tech</span> today.
            </h2>
            <Link
              to="/contact-us"
              className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
            >
              Contact us &gt;&gt;
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default HomePage;
