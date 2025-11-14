# How to See Full Error Details in Browser

## Method 1: Browser Console (Most Common)

1. **Open Developer Tools:**
   - **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari:** Enable Developer Menu first (Preferences > Advanced > Show Develop menu), then press `Cmd+Option+C`

2. **Check Console Tab:**
   - Look for red error messages
   - Click on the error to expand the full stack trace
   - Look for the file name and line number (e.g., `index.js:3726:37332`)

3. **Check for Multiple Errors:**
   - Scroll through the console
   - Look for warnings (yellow) and errors (red)
   - Some errors might be hidden - click "Show all" or similar

## Method 2: Network Tab

1. **Open Network Tab** in Developer Tools
2. **Refresh the page** (F5)
3. Look for:
   - Failed requests (red)
   - 404 errors
   - CORS errors

## Method 3: Sources/Debugger Tab

1. **Open Sources Tab** (Chrome) or **Debugger Tab** (Firefox)
2. **Enable "Pause on exceptions"** (checkbox at top)
3. **Refresh page** - it will pause when error occurs
4. You can see:
   - Exact line where error happens
   - Call stack (how we got there)
   - Variable values at that moment

## Method 4: React DevTools

1. **Install React DevTools** extension
2. **Open Components tab**
3. Look for:
   - Error boundaries showing errors
   - Component tree (which components loaded)

## Method 5: Check Error Boundary

If you see a blank screen with no console errors:
1. The ErrorBoundary might be catching the error
2. Check if there's a fallback UI showing
3. Look in console for "Error caught by boundary:" messages

## Current Error Details Needed

Please provide:
1. **Full error message** from console
2. **Stack trace** (click to expand error)
3. **Network errors** (if any)
4. **Console logs** starting with `[useUiPrefs]` and `[DashboardPage]`
5. **Screenshot** of the console if possible

## Quick Test Commands

Open console and run these:
```javascript
// Check if compact is accessible
window.compact

// Check localStorage
localStorage.getItem('ui.compact')

// Check if React loaded
window.React

// Check all localStorage keys
Object.keys(localStorage)
```
