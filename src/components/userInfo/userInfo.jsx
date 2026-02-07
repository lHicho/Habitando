import "./userInfo.css"
import DataDisplayer from "../dataDisplayer/dataDisplayer"
import { useUser } from '../../context/userContext'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"

export default function UserInfo() {

    const { userInfo, signOut } = useUser()
    const [changes, setChanges] = useState(false)
    const navigate = useNavigate()

    const handleSignOut = () => {
        signOut()
        navigate('/signin')
    }

    return (
        <div className="userInfo">
            <div className="proPic">
                <img src="public/userIcon.png" alt="userIcon" />
                <div className="edit">

                </div>
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