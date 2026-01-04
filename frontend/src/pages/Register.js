import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, MapPin, Building, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user', // Default to 'user' - can act as both donor and receiver
    organizationName: '',
    location: {
      coordinates: [0, 0],
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationKey = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
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
          <h1>Join Samartha Setu</h1>
          <p>Start making a difference today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <User size={20} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ram"
            />
          </div>

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
              <Phone size={20} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91 1234567890"
            />
          </div>

          <div className="form-group">
            <label>
              <Shield size={20} />
              Account Type (Optional)
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Regular User (Can donate & receive)</option>
              <option value="organization">Organization (Hotels, Hostels, etc.)</option>
              <option value="volunteer">Volunteer</option>
            </select>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
              Regular users can both donate and receive food. Organizations can do bulk donations.
            </p>
          </div>

          {(formData.role === 'organization') && (
            <div className="form-group">
              <label>
                <Building size={20} />
                Organization Name *
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required={formData.role === 'organization'}
                placeholder="Hotel/Hostel/Function Hall Name"
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <MapPin size={20} />
              City
            </label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              required
              placeholder="Mumbai"
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={20} />
              State
            </label>
            <input
              type="text"
              name="location.state"
              value={formData.location.state}
              onChange={handleChange}
              required
              placeholder="Maharashtra"
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={20} />
              Address
            </label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Street address"
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
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={20} />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Creating account...' : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

