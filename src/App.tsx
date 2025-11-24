import  { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import ParkingDashboard from "./components/ParkingDashboard";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
}

interface DecodedToken {
  exp: number; // expiration time in seconds
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on first render
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(savedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setUser(JSON.parse(savedUser));

          const remainingTime = (decoded.exp - currentTime) * 1000;
          const timer = setTimeout(() => {
            handleLogout();
          }, remainingTime);

          setLoading(false); // ✅ ensure loading stops here

          return () => clearTimeout(timer);
        } else {
          handleLogout();
          setLoading(false);
        }
      } catch {
        handleLogout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const remainingTime = (decoded.exp - currentTime) * 1000;

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          handleLogout();
        }, remainingTime);

        return () => clearTimeout(timer);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <ParkingDashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
