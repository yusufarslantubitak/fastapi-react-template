---
name: translations
description: Guidelines for managing i18next translations in the frontend. Use when adding, modifying, or reviewing translated strings and locale JSON files.
---

# Translations Management (i18next)

The frontend uses **react-i18next** with static JSON resource bundles. Two locales are currently supported: `en` (English, fallback) and `tr` (Turkish).

---

## 1. File Locations

| Purpose | Path |
|---------|------|
| i18n setup | `frontend/src/lib/utils/i18n.ts` |
| Type augmentation | `frontend/src/i18next.d.ts` |
| English translations | `frontend/src/assets/locales/en/*.json` (e.g. `sidebar.json`, `dashboard.json`, etc.) |
| Turkish translations | `frontend/src/assets/locales/tr/*.json` (e.g. `sidebar.json`, `dashboard.json`, etc.) |

---

## 2. Key Conventions

- Keys are **dot-separated** and grouped by feature/page: `"admin.title"`, `"sidebar.dashboard"`, `"items.addItem"`.
- Top-level groups correspond to pages or shared areas: `sidebar`, `dashboard`, `admin`, `items`, `settings`, `login`, `signup`, `map`, `common`.
- Keep keys **camelCase** within each group: `addUser`, `deleteConfirmTitle`.
- Shared strings (Cancel, Save, Delete, etc.) go under `"common.*"`.

---

## 3. Rules

1. **No hardcoded user-facing strings.** Every visible label, title, placeholder, toast message, and validation message must use `t("key")`.
2. **Always update the respective JSON files** in both locales (`en` and `tr`) when adding or modifying keys. Never leave a locale out of sync.
3. **Use interpolation** for dynamic values: `t("dashboard.greeting", { name })` → `"Hi, {{name}} 👋"`.
4. **Import the hook**, not the `i18n` instance, inside React components:
   ```tsx
   import { useTranslation } from "react-i18next"
   const { t } = useTranslation()
   ```
5. **Keep translation keys sorted** alphabetically within each JSON file across all locales for easy diffing.
6. When adding a **new locale**, also register it in `frontend/src/lib/utils/i18n.ts` under `resources` with all imported module JSON files.
7. When adding a **new translation module/namespace**, create the corresponding JSON files in all locale directories (e.g. `en/new_module.json` and `tr/new_module.json`), import them in `frontend/src/lib/utils/i18n.ts`, and add them to the `resources` mapping under `translation`.
