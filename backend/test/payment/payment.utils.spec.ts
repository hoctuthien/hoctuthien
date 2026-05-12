import { parseVNTime, toVNDateString } from '../../src/modules/payment/payment.utils';

/**
 * Unit tests cho các pure utility functions xử lý timezone VN (UTC+7).
 * Đây là các hàm không có dependency → không cần mock.
 *
 * Lý do quan trọng: Bug ở đây → sai toàn bộ cửa sổ sync thời gian
 * của cron job → bỏ sót hoặc re-scan nhầm giao dịch ngân hàng.
 */
describe('payment.utils', () => {
  // ─── parseVNTime ────────────────────────────────────────────────────────────

  describe('parseVNTime(vnTimeStr)', () => {
    it('chuyển "YYYY-MM-DD HH:mm:ss" (giờ VN +07) sang UTC Date đúng', () => {
      // 15:30 VN (+07) = 08:30 UTC
      const result = parseVNTime('2024-05-09 15:30:00');

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-05-09T08:30:00.000Z');
    });

    it('xử lý đúng 00:00:00 VN (= 17:00 UTC hôm trước)', () => {
      const result = parseVNTime('2024-06-01 00:00:00');

      expect(result.toISOString()).toBe('2024-05-31T17:00:00.000Z');
    });

    it('xử lý đúng 23:59:59 VN (= 16:59:59 UTC cùng ngày)', () => {
      const result = parseVNTime('2024-06-01 23:59:59');

      expect(result.toISOString()).toBe('2024-06-01T16:59:59.000Z');
    });

    it('trả về Date hợp lệ (không NaN)', () => {
      const result = parseVNTime('2024-01-01 12:00:00');

      expect(isNaN(result.getTime())).toBe(false);
    });

    it('xử lý năm nhuận: 2024-02-29 đúng', () => {
      const result = parseVNTime('2024-02-29 10:00:00');

      expect(result.toISOString()).toBe('2024-02-29T03:00:00.000Z');
    });
  });

  // ─── toVNDateString ─────────────────────────────────────────────────────────

  describe('toVNDateString(date)', () => {
    it('trả về ngày theo giờ VN dạng YYYY-MM-DD', () => {
      // 17:00 UTC ngày 08/05 = 00:00 VN ngày 09/05
      const utcDate = new Date('2024-05-08T17:00:00.000Z');

      expect(toVNDateString(utcDate)).toBe('2024-05-09');
    });

    it('23:59 UTC vẫn trả ngày hôm sau theo giờ VN', () => {
      // 23:59 UTC ngày 09/05 = 06:59 VN ngày 10/05
      const utcDate = new Date('2024-05-09T23:59:00.000Z');

      expect(toVNDateString(utcDate)).toBe('2024-05-10');
    });

    it('00:00 UTC → 07:00 VN, ngày không đổi', () => {
      const utcDate = new Date('2024-05-10T00:00:00.000Z');

      expect(toVNDateString(utcDate)).toBe('2024-05-10');
    });

    it('trả về chuỗi đúng định dạng YYYY-MM-DD', () => {
      const date = new Date('2024-12-25T10:00:00.000Z');

      expect(toVNDateString(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('roundtrip: toVNDateString(parseVNTime(str)) = ngày gốc trong str', () => {
      // Nếu TN App trả "2024-07-15 09:30:00", ngày VN phải là "2024-07-15"
      const result = toVNDateString(parseVNTime('2024-07-15 09:30:00'));

      expect(result).toBe('2024-07-15');
    });

    it('roundtrip hoạt động đúng với thời điểm biên (00:30 VN)', () => {
      // "2024-08-01 00:30:00" VN → vẫn là ngày 2024-08-01
      const result = toVNDateString(parseVNTime('2024-08-01 00:30:00'));

      expect(result).toBe('2024-08-01');
    });
  });
});
