import React, { useState } from "react";
import "./streakLab.css";
import { useUser } from "../../context/userContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../context/db";
import { FaPlus, FaFire } from "react-icons/fa";
import StreakTaker from "../../components/streaks/streakTaker";
import StreakItem from "../../components/streaks/streakItem";

export default function StreakLab() {
    const { userInfo } = useUser();
    const [isTakerOpen, setIsTakerOpen] = useState(false);
    const [editingStreak, setEditingStreak] = useState(null);

    const streaks = useLiveQuery(
        () => userInfo?.id ? db.streaks.where("userId").equals(userInfo.id).toArray() : [],
        [userInfo?.id]
    );

    const openTaker = (streak = null) => {
        setEditingStreak(streak);
        setIsTakerOpen(true);
    };

    const closeTaker = () => {
        setEditingStreak(null);
        setIsTakerOpen(false);
    };

    return (
        <div className="streak-lab-container">
            <div className="streak-lab-header">
                <div className="header-info">
                    <h1><FaFire className="header-icon" /> Streak Lab</h1>
                    <p>Track your daily wins and build unbreakable habits.</p>
                </div>
                <button className="add-streak-btn" onClick={() => openTaker()}>
                    <FaPlus /> Add New Streak
                </button>
            </div>

            <div className="streaks-grid">
                {streaks?.length === 0 ? (
                    <div className="empty-streaks">
                        <FaFire className="empty-icon" />
                        <h3>No streaks yet</h3>
                        <p>Start your first journey today by adding a new streak!</p>
                        <button onClick={() => openTaker()}>Get Started</button>
                    </div>
                ) : (
                    streaks?.map(streak => (
                        <StreakItem
                            key={streak.id}
                            streak={streak}
                            onEdit={() => openTaker(streak)}
                        />
                    ))
                )}
            </div>

            {isTakerOpen && (
                <StreakTaker
                    streak={editingStreak}
                    onClose={closeTaker}
                />
            )}
        </div>
    );
}
