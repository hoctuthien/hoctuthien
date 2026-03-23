// .eslintrc.js
// Mục đích: Cấu hình ESLint với các quy tắc ranh giới (eslint-plugin-boundaries)
// Giúp kiểm soát Dependency rules một chiều: app -> modules -> shared -> core
module.exports = {
  extends: ["next/core-web-vitals"],
  plugins: ["boundaries"],
  settings: {
    "boundaries/elements": [
      {
        type: "app",
        pattern: "src/app/**/*",
      },
      {
        type: "modules",
        pattern: "src/modules/*/**/*",
      },
      {
        type: "shared",
        pattern: "src/shared/**/*",
      },
      {
        type: "core",
        pattern: "src/core/**/*",
      },
    ],
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        message: "Dependency violation: {{type}} cannot import {{target}}",
        rules: [
          {
            from: "app",
            allow: ["modules", "shared", "core"],
          },
          {
            from: "modules",
            allow: ["shared", "core"],
          },
          {
            from: "shared",
            allow: ["core"],
          },
          {
            from: "core",
            allow: [],
          },
        ],
      },
    ],
  },
};
