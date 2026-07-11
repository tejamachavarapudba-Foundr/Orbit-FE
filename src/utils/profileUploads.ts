import { supabase } from '../lib/supabase';

export async function uploadProfilePhoto(userId: string, file: File) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Starting profile photo upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    console.log('Uploading to avatars bucket:', fileName);

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', data);

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('Public URL generated:', publicUrl);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (authUpdateError) {
      console.error('Auth metadata update error:', authUpdateError);
      throw new Error(`Failed to refresh user: ${authUpdateError.message}`);
    }

    console.log('Profile updated successfully');
    return publicUrl;
  } catch (error) {
    console.error('Profile upload error:', error);
    thro error;
  }
}