import { create } from "zustand";
import type {
  UserDevice,
  UserSession,
  LoginAttempt,
  ChangePasswordRequest,
  DeactivateAccountRequest,
  SendEmailVerificationResponse,
  VerifyEmailResponse,
  EmailVerificationStatusResponse,
} from "@/types";
import { securityApi, DEFAULT_DEMO_DEVICES } from "@/lib/api/security";
import { apiClient } from "@/lib/api/client";


export interface SecurityState {
  // Telemetry data
  devices: UserDevice[];
  sessions: UserSession[];
  loginAttempts: LoginAttempt[];

  // Settings toggles & state
  twoFactorEnabled: boolean;
  googleAuthEnabled: boolean;
  phoneVerified: string;
  emailVerified: string;
  pendingEmail: string | null;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  lastPasswordChange: string;

  // Email verification operational state
  isSendingVerificationEmail: boolean;
  isCheckingEmailStatus: boolean;
  verificationSentInfo: SendEmailVerificationResponse | null;

  // Loading states
  isDevicesLoading: boolean;
  isSessionsLoading: boolean;
  isAttemptsLoading: boolean;
  isUpdatingDevice: boolean;
  isRevokingSession: boolean;
  isPurgingRevoked: boolean;
  isSavingPassword: boolean;
  error: string | null;

  // Modal visibility states
  isPasswordModalOpen: boolean;
  isDeviceModalOpen: boolean;
  isActivityModalOpen: boolean;
  isDeactivateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isPhoneModalOpen: boolean;
  isEmailModalOpen: boolean;

  // Setters
  setDevices: (devices: UserDevice[]) => void;
  setSessions: (sessions: UserSession[]) => void;
  setLoginAttempts: (loginAttempts: LoginAttempt[]) => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
  setGoogleAuthEnabled: (enabled: boolean) => void;
  setPhoneVerified: (phone: string) => void;
  setEmailVerified: (email: string) => void;
  setIsEmailVerified: (isVerified: boolean) => void;
  setEmailVerifiedAt: (verifiedAt: string | null) => void;
  setLastPasswordChange: (formattedDate: string) => void;
  setError: (error: string | null) => void;

  // Modal toggles
  setIsPasswordModalOpen: (open: boolean) => void;
  setIsDeviceModalOpen: (open: boolean) => void;
  setIsActivityModalOpen: (open: boolean) => void;
  setIsDeactivateModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setIsPhoneModalOpen: (open: boolean) => void;
  setIsEmailModalOpen: (open: boolean) => void;

  openDevicesModal: () => Promise<void>;
  openActivityModal: () => Promise<void>;

  // Async actions
  fetchDevices: () => Promise<UserDevice[]>;
  fetchSessions: () => Promise<UserSession[]>;
  fetchLoginAttempts: () => Promise<LoginAttempt[]>;
  blockDevice: (device: UserDevice) => Promise<void>;
  unblockDevice: (device: UserDevice) => Promise<void>;
  revokeSession: (session: UserSession, onLogout?: () => Promise<void>) => Promise<void>;
  purgeRevokedSessions: () => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  deactivateAccount: (payload?: DeactivateAccountRequest) => Promise<void>;

  // Email verification actions
  sendEmailVerification: (email: string) => Promise<SendEmailVerificationResponse>;
  resendEmailVerification: () => Promise<SendEmailVerificationResponse>;
  verifyEmail: (id: string | number, hash: string) => Promise<VerifyEmailResponse>;
  checkEmailVerificationStatus: () => Promise<EmailVerificationStatusResponse>;
  cancelEmailChange: () => Promise<void>;
  resendEmailChange: () => Promise<SendEmailVerificationResponse>;
  changeEmail: (
    newEmail: string,
    password: string
  ) => Promise<SendEmailVerificationResponse>;
}




