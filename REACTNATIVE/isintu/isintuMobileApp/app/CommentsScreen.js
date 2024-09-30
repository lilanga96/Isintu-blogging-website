import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { PostsContext } from './PostsContext';
import { supabase } from './apiService';

const CommentsScreen = ({ route }) => {
  const { postIndex } = route.params;
  const { posts } = useContext(PostsContext);
  const post = posts[postIndex];

  const [newComment, setNewComment] = useState('');
  const [full_name, setFullName] = useState('');
  const [comments, setComments] = useState([]);
  const [newReply, setNewReply] = useState({});
  const [replies, setReplies] = useState({});

  
  const fetchUsername = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setFullName(profile.full_name);
    } catch (error) {
      console.error('Error fetching username:', error.message);
    }
  };


  const fetchCommentsAndReplies = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, user_id, post_id, text, full_name, likes, created_at')
        .eq('post_id', post.id);

      if (commentsError) throw commentsError;

      setComments(commentsData);

      
      const commentIds = commentsData.map(comment => comment.id);
      const { data: repliesData, error: repliesError } = await supabase
        .from('replies')
        .select('id, comment_id, user_id, text, full_name, likes, created_at')
        .in('comment_id', commentIds);

      if (repliesError) throw repliesError;

     
      const groupedReplies = repliesData.reduce((acc, reply) => {
        acc[reply.comment_id] = acc[reply.comment_id] || [];
        acc[reply.comment_id].push(reply);
        return acc;
      }, {});

      setReplies(groupedReplies);
    } catch (error) {
      console.error('Error fetching comments and replies:', error.message);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
       
        const { error } = await supabase
          .from('comments')
          .insert([{ post_id: post.id, user_id: supabase.auth.getUser().id, text: newComment, full_name }]);

        if (error) throw error;

      
        setNewComment('');

        
        fetchCommentsAndReplies();
      } catch (error) {
        console.error('Error adding comment:', error.message);
      }
    }
  };

  const handleAddReply = async (commentId, parentId = null) => {
    const replyText = parentId ? newReply[parentId] : newReply[commentId];
    if (replyText?.trim()) {
      try {
       
        const { error } = await supabase
          .from('replies')
          .insert([{ comment_id: commentId, user_id: supabase.auth.getUser().id, text: replyText, full_name }]);

        if (error) throw error;

       
        setNewReply({ ...newReply, [commentId]: '', ...(parentId ? { [parentId]: '' } : {}) });

    
        fetchCommentsAndReplies();
      } catch (error) {
        console.error('Error adding reply:', error.message);
      }
    }
  };

  const handleLike = async (type, id) => {
    try {
      if (type === 'comment') {
      
        const { data: commentData, error: fetchError } = await supabase
          .from('comments')
          .select('likes')
          .eq('id', id)
          .single();
  
        if (fetchError) throw fetchError;
  
      
        const newLikesCount = (commentData?.likes || 0) + 1;
  
        
        const { error: updateError } = await supabase
          .from('comments')
          .update({ likes: newLikesCount })
          .eq('id', id);
  
        if (updateError) throw updateError;
      } else if (type === 'reply') {
       
        const { data: replyData, error: fetchError } = await supabase
          .from('replies')
          .select('likes')
          .eq('id', id)
          .single();
  
        if (fetchError) throw fetchError;
  
       
        const newLikesCount = (replyData?.likes || 0) + 1;
  
       
        const { error: updateError } = await supabase
          .from('replies')
          .update({ likes: newLikesCount })
          .eq('id', id);
  
        if (updateError) throw updateError;
      }
  
     
      fetchCommentsAndReplies();
    } catch (error) {
      console.error('Error liking:', error.message);
    }
  };
  
  useEffect(() => {
    fetchUsername();
    fetchCommentsAndReplies();
  }, []);

  const renderReplies = (commentId) => {
    return replies[commentId]?.map((reply) => (
      <View key={reply.id} style={styles.replyContainer}>
        <Text style={styles.full_name}>Known as {reply.full_name}</Text>
        <Text style={styles.reply}>{reply.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike('reply', reply.id)}>
            <Text style={styles.actionText}>Like ({reply.likes})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
       
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          value={newReply[reply.id] || ''}
          onChangeText={(text) => setNewReply({ ...newReply, [reply.id]: text })}
        />
        <TouchableOpacity style={styles.commentButton} onPress={() => handleAddReply(commentId, reply.id)}>
          <Text style={styles.commentButtonText}>Add Reply</Text>
        </TouchableOpacity>
        
        {renderReplies(reply.id)}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.full_name}>Known as {item.full_name}</Text>
            <Text style={styles.comment}>{item.text}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike('comment', item.id)}>
                <Text style={styles.actionText}>Like ({item.likes})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            </View>
           
            {renderReplies(item.id)}
            
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              value={newReply[item.id] || ''}
              onChangeText={(text) => setNewReply({ ...newReply, [item.id]: text })}
            />
            <TouchableOpacity style={styles.commentButton} onPress={() => handleAddReply(item.id)}>
              <Text style={styles.commentButtonText}>Add Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TextInput
        style={styles.commentInput}
        placeholder="Write a comment..."
        value={newComment}
        onChangeText={setNewComment}
      />
      <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
        <Text style={styles.commentButtonText}>Add Comment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  commentContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  full_name: {
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 5,
  },
  comment: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    marginRight: 10,
  },
  actionText: {
    color: '#800000',
  },
  replyContainer: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginLeft: 20,
  },
  reply: {
    fontSize: 14,
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  replyInput: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  commentButton: {
    backgroundColor: '#800000',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CommentsScreen;

