import "./userInfo.css"
import DataDisplayer from "../dataDisplayer/dataDisplayer"
import { useUser } from '../../context/userContext'
import { useState } from "react"

export default function UserInfo() {

    const { userInfo } = useUser()
    const [changes, setChanges] = useState(false)

    return (
        <div className="userInfo">
            <div className="proPic">
                <img src="public/userIcon.png" alt="userIcon" />
                <div className="edit">

                </div>
            </div>
            <DataDisplayer ch={changes} text="User Name" value={userInfo.username} />
            <DataDisplayer ch={changes} text="E-mail" value={userInfo.email} />
            <DataDisplayer ch={changes} text="Date of Birth" value={userInfo.date} />
            <DataDisplayer ch={changes} text="PassWord" value={userInfo.password} />
            <div className="buttons">
                {(changes) ?
                    <>
                        <button>Cancel</button>
                        <button>Save</button>
                    </> :
                    <button onClick={setChanges(true)}>Enabl Changes</button>
                }
            </div>
        </div>
    )
}