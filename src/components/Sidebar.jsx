import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPieChart, FiUsers, FiGrid, FiActivity, FiHome, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
    const { auth, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome, roles: ['USER', 'ADMIN'] },
        { path: '/admin/dashboard', label: 'Admin Console', icon: FiActivity, roles: ['ADMIN'] },
        // We can break down admin tabs into real routes if we wanted, but for now let's keep it simple or allow functionality navigation
        // For this refactor, I'll stick to the main dashboard links, but maybe add visual toggles if purely inside dashboard
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Overview', icon: FiActivity },
        // Since AdminDashboard uses tabs, we usually rely on internal state. 
        // To make Sidebar effective for single page app with tabs, we might just stick to the main entry or refactor AdminDashboard to sub-routes.
        // Given the user request is just "header, sidebar, footer", I will keep the routing simple for now.
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <div className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
                    <FiPieChart /> ExpensePro
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</div>

                    {auth.user?.role === 'USER' && (
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <FiHome /> Dashboard
                        </Link>
                    )}

                    {auth.user?.role === 'ADMIN' && (
                        <Link
                            to="/admin/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <FiActivity /> Admin Console
                        </Link>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <FiLogOut /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
