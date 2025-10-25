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

        // Fetch messages from Twilio (default limit is 50, can be changed)
        const messages = await client.messages.list({ limit: 100 });

        // Format the message data
        const messageHistory = messages.map(message => ({
            sid: message.sid,
            direction: message.direction, // 'inbound' or 'outbound-api'
            from: message.from,
            to: message.to,
            body: message.body,
            status: message.status,
            dateSent: message.dateSent,
            dateCreated: message.dateCreated,
            numMedia: message.numMedia,
            numSegments: message.numSegments,
            price: message.price,
            priceUnit: message.priceUnit,
            errorCode: message.errorCode,
            errorMessage: message.errorMessage
        }));

        res.json({
            success: true,
            count: messageHistory.length,
            messages: messageHistory
        });
    } catch (error) {
        console.error('Error fetching message history:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch message history',
            message: error.message
        });
    }
}
