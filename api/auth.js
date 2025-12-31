const { verifyPassword, generateToken, createAuthCookie, createLogoutCookie, isAuthenticated } = require('./lib/auth');

export default function handler(req, res) {
  // Handle logout via query parameter or DELETE method
  if (req.url?.includes('logout') || req.method === 'DELETE') {
    res.setHeader('Set-Cookie', createLogoutCookie());
    res.setHeader('Location', '/api/auth');
    res.status(302).end();
    return;
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated(req)) {
    res.setHeader('Location', '/api/');
    res.status(302).end();
    return;
  }

  // Handle POST - login form submission
  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { password } = JSON.parse(body);

        if (!password) {
          res.status(400).json({
            success: false,
            error: 'Password is required'
          });
          return;
        }

        // Verify password
        if (verifyPassword(password)) {
          // Generate JWT token
          const token = generateToken();

          // Set authentication cookie
          res.setHeader('Set-Cookie', createAuthCookie(token));

          // Return success response
          res.status(200).json({
            success: true,
            message: 'Login successful',
            redirectUrl: '/api/'
          });
        } else {
          // Invalid password
          res.status(401).json({
            success: false,
            error: 'Invalid password'
          });
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request format'
        });
      }
    });

    return;
  }

  // Handle GET - serve login page
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Twilio Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #333;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            color: #666;
            font-size: 1.1rem;
        }

        .form-group {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }

        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }

        .login-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .login-btn:hover {
            transform: translateY(-2px);
        }

        .login-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .error {
            margin-top: 15px;
            padding: 15px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            border-radius: 10px;
            display: none;
        }

        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }

        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Twilio Portal</h1>
            <p>Enter password to continue</p>
        </div>

        <form id="loginForm">
            <div class="form-group">
                <label for="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    autofocus
                >
            </div>

            <button type="submit" class="login-btn" id="loginBtn">
                Login
            </button>
        </form>

        <div class="loading" id="loading">
            <div class="spinner"></div>
        </div>

        <div class="error" id="error"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const btn = document.getElementById('loginBtn');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const password = document.getElementById('password').value;

            // Show loading state
            btn.disabled = true;
            btn.textContent = 'Logging in...';
            loading.style.display = 'block';
            error.style.display = 'none';

            try {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();

                if (data.success) {
                    // Redirect to dashboard
                    window.location.href = data.redirectUrl || '/api/';
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            } catch (err) {
                error.textContent = err.message;
                error.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Login';
                loading.style.display = 'none';
            }
        });
    </script>
</body>
</html>`);
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}
