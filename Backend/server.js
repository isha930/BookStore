import express from "express";
import cors from "cors";
import dotenv from "dotenv";    
import pkg from "pg";
import axios from "axios";

const { Pool } = pkg;

dotenv.config(); // Load environment variables

const app = express();
const port = 5000;


// Whitelist of allowed origins
const allowedOrigins = [
  'https://book-store-psi-five.vercel.app'
];

// Proper CORS config
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin'), false);
    }
  },
  credentials: true
}));
 // Adjust with your frontend's port

app.use(express.json());

// Database Pool connection
const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,  // Supabase requires SSL, so allow it here
  },
});

// Function to insert a book into the database
// Route to fetch books from Google Books API and store in the database
app.get('/fetch-books', async (req, res) => {
  try {
    const apiKey = process.env.VITE_GOOGLE_BOOKS_API_KEY; // Use environment variable for API key

    if (!apiKey) {
      throw new Error('API key is missing');
    }

    const categories = ['coding','DSA','Development','Engineering','Medical','cooking','Java','Python',
      'programming languages','programming','artificial intelligence','machine learning','deep learning'
      ,'reinforcement learning','Andrew Ng','software engineering','biology',
      'kiit','image processing','computational intelligence','neural networks',
      'convolutional neural networks','data mining','life lessons','fiction','harry potter','j.k rowling','Atomic Habits'
      ,'James Clear','The Alchemist','Paulo Coelho','1984','George Orwell','The Great Gatsby',
      'F. Scott','Pride and Prejudice','Jane Austen','To Kill a Mockingbird','Harper Lee','The Catcher in the Rye',
      'J.D. Salinger','The Lord of the Rings','J.R.R. Tolkien','The Hobbit',
      'J.R.R. Tolkien','The Da Vinci Code','Dan Brown','Angels & Demons'
      
    ]; // General categories to fetch books
    const maxResults = 40; // Max results per API call

    for (const category of categories) {
      let startIndex = 0;
      let hasMoreResults = true;

      while (hasMoreResults) {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${category}&key=${apiKey}&maxResults=${maxResults}&startIndex=${startIndex}`
        );

        if (!response.data.items || response.data.items.length === 0) {
          hasMoreResults = false;
          break;
        }

        const books = response.data.items.map((item) => ({
          title: item.volumeInfo.title || 'No title available',
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
          description: item.volumeInfo.description || 'No description available',
          image_url: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
          price: (Math.random() * (50 - 10) + 10).toFixed(2), // Simulate book price
          genre: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Unknown Genre',
          publishedDate: item.volumeInfo.publishedDate || null,
          pageCount: item.volumeInfo.pageCount || null,
          language: item.volumeInfo.language || 'Unknown',
          infoLink: item.volumeInfo.infoLink || null,
          previewLink: item.volumeInfo.previewLink || null,
        }));

        for (const book of books) {
          await insertBook(book); // Custom function to insert books into the database
        }

        startIndex += maxResults;
        hasMoreResults = response.data.items.length === maxResults;
      }
    }

    res.json({ message: 'Books fetched and stored successfully' });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
});

// Route to search books from the database
app.get('/books', async (req, res) => {
  try {
    const searchTerm = req.query.q || ''; // Search term from query params
    const query = `
  SELECT id, title, author, description, image_url, genre, language, pagecount, publisheddate, previewlink
  FROM books
  WHERE title ILIKE $1 OR author ILIKE $1
  LIMIT 10; -- Adjust limit as needed
`;

    const result = await db.query(query, [`%${searchTerm}%`]); // Query with case-insensitive partial match

    if (result.rows.length === 0) {
      return res.status(404).send('No books found for the given search term');
    }

    res.json(result.rows); // Send matched books as JSON
  } catch (error) {
    console.error('Error fetching books from database:', error);
    res.status(500).send('Error fetching books from database');
  }
});

// Helper function to insert a book into the database
const insertBook = async (book) => {
  const { 
    title, 
    author, 
    description, 
    image_url, 
    price, 
    genre, 
    publishedDate, 
    pageCount, 
    language, 
    infoLink, 
    previewLink 
  } = book;
  
  try {
    // Check if the book already exists
    const checkQuery = 'SELECT * FROM books WHERE title = $1 AND author = $2';
    const checkValues = [title, author];
    const checkResult = await db.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      return; // Skip inserting if it already exists
    }

    // Validate and format publishedDate
    let validPublishedDate = null;
    if (publishedDate && /^\d{4}(-\d{2})?(-\d{2})?$/.test(publishedDate)) {
      validPublishedDate = publishedDate.length === 7 
        ? `${publishedDate}-01` // Default to first day if only year and month are provided
        : publishedDate.length === 4 
        ? `${publishedDate}-01-01` // Default to Jan 1st if only year is provided
        : publishedDate;
    }

    const query = `
      INSERT INTO books (title, author, description, image_url, price, genre, publishedDate, pageCount, language, infoLink, previewLink)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, title, author, description, image_url, price, genre, publishedDate, pageCount, language, infoLink, previewLink, created_at;
    `;
    const values = [
      title, 
      author, 
      description, 
      image_url, 
      price, 
      genre, 
      validPublishedDate, // Use validated or null date
      pageCount, 
      language, 
      infoLink, 
      previewLink
    ];
    
    const res = await db.query(query, values);
    console.log('Inserted book:', res.rows[0]); // Log the inserted book
    return res.rows[0]; // Return the inserted book with its fields
  } catch (error) {
    console.error('Error inserting book:', error);
  }
};

app.post('/bookshelf', async (req, res) => {
  const { userId, bookId } = req.body;
  console.log('Received userId:', userId, 'Received bookId:', bookId); // Debug

  if (!userId || !bookId) {
      console.error('Missing userId or bookId:', { userId, bookId }); // Debug
      return res.status(400).json({ error: 'User ID and Book ID are required' });
  }

  try {
      // Check if the book is already in the wishlist
      const checkQuery = 'SELECT * FROM wishlist WHERE user_id = $1 AND book_id = $2';
      const checkResult = await db.query(checkQuery, [userId, bookId]);
      console.log('Check query result:', checkResult.rows); // Debug

      if (checkResult.rows.length > 0) {
          console.log('Book already exists in wishlist'); // Debug
          return res.status(409).json({ message: 'Book is already in your wishlist' });
      }

      // Insert new book into the wishlist
      const insertQuery = 'INSERT INTO wishlist (user_id, book_id, created_at) VALUES ($1, $2, NOW())';
      const insertResult = await db.query(insertQuery, [userId, bookId]);
      console.log('Insert query result:', insertResult); // Debug
      res.status(201).json({ message: 'Book added to wishlist successfully' });
  } catch (error) {
      console.error('Error adding book to wishlist:', error); // Debug
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const query = 'SELECT books.* FROM books INNER JOIN wishlist ON books.id = wishlist.book_id WHERE wishlist.user_id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No books found in wishlist' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Route to fetch all books from your database
// Route to save user data to the database
app.post('/api/save-user', async (req, res) => {
  const { username, email } = req.body; // Destructure without `id`

  try {
    // Step 1: Check if the user already exists by email
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // Step 2: If user exists, do nothing
    if (existingUser.rows.length > 0) {
      return res.status(200).json({ message: 'User already exists. No action taken.' });
    }

    // Step 3: If user does not exist, insert new user into the database
    await db.query(
      'INSERT INTO users (username, email, created_at) VALUES ($1, $2, $3)', // No `id` field here
      [username, email, new Date().toISOString()] // Ensure created_at is set to the current date
    );

    // Step 4: Respond with a success message
    return res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error saving user:', error.message); // Log the error
    return res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 error
  }
});

// Define route to fetch user ID based on email
app.get('/api/get-user-id/:email', async (req, res) => {
  // Sanitize email: Trim spaces and remove trailing dots
  let email = req.params.email.trim();
  if (email.endsWith('.')) {
      email = email.slice(0, -1); // Remove last character if it's a dot
  }
  console.log("Sanitized email:", email); // Debug log

  try {
      const query = 'SELECT id FROM users WHERE email = $1';
      const values = [email];
      console.log("Executing query:", query, "with values:", values);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
          console.log("User not found in database");
          return res.status(404).json({ error: 'User not found' });
      }

      console.log("User found:", result.rows[0]);
      res.json({ userId: result.rows[0].id });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
//Delete a book from wishlist 
app.delete('/wishlist/:userId/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;

  if (!userId || !bookId) {
    return res.status(400).json({ error: 'User ID and Book ID are required' });
  }

  try {
    const query = 'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2';
    const result = await db.query(query, [userId, bookId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Book not found in wishlist' });
    }

    res.json({ message: 'Book removed from wishlist successfully' });
  } catch (err) {
    console.error('Error deleting book from wishlist:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}
) ;




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
