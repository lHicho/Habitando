import './sidebar.css'
import { useSidebar } from '../../context/sideContext'
import { useUser } from '../../context/userContext'

import { MdOutlineCancel } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'

export default function Sidebar() {

    const { isOpen, closeSidebar } = useSidebar()
    const { userInfo } = useUser()
    const navigate = useNavigate()

    const goto = (path) => {
        navigate(path)
        closeSidebar()
    }

    return (
        <>
            <div className={(isOpen) ? "sidebar on" : "sidebar off"} id="sidebar">
                <div className="header">
                    <button onClick={closeSidebar}>
                        <MdOutlineCancel />
                    </button>
                    <img src="src/assets/icon.png" alt="logo" onClick={() => goto("/")} />
                </div>

                {(!userInfo) ? null :
                    <div className="acount" onClick={() => goto("/profile")}>
                        <img src={userInfo.avatar || "/userIcon.png"} alt="User Icon" />
                        <h1>{userInfo.username}</h1>
                    </div>
                }
                <ul className="linksList">
                    <p onClick={() => goto("/")}>Home</p>
                    <p onClick={() => goto("/habitsLab")}>Habits Lab</p>
                    <p onClick={() => goto("/periodeLab")}>Periode Lab</p>
                    <p onClick={() => goto("/progressLab")}>Progress Lab</p>
                    <p onClick={() => goto("/profile")}>Profile</p>
                    <p onClick={() => goto("/daily")}>Daily</p>
                </ul>
            </div>
            <div onClick={closeSidebar} id="overflowDiv" className={(isOpen) ? "overflowDiv overflowOn" : "overflowDiv overflowOff"}>
            </div>
        </>
    )
}