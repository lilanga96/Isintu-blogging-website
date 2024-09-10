import React, { createContext, useState } from 'react';
import { supabase } from './apiService';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const addComment = (postIndex, comment) => {
    setPosts((prevPosts) => {
      const updatedPosts = [...prevPosts];
      const post = updatedPosts[postIndex];
      post.comments = post.comments ? [...post.comments, comment] : [comment];
      return updatedPosts;
    });
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

  const toggleLike = async (postId, postIndex) => {
    try {
      // Call the stored procedure to increment likes
      const { data, error } = await supabase
        .rpc('increment_likes', { post_id: postId });
  
      if (error) {
        throw error;
      }
  
      // Update the local state with the new number of likes
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts];
        const post = updatedPosts[postIndex];
        post.likes = post.likes ? post.likes + 1 : 1; // Update the local likes count
        return updatedPosts;
      });
    } catch (error) {
      console.error("Error incrementing likes:", error.message);
    }
  };
  

  return (
    <PostsContext.Provider value={{ posts, setPosts, addPost, addComment, toggleLike, deletePost  }}>
      {children}
    </PostsContext.Provider>
  );
};