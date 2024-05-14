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
      console.log(rows);
      for (let user of rows) {
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (passwordIsValid) {
          loginSuccess = true;
          UserRole = user.role;
          break;
        }
      }
      return { success: loginSuccess, role: UserRole };
    } else {
      console.log("No user found with that username");
      return false;
    }
  } catch (err) {
    console.error("Database error:", err.message);
    return false;
  }
};

module.exports = { registerUser, loginUser, getUserData, checkUserName };
