import "./info.css"

import { MdDelete, MdModeEdit } from "react-icons/md"
import { db } from "../../context/db"
import { useUser } from "../../context/userContext"
import { useSidebar } from "../../context/sideContext"
import { useNavigate } from "react-router-dom"

export default function Info({ title, description, info, icon, to, id, tools}) {
    // const { editTrue } = useUser()
    const { openHabitTaker, setEdit } = useSidebar()
    const navigate = useNavigate()

    const deleteHabitFunc = (id) => {
        if (confirm("Are you sure you want to delete the habit \"" + title + "\" ?")) {
            db.habits.delete(id)
        }
    }

    const editHabitFunc = async (ID) => {
        setEdit(true)
        const habit = await db.habits.where("id").equals(ID).first()
        openHabitTaker(habit)
    }

    const sendTo = (to) => {
        console.log(to)
        navigate(to)
    }

    return (
        <div className="infoDivCont" onClick={() => sendTo(to)}>
            <div className="infoDiv" >
                {tools? <div className="inofTools">
                    <button onClick={() => editHabitFunc(id)}><MdModeEdit /></button>
                    <button onClick={() => deleteHabitFunc(id)}><MdDelete /></button>
                </div> : null}
                <h1>{title}</h1>
                {(!description) ? null : <p>{description}</p>}
                {(!info) ? null : <h2>{info}</h2>}
            </div>
        </div>
    )
}
