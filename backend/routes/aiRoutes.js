const express = require('express');
const router = express.Router();
const { analyzeItemEndpoint, extractReceiptEndpoint, getWasteInsights, predictWaste } = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // All AI routes are protected

router.post('/analyze-item', analyzeItemEndpoint);
router.post('/extract-receipt', extractReceiptEndpoint);
router.get('/waste-insights', getWasteInsights);
router.post('/predict-waste', predictWaste);

module.exports = router;
