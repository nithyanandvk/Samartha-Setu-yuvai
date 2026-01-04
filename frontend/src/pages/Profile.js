import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building, Award, Edit, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`);
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        role: response.data.role,
        organizationName: response.data.organizationName || '',
        location: {
          address: response.data.location?.address || '',
          city: response.data.location?.city || '',
          state: response.data.location?.state || '',
          pincode: response.data.location?.pincode || ''
        },
        disasterModeEnabled: response.data.disasterModeEnabled || false
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/api/users/profile`, formData);
      setProfile(response.data);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-container"
        >
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{profile.name}</h1>
              <p className="profile-role">{profile.role}</p>
              {profile.organizationName && (
                <p className="profile-org">
                  <Building size={16} />
                  {profile.organizationName}
                </p>
              )}
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="btn btn-primary edit-btn"
              disabled={saving}
            >
              {editing ? (
                <>
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit size={20} />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <Award size={24} color="#FF9933" />
              <div>
                <div className="stat-value">{profile.points || 0}</div>
                <div className="stat-label">Points</div>
              </div>
            </div>
            <div className="stat-card">
              <Award size={24} color="#138808" />
              <div>
                <div className="stat-value">Level {profile.level || 1}</div>
                <div className="stat-label">Current Level</div>
              </div>
            </div>
            <div className="stat-card">
              <Award size={24} color="#000080" />
              <div>
                <div className="stat-value">{profile.totalFoodDonated?.toFixed(1) || 0} kg</div>
                <div className="stat-label">Food Donated</div>
              </div>
            </div>
            <div className="stat-card">
              <Award size={24} color="#FF9933" />
              <div>
                <div className="stat-value">{profile.totalCO2Reduced?.toFixed(1) || 0} kg</div>
                <div className="stat-label">CO₂ Reduced</div>
              </div>
            </div>
          </div>

          {profile.badges && profile.badges.length > 0 && (
            <div className="badges-section">
              <h2>Badges</h2>
              <div className="badges-grid">
                {profile.badges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <Award size={32} color="#FF9933" />
                    <span>{badge.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-details">
            <h2>Profile Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <Mail size={20} />
                <div>
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>
              </div>

              <div className="detail-item">
                <Phone size={20} />
                <div>
                  <label>Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <User size={20} />
                <div>
                  <label>Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{profile.name}</p>
                  )}
                </div>
              </div>

              {profile.role !== 'admin' && (
                <div className="detail-item">
                  <User size={20} />
                  <div>
                    <label>Role</label>
                    {editing ? (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="edit-input"
                      >
                        <option value="user">Regular User</option>
                        <option value="organization">Organization</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                    ) : (
                      <p style={{ textTransform: 'capitalize' }}>{profile.role}</p>
                    )}
                  </div>
                </div>
              )}

              {(profile.role === 'organization' || formData.role === 'organization') && (
                <div className="detail-item">
                  <Building size={20} />
                  <div>
                    <label>Organization Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="edit-input"
                        required={formData.role === 'organization'}
                      />
                    ) : (
                      <p>{profile.organizationName || 'N/A'}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-item">
                <MapPin size={20} />
                <div>
                  <label>City</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{profile.location?.city || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <MapPin size={20} />
                <div>
                  <label>State</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{profile.location?.state || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="disaster-mode-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="disasterModeEnabled"
                  checked={formData.disasterModeEnabled}
                  onChange={handleChange}
                  disabled={!editing}
                />
                <span>Enable Disaster Relief Mode</span>
              </label>
              <p className="toggle-description">
                When enabled, you'll receive priority notifications for disaster relief listings
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

