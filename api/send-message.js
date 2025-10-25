const twilio = require('twilio');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, body, from } = req.body;

        // Validate input
        if (!to || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to and body are required'
            });
        }

        // Initialize Twilio client
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Use provided 'from' number or default to Twilio number from env
        const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;

        if (!fromNumber) {
            return res.status(400).json({
                success: false,
                error: 'No from number specified and TWILIO_PHONE_NUMBER not configured'
            });
        }

        // Send the message
        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to
        });

        console.log('Message sent successfully:', {
            sid: message.sid,
            from: message.from,
            to: message.to,
            status: message.status
        });

        res.json({
            success: true,
            messageSid: message.sid,
            from: message.from,
            to: message.to,
            body: message.body,
            status: message.status,
            dateCreated: message.dateCreated
        });

    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send message',
            message: error.message
        });
    }
}
