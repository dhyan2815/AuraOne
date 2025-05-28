import { useState } from "react";
import { Save, RefreshCw, Info } from "lucide-react";

const Settings = () => {
  // Appearance settings
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState("grid");

  // Notification settings
  const [enableEmailNotifications, setEnableEmailNotifications] =
    useState(true);
  const [enablePushNotifications, setEnablePushNotifications] = useState(false);

  // Data settings
  const [syncFrequency, setSyncFrequency] = useState("realtime");

  const handleSaveSettings = () => {
    // Here you would save the settings to your backend
    console.log("Saving settings:", {
      sidebarCollapsed,
      dashboardLayout,
      enableEmailNotifications,
      enablePushNotifications,
      syncFrequency,
    });
  };

  const handleResetSettings = () => {
    // Reset all settings to default values
    setSidebarCollapsed(false);
    setDashboardLayout("grid");
    setEnableEmailNotifications(true);
    setEnablePushNotifications(false);
    setSyncFrequency("realtime");
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sidebar Display
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!sidebarCollapsed}
                      onChange={() => setSidebarCollapsed(false)}
                      className="mr-2"
                    />
                    <span>Expanded</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={sidebarCollapsed}
                      onChange={() => setSidebarCollapsed(true)}
                      className="mr-2"
                    />
                    <span>Collapsed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dashboard Layout
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={dashboardLayout === "grid"}
                      onChange={() => setDashboardLayout("grid")}
                      className="mr-2"
                    />
                    <span>Grid</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={dashboardLayout === "list"}
                      onChange={() => setDashboardLayout("list")}
                      className="mr-2"
                    />
                    <span>List</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Notifications</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Email Notifications</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive reminders and updates via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableEmailNotifications}
                    onChange={() =>
                      setEnableEmailNotifications(!enableEmailNotifications)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Push Notifications</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive browser notifications for important events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePushNotifications}
                    onChange={() =>
                      setEnablePushNotifications(!enablePushNotifications)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Data & Sync</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sync Frequency
              </label>
              <select
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="input w-full"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual</option>
              </select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose how often to sync data between devices
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Actions</h2>

            <div className="space-y-4">
              <button
                onClick={handleSaveSettings}
                className="button-primary w-full"
              >
                <Save size={18} className="mr-2" />
                Save Settings
              </button>

              <button
                onClick={handleResetSettings}
                className="button-secondary w-full"
              >
                <RefreshCw size={18} className="mr-2" />
                Reset to Defaults
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6 mt-6">
            <h2 className="text-xl font-medium mb-4">About</h2>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Version
                </h3>
                <p>1.3.2</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Created By
                </h3>
                <p>Dhyan Patel</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Last Updated
                </h3>
                <p>28th May 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
