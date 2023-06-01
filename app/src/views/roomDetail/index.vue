<template>
  <div>
    {{ roomId }}
  </div>
  在该房间的人
  <div v-for="item in member">
    {{ item }}
  </div>
  <div>
    <el-button type="primary" @click="out">退出房间</el-button>
  </div>
</template>

<script lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {useRouter} from 'vue-router';
import router from "@/router";

export default {
  setup() {
    const store = useStore();
    const roomId = router.currentRoute.value.params.roomId;
    const sign = store.state.sign
    const outIN = ref<boolean>(false) // 判断是否执行了退出操作
    const ws = ref<WebSocket | null>(null);
    const member = ref<any>([])
    const createws = () => {
      const wss = store.state.websocket
      ws.value = wss
      // 监听信息
      wss.onmessage = (event: { data: string; }) => {
        const data = JSON.parse(event.data)
        console.log(data)
        if (data.type === 'join' || data.type === 'delete' || data.type === 'check') {
          member.value = data.member.map((item: { nickname: string; }) => item.nickname)
        }
      }
      try {
        ws.value?.send(JSON.stringify({type: 'join', roomId: roomId}))
      } catch (e) {
        console.log(e)
      }
    };

    const out = ()=>{
      ws.value?.send(JSON.stringify({type: 'out'}))
      outIN.value = true
      router.replace({
        name:'JoinRoom'
      })
    }

    onMounted(() => {
      createws()
    })
    onBeforeUnmount(() => {
      if(!outIN.value){
        // 已经点了按钮就不用再执行退出了，否则就执行
        console.log('onBeforeUnmount')
        ws.value?.send(JSON.stringify({type: 'out'}))
      }
    })
    return {
      member,
      roomId,
      createws,
      out
    }
  }
}
</script>

<style scoped>

</style>
