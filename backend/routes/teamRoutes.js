const express = require('express');
const router = express.Router();
const { getTeamMembers, addMember, updateMemberRole, removeMember } = require('../controllers/teamController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getTeamMembers);
router.post('/', addMember);
router.put('/:id/role', updateMemberRole);
router.delete('/:id', removeMember);

module.exports = router;
