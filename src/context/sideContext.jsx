import { createContext, useState, useContext } from "react"


const SidebarContext = createContext(null)

export const SidebarProvider = ({ children }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [stay, setStay] = useState(false)
    const [habitTaker, setHabitTaker] = useState(false)
    const [habit, setHabit] = useState('')
    const [edit, setEdit] = useState(false)

    const openHabitTaker = (habit) => {
        if (edit) {
            setHabit(habit)
        } else {
            setHabit({
                name: '',
                importance: '',
                description: ''
            })
        }
        setHabitTaker(true)
    }

    const closeHabitTaker = () => {
        setHabitTaker(false)
    }

    const openSideBar = () => {
        setIsOpen(true)
    }

    const closeSidebar = () => {
        setIsOpen(false)
    }
    
    const stayFunc = () => {
        setStay(true)
    }

    const getOut = () => {
        setStay(false)
    }

    return (
        <SidebarContext.Provider value={{ isOpen, openSideBar, closeSidebar, stay, stayFunc, getOut, habitTaker, openHabitTaker, closeHabitTaker, habit, edit, setEdit }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
