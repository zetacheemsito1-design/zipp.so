import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,

    // Initialize auth state
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Try to get profile, but don't fail if it doesn't exist
                let profile = null;
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    profile = data;
                } catch (e) {
                    console.log('Profile not found or error:', e);
                }

                set({ user: session.user, profile, loading: false });
            } else {
                set({ user: null, profile: null, loading: false });
            }
        } catch (error) {
            console.error('Auth init error:', error);
            set({ user: null, profile: null, loading: false });
        }
    },

    // Listen to auth changes
    setupAuthListener: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    let profile = null;
                    try {
                        const { data } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();
                        profile = data;
                    } catch (e) {
                        console.log('Profile fetch error:', e);
                    }

                    set({ user: session.user, profile, loading: false });
                } else {
                    set({ user: null, profile: null, loading: false });
                }
            }
        );
        return () => subscription.unsubscribe();
    },

    // Check if user can create more links
    canCreateLink: () => {
        const { profile } = get();
        if (!profile) return true; // Allow if no profile exists
        return (profile.links_count || 0) < (profile.max_links || 10);
    },

    // Get remaining links count
    remainingLinks: () => {
        const { profile } = get();
        if (!profile) return 10;
        return (profile.max_links || 10) - (profile.links_count || 0);
    }
}));
