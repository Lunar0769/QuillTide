# QuillTide Deployment Guide

This guide covers deploying QuillTide to various platforms for production use.

## 🚀 Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)

1. **Prepare for deployment:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow the prompts
   - Set environment variables in Vercel dashboard

3. **Environment Variables (Vercel):**
   ```env
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_APP_NAME=QuillTide
   ```

#### Backend Deployment (Railway)

1. **Prepare backend:**
   - Create `railway.json` in server folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health"
     }
   }
   ```

2. **Deploy to Railway:**
   - Install Railway CLI: `npm i -g @railway/cli`
   - Run: `railway login`
   - Run: `railway init`
   - Run: `railway up`

3. **Environment Variables (Railway):**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/QuillTide
   JWT_SECRET=your_production_jwt_secret_very_long_and_secure
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

### Option 2: Netlify (Frontend) + Heroku (Backend)

#### Frontend Deployment (Netlify)

1. **Build the app:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop `build` folder to Netlify
   - Or connect GitHub repository
   - Set environment variables in Netlify dashboard

#### Backend Deployment (Heroku)

1. **Prepare for Heroku:**
   - Create `Procfile` in server folder:
   ```
   web: npm start
   ```

2. **Deploy to Heroku:**
   ```bash
   cd server
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # Add other environment variables
   git push heroku main
   ```

### Option 3: DigitalOcean Droplet (Full Stack)

1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - At least 1GB RAM

2. **Setup server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy application:**
   ```bash
   # Clone repository
   git clone your-repository-url
   cd QuillTide
   
   # Install dependencies
   npm run install-all
   
   # Build frontend
   cd client && npm run build
   
   # Setup environment
   cd ../server
   cp .env.example .env
   # Edit .env with production values
   
   # Start with PM2
   pm2 start server.js --name "quilltide-api"
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx:**
   ```nginx
   # /etc/nginx/sites-available/quilltide
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/QuillTide/client/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create cluster:**
   - Go to https://cloud.mongodb.com/
   - Create new project and cluster
   - Choose free tier (M0)

2. **Setup database:**
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for all)
   - Get connection string

3. **Connection string format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/QuillTide?retryWrites=true&w=majority
   ```

## 🔐 Security Considerations

### Environment Variables
- Use strong, unique JWT secrets (64+ characters)
- Never commit `.env` files to version control
- Use different secrets for development and production

### CORS Configuration
```javascript
// server/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

### Rate Limiting
```javascript
// Increase rate limits for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // requests per windowMs
});
```

## 📊 Monitoring & Analytics

### Health Checks
- Backend: `GET /api/health`
- Database: Monitor connection status
- Frontend: Check build and deployment status

### Logging
```javascript
// Add to server.js
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

### Performance Monitoring
- Use services like New Relic, DataDog, or Sentry
- Monitor API response times
- Track error rates and user engagement

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

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
      run: npm run install-all
      
    - name: Build frontend
      run: cd client && npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check frontend URL in backend CORS config
   - Verify API URL in frontend environment

2. **Database Connection:**
   - Ensure MongoDB Atlas IP whitelist includes your server
   - Check connection string format and credentials

3. **Build Failures:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for environment-specific code

4. **Performance Issues:**
   - Enable gzip compression
   - Implement caching strategies
   - Optimize database queries with indexes

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers (Nginx, AWS ALB)
- Implement session storage (Redis)
- Consider microservices architecture

### Database Optimization
- Add database indexes for frequently queried fields
- Implement connection pooling
- Consider read replicas for heavy read workloads

### CDN Integration
- Use Cloudflare or AWS CloudFront
- Serve static assets from CDN
- Implement image optimization

## 🔧 Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor security vulnerabilities
- Backup database regularly
- Review and rotate API keys

### Monitoring Checklist
- [ ] Server uptime and response times
- [ ] Database performance and storage
- [ ] Error rates and user feedback
- [ ] Security logs and access patterns

Happy deploying! 🚀