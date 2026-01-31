const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyA7RTqYy2s1C_AsNDn43tusl9AzJdmdB40';
const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Analyze a food item and predict waste patterns, shelf life, etc.
 */
async function analyzeItem(itemName, category, quantity, unit, expiryDate) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are a food waste prediction AI. Analyze this food item and provide structured insights:

Item: ${itemName}
Category: ${category}
Quantity: ${quantity} ${unit}
Expiry Date: ${expiryDate}

Provide a JSON response with ONLY these fields (no other text):
{
  "wasteRisk": "low" | "medium" | "high",
  "estimatedShelfLife": "number of days",
  "commonWasteReasons": ["reason1", "reason2", "reason3"],
  "storageRecommendations": "storage tips",
  "estimatedValuePerUnit": "price estimate per unit",
  "nutritionTip": "brief nutrition info"
}

Return only valid JSON, no markdown, no explanation.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid JSON response from Gemini');
        
        const analysis = JSON.parse(jsonMatch[0]);
        return { success: true, analysis };
    } catch (error) {
        console.error('Gemini item analysis error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Extract items from receipt text using OCR
 */
async function extractReceiptItems(receiptText) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are a grocery receipt parser. Extract all food items from this receipt text.

Receipt text:
${receiptText}

For each item found, provide a JSON array with this structure:
[
  {
    "name": "item name",
    "category": "Produce|Dairy|Meat|Grains|Beverages|Snacks|Frozen|Bakery|Other",
    "quantity": 1,
    "unit": "pcs|kg|g|l|ml|lb|oz|box|bag|can",
    "price": "estimated price or 0",
    "expiryDays": "estimated days until expiry"
  }
]

Return ONLY the JSON array, no markdown, no explanation.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No items found in receipt');
        
        const items = JSON.parse(jsonMatch[0]);
        return { success: true, items };
    } catch (error) {
        console.error('Gemini receipt extraction error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Generate waste prediction and analytics summary for a pantry item
 */
async function generateWastePrediction(itemName, category, quantity, purchasePrice, expiryDate) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are a food waste analytics AI. Based on this pantry item, predict waste likelihood and provide recommendations:

Item: ${itemName}
Category: ${category}
Quantity: ${quantity}
Purchase Price: $${purchasePrice}
Expiry Date: ${expiryDate}

Provide a JSON response:
{
  "wasteScore": 0-100,
  "prediction": "likely to be wasted" | "moderate waste risk" | "likely to be consumed",
  "recommendations": ["tip1", "tip2", "tip3"],
  "estimatedCost": "estimated cost if wasted",
  "carbonFootprint": "estimated kg CO2 if wasted"
}

Return only valid JSON.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid JSON response');
        
        const prediction = JSON.parse(jsonMatch[0]);
        return { success: true, prediction };
    } catch (error) {
        console.error('Gemini prediction error:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    analyzeItem,
    extractReceiptItems,
    generateWastePrediction
};
