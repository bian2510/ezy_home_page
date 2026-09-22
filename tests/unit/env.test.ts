import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWhatsAppNumber } from '@/lib/env';

describe('getWhatsAppNumber', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return the configured VITE_WHATSAPP_NUMBER', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');

    expect(getWhatsAppNumber()).toBe('5491122334455');
  });

  it('should return an empty string when the variable is not configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '');

    expect(getWhatsAppNumber()).toBe('');
  });

  it('should read the value at call time so a late configuration is picked up', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491100000000');
    expect(getWhatsAppNumber()).toBe('5491100000000');

    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491199999999');
    expect(getWhatsAppNumber()).toBe('5491199999999');
  });
});
