// src/components/NotificationSettings.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import {
  Bell,
  BellOff,
  Clock,
  Smartphone,
  Settings,
  Check,
  X,
} from "lucide-react";

const NotificationSettings = ({ habits, onUpdateHabitReminders }) => {
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [globalReminders, setGlobalReminders] = useState({
    enabled: false,
    dailyReminder: "09:00",
    streakReminder: true,
    achievementReminder: true,
  });

  const [habitReminders, setHabitReminders] = useState({});

  useEffect(() => {
    // Check current notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load saved reminders from localStorage
    const savedReminders = localStorage.getItem("habitReminders");
    if (savedReminders) {
      setHabitReminders(JSON.parse(savedReminders));
    }

    const savedGlobal = localStorage.getItem("globalReminders");
    if (savedGlobal) {
      setGlobalReminders(JSON.parse(savedGlobal));
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        // Show test notification
        new Notification("Habit Tracker", {
          body: "Notifications enabled! You'll now receive habit reminders.",
          icon: "/vite.svg",
        });
      }
    }
  };

  const updateGlobalSettings = (updates) => {
    const newSettings = { ...globalReminders, ...updates };
    setGlobalReminders(newSettings);
    localStorage.setItem("globalReminders", JSON.stringify(newSettings));
  };

  const updateHabitReminder = (habitId, reminderData) => {
    const updated = {
      ...habitReminders,
      [habitId]: { ...habitReminders[habitId], ...reminderData },
    };
    setHabitReminders(updated);
    localStorage.setItem("habitReminders", JSON.stringify(updated));

    if (onUpdateHabitReminders) {
      onUpdateHabitReminders(updated);
    }
  };

  const scheduleNotification = (habit, time) => {
    if (notificationPermission !== "granted") return;

    // This is a simplified version - in a real app you'd use a service worker
    // or backend service for reliable notifications
    const now = new Date();
    const [hours, minutes] = time.split(":");
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      new Notification(`Habit Reminder: ${habit.title}`, {
        body: `Time to work on your habit: ${habit.title}`,
        icon: "/vite.svg",
        tag: `habit-${habit.id}`,
        requireInteraction: false,
      });
    }, timeUntilNotification);
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow notifications to get habit reminders
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notificationPermission === "granted" ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Enabled</span>
                </div>
              ) : notificationPermission === "denied" ? (
                <div className="flex items-center gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  <span className="text-sm">Blocked</span>
                </div>
              ) : (
                <Button onClick={requestNotificationPermission} size="sm">
                  Enable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Global Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminder">Daily Check-in Reminder</Label>
            <div className="flex items-center gap-2">
              <Input
                id="daily-reminder"
                type="time"
                value={globalReminders.dailyReminder}
                onChange={(e) =>
                  updateGlobalSettings({ dailyReminder: e.target.value })
                }
                className="w-24"
                disabled={!globalReminders.enabled}
              />
              <Button
                variant={globalReminders.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateGlobalSettings({ enabled: !globalReminders.enabled })
                }
              >
                {globalReminders.enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={globalReminders.streakReminder}
                onChange={(e) =>
                  updateGlobalSettings({ streakReminder: e.target.checked })
                }
                className="rounded"
              />
              Streak milestone notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={globalReminders.achievementReminder}
                onChange={(e) =>
                  updateGlobalSettings({
                    achievementReminder: e.target.checked,
                  })
                }
                className="rounded"
              />
              Achievement unlock notifications
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Individual Habit Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Habit-Specific Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No habits created yet. Create some habits to set up reminders!
            </p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const reminder = habitReminders[habit.id] || {
                  enabled: false,
                  time: "09:00",
                };

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium">{habit.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {habit.type === "good" ? "Build habit" : "Break habit"}
                        {habit.isMeasurable && ` • ${habit.goal} ${habit.unit}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={reminder.time}
                        onChange={(e) =>
                          updateHabitReminder(habit.id, {
                            time: e.target.value,
                          })
                        }
                        className="w-24"
                        disabled={
                          !reminder.enabled ||
                          notificationPermission !== "granted"
                        }
                      />
                      <Button
                        variant={reminder.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const enabled = !reminder.enabled;
                          updateHabitReminder(habit.id, { enabled });
                          if (enabled && notificationPermission === "granted") {
                            scheduleNotification(habit, reminder.time);
                          }
                        }}
                        disabled={notificationPermission !== "granted"}
                      >
                        {reminder.enabled ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { NotificationSettings };
