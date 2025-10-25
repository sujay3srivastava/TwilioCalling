export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages Inbox</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-card h3 {
            color: #667eea;
            font-size: 0.9rem;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }

        .filters {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filters label {
            font-weight: 600;
            color: #333;
        }

        .filters select, .filters input {
            padding: 8px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
        }

        .filters select:focus, .filters input:focus {
            outline: none;
            border-color: #667eea;
        }

        .messages-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .message-card {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            transition: transform 0.2s ease;
        }

        .message-card:hover {
            transform: translateX(5px);
        }

        .message-card.outbound {
            border-left-color: #764ba2;
            background: #f3f0ff;
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            flex-wrap: wrap;
            gap: 10px;
        }

        .message-info {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .phone {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: #333;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .badge-inbound {
            background-color: #e3f2fd;
            color: #1976d2;
        }

        .badge-outbound {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }

        .badge-delivered {
            background-color: #e8f5e9;
            color: #388e3c;
        }

        .badge-sent {
            background-color: #fff3e0;
            color: #f57c00;
        }

        .badge-failed {
            background-color: #ffebee;
            color: #d32f2f;
        }

        .badge-queued {
            background-color: #e0e0e0;
            color: #616161;
        }

        .message-body {
            background: white;
            padding: 12px;
            border-radius: 5px;
            margin-top: 10px;
            line-height: 1.5;
            color: #333;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .message-time {
            color: #666;
            font-size: 0.85rem;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #667eea;
            font-size: 1.2rem;
        }

        .error {
            background: #ffebee;
            color: #c62828;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
            font-size: 1.1rem;
        }

        .nav-links {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .nav-link {
            padding: 10px 20px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .nav-link:hover {
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 1.8rem;
            }

            .message-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Messages Inbox</h1>

        <div class="nav-links">
            <a href="/api/" class="nav-link">Make a Call</a>
            <a href="/api/call-history" class="nav-link">Call History</a>
        </div>

        <div class="stats" id="stats">
            <div class="stat-card">
                <h3>Total Messages</h3>
                <div class="value" id="totalMessages">-</div>
            </div>
            <div class="stat-card">
                <h3>Incoming</h3>
                <div class="value" id="incomingMessages">-</div>
            </div>
            <div class="stat-card">
                <h3>Outgoing</h3>
                <div class="value" id="outgoingMessages">-</div>
            </div>
            <div class="stat-card">
                <h3>Delivered</h3>
                <div class="value" id="deliveredMessages">-</div>
            </div>
        </div>

        <div class="filters">
            <label for="directionFilter">Direction:</label>
            <select id="directionFilter">
                <option value="all">All</option>
                <option value="inbound">Incoming</option>
                <option value="outbound-api">Outgoing</option>
            </select>

            <label for="statusFilter">Status:</label>
            <select id="statusFilter">
                <option value="all">All</option>
                <option value="delivered">Delivered</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
            </select>

            <label for="searchPhone">Search Phone:</label>
            <input type="text" id="searchPhone" placeholder="+1234567890">
        </div>

        <div class="messages-container">
            <div id="loading" class="loading">Loading messages...</div>
            <div id="error" class="error" style="display: none;"></div>
            <div id="noData" class="no-data" style="display: none;">No messages found</div>
            <div id="messagesContainer" style="display: none;"></div>
        </div>
    </div>

    <script>
        let allMessages = [];

        // Fetch message history
        async function fetchMessageHistory() {
            try {
                const response = await fetch('/api/api/message-history');
                const data = await response.json();

                if (data.success) {
                    allMessages = data.messages;
                    updateStats(allMessages);
                    displayMessages(allMessages);
                    document.getElementById('loading').style.display = 'none';
                } else {
                    throw new Error(data.message || 'Failed to fetch message history');
                }
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').textContent = 'Error: ' + error.message;
            }
        }

        // Update statistics
        function updateStats(messages) {
            const total = messages.length;
            const incoming = messages.filter(m => m.direction === 'inbound').length;
            const outgoing = messages.filter(m => m.direction === 'outbound-api' || m.direction === 'outbound').length;
            const delivered = messages.filter(m => m.status === 'delivered').length;

            document.getElementById('totalMessages').textContent = total;
            document.getElementById('incomingMessages').textContent = incoming;
            document.getElementById('outgoingMessages').textContent = outgoing;
            document.getElementById('deliveredMessages').textContent = delivered;
        }

        // Display messages
        function displayMessages(messages) {
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';

            if (messages.length === 0) {
                document.getElementById('messagesContainer').style.display = 'none';
                document.getElementById('noData').style.display = 'block';
                return;
            }

            document.getElementById('messagesContainer').style.display = 'block';
            document.getElementById('noData').style.display = 'none';

            messages.forEach(message => {
                const card = document.createElement('div');
                card.className = 'message-card' + (message.direction === 'outbound-api' || message.direction === 'outbound' ? ' outbound' : '');

                const directionBadge = (message.direction === 'inbound') ?
                    '<span class="badge badge-inbound">Incoming</span>' :
                    '<span class="badge badge-outbound">Outgoing</span>';

                let statusBadge = '';
                if (message.status === 'delivered') {
                    statusBadge = '<span class="badge badge-delivered">Delivered</span>';
                } else if (message.status === 'sent') {
                    statusBadge = '<span class="badge badge-sent">Sent</span>';
                } else if (message.status === 'failed' || message.status === 'undelivered') {
                    statusBadge = '<span class="badge badge-failed">Failed</span>';
                } else if (message.status === 'queued') {
                    statusBadge = '<span class="badge badge-queued">Queued</span>';
                } else {
                    statusBadge = '<span class="badge">' + message.status + '</span>';
                }

                const dateSent = message.dateSent ? new Date(message.dateSent) : null;
                const dateStr = dateSent ? dateSent.toLocaleString() : 'N/A';

                const fromLabel = message.direction === 'inbound' ? 'From' : 'To';
                const phoneNumber = message.direction === 'inbound' ? message.from : message.to;

                card.innerHTML = \`
                    <div class="message-header">
                        <div class="message-info">
                            \${directionBadge}
                            <span><strong>\${fromLabel}:</strong> <span class="phone">\${phoneNumber}</span></span>
                            \${statusBadge}
                        </div>
                        <div class="message-time">\${dateStr}</div>
                    </div>
                    <div class="message-body">\${message.body || '(No text content)'}</div>
                    \${message.numMedia && message.numMedia !== '0' ? '<div style="margin-top: 8px; color: #666; font-size: 0.85rem;">📎 ' + message.numMedia + ' media attachment(s)</div>' : ''}
                    \${message.errorMessage ? '<div style="margin-top: 8px; color: #d32f2f; font-size: 0.85rem;">Error: ' + message.errorMessage + '</div>' : ''}
                \`;

                container.appendChild(card);
            });
        }

        // Filter messages
        function filterMessages() {
            const directionFilter = document.getElementById('directionFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const searchPhone = document.getElementById('searchPhone').value.toLowerCase();

            let filtered = allMessages;

            if (directionFilter !== 'all') {
                filtered = filtered.filter(m => m.direction === directionFilter);
            }

            if (statusFilter !== 'all') {
                filtered = filtered.filter(m => m.status === statusFilter);
            }

            if (searchPhone) {
                filtered = filtered.filter(m =>
                    m.from.toLowerCase().includes(searchPhone) ||
                    m.to.toLowerCase().includes(searchPhone)
                );
            }

            displayMessages(filtered);
        }

        // Event listeners for filters
        document.getElementById('directionFilter').addEventListener('change', filterMessages);
        document.getElementById('statusFilter').addEventListener('change', filterMessages);
        document.getElementById('searchPhone').addEventListener('input', filterMessages);

        // Load message history on page load
        fetchMessageHistory();
    </script>
</body>
</html>
    `);
}
