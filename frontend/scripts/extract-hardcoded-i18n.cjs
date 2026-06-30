/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "src");
const messagesPath = path.join(root, "messages", "vi.json");
const translatedAttributes = new Set([
  "alt",
  "actionText",
  "category",
  "courseTitle",
  "aria-label",
  "confirmMessage",
  "description",
  "emptyMessage",
  "label",
  "message",
  "mentorName",
  "partnerName",
  "placeholder",
  "primaryActionLabel",
  "secondaryActionLabel",
  "startProcessingLabel",
  "subtitle",
  "successMessage",
  "title",
]);
const ignoredFiles = /\.stories\.|api\.generated|[\\/]mocks[\\/]/;
const translatedProperties = new Set([
  "actionText",
  "description",
  "emptyMessage",
  "errorMessage",
  "label",
  "message",
  "placeholder",
  "primaryActionLabel",
  "secondaryActionLabel",
  "subtitle",
  "successMessage",
  "title",
  "timeLabel",
]);
const translatedVariables = new Set([
  "categoryName", "description", "errorMsg", "mentorName", "statusLabel",
  "timeLabel", "title",
]);
const translatedCalls = new Set([
  "alert",
  "confirm",
  "getErrorMessage",
  "prompt",
  "setError",
  "setMessage",
  "setVerifyMessage",
  "showMessage",
  "showToast",
]);

const originalMessagesSource = fs.readFileSync(messagesPath, "utf8");
const messages = JSON.parse(originalMessagesSource);
messages.Extracted = messages.Extracted || {};

for (const file of walk(sourceRoot)) {
  if (!/\.tsx$/.test(file) || ignoredFiles.test(file)) continue;
  transformFile(file);
}

const extractedJson = JSON.stringify(messages.Extracted, null, 2)
  .split("\n")
  .map((line, index) => (index ? `  ${line}` : line))
  .join("\r\n");
const extractedProperty = originalMessagesSource.indexOf('"Extracted"');
if (extractedProperty >= 0) {
  const objectStart = originalMessagesSource.indexOf("{", extractedProperty);
  let depth = 0;
  let objectEnd = objectStart;
  for (; objectEnd < originalMessagesSource.length; objectEnd += 1) {
    if (originalMessagesSource[objectEnd] === "{") depth += 1;
    if (originalMessagesSource[objectEnd] === "}" && --depth === 0) {
      objectEnd += 1;
      break;
    }
  }
  fs.writeFileSync(
    messagesPath,
    `${originalMessagesSource.slice(0, objectStart)}${extractedJson}${originalMessagesSource.slice(objectEnd)}`,
  );
} else {
  const messagesWithoutClosingBrace = originalMessagesSource.trimEnd().replace(/\}\s*$/, "");
  fs.writeFileSync(
    messagesPath,
    `${messagesWithoutClosingBrace},\r\n  "Extracted": ${extractedJson}\r\n}\r\n`,
  );
}

function transformFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const candidates = [];

  visit(sourceFile);
  if (!candidates.length) return;

  const namespace = namespaceFor(file);
  const catalog = (messages.Extracted[namespace] ||= {});
  const keysByValue = new Map(
    Object.entries(catalog).map(([key, value]) => [value, key])
  );
  const components = new Map();
  const edits = [];

  for (const candidate of candidates) {
    const component = findComponent(candidate.node);
    if (!component) {
      console.warn(
        `Skipped (no component): ${path.relative(root, file)}: ${candidate.value}`
      );
      continue;
    }

    let key = keysByValue.get(candidate.value);
    if (!key) {
      key = uniqueKey(candidate.value, catalog);
      catalog[key] = candidate.value;
      keysByValue.set(candidate.value, key);
    }

    components.set(component, componentInfo(component));
    const call = `tExtracted('${key}')`;
    edits.push({
      start: candidate.node.getStart(sourceFile),
      end: candidate.node.getEnd(),
      text:
        candidate.kind === "text" || candidate.kind === "attribute"
          ? `{${call}}`
          : call,
    });
  }

  if (!edits.length) return;

  let needsHook = false;
  let needsServer = false;
  for (const [component, info] of components) {
    if (component.body.getText(sourceFile).includes("const tExtracted =")) {
      continue;
    }
    const statement = info.async
      ? `\n  const tExtracted = await getTranslations('Extracted.${namespace}');`
      : `\n  const tExtracted = useTranslations('Extracted.${namespace}');`;
    needsServer ||= info.async;
    needsHook ||= !info.async;

    if (ts.isBlock(component.body)) {
      edits.push({
        start: component.body.getStart(sourceFile) + 1,
        end: component.body.getStart(sourceFile) + 1,
        text: statement,
      });
    } else {
      edits.push({
        start: component.body.getStart(sourceFile),
        end: component.body.getStart(sourceFile),
        text: `{${statement}\n  return `,
      });
      edits.push({
        start: component.body.getEnd(),
        end: component.body.getEnd(),
        text: ";\n}",
      });
    }
  }

  const importPosition =
    sourceFile.statements.find(ts.isImportDeclaration)?.getStart(sourceFile) ??
    sourceFile.statements[0]?.getStart(sourceFile) ??
    0;
  let imports = "";
  if (
    needsHook &&
    !hasNamedImport(sourceFile, "next-intl", "useTranslations")
  ) {
    imports += `import { useTranslations } from 'next-intl';\n`;
  }
  if (
    needsServer &&
    !hasNamedImport(sourceFile, "next-intl/server", "getTranslations")
  ) {
    imports += `import { getTranslations } from 'next-intl/server';\n`;
  }
  if (imports)
    edits.push({ start: importPosition, end: importPosition, text: imports });

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let output = source;
  for (const edit of edits)
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  fs.writeFileSync(file, output.replace(/\r?\n/g, "\r\n"));

  function visit(node) {
    if (ts.isJsxText(node)) {
      const value = jsxTextValue(node.text);
      if (isHumanText(value)) candidates.push({ node, value, kind: "text" });
    } else if (
      ts.isJsxAttribute(node) &&
      translatedAttributes.has(node.name.getText(sourceFile)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      isHumanText(node.initializer.text)
    ) {
      candidates.push({
        node: node.initializer,
        value: node.initializer.text,
        kind: "attribute",
      });
    } else if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      isHumanText(node.text)
    ) {
      const kind = userVisibleStringKind(node);
      if (kind) candidates.push({ node, value: node.text, kind });
    }
    ts.forEachChild(node, visit);
  }
}

