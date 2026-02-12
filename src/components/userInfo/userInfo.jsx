import "./userInfo.css"
import { useUser } from '../../context/userContext'
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiLogOut, FiCamera, FiEdit2, FiCheck, FiX, FiLock, FiEye, FiEyeOff, FiUser, FiMail, FiCalendar } from "react-icons/fi"
import { toast } from "react-hot-toast"

export default function UserInfo() {
    const { userInfo, signOut, updateAvatar, updateUserProfile } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [showVerifyModal, setShowVerifyModal] = useState(false)
    const [verifyPassword, setVerifyPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    // Form States
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        date: "",
        password: ""
    })

    useEffect(() => {
        if (userInfo) {
            setFormData({
                username: userInfo.username || "",
                email: userInfo.email || "",
                date: userInfo.date || "",
                password: userInfo.password || ""
            })
        }
    }, [userInfo])

    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const handleSignOut = () => {
        signOut()
        navigate('/signin')
    }

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Please choose an image smaller than 2MB.")
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const dataUrl = reader.result
            const res = await updateAvatar(dataUrl)
            if (res === 200) {
                toast.success("Profile picture updated.")
            } else {
                toast.error("Failed to save profile picture.")
            }
        }
        reader.readAsDataURL(file)
    }

    const handleEnableChanges = () => {
        setShowVerifyModal(true)
    }

    const handleVerifySubmit = (e) => {
        e.preventDefault()
        if (verifyPassword === userInfo.password) {
            setIsEditing(true)
            setShowVerifyModal(false)
            setVerifyPassword("")
            toast.success("Identity verified. You can now edit your profile.")
        } else {
            toast.error("Incorrect password.")
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData({
            username: userInfo.username,
            email: userInfo.email,
            date: userInfo.date,
            password: userInfo.password
        })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        const res = await updateUserProfile(formData)
        if (res === 200) {
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } else {
            toast.error("Failed to update profile.")
        }
    }

    const avatarSrc = userInfo?.avatar || "/userIcon.png"

    return (
        <div className="profile-wrapper">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="avatar-container" onClick={handleAvatarClick}>
                            <img src={avatarSrc} alt="Profile" />
                            <div className="avatar-overlay">
                                <FiCamera />
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="header-text">
                        <h2>{userInfo?.username || "Guest User"}</h2>
                        <p>{userInfo?.email}</p>
                    </div>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="field-group">
                        <label><FiUser /> Username</label>
                        <input
                            type="text"
                            disabled={!isEditing}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="field-group">
                        <label><FiMail /> Email</label>
                        <input
                            type="email"
                            disabled={!isEditing}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="field-group">
                        <label><FiCalendar /> Date of Birth</label>
                        <input
                            type="date"
                            disabled={!isEditing}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="field-group password-field">
                        <label><FiLock /> Password</label>
                        <div className="input-with-action">
                            <input
                                type={showPassword ? "text" : "password"}
                                disabled={!isEditing}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="toggle-pass"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {!isEditing ? (
                            <button type="button" className="edit-mode-btn" onClick={handleEnableChanges}>
                                <FiEdit2 /> Edit Profile
                            </button>
                        ) : (
                            <div className="edit-controls">
                                <button type="button" className="cancel-btn" onClick={handleCancel}>
                                    <FiX /> Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    <FiCheck /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </form>

                <div className="danger-zone">
                    <button className="sign-out-btn" onClick={handleSignOut}>
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </div>

            {showVerifyModal && (
                <div className="verify-overlay" onClick={() => setShowVerifyModal(false)}>
                    <div className="verify-modal" onClick={e => e.stopPropagation()}>
                        <h3>Verify Password</h3>
                        <p>Please enter your current password to enable editing.</p>
                        <form onSubmit={handleVerifySubmit}>
                            <input
                                type="password"
                                placeholder="Your password"
                                autoFocus
                                value={verifyPassword}
                                onChange={e => setVerifyPassword(e.target.value)}
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                                <button type="submit" className="verify-submit-btn">Verify</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}