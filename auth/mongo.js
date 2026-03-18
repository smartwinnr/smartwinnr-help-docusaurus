'use strict';

const mongoose = require('mongoose');
const config = require('./config');

// Connection cache: regionKey → mongoose.Connection
const connections = new Map();

// Map base URLs to config keys
const REGION_URI_MAP = {
  'ap-south-1.smartwinnr.com': 'mongoUriApSouth1',
  'app.smartwinnr.com': 'mongoUriEuWest1',
};

/**
 * Get or create a cached mongoose connection for the given region base URL.
 */
function getConnection(regionBaseUrl) {
  // Normalize: strip protocol and trailing slashes
  const host = regionBaseUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  const configKey = REGION_URI_MAP[host];
  if (!configKey) {
    // Default to EU West (Ireland) if unknown region
    console.warn(`Unknown region base URL "${regionBaseUrl}", defaulting to EU West`);
  }

  const uriKey = configKey || 'mongoUriEuWest1';
  const uri = config[uriKey];

  if (!uri) {
    throw new Error(`No MongoDB URI configured for region: ${regionBaseUrl} (key: ${uriKey})`);
  }

  if (connections.has(uriKey)) {
    return connections.get(uriKey);
  }

  const conn = mongoose.createConnection(uri, {
    maxPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  conn.on('error', (err) => {
    console.error(`MongoDB connection error [${uriKey}]:`, err.message);
  });

  connections.set(uriKey, conn);
  return conn;
}

/**
 * Look up a user by email in the regional MongoDB's users collection.
 * The SmartWinnr user model stores email as `username` for login.
 */
async function getUserByEmail(regionInfo, email) {
  const conn = getConnection(regionInfo.baseUrl);
  const tenantId = new mongoose.Types.ObjectId(regionInfo.tenantId);
  const UsersCollection = conn.collection('users');

  // Search by username (primary login field) or email field
  const user = await UsersCollection.findOne({
    tenant_id: tenantId,
    $or: [
      { username: email.toLowerCase() },
      { email: email.toLowerCase() },
    ],
  },{ projection: { _id: 1, username: 1, email: 1, roles: 1 } });

  return user;
}

/**
 * Check if a user document has editor or admin role.
 */
function hasPrivilegedRole(user) {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some(
    (role) => role === 'editor' || role === 'admin'
  );
}

/**
 * Close all cached MongoDB connections (for graceful shutdown).
 */
async function closeAllConnections() {
  const closePromises = [];
  for (const [key, conn] of connections) {
    closePromises.push(
      conn.close().catch((err) => {
        console.error(`Error closing MongoDB connection [${key}]:`, err.message);
      })
    );
  }
  await Promise.all(closePromises);
  connections.clear();
}

module.exports = {
  getUserByEmail,
  hasPrivilegedRole,
  closeAllConnections,
};
