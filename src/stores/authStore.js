import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Default profile - no DB needed
const DEFAULT_PROFILE = {
    links_count: 0,
    max_links: 10
};

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: DEFAULT_PROFILE,
    loading: true,

    // Initialize auth state - NO profile fetch, just auth
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({
                user: session?.user || null,
                profile: DEFAULT_PROFILE,
                loading: false
            });
        } catch (error) {
            set({ user: null, profile: DEFAULT_PROFILE, loading: false });
        }
    },

    // Listen to auth changes
    setupAuthListener: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                set({
                    user: session?.user || null,
                    profile: DEFAULT_PROFILE,
                    loading: false
                });
            }
        );
        return () => subscription.unsubscribe();
    },

    // Check if user can create more links
    canCreateLink: () => {
        return true; // Always allow for now
    },

    // Get remaining links count
    remainingLinks: () => {
        return 10; // Default value
    }
}));
