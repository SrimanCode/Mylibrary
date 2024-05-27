import React, { useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import image from "../Images/image.jpeg";
function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [bookList, setBookList] = useState([]);
  const [loanedBooks, setLoanedBooks] = useState([]);
  const [due_date, setdate] = useState([]);
  const [error, setError] = useState("");
  const user = sessionStorage.getItem("user");
  const userObj = JSON.parse(user);

  useEffect(() => {
    const userRole = sessionStorage.getItem("user");
    const userObject = JSON.parse(userRole);
    if (userObject.role !== "user") {
      navigate("/admin", { replace: true });
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
        setBookList(data.message);
      })
      .catch((error) => {
        console.error("Failed to fetch books:", error);
        setError("Failed to fetch books: " + error);
      });

    fetchloanData();
  }, [navigate, userObj.id]);

  function fetchloanData() {
    fetch("http://localhost:5000/loanedBook", {
      method: "POST",
      headers: {
        "x-access-token": sessionStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid: userObj.id }),
    })
      .then((response) => response.json())
      .then((data) => {
        const enrichedBooks = data.success.map((item) => ({
          bookId: item.book_id,
          dueDate: item.due_date,
          loanDate: item.loan_date,
        }));
        setdate(enrichedBooks);
        setLoanedBooks(data.success.map((item) => item.book_id));
      })
      .catch((error) => {
        console.error("Failed to fetch loaned books:", error);
        setError("Failed to fetch loaned books: " + error);
      });
  }
  // Filtering books
  const filteredBooks = bookList.filter((book) =>
    loanedBooks.includes(book.Bookid)
  );

  const extendedFilter = filteredBooks.map((book) => {
    const loanDetails = due_date.find(
      (loanedBook) => loanedBook.BookId === book.BookId
    );

    return {
      ...book,
      loan_date: loanDetails ? loanDetails.loanDate : null,
      due_date: loanDetails ? loanDetails.dueDate : null,
    };
  });

  function handleLogout() {
    auth.logout();
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  }
  function getISBN(ISBN) {
    return ISBN.toString();
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
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setLoanedBooks((prevLoanedBooks) => [...prevLoanedBooks, bookId]);
          setBookList((prevBookList) =>
            prevBookList.map((book) => {
              if (book.Bookid === bookId) {
                return { ...book, BookNumber: book.BookNumber - 1 };
              }
              return book;
            })
          );
        }
      })
      .catch((error) => {
        console.error("Failed to borrow book:", error);
        alert("Failed to borrow book: " + error);
      });
  }

  function ReturnBooks(bookId) {
    const userId = auth.user.id;
    fetch("http://localhost:5000/Return", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid: userId, bookid: bookId }),
    }).then(() => {
      alert("Return Successful");
      setLoanedBooks((prevLoanedBooks) =>
        prevLoanedBooks.filter((id) => id !== bookId)
      );
      setBookList((prevBookList) =>
        prevBookList.map((book) => {
          if (book.Bookid === bookId) {
            return { ...book, BookNumber: book.BookNumber + 1 };
          }
          return book;
        })
      );
    });
  }

  function isLoaned(bookId) {
    return loanedBooks.includes(bookId);
  }

  function dateformat(isoDate) {
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return readableDate;
  }
  return (
    <div className="container px-4 py-4 mx-auto">
      <div className="flex flex-row justify-between">
        <button
          onClick={handleLogout}
          className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
        <h1 className="text-2xl font-bold text-blue-800">
          Book's Loaned: {loanedBooks.length} / 5
        </h1>
      </div>
      {error && (
        <div
          className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded"
          role="alert"
        >
          {error}
        </div>
      )}
      <h1 className="flex justify-center mb-6 text-5xl font-bold text-gray-800">
        Loaned Books
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {extendedFilter.length > 0 ? (
          extendedFilter.map((book) => (
            <div
              key={book.Bookid}
              className="flex flex-col justify-between p-4 rounded-lg shadow-lg bg-slate-100"
            >
              <div>
                <img
                  src={`https://covers.openlibrary.org/b/isbn/${getISBN(
                    book.ISBN
                  )}-M.jpg`}
                  alt={book.BookName}
                  className="object-contain w-full pb-5 h-52"
                />
                <h3 className="mb-2 text-xl font-semibold text-blue-800">
                  {book.BookName}
                </h3>
                <p className="mb-1 text-sm text-gray-700">
                  {book.BookDescription}
                </p>
                <p className="pb-2 text-sm text-gray-700">
                  Author: <span className="font-semibold">{book.Author}</span>
                </p>
                <p className="pb-2 text-sm text-gray-700">
                  loan Date:{" "}
                  <span className="font-semibold">
                    {dateformat(book.loan_date)}
                  </span>
                </p>
                <p className="pb-2 text-sm text-gray-700">
                  Due Date:{" "}
                  <span className="font-semibold">
                    {dateformat(book.due_date)}
                  </span>
                </p>
              </div>
              {/* Button at the bottom */}
              <div className="mt-auto">
                <button
                  onClick={() => ReturnBooks(book.Bookid)}
                  className="flex justify-center w-full p-2 text-center rounded-lg bg-sky-300 hover:bg-sky-200"
                >
                  Return Book
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-500">No books currently loaned.</p>
        )}
      </div>
      <h1 className="flex justify-center pt-10 pb-10 text-5xl font-bold">
        Book List
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {bookList.map((book) => (
          <div
            key={book.Bookid}
            className="flex flex-col justify-center overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-xl"
          >
            <img
              src={`https://covers.openlibrary.org/b/isbn/${getISBN(
                book.ISBN
              )}-M.jpg`}
              alt={book.BookName}
              className="object-contain w-full h-52"
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
                disabled={isLoaned(book.Bookid) || loanedBooks.length === 5}
                className={`px-4 py-2 mt-4 text-white rounded focus:outline-none focus:shadow-outline ${
                  isLoaned(book.Bookid) ||
                  loanedBooks.length === 5 ||
                  book.BookNumber === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                {loanedBooks.length === 5 &&
                !isLoaned(book.Bookid) &&
                book.BookNumber !== 0
                  ? "Max Loan Reached"
                  : isLoaned(book.Bookid)
                  ? "Already Loaned"
                  : book.BookNumber === 0
                  ? "Not Available"
                  : "Rent Book"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Home;
