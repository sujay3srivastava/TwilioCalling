const twilio = require('twilio');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const digit = req.body.Digits;
    console.log('User pressed:', digit);

    const twiml = new twilio.twiml.VoiceResponse();

    switch (digit) {
        case '1':
            // Voicemail option
            twiml.say('Please leave your message after the beep. Press any key when finished.');
            twiml.record({
                action: '/api/webhook/handle-recording',
                timeout: 30,
                maxLength: 120,
                finishOnKey: '#'
            });
            break;

        case '2':
            // Connect to support
            twiml.say('Connecting you to support. Please hold.');
            twiml.dial({
                timeout: 30,
                callerId: req.body.To
            }, '+919833230099');
            twiml.say('Support is not available right now. Please try again later.');
            break;

        case '3':
            // Business hours
            twiml.say('Our business hours are Monday through Friday, 9 AM to 6 PM, Indian Standard Time. Thank you for calling!');
            break;

        case '0':
            // Repeat menu
            twiml.redirect('/api/webhook/incoming-call');
            break;

        default:
            twiml.say('Invalid option. Please try again.');
            twiml.redirect('/api/webhook/incoming-call');
            break;
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}