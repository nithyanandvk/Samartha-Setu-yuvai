import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Map, PlusCircle, Trophy, User, 
  LogOut, Menu, X, Shield, AlertTriangle,  Wheat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="brand-logo"
          >
            <Wheat size={32} color="#1F2937" />
            <span>Samartha Setu</span>
          </motion.div>
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/map" className="nav-link">
                <Map size={20} />
                <span>Map</span>
              </Link>
              <Link to="/listings" className="nav-link">
                <span>Listings</span>
              </Link>
              <Link to="/listings/create" className="nav-link create-btn">
                <PlusCircle size={20} />
                <span>Donate</span>
              </Link>
              {user?.role === 'organization' && (
                <Link to="/listings/bulk-donate" className="nav-link">
                  <PlusCircle size={20} />
                  <span>Bulk Donate</span>
                </Link>
              )}
              {/* <Link to="/chat" className="nav-link">
                <MessageSquare size={20} />
                <span>Chat</span>
              </Link> */}
              <Link to="/leaderboard" className="nav-link">
                <Trophy size={20} />
                <span>Leaderboard</span>
              </Link>
              <Link to="/disasters" className="nav-link">
                <AlertTriangle size={20} />
                <span>Disasters</span>
              </Link>
              <Link to="/profile" className="nav-link">
                <User size={20} />
                <span>Profile</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <Shield size={20} />
                  <span>Admin</span>
                </Link>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <span>Login</span>
              </Link>
              <Link to="/register" className="nav-link register-btn">
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mobile-menu"
        >
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Home size={20} /> Dashboard
              </Link>
              <Link to="/map" onClick={() => setMobileMenuOpen(false)}>
                <Map size={20} /> Map
              </Link>
              <Link to="/listings" onClick={() => setMobileMenuOpen(false)}>
                Listings
              </Link>
              <Link to="/listings/create" onClick={() => setMobileMenuOpen(false)}>
                <PlusCircle size={20} /> Donate
              </Link>
              {user?.role === 'organization' && (
                <Link to="/listings/bulk-donate" onClick={() => setMobileMenuOpen(false)}>
                  <PlusCircle size={20} /> Bulk Donate
                </Link>
              )}
              {/* <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={20} /> Chat
              </Link> */}
              <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                <Trophy size={20} /> Leaderboard
              </Link>
              <Link to="/disasters" onClick={() => setMobileMenuOpen(false)}>
                <AlertTriangle size={20} /> Disasters
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <User size={20} /> Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Shield size={20} /> Admin
                </Link>
              )}
              <button onClick={handleLogout}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;

