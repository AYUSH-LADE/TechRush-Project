const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  getClaimById,
  approveClaim,
  rejectClaim
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.post('/items/:itemId/claim', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/received', protect, getReceivedClaims);
router.get('/:claimId', protect, getClaimById);
router.patch('/:claimId/approve', protect, approveClaim);
router.patch('/:claimId/reject', protect, rejectClaim);

module.exports = router;
