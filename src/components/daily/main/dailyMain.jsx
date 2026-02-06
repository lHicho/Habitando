import React, { useState, useEffect } from "react";
import "./dailyMain.css"
import DailyComponent from "./dailyComponent"
import { useUser } from "../../../context/userContext"
import { db } from "../../../context/db"

export default function DailyMain() {

    const { selectedHabit, activePeriod } = useUser()
    const [missionRatings, setMissionRatings] = useState({})

    useEffect(() => {
        if (!selectedHabit || !activePeriod) {
            setMissionRatings({});
            return;
        }

        const loadRatings = async () => {
            const today = new Date().toISOString().slice(0, 10);
            // Assuming query by combo
            const allRatings = await db.daily_ratings.toArray();
            const existing = allRatings.find(r =>
                r.periodId === activePeriod.id &&
                r.habitId === selectedHabit.id &&
                r.date === today
            );

            if (existing && existing.details) {
                setMissionRatings(existing.details);
            } else {
                // Initialize with zeros as requested
                const initial = {};
                if (selectedHabit && selectedHabit.sideMissions) {
                    selectedHabit.sideMissions.forEach(m => {
                        initial[m.name] = 0;
                    });
                }
                setMissionRatings(initial);
            }
        };
        loadRatings();
    }, [selectedHabit, activePeriod]);

    const calculatedMark = React.useMemo(() => {
        if (!selectedHabit || !selectedHabit.sideMissions) return "0.0";
        let totalWeightedScore = 0;
        let totalImportance = 0;

        selectedHabit.sideMissions.forEach(m => {
            const weight = parseInt(m.importance) || 1;
            const rating = missionRatings[m.name] !== undefined ? missionRatings[m.name] : 0;
            totalWeightedScore += rating * weight;
            totalImportance += weight;
        });

        return totalImportance > 0 ? (totalWeightedScore / totalImportance).toFixed(1) : "0.0";
    }, [selectedHabit, missionRatings]);

    const handleRatingChange = (missionName, value) => {
        const val = parseFloat(value);
        if (isNaN(val)) {
            // Handle empty string to allow clearing input
            if (value === "") {
                const newRatings = { ...missionRatings };
                delete newRatings[missionName];
                setMissionRatings(newRatings);
            }
            return;
        }

        const newRatings = { ...missionRatings, [missionName]: val };
        setMissionRatings(newRatings);
    };

    const performSave = async (habit, period, ratings, showAlert = false) => {
        if (!habit || !period) return;

        let totalWeightedScore = 0;
        let totalImportance = 0;

        habit.sideMissions.forEach(m => {
            const weight = parseInt(m.importance) || 1;
            const rating = ratings[m.name] !== undefined ? ratings[m.name] : 0;
            totalWeightedScore += rating * weight;
            totalImportance += weight;
        });

        const finalMark = totalImportance > 0 ? (totalWeightedScore / totalImportance).toFixed(1) : 0;
        const today = new Date().toISOString().slice(0, 10);

        const allRatings = await db.daily_ratings.toArray();
        const existing = allRatings.find(r =>
            r.periodId === period.id &&
            r.habitId === habit.id &&
            r.date === today
        );

        if (existing) {
            await db.daily_ratings.update(existing.id, { mark: finalMark, details: ratings });
        } else {
            await db.daily_ratings.add({
                periodId: period.id,
                habitId: habit.id,
                date: today,
                mark: finalMark,
                details: ratings
            });
        }

        if (showAlert) {
            alert("Daily progress saved!");
        }
    };

    const handleSave = () => {
        performSave(selectedHabit, activePeriod, missionRatings, true);
    };

    const handleBlur = () => {
        performSave(selectedHabit, activePeriod, missionRatings, false);
    };

    const inputRefs = React.useRef([]);
    const confirmBtnRef = React.useRef(null);

    // Reset refs when habits change to avoid stale references
    useEffect(() => {
        if (selectedHabit && selectedHabit.sideMissions) {
            inputRefs.current = inputRefs.current.slice(0, selectedHabit.sideMissions.length);
        }
    }, [selectedHabit]);

    if (!selectedHabit || !selectedHabit.sideMissions || selectedHabit.sideMissions.length === 0) return (
        <div className="mainDiv">
            <p style={{ textAlign: "center", color: "#666" }}>Select a habit to track details.</p>
        </div>
    );

    const handleEnter = (e, index) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const nextIndex = index + 1;
            if (nextIndex < selectedHabit.sideMissions.length) {
                inputRefs.current[nextIndex]?.focus();
            } else {
                // Focus save button if it's the last input
                confirmBtnRef.current?.focus();
            }
        }
    };

    return (
        <div className="mainDiv">
            <div className="score-display">
                <span>Daily Score:</span>
                <span className="score-value">{calculatedMark}</span>
            </div>
            <div className="inputs-container">
                {selectedHabit.sideMissions.map((mission, index) => (
                    <DailyComponent
                        key={index}
                        inputRef={el => inputRefs.current[index] = el}
                        text={mission.name}
                        importance={mission.importance}
                        value={missionRatings[mission.name]}
                        onChange={(val) => handleRatingChange(mission.name, val)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => handleEnter(e, index)}
                    />
                ))}
            </div>
            <button
                ref={confirmBtnRef}
                className="confirm-daily-btn"
                onClick={handleSave}
            >
                Confirm Day
            </button>
        </div>
    )
}