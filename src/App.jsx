import { Routes, Route, Link } from "react-router";
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login";
import NotFound from "./pages/Notfound";

function App() {
  return (
    <nav>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
        <ul>
          <li>
            <Link to="dashboard">Dashboard</Link>
          </li>

          <li>
            <Link to="login">Login</Link>
          </li>
        </ul>
    </nav>
    
  );
}

export default App;
