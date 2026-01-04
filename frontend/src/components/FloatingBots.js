import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './FloatingBots.css';

const FloatingBots = () => {
  const { user, isAuthenticated } = useAuth();
  
  // All hooks must be called unconditionally - before any early returns
  const [showNutritionBot, setShowNutritionBot] = useState(false);
  const [showAssistantBot, setShowAssistantBot] = useState(false);
  const [nutritionInput, setNutritionInput] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [nutritionResponse, setNutritionResponse] = useState(null);
  const [assistantResponse, setAssistantResponse] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Early return AFTER all hooks are called
  if (!isAuthenticated) return null;

  const handleNutritionSubmit = async (e) => {
    e.preventDefault();
    if (!nutritionInput.trim()) return;

    setLoadingNutrition(true);
    try {
      const response = await axios.post(`${API_URL}/api/ai/nutrition`, {
        foodName: nutritionInput
      });
      setNutritionResponse(response.data);
      setNutritionInput('');
    } catch (error) {
      setNutritionResponse({
        foodName: nutritionInput,
        nutritionInfo: {
          error: 'Failed to fetch nutrition data. Please try again.'
        }
      });
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    setLoadingAssistant(true);
    try {
      const response = await axios.post(`${API_URL}/api/ai/assistant`, {
        message: assistantInput,
        context: `User: ${user?.name}, Role: ${user?.role}`
      });
      setAssistantResponse(response.data);
      setAssistantInput('');
    } catch (error) {
      setAssistantResponse({
        response: 'Sorry, I encountered an error. Please try again later.',
        error: error.message
      });
    } finally {
      setLoadingAssistant(false);
    }
  };

  return (
    <>
      {/* Nutrition Bot Floating Icon */}
      <motion.div
        className="floating-bot nutrition-bot"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNutritionBot(true)}
      >
        <Sparkles size={24} />
        <span className="bot-label">Nutri Mitra</span>
      </motion.div>

      {/* Assistant Bot Floating Icon */}
      <motion.div
        className="floating-bot assistant-bot"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAssistantBot(true)}
      >
        <Bot size={24} />
        <span className="bot-label">Setu Sahayak</span>
      </motion.div>

      {/* Nutrition Bot Modal */}
      <AnimatePresence>
        {showNutritionBot && (
          <motion.div
            className="bot-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNutritionBot(false)}
          >
            <motion.div
              className="bot-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bot-header">
                <div className="bot-title">
                  <Sparkles size={24} color="#FF9933" />
                  <h3>Nutri Mitra - Nutrition Analysis</h3>
                </div>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowNutritionBot(false);
                    setNutritionResponse(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bot-content">
                <form onSubmit={handleNutritionSubmit} className="bot-form">
                  <input
                    type="text"
                    value={nutritionInput}
                    onChange={(e) => setNutritionInput(e.target.value)}
                    placeholder="Enter food name (e.g., Biryani, Roti, Apple)..."
                    className="bot-input"
                  />
                  <button
                    type="submit"
                    disabled={loadingNutrition || !nutritionInput.trim()}
                    className="bot-submit-btn"
                  >
                    {loadingNutrition ? 'Analyzing...' : 'Analyze'}
                  </button>
                </form>

                {nutritionResponse && (
                  <div className="bot-response">
                    <h4>Nutrition Analysis for: {nutritionResponse.foodName}</h4>
                    {nutritionResponse.nutritionInfo && (
                      <div className="nutrition-details">
                        {nutritionResponse.nutritionInfo.calories && (
                          <div className="nutrition-item">
                            <strong>Calories:</strong> {nutritionResponse.nutritionInfo.calories} per 100g
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.protein && (
                          <div className="nutrition-item">
                            <strong>Protein:</strong> {nutritionResponse.nutritionInfo.protein}g
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.carbs && (
                          <div className="nutrition-item">
                            <strong>Carbs:</strong> {nutritionResponse.nutritionInfo.carbs}g
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.fats && (
                          <div className="nutrition-item">
                            <strong>Fats:</strong> {nutritionResponse.nutritionInfo.fats}g
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.vitamins && nutritionResponse.nutritionInfo.vitamins.length > 0 && (
                          <div className="nutrition-item">
                            <strong>Vitamins:</strong> {nutritionResponse.nutritionInfo.vitamins.join(', ')}
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.allergens && nutritionResponse.nutritionInfo.allergens.length > 0 && (
                          <div className="nutrition-item warning">
                            <strong>Allergens:</strong> {nutritionResponse.nutritionInfo.allergens.join(', ')}
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.suitableFor && nutritionResponse.nutritionInfo.suitableFor.length > 0 && (
                          <div className="nutrition-item">
                            <strong>Suitable for:</strong> {nutritionResponse.nutritionInfo.suitableFor.join(', ')}
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.bestBefore && (
                          <div className="nutrition-item">
                            <strong>Best Before:</strong> {nutritionResponse.nutritionInfo.bestBefore}
                          </div>
                        )}
                        {nutritionResponse.nutritionInfo.healthBenefits && (
                          <div className="nutrition-item">
                            <strong>Health Benefits:</strong> {nutritionResponse.nutritionInfo.healthBenefits}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Bot Modal */}
      <AnimatePresence>
        {showAssistantBot && (
          <motion.div
            className="bot-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssistantBot(false)}
          >
            <motion.div
              className="bot-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bot-header">
                <div className="bot-title">
                  <Bot size={24} color="#138808" />
                  <h3>Setu Sahayak - General Assistant</h3>
                </div>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowAssistantBot(false);
                    setAssistantResponse(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bot-content">
                <form onSubmit={handleAssistantSubmit} className="bot-form">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="Ask me anything about the platform..."
                    className="bot-input"
                  />
                  <button
                    type="submit"
                    disabled={loadingAssistant || !assistantInput.trim()}
                    className="bot-submit-btn"
                  >
                    {loadingAssistant ? 'Thinking...' : <Send size={18} />}
                  </button>
                </form>

                {assistantResponse && (
                  <div className="bot-response">
                    <div className="assistant-message">
                      {assistantResponse.response}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingBots;

