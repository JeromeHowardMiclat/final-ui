import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const API_BASE_URL = 'https://final-api-fpop.onrender.com';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [commentBoxVisible, setCommentBoxVisible] = useState({});
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  const fetchPosts = async (key = '') => {
    try {
      const endpoint = key
        ? `${API_BASE_URL}/miclat/posts/search?key=${encodeURIComponent(key)}`
        : `${API_BASE_URL}/miclat/posts`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchPosts(searchKey);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/miclat/posts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter((post) => post.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete post');
    }
  };

  const renderMedia = (post) => {
    if (!post.mediaUrl) return null;

    const mediaType = post.mediaType || (post.mediaUrl.includes('youtube') || post.mediaUrl.includes('youtu.be') ? 'video' : 'image');

    if (mediaType === 'image') {
      return (
        <div className="post-media">
          <img src={post.mediaUrl} alt={post.title || 'Post media'} />
        </div>
      );
    }

    if (mediaType === 'video') {
      const youtubeRegex = /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = post.mediaUrl.match(youtubeRegex);
      const videoId = match && match[1];

      if (videoId) {
        return (
          <div className="post-media video-container">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded youtube video"
            />
          </div>
        );
      }

      return (
        <div className="post-media video-container">
          <video controls width="100%">
            <source src={post.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  const handleLike = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: (prevLikes[id] || 0) + 1,
    }));
  };

  const toggleCommentBox = (id) => {
    setCommentBoxVisible((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handlePostComment = (id, comment) => {
    if (!comment.trim()) return;
    setComments((prevComments) => ({
      ...prevComments,
      [id]: [...(prevComments[id] || []), comment],
    }));
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const posts = JSON.parse(text);

      const response = await fetch(`${API_BASE_URL}/miclat/bulk-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posts),
      });

      if (!response.ok) throw new Error('Failed to upload posts');
      const data = await response.json();
      setPosts((prevPosts) => [...prevPosts, ...data]);
      alert('Bulk posts uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to upload bulk posts. Please ensure the file is valid.');
    }
  };

  if (loading) return <div className="loading-indicator">Loading posts...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <section className="newsfeed">
      <div className="feed-header">
        <h1 className="feed-title">Your Feed</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="button search-btn">Search</button>
          <Link to="/create" className="button primary-btn">+ Create Post</Link>
        </form>
      </div>

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <p>No posts yet. Be the first to share something!</p>
            <Link to="/create" className="button primary-btn">Create your first post</Link>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <span className="author-name">{post.author || 'Anonymous'}</span>
                  <span className="post-time">
                    {post.createdAt
                      ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                      : 'Unknown time'}
                  </span>
                </div>
              </div>

              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                {renderMedia(post)}
              </div>

              <div className="post-actions">
                <div className="action-group">
                  <button className="button like-btn" onClick={() => handleLike(post.id)}>
                    <span>👍</span> Like ({likes[post.id] || 0})
                  </button>
                  <button className="button comment-btn" onClick={() => toggleCommentBox(post.id)}>
                    <span>💬</span> Comment
                  </button>
                </div>

                {commentBoxVisible[post.id] && (
                  <div className="comment-box">
                    <textarea
                      placeholder="Write a comment..."
                      className="comment-textarea"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePostComment(post.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    ></textarea>
                    <button
                      className="button primary-btn"
                      onClick={(e) => {
                        const textarea = e.target.previousSibling;
                        handlePostComment(post.id, textarea.value);
                        textarea.value = '';
                      }}
                    >
                      Post Comment
                    </button>
                  </div>
                )}

                <div className="action-group">
                  <Link to={`/edit/${post.id}`} className="button secondary-btn">Edit</Link>
                  <button onClick={() => deletePost(post.id)} className="button danger-btn">Delete</button>
                </div>
              </div>

              <div className="post-comments">
                {comments[post.id]?.map((comment, index) => (
                  <div key={index} className="comment">
                    <p>{comment}</p>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default PostList;
