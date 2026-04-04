/**
 * Admin Routes — Nalin Jayswal
 *
 * These routes are protected by TWO middleware functions:
 *  1. protect    → user must be logged in
 *  2. adminOnly  → user must have role: 'admin'
 *
 * Both run in sequence. If protect fails, adminOnly never runs.
 * This is called "middleware chaining" — a core Express pattern.
 *
 * Only Nalin's account (nalin@network.com) has role: 'admin'
 * so only Nalin can access these endpoints.
 */

const express = require('express');
const {
  adminGetAllRequests,
  adminDeleteRequest,
} = require('../controllers/helpRequestController');
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Help request management (admin)
router.get('/helprequests', protect, adminOnly, adminGetAllRequests);
router.delete('/helprequests/:id', protect, adminOnly, adminDeleteRequest);

// User management (admin)
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
