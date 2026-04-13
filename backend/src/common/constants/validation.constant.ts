// Ví dụ các quy tắc validation cho các trường dữ liệu trong hệ thống
// Về quy tắc sao thì 14/04/2026 bàn bạc thêm, hiện tại chỉ là ví dụ để định hình cách thức validation

export const VALIDATION_RULES = {
  // Học viên: ME + 4 số năm + 4 số định danh (Ví dụ: ME20260001)
  MENTEE_ID: {
    regex: /^ME\d{8}$/,
    message: 'Mã học viên không hợp lệ (Ví dụ đúng: ME20260001).',
  },

  // Mentor: MT + 1 chữ cái phân loại (A: Admin, S: Specialist) + 4 số (Ví dụ: MT-S-1234)
  MENTOR_ID: {
    regex: /^MT-[A-Z]-\d{4}$/,
    message: 'Mã Mentor phải có định dạng MT-X-0000.',
  },

  // Mã khóa học: CRS + 3 chữ cái viết hoa (Ví dụ: CRS-JS, CRS-PHP)
  COURSE_CODE: {
    regex: /^CRS-[A-Z]{2,5}$/,
    message: 'Mã khóa học phải từ 2-5 chữ cái viết hoa (Ví dụ: CRS-REACT).',
  },

  // Mã giao dịch đóng góp: DON + 6 ký tự gồm chữ và số (Ví dụ: DON-A1B2C3)
  DONATION_ID: {
    regex: /^DON-[A-Z0-9]{6}$/,
    message: 'Mã đóng góp không đúng định dạng đối soát.',
  },
} as const;

export type ValidationRuleKey = keyof typeof VALIDATION_RULES;
