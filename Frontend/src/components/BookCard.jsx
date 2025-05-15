import React from 'react';
import { useUserContext } from '../Context/UserContext';

function BookCard({ book, onRemove }) {
  const { userId } = useUserContext();

  if (!book) return null; // Prevent rendering issues if book is undefined

  const addToWishlist = async () => {
    if (!userId) {
      alert('Please log in to add books to your bookshelf.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/bookshelf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(userId), bookId: parseInt(book.id) }),
      });
      

      if (response.status === 409) {
        alert('This book is already in your bookshelf.');
        return;
      }

      if (!response.ok) throw new Error('Unexpected error occurred.');

      alert('Book added to your bookshelf!');
    } catch (error) {
      alert('Failed to add book to bookshelf.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-12 my-12  shadow-xl rounded-lg bg-white dark:bg-gray-800 dark:shadow-gray-900 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      {/* Book Cover */}
      <figure className="flex justify-center">
        <img
          src={book.image_url || 'https://via.placeholder.com/150'}
          alt={book.title || "Unknown Title"}
          className="w-32 h-48 object-cover rounded-md shadow-md transition-transform duration-300 hover:scale-105"
        />
      </figure>

      {/* Book Details */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{book.title || "No Title"}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">by {book.author || "Unknown Author"}</p>
        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{book.description || "No description available."}</p>

        {/* Buttons */}
        <div className="mt-4 flex gap-4 justify-center sm:justify-start">
          {book.previewlink && (
            <a
              href={book.previewlink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-400 transition-all duration-200 shadow-md"
            >
              Read
            </a>
          )}

          {onRemove ? (
            <button
              onClick={() => onRemove(book.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 dark:hover:bg-red-400 transition-all duration-200 shadow-md"
            >
              Remove from Bookshelf
            </button>
          ) : (
            <button
              onClick={addToWishlist}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 dark:hover:bg-pink-400 transition-all duration-200 shadow-md"
            >
              Add to Bookshelf
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
