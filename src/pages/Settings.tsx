import { useState, useEffect } from "react";
import { User, Info, Eye, EyeOff, Camera } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import toast from "react-hot-toast";

/**
 * Interface for user profile data structure
 */
interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

/**
 * Settings component with unified interface for Profile and About
 * Provides comprehensive user management and application information
 */
const Settings = () => {
  // Get current authenticated user
  const { user } = useAuth();

  // Profile state management
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility toggle state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password change loading state
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /**
   * Load user profile data from Firebase on component mount
   * Fetches user information from Firestore and Firebase Auth metadata
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Safely handle date creation with fallbacks
            const creationTime = user.metadata.creationTime;
            const lastSignInTime = user.metadata.lastSignInTime;

            setProfile({
              name: userData.name || user.displayName || "",
              email: user.email || "",
              createdAt:
                userData.createdAt?.toDate() ||
                (creationTime ? new Date(creationTime) : new Date()),
              lastLogin:
                userData.lastLogin?.toDate() ||
                (lastSignInTime ? new Date(lastSignInTime) : new Date()),
            });
            setNewName(userData.name || user.displayName || "");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  /**
   * Update user's display name in Firestore
   * Validates input and provides user feedback
   */
  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    try {
      // Update user document in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: newName.trim(),
      });

      // Update local state
      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (error) {
      toast.error("Failed to update name");
      console.error("Error updating name:", error);
    }
  };

  /**
   * Change user password with security validation
   * Requires current password for reauthentication
   */
  const handleChangePassword = async () => {
    // Validate all fields are filled
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // Clear form fields after successful change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully");
    } catch (error: any) {
      // Handle specific authentication errors
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password");
      }
      console.error("Error changing password:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  /**
   * Format date for display in a user-friendly format
   * @param date - Date object to format
   * @returns Formatted date string
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <User size={20} />
              Profile Information
            </h2>
            <div className="space-y-4">
              {/* Editable Full Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                {isEditingName ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input flex-1"
                      placeholder="Enter your full name"
                    />
                    <button
                      onClick={handleUpdateName}
                      className="button-primary px-4"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(profile.name);
                      }}
                      className="button-secondary px-4"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-slate-100">
                      {profile.name || "Not set"}
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Read-only Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  {profile.email}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              {/* Account Creation Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Created
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  {formatDate(profile.createdAt)}
                </span>
              </div>

              {/* Last Login Information */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Login
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  {formatDate(profile.lastLogin)}
                </span>
              </div>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Change Password</h2>
            <div className="space-y-4">
              {/* Current Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input w-full pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input w-full pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input w-full pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </div>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4">Account Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Member Since
                </span>
                <span className="text-sm font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    year: "numeric",
                  }).format(profile.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Last Active
                </span>
                <span className="text-sm font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                  }).format(profile.lastLogin)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Account Status
                </span>
                <span className="text-sm font-medium text-success-600 dark:text-success-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* About AuraOne Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Info size={20} />
              About AuraOne
            </h2>
            <div className="space-y-4">
              {/* Version Information */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Version
                </h3>
                <p>1.2</p>
              </div>

              {/* Creator Information */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Created By
                </h3>
                <p>Dhyan Patel</p>
              </div>

              {/* App Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Description
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AuraOne is a comprehensive productivity platform that combines
                  task management, note-taking, calendar events, and AI-powered
                  assistance to help you stay organized and productive.
                </p>
              </div>

              {/* Feature List */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Features
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Task Management & Organization</li>
                  <li>• Rich Text Note Taking</li>
                  <li>• Calendar & Event Management</li>
                  <li>
                    • <strong>Aura:</strong> AI-Powered Chat Assistant
                  </li>
                  <li>• Dark/Light Theme Support</li>
                  <li>• Responsive Design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
