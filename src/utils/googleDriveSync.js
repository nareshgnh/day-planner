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
    this.tokenClient = null;
    this.appFolderName = "HabitTrackerBackups";
    this.backupFileName = "habit-data-backup.json";
  }

  /**
   * Initialize Google Drive API
   * Call this once when the app loads
   */
  async initialize() {
    try {
      // Load Google API and GIS scripts
      if (!window.gapi || !window.google) {
        await this.loadGoogleApiScript();
      }

      // Initialize GAPI client
      await new Promise((resolve, reject) => {
        window.gapi.load("client", async () => {
          try {
            console.log("Initializing Google API with:", {
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY
                ? "***SET***"
                : "NOT_SET",
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
                ? "***SET***"
                : "NOT_SET",
            });

            // Debug: Log actual values (remove this after testing)
            console.log("DEBUG - Actual env values:", {
              apiKey:
                import.meta.env.VITE_GOOGLE_API_KEY?.substring(0, 10) + "...",
              clientId:
                import.meta.env.VITE_GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
              allEnvKeys: Object.keys(import.meta.env).filter((k) =>
                k.startsWith("VITE_")
              ),
            });

            await window.gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
            });

            this.gapi = window.gapi;
            this.driveApi = window.gapi.client.drive;

            // Initialize Google Identity Services for OAuth
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              scope: "https://www.googleapis.com/auth/drive.file",
              callback: (response) => {
                if (response.error) {
                  console.error("OAuth error:", response.error);
                  return;
                }
                // Store the token and set signed in state
                this.storeAuthToken(response.access_token);
                this.isSignedIn = true;
                console.log("Successfully signed in to Google Drive");
              },
            });

            // Check for existing valid token
            const existingToken = this.getStoredAuthToken();
            if (existingToken) {
              try {
                // Set the token for API calls
                window.gapi.client.setToken({ access_token: existingToken });
                this.isSignedIn = true;
                console.log("Restored existing Google Drive session");

                // Validate the token with a test API call
                setTimeout(async () => {
                  const isValid = await this.validateToken();
                  if (!isValid) {
                    console.log(
                      "Restored token was invalid, requiring re-authentication"
                    );
                  }
                }, 1000);
              } catch (error) {
                console.log(
                  "Existing token invalid, will need to re-authenticate"
                );
                this.clearStoredAuthToken();
              }
            }

            console.log("Google Drive API initialized successfully");
            resolve();
          } catch (error) {
            console.error("Google API init error:", error);
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
      if (window.gapi && window.google) {
        resolve();
        return;
      }

      let scriptsLoaded = 0;
      const totalScripts = 2;

      const checkComplete = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          resolve();
        }
      };

      // Load Google API script
      if (!window.gapi) {
        const gapiScript = document.createElement("script");
        gapiScript.src = "https://apis.google.com/js/api.js";
        gapiScript.onload = checkComplete;
        gapiScript.onerror = reject;
        document.head.appendChild(gapiScript);
      } else {
        checkComplete();
      }

      // Load Google Identity Services script
      if (!window.google) {
        const gisScript = document.createElement("script");
        gisScript.src = "https://accounts.google.com/gsi/client";
        gisScript.onload = checkComplete;
        gisScript.onerror = reject;
        document.head.appendChild(gisScript);
      } else {
        checkComplete();
      }
    });
  }

  /**
   * Sign in to Google Drive
   */
  async signIn() {
    try {
      if (!this.tokenClient) {
        throw new Error("Google API not initialized");
      }

      return new Promise((resolve) => {
        this.tokenClient.callback = (response) => {
          if (response.error) {
            console.error("Failed to sign in to Google Drive:", response.error);
            resolve({ success: false, error: response.error });
            return;
          }

          // Store the token and set signed in state
          this.storeAuthToken(response.access_token);
          this.isSignedIn = true;
          console.log("Successfully signed in to Google Drive");
          resolve({ success: true });
        };

        this.tokenClient.requestAccessToken();
      });
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
      if (window.google && window.google.accounts.oauth2.hasGrantedAnyScope) {
        window.google.accounts.oauth2.revoke();
      }

      // Clear stored token and sign out state
      this.clearStoredAuthToken();
      this.isSignedIn = false;
      console.log("Successfully signed out from Google Drive");

      return { success: true };
    } catch (error) {
      console.error("Failed to sign out from Google Drive:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Store authentication token in localStorage
   */
  storeAuthToken(token) {
    try {
      // Determine if this is a mobile/PWA environment for longer persistence
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");

      // Set longer expiration for mobile/PWA (30 days), shorter for desktop (7 days)
      const expiration =
        isMobile || isPWA
          ? 30 * 24 * 60 * 60 * 1000 // 30 days for mobile/PWA
          : 7 * 24 * 60 * 60 * 1000; // 7 days for desktop

      const tokenData = {
        access_token: token,
        timestamp: Date.now(),
        expires_in: expiration,
        device_type: isMobile ? "mobile" : "desktop",
        is_pwa: isPWA,
        user_agent: navigator.userAgent.substring(0, 100), // Store partial UA for debugging
      };

      localStorage.setItem(
        "google_drive_auth_token",
        JSON.stringify(tokenData)
      );

      // Set token for immediate API calls
      window.gapi.client.setToken({ access_token: token });

      console.log(
        `Google Drive token stored for ${Math.round(
          expiration / (24 * 60 * 60 * 1000)
        )} days (${tokenData.device_type}${isPWA ? " PWA" : ""})`
      );
    } catch (error) {
      console.error("Failed to store auth token:", error);
    }
  }

  /**
   * Get stored authentication token if valid
   */
  getStoredAuthToken() {
    try {
      const tokenData = localStorage.getItem("google_drive_auth_token");
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      const now = Date.now();

      // Calculate how much time is left
      const timeElapsed = now - parsed.timestamp;
      const timeRemaining = parsed.expires_in - timeElapsed;
      const daysRemaining = Math.round(timeRemaining / (24 * 60 * 60 * 1000));

      // Check if token is expired
      if (timeElapsed > parsed.expires_in) {
        console.log(
          `Google Drive token expired (was valid for ${Math.round(
            parsed.expires_in / (24 * 60 * 60 * 1000)
          )} days)`
        );
        this.clearStoredAuthToken();
        return null;
      }

      console.log(
        `Google Drive token valid for ${daysRemaining} more days (${
          parsed.device_type
        }${parsed.is_pwa ? " PWA" : ""})`
      );
      return parsed.access_token;
    } catch (error) {
      console.error("Failed to get stored auth token:", error);
      this.clearStoredAuthToken();
      return null;
    }
  }
  /**
   * Clear stored authentication token
   */
  clearStoredAuthToken() {
    try {
      localStorage.removeItem("google_drive_auth_token");

      // Clear token from API client
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken(null);
      }
    } catch (error) {
      console.error("Failed to clear stored auth token:", error);
    }
  }

  /**
   * Validate current token by making a test API call
   */
  async validateToken() {
    try {
      if (!this.isSignedIn || !this.driveApi) {
        return false;
      }

      // Make a simple API call to test if token is valid
      await this.driveApi.files.list({
        pageSize: 1,
        fields: "files(id, name)",
      });

      return true;
    } catch (error) {
      console.log("Token validation failed, will attempt to refresh");

      // Try to refresh token if validation fails
      const refreshed = await this.attemptTokenRefresh();
      if (refreshed) {
        return true;
      }

      console.log("Token refresh failed, clearing stored token");
      this.clearStoredAuthToken();
      this.isSignedIn = false;
      return false;
    }
  }

  /**
   * Attempt to refresh the token silently
   */
  async attemptTokenRefresh() {
    try {
      if (!this.tokenClient) {
        return false;
      }

      // Try to get a new token silently (won't show popup if user is already authenticated)
      return new Promise((resolve) => {
        this.tokenClient.callback = (response) => {
          if (response.error || !response.access_token) {
            resolve(false);
            return;
          }

          // Store the new token
          this.storeAuthToken(response.access_token);
          this.isSignedIn = true;
          console.log("Successfully refreshed Google Drive token");
          resolve(true);
        };

        // Request token without forcing user interaction
        this.tokenClient.requestAccessToken({ prompt: "" });
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
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
    "   VITE_GOOGLE_API_KEY=your_api_key",
    "   VITE_GOOGLE_CLIENT_ID=your_client_id",
    "7. Restart your development server",
  ],
};
