import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function PostForm() {
  const [post, setPost] = useState({
    title: '',
    content: '',
    mediaUrl: '',
    mediaType: 'none',
    author: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/miclat/posts/${id}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const data = await response.json();
          
          setPost({
            title: data.title,
            content: data.content,
            mediaUrl: data.mediaUrl || '',
            mediaType: data.mediaType || 'none',
            author: data.author || ''
          });
        } catch (err) {
          console.error(err);
          setError('Failed to load post data');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaTypeChange = (type) => {
    setPost(prev => ({
      ...prev,
      mediaType: type,
      mediaUrl: type === 'none' ? '' : prev.mediaUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (post.mediaType === 'video' && post.mediaUrl) {
      try {
        new URL(post.mediaUrl);
      } catch {
        setError('Please enter a valid video URL');
        setLoading(false);
        return;
      }
    }

    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `${API_BASE_URL}/miclat/posts/${id}`
      : `${API_BASE_URL}/miclat/post`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save post');
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-post-section">
      <h1 className="section-title">{id ? 'Edit Post' : 'Create Post'}</h1>
      
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              name="author"
              type="text"
              value={post.author}
              onChange={handleChange}
              placeholder="Your name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={post.title}
              onChange={handleChange}
              placeholder="Post title"
              className="form-input"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={post.content}
              onChange={handleChange}
              placeholder="Write something..."
              rows={6}
              className="form-textarea"
              required
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label>Media Type</label>
            <div className="media-type-selector">
              <button
                type="button"
                className={`button ${post.mediaType === 'none' ? 'primary-btn' : 'secondary-btn'}`}
                onClick={() => handleMediaTypeChange('none')}
              >
                None
              </button>
              <button
                type="button"
                className={`button ${post.mediaType === 'image' ? 'primary-btn' : 'secondary-btn'}`}
                onClick={() => handleMediaTypeChange('image')}
              >
                Image
              </button>
              <button
                type="button"
                className={`button ${post.mediaType === 'video' ? 'primary-btn' : 'secondary-btn'}`}
                onClick={() => handleMediaTypeChange('video')}
              >
                Video
              </button>
            </div>
          </div>

          {post.mediaType !== 'none' && (
            <div className="form-group">
              <label htmlFor="mediaUrl">
                {post.mediaType === 'image' ? 'Image URL' : 'Video URL'}
              </label>
              <input
                id="mediaUrl"
                name="mediaUrl"
                type="url"
                value={post.mediaUrl}
                onChange={handleChange}
                placeholder={
                  post.mediaType === 'image' 
                    ? 'https://example.com/image.jpg' 
                    : 'https://youtube.com/watch?v=...'
                }
                className="form-input"
              />
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="button secondary-btn"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                id ? 'Update Post' : 'Publish Post'
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default PostForm;
