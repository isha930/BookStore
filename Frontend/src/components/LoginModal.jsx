import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios'; // to send data to backend
import { useUserContext } from '../Context/UserContext'; 

const LoginModal = ({onLogin}) => {
  const [user, setUser] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); // State to control logout confirmation popup
  const { fetchUserId } = useUserContext();

  // Check localStorage for user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = async (res) => {
    try {
      const userData = window.jwt_decode(res.credential);
      console.log("User Data from Google Login:", userData);
      setUser(userData);

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Send user data to backend
      await axios.post('http://localhost:5000/api/save-user', {
        id: userData.sub, 
        username: userData.name,
        email: userData.email,
        created_at: new Date().toISOString(),
      });

      console.log("User data sent to backend successfully");

      // Fetch user ID
      await fetchUserId(userData.email);
      console.log('User ID fetched and set in context');

      onLogin(true);
    } catch (error) {
      console.error("Error sending user data to backend:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    googleLogout();

    // Remove user data from localStorage on logout
    localStorage.removeItem('user');
    
    setShowLogoutPopup(false); 
    onLogin(false); // Hide the popup after logout
  };

  const handleProfileClick = () => {
    setShowLogoutPopup(true); // Show the logout confirmation popup
  };
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      onLogin(true); // Set login state
    }
  }, []);
  

  return (
    <div className="navbar bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-md p-4">
  <div className="navbar-content flex justify-between items-center">
    {/* Conditional rendering based on user authentication */}
    {user ? (
      <div className="flex items-center">
        {/* Display user profile image in the navbar */}
        <img
          src={user.picture}
          alt="User Profile"
          className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-700"
          onClick={handleProfileClick} // Show logout popup on click
        />
        <span className="ml-2 font-semibold">Welcome, {user.name}!</span>
      </div>
    ) : (
      <div className="flex items-center">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log('Login Failed')}
          className="!border-0 !shadow-none" // Removes border & shadow
        />
      </div>
    )}
  </div>

  {/* Logout Confirmation Popup */}
  {showLogoutPopup && (
    <dialog id="logout_popup" className="modal" open>
      <div className="modal-box bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg">
        <h3 className="font-bold text-lg">Are you sure you want to logout?</h3>
        <div className="modal-action flex justify-end space-x-4 mt-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition">
            Yes
          </button>
          <button
            onClick={() => setShowLogoutPopup(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition"
          >
            No
          </button>
        </div>
      </div>
    </dialog>
  )}
</div>
  );
}

export default LoginModal;
