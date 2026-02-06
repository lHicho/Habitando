import "./home.css"

import Info from "../info/info.jsx"
import Header from "../header/header.jsx"
import Sidebar from "../sidebar/sidebar.jsx"

import { useSidebar } from "../../context/sideContext.jsx"
import { useUser } from "../../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Home() {
    const { userInfo } = useUser()
    const { stay } = useSidebar()
    const navigate = useNavigate()

    var rendered = 0

    useEffect(() => {
        if (!stay) {
            navigate('/signin')
        }
        rendered++
    }, [userInfo])

    return (
        <>
            <Header />
            <Sidebar />
            <div className="bigContainer">
                <div className="infoContainer">
                    <Info tools={false} title="Habits" description="Tasks finished:" info="70%" to="/daily"/>
                    <Info tools={false} title="Finance" description="Money left:" info="200"/>
                </div>
            </div>
        </>


    )
}