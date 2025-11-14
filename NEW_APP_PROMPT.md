# Complete Prompt: Build Advanced Personal Habit Tracker PWA

## Project Overview

Build a **production-ready, AI-powered Personal Habit Tracker** as a Progressive Web App (PWA) for single-user, personal use. The app should be modern, fast, secure, and work offline-first.

---

## Core Requirements

### Technology Stack (REQUIRED)
- **Frontend Framework:** React 18+ with functional components and hooks
- **Build Tool:** Vite (latest version)
- **Styling:** Tailwind CSS with dark mode support
- **Database:** Firebase Firestore (real-time sync)
- **Authentication:** Firebase Auth (email/password, persistent sessions)
- **AI Integration:** Google Gemini API for intelligent chat assistant
- **Routing:** React Router v6
- **Charts:** Chart.js with react-chartjs-2
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa with offline support
- **State Management:** React hooks (useState, useEffect, useContext, useMemo, useCallback)

### Critical Code Quality Rules
1. **NEVER use variable names that might conflict with minification:** Avoid short, generic names like `compact`, `item`, `data` in widely-scoped contexts
2. **Always use descriptive variable names:** `isCompactViewMode` instead of `compact`
3. **Pre-compute all dynamic className values** at component scope, never inline in JSX template literals
4. **Use TypeScript or comprehensive PropTypes** for all components
5. **Implement proper error boundaries** for all async operations
6. **Add comprehensive error handling** with user-friendly messages (no alerts, use toast notifications)
7. **Optimize for production:** Use React.memo, useMemo, useCallback appropriately

---

## Application Architecture

### File Structure
```
/src
  /pages
    - DashboardPage.jsx       # Main overview with today's habits
    - ManageHabitsPage.jsx    # Full CRUD for habits
    - AnalyticsPage.jsx       # Charts, trends, insights
    - StreaksPage.jsx         # Streak tracking and milestones
    - SettingsPage.jsx        # Export/import, preferences
    - LoginPage.jsx           # Authentication
  /components
    - HabitList.jsx           # List of habits with calendar
    - HabitListItem.jsx       # Individual habit card
    - HabitModal.jsx          # Create/edit habit form
    - ChatPanel.jsx           # AI assistant (slide-in panel)
    - Header.jsx              # Top navigation
    - BottomNavigation.jsx    # Mobile bottom nav
    - StreakDashboard.jsx     # Streak display
    - GlobalStatsDashboard.jsx # Overall statistics
    - RewardsPanel.jsx        # Gamification rewards
    - GoalsPanel.jsx          # Goal tracking
    - ChallengesPanel.jsx     # User challenges
    - OnboardingModal.jsx     # First-time user flow
    - ErrorBoundary.jsx       # Error handling
    - ToastProvider.jsx       # Toast notifications
  /ui
    - Button.jsx              # Reusable button component
    - Card.jsx                # Card with variants
    - Input.jsx               # Form input
    - Dialog.jsx              # Modal dialog
    - Label.jsx               # Form label
    - Badge.jsx               # Status badge
  /hooks
    - useUiPreferences.js     # UI preferences hook
    - useDarkMode.js          # Dark mode hook
    - useHabitCache.js        # Performance caching
  /utils
    - api.js                  # Gemini API integration
    - auth.js                 # Firebase auth helpers
    - stats.js                # Analytics calculations
    - streakUtils.js          # Streak calculations
    - helpers.js              # Date/scheduling utilities
    - notifications.js        # Push notifications
    - offlineSync.js          # Offline-first sync
  - firebaseConfig.js         # Firebase initialization
  - constants.js              # App constants
  - App.jsx                   # Main app component
  - main.jsx                  # Entry point
  - index.css                 # Global styles with CSS variables
```

---

## Feature Specifications

### 1. Habit Management (Core Feature)

#### Habit Types
1. **Simple Boolean Habits**
   - Good habits: Track completion (Done/Missed)
   - Bad habits: Track avoidance (Avoided/Indulged)

2. **Measurable Habits**
   - Numeric goal tracking (e.g., "Run 5km", "Drink 8 cups water")
   - Unit customization (km, cups, pages, minutes, etc.)
   - Goal comparison (actual vs target)

