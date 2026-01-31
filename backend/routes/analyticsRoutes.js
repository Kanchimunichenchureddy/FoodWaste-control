const express = require('express');
const router = express.Router();
const { getOverview, getWasteByCategory, getWasteByReason, getWasteTrends, getCommunityImpact } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/overview', getOverview);
router.get('/impact/community', getCommunityImpact);
router.get('/category', getWasteByCategory);
router.get('/reason', getWasteByReason);
router.get('/trends', getWasteTrends);

module.exports = router;
