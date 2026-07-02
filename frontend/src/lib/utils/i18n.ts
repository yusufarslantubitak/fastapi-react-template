import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import adminEN from "@/assets/locales/en/admin.json"
import commonEN from "@/assets/locales/en/common.json"
import dashboardEN from "@/assets/locales/en/dashboard.json"
import itemsEN from "@/assets/locales/en/items.json"
import loginEN from "@/assets/locales/en/login.json"
import mapEN from "@/assets/locales/en/map.json"
import settingsEN from "@/assets/locales/en/settings.json"
import sidebarEN from "@/assets/locales/en/sidebar.json"
import signupEN from "@/assets/locales/en/signup.json"

import adminTR from "@/assets/locales/tr/admin.json"
import commonTR from "@/assets/locales/tr/common.json"
import dashboardTR from "@/assets/locales/tr/dashboard.json"
import itemsTR from "@/assets/locales/tr/items.json"
import loginTR from "@/assets/locales/tr/login.json"
import mapTR from "@/assets/locales/tr/map.json"
import settingsTR from "@/assets/locales/tr/settings.json"
import sidebarTR from "@/assets/locales/tr/sidebar.json"
import signupTR from "@/assets/locales/tr/signup.json"

export const defaultNS = "translation"

export const resources = {
  en: {
    translation: {
      admin: adminEN,
      common: commonEN,
      dashboard: dashboardEN,
      items: itemsEN,
      login: loginEN,
      map: mapEN,
      sidebar: sidebarEN,
      signup: signupEN,
      settings: settingsEN,
    },
  },
  tr: {
    translation: {
      admin: adminTR,
      common: commonTR,
      dashboard: dashboardTR,
      items: itemsTR,
      login: loginTR,
      map: mapTR,
      sidebar: sidebarTR,
      signup: signupTR,
      settings: settingsTR,
    },
  },
} as const

void i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    defaultNS,
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export default i18n
