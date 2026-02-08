import "./home.css"

import Info from "../info/info.jsx"
import Header from "../header/header.jsx"
import Sidebar from "../sidebar/sidebar.jsx"

import { useSidebar } from "../../context/sideContext.jsx"
import { useUser } from "../../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { db } from "../../context/db.js"
import { parseISO, isAfter, differenceInDays } from "date-fns"

export default function Home() {
    const { userInfo, activePeriod } = useUser()
    const { stay } = useSidebar()
    const navigate = useNavigate()
    const [showPeriodEndedMessage, setShowPeriodEndedMessage] = useState(false)

    useEffect(() => {
        const checkPeriodStatus = async () => {
            if (!userInfo?.id) return;

            // Check if there's a recently ended period
            const endedPeriods = await db.periods
                .where({ status: 'archived', userId: userInfo.id })
                .reverse()
                .sortBy('endDate');

            if (endedPeriods.length > 0) {
                const lastEndedPeriod = endedPeriods[0];
                const endDate = parseISO(lastEndedPeriod.endDate);
                const now = new Date();
                const daysSinceEnd = differenceInDays(now, endDate);

                // Show message if period ended within the last day and no active period
                if (daysSinceEnd <= 1 && !activePeriod) {
                    setShowPeriodEndedMessage(true);
                } else {
                    setShowPeriodEndedMessage(false);
                }
            }
        };

        checkPeriodStatus();
    }, [userInfo, activePeriod]);

    return (
        <>
            <Header />
            <Sidebar />
            <div className="bigContainer">
                {showPeriodEndedMessage && (
                    <div className="period-ended-notification">
                        <div className="notification-content">
                            <h2>🎯 Your Period Has Ended!</h2>
                            <p>Your previous tracking period has concluded. Start a new period to continue tracking your habits.</p>
                            <button
                                className="create-period-btn"
                                onClick={() => navigate('/periodeLab')}
                            >
                                Create New Period
                            </button>
                        </div>
                    </div>
                )}

                <div className="infoContainer">
                    <Info tools={false} title="Habits" description="Tasks finished:" info="70%" to="/daily" />
                    <Info tools={false} title="Finance" description="Money left:" info="200" />
                </div>
            </div>
        </>


    )
}
