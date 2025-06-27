// src/components/GoogleDriveSettings.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  Settings,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import { googleDriveSync, setupInstructions } from "../utils/googleDriveSync";

export const GoogleDriveSettings = ({ habits, habitLog, onDataRestore }) => {
  const [syncStatus, setSyncStatus] = useState({
    isInitialized: false,
    isSignedIn: false,
    canSync: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    initializeGoogleDrive();
    loadLastBackupTime();
  }, []);

  const initializeGoogleDrive = async () => {
    setIsLoading(true);
    setStatusMessage("Initializing Google Drive...");

    try {
      console.log("Starting Google Drive initialization...");
      console.log("Environment variables:", {
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY ? "SET" : "NOT SET",
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      });

      const result = await googleDriveSync.initialize();
      console.log("Google Drive initialization result:", result);

      if (result.success) {
        setSyncStatus(googleDriveSync.getSyncStatus());
        setStatusMessage(
          result.isSignedIn ? "Connected to Google Drive" : "Ready to connect"
        );
      } else {
        console.error("Google Drive initialization failed:", result.error);
        setStatusMessage("Google Drive setup required");
        setShowSetupInstructions(true);
      }
    } catch (error) {
      console.error("Failed to initialize Google Drive:", error);
      setStatusMessage("Failed to initialize Google Drive");
      setShowSetupInstructions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastBackupTime = () => {
    const stored = localStorage.getItem("lastGoogleDriveBackup");
    if (stored) {
      setLastBackupTime(stored);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage("Signing in to Google Drive...");

    try {
      const result = await googleDriveSync.signIn();
      if (result.success) {
        setSyncStatus(googleDriveSync.getSyncStatus());
        setStatusMessage("Successfully connected to Google Drive");
      } else {
        setStatusMessage(`Sign in failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage("Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setStatusMessage("Signing out...");

    try {
      const result = await googleDriveSync.signOut();
      if (result.success) {
        setSyncStatus(googleDriveSync.getSyncStatus());
        setStatusMessage("Signed out from Google Drive");
      } else {
        setStatusMessage(`Sign out failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage("Sign out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setStatusMessage("Backing up data to Google Drive...");

    try {
      const habitData = { habits, habitLog };
      const result = await googleDriveSync.backupData(habitData);

      if (result.success) {
        const backupTime = result.timestamp;
        setLastBackupTime(backupTime);
        localStorage.setItem("lastGoogleDriveBackup", backupTime);
        setStatusMessage("Data backed up successfully");
      } else {
        setStatusMessage(`Backup failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage("Backup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (
      !confirm(
        "This will replace your current data with the backup from Google Drive. Are you sure?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    setStatusMessage("Restoring data from Google Drive...");

    try {
      const result = await googleDriveSync.restoreData();

      if (result.success) {
        onDataRestore(result.data);
        setStatusMessage(
          `Data restored successfully from ${new Date(
            result.timestamp
          ).toLocaleString()}`
        );
      } else {
        setStatusMessage(`Restore failed: ${result.error}`);
      }
    } catch (error) {
      setStatusMessage("Restore failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastBackupTime = () => {
    if (!lastBackupTime) return "Never";
    const date = new Date(lastBackupTime);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return "Recently";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud
            size={20}
            className={
              syncStatus.isSignedIn ? "text-green-600" : "text-gray-400"
            }
          />
          Google Drive Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {syncStatus.canSync ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <AlertCircle size={16} className="text-orange-500" />
          )}
          <span className="text-sm">
            {statusMessage ||
              (syncStatus.canSync
                ? "Ready for backup/restore"
                : "Setup required")}
          </span>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <div className="font-medium">
              {syncStatus.isSignedIn ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-gray-500">Not connected</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Last Backup:
            </span>
            <div className="font-medium">{formatLastBackupTime()}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!syncStatus.isSignedIn ? (
            <Button
              onClick={handleSignIn}
              disabled={isLoading || !syncStatus.isInitialized}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Cloud size={16} className="mr-2" />
              Connect to Google Drive
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleBackup}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload size={16} className="mr-2" />
                Backup Data
              </Button>
              <Button
                onClick={handleRestore}
                disabled={isLoading}
                variant="outline"
              >
                <Download size={16} className="mr-2" />
                Restore Data
              </Button>
            </div>
          )}

          {syncStatus.isSignedIn && (
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <CloudOff size={16} className="mr-2" />
              Disconnect
            </Button>
          )}
        </div>

        {/* Setup Instructions */}
        {showSetupInstructions && (
          <div className="border-t pt-4">
            <Button
              onClick={() => setShowSetupInstructions(!showSetupInstructions)}
              variant="ghost"
              className="w-full mb-3"
            >
              <Settings size={16} className="mr-2" />
              Setup Instructions
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                {setupInstructions.title}
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {setupInstructions.steps.map((step, index) => (
                  <p key={index}>{step}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auto Backup Info */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Auto Backup</p>
              <p>
                Your data will be automatically backed up to Google Drive once
                daily when you use the app.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
