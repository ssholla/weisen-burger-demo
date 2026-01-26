# Prettier Configuration Guide

This project uses Prettier for code formatting across multiple file types including JavaScript, TypeScript, HTML, CSS, JSON, XML, and Markdown.

## 🚀 Quick Start

### Format All Supported Files
```bash
npm run prettier
```

### Check Formatting Without Changes
```bash
npm run prettier:check
```

## 🎯 File Type Specific Formatting

### JavaScript & TypeScript
```bash
npm run prettier:js
```
**Settings:**
- Print width: 80 characters
- Tab width: 2 spaces
- Semicolons: Required
- Single quotes: Yes
- Trailing commas: ES5 compatible

### HTML Files
```bash
npm run prettier:html
```
**Settings:**
- Print width: 100 characters
- Tab width: 2 spaces
- Whitespace sensitivity: CSS rules
- Self-closing elements: Keep original format

### CSS & SCSS
```bash
npm run prettier:css
```
**Settings:**
- Print width: 80 characters
- Tab width: 2 spaces
- Single quotes: No (double quotes for CSS)

### JSON Files
```bash
npm run prettier:json
```
**Settings:**
- Print width: 80 characters
- Tab width: 2 spaces
- Trailing commas: None (JSON standard)

### XML & Salesforce Metadata
```bash
npm run prettier:xml
```
**Settings:**
- Print width: 100 characters
- Tab width: 2 spaces
- Whitespace sensitivity: Ignore
- Self-closing space: Yes

### Markdown
```bash
npm run prettier:md
```
**Settings:**
- Standard Prettier markdown formatting
- Preserves code block formatting

## ⚙️ Configuration Files

### `.prettierrc` - Main Configuration
Contains the base Prettier configuration and file-specific overrides.

### `.prettierignore` - Excluded Files
Lists files and directories that should not be formatted:
- Dependencies (`node_modules/`)
- Build outputs (`dist/`, `build/`)
- Salesforce specific files (`sfdx-project.json`)
- Generated files (`coverage/`)
- **Apex files** (temporarily excluded due to parser setup requirements)

## 🔧 Apex Formatting (Advanced Setup)

Apex formatting is currently disabled due to parser requirements. To enable:

1. **Install Java** (required for Apex parser)
2. **Start Apex language server** (usually handled by VS Code Salesforce extension)
3. **Remove Apex exclusion** from `.prettierignore`
4. **Test formatting** on a single Apex file

### Apex Settings (when enabled):
- Print width: 100 characters
- Tab width: 4 spaces
- Insert final newline: Yes
- Parser: Built-in Apex parser

## 🛠️ VS Code Integration

### Automatic Formatting
Add to your VS Code settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[apex]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Format on Paste
```json
{
  "editor.formatOnPaste": true
}
```

## 🔄 Git Integration

Prettier runs automatically on git commit via:
- **Husky** - Git hook management
- **lint-staged** - Format only staged files

This ensures all committed code is properly formatted.

## 📋 File Type Support

| File Type | Extension | Status | Command |
|-----------|-----------|--------|---------|
| JavaScript | `.js` | ✅ Active | `npm run prettier:js` |
| TypeScript | `.ts` | ✅ Active | `npm run prettier:js` |
| HTML | `.html`, `.htm` | ✅ Active | `npm run prettier:html` |
| CSS | `.css`, `.scss` | ✅ Active | `npm run prettier:css` |
| JSON | `.json`, `.jsonc` | ✅ Active | `npm run prettier:json` |
| Markdown | `.md` | ✅ Active | `npm run prettier:md` |
| XML | `.xml`, `.svg` | ✅ Active | `npm run prettier:xml` |
| Salesforce | `.cmp`, `.app`, `.evt` | ✅ Active | `npm run prettier:xml` |
| Apex | `.cls`, `.trigger` | ⏸️ Disabled | Requires parser setup |

## 🚨 Troubleshooting

### Prettier Not Working?
1. Check if file is in `.prettierignore`
2. Verify file extension is supported
3. Run `npm run prettier:check` to see issues

### Apex Formatting Errors?
1. Ensure VS Code Salesforce extension is installed
2. Check if Apex Language Server is running
3. Temporarily add Apex files to `.prettierignore`

### VS Code Not Auto-formatting?
1. Install "Prettier - Code formatter" extension
2. Set as default formatter in settings
3. Enable "Format on Save"

## 🔧 Customization

To modify formatting rules:
1. Edit `.prettierrc` file
2. Add file-specific overrides in the `overrides` array
3. Test changes with `npm run prettier:check`
4. Commit updated configuration

---

**Note:** This configuration ensures consistent code style across the entire project while respecting the unique requirements of different file types in a Salesforce development environment.
