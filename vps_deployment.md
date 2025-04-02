# VPS Deployment Guide for Black Sails Society

## Server Setup (172.86.66.8)

1. **Connect to your VPS**:
```bash
ssh user@172.86.66.8
```

2. **Install Node.js and npm**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 for process management**:
```bash
sudo npm install -g pm2
```

4. **Create project directory**:
```bash
mkdir -p /var/www/blacksails
cd /var/www/blacksails
```

5. **Upload files to VPS**:
Using FileZilla or SCP, upload these files to `/var/www/blacksails/`:
- server.js
- index.html
- styles.css
- package.json

6. **Install dependencies**:
```bash
cd /var/www/blacksails
npm install
```

7. **Set up environment variables**:
```bash
echo "PORT=3001
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password" > .env
```

8. **Start the server with PM2**:
```bash
pm2 start server.js --name blacksails
pm2 save
```

## Firewall Setup

1. **Allow port 3001**:
```bash
sudo ufw allow 3001/tcp
sudo ufw enable
```

## Testing

1. Test the server status:
```
http://172.86.66.8:3001/api/test
```

2. Test the admin panel:
```
http://172.86.66.8:3001/admin/emails
```

## Monitoring

1. **View logs**:
```bash
pm2 logs blacksails
```

2. **Monitor server**:
```bash
pm2 monit
```

## Security Notes

1. Change default admin credentials in `.env`
2. Consider setting up Nginx as a reverse proxy
3. Set up SSL/TLS certificate
4. Implement rate limiting
5. Regular backup of emails.json

## Backup

Set up automatic backups:
```bash
# Add to crontab
0 0 * * * cp /var/www/blacksails/emails.json /backup/emails-$(date +\%Y\%m\%d).json
```

## Troubleshooting

1. **Check server status**:
```bash
pm2 status
```

2. **Check logs for errors**:
```bash
pm2 logs blacksails --lines 100
```

3. **Test port availability**:
```bash
sudo netstat -tulpn | grep 3001
```

4. **Restart server**:
```bash
pm2 restart blacksails
```

5. **Check firewall status**:
```bash
sudo ufw status
``` 