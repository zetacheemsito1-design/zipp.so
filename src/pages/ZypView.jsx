import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Link2, ExternalLink, Loader2, AlertCircle,
    Instagram, Twitter, Youtube, Github, Music2, Globe, Linkedin, Twitch, MessageCircle, Mail
} from 'lucide-react';
import { getPublicZypPage } from '../lib/supabase';

const SOCIAL_ICONS = {
    instagram: { icon: Instagram, color: '#E4405F' },
    twitter: { icon: Twitter, color: '#1DA1F2' },
    youtube: { icon: Youtube, color: '#FF0000' },
    github: { icon: Github, color: '#181717' },
    spotify: { icon: Music2, color: '#1DB954' },
    tiktok: { icon: Music2, color: '#000000' },
    linkedin: { icon: Linkedin, color: '#0A66C2' },
    twitch: { icon: Twitch, color: '#9146FF' },
    discord: { icon: MessageCircle, color: '#5865F2' },
    email: { icon: Mail, color: '#EA4335' },
    website: { icon: Globe, color: '#000000' },
};

const THEMES = {
    default: { bg: '#ffffff', text: '#000000' },
    dark: { bg: '#0a0a0a', text: '#ffffff' },
    midnight: { bg: '#1a1a2e', text: '#ffffff' },
    sunset: { bg: '#fef3c7', text: '#1f2937' },
    forest: { bg: '#064e3b', text: '#ffffff' },
    ocean: { bg: '#0c4a6e', text: '#ffffff' },
    rose: { bg: '#fdf2f8', text: '#831843' },
    lavender: { bg: '#faf5ff', text: '#581c87' },
};

const BUTTON_STYLES = {
    rounded: 'rounded-2xl',
    pill: 'rounded-full',
    square: 'rounded-lg',
    outline: 'rounded-2xl border-2 bg-transparent',
    shadow: 'rounded-2xl shadow-lg',
    glow: 'rounded-2xl shadow-lg',
};

