import "./dailyHead.css"

import { useUser } from "../../../context/userContext"
import IconGenerator from "../../iconGenerator"

export default function DailyHead() {

    const { selectedHabit } = useUser()

    return (
        <div className="head">
            <div className="info">
                {selectedHabit ?
                    <>
                        <IconGenerator icon={selectedHabit.icon} />
                        <div className="textDiv">
                            <h1>{selectedHabit.name}</h1>
                            <p>{selectedHabit.description}</p>
                        </div>
                    </>
                    : null}
            </div>
            <div className="date">
                {new Date().toLocaleDateString()}
            </div>
        </div>
    )
}