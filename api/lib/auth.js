const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// PASSWORD HASH - Generated with bcrypt.hashSync('pixiedust', 10)
// Current password: pixiedust
// To change: Run node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
// Then replace PASSWORD_HASH below with the new hash
const PASSWORD_HASH = '$2b$10$utXFaCrmm1BlCOlBUbyhfuoDkmYLG5BSQbU9Mu897O/iCpGuCc0CK';

// JWT secret - should be stored in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'twilio-portal-secret-key-change-in-production';

// Session configuration
const SESSION_CONFIG = {
  cookieName: 'twilio_auth_token',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',
  path: '/'
};

/**
 * Verify password against stored hash
 */
function verifyPassword(password) {
  try {
    return bcrypt.compareSync(password, PASSWORD_HASH);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
function generateToken() {
  return jwt.sign(
    {
      authenticated: true,
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = value;
    return cookies;
  }, {});
}

/**
 * Get auth token from request cookies
 */
function getAuthToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_CONFIG.cookieName];
}

/**
 * Check if request is authenticated
 */
function isAuthenticated(req) {
  const token = getAuthToken(req);
  if (!token) return false;

  const { valid } = verifyToken(token);
  return valid;
}

/**
 * Create Set-Cookie header for authentication
 */
function createAuthCookie(token) {
  const cookieParts = [
    `${SESSION_CONFIG.cookieName}=${token}`,
    `Max-Age=${SESSION_CONFIG.maxAge / 1000}`, // Convert to seconds
    `Path=${SESSION_CONFIG.path}`,
    `SameSite=${SESSION_CONFIG.sameSite}`
  ];

  if (SESSION_CONFIG.httpOnly) {
    cookieParts.push('HttpOnly');
  }

  if (SESSION_CONFIG.secure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
}

/**
 * Create Set-Cookie header for logout (expired cookie)
 */
function createLogoutCookie() {
  return `${SESSION_CONFIG.cookieName}=; Max-Age=0; Path=${SESSION_CONFIG.path}`;
}

module.exports = {
  verifyPassword,
  generateToken,
  verifyToken,
  isAuthenticated,
  createAuthCookie,
  createLogoutCookie,
  getAuthToken
};
