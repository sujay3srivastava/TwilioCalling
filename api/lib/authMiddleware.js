const { isAuthenticated } = require('./auth');

/**
 * Authentication middleware wrapper
 *
 * @param {Function} handler - The original handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.skipAuth - Skip authentication (for webhooks)
 * @param {string} options.type - 'html' or 'api' - determines redirect vs 401
 */
function withAuth(handler, options = {}) {
  const { skipAuth = false, type = 'api' } = options;

  return async function (req, res) {
    // Skip authentication for webhooks
    if (skipAuth) {
      return handler(req, res);
    }

    // Check authentication
    if (!isAuthenticated(req)) {
      if (type === 'html') {
        // Redirect to login page for HTML endpoints
        res.setHeader('Content-Type', 'text/html');
        res.status(401).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta http-equiv="refresh" content="0; url=/api/auth">
            <title>Unauthorized</title>
          </head>
          <body>
            <p>Redirecting to login...</p>
          </body>
          </html>
        `);
      } else {
        // Return 401 for API endpoints
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Please login to access this endpoint'
        });
      }
      return;
    }

    // User is authenticated, proceed to handler
    return handler(req, res);
  };
}

module.exports = { withAuth };
