<template>
  <div id="page">
    <div class="header"></div>
    <div class="content clearfix">
      <div class="left">
        <div class="title">Game Team Scoring System</div>
        <div class="button">
          <div class="button-create" @click="create">Create</div>
          <div class="button-join">
            <div class="heading">请输入房间号 <span>RoomId</span></div>
            <div class="content">
              <div class="input-group">
                <input
                  autocomplete="off"
                  v-model="roomId"
                  class="input"
                  type="text"
                />
                <div></div>
              </div>
            </div>
            <button @click="join">Join</button>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="image"></div>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script lang="ts">
import {
  reactive,
  ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore, Commit } from "vuex";
import { checkToken } from "../../util/Token";
import router from "../../router";
import { ElMessage } from "element-plus";

let token: string;
// 存储token
if (!checkToken()) {
  token = new Date().getTime().toString();
  localStorage.setItem("token", token);
} else {
  token = localStorage.getItem("token")!;
}

export default {
  setup() {
    const router = useRouter();
    const roomId = ref("");
    const store = useStore();
    const ws = ref<WebSocket | null>(null);

    const createws = () => {
      const wss = store.state.websocket;
      ws.value = wss;
      // 监听信息
      wss.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === "create") {
          store.commit("SET_SIGN", 0);
          create_router(data.roomId);
        }
      };
    };
    // 创建房间
    const create = () => {
      ws.value?.send(JSON.stringify({ type: "create" }));
    };

    // 创建房间跳转
    const create_router = (roomId: string) => {
      router.replace({
        name: "roomDetail",
        params: {
          roomId: roomId,
        },
      });
    };
    // 加入房间
    const join = () => {
      if (roomId.value === "") {
        ElMessage({
          message: "房间号不能为空",
          type: "warning",
        });
        return;
      }
      store.commit("SET_SIGN", 1);
      create_router(roomId.value);
    };

    onMounted(() => {
      document.getElementsByTagName("body")[0].className = "add_bg_JoinRoom";
      createws();
    });
    return {
      roomId,
      create,
      join,
      create_router,
    };
  },
};
</script>

<style lang="less">
@import url("@/assets/less/base.less");
@import url("./index.less");
</style>
