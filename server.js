const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DOMAIN = '3mp0r104rm4n1.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'whoami';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zoxxeg-feksyn-8popDe';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// Basic auth middleware
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ error: 'Authentication required' });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

// Create emails.json if it doesn't exist
const emailsFile = path.join(__dirname, 'emails.json');
if (!fs.existsSync(emailsFile)) {
    fs.writeFileSync(emailsFile, JSON.stringify({ emails: [] }, null, 2));
    console.log('Created new emails.json file');
}

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API endpoint to handle email submissions
app.post('/api/subscribe', (req, res) => {
    console.log('Received subscription request:', req.body);
    
    const { email } = req.body;
    
    if (!email) {
        console.log('Error: No email provided');
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Error: Invalid email format:', email);
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Read current emails
        let data;
        try {
            const fileContent = fs.readFileSync(emailsFile, 'utf8');
            data = JSON.parse(fileContent);
            console.log('Current emails count:', data.emails.length);
        } catch (readError) {
            console.error('Error reading emails file:', readError);
            data = { emails: [] };
        }

        // Check if email already exists
        if (data.emails.includes(email)) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add new email
        data.emails.push(email);
        fs.writeFileSync(emailsFile, JSON.stringify(data, null, 2));
        console.log('Successfully added new email:', email);

        res.json({ message: 'Successfully subscribed!' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Admin endpoint to view emails
app.get('/admin/emails', basicAuth, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(emailsFile));
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Black Sails Society - Email List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #0a0a0a;
                        color: #d4af37;
                    }
                    h1 {
                        color: #d4af37;
                        border-bottom: 2px solid #d4af37;
                        padding-bottom: 10px;
                    }
                    .email-list {
                        background: rgba(0,0,0,0.5);
                        border: 1px solid #d4af37;
                        border-radius: 5px;
                        padding: 20px;
                    }
                    .email-item {
                        padding: 10px;
                        border-bottom: 1px solid rgba(212,175,55,0.3);
                    }
                    .email-item:last-child {
                        border-bottom: none;
                    }
                    .stats {
                        margin-bottom: 20px;
                        padding: 15px;
                        background: rgba(212,175,55,0.1);
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>Black Sails Society - Email List</h1>
                <div class="stats">
                    Total Subscribers: ${data.emails.length}
                </div>
                <div class="email-list">
                    ${data.emails.map((email, index) => `
                        <div class="email-item">
                            ${index + 1}. ${email}
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`Server started at: ${new Date().toISOString()}`);
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Server is accessible at http://${DOMAIN}:${PORT}`);
    console.log('Email storage location:', emailsFile);
    console.log('CORS enabled for all origins');
    console.log('=================================');
}); 