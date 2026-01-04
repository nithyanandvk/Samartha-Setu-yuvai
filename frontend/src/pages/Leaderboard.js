import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filter, setFilter] = useState('national');
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/gamification/leaderboard?type=${filter}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gamification/user-stats`);
      setUserStats(response.data);
    } catch (error) {
      console.error('Fetch user stats error:', error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Medal size={24} color="#CD7F32" />;
    return <span className="rank-number">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="leaderboard-header"
        >
          <div>
            <h1>Leaderboard</h1>
            <p>Top contributors making a difference</p>
          </div>
          <div className="filter-buttons">
            <button
              className={filter === 'national' ? 'active' : ''}
              onClick={() => setFilter('national')}
            >
              National
            </button>
            <button
              className={filter === 'state' ? 'active' : ''}
              onClick={() => setFilter('state')}
            >
              State
            </button>
            <button
              className={filter === 'city' ? 'active' : ''}
              onClick={() => setFilter('city')}
            >
              City
            </button>
          </div>
        </motion.div>

        {userStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="user-stats-card"
          >
            <div className="user-stats-header">
              <h2>Your Stats</h2>
              <Award size={32} color="#FF9933" />
            </div>
            <div className="user-stats-grid">
              <div className="stat-item">
                <div className="stat-label">Points</div>
                <div className="stat-value">{userStats.points}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Level</div>
                <div className="stat-value">{userStats.level}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Food Donated</div>
                <div className="stat-value">{userStats.totalFoodDonated?.toFixed(1) || 0} kg</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">CO₂ Reduced</div>
                <div className="stat-value">{userStats.totalCO2Reduced?.toFixed(1) || 0} kg</div>
              </div>
            </div>
            {userStats.rank && (
              <div className="user-ranks">
                <div className="rank-item">
                  <span>City Rank:</span>
                  <strong>#{userStats.rank.cityRank || 'N/A'}</strong>
                </div>
                <div className="rank-item">
                  <span>State Rank:</span>
                  <strong>#{userStats.rank.stateRank || 'N/A'}</strong>
                </div>
                <div className="rank-item">
                  <span>National Rank:</span>
                  <strong>#{userStats.rank.nationalRank || 'N/A'}</strong>
                </div>
              </div>
            )}
            <div className="level-progress">
              <div className="progress-label">
                <span>Progress to Level {userStats.level + 1}</span>
                <span>{userStats.progress?.toFixed(0) || 0}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${userStats.progress || 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="empty-leaderboard">
              <Trophy size={64} color="#9CA3AF" />
              <h3>No rankings yet</h3>
              <p>Be the first to make an impact!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`leaderboard-item ${entry.userId?._id === user?._id ? 'current-user' : ''}`}
              >
                <div className="rank-section">
                  {getRankIcon(index + 1)}
                </div>
                <div className="user-section">
                  <div className="user-avatar">
                    {entry.userId?.profileImage ? (
                      <img src={entry.userId.profileImage} alt={entry.userId.name} />
                    ) : (
                      <div className="avatar-placeholder">{entry.userId?.name?.[0] || 'U'}</div>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{entry.userId?.name || 'Unknown'}</h3>
                    <p>{entry.userId?.role || 'User'}</p>
                  </div>
                </div>
                <div className="stats-section">
                  <div className="stat-box">
                    <TrendingUp size={18} />
                    <span>{entry.points}</span>
                    <small>Points</small>
                  </div>
                  <div className="stat-box">
                    <Award size={18} />
                    <span>{entry.foodDonated?.toFixed(1) || 0}</span>
                    <small>kg Donated</small>
                  </div>
                  <div className="stat-box">
                    <Star size={18} />
                    <span>{entry.co2Reduced?.toFixed(1) || 0}</span>
                    <small>kg CO₂</small>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