function userVisibleStringKind(node) {
  for (let current = node.parent; current && !isFunction(current); current = current.parent) {
    if (ts.isCallExpression(current)) {
      const callName = current.expression.getText().split(".").pop();
      if (callName === "tExtracted") return undefined;
      if (!translatedCalls.has(callName)) break;
      const argumentIndex = current.arguments.findIndex(
        (argument) => node.pos >= argument.pos && node.end <= argument.end,
      );
      if (!["showMessage", "showToast", "getErrorMessage"].includes(callName) || argumentIndex > 0) {
        return "expression";
      }
    }
  }

  for (let current = node.parent; current && !isFunction(current); current = current.parent) {
    if (ts.isJsxAttribute(current)) {
      return translatedAttributes.has(current.name.getText()) ? "expression" : undefined;
    }
    if (ts.isPropertyAssignment(current) && current.name === node) return undefined;
  }

  if (
    ts.isVariableDeclaration(node.parent)
    && ts.isIdentifier(node.parent.name)
    && translatedVariables.has(node.parent.name.text)
  ) return "expression";
  if (
    ts.isBinaryExpression(node.parent)
    && node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && ts.isIdentifier(node.parent.left)
    && translatedVariables.has(node.parent.left.text)
  ) return "expression";

  let sawJsxExpression = false;
  let child = node;
  for (let current = node.parent; current && !isFunction(current); current = current.parent) {
    if (ts.isPropertyAssignment(current) && node.pos >= current.initializer.pos) {
      const propertyName = current.name.getText().replace(/["']/g, "");
      return translatedProperties.has(propertyName) ? "expression" : undefined;
    }
    if (ts.isCallExpression(current)) {
      const callName = current.expression.getText().split(".").pop();
      if (!translatedCalls.has(callName)) return undefined;
      const argumentIndex = current.arguments.findIndex(
        (argument) => child.pos >= argument.pos && child.end <= argument.end,
      );
      if (["showMessage", "showToast", "getErrorMessage"].includes(callName) && argumentIndex === 0) {
        return undefined;
      }
      return "expression";
    }
    if (ts.isBinaryExpression(current)) {
      const operator = current.operatorToken.kind;
      const isDisplayBranch = operator === ts.SyntaxKind.AmpersandAmpersandToken
        && child.pos >= current.right.pos
        && child.end <= current.right.end;
      if (
        operator !== ts.SyntaxKind.BarBarToken
        && operator !== ts.SyntaxKind.QuestionQuestionToken
        && !isDisplayBranch
      ) return undefined;
    }
    if (ts.isConditionalExpression(current) && child.pos >= current.condition.pos && child.end <= current.condition.end) {
      return undefined;
    }
    if (ts.isJsxExpression(current)) sawJsxExpression = true;
    child = current;
  }
  return sawJsxExpression ? "expression" : undefined;
}

function findComponent(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (!isFunction(current)) continue;
    const name = functionName(current);
    if ((name && /^[A-Z]/.test(name)) || isDefaultExport(current))
      return current;
  }
  return undefined;
}

function isFunction(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  );
}

function functionName(node) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  if (
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  )
    return node.parent.name.text;
  return undefined;
}

function isDefaultExport(node) {
  return Boolean(
    node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
    )
  );
}

function componentInfo(node) {
  return {
    async: Boolean(
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword
      )
    ),
    body: node.body,
  };
}

function hasNamedImport(sourceFile, moduleName, importName) {
  return sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.text === moduleName &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings) &&
      statement.importClause.namedBindings.elements.some(
        (element) => element.name.text === importName
      )
  );
}

function jsxTextValue(raw) {
  if (!raw.includes("\n") && !raw.includes("\r")) return raw;
  return raw.trim().replace(/\s+/g, " ");
}

function isHumanText(value) {
  const trimmed = value.trim();
  if (!trimmed || !/[A-Za-zÀ-ỹĐđ]/.test(trimmed)) return false;
  if (/^(https?:\/\/|[\w.-]+@[\w.-]+\.[A-Za-z]{2,})/.test(trimmed))
    return false;
  return true;
}

function namespaceFor(file) {
  return path
    .relative(sourceRoot, file)
    .replace(/\.tsx$/, "")
    .split(/[\\/()[\]]+/)
    .filter(Boolean)
    .map((part, index) =>
      index ? capitalize(toIdentifier(part)) : toIdentifier(part)
    )
    .join("");
}

function uniqueKey(value, catalog) {
  const words = stripDiacritics(value.trim())
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  let base =
    words
      .map((word, index) =>
        index ? capitalize(word.toLowerCase()) : word.toLowerCase()
      )
      .join("") || "text";
  if (/^\d/.test(base)) base = `text${capitalize(base)}`;
  let key = base;
  let suffix = 2;
  while (
    Object.prototype.hasOwnProperty.call(catalog, key) &&
    catalog[key] !== value
  )
    key = `${base}${suffix++}`;
  return key;
}

function toIdentifier(value) {
  const output = stripDiacritics(value)
    .replace(/[^A-Za-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "");
  return output || "root";
}

function stripDiacritics(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(target);
    else yield target;
  }
}
