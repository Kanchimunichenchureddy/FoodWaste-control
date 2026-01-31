const express = require('express');
const router = express.Router();
const { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAllSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
