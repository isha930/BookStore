import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context/UserContext"; // Import UserProvider
import Home from "./home/Home";
import BookStore from "../pages/BookStore";
import BookShelfPage from "../pages/BookShelfPage";

function App() {
  return (
    <UserProvider > {/* Wrap routes with UserProvider */}
      <Routes>
        {/* Define the route for the Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/bookStore" element={<BookStore />} />
        <Route path="/bookShelf" element={<BookShelfPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
