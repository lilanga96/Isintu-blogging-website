import React, { createContext, useState } from 'react';
import { supabase } from './apiService';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const addComment = async (postIndex, comment) => {
    try {
      const { error: addCommentError } = await supabase
        .from('comments')
        .insert({ post_id: posts[postIndex].id, text: comment });
  
      if (addCommentError) {
        throw addCommentError;
      }
  
      // Fetch updated posts
      const { data: updatedPosts, error: fetchError } = await supabase
        .rpc('fetch_posts_with_comments_and_likes_count');
  
      if (fetchError) {
        throw fetchError;
      }
  
      console.log('Updated posts:', updatedPosts); // Debugging line
  
      // Update the specific post in the state
      setPosts((prevPosts) => {
        const updatedPost = updatedPosts.find(post => post.id === posts[postIndex].id);
        return prevPosts.map(post =>
          post.id === updatedPost.id ? { ...post, comment_count: updatedPost.comment_count } : post
        );
      });
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };
  
  
  
  const deletePost = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('posts') // Adjust table name if necessary
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // Update the posts state to remove the deleted post
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error.message);
    }
  };

  const toggleLike = async (postId, index) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }
  
      const currentUser = session.user;
      if (!currentUser.id) {
        console.error("User ID is undefined.");
        return;
      }
  
      // Check if the user has already liked the post
      const { data: likeExists, error: fetchError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
  
      if (fetchError) {
        console.error('Error fetching like:', fetchError);
        return;
      }
  
      let likeOperation;
  
      if (likeExists.length > 0) {
        // Unlike: Delete the like
        likeOperation = supabase
          .from('post_likes')
          .delete()
          .eq('id', likeExists[0].id);
      } else {
        // Like: Insert the like
        likeOperation = supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: currentUser.id });
      }
  
      const { error: operationError } = await likeOperation;
  
      if (operationError) {
        console.error('Error toggling like:', operationError);
        return;
      }
  
      // Fetch the updated likes count
      const { data: countData, error: countError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId);
  
      if (countError) {
        console.error('Error fetching like count:', countError);
        return;
      }
  
      const newLikesCount = countData.length;
  
      // Update the likes count in the posts table
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes: newLikesCount })
        .eq('id', postId);
  
      if (updateError) {
        console.error('Error updating likes count:', updateError);
        return;
      }
  
      // Update the post's likes count in the state
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post, i) => {
          if (i === index) {
            return { ...post, like_count: newLikesCount };
          }
          return post;
        });
        return updatedPosts;
      });
  
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  
  return (
    <PostsContext.Provider value={{ posts, setPosts, addPost, addComment, toggleLike, deletePost  }}>
      {children}
    </PostsContext.Provider>
  );
};