# Plan New Trip - Troubleshooting Guide

## 🔧 Issue: Blank Page When Clicking "Plan New Trip"

### ✅ Quick Fixes

#### 1. **Check Browser Console for Errors**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for error messages
4. Check the **Network** tab to see API calls

**Common errors:**
- `Failed to fetch trips` - API issue
- `Network error` - Backend not running
- `undefined` errors - Component rendering issue

#### 2. **Verify Backend is Running**

The component uses mock data as fallback, so it should show trips even if API fails.

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

#### 3. **Hard Refresh the Page**

Sometimes cached data causes issues.

**Steps:**
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. Wait for page to fully reload
3. Click "Plan New Trip" again

#### 4. **Clear Browser Cache**

1. Press **Ctrl + Shift + Delete**
2. Select "All time"
3. Check "Cookies and other site data"
4. Click "Clear data"
5. Refresh and try again

#### 5. **Check if You're Logged In**

The component requires authentication.

**Verify:**
1. Make sure you're logged in as a traveler
2. Check localStorage has a token:
   - Press F12 → Application → LocalStorage
   - Look for `token` key
   - If missing, login again

---

## 🚀 Step-by-Step Debugging

### Step 1: Check Backend

```bash
# Terminal 1 - Verify Backend
curl http://localhost:5000/api/health
```

**Expected:**
```json
{"status": "Backend is running"}
```

### Step 2: Check Frontend Console

1. Press **F12**
2. Go to **Console** tab
3. Look for logs like:
   - `Fetching available trips...`
   - `Response status: 200`
   - `Fetched trips: [...]`
   - `Using mock data...`

### Step 3: Check Network Tab

1. Press **F12**
2. Go to **Network** tab
3. Click "Plan New Trip"
4. Look for API calls:
   - `/api/trips/available` - Should show response
   - Check status code (200 = success, 404 = not found, 500 = error)

### Step 4: Test with Mock Data

The component should show mock data even if API fails.

**If you see:**
- ✅ Trips loading with mock data = Component works
- ❌ Blank page = Component rendering issue

---

## 🐛 Common Issues & Solutions

### Issue 1: Completely Blank Page

**Cause:** Component not rendering at all

**Solution:**
1. Check browser console for errors
2. Hard refresh (Ctrl + Shift + R)
3. Clear cache and cookies
4. Logout and login again

### Issue 2: Loading Spinner Forever

**Cause:** API call hanging or not completing

**Solution:**
1. Check if backend is running
2. Check network tab for pending requests
3. Restart backend: `npm run dev` in backend folder
4. Hard refresh browser

### Issue 3: "No trips found" Message

**Cause:** Trips loaded but filtered out

**Solution:**
1. Click "All Trips" filter
2. Clear search box
3. Verify trips are loading in console

### Issue 4: Error Message Displayed

**Cause:** API error or authentication issue

**Solution:**
1. Check error message
2. Verify backend is running
3. Verify you're logged in
4. Check token in localStorage

### Issue 5: Page Shows But Trips Don't Load

**Cause:** API endpoint not available, using mock data but not displaying

**Solution:**
1. Check console for logs
2. Verify mock data is being used
3. Hard refresh page
4. Check if trips array is populated

---

## 📋 Verification Checklist

Before using Plan New Trip, verify:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] You are logged in as a traveler
- [ ] Token exists in localStorage
- [ ] No errors in browser console
- [ ] API health check passes
- [ ] Page loads with header "Plan New Trip"
- [ ] Search bar is visible
- [ ] Filter buttons are visible
- [ ] Trips are displayed (mock or real)

---

## 🔍 Debug Mode

To enable detailed logging, open DevTools Console and run:

```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Then refresh the page and check console for detailed logs
```

---

## 📊 Expected Behavior

### When Everything Works:

1. Click "Plan New Trip" button
2. Page loads with header "Plan New Trip"
3. Shows search bar and filter buttons
4. Shows 6 sample trips (if using mock data)
5. Each trip card shows:
   - Title and destination
   - Dates
   - Cost and available slots
   - Agent information
   - "View Details" button on hover
6. Can search and filter trips
7. Can click trip to see details
8. Can join trip

### If You See:

- **Blank page** → Component not rendering
- **Loading spinner** → Data still loading
- **Error message** → Check error details
- **"No trips found"** → Clear filters/search
- **Trips displayed** → Everything working!

---

## 🎯 Solution Summary

| Issue | Solution |
|-------|----------|
| Blank page | Hard refresh (Ctrl+Shift+R) |
| Loading forever | Restart backend |
| Auth error | Logout and login again |
| No trips | Clear filters and search |
| API error | Check backend is running |
| Console errors | Check browser console (F12) |

---

## 📞 Still Having Issues?

### Check These:

1. **Browser Console** - F12 → Console tab
2. **Network Tab** - F12 → Network tab
3. **Backend Logs** - Check terminal where backend is running
4. **LocalStorage** - F12 → Application → LocalStorage
5. **Token** - Verify token exists and is valid

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
# 2. Login as traveler
# 3. Click "Plan New Trip"
```

---

**For more help, check the console logs and verify the backend is running! 🚀**
