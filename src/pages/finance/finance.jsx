import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "../../context/userContext";
import { db } from "../../context/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format, getDaysInMonth, endOfMonth, differenceInDays, startOfMonth, parseISO } from "date-fns";
import toast from "react-hot-toast";
import "./finance.css";

const CURRENCY = "MAD";
const CATEGORIES = [
    { id: "food", label: "Food", icon: "🍱" },
    { id: "transport", label: "Transport", icon: "🚗" },
    { id: "rent", label: "Rent", icon: "🏠" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "health", label: "Health", icon: "💊" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "other", label: "Other", icon: "💰" },
];

export default function Finance() {
    const { userInfo } = useUser();
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    // Modal states
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    // Form states
    const [budgetInput, setBudgetInput] = useState("");
    const [balanceInput, setBalanceInput] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("other");
    const [expenseDate, setExpenseDate] = useState(todayStr);

    // Queries
    const financeSettings = useLiveQuery(
        () => userInfo?.id ? db.finance_settings.where("userId").equals(userInfo.id).first() : null,
        [userInfo?.id]
    );

    const allExpenses = useLiveQuery(
        () => userInfo?.id ? db.expenses.where("userId").equals(userInfo.id).toArray() : [],
        [userInfo?.id]
    );

    // Derived Data
    const startingBalance = financeSettings?.startingBalance ?? 0;
    const startingDate = financeSettings?.startingDate ?? "1970-01-01";
    const monthlyBudgetValue = financeSettings?.monthlyBudget ?? 0;

    const filteredExpensesForBalance = useMemo(() => {
        if (!allExpenses) return [];
        return allExpenses.filter(e => e.date >= startingDate);
    }, [allExpenses, startingDate]);

    const currentWalletBalance = useMemo(() => {
        const totalExpensesSinceStart = filteredExpensesForBalance.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        return startingBalance - totalExpensesSinceStart;
    }, [startingBalance, filteredExpensesForBalance]);

    const currentMonthExpenses = useMemo(() => {
        if (!allExpenses) return [];
        const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
        return allExpenses.filter(e => e.date >= monthStart);
    }, [allExpenses, today]);

    const spentThisMonth = useMemo(() => {
        return currentMonthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    }, [currentMonthExpenses]);

    const monthlyBudgetLeft = monthlyBudgetValue - spentThisMonth;

    const budgetPercentage = useMemo(() => {
        if (!monthlyBudgetValue || monthlyBudgetValue <= 0) return 100;
        return (monthlyBudgetLeft / monthlyBudgetValue) * 100;
    }, [monthlyBudgetLeft, monthlyBudgetValue]);

    const budgetStatus = useMemo(() => {
        if (monthlyBudgetLeft <= 0) return "danger";
        if (budgetPercentage <= 20) return "warning";
        return "normal";
    }, [monthlyBudgetLeft, budgetPercentage]);

    const daysLeftInMonth = useMemo(() => {
        const end = endOfMonth(today);
        return differenceInDays(end, today) + 1; // Include today
    }, [today]);

    const dailyBudget = useMemo(() => {
        if (monthlyBudgetLeft <= 0) return 0;
        return (monthlyBudgetLeft / daysLeftInMonth).toFixed(2);
    }, [monthlyBudgetLeft, daysLeftInMonth]);

    const recentHistory = useMemo(() => {
        if (!allExpenses) return [];
        return [...allExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
    }, [allExpenses]);

    // Actions
    const handleSaveBudget = async () => {
        if (!userInfo?.id) return;
        const val = parseFloat(budgetInput);
        if (isNaN(val) || val < 0) return toast.error("Invalid budget");

        try {
            const existing = await db.finance_settings.where("userId").equals(userInfo.id).first();
            if (existing) {
                await db.finance_settings.update(existing.id, { monthlyBudget: val });
            } else {
                await db.finance_settings.add({ userId: userInfo.id, monthlyBudget: val, startingBalance: 0, startingDate: todayStr });
            }
            setShowBudgetModal(false);
            toast.success("Budget updated");
        } catch (e) {
            toast.error("Failed to save");
        }
    };

    const handleSaveBalance = async () => {
        if (!userInfo?.id) return;
        const val = parseFloat(balanceInput);
        if (isNaN(val) || val < 0) return toast.error("Invalid balance");

        try {
            const existing = await db.finance_settings.where("userId").equals(userInfo.id).first();
            if (existing) {
                await db.finance_settings.update(existing.id, {
                    startingBalance: val,
                    startingDate: todayStr // Reset tracking from today when starting balance is set
                });
            } else {
                await db.finance_settings.add({
                    userId: userInfo.id,
                    startingBalance: val,
                    startingDate: todayStr,
                    monthlyBudget: 0
                });
            }
            setShowBalanceModal(false);
            toast.success("Balance updated");
        } catch (e) {
            toast.error("Failed to save");
        }
    };

    const handleAddExpense = async () => {
        if (!userInfo?.id) return;
        const amount = parseFloat(expenseAmount);
        if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");

        try {
            await db.expenses.add({
                userId: userInfo.id,
                amount,
                category: expenseCategory,
                date: expenseDate,
                createdAt: new Date().toISOString()
            });
            setShowExpenseModal(false);
            setExpenseAmount("");
            toast.success("Expense added");
        } catch (e) {
            toast.error("Failed to add expense");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await db.expenses.delete(id);
            toast.success("Deleted");
        } catch (e) {
            toast.error("Error deleting");
        }
    };

    if (!userInfo) return <div className="finance-page"><p className="finance-empty">Please sign in to track finances.</p></div>;

    return (
        <div className="finance-page">
            <div className="finance-container">
                <div className="finance-grid">
                    {/* Wallet Card */}
                    <div className="finance-card wallet-card" onClick={() => {
                        setBalanceInput(currentWalletBalance);
                        setShowBalanceModal(true);
                    }}>
                        <span className="card-label">Virtual Account</span>
                        <div className="card-value">{CURRENCY} {currentWalletBalance.toLocaleString()}</div>
                        <span className="card-hint">Click to adjust current balance</span>
                    </div>

                    {/* Monthly Budget Card */}
                    <div className={`finance-card budget-card ${budgetStatus}`} onClick={() => {
                        setBudgetInput(monthlyBudgetValue);
                        setShowBudgetModal(true);
                    }}>
                        <div className="card-header-row">
                            <span className="card-label">Monthly Budget Left</span>
                            <span className="edit-icon">⚙️</span>
                        </div>
                        <div className="card-value">{CURRENCY} {monthlyBudgetLeft.toLocaleString()}</div>
                        <div className="budget-progress-bg">
                            <div
                                className="budget-progress-bar"
                                style={{ width: `${Math.min(100, Math.max(0, (monthlyBudgetLeft / (monthlyBudgetValue || 1)) * 100))}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Daily Budget Card */}
                    <div className="finance-card daily-card">
                        <span className="card-label">Daily Budget</span>
                        <div className="card-value">{CURRENCY} {dailyBudget}</div>
                        <span className="card-hint">{daysLeftInMonth} days left in month</span>
                    </div>
                </div>

                <button className="add-expense-btn-large" onClick={() => setShowExpenseModal(true)}>
                    + Add New Expense
                </button>

                <section className="history-section">
                    <h2>Recent Expenses</h2>
                    <div className="history-list">
                        {recentHistory.length === 0 ? (
                            <p className="empty-history">No expenses yet. Start tracking today!</p>
                        ) : (
                            recentHistory.map((ex) => (
                                <div key={ex.id} className="history-item">
                                    <div className="history-info">
                                        <span className="history-icon">
                                            {CATEGORIES.find(c => c.id === ex.category)?.icon || "💰"}
                                        </span>
                                        <div>
                                            <div className="history-cat">{CATEGORIES.find(c => c.id === ex.category)?.label || "Other"}</div>
                                            <div className="history-date">{format(parseISO(ex.date), "MMM d, yyyy")}</div>
                                        </div>
                                    </div>
                                    <div className="history-actions">
                                        <span className="history-amount">-{ex.amount} {CURRENCY}</span>
                                        <button className="delete-ex-btn" onClick={() => handleDeleteExpense(ex.id)}>×</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Modals */}
            {showBudgetModal && (
                <div className="finance-modal-overlay" onClick={() => setShowBudgetModal(false)}>
                    <div className="finance-modal" onClick={e => e.stopPropagation()}>
                        <h3>Financial Settings</h3>
                        <div className="input-group">
                            <label>Monthly Budget ({CURRENCY})</label>
                            <input
                                type="number"
                                value={budgetInput}
                                onChange={e => setBudgetInput(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveBudget}>Save Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {showBalanceModal && (
                <div className="finance-modal-overlay" onClick={() => setShowBalanceModal(false)}>
                    <div className="finance-modal" onClick={e => e.stopPropagation()}>
                        <h3>Set Money I Have Now</h3>
                        <p className="modal-desc">This will set your "starting point" and we'll track balance from here.</p>
                        <div className="input-group">
                            <label>Amount in wallet ({CURRENCY})</label>
                            <input
                                type="number"
                                value={balanceInput}
                                onChange={e => setBalanceInput(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowBalanceModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveBalance}>Update Balance</button>
                        </div>
                    </div>
                </div>
            )}

            {showExpenseModal && (
                <div className="finance-modal-overlay" onClick={() => setShowExpenseModal(false)}>
                    <div className="finance-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Expense</h3>
                        <div className="input-group">
                            <label>Amount ({CURRENCY})</label>
                            <input
                                type="number"
                                value={expenseAmount}
                                onChange={e => setExpenseAmount(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <div className="category-selector">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`cat-btn ${expenseCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setExpenseCategory(cat.id)}
                                    >
                                        <span className="cat-icon">{cat.icon}</span>
                                        <span className="cat-label">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={e => setExpenseDate(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleAddExpense}>Add Expense</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

