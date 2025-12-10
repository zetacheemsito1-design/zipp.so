import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Menu, X, CheckCircle2, Heart, Link2,
    Zap, BarChart3, ShieldCheck, ArrowRight,
    Twitter, MessageCircle, User, LayoutDashboard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';

const PLATFORMS = [
    { id: 'roblox', name: 'Roblox', domain: 'roblox.com' },
    { id: 'youtube', name: 'YouTube', domain: 'youtube.com' },
    { id: 'twitter', name: 'X / Twitter', domain: 'twitter.com' },
    { id: 'discord', name: 'Discord', domain: 'discord.com' },
    { id: 'tiktok', name: 'TikTok', domain: 'tiktok.com' },
    { id: 'twitch', name: 'Twitch', domain: 'twitch.tv' },
];

const REVIEWS = [
    { user: "@alexdev", text: "Zipp triplicó mis entradas a Linkvertise. El diseño es increíble." },
    { user: "@robloxqueen", text: "Mis seguidores aman lo fácil que es desbloquear los scripts." },
    { user: "@musicmaker", text: "Estética 10/10. Muy estilo Apple. 100% recomendado." },
];

const Logo = () => (
    <Link to="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
        <div className="w-10 h-10 bg-zipp-black text-zipp-accent rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-zipp-accent/20">
            <Link2 size={22} strokeWidth={3} className="-rotate-45" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-zipp-black">zipp.so</span>
    </Link>
);

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-zipp-white text-zipp-black font-sans selection:bg-zipp-accent selection:text-black scroll-smooth">

            {/* --- HEADER --- */}
            <nav className="fixed top-6 left-0 right-0 mx-auto w-[92%] max-w-6xl z-50">
                <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5 rounded-full px-6 py-3 flex justify-between items-center transition-all duration-300">
                    <Logo />
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
                        <a href="#how" className="hover:text-zipp-black transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-zipp-black transition-colors">Pricing</a>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            // Logged in - show dashboard button and avatar
                            <Link to="/dashboard">
                                <Button variant="accent" className="px-5 py-2.5 text-sm gap-2">
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            // Not logged in - show login/signup
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="px-5 py-2.5 text-sm">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="accent" className="px-5 py-2.5 text-sm">Sign Up Free</Button>
                                </Link>
                            </>
                        )}
                    </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2"><Menu /></button>
                </div>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full mt-4 w-full bg-white rounded-[40px] shadow-2xl p-6 flex flex-col gap-2 md:hidden border border-gray-100"
                    >
                        <a href="#how" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-4 hover:bg-gray-50 rounded-2xl">How it Works</a>
                        <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-4 hover:bg-gray-50 rounded-2xl">Pricing</a>
                        {user ? (
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="accent" className="w-full mt-2 gap-2">
                                    <LayoutDashboard size={18} /> Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="primary" className="w-full mt-2">Sign Up Free</Button>
                            </Link>
                        )}
                    </motion.div>
                )}
            </nav>

            {/* --- HERO --- */}
            <section className="pt-48 pb-20 px-6 max-w-5xl mx-auto text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zipp-accent/20 rounded-full blur-[120px] -z-10 opacity-60"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 mb-8 shadow-sm">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zipp-accent opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-zipp-accent"></span></span>
                        Live Beta
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
                        Your Followers. Your Content. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zipp-accent to-emerald-400">Maximum Profits.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Create content locks that are so easy your followers will love.
                        Bridge the gap between engagement and monetization.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/signup">
                            <Button variant="accent" className="h-14 px-10 text-lg w-full sm:w-auto shadow-zipp-accent/40">
                                Start Creating <ArrowRight size={20} />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Platform logos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-6 mt-16"
                >
                    {PLATFORMS.map((p) => (
                        <div key={p.id} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center opacity-60 hover:opacity-100 hover:scale-110 transition-all">
                            <img src={`https://cdn.brandfetch.io/${p.domain}`} alt={p.name} className="w-6 h-6 object-contain" />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section id="how" className="py-24 bg-white relative">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-4xl font-extrabold text-center mb-16 tracking-tight">How Zipp Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Link2, title: "1. Create", desc: "Paste your link, choose your platform, and customize." },
                            { icon: CheckCircle2, title: "2. Engage", desc: "Followers complete simple actions to support you." },
                            { icon: BarChart3, title: "3. Grow", desc: "Gain subscribers and revenue. We handle the tech." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-[32px] bg-gray-50 hover:bg-zipp-accent/20 transition-all duration-300 text-center group border border-transparent hover:border-zipp-accent/30"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm mx-auto mb-8 flex items-center justify-center text-zipp-black group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <step.icon size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section id="pricing" className="py-24 bg-zipp-black text-white rounded-t-[60px]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Simple Pricing</h2>
                    <p className="text-gray-400 text-lg mb-16 max-w-xl mx-auto">We believe in helping you grow first. That's why our core features are completely free.</p>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white text-black p-10 rounded-[32px] relative transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="absolute top-0 right-0 bg-zipp-accent text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-[32px] uppercase tracking-wider">Most Popular</div>
                            <div className="text-left">
                                <h3 className="text-2xl font-bold mb-2">Creator Pass</h3>
                                <div className="flex items-baseline gap-1 mb-6"><span className="text-5xl font-black">$0</span><span className="text-gray-500 font-medium">/forever</span></div>
                                <ul className="space-y-4 mb-10">
                                    {["10 Zipp Links", "Lootlabs & Linkvertise Support", "Basic Analytics", "All Platforms"].map(item => (
                                        <li key={item} className="flex items-center gap-3 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup">
                                    <Button className="w-full bg-zipp-black text-white hover:bg-zipp-black/80 py-4">Start for Free</Button>
                                </Link>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[32px] border border-white/10 text-left opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <h3 className="text-2xl font-bold mb-2 text-gray-200">Zipp Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Coming Soon</span></div>
                            <ul className="space-y-4 mb-10 text-gray-400">
                                {["Unlimited Links", "Custom Domains", "Remove Branding", "Priority Support"].map(item => (
                                    <li key={item} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 cursor-not-allowed">Join Waitlist</Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- REVIEWS --- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                        {REVIEWS.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white border border-gray-100 p-8 rounded-3xl w-full md:w-1/3 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex gap-1 text-zipp-accent mb-4">{[1, 2, 3, 4, 5].map(s => <Heart key={s} size={18} fill="currentColor" />)}</div>
                                <p className="text-lg font-medium text-gray-800 mb-6 leading-snug">"{r.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zipp-black text-white flex items-center justify-center font-bold text-xs">{r.user[1].toUpperCase()}</div>
                                    <p className="text-sm font-bold text-gray-500">{r.user}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="flex flex-col gap-4">
                        <Logo />
                        <p className="text-gray-400 text-sm max-w-xs">The best tool for creators to monetize and engage with their audience safely.</p>
                    </div>
                    <div className="flex gap-16">
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-gray-900">Product</h4>
                            <Link to="/signup" className="text-gray-500 hover:text-zipp-black text-sm">Create Link</Link>
                            <a href="#pricing" className="text-gray-500 hover:text-zipp-black text-sm">Pricing</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-gray-900">Legal</h4>
                            <a href="#" className="text-gray-500 hover:text-zipp-black text-sm">Terms</a>
                            <a href="#" className="text-gray-500 hover:text-zipp-black text-sm">Privacy</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto px-8 mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <p>© 2025 Zipp.so. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Twitter size={16} className="hover:text-black cursor-pointer" />
                        <MessageCircle size={16} className="hover:text-black cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
