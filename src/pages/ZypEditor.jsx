import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Palette, Link2, Plus, Trash2, GripVertical, Save, Eye,
    ExternalLink, Check, AlertCircle, Loader2, Image, Type, Music,
    Instagram, Twitter, Youtube, Github, Music2, Globe, Sparkles,
    Linkedin, Twitch, MessageCircle, Mail, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import {
    getMyZypPage, createZypPage, updateZypPage,
    createZypBlock, updateZypBlock, deleteZypBlock, checkUsernameAvailable
} from '../lib/supabase';

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
    { id: 'solid', name: 'Solid', preview: 'bg-gray-200' },
    { id: 'gradient', name: 'Gradient', preview: 'bg-gradient-to-br from-gray-200 to-gray-400' },
    { id: 'animated', name: 'Animated', preview: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' },
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
    { id: 'Inter', name: 'Inter (Modern)' },
    { id: 'Georgia', name: 'Georgia (Elegant)' },
    { id: 'Courier New', name: 'Courier (Retro)' },
    { id: 'Comic Sans MS', name: 'Comic Sans (Fun)' },
];

const BLOCK_TYPES = [
    { id: 'link', name: 'Link', icon: Link2 },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'embed', name: 'Embed', icon: Music },
    { id: 'image', name: 'Image', icon: Image },
    { id: 'divider', name: 'Divider', icon: GripVertical },
];

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
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

