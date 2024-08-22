import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import {
  checkToken,
  getToken,
  getUsername,
  setToken,
  setUsername,
} from "@/util/Token";
// svgIcon的组件
import svgIcon from "@/components/svgIcon/index.vue";
import "./assets/icons"; // icon
// import "./assets/css/tailwindcss.css";
import { randomUserName } from "@/util/randomUserName";

let token: string;
let username: string = "";
// 存储token
if (!checkToken()) {
  token = new Date().getTime().toString();
  username = randomUserName("云村村民", 5);
  setToken(token);
  setUsername(username);
} else {
  username = getUsername()!;
  token = getToken()!;
}
// const wsUrl = `${process.env.BACKEND_URL}/groupChart?token=${encodeURIComponent(token)}&username=${encodeURIComponent(username)}`;
const wsUrl = `${
  process.env.VUE_APP_BACKEND_URL
}/groupChart?token=${encodeURIComponent(token)}&username=${encodeURIComponent(
  username
)}`;

store.dispatch("connectWebSocket", wsUrl).then(() => {
  createApp(App)
    .use(store)
    .use(router)
    .use(ElementPlus)
    .component("svg-icon", svgIcon)
    .mount("#app");
});
