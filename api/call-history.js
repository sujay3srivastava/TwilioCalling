export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Call History</title>
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

        .table-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: #667eea;
            color: white;
        }

        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }

        tr:hover {
            background-color: #f8f9ff;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .badge-incoming {
            background-color: #e3f2fd;
            color: #1976d2;
        }

        .badge-outgoing {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }

        .badge-completed {
            background-color: #e8f5e9;
            color: #388e3c;
        }

        .badge-failed {
            background-color: #ffebee;
            color: #d32f2f;
        }

        .badge-busy {
            background-color: #fff3e0;
            color: #f57c00;
        }

        .badge-no-answer {
            background-color: #fce4ec;
            color: #c2185b;
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

        .phone {
            font-family: 'Courier New', monospace;
            font-weight: 600;
        }

        .duration {
            color: #666;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 1.8rem;
            }

            table {
                font-size: 0.85rem;
            }

            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Call History</h1>

        <div class="stats" id="stats">
            <div class="stat-card">
                <h3>Total Calls</h3>
                <div class="value" id="totalCalls">-</div>
            </div>
            <div class="stat-card">
                <h3>Incoming</h3>
                <div class="value" id="incomingCalls">-</div>
            </div>
            <div class="stat-card">
                <h3>Outgoing</h3>
                <div class="value" id="outgoingCalls">-</div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="value" id="completedCalls">-</div>
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
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="busy">Busy</option>
                <option value="no-answer">No Answer</option>
            </select>

            <label for="searchPhone">Search Phone:</label>
            <input type="text" id="searchPhone" placeholder="+1234567890">
        </div>

        <div class="table-container">
            <div id="loading" class="loading">Loading call history...</div>
            <div id="error" class="error" style="display: none;"></div>
            <div id="noData" class="no-data" style="display: none;">No calls found</div>
            <table id="callTable" style="display: none;">
                <thead>
                    <tr>
                        <th>Direction</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Date & Time</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="callTableBody">
                </tbody>
            </table>
        </div>
    </div>

    <script>
        let allCalls = [];

        // Fetch call history
        async function fetchCallHistory() {
            try {
                const response = await fetch('/api/api/call-history');
                const data = await response.json();

                if (data.success) {
                    allCalls = data.calls;
                    updateStats(allCalls);
                    displayCalls(allCalls);
                    document.getElementById('loading').style.display = 'none';
                } else {
                    throw new Error(data.message || 'Failed to fetch call history');
                }
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').textContent = 'Error: ' + error.message;
            }
        }

        // Update statistics
        function updateStats(calls) {
            const total = calls.length;
            const incoming = calls.filter(c => c.direction === 'inbound').length;
            const outgoing = calls.filter(c => c.direction === 'outbound-api' || c.direction === 'outbound-dial').length;
            const completed = calls.filter(c => c.status === 'completed').length;

            document.getElementById('totalCalls').textContent = total;
            document.getElementById('incomingCalls').textContent = incoming;
            document.getElementById('outgoingCalls').textContent = outgoing;
            document.getElementById('completedCalls').textContent = completed;
        }

        // Display calls in table
        function displayCalls(calls) {
            const tbody = document.getElementById('callTableBody');
            tbody.innerHTML = '';

            if (calls.length === 0) {
                document.getElementById('callTable').style.display = 'none';
                document.getElementById('noData').style.display = 'block';
                return;
            }

            document.getElementById('callTable').style.display = 'table';
            document.getElementById('noData').style.display = 'none';

            calls.forEach(call => {
                const row = document.createElement('tr');

                const directionBadge = call.direction === 'inbound' ?
                    '<span class="badge badge-incoming">Incoming</span>' :
                    '<span class="badge badge-outgoing">Outgoing</span>';

                let statusBadge = '';
                if (call.status === 'completed') {
                    statusBadge = '<span class="badge badge-completed">Completed</span>';
                } else if (call.status === 'failed') {
                    statusBadge = '<span class="badge badge-failed">Failed</span>';
                } else if (call.status === 'busy') {
                    statusBadge = '<span class="badge badge-busy">Busy</span>';
                } else if (call.status === 'no-answer') {
                    statusBadge = '<span class="badge badge-no-answer">No Answer</span>';
                } else {
                    statusBadge = '<span class="badge">' + call.status + '</span>';
                }

                const startTime = call.startTime ? new Date(call.startTime) : null;
                const dateStr = startTime ? startTime.toLocaleString() : 'N/A';

                const duration = call.duration ? formatDuration(call.duration) : '0s';

                row.innerHTML = \`
                    <td>\${directionBadge}</td>
                    <td class="phone">\${call.from}</td>
                    <td class="phone">\${call.to}</td>
                    <td>\${dateStr}</td>
                    <td class="duration">\${duration}</td>
                    <td>\${statusBadge}</td>
                \`;

                tbody.appendChild(row);
            });
        }

        // Format duration in seconds to readable format
        function formatDuration(seconds) {
            if (!seconds || seconds === '0') return '0s';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (mins > 0) {
                return \`\${mins}m \${secs}s\`;
            }
            return \`\${secs}s\`;
        }

        // Filter calls
        function filterCalls() {
            const directionFilter = document.getElementById('directionFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const searchPhone = document.getElementById('searchPhone').value.toLowerCase();

            let filtered = allCalls;

            if (directionFilter !== 'all') {
                filtered = filtered.filter(c => c.direction === directionFilter);
            }

            if (statusFilter !== 'all') {
                filtered = filtered.filter(c => c.status === statusFilter);
            }

            if (searchPhone) {
                filtered = filtered.filter(c =>
                    c.from.toLowerCase().includes(searchPhone) ||
                    c.to.toLowerCase().includes(searchPhone)
                );
            }

            displayCalls(filtered);
        }

        // Event listeners for filters
        document.getElementById('directionFilter').addEventListener('change', filterCalls);
        document.getElementById('statusFilter').addEventListener('change', filterCalls);
        document.getElementById('searchPhone').addEventListener('input', filterCalls);

        // Load call history on page load
        fetchCallHistory();
    </script>
</body>
</html>
    `);
}
