const pool = require('../config/db');
const { analyzeItem, extractReceiptItems, generateWastePrediction } = require('../services/geminiService');

/**
 * POST /api/ai/analyze-item
 * Analyze a pantry item using Gemini and store analysis
 */
const analyzeItemEndpoint = async (req, res) => {
    try {
        const { itemName, category, quantity, unit, expiryDate, purchasePrice } = req.body;
        const organization_id = req.user.organization_id;

        if (!itemName || !category) {
            return res.status(400).json({ message: 'Missing item name or category' });
        }

        // Get AI analysis
        const analysisResult = await analyzeItem(itemName, category, quantity, unit, expiryDate);
        if (!analysisResult.success) {
            return res.status(500).json({ message: 'AI analysis failed', error: analysisResult.error });
        }

        // Get waste prediction
        const predictionResult = await generateWastePrediction(itemName, category, quantity, purchasePrice, expiryDate);
        const prediction = predictionResult.success ? predictionResult.prediction : null;

        res.json({
            analysis: analysisResult.analysis,
            prediction,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error analyzing item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/ai/extract-receipt
 * Extract items from receipt image/text using Gemini OCR
 */
const extractReceiptEndpoint = async (req, res) => {
    try {
        const { receiptText, receiptImage } = req.body;

        if (!receiptText && !receiptImage) {
            return res.status(400).json({ message: 'Provide receipt text or image' });
        }

        // For now, use text. In production, you'd convert image to text first
        const textToProcess = receiptText || 'Receipt image parsing not yet implemented';

        const extractResult = await extractReceiptItems(textToProcess);
        if (!extractResult.success) {
            return res.status(500).json({ message: 'Failed to extract receipt items', error: extractResult.error });
        }

        res.json({
            items: extractResult.items,
            message: `Extracted ${extractResult.items.length} items from receipt`
        });
    } catch (error) {
        console.error('Error extracting receipt:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/ai/waste-insights
 * Get AI-powered waste insights for organization
 */
const getWasteInsights = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;

        // Get pantry items expiring soon
        const [expiringItems] = await pool.query(
            `SELECT name, category, quantity, unit, expiry_date, purchase_price 
             FROM pantry_items 
             WHERE organization_id = ? AND status = 'in_stock' 
             AND expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
             ORDER BY expiry_date ASC
             LIMIT 5`,
            [organization_id]
        );

        // Get recent waste logs
        const [recentWaste] = await pool.query(
            `SELECT * FROM waste_logs 
             WHERE organization_id = ? 
             ORDER BY logged_at DESC 
             LIMIT 10`,
            [organization_id]
        );

        res.json({
            expiringItems,
            recentWaste,
            insights: {
                itemsAtRisk: expiringItems.length,
                recentWasteEvents: recentWaste.length,
                totalWasteValue: recentWaste.reduce((sum, w) => sum + Number(w.cost || 0), 0).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error getting waste insights:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/ai/predict-waste
 * Get AI prediction for a specific item
 */
const predictWaste = async (req, res) => {
    try {
        const { itemName, category, quantity, purchasePrice, expiryDate } = req.body;

        if (!itemName || !category) {
            return res.status(400).json({ message: 'Missing item name or category' });
        }

        const predictionResult = await generateWastePrediction(itemName, category, quantity, purchasePrice || 0, expiryDate);

        if (!predictionResult.success) {
            return res.status(500).json({ message: 'Prediction failed', error: predictionResult.error });
        }

        res.json(predictionResult.prediction);
    } catch (error) {
        console.error('Error predicting waste:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    analyzeItemEndpoint,
    extractReceiptEndpoint,
    getWasteInsights,
    predictWaste
};
