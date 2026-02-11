import { useAuth } from '../context/AuthContext';
import { FiUser, FiBell } from 'react-icons/fi';

const Header = () => {
    const { auth } = useAuth();

    return (
        <header className="bg-white h-16 shadow-sm border-b border-gray-200 flex justify-between items-center px-6">
            <h2 className="text-xl font-semibold text-gray-800">
                {auth.user?.role === 'ADMIN' ? 'Administrator Panel' : 'My Dashboard'}
            </h2>

            <div className="flex items-center gap-6">
                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <FiBell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
                        <p className="text-xs text-indigo-500 font-medium">{auth.user?.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <FiUser className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
