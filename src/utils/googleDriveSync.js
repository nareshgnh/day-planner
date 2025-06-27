// src/utils/googleDriveSync.js

/**
 * Google Drive Sync Utility for Habit Tracker
 * This module handles backup and sync of habit data to Google Drive
 */

class GoogleDriveSync {
  constructor() {
    this.isSignedIn = false;
    this.gapi = null;
    this.driveApi = null;
    this.appFolderName = "HabitTrackerBackups";
    this.backupFileName = "habit-data-backup.json";
  }

  /**
   * Initialize Google Drive API
   * Call this once when the app loads
   */
  async initialize() {
    try {
      // Load Google API script
      if (!window.gapi) {
        await this.loadGoogleApiScript();
      }

      await new Promise((resolve, reject) => {
        window.gapi.load("client:auth2", async () => {
          try {
            console.log("Initializing Google API with:", {
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY
                ? "***SET***"
                : "NOT_SET",
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
                ? "***SET***"
                : "NOT_SET",
            });

            // Debug: Log actual values (remove this after testing)
            console.log("DEBUG - Actual env values:", {
              apiKey:
                process.env.REACT_APP_GOOGLE_API_KEY?.substring(0, 10) + "...",
              clientId:
                process.env.REACT_APP_GOOGLE_CLIENT_ID?.substring(0, 10) +
                "...",
              allEnvKeys: Object.keys(process.env).filter((k) =>
                k.startsWith("REACT_APP_")
              ),
            });

            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
              scope: "https://www.googleapis.com/auth/drive.file",
            });

            this.gapi = window.gapi;
            this.driveApi = window.gapi.client.drive;

            // Check if user is already signed in
            const authInstance = this.gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();

            console.log("Google Drive API initialized successfully");
            resolve();
          } catch (error) {
            console.error("Google API init error:", error);
            if (error.error === "idpiframe_initialization_failed") {
              console.error(
                "This usually means the Google Drive API is not enabled or there are CORS issues"
              );
            }
            reject(error);
          }
        });
      });

      return { success: true, isSignedIn: this.isSignedIn };
    } catch (error) {
      console.error("Failed to initialize Google Drive API:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load Google API script dynamically
   */
  loadGoogleApiScript() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in to Google Drive
   */
  async signIn() {
    try {
      if (!this.gapi) {
        throw new Error("Google API not initialized");
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();

      this.isSignedIn = true;
      console.log("Successfully signed in to Google Drive");

      return { success: true };
    } catch (error) {
      console.error("Failed to sign in to Google Drive:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out from Google Drive
   */
  async signOut() {
    try {
      if (!this.gapi) {
        throw new Error("Google API not initialized");
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();

      this.isSignedIn = false;
      console.log("Successfully signed out from Google Drive");

      return { success: true };
    } catch (error) {
      console.error("Failed to sign out from Google Drive:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create or get the app folder in Google Drive
   */
  async getOrCreateAppFolder() {
    try {
      // Search for existing folder
      const searchResponse = await this.driveApi.files.list({
        q: `name='${this.appFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: "drive",
      });

      if (searchResponse.result.files.length > 0) {
        return searchResponse.result.files[0].id;
      }

      // Create folder if it doesn't exist
      const createResponse = await this.driveApi.files.create({
        resource: {
          name: this.appFolderName,
          mimeType: "application/vnd.google-apps.folder",
        },
      });

      return createResponse.result.id;
    } catch (error) {
      console.error("Failed to get or create app folder:", error);
      throw error;
    }
  }

  /**
   * Backup habit data to Google Drive
   */
  async backupData(habitData) {
    try {
      if (!this.isSignedIn) {
        throw new Error("Not signed in to Google Drive");
      }

      const folderId = await this.getOrCreateAppFolder();

      // Prepare backup data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: habitData,
        metadata: {
          totalHabits: habitData.habits?.length || 0,
          totalLogEntries: Object.keys(habitData.habitLog || {}).length,
          lastModified: new Date().toISOString(),
        },
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: "application/json" });

      // Check if backup file already exists
      const existingFiles = await this.driveApi.files.list({
        q: `name='${this.backupFileName}' and parents in '${folderId}' and trashed=false`,
        spaces: "drive",
      });

      let fileResponse;
      if (existingFiles.result.files.length > 0) {
        // Update existing file
        const fileId = existingFiles.result.files[0].id;
        const metadata = {
          name: this.backupFileName,
          parents: [folderId],
        };

        fileResponse = await this.uploadFile(fileId, metadata, blob, true);
      } else {
        // Create new file
        const metadata = {
          name: this.backupFileName,
          parents: [folderId],
        };

        fileResponse = await this.uploadFile(null, metadata, blob, false);
      }

      console.log("Data backed up successfully to Google Drive");
      return {
        success: true,
        fileId: fileResponse.result.id,
        timestamp: backupData.timestamp,
      };
    } catch (error) {
      console.error("Failed to backup data to Google Drive:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore habit data from Google Drive
   */
  async restoreData() {
    try {
      if (!this.isSignedIn) {
        throw new Error("Not signed in to Google Drive");
      }

      const folderId = await this.getOrCreateAppFolder();

      // Find backup file
      const filesResponse = await this.driveApi.files.list({
        q: `name='${this.backupFileName}' and parents in '${folderId}' and trashed=false`,
        spaces: "drive",
      });

      if (filesResponse.result.files.length === 0) {
        return { success: false, error: "No backup file found" };
      }

      const fileId = filesResponse.result.files[0].id;

      // Download file content
      const fileResponse = await this.driveApi.files.get({
        fileId: fileId,
        alt: "media",
      });

      const backupData = JSON.parse(fileResponse.body);

      console.log("Data restored successfully from Google Drive");
      return {
        success: true,
        data: backupData.data,
        metadata: backupData.metadata,
        timestamp: backupData.timestamp,
      };
    } catch (error) {
      console.error("Failed to restore data from Google Drive:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(fileId, metadata, blob, isUpdate) {
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    let body =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      (await blob.text()) +
      close_delim;

    const request = {
      path: isUpdate
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}`
        : "https://www.googleapis.com/upload/drive/v3/files",
      method: isUpdate ? "PATCH" : "POST",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
      body: body,
    };

    return window.gapi.client.request(request);
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isInitialized: !!this.gapi,
      isSignedIn: this.isSignedIn,
      canSync: this.gapi && this.isSignedIn,
    };
  }

  /**
   * Auto backup with frequency control
   */
  async autoBackup(habitData, lastBackupTime = null) {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

      // Skip if backed up within the last 24 hours
      if (lastBackupTime && new Date(lastBackupTime) > oneDayAgo) {
        return { success: true, skipped: true, reason: "Recent backup exists" };
      }

      return await this.backupData(habitData);
    } catch (error) {
      console.error("Auto backup failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const googleDriveSync = new GoogleDriveSync();

// Environment setup instructions
export const setupInstructions = {
  title: "Google Drive Setup Instructions",
  steps: [
    "1. Go to Google Cloud Console (console.cloud.google.com)",
    "2. Create a new project or select existing one",
    "3. Enable the Google Drive API",
    "4. Create credentials (OAuth 2.0 Client ID)",
    "5. Add your domain to authorized origins",
    "6. Add these environment variables:",
    "   REACT_APP_GOOGLE_API_KEY=your_api_key",
    "   REACT_APP_GOOGLE_CLIENT_ID=your_client_id",
    "7. Restart your development server",
  ],
};
