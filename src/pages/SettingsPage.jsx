// src/pages/SettingsPage.jsx
import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { NotificationSettings } from "../components/NotificationSettings";
import {
  Settings,
  Upload,
  Download,
  Bell,
  Database,
  LogOut,
} from "lucide-react";
import { logOut } from "../utils/auth";
import { useUiPrefs } from "../hooks/useUiPrefs";

const SettingsPage = ({ exportData, importData, habits = [] }) => {
  const fileInputRef = useRef(null);
  const uiPrefs = useUiPrefs();

  // Use fallback values to ensure variables are always defined
  const compact = uiPrefs?.compact ?? false;
  const setCompact = uiPrefs?.setCompact ?? (() => {});
  const showRewards = uiPrefs?.showRewards ?? false;
  const setShowRewards = uiPrefs?.setShowRewards ?? (() => {});
  const showInsight = uiPrefs?.showInsight ?? true;
  const setShowInsight = uiPrefs?.setShowInsight ?? (() => {});

  const [activeTab, setActiveTab] = useState("data");

  const handleUpdateHabitReminders = (reminders) => {
    // This would typically save to your backend/Firebase
    console.log("Updated habit reminders:", reminders);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        confirm(
          "Importing data will overwrite your current habits and logs. Are you sure you want to proceed?"
        )
      ) {
        importData(file);
      }
      // Reset file input to allow importing the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        <Settings size={28} className="mr-3 text-gray-600 dark:text-gray-400" />
        Settings
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-1 text-gray-700 dark:text-gray-200">
              Export Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Download all your habits and logs as a JSON file. This can be used
              as a backup or to transfer your data.
            </p>
            <Button
              onClick={exportData}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download size={16} className="mr-2" /> Export Data
            </Button>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <h3 className="text-md font-medium mb-1 text-gray-700 dark:text-gray-200">
              Import Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Import habits and logs from a JSON file.{" "}
              <strong className="text-red-500">
                Warning: This will overwrite your current data.
              </strong>
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="import-file-input"
            />
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Upload size={16} className="mr-2" /> Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-1 text-gray-700 dark:text-gray-200">
              Authentication
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Sign out of your account. You'll need to log back in to access
              your data.
            </p>
            <Button
              onClick={async () => {
                try {
                  await logOut();
                  window.location.href = "/login";
                } catch (error) {
                  console.error("Error logging out:", error);
                  alert("Failed to log out. Please try again.");
                }
              }}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add more settings sections as needed */}
    </div>
  );
};

export default SettingsPage;
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">Compact Mode (mobile-friendly)</span>
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
              aria-label="Toggle compact mode"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Daily Insight</span>
            <input
              type="checkbox"
              checked={showInsight}
              onChange={(e) => setShowInsight(e.target.checked)}
              aria-label="Toggle daily insight"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Rewards Panel</span>
            <input
              type="checkbox"
              checked={showRewards}
              onChange={(e) => setShowRewards(e.target.checked)}
              aria-label="Toggle rewards panel"
            />
          </label>
        </CardContent>
      </Card>
