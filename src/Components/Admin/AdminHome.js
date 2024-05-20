import React, { useState, useEffect } from "react";
import UserList from "./Users";

function AdminHome() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    bookname: "",
    bookDesc: "",
    Author: "",
    BookNumber: 0,
    ISBN: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/Bookinfo")
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Error fetching books:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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
        // setBooks((prevBooks) => [...prevBooks, data]);
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

  return (
    <>
      <div className="container p-4 mx-auto">
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
            {books.map((book) => (
              <div
                key={book.ISBN}
                className="p-4 space-y-2 bg-white rounded shadow"
              >
                <p>
                  <strong>Name:</strong> {book.BookName}
                </p>
                <p>
                  <strong>Description:</strong> {book.BookDescription}
                </p>
                <p>
                  <strong>Author:</strong> {book.Author}
                </p>
                <p>
                  <strong>Book Number:</strong> {book.BookNumber}
                </p>
                <p>
                  <strong>ISBN:</strong> {book.ISBN}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
