import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, MapPin, PencilLine, Plus, ShieldCheck, UserRound, Upload } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const securityRules = ['8+ characters', 'Upper case letter', 'Special character']

function Field({ label, type = 'text', value, onChange, placeholder, rightIcon }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-medium text-[#8f8f8f] sm:text-sm">{label}</span>
			<div className="relative">
				<input
					type={type}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					className="w-full rounded-xl border border-[#ffb4b4] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ff2020] focus:ring-2 focus:ring-[#ff2020]/10"
				/>
				{rightIcon ? (
					<span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
						{rightIcon}
					</span>
				) : null}
			</div>
		</label>
	)
}

function AddressCard({ title, defaultLabel }) {
	return (
		<div className="rounded-2xl border border-[#ffb4b4] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-sm font-semibold text-slate-900">{title}</h3>
					<p className="mt-2 max-w-[12rem] text-xs leading-5 text-slate-500 sm:max-w-xs">
						<span className="block">Your street address</span>
						<span className="block">City, state, postal code</span>
						<span className="block">Country</span>
					</p>
				</div>

				{defaultLabel ? (
					<span className="rounded-full bg-[#ff2020] px-3 py-1 text-[10px] font-semibold text-white">
						{defaultLabel}
					</span>
				) : null}
			</div>

			<div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium">
				<button type="button" className="rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
					Edit
				</button>
				<button type="button" className="rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
					Remove
				</button>
				{!defaultLabel ? (
					<button type="button" className="rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
						Set as default
					</button>
				) : null}
			</div>
		</div>
	)
}

export function Profile() {
	const fileInputRef = useRef(null)
	const [avatarPreview, setAvatarPreview] = useState('')
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [formValues, setFormValues] = useState({
		fullName: '',
		email: '',
		phone: '',
		country: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})

	useEffect(() => {
		return () => {
			if (avatarPreview) {
				URL.revokeObjectURL(avatarPreview)
			}
		}
	}, [avatarPreview])

	const avatarInitial = useMemo(() => {
		return formValues.fullName?.trim()?.charAt(0)?.toUpperCase() || ''
	}, [formValues.fullName])

	const handleFieldChange = (field) => (event) => {
		setFormValues((previous) => ({
			...previous,
			[field]: event.target.value,
		}))
	}

	const handleAvatarChange = (event) => {
		const file = event.target.files?.[0]

		if (!file) {
			return
		}

		const objectUrl = URL.createObjectURL(file)
		setAvatarPreview((previous) => {
			if (previous) {
				URL.revokeObjectURL(previous)
			}

			return objectUrl
		})
	}

	const openFilePicker = () => {
		fileInputRef.current?.click()
	}

	const passwordInputProps = (field, showPassword, setShowPassword) => ({
		type: showPassword ? 'text' : 'password',
		value: formValues[field],
		onChange: handleFieldChange(field),
		placeholder: 'Enter password',
		rightIcon: (
			<button
				type="button"
				onClick={() => setShowPassword((value) => !value)}
				className="pointer-events-auto text-slate-400 transition hover:text-slate-600"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</button>
		),
	})

	return (
		<Layout>
			<div className="min-h-screen bg-[#f8f8f8] text-slate-900">
			<section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
				<div className="mb-6 flex items-start gap-3">
					<div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-[#ff2020]">
						<UserRound className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold text-[#ff2020] sm:text-3xl">My Account</h1>
						<p className="mt-1 text-sm text-slate-500">
							Manage your personal information, security settings, and addresses.
						</p>
					</div>
				</div>

				<div className="space-y-4 pb-8">
					<div className="rounded-3xl border border-[#ff2020] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
							<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
								<div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-[#ff2020] bg-[#fff2f2] shadow-sm">
									{avatarPreview ? (
										<img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full w-full items-center justify-center text-[#ff2020]">
											{avatarInitial ? (
												<span className="text-2xl font-bold">{avatarInitial}</span>
											) : (
												<UserRound className="h-9 w-9" />
											)}
										</div>
									)}

									<button
										type="button"
										onClick={openFilePicker}
										className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#ff2020] text-white shadow-md transition hover:bg-[#e11b1b]"
										aria-label="Upload profile photo"
									>
										<Upload className="h-3.5 w-3.5" />
									</button>

									<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
								</div>

								<div>
									<h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Your Profile</h2>
									<p className="mt-1 text-sm text-slate-500">
										Upload your photo and keep your account details up to date.
									</p>
								</div>
							</div>

							<button
								type="button"
								className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
							>
								<PencilLine className="h-4 w-4" />
								Edit Profile
							</button>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-2">
							<Field
								label="Full Name"
								value={formValues.fullName}
								onChange={handleFieldChange('fullName')}
								placeholder="Enter full name"
							/>
							<Field
								label="Email Address"
								type="email"
								value={formValues.email}
								onChange={handleFieldChange('email')}
								placeholder="Enter email address"
							/>
							<Field
								label="Phone Number"
								value={formValues.phone}
								onChange={handleFieldChange('phone')}
								placeholder="Enter phone number"
							/>
							<Field
								label="Country"
								value={formValues.country}
								onChange={handleFieldChange('country')}
								placeholder="Enter country"
							/>
						</div>
					</div>

					<div className="rounded-3xl border border-[#ff2020] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
							<div>
								<div className="flex items-center gap-2">
									<LockKeyhole className="h-4 w-4 text-[#ff2020]" />
									<h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
								</div>
								<p className="mt-1 text-sm text-slate-500">
									Use a strong password to keep your account secure.
								</p>

								<div className="mt-5 space-y-4">
									<Field {...passwordInputProps('currentPassword', showCurrentPassword, setShowCurrentPassword)} label="Current Password" />
									<div className="grid gap-4 md:grid-cols-2">
										<Field {...passwordInputProps('newPassword', showNewPassword, setShowNewPassword)} label="New Password" />
										<Field {...passwordInputProps('confirmPassword', showConfirmPassword, setShowConfirmPassword)} label="Confirm New Password" />
									</div>
								</div>

								<button
									type="button"
									className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
								>
									Update Password
								</button>
							</div>

							<div className="rounded-3xl bg-[#fff0f0] p-5">
								<div className="flex items-center gap-2 text-[#ff2020]">
									<ShieldCheck className="h-4 w-4" />
									<h3 className="text-base font-semibold">Security Requirements</h3>
								</div>
								<ul className="mt-4 space-y-3 text-sm text-slate-600">
									{securityRules.map((rule) => (
										<li key={rule} className="flex items-center gap-2">
											<span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#ff2020]/30 text-[10px] font-bold text-[#ff2020]">
												•
											</span>
											<span>{rule}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-[#ff2020] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-[#ff2020]" />
									<h2 className="text-lg font-semibold text-slate-900">Manage Addresses</h2>
								</div>
								<p className="mt-1 text-sm text-slate-500">
									Add or update your shipping and billing details.
								</p>
							</div>

							<button
								type="button"
								className="inline-flex items-center gap-2 self-start rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
							>
								<Plus className="h-4 w-4" />
								Add New Address
							</button>
						</div>

						<div className="mt-6 grid gap-4 lg:grid-cols-2">
							<AddressCard title="Home Address" defaultLabel="Default" />
							<AddressCard title="Home Address" />
						</div>
					</div>
				</div>
			</section>
			</div>
		</Layout>
	)
}

export default Profile
