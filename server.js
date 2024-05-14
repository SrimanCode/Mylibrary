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
