import "./sideTask.css"
import { useUser } from "../../../context/userContext.jsx"
import IconGenerator from "../../iconGenerator"

export default function SideTask({ note, title, icon, m, id }) {

    const { getInfo } = useUser()

    return (
        <div className="sideTask" id={id} onClick={() => getInfo(id)}>
            <div className="main">
                <IconGenerator icon={icon} />
                <div className="titleDiv" title={title}>
                    {title}
                </div>
                <p>{m}</p>
            </div>
            <div className="note">
                {note}
            </div>
        </div>
    )
}