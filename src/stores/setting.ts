import { defaultChapterRegexString } from "@/utils/chapterRegex";

export default defineStore(
  "setting",
  () => {
    const showSetting = ref(false);
    const isElectron = ref(false);
    const canvasWheelEvent = ref("zoom");
    const activeMenu = ref("ui");

    const baseUrl = ref<string>("http://localhost:10588/api");

    const needUpdate = ref(false);

    const otherSetting = ref({
      axiosTimeOut: 60 * 10 * 1000,
      assetsBatchGenereateSize: 5,
      // 首次启动时按界面语言给出默认章节正则；已保存的设置不会被覆盖。
      // Seeded from the interface locale on first launch; a saved setting is never overwritten.
      chapterReg: defaultChapterRegexString(),
      interacting: true,
      scriptEpisodeLength: 5000,
    });

    const themeSetting = ref<{
      mode: "auto" | "light" | "dark";
      primaryColor: string;
      fontSize: number;
    }>({
      mode: "auto",
      primaryColor: "#0052D9",
      fontSize: 16,
    });

    const language = ref<string>("en");

    return { showSetting, baseUrl, otherSetting, themeSetting, language, activeMenu, isElectron, canvasWheelEvent, needUpdate };
  },
  { persist: { pick: ["baseUrl", "otherSetting", "themeSetting", "language"] } },
);
