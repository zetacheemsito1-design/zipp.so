import { supabase } from './supabase';

// Upload image to Supabase Storage
export const uploadImage = async (file, folder = 'avatars') => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('zyp-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('zyp-images')
        .getPublicUrl(filePath);

    return publicUrl;
};

// Delete image from storage
export const deleteImage = async (url) => {
    if (!url || !url.includes('zyp-images')) return;

    const path = url.split('zyp-images/')[1];
    if (!path) return;

    await supabase.storage.from('zyp-images').remove([path]);
};
