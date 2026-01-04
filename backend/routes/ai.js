const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI only if API key is provided
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`
    ai = new GoogleGenAI({});
  } catch (error) {
    console.warn('Failed to initialize Gemini AI:', error.message);
  }
}

// Helper to try different model names
const tryGenerateContent = async (prompt) => {
  if (!ai) return null;

  // Try different model names in order of preference
  const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of modelNames) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.warn(`Failed to use model ${modelName}, trying next...`, error.message);
      continue;
    }
  }
  
  return null;
};

// @route   POST /api/ai/nutrition
// @desc    Get nutrition information for food
// @access  Private
router.post('/nutrition', auth, async (req, res) => {
  try {
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    // Check if Gemini API is configured
    if (!ai || !process.env.GEMINI_API_KEY) {
      return res.json({
        foodName,
        nutritionInfo: {
          calories: null,
          protein: null,
          carbs: null,
          fats: null,
          vitamins: [],
          minerals: [],
          allergens: [],
          bestBefore: "Check packaging or use within 24 hours if cooked",
          suitableFor: ["adults"],
          healthBenefits: "Please configure GEMINI_API_KEY in .env to get AI-powered nutrition analysis"
        },
        timestamp: new Date(),
        note: "AI service not configured"
      });
    }

    const prompt = `Analyze the nutritional information for "${foodName}". Provide a detailed response in JSON format with the following structure:
{
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fats": number (grams per 100g),
  "vitamins": ["array of vitamins"],
  "minerals": ["array of minerals"],
  "allergens": ["array of potential allergens"],
  "bestBefore": "suggestion for best before duration",
  "suitableFor": ["kids", "elderly", "adults", etc.],
  "healthBenefits": "brief description"
}

Be accurate and concise. If the food is not recognized, return null values. Return only valid JSON, no markdown formatting.`;

    const text = await tryGenerateContent(prompt);
    
    if (!text) {
      throw new Error('Unable to generate content from AI model');
    }

    // Try to parse JSON from response
    let nutritionInfo;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text.trim();
      nutritionInfo = JSON.parse(jsonText);
    } catch (parseError) {
      // Fallback: return structured response
      nutritionInfo = {
        rawResponse: text,
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        vitamins: [],
        minerals: [],
        allergens: [],
        bestBefore: "Check packaging or use within 24 hours if cooked",
        suitableFor: ["adults"],
        healthBenefits: "Nutritional information analysis"
      };
    }

    res.json({
      foodName,
      nutritionInfo,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Nutrition AI error:', error);
    // Return fallback response instead of error
    res.json({
      foodName,
      nutritionInfo: {
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        vitamins: [],
        minerals: [],
        allergens: [],
        bestBefore: "Check packaging or use within 24 hours if cooked",
        suitableFor: ["adults"],
        healthBenefits: "Unable to fetch AI analysis. Please check your GEMINI_API_KEY or try again later."
      },
      timestamp: new Date(),
      error: error.message
    });
  }
});

// @route   POST /api/ai/assistant
// @desc    General assistance chatbot
// @access  Private
router.post('/assistant', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if Gemini API is configured
    if (!ai || !process.env.GEMINI_API_KEY) {
      return res.json({
        response: "I'm sorry, the AI assistant is not configured. Please set up GEMINI_API_KEY in your .env file to use this feature. For now, here are some quick answers:\n\n- To donate food: Go to 'Create Listing' and fill in the details\n- To receive food: Browse 'Listings' and claim available items\n- To view your impact: Check the Dashboard\n- For help: Contact support or check the documentation",
        timestamp: new Date(),
        note: "AI service not configured"
      });
    }

    const systemContext = `You are a helpful assistant for Samartha Setu, an AI-driven food redistribution and disaster relief platform. 
Help users with questions about food donation, receiving food, sustainability, CO₂ reduction, gamification features, disaster relief, and platform usage.
Be friendly, concise, and informative.`;

    const fullPrompt = `${systemContext}\n\nUser question: ${message}\n\nContext: ${context || 'No additional context'}\n\nProvide a helpful response:`;

    const text = await tryGenerateContent(fullPrompt);
    
    if (!text) {
      throw new Error('Unable to generate content from AI model');
    }

    res.json({
      response: text,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Assistant AI error:', error);
    // Return helpful fallback response
    res.json({
      response: `I'm having trouble connecting to the AI service right now. Here's what I can help you with:\n\n- **Donate Food**: Create a listing from the dashboard\n- **Find Food**: Browse listings or use the map view\n- **Track Impact**: Check your dashboard for stats\n- **Chat**: Message other users directly\n- **Leaderboard**: See top contributors\n\nIf you need specific help, please try again later or contact support. Error: ${error.message}`,
      timestamp: new Date(),
      error: error.message
    });
  }
});

module.exports = router;
