import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Leaf, Award, PlusCircle, 
  Map, MessageSquare, Activity
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get(`${API_URL}/api/dashboard/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's your impact overview</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/listings/create" className="btn btn-primary">
              <PlusCircle size={20} />
              Create Listing
            </Link>
            {user?.role === 'organization' && (
              <Link to="/listings/bulk-donate" className="btn btn-secondary">
                <PlusCircle size={20} />
                Bulk Donate
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="stat-card primary"
          >
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.user?.points || 0}</div>
              <div className="stat-label">Points</div>
              <div className="stat-level">Level {stats?.user?.level || 1}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="stat-card success"
          >
            <div className="stat-icon">
              <Leaf size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.user?.totalFoodDonated?.toFixed(1) || 0} kg</div>
              <div className="stat-label">Food Donated</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="stat-card info"
          >
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.user?.totalCO2Reduced?.toFixed(1) || 0} kg</div>
              <div className="stat-label">CO₂ Reduced</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="stat-card warning"
          >
            <div className="stat-icon">
              <Activity size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.listings?.active || 0}</div>
              <div className="stat-label">Active Listings</div>
            </div>
          </motion.div>
        </div>


        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="quick-actions"
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/listings/create" className="action-card">
              <PlusCircle size={32} color="#FF9933" />
              <h3>Donate Food</h3>
              <p>Create a new listing</p>
            </Link>
            <Link to="/map" className="action-card">
              <Map size={32} color="#138808" />
              <h3>View Map</h3>
              <p>See all listings</p>
            </Link>
            <Link to="/chat" className="action-card">
              <MessageSquare size={32} color="#000080" />
              <h3>Messages</h3>
              <p>Check conversations</p>
            </Link>
            <Link to="/leaderboard" className="action-card">
              <Award size={32} color="#FF9933" />
              <h3>Leaderboard</h3>
              <p>See rankings</p>
            </Link>
          </div>
        </motion.div>

        {/* Recent Listings */}
        {stats?.recentListings && stats.recentListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="recent-listings"
          >
            <h2>Recent Listings</h2>
            <div className="listings-list">
              {stats.recentListings.map((listing) => (
                <div key={listing._id} className="listing-item">
                  <div>
                    <h4>{listing.title}</h4>
                    <p>{listing.quantity} {listing.unit}</p>
                  </div>
                  <div className="listing-status">
                    <span className={`status-badge ${listing.status}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

