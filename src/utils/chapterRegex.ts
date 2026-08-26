import i18n from "@/locales";

/**
 * 章节/剧集标题的默认正则，跟随界面语言。
 * The default chapter/episode heading pattern, following the interface locale.
 *
 * 界面语言是这个默认值唯一正确的信号：用户读什么语言，导入的稿件通常就是什么语言。
 * en / vi 使用 Chapter/Episode 写法，zh 系语言保留 第…章/回/节。提示词语言与此无关；
 * “AI 正则”按钮分析的是被导入的正文本身，不看这里。
 * The interface locale is the right signal for this default: people import
 * manuscripts written in the language they read. en / vi get the
 * Chapter/Episode syntax, zh-* keeps 第…章/回/节. Prompt language is unrelated,
 * and the AI Regex button analyses the pasted text itself rather than this.
 *
 * 这个默认值只是默认值：批量导入弹窗和设置页里的输入框都可以随意改写。
 * This is only a default: both the batch-import field and the settings field
 * stay editable.
 */
const ENGLISH_CHAPTER_RE = /^(?:Chapter|Episode)\s+([0-9]+)\s*(?:[:.\-–—]\s*)?([^\n\r]*)/gim;
const CHINESE_CHAPTER_RE = /第\s*([0-9０-９零一二三四五六七八九十百千万]+)\s*[章回节]\s*([^\n\r]*)/g;

/**
 * 读取当前界面语言；i18n 尚未就绪时退回空串（走英文默认值）。
 * Read the current interface locale, degrading to "" (the English default)
 * when i18n is not ready yet.
 */
function currentLocale(): string {
  try {
    return String(i18n.global.locale.value ?? "");
  } catch {
    return "";
  }
}

/**
 * 每次都返回新的 RegExp，避免 g 标志的 lastIndex 在多次解析之间泄漏。
 * Returns a fresh RegExp every call so the g flag's lastIndex never leaks
 * between parses.
 */
export function defaultChapterRegex(locale: string = currentLocale()): RegExp {
  const selected = /^zh(?:-|$)/i.test(locale.trim()) ? CHINESE_CHAPTER_RE : ENGLISH_CHAPTER_RE;
  return new RegExp(selected.source, selected.flags);
}

/**
 * 供输入框预填与“恢复默认”按钮使用的字面量形式，例如 `/第\s*…/g`。
 * The literal form used to prefill inputs and by the "restore default"
 * button, e.g. `/第\s*…/g`.
 */
export function defaultChapterRegexString(locale?: string): string {
  return defaultChapterRegex(locale ?? currentLocale()).toString();
}
