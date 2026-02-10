import "./App.css"
import { lazy, Suspense } from "react"
import { SidebarProvider } from "./context/sideContext.jsx"
import { UserProvider } from "./context/userContext.jsx"

import Header from "./components/header/header"
import Sidebar from "./components/sidebar/sidebar"
import ProtectedRoute from "./components/ProtectedRoute.jsx"

import { Toaster } from "react-hot-toast"

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ThemeProvider } from "./context/themeContext.jsx"

const Home = lazy(() => import("./components/home/home.jsx"))
const SignIn = lazy(() => import("./components/signIn/signIn.jsx"))
const CreatAccount = lazy(() => import("./components/creatAccount/creatAccount.jsx"))
const Daily = lazy(() => import("./pages/daily.jsx"))
const UserInfo = lazy(() => import("./components/userInfo/userInfo.jsx"))
const Habits = lazy(() => import("./components/habits/habits.jsx"))
const PeriodeLab = lazy(() => import("./pages/periodeLab/periodeLab.jsx"))
const ProgressLab = lazy(() => import("./pages/progressLab/progressLab.jsx"))
const Finance = lazy(() => import("./pages/finance/finance.jsx"))

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

const PageFallback = () => <div className="page-loading">Loading...</div>

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>404</div>,
        children: [
            {
                path: "/",
                element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Home /></Suspense></ProtectedRoute>
            },
            {
                path: "/daily",
                element: <ProtectedRoute requiresPeriod={true}><Suspense fallback={<PageFallback />}><Daily /></Suspense></ProtectedRoute>
            },
            {
                path: "/profile",
                element: <ProtectedRoute><Suspense fallback={<PageFallback />}><UserInfo /></Suspense></ProtectedRoute>
            },
            {
                path: "/habitsLab",
                element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Habits /></Suspense></ProtectedRoute>
            },
            {
                path: "/periodeLab",
                element: <ProtectedRoute><Suspense fallback={<PageFallback />}><PeriodeLab /></Suspense></ProtectedRoute>
            },
            {
                path: "/progressLab",
                element: <ProtectedRoute requiresPeriod={true}><Suspense fallback={<PageFallback />}><ProgressLab /></Suspense></ProtectedRoute>
            },
            {
                path: "/finance",
                element: <ProtectedRoute><Suspense fallback={<PageFallback />}><Finance /></Suspense></ProtectedRoute>
            }
        ]
    },
    {
        path: "/signin",
        element: <Suspense fallback={<PageFallback />}><SignIn /></Suspense>
    },
    {
        path: "/regester",
        element: <Suspense fallback={<PageFallback />}><CreatAccount /></Suspense>
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