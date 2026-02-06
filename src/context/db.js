import Dexie from "dexie";

export const db = new Dexie("UserPersonalDB");

db.version(1).stores({
    users: '++id, email, userData',
    habits: '++id, name, habitData',
    daily_ratings: '++id, habitId, date, periodId, ratings', // ratings: { missionName: score, ... }
    periods: '++id, status, startDate, endDate', // status: 'active', 'archived'
    archived_ratings: '++id, habitId, periodId, data', // data: snapshot of all ratings for that period
});
