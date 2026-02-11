import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiEdit2, FiTrash2, FiPlus, FiDollarSign, FiCreditCard, FiCalendar, FiTag, FiFileText, FiTrendingUp, FiActivity, FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState('all');
    const itemsPerPage = 5;
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        description: '',
        paymentType: 'Cash',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense' // Default to expense
    });
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data } = await api.get('/expenses');
            setExpenses(data);
            calculateStats(data);
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            // Don't auto-set categoryId here as it depends on type
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    const activeCategories = categories.filter(c =>
        c.isActive && (c.type === formData.type || (!c.type && formData.type === 'expense'))
    );

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const { data } = await api.post('/categories', { name: newCategoryName, type: formData.type });
            setCategories([...categories, data]);
            setFormData({ ...formData, categoryId: data._id });
            setIsCreatingCategory(false);
            setNewCategoryName('');
            toast.success('Category created');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const calculateStats = (data) => {
        const totalIncome = data.filter(item => item.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = data.filter(item => item.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const balance = totalIncome - totalExpense;
        setStats({ totalIncome, totalExpense, balance, count: data.length });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} Added Successfully`);
            fetchExpenses();
            setFormData(prev => ({
                ...prev,
                amount: '',
                description: '',
                date: format(new Date(), 'yyyy-MM-dd'),
            }));
        } catch (error) {
            toast.error('Failed to add transaction');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.delete(`/expenses/${id}`); // This performs soft delete in backend
                toast.success('Transaction Deleted');
                fetchExpenses();
            } catch (error) {
                toast.error('Failed to delete transaction');
            }
        }
    };

    // Prepare chart data (Net per day? Or separate?)
    // Let's show Expense Trend for now as implied by "Spending Trends", maybe allow toggle later.
    // Or users might want to see Income vs Expense. Let's stack them or just show expenses.
    // For simplicity and matching "Spending Trends", I will filter for expenses.
    const chartData = expenses
        .filter(e => e.type === 'expense')
        .reduce((acc, curr) => {
            const date = format(new Date(curr.date), 'MM/dd');
            const existing = acc.find(item => item.name === date);
            if (existing) {
                existing.amount += curr.amount;
            } else {
                acc.push({ name: date, amount: curr.amount });
            }
            return acc;
            return acc;
        }, []).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7);

    // Pagination Logic
    const filteredExpenses = expenses.filter(expense => {
        if (filterType === 'all') return true;
        return expense.type === filterType;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="container py-6 fade-in space-y-8">
            {/* Header Section */}
            {/* <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Dashboard</h1>
                   <p className="text-slate-500 mt-1">Track your spending and manage expenses efficiently.</p>
                </div>
            </div> */}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card - Resets Filter */}
                <div
                    onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                    className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl shadow-xl p-6 transition transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${filterType === 'all' ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
                >
                    <div className="absolute right-0 top-0 h-32 w-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider">Remaining Balance</h3>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-3xl font-extrabold tracking-tight">${stats.balance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <FiActivity className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Card - Filters Income */}
                <div
                    onClick={() => { setFilterType('income'); setCurrentPage(1); }}
                    className={`relative overflow-hidden bg-white text-slate-800 rounded-2xl shadow-md border-l-4 border-emerald-500 p-6 transition transform hover:-translate-y-1 cursor-pointer ${filterType === 'income' ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-lg' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Income</h3>
                            <div className="flex items-baseline mt-2">
                                <span className="text-3xl font-extrabold tracking-tight text-emerald-600">+${stats.totalIncome.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-emerald-100 p-3 rounded-lg">
                            <FiArrowUpCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* Expense Card - Filters Expense */}
                <div
                    onClick={() => { setFilterType('expense'); setCurrentPage(1); }}
                    className={`relative overflow-hidden bg-white text-slate-800 rounded-2xl shadow-md border-l-4 border-red-500 p-6 transition transform hover:-translate-y-1 cursor-pointer ${filterType === 'expense' ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Expenses</h3>
                            <div className="flex items-baseline mt-2">
                                <span className="text-3xl font-extrabold tracking-tight text-red-600">-${stats.totalExpense.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <FiArrowDownCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area: Charts & List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FiActivity className="text-indigo-500" /> Spending Trends
                            </h3>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Last 7 Days</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        formatter={(value) => [`$${value}`, 'Amount']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
                        </div>
                        <div className="hover-scroll-container">
                            <table className="w-full text-left border-collapse relative">
                                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 shadow-sm">
                                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <FiFileText className="w-12 h-12 mb-3 opacity-20" />
                                                    <p>No transactions found. Start adding some!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentExpenses.map(expense => {
                                            const category = categories.find(c => c._id === expense.categoryId)?.name || 'General';
                                            const isIncome = expense.type === 'income';
                                            return (
                                                <tr key={expense._id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                                        {expense.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                            {category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {isIncome ? 'INCOME' : 'EXPENSE'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                        {isIncome ? '+' : '-'}${expense.amount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleDelete(expense._id)}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredExpenses.length > itemsPerPage && (
                            <div className="p-4 border-t border-slate-100 bg-white flex justify-center items-center gap-2">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    Prev
                                </button>
                                <span className="text-sm text-slate-500 font-medium px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Add Transaction */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden sticky top-6">
                        <div className={`p-6 text-white text-center transition-colors duration-300 ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                            <h2 className="text-xl font-bold mb-1">Add New {formData.type === 'income' ? 'Income' : 'Expense'}</h2>
                            <p className="text-white/80 text-xs">Enter details below to track</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Type Toggle */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                                        className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                                        className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Income
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                        <FiDollarSign /> Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                        <FiTag /> {formData.type === 'income' ? 'Source / Category' : 'Category'}
                                    </label>
                                    <div className="relative">

                                        {!isCreatingCategory ? (
                                            <select
                                                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-slate-700"
                                                value={formData.categoryId}
                                                onChange={(e) => {
                                                    if (e.target.value === 'NEW') {
                                                        setIsCreatingCategory(true);
                                                    } else {
                                                        setFormData({ ...formData, categoryId: e.target.value });
                                                    }
                                                }}
                                                required
                                            >
                                                <option value="" disabled>Select {formData.type === 'income' ? 'Source' : 'Category'}</option>
                                                {activeCategories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                                <option value="NEW" className="font-bold text-indigo-600">+ Add New {formData.type === 'income' ? 'Source' : 'Category'}</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    placeholder="Enter name"
                                                    className="flex-1 px-3 py-2.5 bg-white border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCreateCategory}
                                                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                                >
                                                    <FiPlus />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingCategory(false)}
                                                    className="px-3 py-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        )}
                                        {!isCreatingCategory && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>

                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                        <FiFileText /> Description
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                                        placeholder={formData.type === 'income' ? "E.g. Monthly Salary" : "What was this for?"}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                        <FiCreditCard /> Payment Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Cash', 'Card', 'Online'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentType: type })}
                                                className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.paymentType === type
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                                        <FiCalendar /> Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 ${formData.type === 'income' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200'}`}
                                >
                                    <FiPlus className="w-5 h-5" /> Add {formData.type === 'income' ? 'Income' : 'Expense'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
