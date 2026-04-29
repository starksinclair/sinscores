/**
 * Generate a 6-character access code: 2 uppercase letters + 2 digits + 2 uppercase letters.
 * Uses crypto.getRandomValues() for secure randomness.
 */
export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const array = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 6; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  const result: string[] = [];
  result.push(chars[array[0]! % 26]);
  result.push(chars[array[1]! % 26]);
  result.push(digits[array[2]! % 10]);
  result.push(digits[array[3]! % 10]);
  result.push(chars[array[4]! % 26]);
  result.push(chars[array[5]! % 26]);
  return result.join("");
}

/**
 * Validate access code format: 2 uppercase + 2 digits + 2 uppercase.
 */
export function validateAccessCode(code: string): boolean {
  return /^[A-Z]{2}[0-9]{2}[A-Z]{2}$/.test(code);
}
