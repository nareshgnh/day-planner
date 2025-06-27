// src/pages/SettingsPage.jsx
import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { GoogleDriveSettings } from "../components/GoogleDriveSettings";
import { Settings, Upload, Download } from "lucide-react";

const SettingsPage = ({
  habits,
  habitLog,
  exportData,
  importData,
  onDataRestore,
}) => {
  const fileInputRef = useRef(null);

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

      {/* Google Drive Backup Settings */}
      <GoogleDriveSettings
        habits={habits}
        habitLog={habitLog}
        onDataRestore={onDataRestore}
      />

      {/* Add more settings sections as needed */}
    </div>
  );
};

export default SettingsPage;
