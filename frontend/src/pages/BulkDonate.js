import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Package, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './BulkDonate.css';

const BulkDonate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    {
      title: '',
      description: '',
      foodType: 'cooked',
      quantity: '',
      unit: 'kg',
      expiryTime: ''
    }
  ]);
  const [location, setLocation] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isDisasterRelief, setIsDisasterRelief] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Check if user is organization
  if (user?.role !== 'organization') {
    return (
      <div className="bulk-donate-page">
        <div className="container">
          <div className="not-organization">
            <h2>Bulk Donation Available for Organizations Only</h2>
            <p>This feature is available for Hotels, Hostels, Function Halls, and other organizations.</p>
            <p>Please update your profile to "Organization" role to use this feature.</p>
            <button onClick={() => navigate('/profile')} className="btn btn-primary">
              Update Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addItem = () => {
    setItems([...items, {
      title: '',
      description: '',
      foodType: 'cooked',
      quantity: '',
      unit: 'kg',
      expiryTime: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all items
    const invalidItems = items.filter(item => 
      !item.title || !item.quantity || !item.expiryTime || !location.city || !location.state
    );
    
    if (invalidItems.length > 0) {
      toast.error('Please fill all required fields for all items');
      return;
    }

    setLoading(true);
    try {
      // Create listings for each item
      const promises = items.map(item => 
        axios.post(`${API_URL}/api/listings`, {
          ...item,
          quantity: parseFloat(item.quantity),
          expiryTime: item.expiryTime,
          location: location,
          isDisasterRelief: isDisasterRelief,
          disasterZone: isDisasterRelief ? 'Disaster Zone' : ''
        })
      );

      await Promise.all(promises);
      toast.success(`Successfully created ${items.length} food listing(s)!`);
      navigate('/listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bulk listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-donate-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bulk-donate-container"
        >
          <div className="bulk-header">
            <h1>Bulk Food Donation</h1>
            <p>Add multiple food items at once - Perfect for Hotels, Hostels, Function Halls</p>
            <div className="organization-badge">
              <Package size={20} />
              <span>{user?.organizationName || 'Organization'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bulk-form">
            {/* Location Section - Shared for all items */}
            <div className="location-section">
              <h3>
                <MapPin size={24} />
                Location (Shared for all items)
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    required
                    placeholder="Mumbai"
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    required
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
            </div>

            {/* Disaster Relief Toggle */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isDisasterRelief}
                  onChange={(e) => setIsDisasterRelief(e.target.checked)}
                />
                <span>This is a disaster relief donation</span>
              </label>
            </div>

            {/* Food Items */}
            <div className="items-section">
              <div className="items-header">
                <h3>
                  <Package size={24} />
                  Food Items ({items.length})
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-secondary add-item-btn"
                >
                  <Plus size={20} />
                  Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="item-card"
                >
                  <div className="item-header">
                    <h4>Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="remove-item-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <Package size={18} />
                        Food Name / Title *
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        required
                        placeholder="e.g., Biryani, Roti, Vegetables"
                      />
                    </div>

                    <div className="form-group">
                      <label>Food Type *</label>
                      <select
                        value={item.foodType}
                        onChange={(e) => updateItem(index, 'foodType', e.target.value)}
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
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                      rows={3}
                      placeholder="Describe the food, condition, and any special notes..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <Package size={18} />
                        Quantity (in kg) *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                        min="0.1"
                        step="0.1"
                        placeholder="10"
                      />
                    </div>

                    <div className="form-group">
                      <label>Unit *</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
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
                        <Clock size={18} />
                        Expiry Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={item.expiryTime}
                        onChange={(e) => updateItem(index, 'expiryTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="btn btn-primary submit-btn"
            >
              {loading ? 'Creating Listings...' : (
                <>
                  <Save size={20} />
                  Create {items.length} Listing{items.length !== 1 ? 's' : ''}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BulkDonate;

