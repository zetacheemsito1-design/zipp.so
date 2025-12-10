import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Default profile when none exists
const DEFAULT_PROFILE = {
    links_count: 0,
    max_links: 10
};

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,

    // Initialize auth state
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Try to get profile, use default if it fails
                let profile = DEFAULT_PROFILE;
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (data && !error) {
                        profile = data;
                    }
                } catch (e) {
                    // Silently use default profile
                }

                set({ user: session.user, profile, loading: false });
            } else {
                set({ user: null, profile: null, loading: false });
            }
        } catch (error) {
            set({ user: null, profile: null, loading: false });
        }
    },

    // Listen to auth changes
    setupAuthListener: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    let profile = DEFAULT_PROFILE;
                    try {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (data && !error) {
                            profile = data;
                        }
                    } catch (e) {
                        // Silently use default profile
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
        const p = profile || DEFAULT_PROFILE;
        return (p.links_count || 0) < (p.max_links || 10);
    },

    // Get remaining links count
    remainingLinks: () => {
        const { profile } = get();
        const p = profile || DEFAULT_PROFILE;
        return (p.max_links || 10) - (p.links_count || 0);
    }
}));

