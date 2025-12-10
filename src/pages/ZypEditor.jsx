import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    User, Palette, Link2, Plus, Trash2, GripVertical, Save, Eye,
    ExternalLink, Check, AlertCircle, Loader2, Image, Type, Music,
    Instagram, Twitter, Youtube, Github, Music2, Globe, Sparkles,
    Linkedin, Twitch, MessageCircle, Mail, Smartphone, Monitor, Code
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import {
    getMyZypPage, createZypPage, updateZypPage,
    createZypBlock, updateZypBlock, deleteZypBlock, checkUsernameAvailable, reorderZypBlocks
} from '../lib/supabase';
import { AvatarUpload } from '../components/ui/ImageUpload';

const THEMES = [
    { id: 'default', name: 'Light', bg: '#ffffff', text: '#000000', accent: '#9bdbc1' },
    { id: 'dark', name: 'Dark', bg: '#0a0a0a', text: '#ffffff', accent: '#9bdbc1' },
    { id: 'midnight', name: 'Midnight', bg: '#1a1a2e', text: '#ffffff', accent: '#7c3aed' },
    { id: 'sunset', name: 'Sunset', bg: '#fef3c7', text: '#1f2937', accent: '#f59e0b' },
    { id: 'forest', name: 'Forest', bg: '#064e3b', text: '#ffffff', accent: '#10b981' },
    { id: 'ocean', name: 'Ocean', bg: '#0c4a6e', text: '#ffffff', accent: '#0ea5e9' },
    { id: 'rose', name: 'Rose', bg: '#fdf2f8', text: '#831843', accent: '#ec4899' },
    { id: 'lavender', name: 'Lavender', bg: '#faf5ff', text: '#581c87', accent: '#a855f7' },
];

const BG_STYLES = [
    { id: 'solid', name: 'Solid' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'animated', name: 'Animated' },
];

const BUTTON_STYLES = [
    { id: 'rounded', name: 'Rounded', class: 'rounded-2xl' },
    { id: 'pill', name: 'Pill', class: 'rounded-full' },
    { id: 'square', name: 'Square', class: 'rounded-lg' },
    { id: 'outline', name: 'Outline', class: 'rounded-2xl border-2 bg-transparent' },
    { id: 'shadow', name: 'Shadow', class: 'rounded-2xl shadow-lg' },
    { id: 'glow', name: 'Glow', class: 'rounded-2xl shadow-lg shadow-current' },
];

const FONTS = [
    { id: 'Inter', name: 'Inter' },
    { id: 'Georgia', name: 'Georgia' },
    { id: 'monospace', name: 'Mono' },
    { id: 'system-ui', name: 'System' },
];

const BLOCK_TYPES = [
    { id: 'link', name: 'Link', icon: Link2 },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'header', name: 'Header', icon: Type },
    { id: 'embed', name: 'Embed', icon: Music },
    { id: 'image', name: 'Image', icon: Image },
    { id: 'html', name: 'HTML', icon: Code },
    { id: 'divider', name: 'Divider', icon: GripVertical },
];

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: '#000000' },
    { id: 'twitch', name: 'Twitch', icon: Twitch, color: '#9146FF' },
    { id: 'github', name: 'GitHub', icon: Github, color: '#181717' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'spotify', name: 'Spotify', icon: Music2, color: '#1DB954' },
    { id: 'discord', name: 'Discord', icon: MessageCircle, color: '#5865F2' },
    { id: 'email', name: 'Email', icon: Mail, color: '#EA4335' },
    { id: 'website', name: 'Website', icon: Globe, color: '#000000' },
];

