/**
 * Database Configuration — Local MongoDB
 *
 * Connects to a local MongoDB instance using Mongoose.
 * The connection URI is read from the MONGO_URI environment variable.
 *
 * How it works:
 *  - mongoose.connect() opens a connection to the MongoDB server
 *  - If the connection fails, we log the error and exit the process
 *    because the app cannot function without a database
 *  - conn.connection.host tells us which server we connected to
 *    (will show "localhost" for local MongoDB)
 *
 * For local development:
 *   MONGO_URI=mongodb://localhost:27017/nalin-network
 *
 * MongoDB stores data in "collections" (like tables in SQL).
 * The database name "nalin-network" will be created automatically
 * the first time data is inserted — no need to create it manually.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB — mongoose 6+ does not need extra options
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log which server we connected to so we can confirm it worked
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the reason and stop the app
    console.error(`❌ Database connection failed: ${error.message}`);
    console.error('👉 Make sure MongoDB is running: check Services in Windows');
    process.exit(1);
  }
};

module.exports = connectDB;
