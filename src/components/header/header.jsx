import './header.css'
import { useSidebar } from '../../context/sideContext'
import { useState } from 'react'
import { useUser } from '../../context/userContext'
import { useNavigate } from 'react-router-dom';

import { IoMenu } from "react-icons/io5";

export default function Header() {
    const { userInfo } = useUser()
    const { openSideBar } = useSidebar()
    const navigate = useNavigate()

    const getTime = () => {
        var now = new Date()
        var mins = (now.getMinutes() < 10) ? "0" + String(now.getMinutes()) : String(now.getMinutes())
        var hrs = (now.getHours() < 10) ? "0" + String(now.getHours()) : String(now.getHours())
        return hrs + ":" + mins
    }


    const [clock, setClock] = useState(getTime())
    setInterval(() => {
        setClock(getTime())
    }, 1000)

    const goHome = () => {
        navigate('/')
    }

    return (
        <header>
            <div className="logo">
                <img src="src/assets/icon.png" alt="logo" onClick={goHome} />
            </div>
            <div className="nav">
                <div className="time">
                    {(!userInfo)? null : <img src="public/userIcon.png" alt="icon" />}
                    <p>{clock}</p>
                </div>
                <div className="side">
                    <button className='sideBarBtn' onClick={openSideBar} >
                        <IoMenu />
                    </button>
                </div>
            </div>
        </header>
    )
}