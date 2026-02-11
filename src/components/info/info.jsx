import "./info.css"

import { MdDelete, MdModeEdit } from "react-icons/md"
import { db } from "../../context/db"
import { useUser } from "../../context/userContext"
import { useSidebar } from "../../context/sideContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Info({ title, description, info, icon, to, id, tools, className }) {
    // const { editTrue } = useUser()
    const { openHabitTaker, setEdit } = useSidebar()
    const navigate = useNavigate()

    const deleteHabitFunc = async (habitId) => {
        if (!confirm("Are you sure you want to delete the habit \"" + title + "\" ?")) return
        try {
            const habit = await db.habits.where("id").equals(habitId).first()
            if (!habit) return
            const habitCopy = { ...habit }
            await db.habits.delete(habitId)
            toast.custom(
                (t) => (
                    <div className="undo-toast">
                        <span>Habit deleted</span>
                        <button
                            onClick={() => {
                                db.habits.add(habitCopy).catch(() => toast.error("Failed to restore habit"))
                                toast.dismiss(t.id)
                            }}
                        >
                            Undo
                        </button>
                    </div>
                ),
                { duration: 5000 }
            )
        } catch (err) {
            toast.error("Failed to delete habit")
        }
    }

    const editHabitFunc = async (ID) => {
        try {
            setEdit(true);
            const habit = await db.habits.where("id").equals(ID).first();
            if (habit) openHabitTaker(habit);
            else toast.error("Habit not found");
        } catch (err) {
            toast.error("Failed to load habit");
        }
    }

    const sendTo = (to) => {
        navigate(to)
    }

    const handleCardClick = (e) => {
        // Prevent navigation if clicking tools
        if (e.target.closest('button')) return;
        if (to) sendTo(to);
    }

    return (
        <div className={`infoDivCont ${className || ""}`} onClick={handleCardClick}>
            <div className="infoDiv" >
                {tools ? <div className="inofTools">
                    <button onClick={(e) => { e.stopPropagation(); editHabitFunc(id); }}><MdModeEdit /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteHabitFunc(id); }} aria-label="Delete habit"><MdDelete /></button>
                </div> : null}
                <h1>{title}</h1>
                {(!description) ? null : <p>{description}</p>}
                {(!info) ? null : <h2>{info}</h2>}
            </div>
        </div>
    )
}
