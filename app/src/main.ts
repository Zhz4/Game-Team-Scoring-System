import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {checkToken} from "@/util/Token";

let token: string
// 存储token
if (!checkToken()) {
    token = new Date().getTime().toString()
    localStorage.setItem('token', token)
} else {
    token = localStorage.getItem('token')!
}
const wsUrl = `ws://localhost:3000/groupChart?token=${encodeURIComponent(token)}`;
store.dispatch('connectWebSocket', wsUrl).then(()=>{
    createApp(App).use(store).use(router).use(ElementPlus).mount("#app");
})
