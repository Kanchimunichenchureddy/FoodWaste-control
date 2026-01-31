const express = require('express');
const router = express.Router();
const { getAllItems, addItem, updateItem, deleteItem } = require('../controllers/pantryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // All pantry routes are protected

router.get('/', getAllItems);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