export default function ZypEditor() {
    const { user, profile } = useAuthStore();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Setup form
    const [setupUsername, setSetupUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Page form
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

    // Block modal
    const [blockModal, setBlockModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [blockType, setBlockType] = useState('link');
    const [blockTitle, setBlockTitle] = useState('');
    const [blockUrl, setBlockUrl] = useState('');
    const [blockContent, setBlockContent] = useState('');
    const [blockIcon, setBlockIcon] = useState('');

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
            alert('Error al crear la página');
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
                custom_css: customCss
            });
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleAddBlock = () => {
        setEditingBlock(null);
        setBlockType('link');
        setBlockTitle('');
        setBlockUrl('');
        setBlockContent('');
        setBlockIcon('');
        setBlockModal(true);
    };

    const handleEditBlock = (block) => {
        setEditingBlock(block);
        setBlockType(block.type);
        setBlockTitle(block.title || '');
        setBlockUrl(block.url || '');
        setBlockContent(block.content?.text || '');
        setBlockIcon(block.icon || '');
        setBlockModal(true);
    };

    const handleSaveBlock = async () => {
        if (blocks.length >= 5 && !editingBlock) {
            alert('Has alcanzado el límite de 5 blocks. Upgrade para más.');
            return;
        }

        const blockData = {
            type: blockType,
            title: blockTitle,
            url: blockUrl,
            icon: blockIcon,
            content: { text: blockContent },
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

    // Setup screen
    if (showSetup) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-zipp-accent to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-zipp-accent/30">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Your ZYP</h1>
                        <p className="text-gray-500">Tu página personal única en zipp.so/u/username</p>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Choose your username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">zipp.so/u/</span>
                                    <input
                                        type="text"
                                        value={setupUsername}
                                        onChange={(e) => setSetupUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                                        placeholder="username"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 pl-28 font-bold outline-none transition-all"
                                        maxLength={20}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {checkingUsername && <Loader2 className="animate-spin text-gray-400" size={20} />}
                                        {!checkingUsername && usernameAvailable === true && <Check className="text-green-500" size={20} />}
                                        {!checkingUsername && usernameAvailable === false && <AlertCircle className="text-red-500" size={20} />}
                                    </div>
                                </div>
                                {usernameAvailable === false && (
                                    <p className="text-sm text-red-500 mt-2">Este username ya está tomado</p>
                                )}
                                {usernameAvailable === true && (
                                    <p className="text-sm text-green-500 mt-2">¡Disponible! ✓</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Tu nombre o marca"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 font-medium outline-none transition-all"
                                />
                            </div>

                            <Button
                                variant="accent"
                                onClick={handleCreatePage}
                                loading={saving}
                                disabled={!usernameAvailable || setupUsername.length < 3}
                                className="w-full py-4 text-lg"
                            >
                                <Sparkles size={20} /> Create My ZYP Page
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
                            <a href={`/u/${page?.username}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm"><Eye size={16} /></Button>
                            </a>
                            <Button variant="accent" onClick={handleSave} loading={saving}>
                                <Save size={16} /> Save
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                        {['profile', 'blocks', 'style', 'social'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'style' ? '🎨 Style' : tab === 'social' ? '🔗 Social' : tab === 'profile' ? '👤 Profile' : '📦 Blocks'}
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Profile Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Tip: Usa imgur.com o similar para hostear tu imagen</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
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
                                            placeholder="Cuéntale al mundo sobre ti..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none resize-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Social Tab */}
                    {activeTab === 'social' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Social Links</h3>
                                <p className="text-sm text-gray-500 mb-4">Agrega tus redes sociales. Aparecerán como iconos debajo de tu bio.</p>
                                <div className="space-y-3">
                                    {SOCIAL_PLATFORMS.map(platform => {
                                        const Icon = platform.icon;
                                        const hasValue = socialLinks.find(s => s.platform === platform.id)?.url;
                                        return (
                                            <div key={platform.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${hasValue ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ background: `${platform.color}20` }}
                                                >
                                                    <Icon size={20} style={{ color: platform.color }} />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={socialLinks.find(s => s.platform === platform.id)?.url || ''}
                                                    onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                                                    placeholder={`${platform.name} URL`}
                                                    className="flex-1 bg-transparent border-none p-0 text-sm focus:outline-none"
                                                />
                                                {hasValue && <Check size={16} className="text-green-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Blocks Tab */}
                    {activeTab === 'blocks' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">{blocks.length}/5 blocks</p>
                                <Button variant="accent" size="sm" onClick={handleAddBlock} disabled={blocks.length >= 5}>
                                    <Plus size={16} /> Add Block
                                </Button>
                            </div>

                            {blocks.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Plus size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">No blocks yet</h3>
                                    <p className="text-gray-500 mb-4">Add links, text, or embeds to your page</p>
                                    <Button variant="accent" onClick={handleAddBlock}>
                                        <Plus size={16} /> Add First Block
                                    </Button>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {blocks.map((block, i) => (
                                        <Card key={block.id} className="p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <GripVertical size={18} className="text-gray-300 cursor-grab shrink-0" />
                                                <div className="w-10 h-10 bg-zipp-accent/10 rounded-xl flex items-center justify-center shrink-0">
                                                    {block.type === 'link' && <Link2 size={18} className="text-zipp-accent" />}
                                                    {block.type === 'text' && <Type size={18} className="text-zipp-accent" />}
                                                    {block.type === 'embed' && <Music size={18} className="text-zipp-accent" />}
                                                    {block.type === 'image' && <Image size={18} className="text-zipp-accent" />}
                                                    {block.type === 'divider' && <GripVertical size={18} className="text-zipp-accent" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{block.title || 'Untitled'}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{block.type}</p>
                                                </div>
                                                <button onClick={() => handleEditBlock(block)} className="p-2 hover:bg-gray-100 rounded-xl">
                                                    <Palette size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteBlock(block.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Style Tab */}
                    {activeTab === 'style' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Theme */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Theme</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {THEMES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-3 rounded-xl border-2 transition-all ${theme === t.id ? 'border-zipp-accent shadow-lg scale-105' : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            style={{ background: t.bg }}
                                        >
                                            <div className="w-full h-4 rounded mb-1" style={{ background: t.accent }}></div>
                                            <p className="text-[10px] font-medium truncate" style={{ color: t.text }}>{t.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Background Style */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Background</h3>
                                <div className="flex gap-2">
                                    {BG_STYLES.map(bg => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setBgStyle(bg.id)}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${bgStyle === bg.id ? 'border-zipp-accent' : 'border-gray-100'
                                                }`}
                                        >
                                            <div className={`w-full h-8 rounded-lg ${bg.preview} mb-2`}></div>
                                            <p className="text-xs font-medium">{bg.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Accent Color */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Accent Color</h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={accentColor}
                                        onChange={(e) => setAccentColor(e.target.value)}
                                        className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200"
                                    />
                                    <div className="flex-1 grid grid-cols-6 gap-2">
                                        {['#9bdbc1', '#ec4899', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setAccentColor(color)}
                                                className={`w-10 h-10 rounded-xl transition-transform hover:scale-110 ${accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                style={{ background: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Button Style */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Button Style</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {BUTTON_STYLES.map(btn => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setButtonStyle(btn.id)}
                                            className={`p-3 border-2 transition-all ${buttonStyle === btn.id ? 'border-zipp-accent bg-zipp-accent/5' : 'border-gray-100'
                                                } ${btn.class}`}
                                        >
                                            <p className="text-xs font-medium">{btn.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Font */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Font</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => setFontFamily(font.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-left ${fontFamily === font.id ? 'border-zipp-accent bg-zipp-accent/5' : 'border-gray-100'
                                                }`}
                                            style={{ fontFamily: font.id }}
                                        >
                                            <p className="font-medium">{font.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Custom CSS */}
                            <Card className="p-6">
                                <h3 className="font-bold text-gray-900 mb-2">Custom CSS</h3>
                                <p className="text-sm text-gray-500 mb-4">Personalización avanzada (Pro feature)</p>
                                <textarea
                                    value={customCss}
                                    onChange={(e) => setCustomCss(e.target.value)}
                                    rows={4}
                                    placeholder=".zyp-container { }&#10;.zyp-button { }"
                                    className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-zipp-accent"
                                />
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Preview Panel (Desktop) */}
            <div className="hidden lg:flex w-[420px] bg-gray-100 p-6 items-start justify-center border-l border-gray-200 sticky top-0 h-screen overflow-y-auto">
                <div className="w-full max-w-[360px]">
                    <p className="text-xs text-gray-500 text-center mb-4 font-medium uppercase tracking-wide">Live Preview</p>

                    {/* Phone Frame */}
                    <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                        <div className="bg-gray-900 rounded-t-[2.5rem] pt-6 pb-2">
                            <div className="w-20 h-5 bg-black rounded-full mx-auto"></div>
                        </div>
                        <div
                            className={`rounded-[2rem] overflow-hidden min-h-[580px] ${bgStyle === 'animated' ? 'animate-gradient' : ''}`}
                            style={{
                                background: bgStyle === 'gradient'
                                    ? `linear-gradient(135deg, ${currentTheme.bg}, ${accentColor}40)`
                                    : bgStyle === 'animated'
                                        ? `linear-gradient(-45deg, ${accentColor}, ${currentTheme.bg}, ${accentColor}80, ${currentTheme.bg})`
                                        : currentTheme.bg,
                                color: currentTheme.text,
                                fontFamily: fontFamily,
                                backgroundSize: bgStyle === 'animated' ? '400% 400%' : 'auto',
                            }}
                        >
                            <div className="p-6 pt-8 text-center">
                                {/* Avatar */}
                                <div
                                    className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden shadow-xl ring-4"
                                    style={{
                                        background: avatarUrl ? 'transparent' : accentColor,
                                        ringColor: `${accentColor}40`
                                    }}
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: currentTheme.bg }}>
                                            {displayName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Name & Bio */}
                                <h2 className="text-xl font-bold mb-1">{displayName || 'Your Name'}</h2>
                                <p className="text-sm opacity-70 mb-4 px-2">{bio || 'Your bio here...'}</p>

                                {/* Social Icons */}
                                {socialLinks.filter(s => s.url).length > 0 && (
                                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                                        {socialLinks.filter(s => s.url).map(social => {
                                            const platform = SOCIAL_PLATFORMS.find(p => p.id === social.platform);
                                            if (!platform) return null;
                                            const Icon = platform.icon;
                                            return (
                                                <div
                                                    key={social.platform}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                                    style={{ background: `${platform.color}20` }}
                                                >
                                                    <Icon size={18} style={{ color: platform.color }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Blocks Preview */}
                                <div className="space-y-3">
                                    {blocks.filter(b => b.is_visible !== false).map(block => (
                                        <div
                                            key={block.id}
                                            className={`p-4 text-center font-medium transition-all hover:scale-[1.02] ${currentButtonStyle.class}`}
                                            style={{
                                                background: buttonStyle === 'outline' ? 'transparent' : `${accentColor}25`,
                                                borderColor: accentColor,
                                                color: currentTheme.text
                                            }}
                                        >
                                            {block.title || 'Untitled'}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <p className="text-[10px] opacity-30 mt-8 font-medium">zipp.so</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Modal */}
            <Modal isOpen={blockModal} onClose={() => setBlockModal(false)} title={editingBlock ? 'Edit Block' : 'Add Block'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                        <div className="grid grid-cols-5 gap-2">
                            {BLOCK_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setBlockType(type.id)}
                                    className={`p-3 rounded-xl border-2 transition-all ${blockType === type.id ? 'border-zipp-accent bg-zipp-accent/10' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <type.icon size={20} className="mx-auto mb-1" />
                                    <p className="text-[10px] font-medium">{type.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {blockType !== 'divider' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={blockTitle}
                                onChange={(e) => setBlockTitle(e.target.value)}
                                placeholder="Button text..."
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
                                placeholder={blockType === 'embed' ? 'YouTube, Spotify URL...' : 'https://...'}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none"
                            />
                        </div>
                    )}

                    {blockType === 'text' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                value={blockContent}
                                onChange={(e) => setBlockContent(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none resize-none"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setBlockModal(false)} className="flex-1">Cancel</Button>
                        <Button variant="accent" onClick={handleSaveBlock} className="flex-1">
                            {editingBlock ? 'Save' : 'Add Block'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Animated Gradient Style */}
            <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient-animation 15s ease infinite;
        }
      `}</style>
        </div>
    );
}
