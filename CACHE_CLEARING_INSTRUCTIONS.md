# CRITICAL: Clear Browser Cache Instructions

The error you're experiencing is likely due to **cached JavaScript files**. Follow these steps **exactly**:

## Step 1: Clear Browser Cache (REQUIRED)

### Chrome/Edge:
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "All time" for time range
3. Check these boxes:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
4. Click "Clear data"

### Firefox:
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Everything" for time range
3. Check these boxes:
   - ✅ Cookies
   - ✅ Cache
4. Click "Clear Now"

### Safari:
1. Go to Safari menu → Preferences → Advanced
2. Check "Show Develop menu in menu bar"
3. Go to Develop → Empty Caches
4. Also go to Safari → Clear History → "all history"

## Step 2: Hard Refresh

After clearing cache, do a **hard refresh**:
- **Windows:** `Ctrl+Shift+R` or `Ctrl+F5`
- **Mac:** `Cmd+Shift+R`

Press it **3 times** to be sure!

## Step 3: Close and Reopen Browser

1. **Completely close** your browser (all windows)
2. Wait 5 seconds
3. Open browser again
4. Navigate to your app

## Step 4: Verify Fix

Open Developer Tools (F12) and check console for:

### ✅ Expected Logs (Success):
```
Firebase Initialized. Project ID: habit-tracker-app-1ddc2
Gemini API Key found.
[useUiPrefs] Hook called
[useUiPrefs] isSmallScreen: false
[useUiPrefs] readBool(ui.compact): null -> fallback: false
[useUiPrefs] Initial isCompactMode state: false
[DashboardPage] Component rendering
[DashboardPage] useUiPrefs returned: {compact: false, ...}
[DashboardPage] Values - compact: false
```

### ❌ Error (Still Broken):
```
Firebase Initialized. Project ID: habit-tracker-app-1ddc2
Gemini API Key found.
Uncaught ReferenceError: compact is not defined
```

## Step 5: If Still Broken

If you still see the error after clearing cache:

1. Try a **different browser** (Chrome, Firefox, Edge)
2. Try **Incognito/Private mode**
3. Run these in browser console:
```javascript
// Clear localStorage
localStorage.clear()

// Verify it's empty
console.log(Object.keys(localStorage))

// Reload
location.reload(true)
```

## Step 6: Check Service Worker

Your app uses PWA, so check for service worker:

1. Open DevTools → Application tab → Service Workers
2. Click **"Unregister"** next to any service workers
3. Check "Update on reload" checkbox
4. Hard refresh again

## Step 7: Nuclear Option

If NOTHING works:

### Chrome:
```
chrome://settings/siteData
```
Search for your site, click "Remove"

### Firefox:
```
about:preferences#privacy
```
Click "Manage Data", search for your site, click "Remove Selected"

Then restart browser and try again.

## What Changed?

I renamed the internal state variable from `compact` to `isCompactMode` because "compact" might be a reserved word or problematic identifier in Vite's minifier.

## Contact

If still broken after ALL these steps, provide:
1. Which browser and version
2. Screenshot of FULL console output
3. Result of running in console: `localStorage.clear(); location.reload(true)`
