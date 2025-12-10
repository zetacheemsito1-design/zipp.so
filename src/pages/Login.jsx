import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, Mail, Lock, Github, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { signInWithEmail, signInWithGitHub } from '../lib/supabase';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmail(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        try {
            await signInWithGitHub();
        } catch (err) {
            setError(err.message || 'Error con GitHub');
        }
    };

    return (
        <div className="min-h-screen bg-zipp-white flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 mb-12 group">
                        <div className="w-10 h-10 bg-zipp-black text-zipp-accent rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-zipp-accent/20">
                            <Link2 size={22} strokeWidth={3} className="-rotate-45" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-zipp-black">zipp.so</span>
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Ingresa a tu cuenta para gestionar tus links
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 pl-12 font-medium outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 pl-12 font-medium outline-none transition-all"
                            />
                        </div>

                        <Button type="submit" variant="accent" loading={loading} className="w-full py-4">
                            Iniciar Sesión <ArrowRight size={18} />
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-zipp-white text-gray-500 font-medium">o continúa con</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleGitHubLogin}
                        className="w-full py-4"
                    >
                        <Github size={20} /> GitHub
                    </Button>

                    <p className="text-center text-gray-500 mt-8">
                        ¿No tienes cuenta?{' '}
                        <Link to="/signup" className="text-zipp-black font-bold hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zipp-accent/30 via-zipp-accent/20 to-emerald-100 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-zipp-accent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-300 rounded-full blur-3xl"></div>
                </div>
                <div className="relative text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8"
                    >
                        <Link2 size={56} strokeWidth={2.5} className="-rotate-45 text-zipp-black" />
                    </motion.div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Monetiza tu contenido
                    </h2>
                    <p className="text-gray-600 max-w-sm">
                        Miles de creadores ya usan Zipp para convertir seguidores en ingresos
                    </p>
                </div>
            </div>
        </div>
    );
}
