import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Components/login";
import Register from "./Components/Register";
import UsersTable from "./Components/UsersTable";
import Home from "./Components/Home";
import { useAuth } from "./Components/Auth";
import { Navigate } from "react-router-dom";
import AdminHome from "./Components/AdminHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (!auth || !auth.user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
