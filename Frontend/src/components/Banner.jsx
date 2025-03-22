import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";

function Banner() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bookTitles = [
    "The Alchemist",
    "Atomic Habits",
    "1984",
    "Ikigai",
  ]; // List of book titles to fetch

  useEffect(() => {
    const fetchPopularBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const booksData = await Promise.all(
          bookTitles.map(async (title) => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/books?q=${title}`);

            if (!response.ok) {
              throw new Error(`Failed to fetch ${title}`);
            }
            const data = await response.json();
            return data.find(
              (book) => book.title.toLowerCase() === title.toLowerCase()
            ); // find the book and return it
          })
        );

        setPopularBooks(booksData.filter(book => book !== undefined)); // update the state with only the books that we fetched correctly
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  return (
    <>
      {/* Banner Section */}
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row my-10">
          {/* Left Section */}
          <div className="w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-36">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              Welcome to{" "}
              <span className="text-pink-500">BookVerse</span>,
              <br />
              Discover Your Next Favorite Book!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Explore our vast collection of books and find something new to
              read every day.
            </p>
            <Link to="/bookStore">
              <button className="mt-6 px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Explore Now 📖
              </button>
            </Link>
          </div>

          {/* Right Section */}
          <div className="order-1 w-full mt-12 md:w-1/2 flex justify-center">
            <img
              src="/Banner.png"
              className="md:w-[550px] md:h-[460px] md:ml-12 rounded-lg shadow-lg"
              alt="Books Banner"
            />
          </div>
        </div>
      </div>

      {/* Popular Books Section */}
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 my-16">
  <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
    📚 Popular Books
  </h2>

  {loading && <p className="text-center">Loading...</p>}
  {error && <p className="text-center text-red-500">Error: {error}</p>}

  <div className="mt-6 space-y-6">
    {popularBooks.length === 0 ? (
      <div className="text-center text-lg dark:text-gray-400">No books found</div>
    ) : (
      popularBooks.map((book) => <BookCard key={book.id} book={book} />)
    )}
  </div>
</div>

    </>
  );
}

export default Banner;
