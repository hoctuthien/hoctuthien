// dependency-cruiser.config.js
// Mục định: Thiết lập luật kiểm tra ranh giới dependency một cách tự động.
// Tương tự quy tắc trong .eslintrc.js: core < shared < modules < app.

module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      comment: "Đảm bảo không có chu trình trong biểu đồ dependency.",
      from: {},
      to: { circular: true },
    },
    // Chèn thêm các luật ranh giới 1 chiều tại đây...
  ],
  options: {
    /* folder-level config */
  },
};
