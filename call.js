require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Default numbers
const DEFAULT_TO_NUMBER = '+919765454491';
const YOUR_NUMBER = '+919765454491'; // Replace with your actual number if different
const SECOND_NUMBER = '+919833230099';

/**
 * Make a voice call to a specified number
 * @param {string} toNumber - The phone number to call (format: +1234567890)
 * @param {string} message - The message to speak when call is answered
 */
async function makeCall(toNumber = DEFAULT_TO_NUMBER, message = "Hello! This is a test call from Twilio.") {
    try {
        const call = await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to: toNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        console.log(`Call initiated successfully!`);
        console.log(`Call SID: ${call.sid}`);
        console.log(`From: ${process.env.TWILIO_PHONE_NUMBER}`);
        console.log(`To: ${toNumber}`);
        console.log(`Status: ${call.status}`);
        
        return call;
    } catch (error) {
        console.error('Error making call:', error.message);
        throw error;
    }
}

/**
 * Make an interactive call that can handle user input
 * @param {string} toNumber - The phone number to call
 * @param {string} webhookUrl - URL for handling call interactions (optional)
 */
async function makeInteractiveCall(toNumber = DEFAULT_TO_NUMBER, webhookUrl = null) {
    try {
        let twiml;
        
        if (webhookUrl) {
            // Use webhook for dynamic responses
            twiml = `<Response><Say>Hello! Please hold while we connect you.</Say><Redirect>${webhookUrl}</Redirect></Response>`;
        } else {
            // Simple interactive menu
            twiml = `<Response>
                <Say>Hello! Welcome to our service.</Say>
                <Gather input="dtmf" timeout="10" numDigits="1">
                    <Say>Press 1 to hear a message, press 2 to end the call, or press 0 to repeat this menu.</Say>
                </Gather>
                <Say>We didn't receive any input. Goodbye!</Say>
            </Response>`;
        }
        
        const call = await client.calls.create({
            twiml: twiml,
            to: toNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        console.log(`Interactive call initiated!`);
        console.log(`Call SID: ${call.sid}`);
        console.log(`From: ${process.env.TWILIO_PHONE_NUMBER}`);
        console.log(`To: ${toNumber}`);
        
        return call;
    } catch (error) {
        console.error('Error making interactive call:', error.message);
        throw error;
    }
}

/**
 * Create a two-way call that connects two numbers together
 * @param {string} number1 - First number to connect
 * @param {string} number2 - Second number to connect
 */
async function makeTwoWayCall(number1 = YOUR_NUMBER, number2) {
    if (!number2) {
        throw new Error('Second number is required for two-way calls');
    }
    
    try {
        console.log(`Initiating two-way call between ${number1} and ${number2}...`);
        
        // First, call number1 and when they answer, connect them to number2
        const call1 = await client.calls.create({
            twiml: `<Response>
                <Say>Please wait while we connect your call.</Say>
                <Dial timeout="30" callerId="${process.env.TWILIO_PHONE_NUMBER}">
                    <Number>${number2}</Number>
                </Dial>
                <Say>The call could not be completed. Goodbye.</Say>
            </Response>`,
            to: number1,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        console.log(`Two-way call initiated successfully!`);
        console.log(`Call SID: ${call1.sid}`);
        console.log(`Calling ${number1} first...`);
        console.log(`When ${number1} answers, connecting to ${number2}...`);
        console.log(`Status: ${call1.status}`);
        
        return call1;
    } catch (error) {
        console.error('Error making two-way call:', error.message);
        throw error;
    }
}

/**
 * Create a conference call between multiple numbers
 * @param {string[]} numbers - Array of phone numbers to add to conference
 * @param {string} conferenceName - Name of the conference room
 */
async function makeConferenceCall(numbers, conferenceName = 'MyConference') {
    if (!numbers || numbers.length < 2) {
        throw new Error('At least 2 numbers are required for a conference call');
    }
    
    try {
        console.log(`Creating conference call with ${numbers.length} participants...`);
        
        const calls = [];
        
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            
            const call = await client.calls.create({
                twiml: `<Response>
                    <Say>Welcome to the conference call. Please wait while other participants join.</Say>
                    <Dial>
                        <Conference startConferenceOnEnter="${i === 0}" endConferenceOnExit="${i === 0}">
                            ${conferenceName}
                        </Conference>
                    </Dial>
                </Response>`,
                to: number,
                from: process.env.TWILIO_PHONE_NUMBER
            });
            
            calls.push({
                number: number,
                callSid: call.sid,
                status: call.status
            });
            
            console.log(`Called ${number} - SID: ${call.sid}`);
            
            // Small delay between calls
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`Conference call "${conferenceName}" initiated successfully!`);
        console.log('All participants:');
        calls.forEach(call => {
            console.log(`  ${call.number} - ${call.callSid} - ${call.status}`);
        });
        
        return calls;
    } catch (error) {
        console.error('Error making conference call:', error.message);
        throw error;
    }
}

/**
 * Check the status of a call
 * @param {string} callSid - The SID of the call to check
 */
async function checkCallStatus(callSid) {
    try {
        const call = await client.calls(callSid).fetch();
        console.log(`Call Status: ${call.status}`);
        console.log(`Duration: ${call.duration} seconds`);
        console.log(`Direction: ${call.direction}`);
        return call;
    } catch (error) {
        console.error('Error checking call status:', error.message);
        throw error;
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // No arguments provided, make call to default number with default message
        await makeCall();
        return;
    }
    
    const [command, ...rest] = args;
    
    try {
        if (command === 'interactive') {
            const [phoneNumber] = rest;
            await makeInteractiveCall(phoneNumber);
        } else if (command === 'connect' || command === 'two-way') {
            const [number1, number2] = rest;
            if (!number2) {
                console.error('Two-way calls require two phone numbers: node call.js connect +1234567890 +0987654321');
                return;
            }
            await makeTwoWayCall(number1, number2);
        } else if (command === 'conference') {
            const numbers = rest.filter(arg => arg.startsWith('+'));
            if (numbers.length < 2) {
                console.error('Conference calls require at least 2 phone numbers: node call.js conference +1234567890 +0987654321 [+more...]');
                return;
            }
            await makeConferenceCall(numbers);
        } else if (command === 'status') {
            const [callSid] = rest;
            if (!callSid) {
                console.error('Please provide a call SID to check status');
                return;
            }
            await checkCallStatus(callSid);
        } else {
            // Check if first argument is a phone number (starts with +) or a message
            if (command.startsWith('+')) {
                // First argument is a phone number
                const phoneNumber = command;
                const message = rest.join(' ') || undefined;
                await makeCall(phoneNumber, message);
            } else {
                // First argument is a message, use default number
                const message = [command, ...rest].join(' ');
                await makeCall(DEFAULT_TO_NUMBER, message);
            }
        }
    } catch (error) {
        console.error('Operation failed:', error.message);
        process.exit(1);
    }
}

// Export functions for use as module
module.exports = {
    makeCall,
    makeInteractiveCall,
    makeTwoWayCall,
    makeConferenceCall,
    checkCallStatus
};

// Run main function if called directly
if (require.main === module) {
    main();
}