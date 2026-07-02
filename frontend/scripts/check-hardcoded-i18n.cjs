/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const sourceRoot = path.resolve(__dirname, "..", "src");
const ignored = /\.stories\.|api\.generated|[\\/]mocks[\\/]/;
const translatedAttributes = new Set([
  "actionText", "alt", "aria-label", "confirmMessage", "description",
  "emptyMessage", "label", "message", "placeholder", "primaryActionLabel",
  "secondaryActionLabel", "startProcessingLabel", "subtitle", "successMessage", "title",
]);
const findings = [];

for (const file of walk(sourceRoot)) {
  if (!file.endsWith(".tsx") || ignored.test(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  visit(sourceFile);

  function visit(node) {
    let value;
    if (ts.isJsxText(node)) value = node.text.trim();
    if (
      ts.isJsxAttribute(node)
      && translatedAttributes.has(node.name.getText(sourceFile))
      && node.initializer
      && ts.isStringLiteral(node.initializer)
    ) value = node.initializer.text;
    if (
      ts.isJsxExpression(node)
      && node.expression
      && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))
    ) value = node.expression.text;
    if (isHumanText(value)) {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      findings.push(`${path.relative(sourceRoot, file)}:${position.line + 1} ${JSON.stringify(value)}`);
    }
    ts.forEachChild(node, visit);
  }
}

if (findings.length) {
  console.error(`Found ${findings.length} untranslated UI literal(s):\n${findings.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("No untranslated JSX literals found.");
}

function isHumanText(value) {
  if (!value || !/[A-Za-z\u00c0-\u024f\u1e00-\u1eff]/.test(value)) return false;
  return !/^(https?:\/\/|[\w.-]+@[\w.-]+\.[A-Za-z]{2,})/.test(value);
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(target);
    else yield target;
  }
}
