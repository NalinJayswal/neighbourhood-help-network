/**
 * Help Request Routes — Nalin Jayswal
 *
 * All routes here are protected — users must be logged in.
 *
 * router.route() chains multiple HTTP methods on the same path
 * which is cleaner than writing them separately:
 *
 *   router.route('/')
 *     .get(protect, getAllHelpRequests)   → GET  /api/helprequests
 *     .post(protect, createHelpRequest)  → POST /api/helprequests
 *
 * REST conventions used:
 *  GET    /api/helprequests       → get all (collection)
 *  POST   /api/helprequests       → create new
 *  GET    /api/helprequests/mine  → get my own requests
 *  GET    /api/helprequests/:id   → get one by ID
 *  PUT    /api/helprequests/:id   → update one (full update)
 *  DELETE /api/helprequests/:id   → delete one
 *  PATCH  /api/helprequests/:id/volunteer → partial update (volunteer)
 */

const express = require('express');
const {
  createHelpRequest,
  getAllHelpRequests,
  getMyHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
  volunteerForRequest,
} = require('../controllers/helpRequestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Collection routes
router.route('/')
  .get(protect, getAllHelpRequests)
  .post(protect, createHelpRequest);

// Must be before /:id route — otherwise "mine" gets treated as an ID
router.get('/mine', protect, getMyHelpRequests);

// Single item routes
router.route('/:id')
  .get(protect, getHelpRequestById)
  .put(protect, updateHelpRequest)
  .delete(protect, deleteHelpRequest);

// Volunteer action — PATCH for partial update
router.patch('/:id/volunteer', protect, volunteerForRequest);

module.exports = router;
