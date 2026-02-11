import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiPieChart, FiGrid, FiUsers, FiActivity } from 'react-icons/fi';

const Navbar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar shadow-sm">
            <div className="container flex justify-between items-center">
                <Link to={auth.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <FiPieChart className="w-6 h-6" />
                    <span>ExpensePro</span>
                </Link>

                <div className="flex items-center gap-4">
                    {auth.isAuthenticated && (
                        <>
                            <span className="text-gray-600 text-sm font-medium hidden md:block">
                                Hello, {auth.user?.name || 'User'}
                            </span>
                            {auth.user?.role === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="nav-link flex items-center gap-1">
                                    <FiActivity /> Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary flex items-center gap-2 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
