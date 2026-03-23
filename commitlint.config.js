// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 1. Kiểm soát Type (Bắt buộc một trong các loại dưới đây)
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "style", "refactor", "perf", "test", "revert", "build"]
    ],
    // 2. Kiểm soát Scope (Bắt buộc một trong các vùng dưới đây)
    "scope-enum": [
      2,
      "always",
      [
        // Frontend
        "booking", "charity", "core", "shared", "auth",
        // Backend
        "api", "db", "queue", "email",
        // Chung
        "deps", "ci", "docker", "config"
      ],
    ],
    // 3. Quy tắc Header
    "header-max-length": [2, "always", 72],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
  /* 
    HƯỚNG DẪN KHI COMMIT SAI:
    Nếu bạn thấy lỗi, hãy đảm bảo commit đúng format: <type>(<scope>): <mô tả>
    Ví dụ: 
    - feat(booking): thêm tính năng đặt lịch mới
    - fix(api): sửa lỗi xác thực JWT
  */
};
