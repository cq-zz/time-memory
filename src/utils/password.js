/**
 * Private-diary password utilities.
 * Only the SHA-256 hash is persisted (settings key `security.passwordHash`,
 * via the cross-platform settings layer) — the plain password is never
 * stored. expo-crypto works on both native and web (SubtleCrypto).
 *
 * Semantics match the legacy project: forgetting the password means it
 * can only be RESET (hash cleared), never recovered.
 */
import * as Crypto from 'expo-crypto';
import { loadSettingsRows, saveSettingRow } from '../store/db';

const PWD_KEY = 'security.passwordHash';

async function readHash() {
  try {
    const rows = await loadSettingsRows();
    const row = rows.find((r) => r.key === PWD_KEY);
    return row ? JSON.parse(row.value) || '' : '';
  } catch {
    return '';
  }
}

/** SHA-256 hex digest of the plain password. */
export async function hashPassword(password) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

/** True when a password hash has been persisted. */
export async function hasPassword() {
  return !!(await readHash());
}

/** Store (or overwrite) the password — persists only its hash. */
export async function setPassword(password) {
  await saveSettingRow(PWD_KEY, JSON.stringify(await hashPassword(password)));
}

/** Check a candidate password against the stored hash. */
export async function verifyPassword(password) {
  const hash = await readHash();
  if (!hash) return false;
  return (await hashPassword(password)) === hash;
}

/** Reset = delete the hash. Private entries keep their flag but open freely. */
export async function clearPassword() {
  await saveSettingRow(PWD_KEY, JSON.stringify(''));
}
