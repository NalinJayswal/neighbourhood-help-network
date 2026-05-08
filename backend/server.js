/**
 * Neighbourhood Help Network — Express Server
 * Author: Nalin Jayswal
 *
 * This is the main entry point for the backend.
 * It sets up the Express app, connects to MongoDB,
 * and registers all the API routes.
 *
 * How Express works:
 *  - app.use() registers middleware or routes
 *  - Middleware runs on every request (e.g. cors, express.json)
 *  - Routes handle specific URL paths (e.g. /api/auth)
 *  - Requests flow top to bottom through the middleware chain
 *
 * API structure:
 *   /api/auth          → register, login, view/update profile
 *   /api/helprequests  → full CRUD for community help requests
 *   /api/admin         → admin-only: manage all requests and users
 *   /api/health        → health check (confirms server is running)
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load variables from .env file into process.env
// Must be called before accessing any environment variables
dotenv.config();

const app = express();

// ── Middleware ───────────────────────────────────────────────
// cors() allows the React frontend (port 3000) to call this API (port 5001)
// Without this, browsers block cross-origin requests for security
app.use(cors());

// express.json() parses incoming request bodies as JSON
// Without this, req.body would be undefined in POST/PUT routes
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
// Each route file handles a specific part of the application
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/helprequests', require('./routes/helpRequestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/helprequests/:id/comments', commentRoutes);
<<<<<<< feature/comments
=======

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

>>>>>>> main
// ── Health Check ─────────────────────────────────────────────
// This endpoint is used to verify the server is running
// Useful for CI/CD pipelines and deployment verification
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Neighbourhood Help Network',
    author: 'Nalin Jayswal',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Root ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Neighbourhood Help Network API is running 🏘️' });
});

// ── 404 Handler ──────────────────────────────────────────────
// This runs when no route above matched the request URL
// The order matters — this must come AFTER all routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
// Express recognises error handlers by their 4 parameters (err, req, res, next)
// Any route that calls next(error) will land here
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────
// require.main === module checks if this file was run directly
// (node server.js) vs being imported in tests (require('./server'))
// This prevents the server from starting when tests import the app
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/health`);
  });
}

// Export app so Mocha tests can import it without starting the server
module.exports = app;
