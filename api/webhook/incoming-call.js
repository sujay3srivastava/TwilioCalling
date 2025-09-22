const twilio = require('twilio');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Incoming call received!');
    console.log('Call details:', {
        from: req.body.From,
        to: req.body.To,
        callSid: req.body.CallSid,
        direction: req.body.Direction,
        callerName: req.body.CallerName || 'Unknown'
    });

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // Directly redirect all incoming calls to +91 9833230099
    twiml.dial({
        timeout: 30,
        callerId: req.body.To // Use your Twilio number as caller ID
    }, '+919833230099');

    // If the call fails to connect
    twiml.say('Sorry, we are unable to connect your call at this time. Please try again later.');
    twiml.hangup();

    // Send TwiML response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}