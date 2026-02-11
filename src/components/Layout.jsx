import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { FiPieChart, FiUsers, FiActivity, FiHome, FiLogOut, FiSettings, FiGrid, FiBarChart2, FiLayers } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const { auth, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans w-full text-slate-900">

            {/* Sidebar - FIXED LEFT */}
            <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col h-full border-r border-slate-800 isolate z-30 transition-width duration-300 ease-in-out md:flex hidden">
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
                    <Link to="/dashboard" className="text-xl font-bold flex items-center gap-2 text-indigo-400 brand-font tracking-wide hover:text-indigo-300 transition-colors">
                        <FiPieChart className="w-7 h-7" strokeWidth={2.5} /> ExpensePro
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
                    <p className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Main Menu
                    </p>
                    {auth.user?.role === 'USER' && (
                        <>
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <FiHome className={`w-5 h-5 transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                Dashboard
                            </Link>
                            <Link
                                to="/reports"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <FiBarChart2 className={`w-5 h-5 transition-colors ${location.pathname === '/reports' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                My Reports
                            </Link>
                        </>
                    )}
                    {auth.user?.role === 'ADMIN' && (
                        <>
                            <Link
                                to="/admin/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/admin/dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <FiActivity className={`w-5 h-5 transition-colors ${location.pathname === '/admin/dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                Overview
                            </Link>
                            <div className="pt-4 pb-2">
                                <p className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Management</p>
                                <Link
                                    to="/admin/users"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/admin/users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <FiUsers className={`w-5 h-5 transition-colors ${location.pathname === '/admin/users' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    Users
                                </Link>
                                <Link
                                    to="/admin/categories"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/admin/categories' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <FiGrid className={`w-5 h-5 transition-colors ${location.pathname === '/admin/categories' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    Categories
                                </Link>
                                <Link
                                    to="/admin/audit-logs"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${location.pathname === '/admin/audit-logs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <FiLayers className={`w-5 h-5 transition-colors ${location.pathname === '/admin/audit-logs' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    Audit Logs
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-40">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group border border-transparent hover:border-red-500/20"
                    >
                        <FiLogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                        Sign Out
                    </button>
                    <div className="mt-4 flex items-center gap-3 px-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-700">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-medium text-slate-200 truncate w-32">{auth.user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate w-32 uppercase">{auth.user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper - FLEX COLUMN */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 relative h-full">

                {/* Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 relative w-full scroll-smooth scrollbar-hidden">
                    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto pb-24 animate-fade-in">
                        {/* Breadcrumb / Title Area - Replaces old header mostly */}
                        <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                                    {location.pathname === '/dashboard' && 'Dashboard'}
                                    {location.pathname === '/admin/dashboard' && 'Admin Overview'}
                                    {location.pathname === '/admin/users' && 'User Management'}
                                    {location.pathname === '/admin/categories' && 'Categories'}
                                    {location.pathname === '/admin/audit-logs' && 'System Logs'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Welcome back, {auth.user?.name}
                                </p>
                            </div>
                            <div className="text-sm text-gray-400 font-medium">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {children}
                    </div>
                </main>

                {/* Footer - STICKY BOTTOM */}
                <footer className="h-10 bg-white border-t border-gray-200 z-20 flex items-center justify-between px-6 text-xs text-gray-400 w-full flex-none shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                    <span>v1.0.0 Enterprise Edition</span>
                    <span>&copy; {new Date().getFullYear()} ExpensePro. All rights reserved.</span>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
