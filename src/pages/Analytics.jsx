import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, MousePointer2, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { getMyLinks } from '../lib/supabase';

export default function Analytics() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7d');

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            const data = await getMyLinks();
            setLinks(data || []);
        } catch (error) {
            console.error('Error loading links:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalClicks = links.reduce((acc, link) => acc + (link.clicks || 0), 0);
    const totalConversions = links.reduce((acc, link) => acc + (link.conversions || 0), 0);
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;

    // Sort links by clicks
    const topLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

    // Platform breakdown
    const platformStats = links.reduce((acc, link) => {
        const platform = link.platform || 'Other';
        if (!acc[platform]) {
            acc[platform] = { clicks: 0, conversions: 0, count: 0 };
        }
        acc[platform].clicks += link.clicks || 0;
        acc[platform].conversions += link.conversions || 0;
        acc[platform].count += 1;
        return acc;
    }, {});

    const platformData = Object.entries(platformStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.clicks - a.clicks);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                        Analytics
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Estadísticas de rendimiento de tus links
                    </p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    {['7d', '30d', 'all'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${period === p ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Clicks', value: totalClicks, icon: MousePointer2, color: 'bg-blue-100 text-blue-600', change: '+12%' },
                    { label: 'Conversiones', value: totalConversions, icon: CheckCircle2, color: 'bg-green-100 text-green-600', change: '+8%' },
                    { label: 'Conv. Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600', change: '+2%' },
                    { label: 'Links Activos', value: links.filter(l => l.is_active).length, icon: BarChart3, color: 'bg-orange-100 text-orange-600', change: '' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                                    {stat.change && (
                                        <p className="text-xs text-green-600 font-medium mt-1">{stat.change} vs anterior</p>
                                    )}
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Top Links */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Links</h2>
                    <Card className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando...</div>
                        ) : topLinks.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No hay datos aún</div>
                        ) : (
                            topLinks.map((link, i) => (
                                <div key={link.id} className="p-4 flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{link.title}</p>
                                        <p className="text-sm text-gray-500">{link.platform}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{link.clicks || 0}</p>
                                        <p className="text-xs text-gray-500">clicks</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>

                {/* Platform Breakdown */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Por Plataforma</h2>
                    <Card className="p-6">
                        {platformData.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No hay datos aún</div>
                        ) : (
                            <div className="space-y-4">
                                {platformData.map((platform) => {
                                    const percentage = totalClicks > 0 ? (platform.clicks / totalClicks) * 100 : 0;
                                    return (
                                        <div key={platform.name}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`https://cdn.brandfetch.io/${platform.name.toLowerCase().replace('x / ', '')}.com`}
                                                        alt={platform.name}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/24'}
                                                    />
                                                    <span className="font-medium text-gray-900">{platform.name}</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{platform.clicks} clicks</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="h-full bg-zipp-accent rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
