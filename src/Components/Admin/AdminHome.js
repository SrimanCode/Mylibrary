import React, { useState, useEffect } from "react";
import UserList from "./Users";
import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    bookname: "",
    bookDesc: "",
    Author: "",
    BookNumber: 0,
    ISBN: "",
  });

  useEffect(() => {
    const userRole = sessionStorage.getItem("user");
    const userObject = JSON.parse(userRole);
    if (userObject.role !== "admin") {
      navigate("/home", { replace: true });
      return;
    }
    fetch("http://localhost:5000/Bookinfo", {
      headers: {
        "x-access-token": sessionStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.auth) {
          navigate("/login", { replace: true });
          return;
        }
        setBooks(data.message);
      })
      .catch((error) => {
        console.error("Failed to fetch books:", error);
      });
  }, [navigate, setBooks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  function DeleteButton(bookid) {
    fetch("http://localhost:5000/deletebooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        bookid: bookid,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBooks();
        console.log(data.message);
      })
      .catch((error) => {
        alert("Error deleting the book: " + error.message); // Alert any error that occurs
      });
  }
  function Update(book) {
    setFormData({
      bookname: book.BookName,
      bookDesc: book.BookDescription,
      Author: book.Author,
      BookNumber: book.BookNumber,
      ISBN: book.ISBN,
    });
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/addBooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookname: formData.bookname,
        bookDesc: formData.bookDesc,
        Author: formData.Author,
        BookNumber: Number(formData.BookNumber),
        ISBN: formData.ISBN,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBooks((prevBooks) => [...prevBooks, data.result]);
        setFormData({
          bookname: "",
          bookDesc: "",
          Author: "",
          BookNumber: 0,
          ISBN: "",
        });
      })
      .catch((error) => console.error("Failed to add book:", error));
  };
  function handleLogout() {
    //auth.logout();
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }
  return (
    <>
      <div className="container p-4 mx-auto">
        <div className="flex justify-between">
          <button
            onClick={handleLogout}
            className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
          <h1 className="text-2xl font-bold text-blue-800">Total Users: 0</h1>
          <h1 className="text-2xl font-bold text-blue-800">
            Total Books: {books.length}
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-8 pt-6 pb-8 mb-4 mb-6 bg-white rounded shadow-md"
        >
          <h2 className="mb-6 text-2xl font-semibold">Add a New Book</h2>
          {Object.entries(formData).map(([key, value]) => (
            <div className="mb-4" key={key}>
              <label
                className="block mb-2 text-sm font-bold text-gray-700"
                htmlFor={key}
              >
                {key.charAt(0).toUpperCase() +
                  key
                    .slice(1)
                    .replace("Desc", " Description")
                    .replace("Number", " Number")}
              </label>
              <input
                type={
                  key === "BookNumber" || key === "ISBN" ? "number" : "text"
                }
                id={key}
                name={key}
                placeholder={`Enter ${key}`}
                value={value}
                onChange={handleChange}
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>
          ))}
          <button
            type="submit"
            className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Add Book
          </button>
        </form>
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Library Inventory</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books &&
              books.map((book) => (
                <div
                  key={book.ISBN}
                  className="flex flex-col justify-between p-6 space-y-4 rounded-lg shadow-lg bg-gradient-to-br from-gray-50 to-blue-50"
                >
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      <strong>Name:</strong> {book.BookName}
                    </p>
                    <p className="text-base text-gray-700">
                      <strong>Description:</strong> {book.BookDescription}
                    </p>
                    <p className="text-lg font-medium text-gray-800">
                      <strong>Author:</strong> {book.Author}
                    </p>
                    <p className="text-lg text-gray-800">
                      <strong>Book Number:</strong> {book.BookNumber}
                    </p>
                    <p className="text-lg text-gray-800">
                      <strong>ISBN:</strong> {book.ISBN}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      onClick={() => DeleteButton(book.Bookid)}
                    >
                      Delete
                    </button>
                    <button
                      className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      onClick={() => Update(book)}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
