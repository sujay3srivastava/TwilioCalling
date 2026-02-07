const twilio = require('twilio');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract action from URL path (incoming-call, incoming-message, or call-status)
    const action = req.query.action;

    // Route to appropriate handler
    switch (action) {
        case 'incoming-call':
            return handleIncomingCall(req, res);
        case 'incoming-message':
            return handleIncomingMessage(req, res);
        case 'call-status':
            return handleCallStatus(req, res);
        default:
            return res.status(404).json({ error: 'Unknown webhook action' });
    }
}

// Handle incoming voice calls
function handleIncomingCall(req, res) {
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

    // Directly redirect all incoming calls to +91 9765454491
    twiml.dial({
        timeout: 30,
        callerId: req.body.To // Use your Twilio number as caller ID
    }, '+919765454491');

    // Send TwiML response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}

// Handle incoming SMS messages
function handleIncomingMessage(req, res) {
    console.log('Incoming message received!');
    console.log('Message details:', {
        from: req.body.From,
        to: req.body.To,
        body: req.body.Body,
        messageSid: req.body.MessageSid,
        numMedia: req.body.NumMedia || '0'
    });

    // Create TwiML response
    const twiml = new twilio.twiml.MessagingResponse();

    // Optional: Send an auto-reply
    // twiml.message('Thank you for your message. We will get back to you soon.');

    // Send TwiML response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}

// Handle call status updates
function handleCallStatus(req, res) {
    console.log('Call status update:', {
        callSid: req.body.CallSid,
        callStatus: req.body.CallStatus,
        from: req.body.From,
        to: req.body.To
    });

    res.status(200).json({ status: 'OK' });
}
