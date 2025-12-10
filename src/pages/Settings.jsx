import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Trash2, LogOut, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { signOut, supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const { user, profile } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state
    const [username, setUsername] = useState(profile?.username || '');

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username })
                .eq('id', user.id);

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!confirm('¿Estás seguro? Esta acción eliminará tu cuenta y todos tus links permanentemente.')) return;
        if (!confirm('Esta acción NO se puede deshacer. ¿Continuar?')) return;

        // Note: Account deletion needs to be handled server-side
        alert('Por favor contacta soporte para eliminar tu cuenta: support@zipp.so');
    };

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                    Settings
                </h1>
                <p className="text-gray-500 mt-1">
                    Gestiona tu cuenta y preferencias
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <User size={20} /> Perfil
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Tu username"
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:border-zipp-accent outline-none transition-colors"
                                    />
                                </div>
                                <Button type="submit" variant="primary" loading={saving} className="w-full sm:w-auto">
                                    {saved ? <><CheckCircle2 size={18} /> Guardado</> : 'Guardar cambios'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Plan */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-r from-zipp-accent/10 to-emerald-100/50 border-zipp-accent/20">
                        <CardContent className="py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Plan Gratuito</h3>
                                    <p className="text-gray-600">
                                        {profile?.links_count || 0} de {profile?.max_links || 10} links usados
                                    </p>
                                </div>
                                <Button variant="outline" className="border-zipp-accent/30 hover:bg-zipp-accent/10">
                                    Upgrade a Pro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Lock size={20} /> Seguridad
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full justify-start" onClick={() => alert('Funcionalidad próximamente')}>
                                <Mail size={18} /> Cambiar email
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => alert('Funcionalidad próximamente')}>
                                <Lock size={18} /> Cambiar contraseña
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Danger Zone */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-red-200">
                        <CardHeader>
                            <h2 className="font-bold text-red-600 flex items-center gap-2">
                                <Trash2 size={20} /> Zona de Peligro
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" onClick={handleSignOut} className="w-full justify-start border-gray-200">
                                <LogOut size={18} /> Cerrar sesión
                            </Button>
                            <Button variant="danger" onClick={handleDeleteAccount} className="w-full justify-start">
                                <Trash2 size={18} /> Eliminar cuenta
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
