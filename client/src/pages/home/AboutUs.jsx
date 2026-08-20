import Layout from "../../components/layout/Layout";

const missionPoints = [
	"Delivering expert mobile, laptop, and computer repair services",
	"Supplying genuine parts and accessories at competitive prices",
	"Providing registered resellers with access to our available stock for resale",
	"Ensuring fast, honest, and professional customer service every day",
];

export function AboutUs() {
	return (
		<Layout>
			<div className="min-h-screen bg-white text-black pt-6">
				{/* Black header */}
				<section className="border-b border-black bg-black px-4 py-2 pt-6 pb-6 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-full px-4">
						<h1 className="text-sm font-semibold uppercase tracking-[0.28em] text-white sm:text-base">
							About Us
						</h1>
					</div>
				</section>

				{/* Full-width background, aligned inner content */}
				<div className="w-full pt-6 pb-6">
					<section className="border-b border-black/10 bg-[#f5f5f3] px-4 pb-8 pt-1 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-full px-4">
							<h2 className="inline-block border-b-2 border-[#ff2020] pb-1 text-xl font-semibold text-black sm:text-2xl">
								Our Shop,
							</h2>
							<div className="mt-3 space-y-3 text-sm leading-7 text-black/80 sm:text-[0.98rem]">
								<p>
									Lovely Tech is your all-in-one technology service center for
									mobiles, laptops, and computers.
								</p>
								<p>
									We specialize in sales, repairs, parts replacement, and
									accessories, offering a wide range of high-quality products.
									Every repair is handled with care and precision to ensure the
									best results. Our friendly and experienced team is always
									ready to help you choose the right device, fix your existing
									one, or find the perfect accessories to suit your lifestyle.
								</p>
								<p>
									At Lovely Tech, we believe in honest, quality, and long-term
									relationships with our customers. We stay up to date with the
									latest technology to provide reliable products and trusted
									after-service support. Our goal is to be your most trusted
									technology partner a place where quality, reliability, and
									customer satisfaction always come first.
								</p>
							</div>
						</div>
					</section>

					<section className="mt-4 bg-[#f7cdd0] px-4 py-5 sm:px-6 sm:py-6">
						<div className="mx-auto max-w-full px-6">
							<h2 className="inline-block border-b-2 border-black pb-1 text-xl font-semibold text-black sm:text-2xl">
								Our Mission,
							</h2>
							<div className="mt-3 space-y-3 text-sm leading-7 text-black/85 sm:text-[0.98rem]">
								<p>
									Our mission is to provide all-in-one technology solutions while
									creating opportunities for others to grow with us.
								</p>
								<div>
									<p className="font-medium text-black">We focus on:</p>
									<ul className="mt-2 space-y-2 pl-5">
										{missionPoints.map((point) => (
											<li key={point} className="list-disc">
												{point}
											</li>
										))}
									</ul>
								</div>
								<p>
									We aim to build a reliable and connected tech community by
									maintaining quality, trust, and long-term customer
									relationships.
								</p>
							</div>
						</div>
					</section>

					<section className="mt-4 border-t border-black/10 bg-[#f5f5f3] px-4 pb-4 pt-5 sm:px-6 sm:pb-4">
						<div className="mx-auto max-w-full px-6">
							<h2 className="inline-block border-b-2 border-black pb-1 text-xl font-semibold text-black sm:text-2xl">
								Our Vision,
							</h2>
							<p className="mt-3 max-w-full text-sm leading-7 text-black/80 sm:text-[0.98rem]">
								Our vision is to become the most trusted and complete technology
								center in Sri Lanka offering professional mobile, laptop, and
								computer repairs, genuine parts, quality accessories, and a smart
								reseller partnership system that supports local tech businesses.
							</p>
						</div>
					</section>
				</div>
			</div>
		</Layout>
	);
}

export default AboutUs;

