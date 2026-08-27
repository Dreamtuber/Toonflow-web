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
 * 剧本用「集」，小说用「章/回/节」——两种稿件的分隔符不同，不能共用一个默认值。
 * Scripts are split by 集 (episode); novels by 章/回/节 (chapter). They are
 * different documents and must not share one default.
 *
 * 这一条曾经丢失过：app 仓库的 patch-web-ui.ts 把 parseScript 原本的 第…集
 * 改接到章节正则上，移植过来时照抄了这个缺陷。结果是 zh-CN 用户粘贴
 * 第1集/第2集 的剧本时一条都匹配不到，parseScript 落到 matches.length === 0
 * 分支，把整份稿件当成标题为空的第 1 集——不报错，也没有测试会发现。
 * This was lost once: the app repo's patch-web-ui.ts rewired parseScript's
 * 第…集 onto the chapter pattern, and the port copied that defect. A zh-CN
 * user pasting a 第1集/第2集 script matched nothing, parseScript fell into its
 * matches.length === 0 branch, and the whole file became a single untitled
 * Episode 1 — silently, with no test runner to catch it.
 */
const CHINESE_EPISODE_RE = /第\s*([0-9０-９零一二三四五六七八九十百千万]+)\s*集\s*([^\n\r]*)/g;

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

/**
 * 剧本导入的默认正则。中文用「第…集」，其余语言与章节写法一致
 * （Chapter|Episode 已经涵盖剧集）。
 * The default pattern for script import. Chinese uses 第…集; other locales
 * share the chapter form, whose Chapter|Episode alternation already covers
 * episodes.
 */
export function defaultEpisodeRegex(locale: string = currentLocale()): RegExp {
  const selected = /^zh(?:-|$)/i.test(locale.trim()) ? CHINESE_EPISODE_RE : ENGLISH_CHAPTER_RE;
  return new RegExp(selected.source, selected.flags);
}

/** 字面量形式，供剧本导入的输入框预填与「恢复默认」使用。 */
export function defaultEpisodeRegexString(locale?: string): string {
  return defaultEpisodeRegex(locale ?? currentLocale()).toString();
}
