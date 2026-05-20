import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import figures from "figures";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();

async function run() {
  console.clear();
  console.log(
    chalk.cyan.bold(
      `\n${figures.star} HỌC TỪ THIỆN - ROUTE GENERATOR ${figures.star}\n`
    )
  );

  // Tự động kiểm tra xem app nằm ở /app hay /src/app
  const isSrcStructure = fs.existsSync(path.join(rootDir, "src/app"));
  const appDir = isSrcStructure
    ? path.join(rootDir, "src/app")
    : path.join(rootDir, "app");

  if (!fs.existsSync(appDir)) {
    console.log(chalk.red(`❌ Không tìm thấy thư mục app tại ${appDir}`));
    return;
  }

  const getAllDirs = (dirPath, arrayOfDirs = []) => {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    files.forEach((file) => {
      // Chỉ loại bỏ folder build và thư viện hệ thống
      if (
        file.isDirectory() &&
        !["node_modules", ".next", "api"].includes(file.name) &&
        !file.name.startsWith(".")
      ) {
        const relativePath = path.relative(
          appDir,
          path.join(dirPath, file.name)
        );
        arrayOfDirs.push(relativePath);
        getAllDirs(path.join(dirPath, file.name), arrayOfDirs);
      }
    });
    return arrayOfDirs;
  };

  const existingDirs = getAllDirs(appDir);
  const choices = [
    { name: chalk.yellow(`${figures.pointer} [Root /app]`), value: "" },
    ...existingDirs.map((d) => ({
      name: `${figures.arrowRight} ${d}`,
      value: d,
    })),
  ];

  const { parent, name } = await inquirer.prompt([
    {
      type: "list",
      name: "parent",
      message: "Chọn folder cha:",
      choices: choices,
      pageSize: 12,
    },
    {
      type: "input",
      name: "name",
      message: "Nhập tên folder mới (có thể dùng (group) hoặc _private):",
      validate: (i) => (i ? true : "Không được để trống"),
    },
  ]);

  const targetPath = path.join(appDir, parent, name);
  const displayPath = path.relative(rootDir, targetPath);

  // Xử lý tên Component (Xóa dấu ngoặc nếu là group để tránh lỗi syntax React)
  const cleanName = name.replace(/[()]/g, "");
  const componentName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  const templates = {
    "page.tsx": `export default function ${componentName}Page() {\n  return (\n    <main className="container mx-auto p-4">\n      <h1 className="text-2xl font-bold">${name} Page</h1>\n    </main>\n  );\n}`,
    "layout.tsx": `export default function ${componentName}Layout({ children }: { children: React.ReactNode }) {\n  return <section className="w-full">\$\{children\}</section>;\n}`,
    "loading.tsx": `export default function Loading() {\n  return <div className="flex items-center justify-center min-h-[200px]">Loading ${name}...</div>;\n}`,
    "error.tsx": `'use client';\n\nexport default function Error({ error, reset }: { error: Error; reset: () => void }) {\n  return (\n    <div className="p-4 border border-red-500 rounded">\n      <h2 className="text-red-600 font-semibold">Something went wrong!</h2>\n      <button className="mt-2 px-4 py-2 bg-primary text-white rounded" onClick={() => reset()}>Try again</button>\n    </div>\n  );\n}`,
  };

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    Object.entries(templates).forEach(([file, content]) => {
      fs.writeFileSync(path.join(targetPath, file), content);
    });
    console.log(
      chalk.green(`\n${figures.tick} Đã tạo thành công tại: `) +
        chalk.underline(displayPath)
    );
  } else {
    console.log(chalk.red(`\n${figures.cross} Lỗi: Thư mục đã tồn tại!`));
  }
}

run();
