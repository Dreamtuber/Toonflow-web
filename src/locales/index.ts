import { createI18n } from "vue-i18n";
import { useLocalStorage } from "@vueuse/core";
import zhCN from "./language/zh-CN.json";
import en from "./language/en.json";
import viVN from "./language/vi-VN.json";

/**
 * 产品只维护三种语言，与后端支持的 en / vi / zh 保持一致。
 * The product ships exactly three locales, matching the backend's en / vi / zh.
 */
const languageList = [
  { label: "English", tips: "English", value: "en" },
  { label: "Tiếng Việt", tips: "Vietnamese", value: "vi-VN" },
  { label: "简体中文", tips: "Chinese (Simplified)", value: "zh-CN" },
];

const DEFAULT_LOCALE = "en";
const LOCALE_STORAGE_KEY = "locale";

const supportedLocales = languageList.map((item) => item.value);

/**
 * 把任意语言标记归一到受支持的语言；无法匹配时返回空串。
 * Map any language tag onto a supported locale; returns "" when nothing matches.
 *
 * 旧版本可能在 localStorage 里留下 ja-JP / th-TH 之类已下线的语言，
 * 直接使用会让界面渲染出原始 key，因此必须降级。
 * Older builds may have left a retired locale such as ja-JP or th-TH in
 * localStorage; using it verbatim would render raw keys, so it must degrade.
 */
function normalizeLocale(raw?: string | null): string {
  if (!raw) return "";
  const tag = raw.trim().replace(/^"|"$/g, "");
  if (supportedLocales.includes(tag)) return tag;
  const base = tag.toLowerCase().split(/[-_]/)[0];
  return supportedLocales.find((locale) => locale.toLowerCase().split("-")[0] === base) ?? "";
}

/**
 * 首次启动时才参考浏览器语言，之后一律尊重用户已保存的选择。
 * Browser language is consulted on first launch only; a saved choice wins afterwards.
 */
function detectInitialLocale(): string {
  let browserLanguage = "";
  try {
    browserLanguage = navigator?.language ?? "";
  } catch {
    browserLanguage = "";
  }
  return normalizeLocale(browserLanguage) || DEFAULT_LOCALE;
}

const cachedLocale = useLocalStorage(LOCALE_STORAGE_KEY, detectInitialLocale());

// 已保存的语言若已下线（或被手改成无效值），降级到受支持的语言
// A stored locale that has been retired (or hand-edited to garbage) degrades to a supported one
if (!supportedLocales.includes(cachedLocale.value)) {
  cachedLocale.value = normalizeLocale(cachedLocale.value) || detectInitialLocale();
}

const i18n = createI18n({
  legacy: false,
  locale: cachedLocale.value,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    en,
    "vi-VN": viVN,
    "zh-CN": zhCN,
  },
});

export { languageList, cachedLocale, normalizeLocale, supportedLocales, DEFAULT_LOCALE };
export default i18n;
