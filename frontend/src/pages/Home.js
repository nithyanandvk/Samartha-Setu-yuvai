import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Shield, Map, Zap, Users, Award, Leaf, 
  ArrowRight, TrendingUp, Heart, Globe, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    foodSaved: '12,450',
    co2Reduced: '31,125',
    mealsServed: '24,900',
    activeUsers: '1,250'
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchGlobalStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/global-stats`);
      const data = response.data;
      setStats({
        foodSaved: (data.globalImpact?.totalFoodSaved || 0).toLocaleString(),
        co2Reduced: (data.globalImpact?.totalCO2Reduced || 0).toLocaleString(),
        mealsServed: (data.globalImpact?.mealsEquivalent || 0).toLocaleString(),
        activeUsers: (data.totalUsers || 0).toLocaleString()
      });
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
      // Keep default stats on error
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <Hero stats={stats} />

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Why Samartha Setu?</h2>
            <p>Innovation meets impact in every feature</p>
          </motion.div>
          <div className="features-grid">
            {[
              {
                icon: <Zap size={32} />,
                title: 'AI-Powered Chat Bots',
                description: 'Intelligent AI assistants help users navigate the platform, answer questions, and provide real-time support using advanced natural language processing'
              },
              {
                icon: <Globe size={32} />,
                title: 'AI Zero Waste Fallback',
                description: 'Smart AI algorithms automatically route unclaimed food to animal farms, community fridges, or compost centers, ensuring zero waste and maximum sustainability'
              },
              {
                icon: <Leaf size={32} />,
                title: 'AI CO₂ Calculation',
                description: 'Automated AI-powered CO₂ reduction tracking calculates your environmental impact in real-time, showing how much carbon you\'ve saved through food donations'
              },
              {
                icon: <Map size={32} />,
                title: 'Live Interactive Map',
                description: 'Visualize all listings, receivers, fridges, and disaster zones on a real-time interactive map with geospatial clustering and filtering'
              },
              {
                icon: <Shield size={32} />,
                title: 'Disaster Management Platform',
                description: 'Comprehensive disaster relief system for all disasters in India - users can donate essential items, track affected areas, and coordinate relief efforts'
              },
              {
                icon: <Users size={32} />,
                title: 'Real-Time Communication',
                description: 'Built-in chat system with Socket.IO for instant messaging between donors and receivers, with real-time notifications and updates'
              },
              {
                icon: <Award size={32} />,
                title: 'Gamified Impact System',
                description: 'Earn points, unlock badges, level up, and compete on leaderboards while making a real difference in your community'
              },
              {
                icon: <TrendingUp size={32} />,
                title: 'Smart Matching System',
                description: 'Efficient donor-receiver matching based on proximity, food type, and availability - no AI needed, just smart algorithms for optimal connections'
              },
              {
                icon: <Heart size={32} />,
                title: 'Bulk Donation for Organizations',
                description: 'Specialized bulk donation feature for hotels, restaurants, function halls, and organizations to donate multiple items efficiently'
              },
              {
                icon: <Package size={32} />,
                title: 'Claim Request Workflow',
                description: 'First-come-first-serve claim system with donor approval, collection confirmation, and automated completion tracking'
              },
              {
                icon: <Shield size={32} />,
                title: 'Admin Dashboard',
                description: 'Comprehensive admin panel with user management, transaction tracking, database insights, volunteer management, and platform analytics'
              },
              {
                icon: <Globe size={32} />,
                title: 'Geospatial Intelligence',
                description: 'Advanced location-based services with geocoding, distance calculations, and proximity-based recommendations for optimal food distribution'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="feature-card"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="cta-card"
        >
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of users fighting food waste and building sustainable communities</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-secondary">
              Start Your Journey <ArrowRight size={20} />
            </Link>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;

