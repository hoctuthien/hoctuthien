/**
 * Unit Tests — payment.utils.ts
 *
 * Tổng số test case: 20
 *
 * Nhóm test:
 *  A. parseVNTime — chuyển chuỗi VN time (UTC+7) thành Date UTC (TC-401 → TC-410)
 *  B. toVNDateString — chuyển Date UTC thành chuỗi ngày VN YYYY-MM-DD (TC-411 → TC-420)
 */

import {
  parseVNTime,
  toVNDateString,
} from '../../src/modules/payment/payment.utils';

// ─── UTC+7 offset hằng số ─────────────────────────────────────────────────────
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // 25_200_000 ms

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('payment.utils', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // A. parseVNTime
  // ═══════════════════════════════════════════════════════════════════════════

  describe('parseVNTime', () => {
    /**
     * TC-401: Parse chuỗi VN time "YYYY-MM-DD HH:mm:ss" → đúng UTC Date
     * VN 09:05:00 (UTC+7) → UTC 02:05:00
     */
    it('TC-401: nên parse "2026-05-20 09:05:00" (UTC+7) thành UTC 02:05:00', () => {
      const result = parseVNTime('2026-05-20 09:05:00');

      expect(result.toISOString()).toBe('2026-05-20T02:05:00.000Z');
    });

    /**
     * TC-402: Nửa đêm VN (00:00:00) → UTC ngày hôm trước 17:00:00
     */
    it('TC-402: nên parse "2026-05-20 00:00:00" (nửa đêm VN) thành UTC "2026-05-19T17:00:00.000Z"', () => {
      const result = parseVNTime('2026-05-20 00:00:00');

      expect(result.toISOString()).toBe('2026-05-19T17:00:00.000Z');
    });

    /**
     * TC-403: Cuối ngày VN (23:59:59) → UTC 16:59:59 cùng ngày
     */
    it('TC-403: nên parse "2026-05-20 23:59:59" thành "2026-05-20T16:59:59.000Z"', () => {
      const result = parseVNTime('2026-05-20 23:59:59');

      expect(result.toISOString()).toBe('2026-05-20T16:59:59.000Z');
    });

    /**
     * TC-404: Kết quả phải là instance Date hợp lệ (không phải Invalid Date)
     */
    it('TC-404: nên trả về Date hợp lệ (không phải Invalid Date)', () => {
      const result = parseVNTime('2026-05-20 10:30:00');

      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });

    /**
     * TC-405: Sai lệch với UTC phải đúng 7 tiếng (25_200_000 ms)
     */
    it('TC-405: thời gian UTC phải chênh lệch đúng -7 giờ so với VN time', () => {
      const vnHour = 14; // 14:00:00 VN
      const result = parseVNTime(
        `2026-05-20 ${vnHour.toString().padStart(2, '0')}:00:00`,
      );

      expect(result.getUTCHours()).toBe(vnHour - 7);
    });

    /**
     * TC-406: Parse thời điểm đầu năm
     */
    it('TC-406: nên parse đúng thời điểm đầu năm "2026-01-01 00:00:00"', () => {
      const result = parseVNTime('2026-01-01 00:00:00');

      expect(result.toISOString()).toBe('2025-12-31T17:00:00.000Z');
    });

    /**
     * TC-407: Hai lần parse cùng chuỗi → kết quả giống nhau (pure function)
     */
    it('TC-407: phải là pure function — gọi nhiều lần với cùng input cho cùng output', () => {
      const input = '2026-05-20 12:00:00';
      const r1 = parseVNTime(input);
      const r2 = parseVNTime(input);

      expect(r1.getTime()).toBe(r2.getTime());
    });

    /**
     * TC-408: Kết quả luôn nhỏ hơn input (UTC nhỏ hơn VN time)
     */
    it('TC-408: UTC timestamp phải nhỏ hơn VN time tương ứng đúng 7 giờ', () => {
      const vnTimeStr = '2026-05-20 15:30:00';
      const result = parseVNTime(vnTimeStr);

      // Tạo Date từ VN time như thể là UTC rồi so sánh
      const vnAsUtc = new Date('2026-05-20T15:30:00.000Z');
      expect(vnAsUtc.getTime() - result.getTime()).toBe(VN_OFFSET_MS);
    });

    /**
     * TC-409: Parse chuỗi có năm nhuận (29/02)
     */
    it('TC-409: nên parse đúng ngày 29/02 của năm nhuận', () => {
      const result = parseVNTime('2028-02-29 10:00:00');

      expect(result.toISOString()).toBe('2028-02-29T03:00:00.000Z');
    });

    /**
     * TC-410: Giờ chuyển từ 7:00 (VN) = 00:00 UTC — ngưỡng quan trọng
     */
    it('TC-410: "2026-05-20 07:00:00" (VN) phải khớp đúng "2026-05-20T00:00:00.000Z" (UTC)', () => {
      const result = parseVNTime('2026-05-20 07:00:00');

      expect(result.toISOString()).toBe('2026-05-20T00:00:00.000Z');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // B. toVNDateString
  // ═══════════════════════════════════════════════════════════════════════════

  describe('toVNDateString', () => {
    /**
     * TC-411: UTC ngày thì giờ VN cùng ngày → YYYY-MM-DD đúng
     * 2026-05-20T10:00:00Z → VN 17:00:00 cùng ngày → "2026-05-20"
     */
    it('TC-411: nên trả về "2026-05-20" khi Date là 2026-05-20T10:00:00Z', () => {
      const date = new Date('2026-05-20T10:00:00Z');

      expect(toVNDateString(date)).toBe('2026-05-20');
    });

    /**
     * TC-412: UTC 18:00 → VN ngày hôm sau 01:00 → ngày VN khác ngày UTC
     * 2026-05-20T18:00:00Z → VN 01:00:00 ngày 2026-05-21 → "2026-05-21"
     */
    it('TC-412: nên trả về ngày VN hôm sau khi UTC + 7h > midnight', () => {
      const date = new Date('2026-05-20T18:00:00Z'); // UTC 18h → VN 01:00 21/05

      expect(toVNDateString(date)).toBe('2026-05-21');
    });

    /**
     * TC-413: UTC 17:00:00 → VN 00:00:00 cùng ngày (ngưỡng biên)
     * 2026-05-20T17:00:00Z → VN 00:00:00 ngày 2026-05-21
     */
    it('TC-413: nên trả về ngày VN hôm sau khi UTC là 17:00:00 (boundary)', () => {
      const date = new Date('2026-05-20T17:00:00Z'); // VN: 00:00 ngày 21

      expect(toVNDateString(date)).toBe('2026-05-21');
    });

    /**
     * TC-414: UTC 16:59:59 → VN 23:59:59 cùng ngày
     */
    it('TC-414: nên giữ nguyên ngày VN khi UTC là 16:59:59 (boundary -1s)', () => {
      const date = new Date('2026-05-20T16:59:59Z'); // VN: 23:59:59 ngày 20

      expect(toVNDateString(date)).toBe('2026-05-20');
    });

    /**
     * TC-415: Format kết quả đúng dạng YYYY-MM-DD
     */
    it('TC-415: format kết quả phải đúng dạng YYYY-MM-DD', () => {
      const date = new Date('2026-05-20T00:00:00Z');
      const result = toVNDateString(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    /**
     * TC-416: Đầu năm UTC → có thể là cuối năm VN
     * 2026-01-01T00:00:00Z → VN 07:00:00 ngày 01/01/2026 → "2026-01-01"
     */
    it('TC-416: nên trả về "2026-01-01" khi Date là 2026-01-01T00:00:00Z', () => {
      const date = new Date('2026-01-01T00:00:00Z');

      expect(toVNDateString(date)).toBe('2026-01-01');
    });

    /**
     * TC-417: Cuối năm UTC (31/12 17:00) → đầu năm VN (01/01 00:00)
     */
    it('TC-417: nên trả về ngày đầu năm mới VN khi UTC là 31/12 17:00:00', () => {
      const date = new Date('2025-12-31T17:00:00Z'); // VN: 2026-01-01 00:00

      expect(toVNDateString(date)).toBe('2026-01-01');
    });

    /**
     * TC-418: Pure function — gọi nhiều lần với cùng input → cùng output
     */
    it('TC-418: phải là pure function — gọi nhiều lần cho cùng kết quả', () => {
      const date = new Date('2026-05-20T08:00:00Z');

      expect(toVNDateString(date)).toBe(toVNDateString(date));
    });

    /**
     * TC-419: Round-trip — toVNDateString(parseVNTime(s)) lấy phần date của s
     */
    it('TC-419: round-trip: toVNDateString(parseVNTime(s)) phải cho đúng date phần VN', () => {
      const vnTimeStr = '2026-05-20 14:30:00';
      const parsed = parseVNTime(vnTimeStr);
      const dateStr = toVNDateString(parsed);

      // 2026-05-20 14:30 VN → UTC 07:30 → VN date vẫn là 2026-05-20
      expect(dateStr).toBe('2026-05-20');
    });

    /**
     * TC-420: Kết quả không có trailing whitespace hay ký tự thừa
     */
    it('TC-420: kết quả không chứa ký tự thừa (trim check)', () => {
      const date = new Date('2026-05-20T10:00:00Z');
      const result = toVNDateString(date);

      expect(result).toBe(result.trim());
      expect(result).toHaveLength(10); // "YYYY-MM-DD" = 10 ký tự
    });
  });
});
