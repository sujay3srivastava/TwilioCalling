export default function handler(req, res) {
    res.status(200).json({
        message: 'Twilio Webhook Server is running on Vercel!',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /api/webhook/incoming-call': 'Handle incoming calls',
            'POST /api/webhook/handle-input': 'Handle user menu input',
            'POST /api/webhook/handle-recording': 'Handle completed recordings',
            'POST /api/webhook/call-status': 'Handle call status updates'
        }
    });
}