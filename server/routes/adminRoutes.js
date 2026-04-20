const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, Role } = require('../middleware/roleMiddleware');

router.get('/stats', protect, authorize(Role.ADMIN), getStats);

module.exports = router;
