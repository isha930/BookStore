import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize `userId` from localStorage if it exists
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? JSON.parse(storedUserId) : null;
  });

  // Function to fetch user ID from the backend based on email
  const fetchUserId = async (email) => {
    try {
      console.log("Fetching user ID for email:", email);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/get-user-id/${email}`);
      
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error fetching user ID:", errorResponse);
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from backend:", data);

      // Update `userId` state and store it in localStorage
      setUserId(data.userId);
      localStorage.setItem("userId", JSON.stringify(data.userId));
      console.log("Updated userId state and saved to localStorage:", data.userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  // Effect to sync `userId` with `localStorage` on change
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", JSON.stringify(userId));
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  // Clear user data on logout
  const logout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    console.log("User logged out and localStorage cleared.");
  };

  return (
    <UserContext.Provider value={{ userId, fetchUserId, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use UserContext
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
