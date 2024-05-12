const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Sriman123*',
    database: 'practiceDB'
});

/*
async function getJokes() {
    const [result] = await pool.query("SELECT * FROM jokes");
    return result;
}

async function insertJoke(question, answer) {
    const sql = "INSERT INTO jokes (question, answer) VALUES (?, ?)";
    try {
        const [result] = await pool.query(sql, [question, answer]);
        console.log("1 record inserted, ID: " + result.insertId);
        return result;
    } catch (err) {
        throw err;
    }
}
*/

const checkUserName = async (username) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    try {
        const [result] = await pool.query(sql, username)
        return result;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};
const getUserData = async () => {
    const sql = "SELECT username, role FROM users";
    try {
        const [result] = await pool.query(sql);
        return result;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

const registerUser = async (username, password, role) => {
    try {
        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        const [result] = await pool.query(sql, [username, password, role]);
        console.log("User successfully created with ID:", result.insertId)
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
            for (let user of rows) {
                const passwordIsValid = bcrypt.compareSync(password, user.password);
                if (passwordIsValid) {
                    loginSuccess = true;
                    break;
                }
            }
            return loginSuccess;  
        } else {
            console.log('No user found with that username');
            return false;  
        }

    } catch (err) {
        console.error('Database error:', err.message);
        return false;  
    }
};


module.exports = {registerUser, loginUser, getUserData, checkUserName};
