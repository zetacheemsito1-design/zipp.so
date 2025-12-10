import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, ExternalLink, ShieldCheck, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getPublicLink, recordClick, recordConversion } from '../lib/supabase';
import { verifyAccess, createInteractionChallenge, isLikelyBot } from '../lib/antibypass';

export default function LinkView() {
    const { id } = useParams();
    const [link, setLink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clickId, setClickId] = useState(null);
    const [actionCompleted, setActionCompleted] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [verificationToken, setVerificationToken] = useState(null);
    const [interactionVerified, setInteractionVerified] = useState(false);

    useEffect(() => {
        loadLink();
    }, [id]);

    // Start interaction verification in background
    useEffect(() => {
        createInteractionChallenge().then(() => {
            setInteractionVerified(true);
        });
    }, []);

    const loadLink = async () => {
        try {
            // Anti-bypass verification
            const verification = await verifyAccess(id);

            if (!verification.allowed) {
                console.warn('Access blocked - Risk score:', verification.riskScore);
                setBlocked(true);
                setLoading(false);
                return;
            }

            setVerificationToken(verification.token);

            const data = await getPublicLink(id);
            setLink(data);

            // Record click with fingerprint
            const click = await recordClick(id);
            setClickId(click.id);
        } catch (err) {
            console.error('Error loading link:', err);
            setError('Link no encontrado o inactivo');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteAction = () => {
        // Additional bot check before opening
        if (isLikelyBot()) {
            setBlocked(true);
            return;
        }

        // Open target URL in new tab
        if (link.target_url) {
            window.open(link.target_url, '_blank');
        }

        // Show as completed after a delay (simulating verification)
        setTimeout(() => {
            setActionCompleted(true);
        }, 2000);
    };

    const handleUnlock = async () => {
        // Require interaction verification
        if (!interactionVerified) {
            console.warn('Interaction not verified yet');
            return;
        }

        // Final bot check
        if (isLikelyBot()) {
            setBlocked(true);
            return;
        }

        try {
            // Record conversion with token
            if (clickId) {
                await recordConversion(clickId);
            }
            setUnlocked(true);

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = link.destination_url;
            }, 1500);
        } catch (err) {
            console.error('Error recording conversion:', err);
            // Still redirect even if tracking fails
            window.location.href = link.destination_url;
        }
    };

    // Blocked screen for bots/bypass attempts
    if (blocked) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Acceso Bloqueado</h1>
                    <p className="text-gray-400 mb-8">
                        Se detectó actividad sospechosa. Si eres humano, intenta refrescar la página.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-zipp-accent mx-auto mb-4" size={40} />
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Link no disponible</h1>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <Link to="/">
                        <Button variant="primary">Ir a Zipp.so</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (unlocked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30"
                    >
                        <CheckCircle2 size={48} />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Desbloqueado!</h1>
                    <p className="text-gray-600 mb-4">Redirigiendo...</p>
                    <Loader2 className="animate-spin text-gray-400 mx-auto" size={24} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="py-4 px-6 flex justify-center">
                <Link to="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-zipp-black text-zipp-accent rounded-xl flex items-center justify-center">
                        <Link2 size={16} strokeWidth={3} className="-rotate-45" />
                    </div>
                    <span className="font-bold text-sm text-gray-500">zipp.so</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Card */}
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                        {/* Header Image */}
                        <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white/10 font-black text-5xl">
                                ZIPP
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white/90 text-xs font-bold mb-2 uppercase tracking-wide">
                                    Locked Content
                                </div>
                                <h1 className="text-white font-extrabold text-2xl leading-tight drop-shadow-md">
                                    {link.title}
                                </h1>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                    Complete to unlock
                                </p>
                            </div>

                            {/* Task */}
                            <div className={`p-5 rounded-3xl border-2 transition-all duration-300 ${actionCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-100 hover:border-zipp-accent/50'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={`https://cdn.brandfetch.io/${link.platform?.toLowerCase().replace('x / ', '')}.com`}
                                        alt={link.platform}
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{link.action_type}</p>
                                        <p className="text-gray-500 text-sm">on {link.platform}</p>
                                    </div>
                                    {actionCompleted ? (
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCompleteAction}
                                            className="rounded-xl"
                                        >
                                            <ExternalLink size={16} /> Go
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Unlock Button */}
                            <div className="mt-8">
                                <div className="text-center mb-4">
                                    <span className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                        <ShieldCheck size={14} /> 100% Safe & Secure
                                    </span>
                                </div>
                                <Button
                                    variant="accent"
                                    onClick={handleUnlock}
                                    disabled={!actionCompleted}
                                    className={`w-full py-5 text-lg font-extrabold rounded-2xl transition-all ${actionCompleted
                                        ? 'animate-pulse'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                                        }`}
                                >
                                    <ShieldCheck size={20} />
                                    {actionCompleted ? 'Unlock Link' : 'Complete task first'}
                                </Button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="py-4 text-center bg-gray-50 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
                                POWERED BY ZIPP.SO
                            </span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
