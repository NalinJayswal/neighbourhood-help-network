/**
 * Admin Controller — Nalin Jayswal
 *
 * Handles admin-level user management.
 * These functions are only reachable by users with role: 'admin'
 * because the adminOnly middleware blocks everyone else.
 *
 * Why separate admin controllers?
 *  Keeping admin logic separate from regular user logic makes the
 *  code easier to maintain and audit. It's immediately clear which
 *  operations have elevated privileges.
 */

const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// GET ALL USERS — GET /api/admin/users
// Returns all registered users (passwords excluded).
// .select('-password') tells Mongoose to omit the password field.
// ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')   // never send passwords to the frontend
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE USER — DELETE /api/admin/users/:id
// Permanently removes a user account from the database.
// Admin cannot delete their own account via this route.
// ─────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety check — prevent admin from accidentally deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Admins cannot delete their own account via this route',
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser };
