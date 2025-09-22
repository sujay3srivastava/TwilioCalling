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