3. **Flexible Scheduling**
   - **Daily:** Every day
   - **Specific Days:** Select days of week (checkboxes for M-Su)
   - **Weekly Frequency:** X times per week (e.g., 3 times/week)

#### Habit Properties
```javascript
{
  id: "habit_timestamp_randomId",
  title: string,              // Habit name
  type: "good" | "bad",       // Habit type
  category: string | null,    // Optional category (Fitness, Health, Learning, etc.)
  startDate: "YYYY-MM-DD",    // When habit starts
  endDate: "YYYY-MM-DD" | null, // Optional end date
  scheduleType: "daily" | "specific_days" | "frequency_weekly",
  scheduleDays: [0-6] | null, // Array of day indices (0=Sunday)
  scheduleFrequency: number | null, // Times per week
  isMeasurable: boolean,
  unit: string | null,        // "km", "cups", etc.
  goal: number | null,        // Target value
  createdAt: timestamp,
  archived: boolean,          // For archiving instead of deleting
  archivedAt: timestamp | null,
  notes: string | null        // Optional user notes
}
```

#### Habit Log Structure
```javascript
// Collection: habitLog
// Document ID: YYYY-MM-DD
{
  "2025-01-15": {
    "habit_id_1": true,       // Boolean completion
    "habit_id_2": false,      // Boolean missed
    "habit_id_3": 5.2,        // Numeric value
    "habit_id_4": {           // Extended log with notes
      value: 8,
      notes: "Felt great today!",
      timestamp: 1642262400000
    }
  }
}
```

### 2. Dashboard Features

#### Today's Overview
- **Greeting message** based on time of day
- **Progress ring** showing today's completion percentage
- **Quick stats:** Total habits, completed, pending, streak count
- **Today's habit list** with inline completion buttons
- **Motivational message** from AI based on today's progress

#### Visual Elements
- **Completion indicators:** Color-coded status (green=done, red=missed, gray=pending)
- **Progress bars** for measurable habits
- **Streak badges** with fire emoji and day count
- **Category grouping** (optional, collapsible)

### 3. Streak System (Critical Feature)

#### Streak Calculation Logic
- **Current Streak:** Consecutive days of completion (works backwards from today)
- **Best Streak:** All-time longest streak
- **Streak History:** Track when streaks were broken
- **Milestone Celebrations:** At 7, 14, 30, 50, 100, 365 days
  - Show confetti animation
  - Display achievement modal
  - Play sound effect (optional)
  - Save milestone to user achievements

#### Streak Display
- Flame emoji 🔥 for active streaks
- Day count with "days" label
- Warning indicator if streak at risk
- Streak leaderboard showing top 3 habits
- Detailed streak page with:
  - All active streaks
  - Streak calendar heatmap
  - Best streaks ever
  - Motivational messages for maintaining streaks

### 4. AI Chat Assistant (Advanced Feature)

#### Core Capabilities
1. **Natural Language Habit Management**
   ```
   User: "Add a habit to drink 8 glasses of water daily"
   AI: Creates habit with proper configuration

   User: "I want to exercise 3 times a week"
   AI: Sets up frequency-based schedule

   User: "Delete my meditation habit"
   AI: Asks for confirmation, then deletes
   ```

2. **Actions AI Can Perform**
   - `ADD_HABIT`: Create single or multiple habits
   - `DELETE_HABIT`: Remove habits (with confirmation)
   - `COMPLETE_HABIT`: Mark habit as done for specific date
   - `COMPLETE_ALL_TODAY`: Mark all today's habits as done
   - `SUGGEST_HABITS`: Recommend habits based on user goals
   - `PROVIDE_INSIGHT`: Give motivational messages

3. **AI Features**
   - **Voice input** using Web Speech API
   - **Markdown formatting** in responses (bold, lists, links)
   - **Context awareness:** Knows user's habits, streaks, progress
   - **Confirmation flow:** Two-step confirmation for destructive actions
   - **Smart suggestions:** Personalized habit recommendations
   - **Daily insights:** Morning motivation based on yesterday's performance

#### Gemini API Integration
```javascript
// Prompt engineering for habit tracking
const systemPrompt = `
You are a personal habit tracking assistant. You help users:
- Create and manage habits
- Stay motivated with personalized encouragement
- Suggest new habits based on their goals
- Provide insights on their progress

