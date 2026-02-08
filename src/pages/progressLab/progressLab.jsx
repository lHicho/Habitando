import { useState, useEffect, useMemo } from "react";
import { format, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../context/db";
import IconGenerator from "../../components/iconGenerator";
import "./progressLab.css";

export default function ProgressLab() {
    const { activePeriod, userInfo } = useUser();
    const navigate = useNavigate();
    const [dailyRatings, setDailyRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Data
    useEffect(() => {
        const loadData = async () => {
            if (activePeriod?.id && userInfo?.id) {
                const ratings = await db.daily_ratings
                    .where({ periodId: activePeriod.id, userId: userInfo.id })
                    .toArray();
                setDailyRatings(ratings);
            }
            setLoading(false);
        };
        loadData();
    }, [activePeriod, userInfo]);

    // 2. Process Data
    const { dateRange, processedHabits, dailyOverall } = useMemo(() => {
        if (!activePeriod) return { dateRange: [], processedHabits: [], dailyOverall: {} };

        const start = parseISO(activePeriod.startDate);
        const end = parseISO(activePeriod.endDate);
        const dates = eachDayOfInterval({ start, end });

        // Map habits for easy access
        // activePeriod.habits contains { habitId, name, icon, importance... }
        const habits = activePeriod.habits || [];

        // Organize ratings by habitId and date
        const ratingsMap = {}; // { habitId: { dateString: ratingValue } }
        const dailyTotals = {}; // { dateString: { sum: 0, count: 0 } }

        dailyRatings.forEach(rating => {
            const dateStr = rating.date; // "YYYY-MM-DD"
            const habitId = rating.habitId;
            const val = parseFloat(rating.mark);

            if (!ratingsMap[habitId]) ratingsMap[habitId] = {};
            ratingsMap[habitId][dateStr] = val;

            if (!dailyTotals[dateStr]) dailyTotals[dateStr] = { sum: 0, count: 0, totalImportance: 0 };

            // Re-calculate weighted daily overall if needed, or just use simple average of marks
            // For now, let's process the 'mark' which is already weighted for that habit
            // We need to adhere to the requested "overall of the day" logic.
            // Assuming simple average of habit marks for the day for now, or weighted if importance is available
            // Let's use the habit's importance from activePeriod.habits to weight the overall day
            const habitInfo = habits.find(h => h.habitId === habitId);
            // Handle creating period with 'importace' vs 'importance' typo
            const importance = habitInfo ? (parseInt(habitInfo.importance || habitInfo.importace) || 1) : 1;

            dailyTotals[dateStr].sum += val * importance;
            dailyTotals[dateStr].totalImportance += importance;
        });

        const overallMap = {};
        dates.forEach(date => {
            const dateStr = format(date, "yyyy-MM-dd");
            const data = dailyTotals[dateStr];
            if (data && data.totalImportance > 0) {
                overallMap[dateStr] = (data.sum / data.totalImportance).toFixed(1);
            } else {
                overallMap[dateStr] = null;
            }
        });

        return {
            dateRange: dates,
            processedHabits: habits,
            dailyOverall: overallMap,
            ratingsMap
        };
    }, [activePeriod, dailyRatings]);

    // 3. Helper for Heatmap Color
    const getHeatmapColor = (value) => {
        if (value === null || value === undefined) return "var(--bg-card)"; // Empty/Default
        const num = parseFloat(value);
        if (isNaN(num)) return "var(--bg-card)";

        if (num < 40) return "#ef4444"; // Red
        if (num < 60) return "#f97316"; // Orange
        if (num < 75) return "#eab308"; // Yellow
        if (num < 90) return "#bef264"; // Light Green
        return "#22c55e"; // Dark Green
    };

    const getTextColor = (value) => {
        if (value === null || value === undefined) return "var(--text-secondary)";
        const num = parseFloat(value);
        if (isNaN(num)) return "var(--text-secondary)";

        // Adjust text color for contrast
        if (num < 40) return "#fff"; // Red -> White
        if (num < 60) return "#fff"; // Orange -> White
        if (num < 75) return "#000"; // Yellow -> Black
        if (num < 90) return "#000"; // Light Green -> Black
        return "#fff"; // Dark Green -> White
    }

    if (!activePeriod) {
        return (
            <div className="progressLab">
                <div className="empty-state">
                    <h2>📊 No Active Period</h2>
                    <p>You need to create a period first to track your progress.</p>
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
        <div className="progressLab">

            <div className="progress-container">
                <div className="header-text">
                    <h1>Active Period Analysis</h1>
                    <p>{format(parseISO(activePeriod.startDate), "MMM do")} - {format(parseISO(activePeriod.endDate), "MMM do")}</p>
                </div>

                <div className="table-wrapper">
                    <table className="heatmap-table">
                        <thead>
                            <tr>
                                <th className="sticky-col first-col-header">
                                    <div className="empty-corner">Habits / Days</div>
                                </th>
                                {dateRange.map((date, i) => (
                                    <th key={i} className="date-header">
                                        <div className="day-name">{format(date, "EEE")}</div>
                                        <div className="day-num">{format(date, "d")}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedHabits.map((habit) => (
                                <tr key={habit.habitId}>
                                    <td className="sticky-col habit-col">
                                        <div className="habit-cell">
                                            <IconGenerator icon={habit.icon} />
                                            <span>{habit.name}</span>
                                        </div>
                                    </td>
                                    {dateRange.map((date) => {
                                        const dateStr = format(date, "yyyy-MM-dd");
                                        // We need to look up data from ratingsMap (missing in destructuring above, adding it)
                                        // Re-running logic inside map is inefficient, so we'll grab from a lookup object
                                        // See 'ratingsMap' added to useMemo return
                                        const val = dailyRatings.find(r => r.date === dateStr && r.habitId === habit.habitId)?.mark;

                                        return (
                                            <td key={dateStr} className="data-cell">
                                                <div
                                                    className="heatmap-box"
                                                    style={{
                                                        backgroundColor: getHeatmapColor(val),
                                                        color: getTextColor(val)
                                                    }}
                                                >
                                                    {val || "-"}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="overall-row">
                                <td className="sticky-col overall-col">Overall</td>
                                {dateRange.map((date) => {
                                    const dateStr = format(date, "yyyy-MM-dd");
                                    const val = dailyOverall[dateStr];
                                    return (
                                        <td key={dateStr} className="data-cell">
                                            <div
                                                className="heatmap-box overall-box"
                                                style={{
                                                    backgroundColor: getHeatmapColor(val),
                                                    color: getTextColor(val)
                                                }}
                                            >
                                                {val || "-"}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}