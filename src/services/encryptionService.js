import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.keySize = 256;
    this.ivSize = 128;
  }

  /**
   * Generate a random encryption key
   */
  generateKey() {
    return CryptoJS.lib.WordArray.random(this.keySize / 8).toString();
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  generateIV() {
    return CryptoJS.lib.WordArray.random(this.ivSize / 8).toString();
  }

  /**
   * Encrypt text using AES encryption
   * @param {string} text - Text to encrypt
   * @param {string} password - Password for encryption
   * @returns {object} - Encrypted data with IV and salt
   */
  encrypt(text, password) {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: this.keySize / 32,
        iterations: 1000
      });
      
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encrypted: encrypted.toString(),
        iv: iv.toString(),
        salt: salt.toString()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt text using AES decryption
   * @param {object} encryptedData - Encrypted data object
   * @param {string} password - Password for decryption
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedData, password) {
    try {
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: this.keySize / 32,
        iterations: 1000
      });

      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data - check password');
    }
  }

  /**
   * Hash a password for storage
   * @param {string} password - Password to hash
   * @returns {string} - Hashed password
   */
  hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Verify a password against its hash
   * @param {string} password - Password to verify
   * @param {string} hash - Stored hash
   * @returns {boolean} - True if password matches
   */
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  /**
   * Generate a secure random string for paste IDs
   * @param {number} length - Length of the string
   * @returns {string} - Random string
   */
  generateSecureId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default new EncryptionService();
