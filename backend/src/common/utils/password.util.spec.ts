/// <reference types="jest" />
import { hashPassword, comparePassword } from './password.util'; // Điều chỉnh đường dẫn file

describe('Password Utils', () => {
  const password = 'test2345678';

  describe('hashPassword', () => {
    it('should hash the password successfully', async () => {
      const hashed = await hashPassword(password);
      // Thêm dòng này để nó hiện ra terminal cho bạn copy
      console.log('--- CHUỖI HASH ĐỂ COPY VÀO DB ---');
      console.log(hashed);
      console.log('---------------------------------');
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password); // Password sau khi hash phải khác password gốc
      expect(hashed.length).toBeGreaterThan(20);
    });
  });

  describe('comparePassword', () => {
    it('should return true if password matches', async () => {
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false if password does not match', async () => {
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword('wrong_password', hashed);

      expect(isMatch).toBe(false);
    });
  });
});
