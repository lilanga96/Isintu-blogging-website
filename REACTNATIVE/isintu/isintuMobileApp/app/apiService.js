import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://wketpjwycjjklyefpyxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZXRwand5Y2pqa2x5ZWZweXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2NTMzNjMsImV4cCI6MjAzNzIyOTM2M30.FL0XjPCf6YbKudj6pBYNe_IduwxfoIHe14aJnOx4M14';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchPostLikes = async (postId) => {
    // Fetch likes
    const { data: likesData, error: likesError } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postId);
  
    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return [];
    }
  
    const userIds = likesData.map((like) => like.user_id);
  
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
  
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }
  
    // Map profiles to the likes
    const profilesMap = new Map(profilesData.map(profile => [profile.id, profile.full_name]));
    const likesWithProfiles = likesData.map(like => ({
      user_id: like.user_id,
      full_name: profilesMap.get(like.user_id) || 'Unknown'
    }));
  
    return likesWithProfiles;
  };
  