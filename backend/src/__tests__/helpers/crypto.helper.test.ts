import { decrypt, encrypt } from '@/helpers/crypto.helper';

describe('Crypto Helper', () => {
  describe('encrypt', () => {
    it('returns a string with 4 colon-separated parts', () => {
      const result = encrypt('hello world');
      const parts = result.split(':');
      expect(parts).toHaveLength(4);
    });

    it('produces different ciphertext for the same input (random salt/iv)', () => {
      const a = encrypt('same text');
      const b = encrypt('same text');
      expect(a).not.toBe(b);
    });

    it('encrypts empty string', () => {
      const result = encrypt('');
      expect(result).toBeDefined();
      expect(result.split(':')).toHaveLength(4);
    });
  });

  describe('decrypt', () => {
    it('decrypts back to original plaintext', () => {
      const plaintext = 'hello world 123!@#';
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('decrypts empty string', () => {
      const encrypted = encrypt('');
      expect(decrypt(encrypted)).toBe('');
    });

    it('decrypts unicode text', () => {
      const plaintext = 'xin chào thế giới 🌍';
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('throws on invalid format (missing parts)', () => {
      expect(() => decrypt('invalid')).toThrow('Invalid encrypted format');
      expect(() => decrypt('a:b')).toThrow('Invalid encrypted format');
      expect(() => decrypt('a:b:c')).toThrow('Invalid encrypted format');
    });

    it('throws on tampered ciphertext (GCM auth tag check)', () => {
      const encrypted = encrypt('test data');
      const parts = encrypted.split(':');
      // Tamper with the encrypted content
      parts[3] = '00'.repeat(parts[3].length / 2);
      expect(() => decrypt(parts.join(':'))).toThrow();
    });

    it('throws on tampered auth tag', () => {
      const encrypted = encrypt('test data');
      const parts = encrypted.split(':');
      // Tamper with the auth tag
      parts[2] = '00'.repeat(16);
      expect(() => decrypt(parts.join(':'))).toThrow();
    });

    it('throws on invalid hex in salt', () => {
      expect(() => decrypt('zzzz:aaaa:bbbb:cccc')).toThrow();
    });
  });

  describe('encrypt/decrypt round-trip', () => {
    it('handles long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('handles JSON data', () => {
      const data = JSON.stringify({ userId: '123', role: 'admin', exp: Date.now() });
      const encrypted = encrypt(data);
      expect(decrypt(encrypted)).toBe(data);
    });
  });
});
