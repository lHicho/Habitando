import './header.css'
import { useSidebar } from '../../context/sideContext'
import { useState, useEffect } from 'react'
import { useUser } from '../../context/userContext'
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/themeContext';

import { IoMenu } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

export default function Header() {
    const { userInfo } = useUser()
    const { openSideBar } = useSidebar()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [clock, setClock] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

    useEffect(() => {
        const timer = setInterval(() => {
            setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const goHome = () => {
        navigate('/')
    }

    return (
        <header>
            <div className="logo">
                <img src="/src/assets/icon.png" alt="logo" onClick={goHome} />
                <span>Habitando</span>
            </div>
            <div className="nav">
                <div className="time">
                    {userInfo && <img src={userInfo.avatar || "/userIcon.png"} alt="icon" />}
                    <p>{clock}</p>
                </div>

                <div className="side">
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'dark' ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                    </button>

                    <button className='sideBarBtn' onClick={openSideBar} >
                        <IoMenu />
                    </button>
                </div>
            </div>
        </header>
    )
}