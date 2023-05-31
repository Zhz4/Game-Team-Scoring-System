<template>
  <div>
    <div>
      <p>输入房间号</p>
      <el-input v-model="roomId" placeholder="请输入房间号"/>
      <el-button type="primary" @click="create">创建房间</el-button>
      <el-button type="primary" @click="join">加入</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import {reactive, ref, onMounted, computed, watch, onBeforeUnmount} from 'vue';
import {useRoute, useRouter} from 'vue-router'
import {useStore} from 'vuex';
import {checkToken} from "@/util/Token";
import router from "@/router";

let token: string
// 存储token
if (!checkToken()) {
  token = new Date().getTime().toString()
  localStorage.setItem('token', token)
} else {
  token = localStorage.getItem('token')!
}

export default {
  setup() {
    const router = useRouter()
    const roomId = ref('')
    const store = useStore();
    const ws = ref<WebSocket | null>(null);

    const createws =  () => {
      // const wsUrl = `ws://localhost:3000/groupChart?token=${encodeURIComponent(token)}`;
      // const wss = await store.dispatch('connectWebSocket', wsUrl);
      const wss = store.state.websocket
      ws.value = wss
      // 监听信息
      wss.onmessage = (event: { data: string; }) => {
        const data = JSON.parse(event.data)
        if (data.type === 'create') {
          create_router(data.roomId)
        }
      }
    };
    // 创建房间
    const create = () => {
      ws.value?.send(JSON.stringify({type: 'create'}));
    };

    // 创建房间跳转
    const create_router = (roomId: string) => {
      router.push({
        name: 'roomDetail',
        params: {
          roomId: roomId
        }
      })
    };
    // 加入房间
    const join = () => {
      create_router(roomId.value)
    };

    onMounted(() => {
      createws();
      console.log('jinruda')
    });
    // onBeforeUnmount(() => {
    //   ws.value?.close();
    // })

    return {
      roomId,
      create,
      join,
      create_router
    }
  }
}
</script>

<style scoped>

</style>
