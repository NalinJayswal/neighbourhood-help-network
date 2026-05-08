/**
 * Help Request Controller — Nalin Jayswal
 *
 * Contains all CRUD operations for community help requests.
 *
 * CRUD stands for:
 *  C — Create  (POST)   → createHelpRequest
 *  R — Read    (GET)    → getAllHelpRequests, getMyHelpRequests, getHelpRequestById
 *  U — Update  (PUT)    → updateHelpRequest
 *  D — Delete  (DELETE) → deleteHelpRequest
 *
 * Extra operations:
 *  - volunteerForRequest → PATCH (partial update — only assigns volunteer)
 *  - adminGetAllRequests → GET   (admin sees everything)
 *  - adminDeleteRequest  → DELETE (admin can delete any request)
 *
 * Security rules enforced here:
 *  - Only the creator can edit or delete their own request
 *  - A user cannot volunteer for their own request
 *  - A request with a volunteer cannot accept another volunteer
 */

const HelpRequest = require('../models/HelpRequest');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// CREATE — POST /api/helprequests
// ─────────────────────────────────────────────────────────────
const createHelpRequest = async (req, res) => {
  try {
    const { title, description, category, location, dateNeeded, isUrgent } = req.body;

    // req.user._id comes from the protect middleware
    // This links the request to the logged-in user's account
    const helpRequest = await HelpRequest.create({
      title,
      description,
      category,
      location,
      dateNeeded,
      isUrgent: isUrgent || false,
      createdBy: req.user._id,
    });

    res.status(201).json(helpRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// READ ALL — GET /api/helprequests
// Returns all community requests with optional filters.
// ?category=Groceries  → filter by category
// ?status=Open         → filter by status
// ?location=Brisbane   → filter by location (partial match)
// ─────────────────────────────────────────────────────────────
const getAllHelpRequests = async (req, res) => {
  try {
    const { category, status, location } = req.query;

    // Build filter object dynamically based on query params
    // Only adds a filter if the query param was actually provided
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' }; // case-insensitive search

    const helpRequests = await HelpRequest.find(filter)
      .populate('createdBy', 'name email') // replace ObjectId with actual user data
      .populate('volunteer', 'name email')
      .sort({ isUrgent: -1, createdAt: -1 }); // urgent first, then newest

    res.status(200).json(helpRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// READ MY REQUESTS — GET /api/helprequests/mine
// Returns only requests created by the logged-in user.
// ─────────────────────────────────────────────────────────────
const getMyHelpRequests = async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find({ createdBy: req.user._id })
      .populate('volunteer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(helpRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// READ ONE — GET /api/helprequests/:id
// Returns a single request by its MongoDB _id.
// ─────────────────────────────────────────────────────────────
const getHelpRequestById = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('volunteer', 'name email');

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    res.status(200).json(helpRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE — PUT /api/helprequests/:id
// Only the creator can update their own request.
// ─────────────────────────────────────────────────────────────
const updateHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Compare the request's creator ID with the logged-in user's ID
    // .toString() is needed because MongoDB IDs are objects, not strings
    if (helpRequest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to edit this request' });
    }

    const { title, description, category, location, dateNeeded, status, isUrgent } = req.body;

    // Only update fields that were sent — keep existing values otherwise
    helpRequest.title = title || helpRequest.title;
    helpRequest.description = description || helpRequest.description;
    helpRequest.category = category || helpRequest.category;
    helpRequest.location = location || helpRequest.location;
    helpRequest.dateNeeded = dateNeeded || helpRequest.dateNeeded;
    helpRequest.status = status || helpRequest.status;
    helpRequest.isUrgent = isUrgent !== undefined ? isUrgent : helpRequest.isUrgent;

    const updatedRequest = await helpRequest.save();
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE — DELETE /api/helprequests/:id
// Only the creator can delete their own request.
// ─────────────────────────────────────────────────────────────
const deleteHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    if (helpRequest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this request' });
    }

    await HelpRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Help request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// VOLUNTEER — PATCH /api/helprequests/:id/volunteer
// Assigns the logged-in user as volunteer for a request.
// PATCH is used instead of PUT because we're only partially
// updating the document (just the volunteer field).
// ─────────────────────────────────────────────────────────────
const volunteerForRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    if (helpRequest.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot volunteer for your own request' });
    }

    if (helpRequest.volunteer) {
      return res.status(400).json({ message: 'This request already has a volunteer' });
    }

    helpRequest.volunteer = req.user._id;
    helpRequest.status = 'In Progress';

    const updatedRequest = await helpRequest.save();

    await Notification.create({
      recipient: helpRequest.createdBy,
      message: `Someone volunteered for your request: ${helpRequest.title}`,
      helpRequest: helpRequest._id
  });

res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: GET ALL — GET /api/admin/helprequests
// Admin can see all requests from all users.
// ─────────────────────────────────────────────────────────────
const adminGetAllRequests = async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find()
      .populate('createdBy', 'name email')
      .populate('volunteer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(helpRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: DELETE ANY — DELETE /api/admin/helprequests/:id
// Admin can delete any request without ownership check.
// ─────────────────────────────────────────────────────────────
const adminDeleteRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    await HelpRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Help request deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHelpRequest,
  getAllHelpRequests,
  getMyHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
  volunteerForRequest,
  adminGetAllRequests,
  adminDeleteRequest,
};
