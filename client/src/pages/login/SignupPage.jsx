import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../../services/authServices";
import Alert from "../../components/common/Alert";

export function SignupPage() {
	const navigate = useNavigate();
	const [fullname, setFullname] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agree, setAgree] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");

		if (!agree) {
			setMessage("You must agree to the terms to continue.");
			return;
		}

		if (password !== confirmPassword) {
			setMessage("Passwords do not match.");
			return;
		}

		// sanitize phone (keep digits only) and validate 10 digits
		const cleanedPhone = String(phone || "").replace(/\D/g, "");
		if (!/^\d{10}$/.test(cleanedPhone)) {
			setMessage("Phone number must be 10 digits (no country code).");
			return;
		}

		setLoading(true);

		try {
			const data = await signUp({
				fullname: fullname.trim(),
				email: email.trim().toLowerCase(),
				phone: cleanedPhone,
				password,
				role: "User",
			});
			setMessage(data?.message || "Account created successfully");
			navigate("/login", {
				state: {
					message: "Account created successfully! Please sign in.",
					email: email.trim().toLowerCase(),
				},
			});
		} catch (err) {
			setMessage(err.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row-reverse h-screen bg-white">
			<div className="relative w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden">
				<img src="/signup-image.jpg" alt="Sign up hero" className="w-full h-full object-cover" />
				<div className="absolute inset-0 bg-opacity-30 flex flex-col items-center justify-center p-8">
					<div className="backdrop-blur-sm rounded-4xl p-12 max-w-136 min-h-144 border border-white border-opacity-20 shadow-2xl flex flex-col justify-center">
						<div className="rounded-3xl p-1 mb-10 mx-auto w-fit">
							<img src="/Logo.png" alt="Lovely Tech" className="rounded-3xl w-65 h-30 object-contain" />
						</div>
						<h2 className="text-center text-5xl font-bold mb-5 leading-tight text-white">Welcome to Lovely Tech</h2>
						<p className="text-center text-[16px] font-sans text-black leading-relaxed">A complete solution for buying, repairing, and managing your devices with ease.</p>
					</div>
				</div>
			</div>

			<div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-20 py-12">
				<div className="w-full max-w-md">
					<h1 className="text-3xl sm:text-4xl font-bold text-[#E4342F]">Welcome to Lovely <span className="text-black">Tech</span></h1>
					<p className="mt-2 text-gray-500">Start your journey with us today</p>

					<form onSubmit={handleSubmit} className="mt-8 space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Full Name</label>
							<input value={fullname} onChange={(e) => setFullname(e.target.value)} required className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2" placeholder="Ex: John Doe" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Email</label>
							<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2" placeholder="Ex: john@gmail.com" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Phone</label>
							<input value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2" placeholder="Ex: +94 123456789" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Password</label>
							<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2" placeholder="Enter your password" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Confirm Password</label>
							<input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded-md border border-[#E4342F] px-3 py-2" placeholder="Re-enter your password" />
						</div>

						<div className="flex items-center gap-2">
							<input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 rounded" />
							<label htmlFor="agree" className="text-sm text-gray-600">I agree to the Terms of Services and Privacy Policies</label>
						</div>

						{message ? (
							<Alert
								type={message.toLowerCase().includes("success") ? "success" : "error"}
								message={message}
								onClose={() => setMessage("")}
							/>
						) : null}

						<button disabled={loading} type="submit" className="w-full rounded-lg bg-[#E4342F] py-3.5 text-[16px] font-bold text-white shadow-sm transition hover:bg-[#c92923] disabled:opacity-70">
							{loading ? "Creating account..." : "Sign up"}
						</button>

						<p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="font-medium text-[#E4342F]">Sign in here</Link></p>
					</form>
				</div>
			</div>
		</div>
	);
}

export default SignupPage;
