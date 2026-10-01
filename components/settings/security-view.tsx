'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Key,
  ShieldCheck,
  Phone,
  Mail,
  Wrench,
  Activity,
  Ban,
  Trash2,
  CheckCircle2,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  RefreshCw,
  Send,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { useSecurityStore } from '@/stores';
import type { UserSession, UserDevice } from '@/types';

export function SecurityView() {
  const { user, logout, refreshUser, updateCurrentUser } = useAuth();
  const toast = useToast();


  const {
    devices,
    sessions,
    loginAttempts,
    twoFactorEnabled,
    googleAuthEnabled,
    phoneVerified,
    emailVerified,
    isEmailVerified,
    emailVerifiedAt,
    isSendingVerificationEmail,
    isCheckingEmailStatus,
    lastPasswordChange,
    isUpdatingDevice,
    isPurgingRevoked,
    isSavingPassword,
    isPasswordModalOpen,
    isDeviceModalOpen,
    isActivityModalOpen,
    isDeactivateModalOpen,
    isDeleteModalOpen,
    isPhoneModalOpen,
    isEmailModalOpen,
    setTwoFactorEnabled,
    setGoogleAuthEnabled,
    setPhoneVerified,
    setEmailVerified,
    setIsEmailVerified,
    setEmailVerifiedAt,
    setIsPasswordModalOpen,

    setIsDeviceModalOpen,
    setIsActivityModalOpen,
    setIsDeactivateModalOpen,
    setIsDeleteModalOpen,
    setIsPhoneModalOpen,
    setIsEmailModalOpen,
    openDevicesModal,
    openActivityModal,
    fetchDevices,
    blockDevice,
    unblockDevice,
    revokeSession,
    purgeRevokedSessions,
    changePassword,
    sendEmailVerification,
    resendEmailVerification,
    checkEmailVerificationStatus,
    pendingEmail,
    cancelEmailChange,
    resendEmailChange,
    changeEmail,
  } = useSecurityStore();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone / Email form state
  const [tempPhone, setTempPhone] = useState(phoneVerified);
  const [tempEmail, setTempEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [showEmailChangePassword, setShowEmailChangePassword] = useState(false);
  const [isCancellingEmailChange, setIsCancellingEmailChange] = useState(false);

  // Synchronize user prop
  useEffect(() => {
    // Only synchronize initial email if not currently in an unverified change flow
    if (user?.email && user.email !== emailVerified && isEmailVerified) {
      setEmailVerified(user.email);
    }
    if (user?.phone && user.phone !== phoneVerified) {
      setPhoneVerified(user.phone);
    }
    // Only take email_verified_at if user.email matches our currently displayed email
    if (user && user.email === emailVerified) {
      setIsEmailVerified(Boolean(user.email_verified_at));
      setEmailVerifiedAt(user.email_verified_at || null);
    }
  }, [user?.email, user?.phone, user?.email_verified_at, emailVerified, phoneVerified, isEmailVerified, setEmailVerified, setPhoneVerified, setIsEmailVerified, setEmailVerifiedAt]);

  // Open modals with store triggers
  const handleOpenDevices = () => {
    openDevicesModal();
  };

  const handleOpenActivity = () => {
    openActivityModal();
  };

  const handleOpenChangeEmail = () => {
    setTempEmail('');
    setEmailChangePassword('');
    setShowEmailChangePassword(false);
    setIsEmailModalOpen(true);
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = tempEmail.trim();

    if (!cleanEmail) {
      toast.error('New email address is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (cleanEmail.toLowerCase() === (user?.email || emailVerified).toLowerCase()) {
      toast.info('The new email address cannot be the same as your current email.');
      return;
    }

    if (!emailChangePassword) {
      toast.error('Current password is required to request an email change.');
      return;
    }

    try {
      const res = await changeEmail(cleanEmail, emailChangePassword);
      setEmailChangePassword('');
      setIsEmailModalOpen(false);

      toast.success(
        res.message || `Verification link sent to ${cleanEmail}. Please verify within 15 minutes.`
      );
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to request email change.';
      toast.error(msg);
    }
  };

  const handleResendPendingEmail = async () => {
    try {
      const res = await resendEmailChange();
      toast.success(res.message || 'Verification link resent to your new email.');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to resend verification link.';
      toast.error(msg);
    }
  };

  const handleCancelPendingEmail = async () => {
    if (!confirm('Are you sure you want to cancel the pending email change?')) {
      return;
    }
    setIsCancellingEmailChange(true);
    try {
      await cancelEmailChange();
      toast.success('Pending email change cancelled successfully.');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to cancel email change.';
      toast.error(msg);
    } finally {
      setIsCancellingEmailChange(false);
    }
  };


  // Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});


    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.current_password = 'Current password is required.';
    }

    if (!newPassword) {
      newErrors.password = 'New password is required.';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      newErrors.password_confirmation = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      newErrors.password_confirmation = 'New passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err: any) {
      const fieldErrors = err?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const formatted: Record<string, string> = {};
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          formatted[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setPasswordErrors(formatted);
      }

      const msg =
        err?.data?.message ||
        err?.message ||
        'Failed to update password. Please check your credentials.';
      toast.error(msg);
    }
  };

  // Device Block / Unblock Actions
  const handleUnblockDevice = async (device: UserDevice) => {
    try {
      await unblockDevice(device);
      toast.success(`Device "${device.device_name || 'Terminal'}" unblocked successfully.`);
    } catch {
      toast.error('Failed to unblock device.');
    }
  };

  const handleBlockDevice = async (device: UserDevice) => {
    try {
      await blockDevice(device);
      toast.success(`Device "${device.device_name || 'Terminal'}" blocked.`);
    } catch {
      toast.error('Failed to block device.');
    }
  };

  const handlePurgeRevoked = async () => {
    try {
      await purgeRevokedSessions();
      toast.success('Revoked sessions purged successfully.');
    } catch {
      toast.error('Failed to purge revoked sessions.');
    }
  };

  const handleRevokeSession = async (session: UserSession) => {
    try {
      await revokeSession(session, logout);
      toast.success('Session revoked.');
    } catch {
      toast.error('Failed to revoke session.');
    }
  };

  const handleSendVerification = async () => {
    try {
      const res = await sendEmailVerification(emailVerified);
      toast.success(res.message || 'Verification link sent successfully. Please check your email.');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to send verification link.';
      toast.error(msg);
    }
  };

  const handleCheckEmailStatus = async () => {
    try {
      const res = await checkEmailVerificationStatus();
      if (res.is_verified) {
        toast.success('Email address is verified.');
      } else {
        toast.info('Email address is not yet verified. Please check your inbox for the 15-minute verification link.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to check verification status.');
    }
  };

  const getDeviceIcon = (type?: string | null) => {

    const t = (type || '').toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <Smartphone className="h-4 w-4" />;
    if (t.includes('tablet') || t.includes('ipad')) return <Tablet className="h-4 w-4" />;
    if (t.includes('pos') || t.includes('terminal')) return <Monitor className="h-4 w-4" />;
    return <Laptop className="h-4 w-4" />;
  };


  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Top Header matching reference */}
      <div className="py-4 px-6 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Security
        </h2>
      </div>

      {/* Security Rows Container */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
        {/* 1. Password */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Password</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Last Changed {lastPasswordChange}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Change Password
          </button>
        </div>

        {/* 2. Two Factor Authentication */}
        <div className="py-4 px-6 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Two Factor Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Receive codes via SMS or email every time you login
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={twoFactorEnabled}
            onClick={() => {
              const next = !twoFactorEnabled;
              setTwoFactorEnabled(next);
              toast.success(`Two Factor Authentication ${next ? 'enabled' : 'disabled'}`);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              twoFactorEnabled ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Google Authentication */}
        <div className="py-4 px-6 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
              {/* Google G Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.98h5.36c-.24 1.4-1.34 3.23-5.36 3.23c-3.23 0-5.87-2.67-5.87-5.91s2.64-5.91 5.87-5.91c1.84 0 3.07.79 3.77 1.46l2.36-2.28C21.84 3.26 19.46 2.4 16.5 2.4C10.7 2.4 6 7.1 6 12.9s4.7 10.5 10.5 10.5c6.06 0 10.08-4.26 10.08-10.25c0-.69-.07-1.37-.23-2.05z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Google Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Connect to Google
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md border border-[#10B981]/40 bg-emerald-50 dark:bg-emerald-950/30 text-[#10B981]">
              Connected
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={googleAuthEnabled}
              onClick={() => {
                const next = !googleAuthEnabled;
                setGoogleAuthEnabled(next);
                toast.success(`Google Authentication ${next ? 'enabled' : 'disconnected'}`);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                googleAuthEnabled ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  googleAuthEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Phone Number Verification */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Phone Number Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <span>Verified Mobile Number : {phoneVerified}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] inline shrink-0" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setTempPhone(phoneVerified);
                setIsPhoneModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Change
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to unlink your verified phone number?')) {
                  setPhoneVerified('Not configured');
                  toast.info('Phone number unlinked.');
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-[#0E1B2E] hover:bg-[#1c2c44] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>

        {/* 5. Email Verification */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                  Email Verification
                </h3>
                {isEmailVerified ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[#10B981]/40 bg-emerald-50 dark:bg-emerald-950/30 text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> Unverified
                  </span>
                )}
                {pendingEmail && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-sky-300 dark:border-sky-700/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-500" /> Change Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{isEmailVerified ? 'Verified Email' : 'Email Address'} : <strong className="font-semibold text-slate-800 dark:text-zinc-200">{emailVerified}</strong></span>
                {isEmailVerified ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981] inline shrink-0" />
                    {emailVerifiedAt
                      ? `(Verified ${new Date(emailVerifiedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })})`
                      : '(Verified)'}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    (Pending verification — 15-min signed link)
                  </span>
                )}
              </p>
              {pendingEmail && (
                <div className="mt-1.5 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5 flex-wrap bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-md px-2.5 py-1">
                  <span>Pending new email: <strong className="font-semibold">{pendingEmail}</strong> (15-min verification link sent)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {pendingEmail ? (
              <>
                <button
                  onClick={handleResendPendingEmail}
                  disabled={isSendingVerificationEmail}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Resend 15-minute verification link to pending email"
                >
                  {isSendingVerificationEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Resend Link
                </button>
                <button
                  onClick={handleCancelPendingEmail}
                  disabled={isCancellingEmailChange}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Cancel pending email change request"
                >
                  {isCancellingEmailChange ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Cancel Change
                </button>
              </>
            ) : !isEmailVerified ? (
              <button
                onClick={handleSendVerification}
                disabled={isSendingVerificationEmail}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Send a 15-minute email verification link"
              >
                {isSendingVerificationEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Link
              </button>
            ) : null}

            <button
              onClick={handleCheckEmailStatus}
              disabled={isCheckingEmailStatus}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
              title="Refresh verification status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingEmailStatus ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenChangeEmail}
              className="px-4 py-1.5 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Change
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to remove this secondary email?')) {
                  setEmailVerified(user?.email || 'unassigned@smartpos.local');
                  setIsEmailVerified(Boolean(user?.email_verified_at));
                  toast.info('Secondary email removed.');
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-[#0E1B2E] hover:bg-[#1c2c44] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>


        {/* 6. Device Management */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Device Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage devices associated with the account
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenDevices}
            className="self-start sm:self-auto px-5 py-1.5 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Manage
          </button>
        </div>

        {/* 7. Account Activity */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Account Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage activities associated with the account
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenActivity}
            className="self-start sm:self-auto px-5 py-1.5 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            View
          </button>
        </div>

        {/* 8. Deactivate Account */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Deactivate Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl">
                This will shutdown your account. Your account will be reactive when you sign in again
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDeactivateModalOpen(true)}
            className="self-start sm:self-auto px-4 py-1.5 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Deactivate
          </button>
        </div>

        {/* 9. Delete Account */}
        <div className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Delete Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Your account will be permanently deleted
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="self-start sm:self-auto px-5 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODALS
          ==================================================================== */}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setPasswordErrors({});
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          title="Change Account Password"
          description="Update your password to maintain rigorous account security."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <TextInput
              id="security-current-password"
              type={showCurrentPassword ? "text" : "password"}
              label="Current Password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (passwordErrors.current_password) {
                  setPasswordErrors((prev) => ({ ...prev, current_password: "" }));
                }
              }}
              error={passwordErrors.current_password}
              leftIcon={<Key className="h-4 w-4" />}
              placeholder="••••••••"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end -mt-2">
              <Link
                href={user?.email ? `/auth/forgot-password?email=${encodeURIComponent(user.email)}` : "/auth/forgot-password"}
                className="text-xs font-medium text-[#F26522] hover:underline transition-colors"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Forgot your password?
              </Link>
            </div>

            <TextInput
              id="security-new-password"
              type={showNewPassword ? "text" : "password"}
              label="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordErrors.password) {
                  setPasswordErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              error={passwordErrors.password}
              leftIcon={<Key className="h-4 w-4" />}
              placeholder="Minimum 8 characters"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <TextInput
              id="security-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordErrors.password_confirmation) {
                  setPasswordErrors((prev) => ({ ...prev, password_confirmation: "" }));
                }
              }}
              error={passwordErrors.password_confirmation}
              leftIcon={<Key className="h-4 w-4" />}
              placeholder="Re-type new password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordErrors({});
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPassword ? 'Updating...' : 'Save Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Device Management Modal */}
      {isDeviceModalOpen && (
        <Modal
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          title="Device Management & Active Sessions"
          description="View authorized POS hardware, active browser sessions, and unblock devices."
          size="xl"
        >
          <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Registered Hardware Terminals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                  Hardware Devices ({devices.length})
                </h4>
                <button
                  onClick={fetchDevices}
                  className="text-xs text-[#F26522] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.uuid}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-xs text-slate-600 dark:text-slate-200">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                          {device.device_name || 'POS Terminal'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Status:{' '}
                          {device.is_blocked ? (
                            <span className="text-red-500 font-semibold">Blocked</span>
                          ) : device.is_trusted ? (
                            <span className="text-emerald-600 font-semibold">Trusted Hardware</span>
                          ) : (
                            <span>Standard</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {device.is_blocked ? (
                        <button
                          onClick={() => handleUnblockDevice(device)}
                          disabled={isUpdatingDevice}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockDevice(device)}
                          disabled={isUpdatingDevice}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions & Purge Tool */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                  Active Web & POS Sessions ({sessions.length})
                </h4>
                <button
                  onClick={handlePurgeRevoked}
                  disabled={isPurgingRevoked}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Purge Revoked
                </button>
              </div>

              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No other sessions found.</p>
                ) : (
                  sessions.slice(0, 5).map((sess) => (
                    <div
                      key={sess.uuid}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                          <span>{sess.ip_address || '127.0.0.1'}</span>
                          {sess.is_current && (
                            <Badge variant="primary" size="sm">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Started: {sess.created_at ? new Date(sess.created_at).toLocaleString() : 'Recently'}
                        </div>
                      </div>

                      {!sess.is_current && (
                        <button
                          onClick={() => handleRevokeSession(sess)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Activity Audit Modal */}
      {isActivityModalOpen && (
        <Modal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          title="Account Login Activity & Audit Logs"
          description="Review security sign-in events, IP origins, and credential attempts."
          size="lg"
        >
          <div className="pt-2 max-h-[60vh] overflow-y-auto space-y-2">
            {loginAttempts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No login anomalies recorded recently.
              </div>
            ) : (
              loginAttempts.slice(0, 15).map((att, i) => (
                <div
                  key={att.id || i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-100">
                      {att.identifier || user?.email}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      IP: {att.ip_address || '127.0.0.1'} • {att.attempted_at || att.created_at ? new Date(att.attempted_at || att.created_at || '').toLocaleString() : 'Recently'}
                    </p>
                  </div>
                  <Badge variant={att.is_successful ? 'success' : 'danger'} size="sm">
                    {att.is_successful ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Change Phone Modal */}
      {isPhoneModalOpen && (
        <Modal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          title="Update Verified Phone Number"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="+81699799974"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPhoneModalOpen(false)}>
                Cancel
              </Button>
              <button
                onClick={() => {
                  setPhoneVerified(tempPhone);
                  setIsPhoneModalOpen(false);
                  toast.success('Verified mobile number updated.');
                }}
                className="px-4 py-2 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs"
              >
                Save Phone
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Email Modal */}
      {isEmailModalOpen && (
        <Modal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title="Update Email Address"
          description="Enter your new email address and current password. A 15-minute verification link will be sent to confirm ownership."
        >
          <form onSubmit={handleChangeEmailSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                For security verification, your current password is required. A 15-minute verification link will be sent to the new email address before it replaces your current email.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                New Email Address
              </label>
              <input
                type="email"
                required
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="new.email@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26522]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showEmailChangePassword ? "text" : "password"}
                  required
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26522]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailChangePassword(!showEmailChangePassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  {showEmailChangePassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                Required by the identity service to verify identity prior to issuing verification link.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={isSendingVerificationEmail}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSendingVerificationEmail}
                className="px-5 py-2 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingVerificationEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isSendingVerificationEmail ? 'Sending...' : 'Update & Send Verification'}
              </button>
            </div>
          </form>
        </Modal>
      )}



      {/* Deactivate Account Modal */}
      {isDeactivateModalOpen && (
        <Modal
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          title="Deactivate Account"
        >
          <div className="space-y-4 pt-2 text-xs text-slate-600 dark:text-zinc-300">
            <p>
              Are you sure you want to deactivate your account? Your POS terminals and active sessions will be signed out. You can reactivate anytime by logging in with your credentials.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDeactivateModalOpen(false)}>
                Cancel
              </Button>
              <button
                onClick={async () => {
                  setIsDeactivateModalOpen(false);
                  toast.warning('Account deactivated. Signing out...');
                  await logout();
                }}
                className="px-4 py-2 rounded-lg bg-[#F26522] hover:bg-[#d9531e] text-white text-xs font-semibold shadow-xs"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Account Permanently"
        >
          <div className="space-y-4 pt-2 text-xs text-slate-600 dark:text-zinc-300">
            <p className="text-red-600 font-semibold">
              Warning: This action is permanent and cannot be undone. All your business records, user assignments, and personal credentials will be wiped.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <button
                onClick={async () => {
                  setIsDeleteModalOpen(false);
                  toast.error('Account deletion requested.');
                  await logout();
                }}
                className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#dc2626] text-white text-xs font-semibold shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
