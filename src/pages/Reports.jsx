import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiDownload, FiFilter } from 'react-icons/fi';

const Reports = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expRes, catRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/categories')
            ]);
            setExpenses(expRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end date to end of day for inclusive comparison if needed, or just compare yyyy-mm-dd strings
        const expDateStr = format(expDate, 'yyyy-MM-dd');

        const isDateInRange = expDateStr >= startDate && expDateStr <= endDate;
        const isCategoryMatch = selectedCategory === 'ALL' || exp.categoryId === selectedCategory;

        return isDateInRange && isCategoryMatch;
    });

    const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const netBalance = totalIncome - totalExpense;

    const handleExport = () => {
        // Simple CSV export
        const headers = ['Date', 'Description', 'Category', 'Type', 'Payment Type', 'Amount'];
        const rows = filteredExpenses.map(exp => [
            format(new Date(exp.date), 'yyyy-MM-dd'),
            `"${exp.description}"`, // Escape quotes
            categories.find(c => c._id === exp.categoryId)?.name || 'Unknown',
            exp.type ? exp.type.toUpperCase() : 'EXPENSE',
            exp.paymentType,
            exp.amount.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transaction_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="container py-6 fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">My Reports</h1>
                <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <FiFilter /> Filter Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="label">Start Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">End Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select
                            className="input-field"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <h4 className="text-emerald-800 font-bold text-lg">Total Income</h4>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                        +${totalIncome.toFixed(2)}
                    </div>
                </div>
                <div className="card bg-red-50 border border-red-100 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <h4 className="text-red-800 font-bold text-lg">Total Expense</h4>
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                        -${totalExpense.toFixed(2)}
                    </div>
                </div>
                <div className={`card p-6 rounded-2xl flex justify-between items-center border ${netBalance >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div>
                        <h4 className={`font-bold text-lg ${netBalance >= 0 ? 'text-indigo-800' : 'text-orange-800'}`}>Net Balance</h4>
                        <p className={`text-sm ${netBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>{format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}</p>
                    </div>
                    <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                        ${netBalance.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        No transactions found for this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map(exp => {
                                    const category = categories.find(c => c._id === exp.categoryId)?.name || 'Unknown';
                                    const isIncome = exp.type === 'income';
                                    return (
                                        <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {format(new Date(exp.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-800 font-medium text-sm">
                                                {exp.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                    {category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {isIncome ? 'INCOME' : 'EXPENSE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {exp.paymentType}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                {isIncome ? '+' : '-'}${exp.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
