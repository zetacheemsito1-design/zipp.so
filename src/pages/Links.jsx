import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Link2, ExternalLink, Trash2, Edit3, CheckCircle2,
    ChevronDown, Copy, MoreVertical, Search, Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import { getMyLinks, createLink, updateLink, deleteLink } from '../lib/supabase';
import { formatDate, generateLinkUrl, copyToClipboard } from '../lib/utils';

const PLATFORMS = [
    { id: 'roblox', name: 'Roblox', domain: 'roblox.com', actions: ['Join Group', 'Play Game'] },
    { id: 'youtube', name: 'YouTube', domain: 'youtube.com', actions: ['Subscribe', 'Like Video', 'Watch'] },
    { id: 'twitter', name: 'X / Twitter', domain: 'twitter.com', actions: ['Follow', 'Repost'] },
    { id: 'pinterest', name: 'Pinterest', domain: 'pinterest.com', actions: ['Save Pin'] },
    { id: 'discord', name: 'Discord', domain: 'discord.com', actions: ['Join Server'] },
    { id: 'tiktok', name: 'TikTok', domain: 'tiktok.com', actions: ['Follow', 'Like'] },
    { id: 'twitch', name: 'Twitch', domain: 'twitch.tv', actions: ['Follow', 'Subscribe'] },
    { id: 'spotify', name: 'Spotify', domain: 'spotify.com', actions: ['Follow Artist'] },
    { id: 'github', name: 'GitHub', domain: 'github.com', actions: ['Star Repo', 'Follow'] },
];

export default function Links() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { profile, canCreateLink, remainingLinks } = useAuthStore();

    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [copied, setCopied] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(searchParams.get('create') === 'true');
    const [editingLink, setEditingLink] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [destinationUrl, setDestinationUrl] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
    const [selectedAction, setSelectedAction] = useState(PLATFORMS[0].actions[0]);
    const [targetUrl, setTargetUrl] = useState('');

    useEffect(() => {
        loadLinks();
    }, []);

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setModalOpen(true);
            setSearchParams({});
        }
    }, [searchParams]);

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

    const resetForm = () => {
        setTitle('');
        setDestinationUrl('');
        setSelectedPlatform(PLATFORMS[0]);
        setSelectedAction(PLATFORMS[0].actions[0]);
        setTargetUrl('');
        setEditingLink(null);
    };

    const openCreateModal = () => {
        if (!canCreateLink()) {
            alert('Has alcanzado el límite de links. Actualiza tu plan para crear más.');
            return;
        }
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (link) => {
        setEditingLink(link);
        setTitle(link.title);
        setDestinationUrl(link.destination_url);
        const platform = PLATFORMS.find(p => p.name === link.platform) || PLATFORMS[0];
        setSelectedPlatform(platform);
        setSelectedAction(link.action_type || platform.actions[0]);
        setTargetUrl(link.target_url || '');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !destinationUrl) return;

        setSaving(true);
        try {
            const linkData = {
                title,
                destination_url: destinationUrl,
                platform: selectedPlatform.name,
                action_type: selectedAction,
                target_url: targetUrl,
            };

            if (editingLink) {
                await updateLink(editingLink.id, linkData);
            } else {
                await createLink(linkData);
            }

            await loadLinks();
            setModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving link:', error);
            alert('Error al guardar el link');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este link?')) return;

        try {
            await deleteLink(id);
            setLinks(links.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const handleCopy = (id) => {
        copyToClipboard(generateLinkUrl(id));
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredLinks = links.filter(link =>
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.platform.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                        My Links
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {remainingLinks()} links restantes
                    </p>
                </div>
                <Button variant="accent" onClick={openCreateModal}>
                    <Plus size={18} /> Crear Zipp
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar links..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 pl-12 font-medium outline-none focus:border-zipp-accent transition-colors"
                    />
                </div>
            </div>

            {/* Links Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : filteredLinks.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Link2 size={28} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                        {search ? 'No se encontraron resultados' : 'No tienes links aún'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {search ? 'Intenta con otra búsqueda' : 'Crea tu primer Zipp y empieza a monetizar'}
                    </p>
                    {!search && (
                        <Button variant="accent" onClick={openCreateModal}>
                            <Plus size={18} /> Crear mi primer Zipp
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredLinks.map((link, i) => (
                        <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Card className="p-5 hover:border-zipp-accent/30 group">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={`https://cdn.brandfetch.io/${link.platform?.toLowerCase().replace('x / ', '')}.com`}
                                        alt={link.platform}
                                        className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-2"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{link.title}</h4>
                                        <p className="text-sm text-gray-500 truncate">
                                            {link.platform} • {link.action_type} • {formatDate(link.created_at)}
                                        </p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-8 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900 text-lg">{link.clicks || 0}</p>
                                            <p className="text-gray-500 text-xs">clicks</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900 text-lg">{link.conversions || 0}</p>
                                            <p className="text-gray-500 text-xs">conv.</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900 text-lg">
                                                {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(0) : 0}%
                                            </p>
                                            <p className="text-gray-500 text-xs">rate</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleCopy(link.id)}
                                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                            title="Copiar link"
                                        >
                                            {copied === link.id ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                        <a
                                            href={generateLinkUrl(link.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                            title="Abrir link"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => openEditModal(link)}
                                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                                            title="Editar"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="p-2.5 hover:bg-red-50 rounded-xl transition-colors text-gray-500 hover:text-red-600"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); resetForm(); }}
                title={editingLink ? 'Editar Zipp' : 'Crear nuevo Zipp'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Get my Script"
                            required
                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 font-medium outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Plataforma</label>
                        <div className="grid grid-cols-5 gap-2">
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { setSelectedPlatform(p); setSelectedAction(p.actions[0]); }}
                                    className={`aspect-square rounded-xl flex items-center justify-center p-2 transition-all border-2 ${selectedPlatform.id === p.id
                                            ? 'border-zipp-black bg-gray-50 shadow-md scale-105'
                                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <img src={`https://cdn.brandfetch.io/${p.domain}`} alt={p.name} className="w-6 h-6 object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Acción requerida</label>
                        <div className="relative">
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border-2 border-transparent rounded-2xl p-4 pr-10 font-medium focus:bg-white focus:border-zipp-accent outline-none cursor-pointer"
                            >
                                {selectedPlatform.actions.map(a => <option key={a}>{a}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">URL de destino</label>
                        <input
                            type="url"
                            value={destinationUrl}
                            onChange={(e) => setDestinationUrl(e.target.value)}
                            placeholder="https://..."
                            required
                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 font-medium outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Link que se desbloqueará al completar la acción</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">URL de la acción (opcional)</label>
                        <input
                            type="url"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="Ej: tu canal de YouTube"
                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 font-medium outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="accent" loading={saving} className="flex-1">
                            {editingLink ? 'Guardar cambios' : 'Crear Zipp'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
