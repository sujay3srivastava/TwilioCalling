const twilio = require('twilio');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const { to, message = "Hello! This is a call from your Twilio application." } = req.body;

        if (!to) {
            return res.status(400).json({ error: 'Phone number (to) is required' });
        }

        // Make the call
        const call = await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        console.log(`Outgoing call initiated to ${to}`);
        console.log(`Call SID: ${call.sid}`);

        res.status(200).json({
            success: true,
            callSid: call.sid,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to,
            status: call.status,
            message: 'Call initiated successfully'
        });

    } catch (error) {
        console.error('Error making call:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}