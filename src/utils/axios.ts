import axios from "axios";
import router from "@/router/index";
import { storeToRefs } from "pinia";
import { MessagePlugin, NotifyPlugin, type TNode } from "tdesign-vue-next";
import settingStore from "@/stores/setting";
import i18n from "@/locales";
import { h } from "vue";
const instance = axios.create();

instance.interceptors.request.use(function (config) {
  const { baseUrl, otherSetting } = storeToRefs(settingStore());
  config.baseURL = baseUrl.value;
  config.timeout = otherSetting.value.axiosTimeOut;
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  // 后端从 X-Toonflow-Lang 请求头解析面向用户的文案（只取首个 `-` 之前的子标签），
  // 缺少该头时才回退到服务端保存的 content_language 设置。始终发送完整的界面语言
  // 标记（en / vi-VN / zh-CN），让后端跟随界面语言。
  // The backend resolves person-facing text from the X-Toonflow-Lang header (it
  // reads the subtag before the first "-"), falling back to the stored
  // content_language setting only when the header is absent. Always send the full
  // interface locale tag (en / vi-VN / zh-CN) so the backend follows the UI.
  config.headers["X-Toonflow-Lang"] = i18n.global.locale.value;

  return config;
});

instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      MessagePlugin.error(window.$t("common.sessionExpired"));
    }
    if (error.message.includes("Network Error") || error.response.data?.message === "Network Error") {
      NotifyPlugin.error({
        title: "Network Error",
        closeBtn: true,
        duration: 3000, // 不自动关闭，让用户有时间看
        className: "customNotifyFull", // 自定义类名
        content: () =>
          h("div", [
            h("div", { style: { marginBottom: "8px" } }, window.$t("common.networkError.intro")),
            h("div", { style: { marginBottom: "4px" } }, window.$t("common.networkError.step1")),
            h("div", { style: { marginBottom: "4px" } }, window.$t("common.networkError.step2")),
            h("div", [
              window.$t("common.networkError.step3"),
              h("div", { style: { display: "flex", gap: "8px", marginTop: "4px" } }, [
                h(
                  "a",
                  {
                    href: "https://aka.ms/vs/17/release/vc_redist.x86.exe",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { color: "#0052d9" },
                  },
                  window.$t("common.networkError.download32"),
                ),
                h(
                  "a",
                  {
                    href: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { color: "#0052d9" },
                  },
                  window.$t("common.networkError.download64"),
                ),
              ]),
            ]),
          ]),
      });
    }

    return Promise.reject(error?.response?.data ?? error);
  },
);

export default instance;
