const twilio = require('twilio');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Recording completed:', {
        recordingUrl: req.body.RecordingUrl,
        recordingDuration: req.body.RecordingDuration,
        from: req.body.From
    });

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your message. We will get back to you soon. Goodbye!');
    twiml.hangup();

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}