Current user context:
- Total habits: ${habits.length}
- Active streaks: ${activeStreaks}
- Today's completion rate: ${completionRate}%

Available actions:
[ADD_HABIT, DELETE_HABIT, COMPLETE_HABIT, SUGGEST_HABITS, ...]

Respond in a friendly, motivational tone. When suggesting actions,
provide them in JSON format for the app to parse.
`;
```

### 5. Analytics & Insights

#### Dashboard Charts
1. **Completion Rate Over Time**
   - Line chart showing daily/weekly/monthly completion %
   - Toggle between time periods
   - Color-coded trend lines

2. **Habit Category Breakdown**
   - Pie chart or donut chart
   - Show distribution of habits by category
   - Click to filter

3. **Weekly Heatmap**
   - Calendar view showing completion density
   - Color gradient (red to green)
   - Hover to see exact numbers

4. **Streak Timeline**
   - Bar chart showing streak lengths over time
   - Identify patterns (weekends weaker, etc.)

#### Statistics Calculated
- **Global Stats:**
  - Total habits created
  - Total completions
  - Overall completion rate
  - Total days tracked
  - Longest streak ever
  - Current active streaks

- **Per-Habit Stats:**
  - Completion rate (%)
  - Current streak
  - Best streak
  - Total completions
  - Average value (for measurable)
  - Weekly/monthly trends

- **Insights Generated:**
  - Best performing day of week
  - Worst performing day of week
  - Habits needing focus (low completion rate + old)
  - Success patterns
  - Correlations between habits

### 6. Gamification System

#### XP & Leveling
- **Earn XP for:**
  - Completing habits (10-50 XP based on difficulty)
  - Maintaining streaks (bonus XP)
  - Reaching milestones (100-500 XP)
  - Completing challenges (variable XP)

- **Level System:**
  - Levels 1-100
  - XP required increases per level
  - Unlock badges at certain levels
  - Display level badge in header

#### Achievements/Badges
```javascript
const achievements = [
  { id: "first_habit", name: "First Steps", description: "Create your first habit", icon: "🎯" },
  { id: "week_streak", name: "Committed", description: "Maintain a 7-day streak", icon: "🔥" },
  { id: "month_streak", name: "Dedicated", description: "Maintain a 30-day streak", icon: "💪" },
  { id: "perfect_week", name: "Perfectionist", description: "Complete all habits for 7 days", icon: "⭐" },
  { id: "early_bird", name: "Early Bird", description: "Complete all morning habits before 9 AM", icon: "🌅" },
  { id: "hundred_days", name: "Centurion", description: "Maintain a 100-day streak", icon: "🏆" },
  // ... 20+ more achievements
];
```

#### Challenges System
- **Daily Challenges:** "Complete 5 habits today"
- **Weekly Challenges:** "Maintain all streaks this week"
- **Custom Challenges:** User-created goals with deadlines
- **Challenge Tracking:** Progress bars, countdown timers
- **Rewards:** Extra XP, exclusive badges

#### Rewards Panel
- Display earned badges
- Show progress to next level
- List active challenges
- Showcase recent achievements

### 7. Goals & Milestones

#### Goal Types
1. **Habit-Based Goals**
   - "Complete meditation 30 days in a row"
   - "Run 100km total this month"
   - Auto-tracks based on habit logs

2. **Aggregate Goals**
   - "Complete 90% of all habits this month"
   - "Build 5 new habits this quarter"

3. **Personal Bests**
   - Track best measurable values
   - "Personal best: 10km run"
   - Auto-updates when beaten

#### Milestone Tracking
- Visual progress bars
- Countdown to goal
- Notifications when milestones reached
- Celebration animations
- Share achievements (optional)

### 8. Data Management

#### Export Formats
1. **JSON** (full data backup)
   ```json
   {
     "version": "1.0",
     "exportDate": "2025-01-15T10:30:00Z",
     "habits": [...],
     "habitLog": {...},
     "userProfile": {...},
     "achievements": [...]
   }
   ```

2. **CSV** (for spreadsheet analysis)
   - Separate CSVs for habits and logs
   - Human-readable format

