"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  AtSign,
  Shield,
  Key,
  Calendar,
  Clock,
  Globe,
  Camera,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils/image";
import { AvatarUploadModal } from "./avatar-upload-modal";
import { DeleteAvatarModal } from "./delete-avatar-modal";
import type { UpdateUserRequest } from "@/types";

export interface ProfileViewProps {
  className?: string;
}

export function ProfileView({ className }: ProfileViewProps = {}) {
  const { user, session, device, refreshUser, isLoading: isAuthLoading } = useAuth();
  const toast = useToast();

  const [imageError, setImageError] = useState(false);

  // Avatar Modals
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);
  const [isAvatarDeleteOpen, setIsAvatarDeleteOpen] = useState(false);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Copy State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
    }
  }, [user]);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.info(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedField((prev) => (prev === label ? null : prev));
    }, 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success("Profile re-synchronized with server");
    } catch {
      toast.error("Failed to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isFormDirty =
    user &&
    (formData.name !== (user.name || "") ||
      formData.username !== (user.username || "") ||
      formData.email !== (user.email || "") ||
      formData.phone !== (user.phone || "") ||
      Boolean(formData.password));

  const handleResetForm = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.length > 150) {
      newErrors.name = "Name must not exceed 150 characters.";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uuid) return;

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const payload: UpdateUserRequest = {
        name: formData.name.trim(),
        username: formData.username.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await apiClient.put(`/users/${user.uuid}`, payload);

      toast.success("Profile information updated successfully!");
      await refreshUser();

      // Clear password fields on successful save
      setFormData((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));
    } catch (err: any) {
      const fieldErrors = err?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const formatted: Record<string, string> = {};
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          formatted[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(formatted);
      }

      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update profile. Please verify your information.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (isAuthLoading && !user) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 inline-block mb-3">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          User Profile Not Found
        </h2>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          Unable to retrieve authenticated session details. Please sign in again.
        </p>
        <Button size="sm" onClick={() => void refreshUser()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const firstRole = user.roles?.[0];
  const userRole =
    typeof firstRole === "string"
      ? firstRole
      : firstRole?.name || firstRole?.code || "System User";
  const userInitials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const avatarSrc = getAvatarUrl(user.avatar_url, user.avatar);

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  return (
    <div className={className || "p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"}>
      {/* Header Banner & Profile Summary */}
      <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute right-4 top-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleManualRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              className="bg-white/90 hover:bg-white text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-100"
            >
              Sync Profile
            </Button>
          </div>
        </div>

        <CardContent className="pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14 mb-4">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl select-none">
                {avatarSrc && !imageError ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>

              {/* Quick Action Overlay */}
              <button
                type="button"
                onClick={() => setIsAvatarUploadOpen(true)}
                className="absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
                aria-label="Upload new avatar"
              >
                <Camera className="h-6 w-6 mb-1" />
                <span>Change</span>
              </button>

              {/* Status Indicator */}
              <div
                title={`Account Status: ${user.status}`}
                className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900 ${user.status === "active"
                  ? "bg-emerald-500"
                  : user.status === "inactive"
                    ? "bg-amber-500"
                    : "bg-red-500"
                  }`}
              />
            </div>

            {/* Profile Info Header */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h1>
                <Badge
                  variant={user.status === "active" ? "success" : "warning"}
                  size="sm"
                  className="capitalize"
                >
                  {user.status}
                </Badge>
                <Badge variant="primary" size="sm">
                  {userRole}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                {user.username && (
                  <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <AtSign className="h-3.5 w-3.5 text-zinc-400" />
                    {user.username}
                  </span>
                )}
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Avatar Action Buttons */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarUploadOpen(true)}
                leftIcon={<Camera className="h-3.5 w-3.5" />}
              >
                Upload Photo
              </Button>
              {avatarSrc && !imageError && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAvatarDeleteOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label="Remove avatar"
                  title="Remove avatar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Edit Form (Left) & Metadata / Session (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Edit Personal Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Personal Information</CardTitle>
              <CardDescription>
                Update your account display name, contact email, phone number, or password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    id="profile-name"
                    label="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    error={errors.name}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                    placeholder="e.g. John Doe"
                  />

                  <TextInput
                    id="profile-username"
                    label="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    error={errors.username}
                    leftIcon={<AtSign className="h-4 w-4" />}
                    placeholder="e.g. jdoe"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    id="profile-email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    error={errors.email}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder="name@company.com"
                    helperText={
                      user.email_verified_at
                        ? "Verified email address"
                        : "Unverified email"
                    }
                  />

                  <TextInput
                    id="profile-phone"
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    error={errors.phone}
                    leftIcon={<Phone className="h-4 w-4" />}
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                {/* Password Change Section */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                    Change Password (Optional)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Leave blank if you do not wish to modify your account password.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                      id="profile-new-password"
                      type={showPassword ? "text" : "password"}
                      label="New Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      error={errors.password}
                      leftIcon={<Key className="h-4 w-4" />}
                      placeholder="Minimum 8 characters"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />

                    <TextInput
                      id="profile-confirm-password"
                      type={showPassword ? "text" : "password"}
                      label="Confirm New Password"
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirmation: e.target.value,
                        })
                      }
                      error={errors.password_confirmation}
                      leftIcon={<Key className="h-4 w-4" />}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetForm}
                    disabled={!isFormDirty || isSaving}
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Reset Changes
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!isFormDirty || isSaving}
                    isLoading={isSaving}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Account Metadata, Active Session & Security */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account Metadata</CardTitle>
              <CardDescription>
                System identifiers and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {/* UUID */}
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block mb-1">
                  User UUID
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                  <span className="truncate mr-2">{user.uuid}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.uuid, "UUID")}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0"
                    title="Copy UUID"
                  >
                    {copiedField === "UUID" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email Verified */}
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email Status
                </span>
                <Badge
                  variant={user.email_verified_at ? "success" : "warning"}
                  size="sm"
                >
                  {user.email_verified_at ? "Verified" : "Unverified"}
                </Badge>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Member Since
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(user.created_at)}
                </span>
              </div>

              {/* Last Login */}
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Last Login
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">
                  {formatDate(user.last_login_at)}
                </span>
              </div>

              {/* Last IP */}
              {user.last_login_ip && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Last Login IP
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {user.last_login_ip}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Active Session & Device */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Current Session & Device</CardTitle>
                <Badge variant="primary" size="sm">
                  Active Now
                </Badge>
              </div>
              <CardDescription>
                Telemetry verified via <code className="text-[11px] font-mono">GET /auth/me</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                  {device?.device_type === "mobile" ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <Laptop className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {device?.device_name || "Current Web Browser"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Platform: {device?.platform || "Web Desktop"}
                  </p>
                  {device?.is_trusted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      <ShieldCheck className="h-3 w-3" /> Trusted Device
                    </span>
                  )}
                </div>
              </div>

              {session && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Session Expires</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {formatDate(session.expires_at)}
                    </span>
                  </div>
                  {session.last_activity_at && (
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Last Activity</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {formatDate(session.last_activity_at)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Roles & Permissions */}
          {user.roles && user.roles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assigned Roles & Access</CardTitle>
                <CardDescription>
                  RBAC roles bound to this profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((role, idx) => {
                    const roleName =
                      typeof role === "string"
                        ? role
                        : role?.name || role?.code || `Role ${idx + 1}`;
                    const roleKey =
                      typeof role === "string"
                        ? `role-${role}-${idx}`
                        : role?.uuid || role?.code || role?.id || `role-${idx}`;

                    return (
                      <Badge
                        key={roleKey}
                        variant="neutral"
                        size="sm"
                        className="font-medium capitalize"
                      >
                        <Shield className="h-3 w-3 mr-1 text-blue-500" />
                        {roleName}
                      </Badge>
                    );
                  })}
                </div>

                {(() => {
                  const permissions =
                    user.permissions ||
                    (typeof user.roles?.[0] !== "string"
                      ? user.roles?.[0]?.permissions
                      : []) ||
                    [];

                  if (!permissions || permissions.length === 0) return null;

                  return (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
                        Role Permissions ({permissions.length})
                      </p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {permissions.slice(0, 10).map((perm: any, idx: number) => {
                          const permCode =
                            typeof perm === "string"
                              ? perm
                              : perm?.code || perm?.name || `perm-${idx}`;
                          const permKey =
                            typeof perm === "string"
                              ? `perm-${perm}-${idx}`
                              : perm?.uuid || perm?.code || perm?.id || `perm-${idx}`;

                          return (
                            <span
                              key={permKey}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              {permCode}
                            </span>
                          );
                        })}
                        {permissions.length > 10 && (
                          <span className="text-[10px] text-zinc-400 font-mono px-1 py-0.5">
                            +{permissions.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Avatar Modals */}
      <AvatarUploadModal
        isOpen={isAvatarUploadOpen}
        onClose={() => setIsAvatarUploadOpen(false)}
        user={user}
        onSuccess={refreshUser}
      />

      <DeleteAvatarModal
        isOpen={isAvatarDeleteOpen}
        onClose={() => setIsAvatarDeleteOpen(false)}
        user={user}
        onSuccess={refreshUser}
      />
    </div>
  );
}
