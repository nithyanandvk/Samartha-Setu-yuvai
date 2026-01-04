import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-container"
      >
        <div className="auth-header">
          <Shield size={48} color="#FF9933" />
          <h1>Welcome Back</h1>
          <p>Login to continue your impact journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={20} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={20} />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="btn btn-primary auth-submit"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </motion.button>
        </form>

        <div className="test-credentials">
          <p className="test-credentials-label">🚀 Quick Login (Development)</p>
          <div className="test-credentials-buttons">
            <button
              type="button"
              onClick={() => fillCredentials('nithyanandvk2005@gmail.com', '123456')}
              className="test-cred-btn user"
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('suguna@gmail.com', '123456')}
              className="test-cred-btn organization"
            >
              🏢 Organization
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@samarthasetu.in', 'Admin@123')}
              className="test-cred-btn admin"
            >
              🔐 Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

