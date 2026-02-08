import "./home.css"

import Info from "../info/info.jsx"
import Header from "../header/header.jsx"
import Sidebar from "../sidebar/sidebar.jsx"

import { useSidebar } from "../../context/sideContext.jsx"
import { useUser } from "../../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { db } from "../../context/db.js"
import { parseISO, differenceInDays } from "date-fns"
import { useLiveQuery } from "dexie-react-hooks"

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

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRatings = useLiveQuery(
        () =>
            userInfo?.id && activePeriod?.id
                ? db.daily_ratings
                      .where({ userId: userInfo.id, periodId: activePeriod.id, date: todayStr })
                      .toArray()
                : [],
        [userInfo?.id, activePeriod?.id, todayStr]
    );

    const todaysRanking = useMemo(() => {
        if (!todayRatings || !activePeriod?.habits || todayRatings.length === 0) return 0;
        const habits = activePeriod.habits || [];
        let sum = 0;
        let totalImportance = 0;
        todayRatings.forEach((r) => {
            const habitInfo = habits.find((h) => (h.habitId || h.id) === r.habitId);
            const importance = habitInfo ? (parseInt(habitInfo.importance || habitInfo.importace) || 1) : 1;
            sum += parseFloat(r.mark || 0) * importance;
            totalImportance += importance;
        });
        if (totalImportance <= 0) return 0;
        return (sum / totalImportance).toFixed(1);
    }, [todayRatings, activePeriod?.habits]);

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
                    <Info tools={false} title="Habits" description="Today's ranking:" info={String(todaysRanking)} to="/daily" />
                    <Info tools={false} title="Finance" description="Money left:" info="200" />
                </div>
            </div>
        </>


    )
}
