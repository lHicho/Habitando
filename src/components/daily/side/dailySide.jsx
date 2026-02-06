import "./dailySide.css"
import SideTask from "./sideTask.jsx"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../../../context/db"

export default function DailySide() {
    const data = useLiveQuery(async () => {
        const activePeriod = await db.periods.where('status').equals('active').first();
        if (!activePeriod) return { habits: [] };

        const today = new Date().toISOString().slice(0, 10);
        // We use compound index [periodId+date] if available, otherwise filter in memory
        // Assuming simple query for now
        const allRatings = await db.daily_ratings.toArray();
        const ratings = allRatings.filter(r => r.periodId === activePeriod.id && r.date === today);

        const ratingsMap = {};
        ratings.forEach(r => {
            ratingsMap[r.habitId] = r.mark;
        });

        return {
            habits: activePeriod.habits || [],
            ratings: ratingsMap
        };
    });

    if (!data) return <div className="dailySide">Loading...</div>;

    return (
        <div className="dailySide">
            {data.habits.map((habit) => (
                <SideTask
                    key={habit.habitId || habit.id}
                    note={data.ratings[habit.habitId || habit.id] !== undefined ? data.ratings[habit.habitId || habit.id] : "-"}
                    title={habit.name}
                    icon={habit.icon}
                    m={habit.importance || habit.importace}
                    id={habit.habitId || habit.id}
                />
            ))}
        </div>
    )
}