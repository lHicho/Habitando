import Dexie from "dexie";

export const db = new Dexie("UserPersonalDB");

db.version(1).stores({
    users: '++id, email, userData',
    habits: '++id, userId, name, habitData',
    daily_ratings: '++id, userId, habitId, date, periodId, [userId+periodId], [userId+habitId], [userId+date]', // Added compound indexes
    periods: '++id, userId, status, [status+userId], startDate, endDate', // Added compound index for status+userId
    archived_ratings: '++id, userId, habitId, periodId, data',
})