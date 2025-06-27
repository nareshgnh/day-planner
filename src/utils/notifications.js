// src/utils/notifications.js
import { formatDate, isHabitScheduledForDate } from "./helpers";

export class NotificationManager {
  constructor() {
    this.registeredNotifications = new Set();
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  showNotification(title, options = {}) {
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const notification = new Notification(title, {
      icon: "/vite.svg",
      badge: "/vite.svg",
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  scheduleHabitReminders(habits, habitLog) {
    // Clear existing notifications
    this.clearAllNotifications();

    const today = new Date();
    const todayStr = formatDate(today);
    const todayLog = habitLog[todayStr] || {};

    habits.forEach((habit) => {
      if (!isHabitScheduledForDate(habit, today)) return;

      const status = todayLog[habit.id];
      const isCompleted = habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;

      if (isCompleted) return; // Don't remind if already completed

      // Schedule reminders based on habit type and user preferences
      this.scheduleHabitReminder(habit);
    });
  }

  scheduleHabitReminder(habit) {
    // Default reminder times based on habit category
    const defaultReminderTimes = {
      Health: ["09:00", "15:00", "21:00"],
      Fitness: ["07:00", "18:00"],
      Nutrition: ["08:00", "12:00", "18:00"],
      Sleep: ["21:00"],
      Learning: ["19:00"],
      Mindfulness: ["08:00", "20:00"],
      Productivity: ["09:00", "14:00"],
      default: ["10:00", "16:00", "20:00"],
    };

    const category = habit.category || "default";
    const reminderTimes =
      habit.reminderTimes ||
      defaultReminderTimes[category] ||
      defaultReminderTimes.default;

    reminderTimes.forEach((time) => {
      this.scheduleNotificationAtTime(habit, time);
    });
  }

  scheduleNotificationAtTime(habit, timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();
    const notificationId = `${habit.id}-${timeString}`;

    if (this.registeredNotifications.has(notificationId)) {
      return; // Already scheduled
    }

    const timeoutId = setTimeout(() => {
      this.showHabitReminder(habit);
      this.registeredNotifications.delete(notificationId);
    }, delay);

    this.registeredNotifications.add(notificationId);

    // Store timeout ID for cleanup
    if (!this.timeouts) this.timeouts = new Map();
    this.timeouts.set(notificationId, timeoutId);
  }

  showHabitReminder(habit) {
    const isGoodHabit = habit.type !== "bad";
    const title = `🎯 Habit Reminder`;

    let body;
    if (habit.isMeasurable) {
      body = `Time to work on "${habit.title}" - Goal: ${habit.goal} ${habit.unit}`;
    } else {
      body = isGoodHabit
        ? `Time to "${habit.title}"`
        : `Remember to avoid "${habit.title}"`;
    }

    this.showNotification(title, {
      body,
      tag: `habit-${habit.id}`,
      data: { habitId: habit.id, type: "reminder" },
      actions: [
        { action: "mark-done", title: isGoodHabit ? "✅ Done" : "✅ Avoided" },
        { action: "snooze", title: "⏰ Snooze 1h" },
      ],
    });
  }

  showStreakCelebration(habit, streakLength) {
    const title = `🔥 Streak Achievement!`;
    const body = `Amazing! You've maintained "${habit.title}" for ${streakLength} days in a row!`;

    this.showNotification(title, {
      body,
      tag: `streak-${habit.id}`,
      data: { habitId: habit.id, type: "celebration" },
    });
  }

  showStreakWarning(habit, streakLength) {
    if (streakLength < 3) return; // Only warn for meaningful streaks

    const title = `⚠️ Streak at Risk!`;
    const body = `Don't break your ${streakLength}-day streak for "${habit.title}"!`;

    this.showNotification(title, {
      body,
      tag: `warning-${habit.id}`,
      data: { habitId: habit.id, type: "warning" },
    });
  }

  showDailyMotivation(message) {
    const title = `💪 Daily Motivation`;

    this.showNotification(title, {
      body: message,
      tag: "daily-motivation",
      data: { type: "motivation" },
    });
  }

  showWeeklyReport(stats) {
    const title = `📊 Weekly Report`;
    const body = `This week: ${stats.completedHabits}/${stats.totalHabits} habits completed (${stats.completionRate}%)`;

    this.showNotification(title, {
      body,
      tag: "weekly-report",
      data: { type: "report" },
    });
  }

  clearAllNotifications() {
    // Clear all scheduled timeouts
    if (this.timeouts) {
      this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      this.timeouts.clear();
    }

    this.registeredNotifications.clear();
  }

  // Smart notification logic based on user behavior
  getOptimalReminderTime(habit, habitLog) {
    // Analyze when user typically completes this habit
    const completionTimes = this.analyzeCompletionPattern(habit, habitLog);

    if (completionTimes.length > 0) {
      // Suggest reminder 30 minutes before typical completion time
      const avgCompletionTime =
        completionTimes.reduce((sum, time) => sum + time, 0) /
        completionTimes.length;
      return new Date(avgCompletionTime - 30 * 60 * 1000); // 30 minutes earlier
    }

    return null; // Use default times
  }

  analyzeCompletionPattern(habit, habitLog) {
    // This would analyze the timestamps of when habits were completed
    // For now, return empty array (would need timestamp data)
    return [];
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Utility functions for scheduling
export const scheduleEndOfDayReminder = (habits, habitLog) => {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(21, 0, 0, 0); // 9 PM reminder

  if (endOfDay <= now) return; // Too late today

  const delay = endOfDay.getTime() - now.getTime();

  setTimeout(() => {
    const todayStr = formatDate(new Date());
    const todayLog = habitLog[todayStr] || {};

    const incompleteHabits = habits.filter((habit) => {
      if (!isHabitScheduledForDate(habit, new Date())) return false;

      const status = todayLog[habit.id];
      const isCompleted = habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;

      return !isCompleted;
    });

    if (incompleteHabits.length > 0) {
      notificationManager.showNotification("🌙 End of Day Reminder", {
        body: `You have ${incompleteHabits.length} habit(s) left to complete today!`,
        tag: "end-of-day",
      });
    }
  }, delay);
};

export const scheduleWeeklyReview = () => {
  const now = new Date();
  const nextSunday = new Date();
  nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
  nextSunday.setHours(19, 0, 0, 0); // 7 PM

  const delay = nextSunday.getTime() - now.getTime();

  setTimeout(() => {
    notificationManager.showNotification("📅 Weekly Review Time", {
      body: "How did your habits go this week? Time to reflect and plan!",
      tag: "weekly-review",
    });
  }, delay);
};
