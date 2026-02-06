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

import { Toaster } from "react-hot-toast"

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <div>404</div>
    },
    {
        path: "/signin",
        element: <SignIn />
    },
    {
        path: "/daily",
        element: <Daily />
    },
    {
        path: "/regester",
        element: <CreatAccount />
    },
    {
        path: "/resume",
        element: <Resume />
    },
    {
        path: "/profile",
        element: <UserInfo />
    }, {
        path: "/habits",
        element: <Habits />
    }, {
        path: "/periodeLab",
        element: <PeriodeLab />
    }
])

export default function App() {


    return (
        <SidebarProvider>
            <UserProvider>
                <Toaster position="top-right" />
                <RouterProvider router={router} />
            </UserProvider>
        </SidebarProvider>
    )
}