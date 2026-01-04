import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, MapPin, Package, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './CreateListing.css';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodType: 'cooked',
    quantity: '',
    unit: 'kg',
    expiryTime: '',
    location: {
      coordinates: [0, 0], // Will be geocoded from form address
      address: '',
      city: '',
      state: ''
    },
    isDisasterRelief: false,
    disasterZone: '',
    nutritionInfo: {}
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/listings`, formData);
      toast.success('Listing created successfully!');
      navigate('/listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="create-listing-container"
        >
            <div className="create-header">
              <h1>Create Food Listing</h1>
              <p>Share surplus food and make an impact</p>
              {user?.role === 'organization' && (
                <Link to="/listings/bulk-donate" className="bulk-donate-link">
                  🏢 Have multiple items? Use Bulk Donate instead
                </Link>
              )}
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                💡 Use the floating "Nutri Mitra" bot icon to get nutrition information
              </p>
            </div>

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Package size={20} />
                  Food Name / Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Biryani, Roti, Vegetables"
                />
              </div>

              <div className="form-group">
                <label>
                  <Package size={20} />
                  Food Type *
                </label>
                <select
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  required
                >
                  <option value="cooked">Cooked</option>
                  <option value="raw">Raw</option>
                  <option value="packaged">Packaged</option>
                  <option value="beverages">Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the food, condition, and any special notes..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Package size={20} />
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label>Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="plates">Plates</option>
                  <option value="packets">Packets</option>
                  <option value="liters">Liters</option>
                  <option value="units">Units</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <Clock size={20} />
                  Expiry Time *
                </label>
                <input
                  type="datetime-local"
                  name="expiryTime"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <MapPin size={20} />
                City *
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
                State *
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

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDisasterRelief"
                  checked={formData.isDisasterRelief}
                  onChange={handleChange}
                />
                <AlertCircle size={20} />
                <span>This is a disaster relief listing</span>
              </label>
            </div>

            {formData.isDisasterRelief && (
              <div className="form-group">
                <label>Disaster Zone</label>
                <input
                  type="text"
                  name="disasterZone"
                  value={formData.disasterZone}
                  onChange={handleChange}
                  placeholder="e.g., Flood-affected area, Cyclone zone"
                />
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="btn btn-primary submit-btn"
            >
              {loading ? 'Creating...' : (
                <>
                  <Save size={20} />
                  Create Listing
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateListing;
