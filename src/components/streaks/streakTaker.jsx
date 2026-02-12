import React, { useState, useEffect } from "react";
import "./streakTaker.css";
import { MdOutlineCancel } from "react-icons/md";
import { db } from "../../context/db";
import { useUser } from "../../context/userContext";
import { toast } from "react-hot-toast";

export default function StreakTaker({ streak, onClose }) {
    const { userInfo } = useUser();
    const [name, setName] = useState("");
    const [type, setType] = useState("do");

    useEffect(() => {
        if (streak) {
            setName(streak.name);
            setType(streak.type);
        }
    }, [streak]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Please enter a name");
        if (!userInfo?.id) return;

        try {
            if (streak) {
                await db.streaks.update(streak.id, { name: name.trim(), type });
                toast.success("Streak updated!");
            } else {
                await db.streaks.add({
                    userId: userInfo.id,
                    name: name.trim(),
                    type,
                    createdAt: new Date().toISOString()
                });
                toast.success("Streak added!");
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="streak-taker-overlay" onClick={onClose}>
            <div className="streak-taker-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><MdOutlineCancel /></button>
                <h2>{streak ? "Edit Streak" : "Start New Journey"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>What's your goal?</label>
                        <input
                            type="text"
                            placeholder="e.g. Early Morning, No Sugar..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="type-selector-group">
                        <label>Type</label>
                        <div className="type-buttons">
                            <button
                                type="button"
                                className={type === "do" ? "active" : ""}
                                onClick={() => setType("do")}
                            >
                                Do (Positive)
                            </button>
                            <button
                                type="button"
                                className={type === "avoid" ? "active" : ""}
                                onClick={() => setType("avoid")}
                            >
                                Avoid (Negative)
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        {streak ? "Update Streak" : "Create Streak"}
                    </button>
                </form>
            </div>
        </div>
    );
}
