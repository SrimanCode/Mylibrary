const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Sriman123*",
  database: "practiceDB",
});

const checkUserName = async (username) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  try {
    const [result] = await pool.query(sql, username);
    return result;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
};

const getUserData = async () => {
  const sql = "SELECT username, role FROM users";
  try {
    const [result] = await pool.query(sql);
    return result;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
};

const registerUser = async (username, password, role) => {
  try {
    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    const [result] = await pool.query(sql, [username, password, role]);
    console.log("User successfully created with ID:", result.insertId);
    return true;
  } catch (err) {
    console.error("Database error:", err.message);
    return false;
  }
};

const loginUser = async (username, password) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  try {
    const [rows] = await pool.query(sql, [username]);
    if (rows.length) {
      let loginSuccess = false;
      let UserRole = null;
      let userid = null;
      for (let user of rows) {
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (passwordIsValid) {
          loginSuccess = true;
          UserRole = user.role;
          userid = user.id;
          break;
        }
      }
      return { success: loginSuccess, role: UserRole, id: userid };
    } else {
      console.log("No user found with that username");
      return false;
    }
  } catch (err) {
    console.error("Database error:", err.message);
    return false;
  }
};

//checking if the book already exist in the database
const checkBook = async (ISBN) => {
  try {
    const sql = "SELECT 1 FROM Books WHERE ISBN = ?";
    const [result] = await pool.query(sql, [ISBN]);
    // parameterized queries to protect the database from SQL injection
    if (result.length === 0) {
      return false;
    }
    return true;
  } catch {
    console.error("Error checking book availability:", error);
    throw error;
  }
};

// book information

const BooksInfo = async () => {
  try {
    const sql = "SELECT * FROM Books";
    const [result] = await pool.query(sql);
    return result;
  } catch (err) {
    return false;
  }
};

// adding books to the database
const addBooks = async (
  bookname,
  bookDesc,
  Available,
  Author,
  BookNumber,
  ISBN
) => {
  try {
    const sql =
      "INSERT INTO Books(BookName, BookDescription, Available, Author, BookNumber, ISBN) VALUES(?, ?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      bookname,
      bookDesc,
      Available,
      Author,
      BookNumber,
      ISBN,
    ]);
    return true;
  } catch (err) {
    console.error("Database error:", err.message);
    return false;
  }
};

// Checks if a user exists in the database
const checkUser = async (userid) => {
  const query = "SELECT 1 FROM users WHERE id = ?";
  const [userExist] = await pool.query(query, [userid]);
  return userExist.length > 0;
};

// Checks if a book is available in the database
const checkbook = async (bookid) => {
  const query = "SELECT 1 FROM books WHERE Bookid = ?";
  const [bookAvailable] = await pool.query(query, [bookid]);
  return bookAvailable.length > 0;
};

// Checks if there is an existing loan for the user and book
const checkLoan = async (userid, bookid) => {
  const query = "SELECT 1 FROM loans WHERE user_id = ? AND book_id = ?";
  const [loanExist] = await pool.query(query, [userid, bookid]);
  return loanExist.length > 0;
};

const BorrowBook = async (userid, bookid) => {
  try {
    if (!(await checkUser(userid))) {
      return { error: "User does not exist" };
    }

    if (!(await checkbook(bookid))) {
      return { error: "Book is not available" };
    }
    if (await checkLoan(userid, bookid)) {
      return { error: "Book is already on loan" };
    }
    // Insert loan record
    const sql =
      "INSERT INTO loans (user_id, book_id, due_date) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 1 MONTH))";
    await pool.query(sql, [userid, bookid]);

    // Update the book availability
    const updateBookAvailability =
      "UPDATE books SET BookNumber = BookNumber - 1 WHERE Bookid = ?";
    await pool.query(updateBookAvailability, [bookid]);

    return { success: "Loan approved" };
  } catch (err) {
    console.error("Unable to approve the book loan:", err);
    return {
      error: "Unable to approve the book loan due to an internal error.",
    };
  }
};

// return the book than was in loan
const ReturnBook = async (userid, bookid) => {
  try {
    if (!(await checkUser(userid))) {
      return { error: "User does not exist" };
    }

    if (!(await checkbook(bookid))) {
      return { error: "Book is not available" };
    }

    if (!(await checkLoan(userid, bookid))) {
      return { error: "No loan exists for this user and book" };
    }

    const sql = "DELETE FROM loans WHERE user_id = ? AND book_id = ?";
    const [result] = await pool.query(sql, [userid, bookid]);

    // Update the book availability
    const updateBookAvailability =
      "UPDATE books SET BookNumber = BookNumber + 1 WHERE Bookid = ?";
    await pool.query(updateBookAvailability, [bookid]);
    return { success: "Book return successfully" };
  } catch (err) {
    console.error("Error during book return:", err);
    return { error: "Unable to return the book due to an internal error." };
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserData,
  checkUserName,
  addBooks,
  BooksInfo,
  checkBook,
  BorrowBook,
  ReturnBook,
};
