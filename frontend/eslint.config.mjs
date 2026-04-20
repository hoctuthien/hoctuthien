// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    // Quy tắc chung cho toàn bộ src
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",
      "no-restricted-imports": [
        "error",
        {
          "paths": [
            {
              "name": "clsx",
              "message": "Vui lòng dùng 'cn' từ '@/core/utils/cn' để đảm bảo thống nhất và xử lý xung đột Tailwind."
            },
            {
              "name": "tailwind-merge",
              "message": "Vui lòng dùng 'cn' từ '@/core/utils/cn' để đảm bảo thống nhất và xử lý xung đột Tailwind."
            },
            {
              "name": "lucide-react",
              "message": "Vui lòng import thông qua '@/shared/components/Icon' để đảm bảo quản lý icon tập trung và nhất quán về style."
            },
            {
              "name": "axios",
              "message": "Vui lòng sử dụng instance axios từ '@/core/lib/axios' để đảm bảo các cầu hình interceptor và base URL được áp dụng."
            }
          ],
          "patterns": [
            {
              "group": ["**/../**"],
              "message": "Ưu tiên dùng đường dẫn tuyệt đối với alias '@/' thay vì relative path (../../) để code sạch và dễ di dời."
            },
            {
               "group": ["@/modules/*/**", "!@/modules/*"],
               "message": "Phá vỡ tính bao đóng: Vui lòng chỉ import thông qua file index.ts của module."
            }
          ]
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          "selector": "CallExpression[callee.object.name='apiService'][callee.property.name='get'][arguments.length<2]",
          "message": "Các hàm GET fetching dữ liệu bắt buộc phải có cấu hình Cache (revalidate hoặc cache)."
        },
        {
          "selector": "CallExpression[callee.object.name='apiService'][callee.property.name='get'][arguments.length=2][arguments.1.type='ObjectExpression'][arguments.1.properties.length=0]",
          "message": "Các hàm GET fetching dữ liệu bắt buộc phải có cấu hình Cache (revalidate hoặc cache)."
        },
        {
          "selector": "AssignmentExpression[left.object.name='errors'][right.type='Literal']",
          "message": "Không được gán chuỗi string thủ công cho lỗi. Vui lòng sử dụng hằng số từ MESSAGES trong '@/shared/constants'."
        }
      ]
    }
  },
  {
    // Ràng buộc Technical Excellence cho Gateway/API
    files: ["src/core/gateway/**/*.ts", "src/core/api/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          "selector": "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name=/^get/] > ArrowFunctionExpression:not([callee.name='cache'])",
          "message": "Các hàm bắt đầu bằng 'get' trong layer Gateway/API phải được bọc trong React.cache để tối ưu RSC."
        },
        {
          "selector": "ExportNamedDeclaration > FunctionDeclaration[id.name=/^get/]",
          "message": "Vui lòng sử dụng arrow function bọc trong React.cache cho các hàm 'get' để đảm bảo tính bao đóng và memoization."
        }
      ]
    }
  },
  {
    // Ràng buộc tầng Shared: Tầng thấp nhất, không phụ thuộc tầng trên
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [{
            "group": ["@/modules/**", "@/core/**", "@/app/**"],
            "message": "Vi phạm kiến trúc: Tầng 'shared' dự kiến sẽ được dùng chung, nên nó không được phép phụ thuộc vào các tầng cao hơn như modules, core hoặc app."
          }]
        }
      ]
    }
  },
  {
    // Ràng buộc tầng Core: Chứa logic lõi, không phụ thuộc modules hay app
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [{
            "group": ["@/modules/**", "@/app/**"],
            "message": "Vi phạm kiến trúc: Tầng 'core' không được phép phụ thuộc vào các module tính năng hoặc tầng router (app)."
          }]
        }
      ]
    }
  },
  {
    // Cho phép file wrapper import trực tiếp từ thư viện gốc
    files: [
      "src/shared/components/Icon/index.tsx",
      "src/core/lib/axios.ts"
    ],
    rules: {
      "no-restricted-imports": "off"
    }
  }
]);


export default eslintConfig;
