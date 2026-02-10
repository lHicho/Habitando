import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "../../context/userContext";
import { db } from "../../context/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format, getDaysInMonth, parseISO } from "date-fns";
import toast from "react-hot-toast";
import "./finance.css";

const CURRENCY = "MAD";
const HISTORY_DAYS = 10;

export default function Finance() {
    const { userInfo } = useUser();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const [monthlyBudget, setMonthlyBudget] = useState("");
    const [todaySpent, setTodaySpent] = useState("");
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [budgetInput, setBudgetInput] = useState("");

    const financeSettings = useLiveQuery(
        () =>
            userInfo?.id ? db.finance_settings.where("userId").equals(userInfo.id).first() : null,
        [userInfo?.id]
    );

    const todayExpense = useLiveQuery(
        () =>
            userInfo?.id
                ? db.daily_expenses.where({ userId: userInfo.id, date: todayStr }).first()
                : null,
        [userInfo?.id, todayStr]
    );

    const recentExpenses = useLiveQuery(
        async () => {
            if (!userInfo?.id) return [];
            const expenses = await db.daily_expenses.where("userId").equals(userInfo.id).toArray();
            return expenses
                .sort((a, b) => (b.date > a.date ? 1 : -1))
                .slice(0, HISTORY_DAYS);
        },
        [userInfo?.id]
    );

    useEffect(() => {
        if (financeSettings?.monthlyBudget != null) {
            setMonthlyBudget(String(financeSettings.monthlyBudget));
        }
    }, [financeSettings?.monthlyBudget]);

    useEffect(() => {
        if (todayExpense?.amountSpent != null) {
            setTodaySpent(String(todayExpense.amountSpent));
        } else {
            setTodaySpent("0");
        }
    }, [todayExpense?.amountSpent]);

    const daysInMonth = useMemo(() => getDaysInMonth(new Date()), []);
    const dailyBudget = useMemo(() => {
        const budget = parseFloat(monthlyBudget) || 0;
        if (budget <= 0 || daysInMonth <= 0) return 0;
        return (budget / daysInMonth).toFixed(2);
    }, [monthlyBudget, daysInMonth]);

    const surplusBalance = financeSettings?.surplusBalance ?? 0;

    const spendingHistory = useMemo(() => {
        if (!recentExpenses || !monthlyBudget || parseFloat(monthlyBudget) <= 0) return [];
        const budget = parseFloat(monthlyBudget);
        return recentExpenses.map((e) => {
            const d = parseISO(e.date);
            const daysInThatMonth = getDaysInMonth(d);
            const daily = daysInThatMonth > 0 ? budget / daysInThatMonth : 0;
            const diff = daily - (e.amountSpent || 0);
            return { date: e.date, diff, spent: e.amountSpent };
        });
    }, [recentExpenses, monthlyBudget]);

    const saveMonthlyBudget = useCallback(async () => {
        if (!userInfo?.id) return;
        const budget = parseFloat(budgetInput);
        if (isNaN(budget) || budget < 0) {
            toast.error("Enter a valid budget");
            return;
        }
        try {
            const existing = await db.finance_settings.where("userId").equals(userInfo.id).first();
            if (existing) {
                await db.finance_settings.update(existing.id, {
                    monthlyBudget: budget,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                await db.finance_settings.add({
                    userId: userInfo.id,
                    monthlyBudget: budget,
                    surplusBalance: 0,
                    updatedAt: new Date().toISOString(),
                });
            }
            setShowBudgetModal(false);
            toast.success("Budget saved");
        } catch (err) {
            toast.error("Failed to save budget");
        }
    }, [userInfo?.id, budgetInput]);

    const openBudgetModal = () => {
        setBudgetInput(monthlyBudget);
        setShowBudgetModal(true);
    };

    const updateTodaySpent = useCallback(
        async (newAmount) => {
            if (!userInfo?.id) return;
            const amount = parseFloat(newAmount);
            if (isNaN(amount) || amount < 0) {
                toast.error("Enter a valid amount");
                return;
            }

            const budget = parseFloat(monthlyBudget) || 0;
            const daily = budget > 0 && daysInMonth > 0 ? budget / daysInMonth : 0;

            try {
                let settings = await db.finance_settings.where("userId").equals(userInfo.id).first();
                if (!settings) {
                    await db.finance_settings.add({
                        userId: userInfo.id,
                        monthlyBudget: budget || 0,
                        surplusBalance: 0,
                        updatedAt: new Date().toISOString(),
                    });
                    settings = await db.finance_settings.where("userId").equals(userInfo.id).first();
                }

                const existingExpense = await db.daily_expenses
                    .where({ userId: userInfo.id, date: todayStr })
                    .first();
                const oldAmount = existingExpense?.amountSpent ?? 0;

                let surplusDelta;
                if (existingExpense) {
                    surplusDelta = oldAmount - amount;
                } else {
                    surplusDelta = daily - amount;
                }

                const newSurplus = (settings.surplusBalance ?? 0) + surplusDelta;

                await db.finance_settings.update(settings.id, {
                    surplusBalance: newSurplus,
                    updatedAt: new Date().toISOString(),
                });

                if (existingExpense) {
                    await db.daily_expenses.update(existingExpense.id, { amountSpent: amount });
                } else {
                    await db.daily_expenses.add({
                        userId: userInfo.id,
                        date: todayStr,
                        amountSpent: amount,
                    });
                }
                setTodaySpent(String(amount));
                toast.success("Expense saved");
            } catch (err) {
                toast.error("Failed to save expense");
            }
        },
        [userInfo?.id, monthlyBudget, daysInMonth, todayStr]
    );

    const adjustSpent = (delta) => {
        const current = parseFloat(todaySpent) || 0;
        const newVal = Math.max(0, current + delta);
        setTodaySpent(String(newVal));
        updateTodaySpent(newVal);
    };

    const handleTodaySpentBlur = () => {
        const val = parseFloat(todaySpent);
        if (!isNaN(val) && val >= 0) {
            updateTodaySpent(val);
        }
    };

    const handleTodaySpentChange = (e) => {
        setTodaySpent(e.target.value);
    };

    if (!userInfo) {
        return (
            <div className="finance-page">
                <p className="finance-empty">Please sign in to track your finances.</p>
            </div>
        );
    }

    return (
        <div className="finance-page">
            <div className="finance-card">
                <div className="finance-header">
                    <h1 className="finance-title">Money Tracking</h1>
                    <button className="finance-budget-btn" onClick={openBudgetModal} title="Edit monthly budget">
                        Edit Budget
                    </button>
                </div>

                {/* Compact top: Daily + Surplus + Today's Spending */}
                <div className="finance-top-bar">
                    <div className="finance-top-item">
                        <span className="finance-top-label">Daily</span>
                        <span className="finance-top-value">{CURRENCY} {dailyBudget}</span>
                    </div>
                    <div className="finance-top-item">
                        <span className="finance-top-label">Surplus</span>
                        <span className={`finance-top-value ${surplusBalance >= 0 ? "positive" : "negative"}`}>
                            {CURRENCY} {Number(surplusBalance).toFixed(2)}
                        </span>
                    </div>
                    <div className="finance-top-item finance-top-spending">
                        <span className="finance-top-label">Today ({format(new Date(), "MMM d")})</span>
                        <div className="today-controls">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={todaySpent}
                            onChange={handleTodaySpentChange}
                            onBlur={handleTodaySpentBlur}
                            className="finance-spent-input"
                        />
                        </div>
                    </div>
                </div>

                {/* Spending History */}
                <div className="finance-section history-section">
                    <h2 className="finance-section-title">Recent History</h2>
                    <div className="finance-history-scroll">
                        {spendingHistory.length === 0 ? (
                            <p className="finance-history-empty">No spending logged yet</p>
                        ) : (
                            spendingHistory.map((item) => (
                                <div
                                    key={item.date}
                                    className={`finance-history-row ${item.diff >= 0 ? "positive" : "negative"}`}
                                >
                                    <span className="finance-history-date">
                                        {format(parseISO(item.date), "MMM d")}
                                    </span>
                                    <span className="finance-history-diff">
                                        {item.diff >= 0 ? "+" : ""}{Number(item.diff).toFixed(2)} {CURRENCY}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Modal */}
            {showBudgetModal && (
                <div className="finance-modal-overlay" onClick={() => setShowBudgetModal(false)}>
                    <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Monthly Budget</h3>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder={`e.g. 5000 ${CURRENCY}`}
                            className="finance-input"
                        />
                        <div className="finance-modal-actions">
                            <button className="finance-btn secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                            <button className="finance-btn primary" onClick={saveMonthlyBudget}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
