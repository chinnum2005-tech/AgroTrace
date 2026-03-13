import { Leaf, User, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
    window.location.reload(); // Reload to clear all states
  };

  return (
    <nav className="bg-white shadow-md border-b border-secondary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgroTrace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/verify" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Verify Product
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Hi, {user?.firstName || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-colors font-medium">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary font-medium">
                Home
              </Link>
              <Link to="/verify" className="text-gray-700 hover:text-primary font-medium">
                Verify Product
              </Link>
              
              {isLoggedIn ? (
                <>
                  <div className="text-sm text-gray-600 px-2">
                    Hi, {user?.firstName || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-primary text-white px-5 py-2 rounded-lg font-medium text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
