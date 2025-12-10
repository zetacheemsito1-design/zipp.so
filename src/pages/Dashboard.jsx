import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Link2, MousePointer2, CheckCircle2, TrendingUp,
    Plus, ArrowRight, ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { getMyLinks } from '../lib/supabase';
import { formatDate, generateLinkUrl, copyToClipboard } from '../lib/utils';

export default function Dashboard() {
    const { user, profile } = useAuthStore();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

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

    const handleCopy = (id) => {
        copyToClipboard(generateLinkUrl(id));
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const stats = [
        { label: 'Total Links', value: links.length, icon: Link2, color: 'bg-zipp-accent/20 text-zipp-black' },
        { label: 'Total Clicks', value: totalClicks, icon: MousePointer2, color: 'bg-blue-100 text-blue-600' },
        { label: 'Conversiones', value: totalConversions, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
        { label: 'Conv. Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                        Hola, {user?.email?.split('@')[0]} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Aquí tienes un resumen de tu actividad
                    </p>
                </div>
                <Link to="/dashboard/links?create=true">
                    <Button variant="accent" className="w-full sm:w-auto">
                        <Plus size={18} /> Crear Zipp
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
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
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Links Limit */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-zipp-accent/10 to-emerald-100/50 border-zipp-accent/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900">Plan Gratuito</h3>
                        <p className="text-sm text-gray-600">
                            {profile?.links_count || 0} de {profile?.max_links || 10} links usados
                        </p>
                    </div>
                    <div className="flex-1 max-w-xs">
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                            <div
                                className="h-full bg-zipp-accent rounded-full transition-all duration-500"
                                style={{ width: `${((profile?.links_count || 0) / (profile?.max_links || 10)) * 100}%` }}
                            />
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-zipp-accent/30">
                        Upgrade
                    </Button>
                </div>
            </Card>

            {/* Recent Links */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Últimos Links</h2>
                    <Link to="/dashboard/links" className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        Ver todos <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl h-20 border border-gray-100" />
                        ))}
                    </div>
                ) : links.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Link2 size={28} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">No tienes links aún</h3>
                        <p className="text-gray-500 mb-6">Crea tu primer Zipp y empieza a monetizar</p>
                        <Link to="/dashboard/links?create=true">
                            <Button variant="accent">
                                <Plus size={18} /> Crear mi primer Zipp
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {links.slice(0, 5).map((link, i) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-4 hover:border-zipp-accent/30">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`https://cdn.brandfetch.io/${link.platform?.toLowerCase()}.com`}
                                            alt={link.platform}
                                            className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{link.title}</h4>
                                            <p className="text-sm text-gray-500">{link.platform} • {formatDate(link.created_at)}</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-bold text-gray-900">{link.clicks || 0}</p>
                                                <p className="text-gray-500 text-xs">clicks</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-gray-900">{link.conversions || 0}</p>
                                                <p className="text-gray-500 text-xs">conv.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCopy(link.id)}
                                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                            >
                                                {copied === link.id ? <CheckCircle2 size={18} className="text-green-500" /> : <Link2 size={18} />}
                                            </button>
                                            <a
                                                href={generateLinkUrl(link.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
