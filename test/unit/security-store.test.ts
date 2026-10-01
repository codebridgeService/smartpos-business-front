import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSecurityStore } from "@/stores";
import { securityApi } from "@/lib/api/security";
import type { UserDevice, UserSession, LoginAttempt } from "@/types";

describe("useSecurityStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSecurityStore.setState({
      devices: [],
      sessions: [],
      loginAttempts: [],
      isDevicesLoading: false,
      isSessionsLoading: false,
      isAttemptsLoading: false,
      isPasswordModalOpen: false,
      isDeviceModalOpen: false,
      isActivityModalOpen: false,
      phoneVerified: "+81699799974",
      emailVerified: "info@example.com",
    });
  });

  it("has correct initial defaults and handles state setters", () => {
    const store = useSecurityStore.getState();
    expect(store.twoFactorEnabled).toBe(true);
    expect(store.googleAuthEnabled).toBe(true);

    store.setTwoFactorEnabled(false);
    expect(useSecurityStore.getState().twoFactorEnabled).toBe(false);

    store.setPhoneVerified("+123456789");
    expect(useSecurityStore.getState().phoneVerified).toBe("+123456789");

    store.setEmailVerified("admin@pos.local");
    expect(useSecurityStore.getState().emailVerified).toBe("admin@pos.local");
  });

  it("fetches devices and updates store state", async () => {
    const mockDevices: UserDevice[] = [
      {
        id: 10,
        uuid: "dev-10",
        user_id: 1,
        device_uuid: "uuid-10",
        device_name: "POS Terminal #1",
        device_type: "terminal",
        platform: "Android",
        first_ip_address: "192.168.1.1",
        last_ip_address: "192.168.1.1",
        is_trusted: true,
        is_blocked: false,
        last_seen_at: null,
        created_at: null,
        updated_at: null,
      },
    ];

    vi.spyOn(securityApi, "getDevices").mockResolvedValue(mockDevices);

    const devices = await useSecurityStore.getState().fetchDevices();
    expect(devices).toEqual(mockDevices);
    expect(useSecurityStore.getState().devices).toEqual(mockDevices);
    expect(useSecurityStore.getState().isDevicesLoading).toBe(false);
  });

  it("fetches login attempts and updates store state", async () => {
    const mockAttempts: LoginAttempt[] = [
      {
        id: 1,
        uuid: "att-1",
        identifier: "test@example.com",
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0",
        is_successful: true,
      },
    ];

    vi.spyOn(securityApi, "getLoginAttempts").mockResolvedValue(mockAttempts);

    const attempts = await useSecurityStore.getState().fetchLoginAttempts();
    expect(attempts).toEqual(mockAttempts);
    expect(useSecurityStore.getState().loginAttempts).toEqual(mockAttempts);
    expect(useSecurityStore.getState().isAttemptsLoading).toBe(false);
  });

  it("blocks and unblocks a device optimistically on API failure or success", async () => {
    const device: UserDevice = {
      id: 1,
      uuid: "dev-block-test",
      user_id: 1,
      device_uuid: "dev-uuid",
      device_name: "Test Tablet",
      device_type: "tablet",
      platform: "iOS",
      first_ip_address: null,
      last_ip_address: null,
      is_trusted: false,
      is_blocked: false,
      last_seen_at: null,
      created_at: null,
      updated_at: null,
    };

    useSecurityStore.setState({ devices: [device] });

    vi.spyOn(securityApi, "blockDevice").mockResolvedValue({ message: "Blocked" });
    vi.spyOn(securityApi, "getDevices").mockResolvedValue([{ ...device, is_blocked: true }]);

    await useSecurityStore.getState().blockDevice(device);
    expect(useSecurityStore.getState().devices[0].is_blocked).toBe(true);

    vi.spyOn(securityApi, "unblockDevice").mockResolvedValue({ message: "Unblocked" });
    vi.spyOn(securityApi, "getDevices").mockResolvedValue([{ ...device, is_blocked: false }]);

    await useSecurityStore.getState().unblockDevice(device);
    expect(useSecurityStore.getState().devices[0].is_blocked).toBe(false);
  });

  it("handles session revocation and purging revoked sessions", async () => {
    const session: UserSession = {
      uuid: "sess-1",
      ip_address: "10.0.0.1",
      user_agent: "Chrome",
      status: "active",
      expires_at: "2026-12-31",
      revoked_at: null,
      created_at: null,
      last_activity_at: null,
    };

    useSecurityStore.setState({ sessions: [session] });

    vi.spyOn(securityApi, "revokeSession").mockResolvedValue({ message: "Revoked" });
    vi.spyOn(securityApi, "getSessions").mockResolvedValue([]);

    await useSecurityStore.getState().revokeSession(session);
    expect(useSecurityStore.getState().sessions).toHaveLength(0);
  });

  it("handles sending email verification and checking status", async () => {
    const mockSendResponse = {
      message: "Verification link sent successfully. Please check your email.",
      sent_to: "user@example.com",
      expires_in_minutes: 15,
      expires_at: "2026-09-28T15:30:00Z",
      verification_url: "https://smartpos.servicefixit.me/auth/email/verify/1/samplehash",
    };

    vi.spyOn(securityApi, "sendEmailVerification").mockResolvedValue(mockSendResponse);

    const res = await useSecurityStore.getState().sendEmailVerification("user@example.com");
    expect(res).toEqual(mockSendResponse);
    expect(useSecurityStore.getState().verificationSentInfo).toEqual(mockSendResponse);
    expect(useSecurityStore.getState().isSendingVerificationEmail).toBe(false);

    vi.spyOn(securityApi, "checkEmailVerificationStatus").mockResolvedValue({
      is_verified: true,
      email_verified_at: "2026-09-28T15:15:00Z",
    });

    const status = await useSecurityStore.getState().checkEmailVerificationStatus();
    expect(status.is_verified).toBe(true);
    expect(useSecurityStore.getState().isEmailVerified).toBe(true);
    expect(useSecurityStore.getState().emailVerifiedAt).toBe("2026-09-28T15:15:00Z");
  });

  it("handles verifying email with signed link parameters", async () => {
    vi.spyOn(securityApi, "verifyEmail").mockResolvedValue({ message: "Email verified successfully." });

    await useSecurityStore.getState().verifyEmail("1", "hash123");
    expect(useSecurityStore.getState().isEmailVerified).toBe(true);
    expect(useSecurityStore.getState().emailVerifiedAt).toBeDefined();
  });

  it("handles changeEmail by storing pendingEmail and sending verification link", async () => {
    const mockSendResponse = {
      message: "Verification link sent to your new email address. Please check your inbox.",
      sent_to: "newuser@gmail.com",
      expires_in_minutes: 15,
      expires_at: "2026-09-28T15:45:00Z",
      verification_url: "https://smartpos.servicefixit.me/auth/email/verify-change/1/samplehash",
    };

    const requestSpy = vi.spyOn(securityApi, "requestEmailChange").mockResolvedValue(mockSendResponse);

    useSecurityStore.setState({ isEmailVerified: true, emailVerified: "old@gmail.com", pendingEmail: null });

    const res = await useSecurityStore.getState().changeEmail("newuser@gmail.com", "CurrentPassword123!");
    expect(res).toEqual(mockSendResponse);
    expect(requestSpy).toHaveBeenCalledWith("newuser@gmail.com", "CurrentPassword123!");
    expect(useSecurityStore.getState().pendingEmail).toBe("newuser@gmail.com");
    expect(useSecurityStore.getState().emailVerified).toBe("old@gmail.com");
  });
});


