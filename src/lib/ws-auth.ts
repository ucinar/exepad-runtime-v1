/**
 * WebSocket message authentication utilities for runtime
 * Provides HMAC-based message signature generation
 */
import hmacSHA256 from 'crypto-js/hmac-sha256';
import encHex from 'crypto-js/enc-hex';

/**
 * Check if the Web Crypto API is available in the current runtime.
 */
function isSubtleCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Recursively sort object keys to ensure consistent JSON stringification.
 */
function sortObjectKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }
  if (typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

/**
 * Stringify JSON with sorted keys to match the compact format.
 */
function stringifyWithSortedKeys(obj: any): string {
  if (obj === null || obj === undefined || Object.keys(obj).length === 0) {
    return '';
  }
  const sorted = sortObjectKeys(obj);
  return JSON.stringify(sorted);
}

/**
 * Fallback HMAC implementation using crypto-js.
 */
async function generateFallbackSignature(
  messageType: string,
  messageData: any,
  timestamp: number,
  secret: string
): Promise<string> {
  console.warn('[ws-auth-runtime] Using crypto-js HMAC-SHA256 fallback.');
  const dataStr = stringifyWithSortedKeys(messageData);
  const payload = `${messageType}:${dataStr}:${timestamp}`;
  const hash = hmacSHA256(payload, secret);
  return hash.toString(encHex);
}

/**
 * Generate HMAC-SHA256 signature for a WebSocket message.
 */
export async function generateMessageSignature(
  messageType: string,
  messageData: any,
  timestamp: number,
  secret: string
): Promise<string> {
  if (!isSubtleCryptoAvailable()) {
    return generateFallbackSignature(messageType, messageData, timestamp, secret);
  }

  try {
    const dataStr = stringifyWithSortedKeys(messageData);
    const payload = `${messageType}:${dataStr}:${timestamp}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const messageBuffer = enc.encode(payload);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageBuffer);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('[ws-auth-runtime] SubtleCrypto HMAC generation failed, using fallback:', error);
    return generateFallbackSignature(messageType, messageData, timestamp, secret);
  }
}

/**
 * Add authentication signature to a WebSocket message.
 */
export async function signMessage(
  message: { type: string; data?: any; [key: string]: any },
  secret: string
): Promise<any> {
  const timestamp = Date.now();
  const signature = await generateMessageSignature(
    message.type,
    message.data,
    timestamp,
    secret
  );
  return {
    ...message,
    timestamp,
    signature,
  };
}

/**
 * Get message signing secret from environment variables.
 */
export function getMessageSecret(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_MESSAGE_SECRET) {
    return process.env.NEXT_PUBLIC_WS_MESSAGE_SECRET;
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('[ws-auth-runtime] Using development fallback secret.');
    return 'dev-secret-key-change-in-production';
  }
  throw new Error('WebSocket message secret not configured in runtime');
}
