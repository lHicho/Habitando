import "./userInfo.css"
import DataDisplayer from "../dataDisplayer/dataDisplayer"
import { useUser } from '../../context/userContext'
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FiLogOut, FiCamera } from "react-icons/fi"
import { toast } from "react-hot-toast"

export default function UserInfo() {

    const { userInfo, signOut, updateAvatar } = useUser()
    const [changes, setChanges] = useState(false)
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

    const avatarSrc = userInfo?.avatar || "/userIcon.png"

    return (
        <div className="userInfo">
            <div className="proPic">
                <img src={avatarSrc} alt="Profile" />
                <button className="edit" onClick={handleAvatarClick} title="Change profile picture">
                    <FiCamera />
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                />
            </div>
            <DataDisplayer ch={changes} text="User Name" value={userInfo.username} />
            <DataDisplayer ch={changes} text="E-mail" value={userInfo.email} />
            <DataDisplayer ch={changes} text="Date of Birth" value={userInfo.date} />
            <DataDisplayer ch={changes} text="PassWord" value={userInfo.password} />
            <div className="buttons">
                {(changes) ?
                    <>
                        <button>Cancel</button>
                        <button>Save</button>
                    </> :
                    <button onClick={() => setChanges(true)}>Enable Changes</button>
                }
            </div>
            <button className="sign-out-btn" onClick={handleSignOut}>
                <FiLogOut /> Sign Out
            </button>
        </div>
    )
}