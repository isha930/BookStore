import React, { useEffect, useState } from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import BookCard from '../src/components/BookCard';

function BookStore() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Default popular books list (same as in Banner)
  const defaultBookTitles = [
    "The Alchemist",
    "Atomic Habits",
    "1984",
    "Ikigai",
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        let url;
        if (searchTerm.trim() === '') {
          // If search is empty, fetch default books
          const booksData = await Promise.all(
            defaultBookTitles.map(async (title) => {
              const response = await fetch(`http://localhost:5000/books?q=${title}`);

              if (!response.ok) throw new Error(`Failed to fetch ${title}`);
              const data = await response.json();
              return data.find((book) => book.title.toLowerCase() === title.toLowerCase());
            })
          );
          setBooks(booksData.filter(book => book !== undefined));
        } else {
          // Fetch books based on search
          url = `http://localhost:5000/books?q=${searchTerm}`;

          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch books');
          const data = await response.json();
          setBooks(data);
        }
      } catch (err) {
        setError('Error fetching books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20">
        {/* Page Heading */}
        <h2 className="font-extrabold text-center my-10 text-gray-800" style={{ fontSize: '4rem', paddingTop: 80}}>
          📚 <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Explore Our Book Collection
          </span> 📖
        </h2>

        {/* Search Input */}
        <div className="flex justify-center">
  <input
    type="text"
    placeholder="🔍 Search for your favorite books..."
    className="mt-4 p-5 w-full max-w-md border-2 rounded-lg shadow-md 
      bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 
      border-gray-300 dark:border-gray-700 
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 
      transition-all duration-300 text-xl placeholder-gray-500 dark:placeholder-gray-400"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

        {/* Error Message */}
        {error && <div className="text-red-500 dark:text-red-400 text-center mt-3">{error}</div>}

        {/* Books List */}
        {loading ? (
          <div className="text-center text-xl font-semibold dark:text-gray-300">Loading...</div>
        ) : (
          <div className="mt-6 space-y-6">
            {books.length === 0 ? (
              <div className="text-center text-lg dark:text-gray-400">No books found</div>
            ) : (
              books.map((book) => <BookCard key={book.id} book={book} />)
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default BookStore;