export const useSecurityStore = create<SecurityState>((set, get) => ({
  devices: [],
  sessions: [],
  loginAttempts: [],

  twoFactorEnabled: true,
  googleAuthEnabled: true,
  phoneVerified: "+81699799974",
  emailVerified: "info@example.com",
  pendingEmail: null,
  isEmailVerified: true,
  emailVerifiedAt: null,
  isSendingVerificationEmail: false,
  isCheckingEmailStatus: false,
  verificationSentInfo: null,
  lastPasswordChange: "22 Dec 2024, 10:30 AM",

  isDevicesLoading: false,
  isSessionsLoading: false,
  isAttemptsLoading: false,
  isUpdatingDevice: false,
  isRevokingSession: false,
  isPurgingRevoked: false,
  isSavingPassword: false,
  error: null,

  isPasswordModalOpen: false,
  isDeviceModalOpen: false,
  isActivityModalOpen: false,
  isDeactivateModalOpen: false,
  isDeleteModalOpen: false,
  isPhoneModalOpen: false,
  isEmailModalOpen: false,

  setDevices: (devices) => set({ devices }),
  setSessions: (sessions) => set({ sessions }),
  setLoginAttempts: (loginAttempts) => set({ loginAttempts }),
  setTwoFactorEnabled: (twoFactorEnabled) =>
    set((state) => (state.twoFactorEnabled === twoFactorEnabled ? state : { twoFactorEnabled })),
  setGoogleAuthEnabled: (googleAuthEnabled) =>
    set((state) => (state.googleAuthEnabled === googleAuthEnabled ? state : { googleAuthEnabled })),
  setPhoneVerified: (phoneVerified) =>
    set((state) => (state.phoneVerified === phoneVerified ? state : { phoneVerified })),
  setEmailVerified: (emailVerified) =>
    set((state) => (state.emailVerified === emailVerified ? state : { emailVerified })),
  setIsEmailVerified: (isEmailVerified) =>
    set((state) => (state.isEmailVerified === isEmailVerified ? state : { isEmailVerified })),
  setEmailVerifiedAt: (emailVerifiedAt) =>
    set((state) => (state.emailVerifiedAt === emailVerifiedAt ? state : { emailVerifiedAt })),
  setLastPasswordChange: (lastPasswordChange) =>
    set((state) => (state.lastPasswordChange === lastPasswordChange ? state : { lastPasswordChange })),
  setError: (error) => set({ error }),



  setIsPasswordModalOpen: (isPasswordModalOpen) => set({ isPasswordModalOpen }),
  setIsDeviceModalOpen: (isDeviceModalOpen) => set({ isDeviceModalOpen }),
  setIsActivityModalOpen: (isActivityModalOpen) => set({ isActivityModalOpen }),
  setIsDeactivateModalOpen: (isDeactivateModalOpen) => set({ isDeactivateModalOpen }),
  setIsDeleteModalOpen: (isDeleteModalOpen) => set({ isDeleteModalOpen }),
  setIsPhoneModalOpen: (isPhoneModalOpen) => set({ isPhoneModalOpen }),
  setIsEmailModalOpen: (isEmailModalOpen) => set({ isEmailModalOpen }),

  openDevicesModal: async () => {
    set({ isDeviceModalOpen: true });
    await Promise.all([get().fetchDevices(), get().fetchSessions()]);
  },

  openActivityModal: async () => {
    set({ isActivityModalOpen: true });
    await get().fetchLoginAttempts();
  },

  fetchDevices: async () => {
    set({ isDevicesLoading: true, error: null });
    try {
      const devices = await securityApi.getDevices();
      set({ devices: devices.length > 0 ? devices : DEFAULT_DEMO_DEVICES });
      return devices;
    } catch {
      set({ devices: DEFAULT_DEMO_DEVICES });
      return DEFAULT_DEMO_DEVICES;
    } finally {
      set({ isDevicesLoading: false });
    }
  },

  fetchSessions: async () => {
    set({ isSessionsLoading: true, error: null });
    try {
      const sessions = await securityApi.getSessions();
      set({ sessions });
      return sessions;
    } catch {
      return [];
    } finally {
      set({ isSessionsLoading: false });
    }
  },

  fetchLoginAttempts: async () => {
    set({ isAttemptsLoading: true, error: null });
    try {
      const loginAttempts = await securityApi.getLoginAttempts();
      set({ loginAttempts });
      return loginAttempts;
    } catch {
      return [];
    } finally {
      set({ isAttemptsLoading: false });
    }
  },

  blockDevice: async (device: UserDevice) => {
    set({ isUpdatingDevice: true });
    try {
      await securityApi.blockDevice(device.uuid);
      await get().fetchDevices();
    } catch {
      // Optimistic / fallback update
      set((state) => ({
        devices: state.devices.map((d) =>
          d.uuid === device.uuid ? { ...d, is_blocked: true } : d
        ),
      }));
    } finally {
      set({ isUpdatingDevice: false });
    }
  },

  unblockDevice: async (device: UserDevice) => {
    set({ isUpdatingDevice: true });
    try {
      await securityApi.unblockDevice(device.uuid);
      await get().fetchDevices();
    } catch {
      // Optimistic / fallback update
      set((state) => ({
        devices: state.devices.map((d) =>
          d.uuid === device.uuid ? { ...d, is_blocked: false } : d
        ),
      }));
    } finally {
      set({ isUpdatingDevice: false });
    }
  },

  revokeSession: async (session: UserSession, onLogout?: () => Promise<void>) => {
    set({ isRevokingSession: true });
    try {
      await securityApi.revokeSession(session.uuid);
      if (session.is_current && onLogout) {
        await onLogout();
      } else {
        await get().fetchSessions();
      }
    } catch {
      set((state) => ({
        sessions: state.sessions.filter((s) => s.uuid !== session.uuid),
      }));
    } finally {
      set({ isRevokingSession: false });
    }
  },

  purgeRevokedSessions: async () => {
    set({ isPurgingRevoked: true });
    try {
      await securityApi.purgeRevokedSessions();
      set((state) => ({
        sessions: state.sessions.filter((s) => s.status !== "revoked" && !s.revoked_at),
      }));
    } catch {
      set((state) => ({
        sessions: state.sessions.filter((s) => s.status !== "revoked" && !s.revoked_at),
      }));
    } finally {
      set({ isPurgingRevoked: false });
    }
  },

  changePassword: async (payload: ChangePasswordRequest) => {
    set({ isSavingPassword: true, error: null });
    try {
      await securityApi.changePassword(payload);
      const nowStr =
        new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      set({
        lastPasswordChange: nowStr,
        isPasswordModalOpen: false,
      });
    } finally {
      set({ isSavingPassword: false });
    }
  },

  deactivateAccount: async (payload?: DeactivateAccountRequest) => {
    await securityApi.deactivateAccount(payload);
  },

  sendEmailVerification: async (email: string) => {
    set({ isSendingVerificationEmail: true, error: null });
    try {
      const res = await securityApi.sendEmailVerification(email);
      set({ verificationSentInfo: res });
      return res;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to send verification link.";
      set({ error: msg });
      throw err;
    } finally {
      set({ isSendingVerificationEmail: false });
    }
  },

  resendEmailVerification: async () => {
    set({ isSendingVerificationEmail: true, error: null });
    try {
      const res = await securityApi.resendEmailVerification();
      set({ verificationSentInfo: res });
      return res;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to resend verification link.";
      set({ error: msg });
      throw err;
    } finally {
      set({ isSendingVerificationEmail: false });
    }
  },

  verifyEmail: async (id: string | number, hash: string) => {
    set({ error: null });
    try {
      const res = await securityApi.verifyEmail(id, hash);
      set({
        isEmailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        pendingEmail: null,
      });
      return res;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to verify email address.";
      set({ error: msg });
      throw err;
    }
  },

  checkEmailVerificationStatus: async () => {
    set({ isCheckingEmailStatus: true, error: null });
    try {
      const res = await securityApi.checkEmailVerificationStatus();
      set({
        isEmailVerified: Boolean(res.is_verified),
        emailVerifiedAt: res.email_verified_at,
        pendingEmail: res.pending_email || null,
      });
      return res;
    } catch {
      return {
        is_verified: get().isEmailVerified,
        email_verified_at: get().emailVerifiedAt,
        pending_email: get().pendingEmail,
      };
    } finally {
      set({ isCheckingEmailStatus: false });
    }
  },

  cancelEmailChange: async () => {
    set({ error: null });
    try {
      await securityApi.cancelEmailChange();
      set({ pendingEmail: null, verificationSentInfo: null });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to cancel email change.";
      set({ error: msg });
      throw err;
    }
  },

  resendEmailChange: async () => {
    set({ isSendingVerificationEmail: true, error: null });
    try {
      const res = await securityApi.resendEmailChange();
      set({ verificationSentInfo: res });
      return res;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to resend email verification.";
      set({ error: msg });
      throw err;
    } finally {
      set({ isSendingVerificationEmail: false });
    }
  },

  changeEmail: async (newEmail: string, password: string) => {
    set({ isSendingVerificationEmail: true, error: null });
    try {
      const res = await securityApi.requestEmailChange(newEmail, password);

      set({
        pendingEmail: newEmail,
        verificationSentInfo: res,
        isEmailModalOpen: false,
      });

      return res;
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to request email change.";
      set({ error: msg });
      throw err;
    } finally {
      set({ isSendingVerificationEmail: false });
    }
  },
}));



