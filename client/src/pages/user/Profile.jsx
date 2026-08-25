import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eye, EyeOff, Loader2, LockKeyhole, MapPin, PencilLine, Plus, ShieldCheck, UserRound, Upload, Trash2, X } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Alert from '../../components/common/Alert'
import {
	addUserAddress,
	changePassword,
	deleteUserProfilePicture,
	deleteUserAddress,
	getUserAddresses,
	getUserProfile,
	isAuthenticated,
	setDefaultUserAddress,
	updateUserAddress,
	updateUserProfile,
	updateUserProfilePicture,
} from '../../services/authServices'
import { useNavigate } from 'react-router-dom'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '').replace(/\/api$/i, '')

const resolveProfileImageUrl = (value = '') => {
	if (!value) return ''
	if (/^https?:\/\//i.test(value)) return value
	return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}

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
					className="w-full rounded-xl border border-[#ffb4b4] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ff2020] focus:ring-2 focus:ring-[#ff2020]/10 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
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
	const profileImageMenuRef = useRef(null)
	const [avatarPreview, setAvatarPreview] = useState('')
	const [profileImageUrl, setProfileImageUrl] = useState('')
	const [isProfileImageMenuOpen, setIsProfileImageMenuOpen] = useState(false)
	const [addresses, setAddresses] = useState([])
	const [editingProfile, setEditingProfile] = useState(false)
	const [isSavingProfile, setIsSavingProfile] = useState(false)
	const [savedProfileValues, setSavedProfileValues] = useState({
		fullName: '',
		email: '',
		phone: '',
		country: '',
	})
	const [editingAddressId, setEditingAddressId] = useState(null)
	const [showAddressForm, setShowAddressForm] = useState(false)
	
	// Section-specific alerts
	const [profileStatusMessage, setProfileStatusMessage] = useState('')
	const [profileErrorMessage, setProfileErrorMessage] = useState('')
	const [passwordStatusMessage, setPasswordStatusMessage] = useState('')
	const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
	const [addressStatusMessage, setAddressStatusMessage] = useState('')
	const [addressErrorMessage, setAddressErrorMessage] = useState('')

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

	const passwordSecurityRequirements = useMemo(() => {
		const pwd = formValues.newPassword || ''
		return [
			{
				id: 'min-length',
				label: '8+ characters',
				met: pwd.length >= 8,
			},
			{
				id: 'uppercase',
				label: 'Upper case letter',
				met: /[A-Z]/.test(pwd),
			},
			{
				id: 'special-char',
				label: 'Special character',
				met: /[^A-Za-z0-9]/.test(pwd),
			},
		]
	}, [formValues.newPassword])

	useEffect(() => {
		if (!isAuthenticated()) {
			navigate('/login')
			return
		}

		const loadProfile = async () => {
			try {
				const [profileResponse, addressResponse] = await Promise.all([getUserProfile(), getUserAddresses()])
				const user = profileResponse.user || {}
				setProfileImageUrl(resolveProfileImageUrl(user.profilePicture || ''))
				const profileData = {
					fullName: user.fullname || user.name || '',
					email: user.email || '',
					phone: user.phone || '',
					country: user.addresses?.find((address) => address.isDefault)?.country || '',
				}
				setFormValues((previous) => ({
					...previous,
					...profileData,
				}))
				setSavedProfileValues(profileData)
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

	useEffect(() => {
		const closeMenuOnOutsideClick = (event) => {
			if (!profileImageMenuRef.current?.contains(event.target)) {
				setIsProfileImageMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', closeMenuOnOutsideClick)
		return () => document.removeEventListener('mousedown', closeMenuOnOutsideClick)
	}, [])

	const avatarInitial = useMemo(() => {
		return formValues.fullName?.trim()?.charAt(0)?.toUpperCase() || ''
	}, [formValues.fullName])

	const handleFieldChange = (field) => (event) => {
		setFormValues((previous) => ({
			...previous,
			[field]: event.target.value,
		}))
	}

	const handleAvatarChange = async (event) => {
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

		try {
			const response = await updateUserProfilePicture(file)
			const uploadedPath = response?.user?.profilePicture || ''
			setProfileImageUrl(resolveProfileImageUrl(uploadedPath))
			setProfileStatusMessage('Profile picture updated successfully.')
			setProfileErrorMessage('')
		} catch (error) {
			setProfileErrorMessage(error.message)
		} finally {
			event.target.value = ''
		}
	}

	const openFilePicker = () => {
		fileInputRef.current?.click()
		setIsProfileImageMenuOpen(false)
	}

	const removeProfileImage = async () => {
		if (!profileImageUrl) {
			setIsProfileImageMenuOpen(false)
			setProfileErrorMessage('No profile image to delete.')
			return
		}

		if (!window.confirm('Delete your profile image?')) {
			return
		}

		try {
			const response = await deleteUserProfilePicture()
			setProfileImageUrl(resolveProfileImageUrl(response?.user?.profilePicture || ''))
			setAvatarPreview((previous) => {
				if (previous) {
					URL.revokeObjectURL(previous)
				}
				return ''
			})
			setProfileStatusMessage('Profile picture deleted successfully.')
			setProfileErrorMessage('')
		} catch (error) {
			setProfileErrorMessage(error.message)
		} finally {
			setIsProfileImageMenuOpen(false)
		}
	}

	const handleStartEditProfile = () => {
		setSavedProfileValues({
			fullName: formValues.fullName,
			email: formValues.email,
			phone: formValues.phone,
			country: formValues.country,
		})
		setEditingProfile(true)
		setProfileStatusMessage('')
		setProfileErrorMessage('')
	}

	const handleCancelProfileEdit = () => {
		setFormValues((previous) => ({
			...previous,
			fullName: savedProfileValues.fullName,
			email: savedProfileValues.email,
			phone: savedProfileValues.phone,
			country: savedProfileValues.country,
		}))
		setEditingProfile(false)
		setProfileErrorMessage('')
	}

	const saveProfile = async () => {
		setIsSavingProfile(true)
		try {
			const response = await updateUserProfile({
				fullname: formValues.fullName,
				email: formValues.email,
				phone: formValues.phone,
			})
			const user = response.user || {}
			setProfileImageUrl(resolveProfileImageUrl(user.profilePicture || profileImageUrl))
			const updatedData = {
				fullName: user.fullname || user.name || formValues.fullName,
				email: user.email || formValues.email,
				phone: user.phone || formValues.phone,
				country: formValues.country,
			}
			setFormValues((previous) => ({
				...previous,
				...updatedData,
			}))
			setSavedProfileValues(updatedData)
			setEditingProfile(false)
			setProfileStatusMessage('Profile updated successfully.')
			setProfileErrorMessage('')
		} catch (error) {
			setProfileErrorMessage(error.message)
		} finally {
			setIsSavingProfile(false)
		}
	}

	const savePassword = async () => {
		setPasswordStatusMessage('')
		setPasswordErrorMessage('')

		if (!formValues.currentPassword || !formValues.newPassword || !formValues.confirmPassword) {
			setPasswordErrorMessage('Please fill in all password fields.')
			return
		}

		if (formValues.newPassword !== formValues.confirmPassword) {
			setPasswordErrorMessage('New passwords do not match.')
			return
		}

		if (formValues.newPassword.length < 8) {
			setPasswordErrorMessage('New password must be at least 8 characters long.')
			return
		}

		if (!/[A-Z]/.test(formValues.newPassword)) {
			setPasswordErrorMessage('New password must contain at least one uppercase letter.')
			return
		}

		if (!/[^A-Za-z0-9]/.test(formValues.newPassword)) {
			setPasswordErrorMessage('New password must contain at least one special character.')
			return
		}

		setIsUpdatingPassword(true)
		try {
			await changePassword(formValues.currentPassword, formValues.newPassword, formValues.confirmPassword)
			setFormValues((previous) => ({
				...previous,
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			}))
			setPasswordStatusMessage('Password updated successfully!')
			setPasswordErrorMessage('')
		} catch (error) {
			setPasswordErrorMessage(error.message || 'Failed to update password.')
		} finally {
			setIsUpdatingPassword(false)
		}
	}

	const openAddressForm = (address = null) => {
		setEditingAddressId(address?._id || null)
		setAddressForm(address ? { street: address.street, city: address.city, district: address.district, postalCode: address.postalCode || '', country: address.country || 'Sri Lanka' } : { street: '', city: '', district: '', postalCode: '', country: 'Sri Lanka' })
		setShowAddressForm(true)
		setAddressStatusMessage('')
		setAddressErrorMessage('')
	}

	const saveAddress = async () => {
		try {
			const response = editingAddressId
				? await updateUserAddress(editingAddressId, addressForm)
				: await addUserAddress(addressForm)
			setAddresses(response.addresses || [])
			setShowAddressForm(false)
			setAddressStatusMessage(editingAddressId ? 'Address updated successfully.' : 'Address added successfully.')
			setAddressErrorMessage('')
		} catch (error) {
			setAddressErrorMessage(error.message)
		}
	}

	const removeAddress = async (addressId) => {
		if (!window.confirm('Remove this address?')) return
		try {
			const response = await deleteUserAddress(addressId)
			setAddresses(response.addresses || [])
			setAddressStatusMessage('Address removed successfully.')
			setAddressErrorMessage('')
		} catch (error) {
			setAddressErrorMessage(error.message)
		}
	}

	const setDefaultAddress = async (addressId) => {
		try {
			const response = await setDefaultUserAddress(addressId)
			setAddresses(response.addresses || [])
			setAddressStatusMessage('Default address updated.')
			setAddressErrorMessage('')
		} catch (error) {
			setAddressErrorMessage(error.message)
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
								<div className="relative h-20 w-20 overflow-visible rounded-2xl border-2 border-[#ff2020] bg-[#fff2f2] shadow-sm">
									{avatarPreview || profileImageUrl ? (
										<img src={avatarPreview || profileImageUrl} alt="Profile preview" className="h-full w-full rounded-[14px] object-cover" />
									) : (
										<div className="flex h-full w-full rounded-[14px] items-center justify-center text-[#ff2020]">
											{avatarInitial ? (
												<span className="text-2xl font-bold">{avatarInitial}</span>
											) : (
												<UserRound className="h-9 w-9" />
											)}
										</div>
									)}

									<div ref={profileImageMenuRef} className="absolute -right-1 -bottom-1 z-30">
										<button
											type="button"
											onClick={() => setIsProfileImageMenuOpen((value) => !value)}
											className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#ff2020] text-white shadow-md transition hover:bg-[#e11b1b]"
											aria-label="Profile image actions"
										>
											<Upload className="h-3.5 w-3.5" />
										</button>

										{isProfileImageMenuOpen ? (
											<div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-[#ffb4b4] bg-white shadow-lg z-40">
												<button
													type="button"
													onClick={openFilePicker}
													className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-[#fff3f3]"
												>
													<PencilLine className="h-3.5 w-3.5 text-[#ff2020]" />
													Edit photo
												</button>
												<button
													type="button"
													onClick={removeProfileImage}
													className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-[#fff3f3]"
												>
													<Trash2 className="h-3.5 w-3.5 text-[#ff2020]" />
													Delete photo
												</button>
											</div>
										) : null}
									</div>

									<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
								</div>

								<div>
									<h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Your Profile</h2>
									<p className="mt-1 text-sm text-slate-500">
										Upload your photo and keep your account details up to date.
									</p>
								</div>
							</div>

							{!editingProfile ? (
								<button
									type="button"
									onClick={handleStartEditProfile}
									className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e11b1b]"
								>
									<PencilLine className="h-4 w-4" />
									Edit Profile
								</button>
							) : null}
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

						{profileStatusMessage && (
							<Alert
								type="success"
								message={profileStatusMessage}
								onClose={() => setProfileStatusMessage('')}
								className="mt-5"
							/>
						)}
						{profileErrorMessage && (
							<Alert
								type="error"
								message={profileErrorMessage}
								onClose={() => setProfileErrorMessage('')}
								className="mt-5"
							/>
						)}

						{editingProfile && (
							<div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#ffe4e4] pt-5">
								<button
									type="button"
									onClick={handleCancelProfileEdit}
									disabled={isSavingProfile}
									className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ffb4b4] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#fff0f0] hover:text-[#ff2020] disabled:opacity-50"
								>
									<X className="h-4 w-4" />
									Cancel
								</button>
								<button
									type="button"
									onClick={saveProfile}
									disabled={isSavingProfile}
									className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff2020] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e11b1b] disabled:opacity-50"
								>
									{isSavingProfile ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Check className="h-4 w-4" />
											Save
										</>
									)}
								</button>
							</div>
						)}
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

								{passwordStatusMessage && (
									<Alert
										type="success"
										message={passwordStatusMessage}
										onClose={() => setPasswordStatusMessage('')}
										className="mt-4"
									/>
								)}

								{passwordErrorMessage && (
									<Alert
										type="error"
										message={passwordErrorMessage}
										onClose={() => setPasswordErrorMessage('')}
										className="mt-4"
									/>
								)}

								<div className="mt-5 space-y-4">
									<Field {...passwordInputProps('currentPassword', showCurrentPassword, setShowCurrentPassword)} label="Current Password" />
									<div className="grid gap-4 md:grid-cols-2">
										<Field {...passwordInputProps('newPassword', showNewPassword, setShowNewPassword)} label="New Password" />
										<Field {...passwordInputProps('confirmPassword', showConfirmPassword, setShowConfirmPassword)} label="Confirm New Password" />
									</div>
								</div>

								<button
									type="button"
									onClick={savePassword}
									disabled={isUpdatingPassword}
									className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff2020] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e11b1b] disabled:opacity-50 cursor-pointer"
								>
									{isUpdatingPassword ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Updating Password...
										</>
									) : (
										'Update Password'
									)}
								</button>
							</div>

							<div className="rounded-3xl bg-[#fff0f0] p-5">
								<div className="flex items-center gap-2 text-[#ff2020]">
									<ShieldCheck className="h-4 w-4" />
									<h3 className="text-base font-semibold">Security Requirements</h3>
								</div>
								<ul className="mt-4 space-y-3 text-sm text-slate-600">
									{passwordSecurityRequirements.map((req) => (
										<li key={req.id} className="flex items-center gap-2.5 transition-all duration-200">
											<span
												className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-200 ${
													req.met
														? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
														: 'border-[#ff2020]/30 text-[#ff2020]'
												}`}
											>
												{req.met ? <Check className="h-3 w-3 text-white stroke-[3]" /> : '•'}
											</span>
											<span className={`transition-colors duration-200 ${req.met ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>
												{req.label}
											</span>
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

						{addressStatusMessage && (
							<Alert
								type="success"
								message={addressStatusMessage}
								onClose={() => setAddressStatusMessage('')}
								className="mt-4"
							/>
						)}

						{addressErrorMessage && (
							<Alert
								type="error"
								message={addressErrorMessage}
								onClose={() => setAddressErrorMessage('')}
								className="mt-4"
							/>
						)}

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
