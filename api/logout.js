const { createLogoutCookie } = require('./lib/auth');

export default function handler(req, res) {
  // Clear authentication cookie
  res.setHeader('Set-Cookie', createLogoutCookie());

  // Redirect to login page
  res.setHeader('Location', '/api/login');
  res.status(302).end();
}
