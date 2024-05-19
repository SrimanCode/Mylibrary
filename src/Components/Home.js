import { useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [bookList, setBookList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
    fetch("http://localhost:5000/Bookinfo")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => setBookList(data))
      .catch((error) => {
        setError("Failed to fetch data: " + error.message);
      });
  }, [navigate]);

  function handleLogout() {
    auth.logout();
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  function handleRentBook(bookId) {
    const userId = auth.user.id;
    fetch("http://localhost:5000/BorrowBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid: userId, bookid: bookId }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to borrow book");
      })
      .then((data) => {
        alert("Book borrowed successfully");
        // Optionally, trigger a refresh or state update
      })
      .catch((error) => {
        setError(`Failed to borrow book: ${error.message}`);
      });
  }

  return (
    <div className="container px-4 py-4 mx-auto">
      <button
        onClick={handleLogout}
        className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
      >
        Logout
      </button>
      {error && (
        <div
          className="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {bookList.map((book) => (
          <div
            key={book.Bookid}
            className="flex flex-col overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-xl"
          >
            <img
              src={book.ImageURL || "https://via.placeholder.com/400x300"}
              alt={book.BookName}
              className="object-cover w-full h-48"
            />
            <div className="flex flex-col flex-grow p-4">
              <h3 className="text-lg font-semibold text-blue-800">
                {book.BookName}
              </h3>
              <p className="flex-grow text-sm text-gray-600">
                {book.BookDescription}
              </p>
              <div className="mt-4 text-gray-800">
                <p>
                  <strong>Author:</strong> {book.Author}
                </p>
                <p>
                  <strong>Available Copies:</strong> {book.BookNumber}
                </p>
                <p>
                  <strong>ISBN:</strong> {book.ISBN}
                </p>
              </div>
              <button
                onClick={() => handleRentBook(book.Bookid)}
                className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              >
                Rent Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
