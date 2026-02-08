import "./App.css"
import { SidebarProvider } from "./context/sideContext.jsx"
import { UserProvider } from "./context/userContext.jsx"

import Home from "./components/home/home.jsx"
import SignIn from "./components/signIn/signIn.jsx"
import CreatAccount from "./components/creatAccount/creatAccount.jsx"
import Daily from "./pages/daily.jsx"
import UserInfo from "./components/userInfo/userInfo.jsx"
import Header from "./components/header/header"
import Sidebar from "./components/sidebar/sidebar"
import Habits from "./components/habits/habits.jsx"
import PeriodeLab from "./pages/periodeLab/periodeLab.jsx"
import ProgressLab from "./pages/progressLab/progressLab.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"

import { Toaster } from "react-hot-toast"

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ThemeProvider } from "./context/themeContext.jsx"

const Layout = () => {
    return (
        <div className="app-layout">
            <Header />
            <Sidebar />
            <main style={{ marginTop: '9vh', height: '91vh', overflowY: 'hidden', overflowX: 'hidden', position: 'relative' }}>
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
                element: <ProtectedRoute><Home /></ProtectedRoute>
            },
            {
                path: "/daily",
                element: <ProtectedRoute requiresPeriod={true}><Daily /></ProtectedRoute>
            },
            {
                path: "/profile",
                element: <ProtectedRoute><UserInfo /></ProtectedRoute>
            },
            {
                path: "/habitsLab",
                element: <ProtectedRoute><Habits /></ProtectedRoute>
            },
            {
                path: "/periodeLab",
                element: <ProtectedRoute><PeriodeLab /></ProtectedRoute>
            },
            {
                path: "/progressLab",
                element: <ProtectedRoute requiresPeriod={true}><ProgressLab /></ProtectedRoute>
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