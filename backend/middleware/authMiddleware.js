/**
 * Authentication Middleware — Nalin Jayswal
 *
 * Middleware in Express is a function that runs between receiving
 * a request and sending a response. It has access to req, res, and next.
 *
 * Calling next() tells Express to move to the next middleware or route.
 * Not calling next() stops the request — useful for blocking access.
 *
 * This file exports two middleware functions:
 *
 * 1. protect — verifies the user is logged in (has a valid JWT token)
 * 2. adminOnly — verifies the logged-in user has the 'admin' role
 *
 * How JWT authentication works:
 *  - When a user logs in, the server creates a token using jwt.sign()
 *    and sends it to the frontend
 *  - The frontend stores the token and sends it with every request
 *    in the Authorization header: "Bearer <token>"
 *  - The server verifies the token using jwt.verify() — if it's valid,
 *    it extracts the user ID and fetches the user from the database
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — JWT authentication middleware
 * Add this to any route that requires the user to be logged in
 *
 * Example usage in a route file:
 *   router.get('/profile', protect, getProfile);
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token — "Bearer abc123" → "abc123"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our JWT_SECRET
      // If the token is expired or tampered with, this throws an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database using the ID stored in the token
      // .select('-password') excludes the password field from the result
      req.user = await User.findById(decoded.id).select('-password');

      // Pass control to the next middleware or route handler
      next();
    } catch (error) {
      // Token verification failed — expired, invalid, or tampered
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * adminOnly — role-based access control middleware
 * Must be used AFTER protect (needs req.user to be set first)
 *
 * Example usage in a route file:
 *   router.get('/users', protect, adminOnly, getAllUsers);
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // user is an admin, allow the request through
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, adminOnly };