// Sortable Block Item Component
function SortableBlock({ block, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getBlockIcon = () => {
        switch (block.type) {
            case 'link': return <Link2 size={18} className="text-zipp-accent" />;
            case 'text': return <Type size={18} className="text-zipp-accent" />;
            case 'header': return <Type size={22} className="text-zipp-accent" />;
            case 'embed': return <Music size={18} className="text-zipp-accent" />;
            case 'image': return <Image size={18} className="text-zipp-accent" />;
            case 'html': return <Code size={18} className="text-zipp-accent" />;
            default: return <GripVertical size={18} className="text-zipp-accent" />;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded-lg">
                    <GripVertical size={18} className="text-gray-400" />
                </button>
                <div className="w-10 h-10 bg-zipp-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    {getBlockIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{block.title || block.type}</p>
                    <p className="text-xs text-gray-500 capitalize">{block.type}</p>
                </div>
                <button onClick={() => onEdit(block)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <Palette size={16} />
                </button>
                <button onClick={() => onDelete(block.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default function ZypEditor() {
    const { user, profile } = useAuthStore();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [previewMode, setPreviewMode] = useState('desktop'); // desktop | mobile

    // Form state
    const [setupUsername, setSetupUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [theme, setTheme] = useState('default');
    const [bgStyle, setBgStyle] = useState('solid');
    const [accentColor, setAccentColor] = useState('#9bdbc1');
    const [buttonStyle, setButtonStyle] = useState('rounded');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [socialLinks, setSocialLinks] = useState([]);
    const [customCss, setCustomCss] = useState('');
    const [customHtml, setCustomHtml] = useState('');

    // Block modal
    const [blockModal, setBlockModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [blockType, setBlockType] = useState('link');
    const [blockTitle, setBlockTitle] = useState('');
    const [blockUrl, setBlockUrl] = useState('');
    const [blockContent, setBlockContent] = useState('');

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadPage();
    }, []);

    useEffect(() => {
        if (setupUsername.length >= 3) {
            const timer = setTimeout(checkUsername, 500);
            return () => clearTimeout(timer);
        } else {
            setUsernameAvailable(null);
        }
    }, [setupUsername]);

    const loadPage = async () => {
        try {
            const data = await getMyZypPage();
            if (data) {
                setPage(data);
                setDisplayName(data.display_name || '');
                setBio(data.bio || '');
                setAvatarUrl(data.avatar_url || '');
                setTheme(data.theme || 'default');
                setBgStyle(data.bg_type || 'solid');
                setAccentColor(data.accent_color || '#9bdbc1');
                setButtonStyle(data.button_style || 'rounded');
                setFontFamily(data.font_family || 'Inter');
                setSocialLinks(data.social_links || []);
                setCustomCss(data.custom_css || '');
                setCustomHtml(data.custom_html || '');
                setBlocks(data.zyp_blocks?.sort((a, b) => a.position - b.position) || []);
            } else {
                setShowSetup(true);
            }
        } catch (error) {
            console.error('Error loading ZYP page:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUsername = async () => {
        setCheckingUsername(true);
        try {
            const available = await checkUsernameAvailable(setupUsername.toLowerCase());
            setUsernameAvailable(available);
        } catch (error) {
            console.error('Error checking username:', error);
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleCreatePage = async () => {
        if (!setupUsername || !usernameAvailable) return;
        setSaving(true);
        try {
            const newPage = await createZypPage({
                username: setupUsername.toLowerCase(),
                display_name: displayName || setupUsername,
                theme: 'default',
                accent_color: '#9bdbc1'
            });
            setPage(newPage);
            setShowSetup(false);
        } catch (error) {
            console.error('Error creating page:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!page) return;
        setSaving(true);
        try {
            await updateZypPage(page.id, {
                display_name: displayName,
                bio,
                avatar_url: avatarUrl,
                theme,
                bg_type: bgStyle,
                accent_color: accentColor,
                button_style: buttonStyle,
                font_family: fontFamily,
                social_links: socialLinks,
                custom_css: customCss,
                custom_html: customHtml
            });
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id);
            const newIndex = blocks.findIndex(b => b.id === over.id);
            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            setBlocks(newBlocks);

            // Update positions in DB
            try {
                const updates = newBlocks.map((block, idx) => ({ id: block.id, position: idx }));
                await reorderZypBlocks(updates);
            } catch (error) {
                console.error('Error reordering:', error);
            }
        }
    };

    const handleAddBlock = () => {
        setEditingBlock(null);
        setBlockType('link');
        setBlockTitle('');
        setBlockUrl('');
        setBlockContent('');
        setBlockModal(true);
    };

    const handleEditBlock = (block) => {
        setEditingBlock(block);
        setBlockType(block.type);
        setBlockTitle(block.title || '');
        setBlockUrl(block.url || '');
        setBlockContent(block.content?.text || block.content?.html || '');
        setBlockModal(true);
    };

    const handleSaveBlock = async () => {
        if (blocks.length >= 5 && !editingBlock) {
            alert('Límite de 5 blocks alcanzado');
            return;
        }

        const blockData = {
            type: blockType,
            title: blockTitle,
            url: blockUrl,
            content: blockType === 'html' ? { html: blockContent } : { text: blockContent },
            position: editingBlock ? editingBlock.position : blocks.length
        };

        try {
            if (editingBlock) {
                const updated = await updateZypBlock(editingBlock.id, blockData);
                setBlocks(blocks.map(b => b.id === editingBlock.id ? updated : b));
            } else {
                const newBlock = await createZypBlock(page.id, blockData);
                setBlocks([...blocks, newBlock]);
            }
            setBlockModal(false);
        } catch (error) {
            console.error('Error saving block:', error);
        }
    };

    const handleDeleteBlock = async (id) => {
        if (!confirm('¿Eliminar este block?')) return;
        try {
            await deleteZypBlock(id);
            setBlocks(blocks.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting block:', error);
        }
    };

    const updateSocialLink = (platform, url) => {
        const existing = socialLinks.find(s => s.platform === platform);
        if (existing) {
            if (!url) {
                setSocialLinks(socialLinks.filter(s => s.platform !== platform));
            } else {
                setSocialLinks(socialLinks.map(s => s.platform === platform ? { ...s, url } : s));
            }
        } else if (url) {
            setSocialLinks([...socialLinks, { platform, url }]);
        }
    };

    const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
    const currentButtonStyle = BUTTON_STYLES.find(b => b.id === buttonStyle) || BUTTON_STYLES[0];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-zipp-accent" size={32} />
            </div>
        );
    }

    if (showSetup) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-zipp-accent to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Your ZYP</h1>
                        <p className="text-gray-500">Tu página personal en zipp.so/u/username</p>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">zipp.so/u/</span>
                                    <input
                                        type="text"
                                        value={setupUsername}
                                        onChange={(e) => setSetupUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                                        placeholder="username"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 pl-28 font-bold outline-none"
                                        maxLength={20}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {checkingUsername && <Loader2 className="animate-spin text-gray-400" size={20} />}
                                        {!checkingUsername && usernameAvailable === true && <Check className="text-green-500" size={20} />}
                                        {!checkingUsername && usernameAvailable === false && <AlertCircle className="text-red-500" size={20} />}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 outline-none"
                                />
                            </div>

                            <Button
                                variant="accent"
                                onClick={handleCreatePage}
                                loading={saving}
                                disabled={!usernameAvailable || setupUsername.length < 3}
                                className="w-full py-4 text-lg"
                            >
                                <Sparkles size={20} /> Create My ZYP
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Editor Panel */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">ZYP Editor</h1>
                            <a href={`/u/${page?.username}`} target="_blank" className="text-zipp-accent hover:underline text-sm font-medium">
                                zipp.so/u/{page?.username} ↗
                            </a>
                        </div>
                        <div className="flex gap-2">
                            <a href={`/u/${page?.username}`} target="_blank">
                                <Button variant="outline" size="sm"><Eye size={16} /></Button>
                            </a>
                            <Button variant="accent" onClick={handleSave} loading={saving}>
                                <Save size={16} /> Guardar
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                        {[
                            { id: 'profile', label: '👤 Perfil' },
                            { id: 'blocks', label: '📦 Blocks' },
                            { id: 'style', label: '🎨 Estilo' },
                            { id: 'code', label: '</> Código' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Información</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <AvatarUpload
                                            value={avatarUrl}
                                            onChange={setAvatarUrl}
                                            size="lg"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-1">Foto de perfil</p>
                                            <p className="text-xs text-gray-500">Arrastra una imagen o haz click para subir. JPG, PNG hasta 5MB.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={3}
                                            maxLength={200}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none resize-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Redes Sociales</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {SOCIAL_PLATFORMS.map(platform => {
                                        const Icon = platform.icon;
                                        const value = socialLinks.find(s => s.platform === platform.id)?.url || '';
                                        return (
                                            <div key={platform.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${platform.color}20` }}>
                                                    <Icon size={16} style={{ color: platform.color }} />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={value}
                                                    onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                                                    placeholder={platform.name}
                                                    className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Blocks Tab with Drag & Drop */}
                    {activeTab === 'blocks' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">{blocks.length}/5 blocks • Arrastra para reordenar</p>
                                <Button variant="accent" size="sm" onClick={handleAddBlock} disabled={blocks.length >= 5}>
                                    <Plus size={16} /> Agregar
                                </Button>
                            </div>

                            {blocks.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Plus size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">Sin blocks</h3>
                                    <p className="text-gray-500 mb-4">Agrega links, texto o embeds</p>
                                    <Button variant="accent" onClick={handleAddBlock}>
                                        <Plus size={16} /> Agregar Block
                                    </Button>
                                </Card>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {blocks.map(block => (
                                                <SortableBlock
                                                    key={block.id}
                                                    block={block}
                                                    onEdit={handleEditBlock}
                                                    onDelete={handleDeleteBlock}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </motion.div>
                    )}

                    {/* Style Tab */}
                    {activeTab === 'style' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Tema</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {THEMES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-3 rounded-xl border-2 transition-all ${theme === t.id ? 'border-zipp-accent scale-105' : 'border-gray-100'
                                                }`}
                                            style={{ background: t.bg }}
                                        >
                                            <div className="w-full h-4 rounded" style={{ background: t.accent }}></div>
                                            <p className="text-[10px] mt-1 truncate" style={{ color: t.text }}>{t.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Color Accent</h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={accentColor}
                                        onChange={(e) => setAccentColor(e.target.value)}
                                        className="w-14 h-14 rounded-xl cursor-pointer"
                                    />
                                    <div className="flex gap-2">
                                        {['#9bdbc1', '#ec4899', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setAccentColor(c)}
                                                className={`w-10 h-10 rounded-xl ${accentColor === c ? 'ring-2 ring-gray-400' : ''}`}
                                                style={{ background: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Fondo</h3>
                                <div className="flex gap-2">
                                    {BG_STYLES.map(bg => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setBgStyle(bg.id)}
                                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium ${bgStyle === bg.id ? 'border-zipp-accent bg-zipp-accent/10' : 'border-gray-100'
                                                }`}
                                        >
                                            {bg.name}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Botones</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {BUTTON_STYLES.map(btn => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setButtonStyle(btn.id)}
                                            className={`p-3 text-xs font-medium border-2 ${buttonStyle === btn.id ? 'border-zipp-accent' : 'border-gray-100'
                                                } ${btn.class}`}
                                        >
                                            {btn.name}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Fuente</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {FONTS.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFontFamily(f.id)}
                                            className={`p-3 rounded-xl border-2 text-sm ${fontFamily === f.id ? 'border-zipp-accent' : 'border-gray-100'
                                                }`}
                                            style={{ fontFamily: f.id }}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Code Tab (CSS + HTML) */}
                    {activeTab === 'code' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-2">CSS Personalizado</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Clases disponibles: .zyp-container, .zyp-avatar, .zyp-name, .zyp-bio, .zyp-button, .zyp-social
                                </p>
                                <textarea
                                    value={customCss}
                                    onChange={(e) => setCustomCss(e.target.value)}
                                    rows={10}
                                    placeholder={`/* Ejemplo */
.zyp-container {
  background: linear-gradient(to bottom, #000, #111);
}

.zyp-button {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.zyp-button:hover {
  transform: translateY(-2px);
}`}
                                    className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-zipp-accent"
                                    spellCheck="false"
                                />
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-2">HTML Personalizado</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Se insertará al final de tu página. Puedes usar para analytics, widgets, etc.
                                </p>
                                <textarea
                                    value={customHtml}
                                    onChange={(e) => setCustomHtml(e.target.value)}
                                    rows={6}
                                    placeholder={`<!-- Ejemplo: Widget de música -->
<div style="position: fixed; bottom: 20px; right: 20px;">
  <iframe src="..." />
</div>

<!-- Google Analytics -->
<script>...</script>`}
                                    className="w-full bg-gray-900 text-blue-400 font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-zipp-accent"
                                    spellCheck="false"
                                />
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="hidden lg:flex w-[420px] bg-gray-100 p-6 flex-col border-l border-gray-200 sticky top-0 h-screen overflow-hidden">
                {/* Preview Controls */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Preview</p>
                    <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-gray-100' : ''}`}
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-gray-100' : ''}`}
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>
                </div>

                {/* Preview Frame */}
                <div className="flex-1 flex items-start justify-center overflow-y-auto">
                    <div
                        className={`transition-all duration-300 ${previewMode === 'mobile' ? 'w-[280px]' : 'w-full max-w-[360px]'
                            }`}
                    >
                        {/* Phone Frame (mobile only) */}
                        <div className={`${previewMode === 'mobile' ? 'bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl' : ''}`}>
                            {previewMode === 'mobile' && (
                                <div className="bg-gray-900 rounded-t-[2rem] pt-4 pb-1">
                                    <div className="w-16 h-4 bg-black rounded-full mx-auto"></div>
                                </div>
                            )}
                            <div
                                className={`zyp-container overflow-hidden ${previewMode === 'mobile' ? 'rounded-[1.5rem]' : 'rounded-2xl shadow-xl'}`}
                                style={{
                                    background: bgStyle === 'gradient'
                                        ? `linear-gradient(135deg, ${currentTheme.bg}, ${accentColor}40)`
                                        : bgStyle === 'animated'
                                            ? `linear-gradient(-45deg, ${accentColor}, ${currentTheme.bg}, ${accentColor}80, ${currentTheme.bg})`
                                            : currentTheme.bg,
                                    color: currentTheme.text,
                                    fontFamily: fontFamily,
                                    minHeight: previewMode === 'mobile' ? '500px' : '600px',
                                    backgroundSize: bgStyle === 'animated' ? '400% 400%' : 'auto',
                                    animation: bgStyle === 'animated' ? 'gradient-animation 15s ease infinite' : 'none',
                                }}
                            >
                                {/* Custom CSS */}
                                {customCss && <style>{customCss}</style>}

                                <div className="p-6 pt-8 text-center">
                                    {/* Avatar */}
                                    <div
                                        className="zyp-avatar w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden shadow-xl ring-4"
                                        style={{ background: avatarUrl ? 'transparent' : accentColor, ringColor: `${accentColor}40` }}
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: currentTheme.bg }}>
                                                {displayName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="zyp-name text-xl font-bold mb-1">{displayName || 'Tu Nombre'}</h2>
                                    <p className="zyp-bio text-sm opacity-70 mb-4 px-2">{bio || 'Tu bio aquí...'}</p>

                                    {/* Social Icons */}
                                    {socialLinks.filter(s => s.url).length > 0 && (
                                        <div className="zyp-social flex justify-center gap-2 mb-6 flex-wrap">
                                            {socialLinks.filter(s => s.url).map(s => {
                                                const p = SOCIAL_PLATFORMS.find(pl => pl.id === s.platform);
                                                if (!p) return null;
                                                const Icon = p.icon;
                                                return (
                                                    <div key={s.platform} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${p.color}20` }}>
                                                        <Icon size={18} style={{ color: p.color }} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Blocks */}
                                    <div className="space-y-3">
                                        {blocks.filter(b => b.is_visible !== false).map(block => (
                                            <div
                                                key={block.id}
                                                className={`zyp-button p-4 text-center font-medium ${currentButtonStyle.class}`}
                                                style={{
                                                    background: buttonStyle === 'outline' ? 'transparent' : `${accentColor}25`,
                                                    borderColor: accentColor,
                                                    color: currentTheme.text
                                                }}
                                            >
                                                {block.title || block.type}
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-[10px] opacity-30 mt-8">zipp.so</p>
                                </div>

                                {/* Custom HTML */}
                                {customHtml && <div dangerouslySetInnerHTML={{ __html: customHtml }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Modal */}
            <Modal isOpen={blockModal} onClose={() => setBlockModal(false)} title={editingBlock ? 'Editar Block' : 'Agregar Block'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <div className="grid grid-cols-4 gap-2">
                            {BLOCK_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setBlockType(type.id)}
                                    className={`p-3 rounded-xl border-2 ${blockType === type.id ? 'border-zipp-accent bg-zipp-accent/10' : 'border-gray-200'
                                        }`}
                                >
                                    <type.icon size={18} className="mx-auto mb-1" />
                                    <p className="text-[10px]">{type.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {blockType !== 'divider' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={blockTitle}
                                onChange={(e) => setBlockTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none"
                            />
                        </div>
                    )}

                    {(blockType === 'link' || blockType === 'embed' || blockType === 'image') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                            <input
                                type="url"
                                value={blockUrl}
                                onChange={(e) => setBlockUrl(e.target.value)}
                                placeholder={blockType === 'embed' ? 'YouTube, Spotify...' : 'https://...'}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none"
                            />
                        </div>
                    )}

                    {(blockType === 'text' || blockType === 'header') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                            <textarea
                                value={blockContent}
                                onChange={(e) => setBlockContent(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none resize-none"
                            />
                        </div>
                    )}

                    {blockType === 'html' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">HTML</label>
                            <textarea
                                value={blockContent}
                                onChange={(e) => setBlockContent(e.target.value)}
                                rows={6}
                                placeholder="<div>...</div>"
                                className="w-full bg-gray-900 text-blue-400 font-mono text-sm rounded-xl p-3 focus:outline-none"
                                spellCheck="false"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setBlockModal(false)} className="flex-1">Cancelar</Button>
                        <Button variant="accent" onClick={handleSaveBlock} className="flex-1">
                            {editingBlock ? 'Guardar' : 'Agregar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Animation Styles */}
            <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </div>
    );
}
