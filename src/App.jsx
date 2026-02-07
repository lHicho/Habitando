import "./App.css"
import { SidebarProvider } from "./context/sideContext.jsx"
import { UserProvider } from "./context/userContext.jsx"

import Home from "./components/home/home.jsx"
import SignIn from "./components/signIn/signIn.jsx"
import CreatAccount from "./components/creatAccount/creatAccount.jsx"
import Daily from "./pages/daily.jsx"
import Resume from "./pages/resume.jsx"
import UserInfo from "./components/userInfo/userInfo.jsx"
import Header from "./components/header/header"
import Sidebar from "./components/sidebar/sidebar"
import Habits from "./components/habits/habits.jsx"
import PeriodeLab from "./pages/periodeLab/periodeLab.jsx"
import ProgressLab from "./pages/progressLab/progressLab.jsx"

import { Toaster } from "react-hot-toast"

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ThemeProvider } from "./context/themeContext.jsx"

const Layout = () => {
    return (
        <div className="app-layout">
            <Header />
            <Sidebar />
            <main style={{ marginTop: '9vh', height: '91vh', overflowY: 'auto' , position: 'relative'}}>
                <Outlet />
            </main>
        </div>
    )
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>404</div>,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/daily",
                element: <Daily />
            },
            {
                path: "/resume",
                element: <Resume />
            },
            {
                path: "/profile",
                element: <UserInfo />
            },
            {
                path: "/habits",
                element: <Habits />
            },
            {
                path: "/periodeLab",
                element: <PeriodeLab />
            },
            {
                path: "/progressLab",
                element: <ProgressLab />
            }
        ]
    },
    {
        path: "/signin",
        element: <SignIn />
    },
    {
        path: "/regester",
        element: <CreatAccount />
    }
])

export default function App() {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <UserProvider>
                    <Toaster position="top-right" />
                    <RouterProvider router={router} />
                </UserProvider>
            </SidebarProvider>
        </ThemeProvider>
    )
}