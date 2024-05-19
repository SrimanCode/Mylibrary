import React, { useState } from "react";
import axios from "axios";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";
import bookImg from "../Images/books.avif";

function setToken(userToken) {
  sessionStorage.setItem("token", JSON.stringify(userToken));
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  let navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      setToken(response.data.token); // Store the token in session storage
      auth.login(response.data); // Update auth context or state
      if (response.data.role === "user") {
        navigate("/home", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Failed to login:", error.response.data);
      alert("Login Failed!");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-center bg-cover "
      style={{ backgroundImage: `url(${bookImg})` }}
    >
      <h1 className="w-full max-w-2xl p-5 mb-10 font-bold text-center text-yellow-100 rounded-lg hadow-md text-7xl">
        BookCompass
      </h1>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Username:
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
          <div>
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-700 underline ">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
