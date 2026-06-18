
const express = require('express');
const { registerUser, createUser, getUsers, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/users', protect, adminOnly, createUser);
router.get('/users', protect, adminOnly, getUsers);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
