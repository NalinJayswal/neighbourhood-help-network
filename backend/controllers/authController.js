/**
 * Auth Controller — Nalin Jayswal
 *
 * Controllers contain the business logic for each route.
 * They receive the request (req), process it, and send a response (res).
 *
 * Separating controllers from routes is an industry best practice
 * because it keeps route files clean and makes logic easier to test.
 *
 * This controller handles:
 *  - registerUser  → create a new account
 *  - loginUser     → verify credentials and return a JWT token
 *  - getProfile    → return the logged-in user's profile
 *  - updateProfile → update the logged-in user's profile
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * generateToken — creates a JWT for the given user ID
 *
 * jwt.sign() takes a payload (the data to store), a secret key,
 * and options. The token expires after 30 days — after that,
 * the user must log in again.
 *
 * The token is sent to the frontend and stored in localStorage.
 * The frontend attaches it to every API request as:
 * Authorization: Bearer <token>
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─────────────────────────────────────────────────────────────
// REGISTER — POST /api/auth/register
// Creates a new user account.
// Password hashing is handled automatically by the User model's
// pre-save hook — we just pass the plain password.
// ─────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, password, address } = req.body;
  try {
    // Check if an account already exists with this email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the user — password is hashed by the pre-save hook
    const user = await User.create({ name, email, password, address });

    // Respond with user data and a token so the frontend can log them in immediately
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN — POST /api/auth/login
// Verifies credentials and returns a JWT token.
// bcrypt.compare() checks the plain password against the hash.
// ─────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // bcrypt.compare() returns true if password matches the stored hash
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      // Use the same error message for both wrong email and wrong password
      // This is a security practice — we don't want to reveal which one is wrong
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE — GET /api/auth/profile
// Returns the logged-in user's profile.
// req.user is set by the protect middleware.
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      university: user.university,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE — PUT /api/auth/profile
// Updates the logged-in user's profile fields.
// Only updates fields that were provided in the request body.
// ─────────────────────────────────────────────────────────────
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, university, address } = req.body;

    // Only overwrite fields that were actually sent in the request
    // Using "|| user.field" keeps the existing value if nothing was sent
    user.name = name || user.name;
    user.email = email || user.email;
    user.university = university || user.university;
    user.address = address || user.address;

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      university: updatedUser.university,
      address: updatedUser.address,
      role: updatedUser.role,
      token: generateToken(updatedUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
