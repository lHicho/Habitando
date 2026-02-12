import Dexie from "dexie";

export const db = new Dexie("UserPersonalDB");

db.version(1).stores({
    users: '++id, email, userData',
    habits: '++id, userId, name, habitData',
    daily_ratings: '++id, userId, habitId, date, periodId, [userId+periodId], [userId+habitId], [userId+date]',
    periods: '++id, userId, status, [status+userId], startDate, endDate',
    archived_ratings: '++id, userId, habitId, periodId, data',
})

db.version(5).stores({
    users: '++id, email, userData',
    habits: '++id, userId, name, habitData',
    daily_ratings: '++id, userId, habitId, date, periodId, [userId+periodId], [userId+habitId], [userId+date]',
    periods: '++id, userId, status, [status+userId], startDate, endDate',
    archived_ratings: '++id, userId, habitId, periodId, data',
    finance_settings: '++id, userId',
    daily_expenses: '++id, userId, date, [userId+date]',
    expenses: '++id, userId, date, category, amount',
    streaks: '++id, userId, name, type',
    streak_logs: '++id, userId, streakId, date, status, [userId+streakId], [userId+date]'
});