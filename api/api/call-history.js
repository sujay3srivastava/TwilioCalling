const twilio = require('twilio');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Fetch calls from Twilio (default limit is 50, can be changed)
        const calls = await client.calls.list({ limit: 100 });

        // Format the call data
        const callHistory = calls.map(call => ({
            sid: call.sid,
            direction: call.direction, // 'inbound' or 'outbound-api'
            from: call.from,
            to: call.to,
            status: call.status,
            startTime: call.startTime,
            endTime: call.endTime,
            duration: call.duration,
            price: call.price,
            priceUnit: call.priceUnit
        }));

        res.json({
            success: true,
            count: callHistory.length,
            calls: callHistory
        });
    } catch (error) {
        console.error('Error fetching call history:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch call history',
            message: error.message
        });
    }
}