3. **PDF** (formatted report)
   - Weekly/monthly summary
   - Charts and graphs
   - Habit breakdown
   - Insights and recommendations

#### Import Features
- **Data Validation:** Check schema version, validate structure
- **Merge Options:** Overwrite, merge, or append to existing data
- **Backup Creation:** Auto-backup before import
- **Import Preview:** Show what will be imported
- **Rollback:** Ability to undo import

#### Automatic Backups
- **Local Storage Backup:** Daily backup to localStorage
- **Cloud Backup:** Optional Firebase Storage backup
- **Backup History:** Keep last 7 backups
- **Restore Point:** One-click restore

### 9. Notification System

#### Notification Types
1. **Habit Reminders**
   - Time-based (e.g., "8:00 AM: Time to meditate")
   - Smart timing based on completion patterns
   - Customizable per habit

2. **Streak Warnings**
   - "Don't break your 45-day streak! Complete meditation today."
   - Send 2 hours before day ends

3. **Milestone Celebrations**
   - "🎉 You've hit a 30-day streak on Exercise!"
   - Immediate notification

4. **Weekly Review Prompts**
   - "Sunday 8 PM: Time for your weekly review"
   - Summary of week's performance

5. **Motivational Messages**
   - Random encouraging messages
   - AI-generated based on performance

#### Notification Settings
- **Per-Habit Reminders:** Enable/disable, set times
- **Global Preferences:** Quiet hours, notification frequency
- **Sound & Vibration:** Customize notification style
- **Browser Permissions:** Request and manage permissions

### 10. UI/UX Features

#### Dark Mode
- **Automatic detection** based on system preference
- **Manual toggle** in header
- **Persistent preference** in localStorage
- **Smooth transitions** between modes
- **Separate color schemes:**
  ```css
  /* Light mode */
  --color-background: #ffffff;
  --color-text: #1f2937;
  --color-primary: #6366f1;

  /* Dark mode */
  --color-background: #0f172a;
  --color-text: #f1f5f9;
  --color-primary: #818cf8;
  ```

#### Responsive Design
- **Mobile-first approach** (320px and up)
- **Breakpoints:**
  - Mobile: < 640px (single column, bottom nav)
  - Tablet: 640px - 1024px (2 columns)
  - Desktop: > 1024px (3-4 columns, sidebar nav)
- **Touch-friendly:** 44px minimum touch targets
- **Gestures:** Swipe to complete/delete (mobile)

#### View Preferences
- **Compact Mode:** Smaller spacing, tighter layout for small screens
- **Show/Hide Panels:** Toggle rewards, insights, stats panels
- **List vs Grid:** Choose habit display format
- **Sort Options:** By name, category, streak, completion rate
- **Filter Options:** Active/archived, by category, by schedule

#### Accessibility
- **ARIA labels** on all interactive elements
- **Keyboard navigation:** Tab order, Enter/Space activation
- **Screen reader support:** Semantic HTML, descriptive labels
- **High contrast mode:** WCAG AAA compliance option
- **Focus indicators:** Visible focus rings
- **Reduced motion:** Respect `prefers-reduced-motion`
- **Text scaling:** Support browser text size adjustments

### 11. PWA Features

#### Offline Support
- **Service Worker:** Cache all static assets
- **Offline Queue:** Queue writes when offline, sync when back online
- **Offline Indicator:** Show connection status
- **Background Sync:** Sync data when connection restored

#### Installable
- **Web App Manifest:** Name, icons, theme colors
- **Install prompt:** Prompt user to install after 3 visits
- **Standalone mode:** Full-screen app experience
- **Custom splash screen:** Branded loading screen

#### Performance
- **Code splitting:** Dynamic imports for routes
- **Lazy loading:** Images, components load on demand
- **Caching strategy:**
  - Static assets: Cache-first
  - API calls: Network-first with cache fallback
  - Images: Stale-while-revalidate
- **Compression:** Gzip/Brotli for all assets
- **Bundle optimization:** Tree-shaking, minification

### 12. Advanced Features (Nice-to-Have)

#### Habit Notes & Journaling
- Add notes to each habit completion
- Markdown support for rich formatting
- Searchable journal
- Export journal to PDF/text

