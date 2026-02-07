import Header from "../header/header"
import SideBar from "../sidebar/sidebar"
import Info from "../info/info.jsx"
import HabitTaker from "./habitTaker"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../../context/db"

import { useSidebar } from "../../context/sideContext"
import { FiPlusCircle } from "react-icons/fi"
import { useUser } from "../../context/userContext"

export default function Habits() {
    const { openHabitTaker } = useSidebar()
    const habits = useLiveQuery(() => db.habits.toArray())
    const { edit, setEdit } = useSidebar()

    if (!habits) return <div>Loading...</div>

    return (
        <>
            <div className="bigContainer">
                <div className="infoContainer">
                    {habits.map((habit) => (
                        <Info tools={true} key={habit.id} id={habit.id} title={habit.name} description={habit.description} />
                    ))}
                </div>
            </div>
            <button className="addHabitButton" onClick={() => { openHabitTaker(); setEdit(false) }}><FiPlusCircle /></button>
            <HabitTaker edit={edit} />
        </>
    )
}