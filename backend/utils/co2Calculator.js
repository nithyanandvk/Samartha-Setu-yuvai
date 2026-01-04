// CO₂ reduction calculation based on food waste prevention
// Formula: 1 kg of food waste ≈ 2.5 kg CO₂ equivalent

const CO2_PER_KG_FOOD = 2.5; // kg CO₂ per kg of food saved

const calculateCO2Reduction = (foodQuantityKg) => {
  // Ensure quantity is a number
  const quantity = typeof foodQuantityKg === 'string' ? parseFloat(foodQuantityKg) : Number(foodQuantityKg);
  if (isNaN(quantity) || quantity <= 0) return 0;
  return quantity * CO2_PER_KG_FOOD;
};

const calculateTotalImpact = (donations) => {
  let totalFood = 0;
  let totalCO2 = 0;

  donations.forEach(donation => {
    // Ensure quantity is parsed as number
    const quantity = typeof donation.quantity === 'string' 
      ? parseFloat(donation.quantity) 
      : Number(donation.quantity || 0);
    if (!isNaN(quantity) && quantity > 0) {
      totalFood += quantity;
      totalCO2 += calculateCO2Reduction(quantity);
    }
  });

  return {
    totalFoodSaved: totalFood,
    totalCO2Reduced: totalCO2,
    treesEquivalent: Math.round(totalCO2 / 21.77), // 1 tree ≈ 21.77 kg CO₂/year
    mealsEquivalent: Math.round(totalFood / 0.5) // Average meal ≈ 0.5 kg
  };
};

module.exports = {
  calculateCO2Reduction,
  calculateTotalImpact,
  CO2_PER_KG_FOOD
};

