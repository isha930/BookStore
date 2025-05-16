import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const element = document.documentElement;

  // Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
      element.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      element.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Sticky Navbar Effect
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check User Login Status
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedUser = localStorage.getItem('user');
      setIsLoggedIn(!!storedUser);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-20 flex items-center transition-all duration-300 z-50 
        ${sticky ? 'shadow-md bg-white dark:bg-gray-900 dark:shadow-gray-800' : 'bg-white dark:bg-gray-900'}`}
    >
      <div className="container mx-auto flex justify-between items-center px-6 py-5">
        {/* Left - Logo */}
        <Link to="/" className="text-3xl font-extrabold flex items-center space-x-2 text-gray-900 dark:text-gray-200">
          📚 <span>BookVerse</span>
        </Link>

        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden text-3xl cursor-pointer" onClick={toggleMenu}>
          ☰
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6">
          <Link to="/bookStore" className="text-xl font-bold text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
            📖 Bookstore
          </Link>
          {isLoggedIn && (
            <Link to="/bookshelf" className="text-xl font-bold text-gray-800 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400">
              📚 My Bookshelf
            </Link>
          )}
        </div>

        {/* Right Side (Desktop) */}
        <div className="hidden md:flex items-center space-x-5">
          <button onClick={handleThemeToggle} className="text-3xl transition-transform transform hover:scale-110">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <LoginModal onLogin={setIsLoggedIn} />
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-md flex flex-col items-center space-y-4 py-4 z-40">
          <Link to="/bookStore" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-gray-800 dark:text-gray-300">
            📖 Bookstore
          </Link>
          {isLoggedIn && (
            <Link to="/bookshelf" onClick={() => setMenuOpen(false)} className="text-lg font-semibold text-gray-800 dark:text-gray-300">
              📚 My Bookshelf
            </Link>
          )}
          <button
            onClick={() => {
              handleThemeToggle();
              setMenuOpen(false);
            }}
            className="text-2xl"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <LoginModal onLogin={(val) => {
            setIsLoggedIn(val);
            setMenuOpen(false);
          }} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
