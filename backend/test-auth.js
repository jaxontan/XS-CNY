const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    try {
        console.log('--- Testing Registration ---');
        try {
            const regRes = await axios.post(`${API_URL}/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!'
            });
            console.log('Registration Success:', regRes.data);
        } catch (e) {
            console.log('Registration Failed:');
            if (e.response) console.log(e.response.status, e.response.data);
            else console.log(e.message);
        }

        console.log('\n--- Testing Login ---');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                email: 'test@example.com',
                password: 'Password123!'
            });
            console.log('Login Success:', loginRes.data);
        } catch (e) {
            console.log('Login Failed:');
            if (e.response) console.log(e.response.status, e.response.data);
            else console.log(e.message);
        }

        console.log('\n--- Testing Invalid Login (Lockout Check) ---');
        try {
            await axios.post(`${API_URL}/login`, {
                email: 'test@example.com',
                password: 'WrongPassword!'
            });
        } catch (e) {
            console.log('Invalid Login 1:');
            if (e.response) console.log(e.response.status, e.response.data);
            else console.log(e.message);
        }

    } catch (error) {
        console.error('Unexpected Error:', error);
    }
}

async function logError(e, context) {
    if (e.response) {
        console.log(`${context} Failed: Status ${e.response.status}`);
        console.log('Response Data:', JSON.stringify(e.response.data, null, 2));
    } else if (e.request) {
        console.log(`${context} Failed: No response received (Server might be down)`);
    } else {
        console.log(`${context} Failed: ${e.message}`);
    }
}

// Override console.log calls in try-catches above with this helper? 
// No, I will just rewrite the function body in the next steps or just patch the catch blocks.
// actually, let's just replace the whole file content to be cleaner or just the catch blocks. 
// I'll rewrite the catch blocks in the main logic.


// Wait for server to start
setTimeout(testAuth, 3000);
