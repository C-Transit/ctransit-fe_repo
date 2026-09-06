/**
 * Centralized Identifier Abstraction Utilities
 * 
 * Maps internal database UUIDs to safe, deterministic, human-readable public display identifiers.
 * IMPORTANT: Display identifiers are ONLY for UI presentation.
 * Real internal database UUIDs must be preserved for all API calls and network operations.
 */

const CROCKFORD_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Deterministic hash that converts an input string into a fixed-length Crockford Base32 string.
 * @param {string|number} input 
 * @param {number} length 
 * @returns {string}
 */
export function deterministicHash(input, length = 8) {
  if (!input) return 'UNKNOWN'.padEnd(length, 'X').slice(0, length);
  const str = String(input).trim();
  
  // Dual-seed 32-bit FNV-1a mixing
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= code ^ (i << 3);
    h2 = Math.imul(h2, 0x5bd1e995) >>> 0;
  }

  let combined = (BigInt(h1) << 32n) | BigInt(h2);
  let result = '';
  const base = BigInt(CROCKFORD_ALPHABET.length);

  for (let i = 0; i < length; i++) {
    const rem = Number(combined % base);
    result += CROCKFORD_ALPHABET[rem];
    combined /= base;
  }

  return result;
}

/**
 * Generates a public display identifier for an Agent.
 * e.g., AGT-7K4P2X9Q
 * @param {string} id - Raw database agent ID / UUID
 * @returns {string}
 */
export function generateAgentDisplayId(id) {
  if (!id) return 'AGT-UNSET';
  const str = String(id).trim();
  if (str.startsWith('AGT-') && str.length === 12) return str;
  return `AGT-${deterministicHash(str, 8)}`;
}

/**
 * Generates a public display identifier for a Student RFID Card.
 * e.g., CARD-9X2M4K7P
 * @param {string} uid - Raw card UID / DB ID
 * @returns {string}
 */
export function generateCardDisplayId(uid) {
  if (!uid || uid === 'Linked Card') return 'CARD-UNSET';
  const str = String(uid).trim();
  if (str.startsWith('CARD-') && str.length === 13) return str;
  return `CARD-${deterministicHash(str, 8)}`;
}

/**
 * Generates a safe public student display identifier.
 * Prioritizes actual matriculation number if available.
 * @param {string} id - Student user ID
 * @param {string} [matricNumber] - Optional matriculation number
 * @returns {string}
 */
export function generateStudentDisplayId(id, matricNumber) {
  if (matricNumber && String(matricNumber).trim() && String(matricNumber).trim() !== '—' && String(matricNumber).trim() !== 'N/A') {
    return String(matricNumber).trim();
  }
  if (!id) return 'STU-UNKNOWN';
  const str = String(id).trim();
  if (str.startsWith('STU-') && str.length === 12) return str;
  return `STU-${deterministicHash(str, 8)}`;
}

/**
 * Generates a public display identifier for a POS terminal.
 * e.g., TRM-01 or TRM-K7P2X9
 * @param {string} id 
 * @returns {string}
 */
export function generateTerminalDisplayId(id) {
  if (!id) return 'TRM-01';
  const str = String(id).trim();
  if (str.startsWith('POS-') || str.startsWith('TRM-') || str.startsWith('TERM-')) return str;
  return `TRM-${deterministicHash(str, 6)}`;
}

/**
 * Generates a public display identifier for a Transaction.
 * e.g., TXN-3N9P4X2Q
 * @param {string} id 
 * @returns {string}
 */
export function generateTransactionDisplayId(id) {
  if (!id) return 'TXN-RECENT';
  const str = String(id).trim();
  if (str.startsWith('TXN-')) return str;
  return `TXN-${deterministicHash(str, 8)}`;
}

/**
 * Generates a public display identifier for a Dispute ticket.
 * e.g., DSP-4M8P2K9X
 * @param {string} id 
 * @returns {string}
 */
export function generateDisputeDisplayId(id) {
  if (!id) return 'DSP-TICKET';
  const str = String(id).trim();
  if (str.startsWith('DSP-')) return str;
  return `DSP-${deterministicHash(str, 8)}`;
}

/**
 * Generates a public display identifier for a Driver.
 * e.g., DRV-2P9X4M7K
 * @param {string} id 
 * @returns {string}
 */
export function generateDriverDisplayId(id) {
  if (!id) return 'DRV-UNKNOWN';
  const str = String(id).trim();
  if (str.startsWith('DRV-')) return str;
  return `DRV-${deterministicHash(str, 8)}`;
}
