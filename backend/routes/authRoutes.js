/**
 * Auth Routes — Nalin Jayswal
 *
 * Defines the URL endpoints for authentication.
 *
 * How Express Router works:
 *  - express.Router() creates a mini-app that handles routes
 *  - router.post('/register', registerUser) means:
 *    "when a POST request comes in to /register, run registerUser"
 *  - The full URL is /api/auth/register because server.js mounts
 *    this router at app.use('/api/auth', require('./routes/authRoutes'))
 *
 * protect is middleware — it runs BEFORE the controller function.
 * If the user isn't logged in, protect stops the request and sends
 * a 401 error. If they are logged in, it calls next() and the
 * controller runs.
 */

const express = require('express');
const {
  registerUser,
  loginUser,
  updateUserProfile,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes — no authentication needed
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes — must be logged in (JWT token required)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
