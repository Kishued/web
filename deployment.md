# Black Sails Society - Deployment Guide

## Prerequisites
- A VPS with Ubuntu/Debian
- Node.js installed
- PM2 for process management
- Nginx as reverse proxy
- Domain name (optional but recommended)

## Server Setup

1. Install Node.js and npm:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2:
```bash
sudo npm install -g pm2
```

3. Install Nginx:
```bash
sudo apt-get install nginx
```

## Project Deployment

1. Clone the project to your VPS:
```bash
git clone https://github.com/Kishued/web
cd black-sails-society
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
echo "PORT=3000
ADMIN_USERNAME=whoami
ADMIN_PASSWORD=zoxxeg-feksyn-8popDe" > .env
```

4. Start the application with PM2:
```bash
pm2 start server.js --name black-sails
pm2 save
```

## Nginx Configuration

1. Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/black-sails
```

2. Add the following configuration:
```nginx
server {
    listen 80;
    server_name 3mp0r104rm4n1.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/black-sails /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Setup (Optional but Recommended)

1. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Accessing the Email List

1. Once deployed, you can access the email list at:
```
https://3mp0r104rm4n1.com/admin/emails
```

2. Use your admin credentials when prompted:
- Username: (value of ADMIN_USERNAME)
- Password: (value of ADMIN_PASSWORD)

## Security Notes

1. Always change the default admin credentials
2. Use strong passwords
3. Keep your system and packages updated
4. Consider implementing rate limiting
5. Regularly backup your emails.json file

## Monitoring

1. Monitor your application:
```bash
pm2 monit
```

2. View logs:
```bash
pm2 logs black-sails
```

## Backup

Set up a cron job to backup emails.json:
```bash
0 0 * * * cp /path/to/emails.json /path/to/backup/emails-$(date +\%Y\%m\%d).json
``` 