#### Habit Dependencies
- Link habits (e.g., "Breakfast" must complete before "Exercise")
- Visual dependency tree
- Enforce completion order

#### Habit Templates Library
- Pre-made habit templates by category
- User ratings and reviews
- One-click habit creation from template
- Share custom templates

#### Weekly Review Modal
- End-of-week reflection form
- Questions: "What went well?", "What to improve?", "Goals for next week?"
- Save reflections
- View past reviews

#### Calendar Integration
- Export habits to Google Calendar / iCal
- Show habits on external calendars
- Sync completion status

#### Social Features (Optional)
- **Accountability Partners:** Share progress with friends
- **Leaderboards:** Compete on streaks (opt-in, privacy-focused)
- **Public Profiles:** Show achievements (optional)

---

## Implementation Guidelines

### 1. Project Setup

```bash
# Create Vite + React project
npm create vite@latest habit-tracker-pro -- --template react
cd habit-tracker-pro

# Install dependencies
npm install firebase
npm install react-router-dom
npm install chart.js react-chartjs-2
npm install lucide-react
npm install react-markdown
npm install react-calendar
npm install react-calendar-heatmap
npm install tailwindcss postcss autoprefixer
npm install @vitejs/plugin-react
npm install vite-plugin-pwa

# Initialize Tailwind
npx tailwindcss init -p
```

### 2. Firebase Configuration

```javascript
// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 3. Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          // ... full color scale
          900: '#312e81',
        }
      },
      animation: {
        'confetti': 'confetti 3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      }
    }
  },
  plugins: []
}
```

### 4. Global Styles with CSS Variables

```css
/* index.css */
:root {
  /* Light mode colors */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Spacing */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dark {
  /* Dark mode colors */
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-card: #1e293b;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-primary: #818cf8;
  --color-success: #34d399;
  --color-danger: #f87171;
  --color-warning: #fbbf24;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Component Best Practices

#### Example: Well-Structured Component
```javascript
// components/HabitListItem.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/Button';
import { calculateStreakInfo } from '../utils/streakUtils';
import { CheckCircle, XCircle } from 'lucide-react';

export const HabitListItem = ({
  habit,
  logStatus,
  selectedDate,
  updateHabitLog,
  habitLog,
  isCompactView = false, // Descriptive prop name
}) => {
  // Pre-compute all className values at component scope
  const itemPaddingClass = isCompactView ? "p-2" : "p-3";
  const buttonSpacingClass = isCompactView ? "space-x-1" : "space-x-2";

  // Memoize expensive calculations
  const streakInfo = useMemo(() =>
    calculateStreakInfo(habit, habitLog),
    [habit, habitLog]
  );

  // Stable callback references
  const handleComplete = useCallback((value) => {
    updateHabitLog(habit.id, selectedDate, value);
  }, [habit.id, selectedDate, updateHabitLog]);

  const isGoodHabit = habit.type === "good";
  const isComplete = logStatus === true;

  return (
    <li className={`flex items-center justify-between ${itemPaddingClass} rounded-lg border`}>
      <div className="flex-1">
        <h3 className="font-medium">{habit.title}</h3>
        {streakInfo.currentStreak > 0 && (
          <div className="text-sm text-orange-500">
            🔥 {streakInfo.currentStreak} day streak
          </div>
        )}
      </div>

      <div className={`flex items-center ${buttonSpacingClass}`}>
        <Button
          onClick={() => handleComplete(true)}
          variant={isComplete ? "default" : "outline"}
          aria-label={`Mark ${habit.title} as complete`}
        >
          <CheckCircle className="h-4 w-4" />
          {isGoodHabit ? "Done" : "Avoided"}
        </Button>

        <Button
          onClick={() => handleComplete(false)}
          variant="outline"
          aria-label={`Mark ${habit.title} as incomplete`}
        >
          <XCircle className="h-4 w-4" />
          {isGoodHabit ? "Missed" : "Indulged"}
        </Button>
      </div>
    </li>
  );
};

