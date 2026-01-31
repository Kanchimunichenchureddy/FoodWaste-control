const express = require('express');
const router = express.Router();
const { getWasteLogs, logWaste } = require('../controllers/wasteController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getWasteLogs);
router.post('/', logWaste);

module.exports = router;
