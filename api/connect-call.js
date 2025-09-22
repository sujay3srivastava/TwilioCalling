const twilio = require('twilio');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const { from, to } = req.body;

        if (!from || !to) {
            return res.status(400).json({
                error: 'Both "from" and "to" phone numbers are required'
            });
        }

        // Create TwiML that will dial the second number when first person answers (silent)
        const twiml = `<Response>
            <Dial timeout="30" callerId="${process.env.TWILIO_PHONE_NUMBER}">${to}</Dial>
        </Response>`;

        // Make the initial call to the "from" number
        const call = await client.calls.create({
            twiml: twiml,
            to: from,  // Call the "from" number first
            from: process.env.TWILIO_PHONE_NUMBER
        });

        console.log(`Two-way call initiated: ${from} → ${to}`);
        console.log(`Call SID: ${call.sid}`);

        res.status(200).json({
            success: true,
            callSid: call.sid,
            firstNumber: from,
            secondNumber: to,
            twilioNumber: process.env.TWILIO_PHONE_NUMBER,
            status: call.status,
            message: 'Two-way call initiated successfully'
        });

    } catch (error) {
        console.error('Error making two-way call:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}