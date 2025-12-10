import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://keajlngghnqibilahiwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYWpsbmdnaG5xaWJpbGFoaXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzcyODUsImV4cCI6MjA4MDkxMzI4NX0.iq1pC5X1sYP6OBaKE5k-jdrDq05RIaoGRqzLnommrDI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
};

export const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + '/dashboard' }
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Links helpers
export const createLink = async (linkData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('links')
        .insert([{ ...linkData, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getMyLinks = async () => {
    const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const updateLink = async (id, updates) => {
    const { data, error } = await supabase
        .from('links')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteLink = async (id) => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) throw error;
};

// Public link helpers
export const getPublicLink = async (id) => {
    const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error) throw error;
    return data;
};

export const recordClick = async (linkId) => {
    const { data, error } = await supabase
        .from('link_clicks')
        .insert([{ link_id: linkId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const recordConversion = async (clickId) => {
    const { error } = await supabase
        .from('link_clicks')
        .update({ converted: true })
        .eq('id', clickId);

    if (error) throw error;
};

// Profile helpers
export const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
};

// ============================================
// ZYP PAGES HELPERS
// ============================================

export const getMyZypPage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('zyp_pages')
        .select('*, zyp_blocks(*)')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
};

export const createZypPage = async (pageData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('zyp_pages')
        .insert([{ ...pageData, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateZypPage = async (id, updates) => {
    const { data, error } = await supabase
        .from('zyp_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPublicZypPage = async (username) => {
    const { data, error } = await supabase
        .from('zyp_pages')
        .select('*, zyp_blocks(*)')
        .eq('username', username.toLowerCase())
        .eq('is_published', true)
        .single();

    if (error) {
        console.error('Error fetching ZYP page:', error);
        return null;
    }

    // Increment views (silently, don't await)
    supabase
        .from('zyp_pages')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
        .then(() => { })
        .catch(() => { });

    return data;
};

export const checkUsernameAvailable = async (username) => {
    const { data, error } = await supabase
        .from('zyp_pages')
        .select('id')
        .eq('username', username)
        .single();

    return !data; // Available if no data found
};

// ZYP Blocks helpers
export const createZypBlock = async (pageId, blockData) => {
    const { data, error } = await supabase
        .from('zyp_blocks')
        .insert([{ ...blockData, page_id: pageId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateZypBlock = async (id, updates) => {
    const { data, error } = await supabase
        .from('zyp_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteZypBlock = async (id) => {
    const { error } = await supabase.from('zyp_blocks').delete().eq('id', id);
    if (error) throw error;
};

export const reorderZypBlocks = async (blocks) => {
    const updates = blocks.map((block, index) =>
        supabase.from('zyp_blocks').update({ position: index }).eq('id', block.id)
    );
    await Promise.all(updates);
};
