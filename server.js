require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded data from Twilio
app.use(express.urlencoded({ extended: false }));

// Twilio webhook signature validation middleware (optional but recommended)
const webhookSignature = twilio.webhook.validateExpressRequest;

/**
 * Webhook endpoint for handling incoming calls
 * Twilio will POST to this endpoint when someone calls your number
 */
app.post('/webhook/incoming-call', (req, res) => {
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
    
    // If the call fails to connect
    twiml.say('Sorry, we are unable to connect your call at this time. Please try again later.');
    twiml.hangup();
    
    // Send TwiML response
    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * Handle user input from the main menu
 */
app.post('/webhook/handle-input', (req, res) => {
    const digit = req.body.Digits;
    console.log('User pressed:', digit);
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    switch (digit) {
        case '1':
            // Voicemail option
            twiml.say('Please leave your message after the beep. Press any key when finished.');
            twiml.record({
                action: '/webhook/handle-recording',
                timeout: 30,
                maxLength: 120,
                finishOnKey: '#'
            });
            break;
            
        case '2':
            // Connect to support (you can replace with actual number)
            twiml.say('Connecting you to support. Please hold.');
            twiml.dial({
                timeout: 30,
                callerId: req.body.To // Use your Twilio number as caller ID
            }, '+919765454491'); // Replace with support number
            twiml.say('Support is not available right now. Please try again later.');
            break;
            
        case '3':
            // Business hours
            twiml.say('Our business hours are Monday through Friday, 9 AM to 6 PM, Indian Standard Time. Thank you for calling!');
            break;
            
        case '0':
            // Repeat menu
            twiml.redirect('/webhook/incoming-call');
            break;
            
        default:
            twiml.say('Invalid option. Please try again.');
            twiml.redirect('/webhook/incoming-call');
            break;
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * Handle completed recordings
 */
app.post('/webhook/handle-recording', (req, res) => {
    console.log('Recording completed:', {
        recordingUrl: req.body.RecordingUrl,
        recordingDuration: req.body.RecordingDuration,
        from: req.body.From
    });
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your message. We will get back to you soon. Goodbye!');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * Handle call status updates (optional)
 */
app.post('/webhook/call-status', (req, res) => {
    console.log('Call status update:', {
        callSid: req.body.CallSid,
        callStatus: req.body.CallStatus,
        from: req.body.From,
        to: req.body.To
    });
    
    res.sendStatus(200);
});

/**
 * Simple endpoint to test if server is running
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Twilio Webhook Server is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /webhook/incoming-call': 'Handle incoming calls',
            'POST /webhook/handle-input': 'Handle user menu input',
            'POST /webhook/handle-recording': 'Handle completed recordings',
            'POST /webhook/call-status': 'Handle call status updates'
        }
    });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(port, () => {
    console.log(`Twilio webhook server running on port ${port}`);
    console.log(`Webhook URL: http://localhost:${port}/webhook/incoming-call`);
    console.log('Configure this URL in your Twilio phone number settings');
});

module.exports = app;