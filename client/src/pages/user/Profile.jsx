import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, MapPin, PencilLine, Plus, ShieldCheck, UserRound, Upload, Trash2 } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import {
	addUserAddress,
	deleteUserAddress,
	getUserAddresses,
	getUserProfile,
	isAuthenticated,
	setDefaultUserAddress,
	updateUserAddress,
	updateUserProfile,
} from '../../services/authServices'
import { useNavigate } from 'react-router-dom'

const securityRules = ['8+ characters', 'Upper case letter', 'Special character']

function Field({ label, type = 'text', value, onChange, placeholder, rightIcon, disabled = false }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-medium text-[#8f8f8f] sm:text-sm">{label}</span>
			<div className="relative">
				<input
					type={type}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
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

function AddressCard({ address, onEdit, onRemove, onSetDefault }) {
	return (
		<div className="rounded-2xl border border-[#ffb4b4] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-sm font-semibold text-slate-900">{address.street}</h3>
					<p className="mt-2 max-w-[12rem] text-xs leading-5 text-slate-500 sm:max-w-xs">
						<span className="block">{address.city}, {address.district} {address.postalCode}</span>
						<span className="block">{address.country}</span>
					</p>
				</div>

				{address.isDefault ? (
					<span className="rounded-full bg-[#ff2020] px-3 py-1 text-[10px] font-semibold text-white">
						Default
					</span>
				) : null}
			</div>

			<div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium">
				<button type="button" onClick={() => onEdit(address)} className="rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
					Edit
				</button>
				<button type="button" onClick={() => onRemove(address._id)} className="inline-flex items-center gap-1 rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
					<Trash2 className="h-3 w-3" />
					Remove
				</button>
				{!address.isDefault ? (
					<button type="button" onClick={() => onSetDefault(address._id)} className="rounded-full border border-[#ffb4b4] px-3 py-1 text-[#ff2020] transition hover:bg-[#fff0f0]">
						Set as default
					</button>
				) : null}
			</div>
		</div>
	)
}

export function Profile() {
	const navigate = useNavigate()
	const fileInputRef = useRef(null)
	const [avatarPreview, setAvatarPreview] = useState('')
	const [addresses, setAddresses] = useState([])
	const [editingProfile, setEditingProfile] = useState(false)
	const [editingAddressId, setEditingAddressId] = useState(null)
	const [showAddressForm, setShowAddressForm] = useState(false)
	const [statusMessage, setStatusMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [addressForm, setAddressForm] = useState({ street: '', city: '', district: '', postalCode: '', country: 'Sri Lanka' })
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
		if (!isAuthenticated()) {
			navigate('/login')
			return
		}

		const loadProfile = async () => {
			try {
				const [profileResponse, addressResponse] = await Promise.all([getUserProfile(), getUserAddresses()])
				const user = profileResponse.user || {}
				setFormValues((previous) => ({
					...previous,
					fullName: user.fullname || user.name || '',
					email: user.email || '',
					phone: user.phone || '',
					country: user.addresses?.find((address) => address.isDefault)?.country || '',
				}))
				setAddresses(addressResponse.addresses || user.addresses || [])
			} catch (error) {
				setErrorMessage(error.message)
			}
		}

		loadProfile()
	}, [navigate])

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

	const saveProfile = async () => {
		try {
			const response = await updateUserProfile({
				fullname: formValues.fullName,
				email: formValues.email,
				phone: formValues.phone,
			})
			const user = response.user || {}
			setFormValues((previous) => ({ ...previous, fullName: user.fullname || previous.fullName, email: user.email || previous.email, phone: user.phone || previous.phone }))
			setEditingProfile(false)
			setStatusMessage('Profile updated successfully.')
			setErrorMessage('')
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const openAddressForm = (address = null) => {
		setEditingAddressId(address?._id || null)
		setAddressForm(address ? { street: address.street, city: address.city, district: address.district, postalCode: address.postalCode || '', country: address.country || 'Sri Lanka' } : { street: '', city: '', district: '', postalCode: '', country: 'Sri Lanka' })
		setShowAddressForm(true)
	}

	const saveAddress = async () => {
		try {
			const response = editingAddressId
				? await updateUserAddress(editingAddressId, addressForm)
				: await addUserAddress(addressForm)
			setAddresses(response.addresses || [])
			setShowAddressForm(false)
			setStatusMessage(editingAddressId ? 'Address updated successfully.' : 'Address added successfully.')
			setErrorMessage('')
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const removeAddress = async (addressId) => {
		if (!window.confirm('Remove this address?')) return
		try {
			const response = await deleteUserAddress(addressId)
			setAddresses(response.addresses || [])
			setStatusMessage('Address removed successfully.')
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const setDefaultAddress = async (addressId) => {
		try {
			const response = await setDefaultUserAddress(addressId)
			setAddresses(response.addresses || [])
			setStatusMessage('Default address updated.')
		} catch (error) {
			setErrorMessage(error.message)
		}
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
				<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
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
								onClick={editingProfile ? saveProfile : () => setEditingProfile(true)}
								className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
							>
								<PencilLine className="h-4 w-4" />
								{editingProfile ? 'Save Profile' : 'Edit Profile'}
							</button>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-2">
							<Field
								label="Full Name"
								value={formValues.fullName}
								onChange={handleFieldChange('fullName')}
								disabled={!editingProfile}
								placeholder="Enter full name"
							/>
							<Field
								label="Email Address"
								type="email"
								value={formValues.email}
								onChange={handleFieldChange('email')}
								disabled={!editingProfile}
								placeholder="Enter email address"
							/>
							<Field
								label="Phone Number"
								value={formValues.phone}
								onChange={handleFieldChange('phone')}
								disabled={!editingProfile}
								placeholder="Enter phone number"
							/>
							<Field
								label="Country"
								value={formValues.country}
								onChange={handleFieldChange('country')}
								disabled={!editingProfile}
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
								onClick={() => openAddressForm()}
								className="inline-flex items-center gap-2 self-start rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
							>
								<Plus className="h-4 w-4" />
								Add New Address
							</button>
						</div>

						{showAddressForm && (
							<div className="mt-6 rounded-2xl border border-[#ffb4b4] bg-[#fffafa] p-4">
								<h3 className="text-sm font-semibold text-slate-900">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									{Object.entries(addressForm).map(([field, value]) => (
										<input key={field} value={value} placeholder={field === 'postalCode' ? 'Postal code' : field.charAt(0).toUpperCase() + field.slice(1)} onChange={(event) => setAddressForm((previous) => ({ ...previous, [field]: event.target.value }))} className="rounded-xl border border-[#ffb4b4] px-3 py-2 text-sm outline-none focus:border-[#ff2020]" />
									))}
								</div>
								<div className="mt-4 flex gap-2">
									<button type="button" onClick={saveAddress} className="rounded-xl bg-[#ff2020] px-4 py-2 text-sm font-semibold text-white">Save Address</button>
									<button type="button" onClick={() => setShowAddressForm(false)} className="rounded-xl border border-[#ffb4b4] px-4 py-2 text-sm font-semibold text-[#ff2020]">Cancel</button>
								</div>
							</div>
						)}

						{statusMessage && <p className="mt-4 text-sm font-medium text-emerald-600">{statusMessage}</p>}
						{errorMessage && <p className="mt-4 text-sm font-medium text-red-600">{errorMessage}</p>}

						<div className="mt-6 grid gap-4 lg:grid-cols-2">
							{addresses.length > 0 ? addresses.map((address) => (
								<AddressCard key={address._id} address={address} onEdit={openAddressForm} onRemove={removeAddress} onSetDefault={setDefaultAddress} />
							)) : <p className="text-sm text-slate-500">No saved addresses yet.</p>}
						</div>
					</div>
				</div>
			</section>
			</div>
		</Layout>
	)
}

export default Profile
