import { createContext, useContext } from 'react'
import { db } from './db.js'

import React, { useState } from 'react'
// import { useLiveQuery } from "dexie-react-hooks"


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {

    const [userInfo, setUserInfo] = useState("")
    const [selectedHabit, setSelectedHabit] = useState("")
    const [activePeriod, setActivePeriod] = useState(null)

    // Check and initialize period on mount
    React.useEffect(() => {
        checkPeriodStatus();
    }, []);

    const checkPeriodStatus = async () => {
        // Find existing active period
        const currentPeriod = await db.periods.where('status').equals('active').first();
        const now = new Date();

        if (!currentPeriod) {
            // No period exists, create one
            const newPeriod = {
                status: 'active',
                startDate: now.toISOString(),
                endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days
            };
            const id = await db.periods.add(newPeriod);
            setActivePeriod({ ...newPeriod, id });
        } else {
            // Check if expired
            const endDate = new Date(currentPeriod.endDate);
            if (now > endDate) {
                await archivePeriod(currentPeriod, true);
            } else {
                setActivePeriod(currentPeriod);
            }
        }
    };

    const archivePeriod = async (period, createNew = true) => {
        // Move all logs for this period to archived_ratings
        const logs = await db.daily_ratings.where('periodId').equals(period.id).toArray();

        // Group by habitId for cleaner archiving (optional, but good for structured data)
        const habits = [...new Set(logs.map(log => log.habitId))];

        for (const habitId of habits) {
            const habitLogs = logs.filter(l => l.habitId === habitId);
            await db.archived_ratings.add({
                habitId,
                periodId: period.id,
                data: habitLogs
            });
        }

        // Mark period as archived
        await db.periods.update(period.id, { status: 'archived' });

        if (createNew) {
            // Start new period
            const now = new Date();
            const newPeriod = {
                status: 'active',
                startDate: now.toISOString(),
                endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
            };
            const id = await db.periods.add(newPeriod);
            setActivePeriod({ ...newPeriod, id });
        } else {
            setActivePeriod(null);
        }
    };

    // const [edit, setEdit] = useState(false)

    // const [habit, setHabit] = useState(null)

    const addUser = async (formData) => {
        const existingUser = await db.users.where('email').equals(formData.email).first();
        if (existingUser) {
            return 100
        } else {
            await db.users.add(formData)
            return 200
        }
    }

    const deleteUser = async (id) => {
        await db.users.delete(id)
    }

    const signIn = async (mail, pass) => {
        const user = await db.users.where('email').equals(mail).first()

        if (!user) {
            setUserInfo('')
            return 100
        } else {
            if (user.password == pass) {
                return 200
            } else {
                return 300
            }
        }
    }

    const updateInfo = async (mail) => {
        const user = await db.users.where('email').equals(mail).first()
        setUserInfo(user)
    }

    const addHabit = async (habitData) => {
        const existingHabit = await db.habits.where('name').equals(habitData.name).first();
        const dataToSend = { ...habitData }
        delete dataToSend.id
        if (existingHabit) {
            return 100
        } else {
            await db.habits.add(dataToSend)
            return 200
        }
    }

    const editTrue = () => {
        setEdit(true)
    }

    const editFalse = () => {
        setEdit(false)
    }

    const editHabit = async (habitData) => {
        const existingHabit = await db.habits.where('id').equals(habitData.id).first();
        if (existingHabit) {
            await db.habits.update(habitData.id, habitData)
            return 300
        } else {
            return 100
        }
    }

    const getInfo = async (id) => {
        const habit = await db.habits.where("id").equals(id).first()
        setSelectedHabit(habit)
    }
    const getHabits = async () => {
        return await db.habits.toArray();
    }

    const startPeriod = async (periodData) => {
        // Archive current active period if exists (though checkPeriodStatus handles this on mount, 
        // explicit start might force a reset or ensure cleanliness)
        const currentPeriod = await db.periods.where('status').equals('active').first();
        if (currentPeriod) {
            await archivePeriod(currentPeriod, false);
        }

        const newPeriod = {
            status: 'active',
            startDate: periodData.startDate,
            endDate: periodData.endDate,
            duration: periodData.duration,
            habits: periodData.sideMissions || periodData.habits || []
        };

        const id = await db.periods.add(newPeriod);
        setActivePeriod({ ...newPeriod, id });
        return 200;
    }

    return (
        <UserContext.Provider value={{ userInfo, updateInfo, addUser, deleteUser, signIn, addHabit, editHabit, getInfo, selectedHabit, activePeriod, getHabits, startPeriod }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)