# TripConnect - Quick Start Guide

## 🚀 Start the Application (5 minutes)

### Step 1: Open Terminal in SIH Directory
```bash
cd d:\SIH
```

### Step 2: Start Both Backend & Frontend
```bash
npm run dev
```

This will automatically start:
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

## 🔐 Login with Test Accounts

### Traveler
- Email: `traveler@example.com`
- Password: `password123`

### Agent
- Email: `agent@example.com`
- Password: `password123`

### Researcher
- Email: `researcher@example.com`
- Password: `password123`

## ✨ What You Can Do

### As a Traveler
1. ✈️ Create new trips
2. 📄 Upload trip documents
3. 💰 Track expenses
4. 🔍 Discover local agents
5. 💬 Connect with agents

### As an Agent
1. 📢 Create promotions
2. 🎯 Target specific destinations
3. 💬 Message travelers
4. 📊 View engagement metrics
5. 🏆 Build your profile

### As a Researcher
1. 📈 View traveler statistics
2. 🗺️ Analyze destination trends
3. 💵 Study expense patterns
4. 👥 Review agent performance
5. 📊 Generate insights

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Check if port 5000 is in use
# Kill the process or change PORT in .env
```

### Frontend not loading?
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Hard refresh (Ctrl+Shift+R)
```

### Database issues?
```bash
# Delete the database file to reset
rm backend/database/tripconnect.db

# Restart backend - it will recreate the database
```

## 📁 Project Structure

```
SIH/
├── backend/          # Node.js API
├── frontend/frontend # React app
├── SETUP.md         # Detailed setup guide
└── QUICKSTART.md    # This file
```

## 🎯 Next Steps

1. **Explore Features**: Try all three user roles
2. **Create Data**: Add trips, promotions, messages
3. **Test APIs**: Use browser DevTools Network tab
4. **Customize**: Modify components in `frontend/frontend/src/`
5. **Deploy**: Follow deployment guide in SETUP.md

## 📞 Support

- Check browser console for errors (F12)
- Check backend console for API errors
- Review SETUP.md for detailed documentation

---

**Happy coding! 🎉**
