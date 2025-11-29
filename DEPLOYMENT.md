# TripConnect - Deployment Guide

## Local Development

### Prerequisites
- Node.js v16+
- npm or yarn
- Git

### Setup
```bash
cd d:\SIH
npm install
npm run dev
```

Access at `http://localhost:5173`

---

## Production Deployment

### Frontend Deployment (Vercel / Netlify)

#### Option 1: Vercel (Recommended)

1. **Build the frontend**
```bash
cd frontend/frontend
npm run build
```

2. **Push to GitHub**
```bash
git add .
git commit -m "Production build"
git push origin main
```

3. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend/frontend` as root directory
   - Deploy

4. **Environment Variables**
   - Add `VITE_API_URL=https://your-backend-url.com`

#### Option 2: Netlify

1. **Build**
```bash
cd frontend/frontend
npm run build
```

2. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Configure**
   - Set build command: `npm run build`
   - Set publish directory: `dist`

---

### Backend Deployment

#### Option 1: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your_strong_secret_key
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git push heroku main
```

#### Option 2: Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize project**
```bash
cd backend
railway init
```

3. **Set environment variables**
```bash
railway variables set JWT_SECRET=your_strong_secret_key
railway variables set NODE_ENV=production
```

4. **Deploy**
```bash
railway up
```

#### Option 3: AWS EC2

1. **Launch EC2 instance**
   - Ubuntu 20.04 LTS
   - t2.micro or larger
   - Security group: Allow ports 80, 443, 5000

2. **SSH into instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install dependencies**
```bash
sudo apt update
sudo apt install nodejs npm git
```

4. **Clone repository**
```bash
git clone https://github.com/your-repo/SIH.git
cd SIH/backend
npm install
```

5. **Set environment variables**
```bash
nano .env
# Set JWT_SECRET and other variables
```

6. **Install PM2 (process manager)**
```bash
sudo npm install -g pm2
pm2 start server.js --name "tripconnect-api"
pm2 startup
pm2 save
```

7. **Set up Nginx reverse proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Enable SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Migration (SQLite → PostgreSQL)

### Step 1: Export data from SQLite
```bash
sqlite3 tripconnect.db ".dump" > backup.sql
```

### Step 2: Create PostgreSQL database
```bash
createdb tripconnect
psql tripconnect < backup.sql
```

### Step 3: Update connection in backend
```javascript
// Change from sqlite3 to pg
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
```

### Step 4: Update queries
- Replace SQLite syntax with PostgreSQL
- Update parameter placeholders ($1, $2 instead of ?)

---

## Environment Variables for Production

### Backend (.env)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your_very_strong_secret_key_min_32_chars
DATABASE_URL=postgresql://user:password@host:5432/tripconnect
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=TripConnect
```

---

## CI/CD Pipeline Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend/frontend && npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build frontend
        run: cd frontend/frontend && npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

---

## Monitoring & Logging

### Application Monitoring

1. **Sentry** (Error tracking)
```bash
npm install @sentry/node
```

2. **LogRocket** (Session replay)
```bash
npm install logrocket
```

3. **New Relic** (Performance monitoring)
```bash
npm install newrelic
```

### Log Aggregation

1. **CloudWatch** (AWS)
2. **Datadog** (Multi-cloud)
3. **ELK Stack** (Self-hosted)

---

## Performance Optimization

### Frontend
- Enable gzip compression
- Minify CSS/JS
- Optimize images
- Use CDN for static assets
- Implement service workers

### Backend
- Add Redis caching
- Implement database indexing
- Use connection pooling
- Enable query optimization
- Add rate limiting

### Database
- Create indexes on frequently queried columns
- Partition large tables
- Archive old data
- Regular backups

---

## Security Checklist

- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Set CORS to specific domains
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Set up automated backups
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Enable 2FA for admin accounts

---

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/tripconnect"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump tripconnect > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz s3://your-bucket/backups/
```

### Recovery

```bash
# Restore from backup
gunzip db_backup.sql.gz
psql tripconnect < db_backup.sql
```

---

## Scaling Strategy

### Horizontal Scaling
1. Load balancer (nginx, HAProxy)
2. Multiple backend instances
3. Shared database
4. Session store (Redis)

### Vertical Scaling
1. Upgrade server resources
2. Optimize code
3. Add caching layer
4. Database optimization

### Database Scaling
1. Read replicas
2. Sharding
3. Connection pooling
4. Query optimization

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs tripconnect-api

# Check port
lsof -i :5000

# Check environment variables
echo $JWT_SECRET
```

### High memory usage
```bash
# Check memory
free -h

# Profile with clinic.js
npm install -g clinic
clinic doctor -- node server.js
```

### Database connection issues
```bash
# Test connection
psql -U user -d tripconnect -h localhost

# Check connection string
echo $DATABASE_URL
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
openssl s_client -connect your-domain.com:443
```

---

## Post-Deployment

1. **Verify deployment**
   - Test all endpoints
   - Check frontend loads
   - Verify database connectivity

2. **Monitor**
   - Set up alerts
   - Monitor error rates
   - Track performance metrics

3. **Backup**
   - Enable automated backups
   - Test recovery procedure
   - Document backup location

4. **Documentation**
   - Document deployment process
   - Create runbooks
   - Document emergency procedures

---

## Rollback Procedure

### If deployment fails:

```bash
# Heroku
heroku releases
heroku rollback v123

# GitHub
git revert <commit-hash>
git push origin main

# Manual
git checkout <previous-tag>
npm run build
# Redeploy
```

---

## Support & Maintenance

- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security audit quarterly
- Disaster recovery drill annually

---

**Deployment Complete! 🚀**
