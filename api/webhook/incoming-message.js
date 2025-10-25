const twilio = require('twilio');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
