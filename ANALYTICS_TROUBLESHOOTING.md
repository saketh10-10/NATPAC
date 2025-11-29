# Analytics Dashboard - Troubleshooting Guide

## 🔧 Issue: Blank Page When Clicking "View Analytics"

### ✅ Quick Fixes

#### 1. **Check if Backend is Running**

The most common issue is that the backend server is not running.

**Check:**
```bash
# Open browser and go to:
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "Backend is running"
}
```

**If you get an error:**
- Backend is NOT running
- Start the backend:
```bash
cd d:\SIH\backend
npm run dev
```

#### 2. **Check Browser Console for Errors**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for error messages
4. Check the **Network** tab to see API calls

**Common errors:**
- `Failed to fetch promotions: 401` - Authentication issue
- `Failed to fetch promotions: 404` - Endpoint not found
- `Network error` - Backend not running

#### 3. **Verify You're Logged In**

The Analytics Dashboard requires authentication.

**Check:**
1. Make sure you're logged in as an agent
2. Check localStorage has a token:
   - Press F12 → Application → LocalStorage
   - Look for `token` key
   - If missing, login again

#### 4. **Clear Browser Cache**

Sometimes old data causes issues.

**Steps:**
1. Press **Ctrl + Shift + Delete** (or Cmd + Shift + Delete on Mac)
2. Select "All time"
3. Check "Cookies and other site data"
4. Click "Clear data"
5. Refresh the page

---

## 🚀 Step-by-Step Debugging

### Step 1: Verify Backend is Running

```bash
# Terminal 1 - Backend
cd d:\SIH\backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
📊 API endpoints:
   - Auth: /api/auth
   - Trips: /api/trips
   - Agents: /api/agents
   - Researcher: /api/researcher
```

### Step 2: Verify Frontend is Running

```bash
# Terminal 2 - Frontend
cd d:\SIH\frontend\frontend
npm run dev
```

**Expected output:**
```
VITE v7.1.12  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### Step 3: Test API Endpoint Manually

Open browser and test:
```
http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "Backend is running"
}
```

### Step 4: Check Authentication

1. Login to the app
2. Open DevTools (F12)
3. Go to Application → LocalStorage
4. Verify `token` exists
5. Verify `user` exists

### Step 5: Test Analytics Endpoint

1. Get your token from localStorage
2. Open DevTools Console
3. Run this command:

```javascript
fetch('http://localhost:5000/api/agents/my-promotions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

**Expected response:**
```json
{
  "promotions": [
    {
      "id": 1,
      "title": "Paris City Tour",
      "destination": "Paris, France",
      ...
    }
  ]
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Authentication required. Please login again."

**Cause:** Token is missing or invalid

**Solution:**
1. Logout from the app
2. Login again
3. Try View Analytics again

### Issue 2: "Failed to fetch promotions: 401"

**Cause:** Invalid or expired token

**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Logout and login again
3. Try View Analytics again

### Issue 3: "Failed to fetch promotions: 404"

**Cause:** API endpoint not found or backend not running

**Solution:**
1. Check backend is running: `npm run dev` in backend folder
2. Verify endpoint exists: `http://localhost:5000/api/health`
3. Restart backend if needed

### Issue 4: "Network error" or "Failed to fetch"

**Cause:** Backend not running or network issue

**Solution:**
1. Start backend: `cd d:\SIH\backend && npm run dev`
2. Check if port 5000 is in use: `netstat -ano | findstr :5000`
3. If port is in use, kill the process or use different port

### Issue 5: Blank Page with No Error

**Cause:** Component not rendering properly

**Solution:**
1. Check browser console (F12)
2. Look for any JavaScript errors
3. Try refreshing the page
4. Clear cache and try again

---

## 📋 Verification Checklist

Before using Analytics Dashboard, verify:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] You are logged in as an agent
- [ ] Token exists in localStorage
- [ ] No errors in browser console
- [ ] API health check passes
- [ ] You have created at least one listing

---

## 🔍 Debug Mode

To enable detailed logging, open DevTools Console and run:

```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Then refresh the page and check console for detailed logs
```

---

## 📞 Still Having Issues?

### Check These Files:

1. **Backend logs** - Check terminal where backend is running
2. **Browser console** - F12 → Console tab
3. **Network tab** - F12 → Network tab, then click View Analytics
4. **Application storage** - F12 → Application → LocalStorage

### Provide This Information:

When reporting an issue, provide:
1. Error message from console
2. Network tab response
3. Backend logs
4. Steps to reproduce
5. Browser and OS version

---

## 🚀 Quick Start (If Everything is Broken)

```bash
# Terminal 1 - Backend
cd d:\SIH\backend
npm run dev

# Terminal 2 - Frontend
cd d:\SIH\frontend\frontend
npm run dev

# Then:
# 1. Open http://localhost:5173
# 2. Login as agent
# 3. Click "View Analytics"
```

---

## ✅ Expected Behavior

### When Everything Works:

1. Click "View Analytics" button
2. Page loads with header "Analytics Dashboard"
3. Shows 4 stat cards (Total Listings, Total Views, Messages, Avg Rating)
4. Shows grid of your listings
5. Click on a listing to see detailed dashboard
6. Click "Back" to return

### If You See:

- **Blank page** → Backend not running
- **Error message** → Check error details
- **Loading spinner** → Wait for data to load
- **"No listings yet"** → Create a listing first

---

## 🎯 Solution Summary

| Issue | Solution |
|-------|----------|
| Blank page | Start backend: `npm run dev` in backend folder |
| Auth error | Logout and login again |
| 404 error | Check backend is running |
| Network error | Verify port 5000 is available |
| No listings | Create a listing first |
| Slow loading | Check network speed, backend performance |

---

**For more help, check the console logs and verify the backend is running! 🚀**
