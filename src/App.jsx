import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        {/* Navigation Bar */}
        <nav className="navbar">
          <h1 className="logo">
            <Link to="/" onClick={() => window.location.reload()}>
              Postify
            </Link>
          </h1>
          <div className="nav-center">
            <Link to="/" className="nav-button elevated-button" onClick={() => window.location.reload()}>
              Home
            </Link>
          </div>
          <div className="nav-controls">
            <button className="dark-mode-toggle" onClick={toggleDarkMode}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/create" element={<PostForm />} />
            <Route path="/edit/:id" element={<PostForm />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} Postify</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;