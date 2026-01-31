const express = require('express');
const router = express.Router();
const {
    createDonation,
    getAvailableDonations,
    getMyDonations,
    getMyClaims,
    claimDonation,
    completeDonation
} = require('../controllers/donationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Marketplace (Available stuff)
router.get('/marketplace', getAvailableDonations);

// My Management
router.get('/my-posts', getMyDonations);
router.get('/my-claims', getMyClaims);

// Actions
router.post('/', createDonation);
router.put('/:id/claim', claimDonation);
router.put('/:id/complete', completeDonation);

module.exports = router;
