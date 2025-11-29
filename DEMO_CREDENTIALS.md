# Demo Credentials - NATPAC

## 🎯 Overview

Three demo user accounts are available for testing all features of the NATPAC platform.

---

## 👤 User Accounts

### 1. **Traveler Account** ✈️

**Role:** Traveler - Browse and manage trips

```
Email:    traveler@example.com
Password: password123
```

**Features Available:**
- ✅ View traveler dashboard
- ✅ Browse available trips
- ✅ Join trips
- ✅ Manage joined trips
- ✅ Upload trip documents
- ✅ Organize documents by category
- ✅ Access trip management digital wallet

**Dashboard Includes:**
- Trip statistics
- Active trips overview
- Trip management interface
- Document organization system

---

### 2. **Agent Account** 🏢

**Role:** Agent - Create and manage listings

```
Email:    agent@example.com
Password: password123
```

**Features Available:**
- ✅ View agent dashboard
- ✅ Create listings (travel packages, tours, accommodations)
- ✅ View analytics for listings
- ✅ Track listing performance
- ✅ View trip details
- ✅ Manage promotions
- ✅ Send/receive messages

**Dashboard Includes:**
- Listing creation form
- Analytics dashboard with real-time metrics
- Performance tracking
- Trip management

---

### 3. **Researcher Account** 🔬

**Role:** Researcher - Access travel data and insights

```
Email:    researcher@example.com
Password: password123
```

**Features Available:**
- ✅ View researcher dashboard
- ✅ Access travel analytics
- ✅ View traveler statistics
- ✅ Analyze destination insights
- ✅ Track expense analysis
- ✅ Monitor agent performance
- ✅ View travel trends

**Dashboard Includes:**
- Analytics overview
- Traveler insights
- Destination analysis
- Expense tracking
- Agent performance metrics
- Travel trend analysis

---

## 🚀 How to Login

### Step 1: Start the Application
```bash
cd d:\SIH
npm run dev
```

### Step 2: Open in Browser
```
http://localhost:5173
```

### Step 3: Click "Get Started"
- Navigate to login page

### Step 4: Select Role
- Choose from Traveler, Agent, or Researcher

### Step 5: Enter Credentials
- Copy email and password from above
- Click Login

### Step 6: Explore Dashboard
- Each role has unique features and dashboards

---

## 📊 What Each Role Can Do

### Traveler Dashboard
```
┌─────────────────────────────────────────┐
│  Your Journey Organized                 │
│                                         │
│  [Explore Trips] [Learn More]          │
│                                         │
│  Stats:                                 │
│  • 12 Active Trips                      │
│  • 45 Documents                         │
│  • 8 Destinations                       │
│  • 24 Connections                       │
│                                         │
│  Features:                              │
│  • Trip Management (Digital Wallet)     │
│  • Smart Integration                    │
│  • Share & Connect                      │
└─────────────────────────────────────────┘
```

### Agent Dashboard
```
┌─────────────────────────────────────────┐
│  Promote Your Destinations              │
│                                         │
│  [Create Listing] [View Analytics]     │
│                                         │
│  Stats:                                 │
│  • 156 Active Listings                  │
│  • 2.4K Total Views                     │
│  • 89 Bookings                          │
│  • 4.8★ Avg Rating                      │
│                                         │
│  Features:                              │
│  • Create Listings                      │
│  • Analytics Dashboard                  │
│  • Performance Tracking                 │
└─────────────────────────────────────────┘
```

### Researcher Dashboard
```
┌─────────────────────────────────────────┐
│  Travel Data & Insights                 │
│                                         │
│  [View Analytics]                       │
│                                         │
│  Analytics Available:                   │
│  • Traveler Statistics                  │
│  • Destination Insights                 │
│  • Expense Analysis                     │
│  • Agent Performance                    │
│  • Travel Trends                        │
│  • Access Logs                          │
└─────────────────────────────────────────┘
```

---

## 🎯 Testing Scenarios

### Scenario 1: Test as Traveler
1. Login as traveler
2. View dashboard
3. Explore features
4. Logout

### Scenario 2: Test as Agent
1. Login as agent
2. Create a listing
3. View analytics
4. Check performance metrics
5. Logout

### Scenario 3: Test as Researcher
1. Login as researcher
2. View analytics dashboard
3. Explore data insights
4. Check travel trends
5. Logout

---

## 🔐 Security Notes

- ✅ Passwords are hashed with bcryptjs
- ✅ JWT tokens used for authentication
- ✅ Tokens stored in localStorage
- ✅ Sessions persist across page refreshes
- ✅ Logout clears all session data

---

## 🛠️ Backend Endpoints

All credentials work with these endpoints:

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### Traveler Features
```
GET /api/trips
POST /api/trips
GET /api/trips/:id
```

### Agent Features
```
GET /api/agents/promotions
POST /api/agents/promotions
GET /api/agents/messages
POST /api/agents/messages
```

### Researcher Features
```
GET /api/researcher/traveler-stats
GET /api/researcher/destination-insights
GET /api/researcher/expense-analysis
GET /api/researcher/agent-performance
GET /api/researcher/travel-trends
GET /api/researcher/access-logs
```

---

## 📝 Notes

- All demo accounts have the same password: `password123`
- Credentials are pre-loaded in the database
- You can also create new accounts by signing up
- Each role has unique features and permissions
- Logout clears session and returns to landing page

---

## 🆘 Troubleshooting

### Login Not Working
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check email and password are correct
3. Clear browser cache
4. Try a different browser

### Backend Not Running
```bash
cd d:\SIH\backend
npm run dev
```

### Frontend Not Running
```bash
cd d:\SIH\frontend\frontend
npm run dev
```

### Both Not Running
```bash
cd d:\SIH
npm run dev
```

---

## ✨ Summary

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Traveler | traveler@example.com | password123 | Trip management, document storage |
| Agent | agent@example.com | password123 | Create listings, analytics |
| Researcher | researcher@example.com | password123 | Data insights, analytics |

---

**Ready to test? Use these credentials to explore NATPAC! 🚀**