// PropTypes for documentation
HabitListItem.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['good', 'bad']).isRequired,
  }).isRequired,
  logStatus: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  updateHabitLog: PropTypes.func.isRequired,
  habitLog: PropTypes.object.isRequired,
  isCompactView: PropTypes.bool,
};
```

### 6. Error Handling Pattern

```javascript
// utils/errorHandler.js
export class AppError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export const handleError = (error, showToast) => {
  console.error('[Error]', error);

  let userMessage = 'An unexpected error occurred';

  if (error.code === 'permission-denied') {
    userMessage = 'You don\'t have permission to perform this action';
  } else if (error.code === 'network-error') {
    userMessage = 'Network error. Please check your connection and try again';
  } else if (error.code === 'quota-exceeded') {
    userMessage = 'Storage quota exceeded. Please clear some data';
  }

  showToast(userMessage, 'error');

  // Optional: Send to error tracking service
  // logErrorToService(error);
};
```

### 7. Performance Optimization

```javascript
// hooks/useHabitCache.js
import { useMemo, useRef } from 'react';

const CACHE_DURATION = 60000; // 1 minute

export const useHabitCache = (habit, habitLog) => {
  const cacheRef = useRef({});

  return useMemo(() => {
    const cacheKey = habit.id;
    const now = Date.now();

    if (
      cacheRef.current[cacheKey] &&
      now - cacheRef.current[cacheKey].timestamp < CACHE_DURATION
    ) {
      return cacheRef.current[cacheKey].data;
    }

    // Expensive calculation
    const stats = calculateHabitStats(habit, habitLog);

    cacheRef.current[cacheKey] = {
      data: stats,
      timestamp: now
    };

    return stats;
  }, [habit, habitLog]);
};
```

---

## Security & Privacy

### Data Privacy
- **Single-user app:** All data stored under user's Firebase Auth UID
- **No data sharing:** No user data leaves the user's account
- **Local-first:** Critical data cached locally
- **Encrypted at rest:** Firebase handles encryption
- **HTTPS only:** All API calls over HTTPS

### Firebase Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /habits/{habitId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /habitLog/{date} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Environment Variables
```bash
# .env (NEVER commit this file)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## Testing Strategy

### Unit Tests (Vitest)
```javascript
// tests/streakUtils.test.js
import { describe, it, expect } from 'vitest';
import { calculateStreakInfo } from '../utils/streakUtils';

describe('calculateStreakInfo', () => {
  it('calculates current streak correctly', () => {
    const habit = { id: '1', startDate: '2025-01-01' };
    const habitLog = {
      '2025-01-15': { '1': true },
      '2025-01-14': { '1': true },
      '2025-01-13': { '1': true },
    };

    const result = calculateStreakInfo(habit, habitLog);
    expect(result.currentStreak).toBe(3);
  });

  it('handles zero-valued goals correctly', () => {
    const habit = {
      id: '1',
      isMeasurable: true,
      goal: 0 // Edge case that caused bugs
    };
    const habitLog = { '2025-01-15': { '1': 0 } };

    const result = calculateStreakInfo(habit, habitLog);
    expect(result.currentStreak).toBe(1);
  });
});
```

### E2E Tests (Playwright)
```javascript
// e2e/habit-creation.spec.js
import { test, expect } from '@playwright/test';

test('user can create a new habit', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');

  // Create habit
  await page.click('text=Add Habit');
  await page.fill('[name="title"]', 'Morning Meditation');
  await page.selectOption('[name="type"]', 'good');
  await page.click('button:has-text("Save")');

  // Verify habit appears
  await expect(page.locator('text=Morning Meditation')).toBeVisible();
});
```

---

## Deployment

