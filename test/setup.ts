// Test environment setup
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://smartpos-api.servicefixit.me/api/v1";

afterEach(() => {
  cleanup();
});

