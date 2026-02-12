import React, { useMemo } from "react";
import "./streakItem.css";
import { db } from "../../context/db";
import { useUser } from "../../context/userContext";
import { useLiveQuery } from "dexie-react-hooks";
import { FaFire, FaCalendarCheck, FaEllipsisV } from "react-icons/fa";
import { format, subDays, parseISO } from "date-fns";

export default function StreakItem({ streak, onEdit }) {
    const { userInfo } = useUser();
    const today = format(new Date(), "yyyy-MM-dd");

    const logs = useLiveQuery(
        () => userInfo?.id ? db.streak_logs.where("[userId+streakId]").equals([userInfo.id, streak.id]).sortBy("date") : [],
        [userInfo?.id, streak.id]
    );

    const logToday = useMemo(() => {
        return logs?.find(log => log.date === today);
    }, [logs, today]);

    const streakStats = useMemo(() => {
        const successLogs = logs?.filter(l => l.status === "success") || [];
        if (successLogs.length === 0) return { current: 0, best: 0 };

        const sortedLogs = [...successLogs].sort((a, b) => b.date.localeCompare(a.date));

        // Calculate Current Streak
        let current = 0;
        let yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

        const firstLogDate = sortedLogs[0].date;
        if (firstLogDate === today || firstLogDate === yesterday) {
            current = 1;
            for (let i = 1; i < sortedLogs.length; i++) {
                const prev = sortedLogs[i - 1].date;
                const curr = sortedLogs[i].date;
                const diff = (parseISO(prev) - parseISO(curr)) / (1000 * 60 * 60 * 24);
                if (diff === 1) current++;
                else break;
            }
        }

        // Calculate Best Streak
        let best = 0;
        let temp = 0;
        const ascLogs = [...successLogs].sort((a, b) => a.date.localeCompare(b.date));
        for (let i = 0; i < ascLogs.length; i++) {
            if (i === 0) temp = 1;
            else {
                const prev = ascLogs[i - 1].date;
                const curr = ascLogs[i].date;
                const diff = (parseISO(curr) - parseISO(prev)) / (1000 * 60 * 60 * 24);
                if (diff === 1) temp++;
                else temp = 1;
            }
            best = Math.max(best, temp);
        }

        return { current, best };
    }, [logs, today]);

    const registerAction = async (did) => {
        if (!userInfo?.id) return;

        let status = "fail";
        if (streak.type === "do") {
            status = did ? "success" : "fail";
        } else {
            status = did ? "fail" : "success";
        }

        if (logToday) {
            await db.streak_logs.update(logToday.id, { status });
        } else {
            await db.streak_logs.add({
                userId: userInfo.id,
                streakId: streak.id,
                date: today,
                status
            });
        }
    };

    const isSuccess = logToday?.status === "success";
    const isFail = logToday?.status === "fail";

    return (
        <div className={`streak-item ${isSuccess ? "done" : ""} ${isFail ? "failed" : ""}`}>
            <div className="best-streak-small">
                Best: {streakStats.best}d
            </div>
            <div className="streak-content">
                <div className="streak-main">
                    <div className="icon-box">
                        <FaFire className={isSuccess ? "fire-on" : ""} />
                    </div>
                    <div className="streak-info">
                        <h3>{streak.name}</h3>
                        <span className="type-tag">{streak.type === "do" ? "Keep Doing" : "Avoid"}</span>
                    </div>
                    <button className="edit-menu-btn" onClick={onEdit}><FaEllipsisV /></button>
                </div>

                <div className="streak-current-display">
                    <span className="count">{streakStats.current}</span>
                    <span className="label">Day Streak</span>
                </div>

                <div className="streak-actions">
                    <button
                        className={`action-btn did ${logToday && (streak.type === "do" ? isSuccess : isFail) ? "active" : ""}`}
                        onClick={() => registerAction(true)}
                    >
                        Did it
                    </button>
                    <button
                        className={`action-btn didnt ${logToday && (streak.type === "do" ? isFail : isSuccess) ? "active" : ""}`}
                        onClick={() => registerAction(false)}
                    >
                        Didn't
                    </button>
                </div>
            </div>
        </div>
    );
}