### Build Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Habit Tracker Pro',
        short_name: 'Habits',
        description: 'AI-powered personal habit tracker',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'charts': ['chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## Success Criteria

### Must-Have Features (MVP)
- ✅ User authentication with Firebase
- ✅ Create, edit, delete habits
- ✅ Log habit completions (boolean and numeric)
- ✅ View today's habits on dashboard
- ✅ Basic streak calculation
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ PWA with offline support
- ✅ Data export/import (JSON)

### Should-Have Features
- ✅ AI chat assistant with Gemini
- ✅ Advanced analytics with charts
- ✅ Streak milestones with celebrations
- ✅ Gamification (XP, levels, badges)
- ✅ Habit categories and filtering
- ✅ Calendar view with heatmap
- ✅ Notification system
- ✅ Weekly review feature

### Nice-to-Have Features
- ⭐ Habit notes/journaling
- ⭐ Habit templates library
- ⭐ PDF export for reports
- ⭐ Calendar integration (Google Cal, iCal)
- ⭐ Voice commands beyond chat
- ⭐ Habit dependencies
- ⭐ Social features (optional)

### Performance Targets
- ⚡ First Contentful Paint < 1.5s
- ⚡ Time to Interactive < 3s
- ⚡ Lighthouse Score > 90 (Performance, Accessibility, Best Practices, SEO)
- ⚡ Bundle size < 500KB (gzipped)
- ⚡ Works offline after first visit

### Quality Standards
- 🎯 Zero console errors in production
- 🎯 Accessible (WCAG 2.1 AA minimum)
- 🎯 Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
- 🎯 Responsive on 320px - 4K displays
- 🎯 Error boundaries on all async operations
- 🎯 Comprehensive error messages (no "Error" or "Failed")

---

## Development Workflow

### Phase 1: Foundation (Week 1-2)
1. Project setup with Vite + React + Tailwind
2. Firebase configuration and authentication
3. Basic routing structure
4. UI component library (Button, Card, Input, etc.)
5. Dark mode implementation
6. Layout (Header, Navigation, Pages)

### Phase 2: Core Features (Week 3-4)
1. Habit CRUD operations
2. Habit logging system
3. Dashboard page with today's habits
4. Basic streak calculation
5. Manage habits page
6. Data persistence with Firestore

### Phase 3: Advanced Features (Week 5-6)
1. Analytics page with charts
2. Streak page with milestones
3. AI chat integration
4. Gamification system (XP, levels, badges)
5. Notification system
6. Settings page

### Phase 4: Polish & Optimization (Week 7-8)
1. PWA configuration
2. Offline support
3. Performance optimization
4. Error handling refinement
5. Accessibility improvements
6. Testing (unit + E2E)
7. Documentation

### Phase 5: Deployment & Launch (Week 9)
1. Production build optimization
2. Deploy to Netlify/Vercel
3. Firebase security rules
4. Performance monitoring
5. User feedback collection
6. Bug fixes

---

## Support & Maintenance

### Monitoring
- **Error Tracking:** Sentry or similar
- **Analytics:** Google Analytics or Plausible (privacy-focused)
- **Performance:** Web Vitals tracking
- **User Feedback:** In-app feedback form

### Updates
- **Feature Updates:** Monthly releases
- **Security Patches:** Immediate (< 24 hours)
- **Dependency Updates:** Weekly automated checks
- **Firebase SDK:** Stay current with latest versions

---

## Additional Resources

### Design Inspiration
- Habitica (gamification)
- Streaks (minimalist design)
- Productive (clean UI)
- Notion (flexible layouts)

### Icons & Assets
- Lucide React (icons)
- Unsplash (images, if needed)
- Heroicons (alternative icons)

### Learning Resources
- React docs: https://react.dev
- Firebase docs: https://firebase.google.com/docs
- Tailwind docs: https://tailwindcss.com
- Vite docs: https://vitejs.dev
- Chart.js docs: https://www.chartjs.org

---

## Final Notes

**This is a comprehensive spec for a production-ready habit tracker. Start with the MVP features and iterate based on user feedback.**

**Key Success Factors:**
1. **Simple, intuitive UI** - User should understand instantly
2. **Fast performance** - < 3s load time, instant interactions
3. **Reliable offline** - Works without internet
4. **Motivating** - Streaks, achievements, AI encouragement
5. **Privacy-first** - User owns their data, no tracking

**Avoid These Pitfalls:**
1. ❌ Using generic variable names (`compact`, `data`, `item`) in widely-scoped contexts
2. ❌ Inline ternary operators in JSX template literals with minification
3. ❌ Console.log statements with multiple comma-separated variables
4. ❌ Missing error boundaries around async operations
5. ❌ Blocking alerts for error messages
6. ❌ No PropTypes or TypeScript
7. ❌ Overly complex components (> 300 lines)

**Build it progressively, test thoroughly, and ship confidently!** 🚀
