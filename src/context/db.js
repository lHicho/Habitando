import Dexie from "dexie";

export const db = new Dexie("UserPersonalDB");

db.version(2).stores({
    users: '++id, email, userData',
    habits: '++id, userId, name, habitData',
    daily_ratings: '++id, userId, habitId, date, periodId, [userId+periodId], [userId+habitId], [userId+date]', // Added compound indexes
    periods: '++id, userId, status, [status+userId], startDate, endDate', // Added compound index for status+userId
    archived_ratings: '++id, userId, habitId, periodId, data',
}).upgrade(tx => {
    // Optional: Migration logic if needed, but since we are in dev, version bump is enough to trigger schema update.
    // Existing data will lack userId, which might be an issue if we want to migrate it.
    // Ideally we would migrate existing data to a default user or the first user found?
    // For now, let's keep it simple. Old data might become orphans or associated with undefined userId.
});
