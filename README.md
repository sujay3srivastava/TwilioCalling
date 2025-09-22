# Twilio Calling Application

A Node.js application for making voice calls using Twilio API, supporting various call types including simple calls, interactive calls, two-way calls, and conference calls.

## Prerequisites

1. **Twilio Account**: Sign up at [Twilio](https://www.twilio.com)
2. **Node.js**: Ensure Node.js is installed
3. **Dependencies**: Install required packages
   ```bash
   npm install twilio dotenv
   ```

## Setup

1. Create a `.env` file in the project root with your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

2. Replace the default phone numbers in `call.js` with your actual numbers if needed.

## Usage

### Basic call to default number:
```bash
node call.js
```

### Call with custom phone number:
```bash
node call.js +919765454491
```

### Call with custom number and message:
```bash
node call.js +919765454491 "Hello, this is a custom message"
```

### Interactive call (with menu options):
```bash
node call.js interactive +919765454491
```

### Two-way call (connect two numbers):
```bash
node call.js connect +919765454491 +919833230099
```

### Conference call (multiple participants):
```bash
node call.js conference +919765454491 +919833230099 +1234567890
```

### Check call status:
```bash
node call.js status CALL_SID_HERE
```

## Features

- **Simple Voice Calls**: Make basic calls with custom messages
- **Interactive Calls**: Create calls with DTMF input handling
- **Two-Way Calls**: Connect two phone numbers together
- **Conference Calls**: Create multi-participant conference calls
- **Call Status Checking**: Monitor call status and duration

## Functions Available

- `makeCall(phoneNumber, message)` - Make a simple voice call
- `makeInteractiveCall(phoneNumber, webhookUrl)` - Create interactive call with menu
- `makeTwoWayCall(number1, number2)` - Connect two numbers
- `makeConferenceCall(numbers, conferenceName)` - Create conference with multiple participants
- `checkCallStatus(callSid)` - Check status of existing call

## Phone Number Format

All phone numbers should be in E.164 format (e.g., `+919765454491`)

## Deployment

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the webhook server:
   ```bash
   npm run server
   ```

3. Use ngrok to expose local server:
   ```bash
   ngrok http 8000
   ```

### Vercel Deployment

This application is configured for deployment on Vercel with serverless functions.

1. **Deploy to Vercel:**
   - Import this GitHub repository to Vercel
   - Vercel will automatically detect the Node.js project

2. **Environment Variables:**
   Set these in your Vercel dashboard:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. **Configure Twilio Webhook:**
   - Go to your Twilio Console → Phone Numbers
   - Set webhook URL for incoming calls to:
   ```
   https://your-project.vercel.app/api/webhook/incoming-call
   ```

### API Endpoints (Vercel)

- `POST /api/webhook/incoming-call` - Handle incoming calls
- `POST /api/webhook/handle-input` - Handle user menu input
- `POST /api/webhook/handle-recording` - Handle voicemail recordings
- `POST /api/webhook/call-status` - Handle call status updates
- `GET /api/` - Server status

## Project Structure

```
├── api/                          # Vercel serverless functions
│   ├── index.js                 # Status endpoint
│   └── webhook/
│       ├── incoming-call.js     # Handle incoming calls
│       ├── handle-input.js      # Handle user input
│       ├── handle-recording.js  # Handle recordings
│       └── call-status.js       # Handle call status
├── call.js                      # Main calling script
├── server.js                    # Express server (for local dev)
├── vercel.json                  # Vercel configuration
└── package.json                 # Dependencies
```