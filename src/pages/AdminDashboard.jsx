import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // Default styling with customization
import { format } from 'date-fns';
import { FiDownload, FiTrash2, FiUserX, FiShield, FiEdit2, FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', isActive: true });

    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [catSearch, setCatSearch] = useState('');
    const [catPage, setCatPage] = useState(1);
    const [logSearch, setLogSearch] = useState('');
    const [logPage, setLogPage] = useState(1);
    const itemsPerPage = 8;
    const navigate = useNavigate();
    const location = useLocation();

    const getTabIndex = () => {
        if (location.pathname.includes('/admin/users')) return 1;
        if (location.pathname.includes('/admin/categories')) return 2;
        if (location.pathname.includes('/admin/audit-logs')) return 3;
        return 0;
    };

    const [tabIndex, setTabIndex] = useState(getTabIndex());

    useEffect(() => {
        setTabIndex(getTabIndex());
    }, [location.pathname]);

    const handleTabSelect = (index) => {
        setTabIndex(index);
        switch (index) {
            case 0: navigate('/admin/dashboard'); break;
            case 1: navigate('/admin/users'); break;
            case 2: navigate('/admin/categories'); break;
            case 3: navigate('/admin/audit-logs'); break;
            default: break;
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, usersRes, logsRes, catsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/users'),
                api.get('/admin/audit-logs'),
                api.get('/admin/categories') // Admin specific endpoint returns all categories
            ]);
            setStats(analyticsRes.data);
            setUsers(usersRes.data);
            setLogs(logsRes.data);
            setCategories(catsRes.data);
        } catch (error) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleSoftDeleteUser = async (id) => {
        if (window.confirm("Soft delete this user? They won't be able to login.")) {
            try {
                await api.put(`/admin/users/${id}/soft-delete`);
                toast.success("User deactivated");
                fetchInitialData();
            } catch (error) {
                toast.error("Failed to deactivate user");
            }
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/categories', { name: newCategory });
            toast.success("Category created");
            setNewCategory('');
            // refresh manually
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create category");
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/categories/${currentCategory.id}`, {
                name: currentCategory.name,
                isActive: currentCategory.isActive
            });
            toast.success("Category updated");
            setIsEditModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error("Failed to update category");
        }
    };

    const handleDeleteCategory = async () => {
        try {
            await api.delete(`/admin/categories/${currentCategory.id}`);
            toast.success("Category deleted");
            setIsDeleteModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    const openEditModal = (cat) => {
        setCurrentCategory({ id: cat._id, name: cat.name, isActive: cat.isActive });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (cat) => {
        setCurrentCategory({ id: cat._id, name: cat.name });
        setIsDeleteModalOpen(true);
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/expenses/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expenses_export_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Export successful");
        } catch (error) {
            toast.error("Export failed");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;

    const categoryData = stats?.categoryWiseTotals?.map(item => ({
        name: item._id,
        value: item.total
    })) || [];

    // Helper for pagination
    const paginate = (items, page, perPage) => {
        const start = (page - 1) * perPage;
        return items.slice(start, start + perPage);
    };

    const renderPagination = (totalItems, currentPage, setPage) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-end gap-2 mt-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Prev
                </button>
                <span className="px-3 py-1 text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Next
                </button>
            </div>
        );
    };

    // Filter Logic
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
    const displayedUsers = paginate(filteredUsers, userPage, itemsPerPage);

    const filteredCats = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
    const displayedCats = paginate(filteredCats, catPage, itemsPerPage);

    const filteredLogs = logs.filter(l =>
        l.entity?.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.performedBy?.email?.toLowerCase().includes(logSearch.toLowerCase())
    );
    const displayedLogs = paginate(filteredLogs, logPage, itemsPerPage);

    const getPageTitle = () => {
        switch (tabIndex) {
            case 1: return 'User Management';
            case 2: return 'Category Management';
            case 3: return 'Audit Logs';
            default: return 'Admin Console';
        }
    };

    return (
        <div className="container py-8 fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{getPageTitle()}</h1>
                <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
                    <FiDownload /> Export All Data
                </button>
            </div>

            {/* Overview Stats Moved to TabPanel 0 */}

            <Tabs selectedIndex={tabIndex} onSelect={handleTabSelect} className="w-full">
                <TabList className="hidden">
                    <Tab className="py-2 px-4 cursor-pointer text-gray-500 font-medium hover:text-indigo-600 focus:outline-none border-b-2 border-transparent hover:border-indigo-300" selectedClassName="text-indigo-600 border-indigo-600">Overview & Analytics</Tab>
                    <Tab className="py-2 px-4 cursor-pointer text-gray-500 font-medium hover:text-indigo-600 focus:outline-none border-b-2 border-transparent hover:border-indigo-300" selectedClassName="text-indigo-600 border-indigo-600">User Management</Tab>
                    <Tab className="py-2 px-4 cursor-pointer text-gray-500 font-medium hover:text-indigo-600 focus:outline-none border-b-2 border-transparent hover:border-indigo-300" selectedClassName="text-indigo-600 border-indigo-600">Categories</Tab>
                    <Tab className="py-2 px-4 cursor-pointer text-gray-500 font-medium hover:text-indigo-600 focus:outline-none border-b-2 border-transparent hover:border-indigo-300" selectedClassName="text-indigo-600 border-indigo-600">Audit Logs</Tab>
                </TabList>

                <TabPanel>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="card bg-white border-l-4 border-indigo-500 shadow hover:shadow-lg transition">
                            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
                            <p className="text-3xl font-bold text-gray-900">${stats?.totalExpenses?.toFixed(2)}</p>
                        </div>
                        <div className="card bg-white border-l-4 border-green-500 shadow hover:shadow-lg transition">
                            <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.isActive && !u.deletedAt).length}</p>
                        </div>
                        <div className="card bg-white border-l-4 border-yellow-500 shadow hover:shadow-lg transition">
                            <h3 className="text-gray-500 text-sm font-medium">Pending Categories</h3>
                            <p className="text-3xl font-bold text-gray-900">{categories.filter(c => !c.isActive).length}</p>
                        </div>
                        <div className="card bg-white border-l-4 border-red-500 shadow hover:shadow-lg transition">
                            <h3 className="text-gray-500 text-sm font-medium">System Logs</h3>
                            <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card h-96">
                            <h3 className="text-lg font-bold mb-4 text-center">Expenses by Category</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4">Top Spenders</h3>
                            <div className="custom-table-container rounded-3xl overflow-hidden shadow-lg bg-white">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-indigo-600 text-white text-xs uppercase font-bold tracking-wider">
                                            <th className="px-6 py-4 text-left">User</th>
                                            <th className="px-6 py-4 text-right">Total Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stats?.topSpendingUsers?.map((user, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white">
                                                <td className="px-6 py-4 font-semibold text-slate-700">{user.name || user._id}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold text-right">${user.totalSpent.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="card overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Manage Users</h3>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="input-field max-w-xs"
                                value={userSearch}
                                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                            />
                        </div>
                        <div className="custom-table-container rounded-3xl overflow-hidden shadow-lg bg-white mt-4">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-indigo-600 text-white text-xs uppercase font-bold tracking-wider">
                                        <th className="px-6 py-4 text-left">Name</th>
                                        <th className="px-6 py-4 text-left">Email</th>
                                        <th className="px-6 py-4 text-center">Role</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-left">Joined</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-slate-50 transition-colors bg-white">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 shadow-sm border border-indigo-200">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium text-sm">{user.email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {user.deletedAt ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Deleted</span>
                                                ) : user.isActive ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm font-medium">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                                            <td className="px-6 py-4 text-center">
                                                {!user.deletedAt && user.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleSoftDeleteUser(user._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                        title="Soft Delete User"
                                                    >
                                                        <FiUserX className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">No users found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            {renderPagination(filteredUsers.length, userPage, setUserPage)}
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Manage Categories</h3>
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="input-field max-w-xs"
                                value={catSearch}
                                onChange={(e) => { setCatSearch(e.target.value); setCatPage(1); }}
                            />
                        </div>

                        <form onSubmit={handleCreateCategory} className="flex gap-4 mb-6">
                            <input
                                type="text"
                                className="input-field flex-1"
                                placeholder="New Category Name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary">Add Category</button>
                        </form>

                        <div className="custom-table-container rounded-3xl overflow-hidden shadow-lg bg-white">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-indigo-600 text-white text-xs uppercase font-bold tracking-wider">
                                        <th className="px-6 py-4 text-left">Category Name</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedCats.map(cat => (
                                        <tr key={cat._id} className="hover:bg-slate-50 transition-colors bg-white">
                                            <td className="px-6 py-4 font-semibold text-slate-700">{cat.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${cat.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                    {cat.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(cat)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit Category"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(cat)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedCats.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-8 text-slate-400 font-medium">No categories found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(filteredCats.length, catPage, setCatPage)}
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="card overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">System Audit Logs</h3>
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="input-field max-w-xs"
                                value={logSearch}
                                onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                            />
                        </div>
                        <div className="custom-table-container rounded-3xl overflow-hidden shadow-lg bg-white mt-4">
                            <table className="w-full border-collapse">
                                <thead className="bg-indigo-600 text-white text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Timestamp</th>
                                        <th className="px-6 py-4 text-left">Action</th>
                                        <th className="px-6 py-4 text-left">Entity</th>
                                        <th className="px-6 py-4 text-left">Performed By</th>
                                        <th className="px-6 py-4 text-left">Role</th>
                                        <th className="px-6 py-4 text-left">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedLogs.map(log => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors bg-white">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold text-xs px-2 py-1 rounded ${log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                    log.action === 'CREATE' ? 'bg-green-50 text-green-600' :
                                                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700 text-sm">{log.entity}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{log.performedBy?.email || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500">{log.role}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate font-mono" title={JSON.stringify(log.metadata)}>
                                                {JSON.stringify(log.metadata)}
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">No logs found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(filteredLogs.length, logPage, setLogPage)}
                    </div>
                </TabPanel>
            </Tabs>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                            <h3 className="text-lg font-bold text-indigo-900">Edit Category</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentCategory.isActive}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, isActive: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="btn btn-primary flex items-center gap-2">
                                    <FiCheck /> Update Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-red-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-gray-800">"{currentCategory.name}"</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCategory}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2"
                                >
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
