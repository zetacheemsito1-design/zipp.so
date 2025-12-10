import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, Mail, Lock, Github, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { signUpWithEmail, signInWithGitHub } from '../lib/supabase';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await signUpWithEmail(email, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Error al registrarse');
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

    if (success) {
        return (
            <div className="min-h-screen bg-zipp-white flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        ¡Revisa tu email!
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Te hemos enviado un link de confirmación a <strong>{email}</strong>
                    </p>
                    <Link to="/login">
                        <Button variant="primary">Ir a Login</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zipp-white flex">
            {/* Left side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zipp-black to-gray-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-zipp-accent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl"></div>
                </div>
                <div className="relative text-center text-white">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-32 h-32 bg-zipp-accent rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8"
                    >
                        <Link2 size={56} strokeWidth={2.5} className="-rotate-45 text-zipp-black" />
                    </motion.div>
                    <h2 className="text-3xl font-extrabold mb-4">
                        Empieza gratis
                    </h2>
                    <p className="text-gray-400 max-w-sm">
                        10 links gratis para siempre. Sin tarjeta de crédito.
                    </p>

                    <div className="mt-12 space-y-4 text-left">
                        {['Links ilimitados*', 'Analytics básicos', 'Todas las plataformas', 'Sin marca de agua'].map((item, i) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-zipp-accent/20 text-zipp-accent flex items-center justify-center">
                                    <CheckCircle2 size={14} />
                                </div>
                                <span className="text-gray-300">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
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
                        Crea tu cuenta
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Empieza a monetizar tu contenido en minutos
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

                    <Button
                        variant="outline"
                        onClick={handleGitHubLogin}
                        className="w-full py-4 mb-6"
                    >
                        <Github size={20} /> Continuar con GitHub
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-zipp-white text-gray-500 font-medium">o con email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignup} className="space-y-5">
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
                                placeholder="Contraseña (mínimo 6 caracteres)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 pl-12 font-medium outline-none transition-all"
                            />
                        </div>

                        <Button type="submit" variant="accent" loading={loading} className="w-full py-4">
                            Crear Cuenta <ArrowRight size={18} />
                        </Button>
                    </form>

                    <p className="text-center text-gray-500 mt-8 text-sm">
                        Al registrarte aceptas nuestros{' '}
                        <Link to="/terms" className="text-zipp-black font-medium hover:underline">Términos</Link>
                        {' '}y{' '}
                        <Link to="/privacy" className="text-zipp-black font-medium hover:underline">Privacidad</Link>
                    </p>

                    <p className="text-center text-gray-500 mt-4">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-zipp-black font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
