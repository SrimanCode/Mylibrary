import { useAuth } from "./Auth";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate("/login", { replace: true });
  }
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1 className="text-6xl "> This is home page....</h1>
    </div>
  );
}

export default Home;
