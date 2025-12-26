import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Plane,
    Building2,
    Calendar,
    Users,
    UserCircle,
    Wallet,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Theme Toggle Component
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-dark-surface hover:bg-dark-card border border-dark-border transition-all duration-300 hover:border-accent-blue"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-accent-orange" />
            ) : (
                <Moon className="w-5 h-5 text-accent-blue" />
            )}
        </button>
    );
};

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState('');

    const isActive = (path) => location.pathname === path;

    const mainMenuItems = [
        { path: '/', label: 'Dashboard Bakhtera-1', icon: LayoutDashboard },
        { path: '/blink', label: 'BLINK', subtitle: 'Management System', icon: Plane },
        { path: '/big', label: 'BIG', subtitle: 'Penyelenggara Acara', icon: Calendar },
        { path: '/bridge', label: 'BRIDGE', subtitle: 'Aset TPPB', icon: Building2 },
        { path: '/pabean', label: 'Pabean', subtitle: 'Customs Portal', icon: Building2 },
    ];

    const centralizedMenuItems = [
        { path: '/vendors', label: 'Manajemen Vendor', icon: Users },
        { path: '/customers', label: 'Manajemen Pelanggan', icon: UserCircle },
        { path: '/finance', label: 'Keuangan', icon: Wallet },
    ];

    // Bridge submenu items
    const bridgeSubMenuItems = [
        { path: '/bridge', label: 'Dashboard' },
        { path: '/bridge/bc-master', label: 'Master Kode BC' },
        { path: '/bridge/item-master', label: 'Master Kode Barang' },
        { path: '/bridge/pengajuan', label: 'Pendaftaran' },
        { path: '/bridge/inventory', label: 'Inventaris Gudang' },
        { path: '/bridge/goods-movement', label: 'Pergerakan Barang' },
        { path: '/bridge/logger', label: 'Activity Logger' },
        { path: '/bridge/approvals', label: 'Approval Manager' },
        { path: '/bridge/finance', label: 'Finance' },
    ];

    // Pabean submenu items
    const pabeanSubMenuItems = [
        { path: '/pabean', label: 'Dashboard' },
        { path: '/pabean/barang-masuk', label: 'Barang Masuk' },
        { path: '/pabean/barang-keluar', label: 'Barang Keluar' },
        { path: '/pabean/barang-reject', label: 'Barang Reject/Scrap' },
        { path: '/pabean/pergerakan', label: 'Pergerakan Barang' },
    ];

    const MenuLink = ({ item, isMobile = false }) => (
        <Link
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition ${isActive(item.path)
                ? 'bg-silver text-dark-bg sidebar-active-item'
                : 'text-silver-dark hover:text-silver-light hover:bg-dark-surface'
                }`}
        >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.subtitle && (
                    <div className={`text-xs ${isActive(item.path) ? 'opacity-70' : 'text-silver-dark'}`}>
                        {item.subtitle}
                    </div>
                )}
            </div>
        </Link>
    );

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-dark-border flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">BAKHTERA-1</h1>
                    <p className="text-xs text-silver-dark mt-1">Freight & Asset Management</p>
                </div>
                {/* Theme Toggle */}
                <ThemeToggle />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                {/* Modul Utama */}
                <div>
                    <h3 className="px-4 mb-3 text-xs font-semibold text-silver-dark uppercase tracking-wider">
                        Modul Utama
                    </h3>
                    <div className="space-y-1">
                        {mainMenuItems.map((item) => {
                            // Special handling for Bridge with submenu
                            if (item.path === '/bridge') {
                                const isExpanded = expandedSection === 'bridge' || location.pathname.startsWith('/bridge');
                                const isBridgeActive = location.pathname.startsWith('/bridge');

                                return (
                                    <div key={item.path}>
                                        <button
                                            onClick={() => setExpandedSection(isExpanded ? '' : 'bridge')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition ${isBridgeActive
                                                ? 'bg-accent-blue bg-opacity-20 text-accent-blue'
                                                : 'text-silver-dark hover:text-silver-light hover:bg-dark-surface'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{item.label}</div>
                                                <div className={`text-xs ${isBridgeActive ? 'text-accent-blue/70' : 'text-silver-dark'}`}>
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                                                >
                                                    {bridgeSubMenuItems.map((subItem) => (
                                                        <Link
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            onClick={() => isMobile && setIsOpen(false)}
                                                            className={`block px-4 py-2 rounded-lg text-sm smooth-transition ${isActive(subItem.path)
                                                                ? 'bg-accent-blue text-white'
                                                                : 'text-silver-dark hover:text-silver-light hover:bg-dark-surface'
                                                                }`}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            }

                            // Special handling for Pabean with submenu
                            if (item.path === '/pabean') {
                                const isExpanded = expandedSection === 'pabean' || location.pathname.startsWith('/pabean');
                                const isPabeanActive = location.pathname.startsWith('/pabean');

                                return (
                                    <div key={item.path}>
                                        <button
                                            onClick={() => setExpandedSection(isExpanded ? '' : 'pabean')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition ${isPabeanActive
                                                ? 'bg-accent-green bg-opacity-20 text-accent-green'
                                                : 'text-silver-dark hover:text-silver-light hover:bg-dark-surface'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{item.label}</div>
                                                <div className={`text-xs ${isPabeanActive ? 'text-accent-green/70' : 'text-silver-dark'}`}>
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                                                >
                                                    {pabeanSubMenuItems.map((subItem) => (
                                                        <Link
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            onClick={() => isMobile && setIsOpen(false)}
                                                            className={`block px-4 py-2 rounded-lg text-sm smooth-transition ${isActive(subItem.path)
                                                                ? 'bg-accent-green text-white'
                                                                : 'text-silver-dark hover:text-silver-light hover:bg-dark-surface'
                                                                }`}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            }

                            return <MenuLink key={item.path} item={item} isMobile={isMobile} />;
                        })}
                    </div>
                </div>

                {/* Fungsi Terpusat */}
                <div>
                    <h3 className="px-4 mb-3 text-xs font-semibold text-silver-dark uppercase tracking-wider">
                        Fungsi Terpusat
                    </h3>
                    <div className="space-y-1">
                        {centralizedMenuItems.map((item) => (
                            <MenuLink key={item.path} item={item} isMobile={isMobile} />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-dark-border text-center">
                <p className="text-xs text-silver-dark mb-0.5">
                    © 2024 Bakhtera-1 • v1.0.0
                </p>
                <a
                    href="https://logikai.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent-orange hover:text-accent-orange/80 transition-colors font-medium"
                >
                    By : LogikAi.studio
                </a>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-dark-card border border-dark-border text-silver hover:text-silver-light smooth-transition"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 glass-card border-r border-dark-border">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 glass-card border-r border-dark-border z-50 lg:hidden"
                        >
                            <SidebarContent isMobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
