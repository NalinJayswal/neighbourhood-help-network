/**
 * HelpRequest Model — Nalin Jayswal
 *
 * A Mongoose "model" defines the structure of documents stored
 * in a MongoDB collection — similar to a table schema in SQL.
 *
 * How Mongoose models work:
 *  1. We define a "schema" describing the fields and their types
 *  2. We create a model from the schema using mongoose.model()
 *  3. The model gives us methods like .find(), .create(), .save()
 *     to interact with the MongoDB collection
 *
 * MongoDB will store these documents in a collection called
 * "helprequests" (Mongoose automatically lowercases and pluralises
 * the model name "HelpRequest").
 */

const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    // Title — short summary of what help is needed
    title: {
      type: String,
      required: [true, 'Title is required'], // validation with custom error message
      trim: true,                             // removes accidental leading/trailing spaces
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // Description — full explanation of the help needed
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // Category — what type of help is needed
    // enum restricts the value to only these options
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Groceries', 'Pet Care', 'Transport', 'Garden', 'Childcare', 'Tech Help', 'Moving', 'Other'],
      default: 'Other',
    },

    // Location — suburb where help is needed
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // Status — tracks the lifecycle of the request
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open', // all new requests start as Open
    },

    // Date when help is needed
    dateNeeded: {
      type: Date,
      required: [true, 'Date needed is required'],
    },

    // Reference to the User who created this request
    // ObjectId links this document to a document in the User collection
    // This is how MongoDB handles relationships between collections
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // tells Mongoose which model to use when populating
      required: true,
    },

    // Reference to the User who volunteered to help
    // null by default — filled in when someone volunteers
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Whether the request is urgent — urgent requests appear at top
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // MongoDB updates these automatically whenever the document changes
    timestamps: true,
  }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
