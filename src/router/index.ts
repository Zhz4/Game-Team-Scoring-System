import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: "/",
  //   name: "home",
  //   component:  ()=>import("../views/home/index.vue"),
  // },
  {
    // 加入房间以及创建房间
    path: "/",
    name: "JoinRoom",
    component:  ()=> import("../views/JoinRoom/index.vue"),
  },
  {
    // 房间详情
    path: "/roomDetail/:roomId",
    name: "roomDetail",
    component:  ()=>import("../views/roomDetail/index.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
