import { useState, useEffect } from "react";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import IconGenerator from "../../components/iconGenerator";
import "./periodeLab.css";

export default function PeriodeLab() {
    const { getHabits, startPeriod } = useUser();
    const navigate = useNavigate();

    // Period Dates
    const [startDate, setStartDate] = useState(
        format(addDays(new Date(), 1), "yyyy-MM-dd")
    );
    const [duration, setDuration] = useState(15);
    const [endDate, setEndDate] = useState(
        format(addDays(addDays(new Date(), 1), 15), "yyyy-MM-dd")
    );

    // Data
    const [availableHabits, setAvailableHabits] = useState([]);

    // Selection State
    const [selectedSideMissions, setSelectedSideMissions] = useState([]); // Array of { habitId, importance, name, icon }

    // UI State
    const [view, setView] = useState("config"); // 'config', 'confirmation'

    useEffect(() => {
        const loadHabits = async () => {
            const habits = await getHabits();
            setAvailableHabits(habits || []);
        };
        loadHabits();
    }, []);

    // Handlers
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        if (newStartDate) {
            const newEnd = addDays(parseISO(newStartDate), duration);
            setEndDate(format(newEnd, "yyyy-MM-dd"));
        }
    };

    const handleDurationChange = (e) => {
        const newDuration = parseInt(e.target.value, 10);
        setDuration(newDuration);
        if (!isNaN(newDuration) && startDate) {
            const newEnd = addDays(parseISO(startDate), newDuration);
            setEndDate(format(newEnd, "yyyy-MM-dd"));
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        if (newEndDate && startDate) {
            const diff = differenceInDays(parseISO(newEndDate), parseISO(startDate));
            setDuration(diff);
        }
    };

    const toggleSideMission = (habit) => {
        const exists = selectedSideMissions.find(m => m.habitId === habit.id);
        if (exists) {
            setSelectedSideMissions(prev => prev.filter(m => m.habitId !== habit.id));
        } else {
            setSelectedSideMissions(prev => [...prev, {
                habitId: habit.id,
                name: habit.name,
                icon: habit.icon,
                importace: habit.importace
            }]);
        }
    };

    const handleReview = () => {
        if (selectedSideMissions.length === 0) {
            alert("Please select at least one habit to focus on.");
            return;
        }
        setView("confirmation");
    };

    const handleConfirm = async () => {
        const periodData = {
            startDate,
            endDate,
            duration,
            sideMissions: selectedSideMissions
        };
        const res = await startPeriod(periodData);
        if (res === 200) {
            navigate("/"); // Or wherever dashboard is
        }
    };

    if (view === "confirmation") {
        return (
            <div className="periodeContainer">
                <div className="periodeCard confirmationCard">
                    <h1 className="periodeTitle">Confirm Your Period</h1>
                    <div className="mainPeriode">
                        <div className="summarySection">
                            <h2>Timeframe</h2>
                            <div className="summaryRow">
                                <span>Start:</span> <span>{startDate}</span>
                            </div>
                            <div className="summaryRow">
                                <span>End:</span> <span>{endDate}</span>
                            </div>
                            <div className="summaryRow">
                                <span>Duration:</span> <span>{duration} Days</span>
                            </div>
                        </div>

                        {selectedSideMissions.length > 0 && (
                            <div className="summarySection">
                                <h2>Side Missions</h2>
                                <div className="missionsSummaryList">
                                    {selectedSideMissions.map((m, i) => (
                                        <div key={i} className="missionSummaryItem">
                                            <IconGenerator icon={m.icon} />
                                            <span>{m.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="actionButtons">
                        <button className="secondaryBtn" onClick={() => setView("config")}>Back</button>
                        <button className="primaryBtn" onClick={handleConfirm}>Confirm & Start</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="periodeContainer">
            <div className="periodeCard">
                <div className="headText">
                    <h1 className="periodeTitle">Plan Your Period</h1>
                    <p className="periodeSubtitle">Define timeframe and missions.</p>
                </div>

                <div className="mainPeriode">
                    {/* Section 1: Time */}

                    <div className="inputGroup">
                        <div className="sectionTitle">Timeframe</div>
                        <div className="inputField">
                            <label>Start Date</label>
                            <input type="date" value={startDate} onChange={handleStartDateChange} />
                        </div>
                        <div className="inputField">
                            <label>Duration (Days)</label>
                            <input type="number" value={duration} onChange={handleDurationChange} min="1" />
                        </div>
                        <div className="inputField">
                            <label>End Date</label>
                            <input type="date" value={endDate} onChange={handleEndDateChange} />
                        </div>
                    </div>

                    {/* Section 2: Habits */}

                    <div className="habit-selection-group">
                        <div className="sectionTitle">
                            <span>Habits</span>
                            <button
                                className="manage-habits-btn"
                                onClick={() => navigate('/habitsLab')}
                            >
                                ⚙️ Manage Habits
                            </button>
                        </div>
                        <div className="habitsList">
                            {availableHabits
                                .map(habit => {
                                    const isSelected = selectedSideMissions.find(m => m.habitId === habit.id);
                                    return (
                                        <div key={habit.id} className={`habitItem ${isSelected ? 'selected' : ''}`}>
                                            <div className="habitInfo" onClick={() => toggleSideMission(habit)}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    readOnly
                                                />
                                                <IconGenerator icon={habit.icon} />
                                                <span>{habit.name}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="actionButtons">
                    <button className="primaryBtn" onClick={handleReview}>Review & Submit</button>
                </div>
            </div>
        </div>
    );
}
