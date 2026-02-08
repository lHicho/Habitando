import DailySide from "../components/daily/side/dailySide.jsx"
import DailyHead from "../components/daily/header/dailyHead.jsx"
import DailyMain from "../components/daily/main/dailyMain.jsx"
import { useUser } from "../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import "./daily.css"

export default function Daily() {
    const { activePeriod } = useUser();
    const navigate = useNavigate();

    if (!activePeriod) {
        return (
            <div className="daily-no-period">
                <div className="empty-state">
                    <h2>📅 No Active Period</h2>
                    <p>You need to create a period first to start tracking your daily habits.</p>
                    <button
                        className="create-period-btn"
                        onClick={() => navigate('/periodeLab')}
                    >
                        Go to Period Lab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dialy">
            <DailyHead />
            <DailySide />
            <DailyMain />
        </div>
    )
}