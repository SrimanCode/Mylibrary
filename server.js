const express = require("express");
const axios = require("axios");
// user authetication
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const {
  registerUser,
  loginUser,
  getUserData,
  checkUserName,
  addBooks,
  BooksInfo,
  checkBook,
  BorrowBook,
  ReturnBook,
} = require("./src/database/database.js");

const app = express();
const PORT = 5000;
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/user", async (req, res) => {
  res.status(200).send({ success: "data point sucessfully hit!!" });
});

app.get("/userinfo", async (req, res) => {
  try {
    const result = await getUserData();
    if (result.length > 0) {
      res.json(result);
    } else {
      res.status(404).send({ error: "No user information found." });
    }
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(500)
      .send({ error: "Database error. Unable to fetch user information." });
  }
});

// user authentication
// user registration
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!(username && password && role)) {
    return res.status(400).send("All input is required");
  }
  const val = await checkUserName(username);
  if (val.length > 0) {
    return res.status(400).send("Username already registered");
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  const result = await registerUser(username, encryptedPassword, role);
  if (result) {
    res.status(201).send({ success: "User registered" });
  } else {
    res
      .status(500)
      .send({ error: "Database error or user could not be registered" });
  }
});

// user login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).send("All input is required");
  }
  result = await loginUser(username, password);
  if (result.success) {
    res.status(200).send({ success: "Login successful", role: result.role });
  } else {
    res.status(401).send({ error: "Login Failed" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// user forgets password
app.post("/resetPassword", async (req, res) => {
  const { password } = req.body;
  if (password.length <= 7) {
    return res.status(400).send("Atleast 7 character are required");
  }
});

// adding new books to the database
app.post("/addBooks", async (req, res) => {
  const { bookname, bookDesc, Available, Author, BookNumber, ISBN } = req.body;
  try {
    const bookExists = await checkBook(ISBN);
    if (bookExists) {
      // If the book exists, prevent addition and return a conflict error.
      return res
        .status(409)
        .send({ error: "Book already exists in the database" });
    }

    // Proceed to add the book since it does not exist.
    const result = await addBooks(
      bookname,
      bookDesc,
      Available,
      Author,
      BookNumber,
      ISBN
    );

    if (result) {
      // If adding the book was successful, sending a 201 Created status.
      res.status(201).send({ success: "Book successfully added" });
    } else {
      // If there was a problem adding the book, sending a 500 Internal Server Error.
      res.status(500).send({ error: "Failed to add book" });
    }
  } catch (error) {
    // Catch any unexpected errors and send a 500 Internal Server Error.
    console.error("Failed to add book:", error);
    res.status(500).send({ error: "An error occurred while adding the book" });
  }
});

// get the info about the book
app.get("/Bookinfo", async (req, res) => {
  result = await BooksInfo();
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ error: "Failed to fetch books" });
  }
});

//borrow books
app.post("/BorrowBook", async (req, res) => {
  const { userid, bookid } = req.body;
  try {
    const result = await BorrowBook(userid, bookid);
    if (result.success) {
      // If the operation was successful, send back a successful response
      res.status(200).json({ success: result.success });
    } else {
      // If the function returned an error message, send back an error response
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    // If an unexpected error occurs during the process, handle it by sending a server error response
    console.error("Error during book borrowing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// return book
app.patch("/Return", async (req, res) => {
  const { userid, bookid } = req.body;
  try {
    const result = await ReturnBook(userid, bookid);
    if (result.success) {
      res.status(200).send({ success: result.success });
    } else if (
      result.error === "User does not exist" ||
      result.error === "Book does not exist"
    ) {
      res.status(404).send({ error: result.error }); // Not Found for missing user or book
    } else if (result.error === "No loan exists for this user and book") {
      res.status(409).send({ error: result.error }); // Conflict if trying to return a non-loaned book
    } else {
      res.status(400).send({ error: result.error }); // Bad Request for other types of logical errors
    }
  } catch (err) {
    console.error("Error during book return:", err);
    res.status(500).json({ error: "Internal server error" }); // Internal Server Error for unexpected failures
  }
});