export default function ZypView() {
    const { username } = useParams();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPage();
    }, [username]);

    const loadPage = async () => {
        try {
            const data = await getPublicZypPage(username);
            if (data) {
                setPage(data);
                setBlocks(data.zyp_blocks?.sort((a, b) => a.position - b.position).filter(b => b.is_visible !== false) || []);
            } else {
                setError('Page not found');
            }
        } catch (err) {
            console.error('Error loading ZYP page:', err);
            setError('Page not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <Loader2 className="animate-spin text-zipp-accent mx-auto mb-4" size={40} />
                    <p className="text-gray-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={48} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
                    <p className="text-gray-500 mb-8">This ZYP page doesn't exist or is not published.</p>
                    <Link to="/" className="inline-flex items-center gap-2 bg-zipp-black text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
                        <Link2 size={18} className="-rotate-45" />
                        Create your own
                    </Link>
                </div>
            </div>
        );
    }

    const theme = THEMES[page.theme] || THEMES.default;
    const accent = page.accent_color || '#9bdbc1';
    const socialLinks = page.social_links || [];
    const buttonClass = BUTTON_STYLES[page.button_style] || BUTTON_STYLES.rounded;
    const fontFamily = page.font_family || 'Inter';
    const bgStyle = page.bg_type || 'solid';

    const bgCss = bgStyle === 'gradient'
        ? `linear-gradient(135deg, ${theme.bg}, ${accent}40)`
        : bgStyle === 'animated'
            ? `linear-gradient(-45deg, ${accent}, ${theme.bg}, ${accent}80, ${theme.bg})`
            : theme.bg;

    return (
        <>
            {/* Custom CSS */}
            {page.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: page.custom_css }} />
            )}

            {/* Animated background style */}
            {bgStyle === 'animated' && (
                <style>{`
          @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .zyp-animated-bg {
            animation: gradient-animation 15s ease infinite;
            background-size: 400% 400%;
          }
        `}</style>
            )}

            <div
                className={`zyp-container min-h-screen py-12 px-4 ${bgStyle === 'animated' ? 'zyp-animated-bg' : ''}`}
                style={{
                    background: bgCss,
                    color: theme.text,
                    fontFamily: fontFamily,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto"
                >
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden shadow-2xl ring-4"
                        style={{
                            background: page.avatar_url ? 'transparent' : accent,
                            ringColor: `${accent}50`
                        }}
                    >
                        {page.avatar_url ? (
                            <img src={page.avatar_url} alt={page.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold" style={{ color: theme.bg }}>
                                {page.display_name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </motion.div>

                    {/* Name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-extrabold text-center mb-2"
                    >
                        {page.display_name || page.username}
                    </motion.h1>

                    {/* Username */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.25 }}
                        className="text-center text-sm mb-2"
                    >
                        @{page.username}
                    </motion.p>

                    {/* Bio */}
                    {page.bio && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center opacity-80 mb-6 px-4 leading-relaxed"
                        >
                            {page.bio}
                        </motion.p>
                    )}

                    {/* Social Icons */}
                    {socialLinks.filter(s => s.url).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center gap-2 mb-8 flex-wrap"
                        >
                            {socialLinks.filter(s => s.url).map((social, i) => {
                                const platform = SOCIAL_ICONS[social.platform];
                                if (!platform) return null;
                                const Icon = platform.icon;
                                return (
                                    <motion.a
                                        key={social.platform}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                                        style={{ background: `${platform.color}20` }}
                                    >
                                        <Icon size={22} style={{ color: platform.color }} />
                                    </motion.a>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Blocks */}
                    <div className="space-y-4">
                        {blocks.map((block, i) => (
                            <motion.div
                                key={block.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                {block.type === 'link' && (
                                    <a
                                        href={block.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`zyp-button block p-4 text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${buttonClass}`}
                                        style={{
                                            background: page.button_style === 'outline' ? 'transparent' : `${accent}25`,
                                            borderColor: accent,
                                            boxShadow: page.button_style === 'glow' ? `0 0 20px ${accent}50` : undefined
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{block.title || 'Link'}</span>
                                            <ExternalLink size={16} className="opacity-50" />
                                        </div>
                                    </a>
                                )}

                                {block.type === 'text' && (
                                    <div
                                        className="p-5 rounded-2xl text-center"
                                        style={{ background: `${accent}10` }}
                                    >
                                        <p className="opacity-90 leading-relaxed">{block.content?.text || block.title}</p>
                                    </div>
                                )}

                                {block.type === 'image' && block.url && (
                                    <div className="rounded-2xl overflow-hidden shadow-lg">
                                        <img src={block.url} alt={block.title} className="w-full" />
                                    </div>
                                )}

                                {block.type === 'embed' && block.url && (
                                    <div className="rounded-2xl overflow-hidden shadow-lg">
                                        {block.url.includes('youtube') && (
                                            <iframe
                                                src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                                className="w-full aspect-video"
                                                allowFullScreen
                                            />
                                        )}
                                        {block.url.includes('spotify') && (
                                            <iframe
                                                src={block.url.replace('open.spotify.com', 'open.spotify.com/embed')}
                                                className="w-full h-20 rounded-xl"
                                                allow="encrypted-media"
                                            />
                                        )}
                                        {block.url.includes('soundcloud') && (
                                            <iframe
                                                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(block.url)}&color=${accent.replace('#', '')}&auto_play=false`}
                                                className="w-full h-20"
                                            />
                                        )}
                                    </div>
                                )}

                                {block.type === 'divider' && (
                                    <div
                                        className="h-px my-6"
                                        style={{ background: `${accent}30` }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-16 text-center"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                            style={{
                                background: `${accent}20`,
                                color: theme.text
                            }}
                        >
                            <Link2 size={14} className="-rotate-45" />
                            <span>Create your ZYP</span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
