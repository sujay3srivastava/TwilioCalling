export default function handler(req, res) {
    // Serve HTML interface for GET requests
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twilio Call Interface</title>
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
            max-width: 500px;
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

        input, textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .call-btn {
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

        .call-btn:hover {
            transform: translateY(-2px);
        }

        .call-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            display: none;
        }

        .result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
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
            margin: 0 auto 10px;
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
            <h1>📞</h1>
            <h1>Make a Call</h1>
            <p>Enter phone numbers to connect a call</p>
        </div>

        <form id="callForm">
            <div class="form-group">
                <label for="fromNumber">📞 Call From (First Number):</label>
                <input
                    type="tel"
                    id="fromNumber"
                    name="fromNumber"
                    placeholder="+919833230099"
                    required
                >
                <small style="color: #666; font-size: 14px;">This number will be called first</small>
            </div>

            <div class="form-group">
                <label for="toNumber">🔗 Connect To (Second Number):</label>
                <input
                    type="tel"
                    id="toNumber"
                    name="toNumber"
                    placeholder="+919765454491"
                    required
                >
                <small style="color: #666; font-size: 14px;">This number will be connected after first person answers</small>
            </div>

            <button type="submit" class="call-btn" id="callBtn">
                🚀 Connect Call
            </button>
        </form>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Initiating call...</p>
        </div>

        <div class="result" id="result"></div>
    </div>

    <script>
        document.getElementById('callForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const btn = document.getElementById('callBtn');
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            const fromNumber = document.getElementById('fromNumber').value;
            const toNumber = document.getElementById('toNumber').value;

            // Show loading state
            btn.disabled = true;
            btn.textContent = 'Connecting Call...';
            loading.style.display = 'block';
            result.style.display = 'none';

            try {
                const response = await fetch('/api/connect-call', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: fromNumber,
                        to: toNumber
                    })
                });

                const data = await response.json();

                if (data.success) {
                    result.className = 'result success';
                    result.innerHTML = \`
                        <h3>✅ Call Connection Initiated!</h3>
                        <p><strong>Call SID:</strong> \${data.callSid}</p>
                        <p><strong>Calling First:</strong> \${data.firstNumber}</p>
                        <p><strong>Will Connect To:</strong> \${data.secondNumber}</p>
                        <p><strong>Status:</strong> \${data.status}</p>
                        <p><small>The first number will be called, then connected to the second number when answered.</small></p>
                    \`;
                } else {
                    throw new Error(data.error || 'Failed to make call');
                }
            } catch (error) {
                result.className = 'result error';
                result.innerHTML = \`
                    <h3>❌ Call Failed</h3>
                    <p>\${error.message}</p>
                \`;
            } finally {
                // Reset button state
                btn.disabled = false;
                btn.textContent = '🚀 Connect Call';
                loading.style.display = 'none';
                result.style.display = 'block';
            }
        });

        // Auto-format phone numbers
        ['fromNumber', 'toNumber'].forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\D/g, '');
                if (value && !value.startsWith('+')) {
                    if (value.startsWith('91') && value.length >= 12) {
                        value = '+' + value;
                    } else if (value.startsWith('1') && value.length >= 11) {
                        value = '+' + value;
                    } else if (value.length >= 10) {
                        value = '+91' + value;
                    }
                }
                e.target.value = value;
            });
        });
    </script>
</body>
</html>`);
        return;
    }

    // JSON response for API requests
    res.status(200).json({
        message: 'Twilio Webhook Server is running on Vercel!',
        timestamp: new Date().toISOString(),
        endpoints: {
            'GET /api/': 'Web interface for making calls',
            'POST /api/make-call': 'Make outgoing calls',
            'POST /api/webhook/incoming-call': 'Handle incoming calls',
            'POST /api/webhook/call-status': 'Handle call status updates'
        }
    });
}