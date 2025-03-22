import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import BookCard from '../src/components/BookCard';
import { useUserContext } from "../src/Context/UserContext";
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

const BookShelfPage = () => {
  const [wishlist, setWishlist] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { userId } = useUserContext();

  // Fetch books in the wishlist
  const fetchWishlist = async () => {
    if (!userId) {
      alert('Please log in to view your bookshelf.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/wishlist/${userId}`);
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchWishlist();
  }, [userId]);

  // Remove book from bookshelf with confirmation
  const removeFromWishlist = async (bookId) => {
    if (!userId) {
      alert('Please log in to remove books.');
      return;
    }

    // Show confirmation popup
    const confirmDelete = window.confirm("Are you sure you want to remove this book from your bookshelf?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/${userId}/${bookId}`);
      setWishlist((prevWishlist) => prevWishlist.filter((book) => book.id !== bookId));
      alert('Book removed from your bookshelf!');
    } catch (error) {
      console.error('Error removing book:', error);
      alert('Failed to remove book.');
    }
  };

  return (
    <div >
      <Navbar />
      <div className="container mx-auto p-4  pt-100rem mt-200rem">
      <h2 className="font-extrabold text-center my-10 text-gray-800" style={{ fontSize: '4rem',paddingTop: 80}}>
  📚 <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
    Your Bookshelf
  </span> 📖
</h2>
{loading ? (
    <p className="text-center text-lg text-gray-600">Loading your bookshelf...</p>
  ) : (
    <div className="mt-6 space-y-6">
      {wishlist.length === 0 ? (
        <div className="text-center text-lg text-gray-500">Your bookshelf is empty.</div>
      ) : (
        wishlist.map((book) => <BookCard key={book.id} book={book} onRemove={removeFromWishlist} />)
      )}
    </div>
  )}
</div>
<Footer />
    </div>
  );
}
export default BookShelfPage;
