import React, { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2, LayoutDashboard, LinkIcon, BarChart3, Settings,
    LogOut, Menu, X, Plus, ChevronDown, User
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../lib/supabase';
import { Button } from '../ui/Button';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/dashboard/links', icon: LinkIcon, label: 'My Links' },
    { path: '/dashboard/zyp', icon: User, label: 'My Page (ZYP)' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const { user, profile } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <Menu size={24} />
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zipp-black text-zipp-accent rounded-xl flex items-center justify-center">
                        <Link2 size={16} strokeWidth={3} className="-rotate-45" />
                    </div>
                    <span className="font-bold text-lg">zipp.so</span>
                </Link>
                <div className="w-10"></div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-zipp-black text-zipp-accent rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-zipp-accent/20">
                                <Link2 size={20} strokeWidth={3} className="-rotate-45" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">zipp.so</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Create Button */}
                    <div className="p-4">
                        <Link to="/dashboard/links?create=true">
                            <Button variant="accent" className="w-full py-3.5">
                                <Plus size={18} /> Create Zipp
                            </Button>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-2 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200
                  ${isActive
                                        ? 'bg-zipp-black text-white'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }
                `}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-zipp-accent/20 text-zipp-black flex items-center justify-center font-bold">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{user?.email}</p>
                                    <p className="text-xs text-gray-500">
                                        {profile?.links_count || 0}/{profile?.max_links || 10} links
                                    </p>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            <span className="font-medium">Cerrar sesión</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
