const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'blacksails2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Basic auth middleware
const basicAuth = (req, res, next) => {
    // Get auth header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Parse auth header
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // Check credentials
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
    fs.writeFileSync(emailsFile, JSON.stringify({ emails: [] }));
}

// Admin endpoint to view emails
app.get('/admin/emails', basicAuth, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(emailsFile));
        
        // Format the response as HTML for better viewing
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

// API endpoint to handle email submissions
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const data = JSON.parse(fs.readFileSync(emailsFile));
        
        // Check if email already exists
        if (data.emails.includes(email)) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add new email
        data.emails.push(email);
        fs.writeFileSync(emailsFile, JSON.stringify(data, null, 2));

        res.json({ message: 'Successfully subscribed!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 