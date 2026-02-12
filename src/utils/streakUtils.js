import { db } from "../context/db";
import { parseISO, subDays, format, differenceInDays } from "date-fns";

export async function calculateStreak(streakId, userId) {
    const allLogs = await db.streak_logs
        .where("[userId+streakId]")
        .equals([userId, streakId])
        .sortBy("date");

    if (!allLogs || allLogs.length === 0) return { current: 0, highest: 0 };

    const logs = allLogs.filter(log => log.status === "success");
    if (!logs || logs.length === 0) return { current: 0, highest: 0 };

    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    // Highest Streak
    let highest = 0;
    let temp = 0;
    for (let i = 0; i < logs.length; i++) {
        if (i === 0) temp = 1;
        else {
            const prev = logs[i - 1].date;
            const curr = logs[i].date;
            const diff = differenceInDays(parseISO(curr), parseISO(prev));
            if (diff === 1) temp++;
            else temp = 1;
        }
        highest = Math.max(highest, temp);
    }

    // Current Streak
    let current = 0;
    const sortedLogs = [...logs].reverse();
    const firstLogDate = sortedLogs[0].date;

    if (firstLogDate === today || firstLogDate === yesterday) {
        current = 1;
        for (let i = 1; i < sortedLogs.length; i++) {
            const prev = sortedLogs[i - 1].date;
            const curr = sortedLogs[i].date;
            const diff = differenceInDays(parseISO(prev), parseISO(curr));
            if (diff === 1) current++;
            else break;
        }
    }

    return { current, highest };
}
