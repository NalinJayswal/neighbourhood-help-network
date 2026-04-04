/**
 * User Model — Nalin Jayswal
 *
 * Defines the structure for user accounts in the database.
 *
 * Key concepts used here:
 *
 * 1. Schema validation — required, unique, enum etc. are rules
 *    Mongoose enforces before saving to the database. If a rule
 *    is broken, Mongoose throws a ValidationError automatically.
 *
 * 2. Pre-save hook — the userSchema.pre('save') function runs
 *    automatically BEFORE a user document is saved. We use it
 *    to hash the password so it is never stored as plain text.
 *
 * 3. Role field — determines what the user can access:
 *    'user'  → regular community member (default)
 *    'admin' → Nalin's account, can access the Admin Panel
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // MongoDB creates a unique index on this field
      lowercase: true,   // automatically converts to lowercase before saving
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Optional fields — not required for registration
    university: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
      trim: true,
    },

    // Role-based access control
    // 'user' is the default for anyone who registers normally
    // 'admin' is set manually (or via the seed script) for Nalin
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save middleware — runs before every .save() call
 *
 * this.isModified('password') checks if the password field
 * was changed. We skip hashing if it wasn't — otherwise we'd
 * hash an already-hashed password every time the user updates
 * their profile, which would break login.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next(); // continue saving the document
});

module.exports = mongoose.model('User', userSchema);
