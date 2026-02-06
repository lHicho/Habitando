import './sidebar.css'
import { useSidebar } from '../../context/sideContext'
import { useUser } from '../../context/userContext'

import { MdOutlineCancel } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'

export default function Sidebar() {

    const { isOpen, closeSidebar } = useSidebar()
    const { userInfo } = useUser()
    const navigate = useNavigate()

    const sendToInfo = () => {
        navigate('/profile')
        closeSidebar()
    }

    const sendToHome = () => {
        navigate('/')
        closeSidebar()
    }

    return (
        <>
            <div className={(isOpen) ? "sidebar on" : "sidebar off"} id="sidebar">
                <div className="header">
                    <button onClick={closeSidebar}>
                        <MdOutlineCancel />
                    </button>
                    <img src="src/assets/icon.png" alt="logo" onClick={sendToHome} />
                </div>

                {(!userInfo) ? null :
                    <div className="acount" onClick={sendToInfo}>
                        <img src="/userIcon.png" alt="User Icon" />
                        <h1>{userInfo.username}</h1>
                    </div>
                }

                <Link to="/habits">Habits</Link>

            </div>
            <div onClick={closeSidebar} id="overflowDiv" className={(isOpen) ? "overflowDiv overflowOn" : "overflowDiv overflowOff"}>
            </div>
        </>
    )
}