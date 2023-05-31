<template>
  <div>
    {{ roomId }}
  </div>
    在该房间的人
    <div v-for="item in member">
      {{item}}
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
    const sign = router.currentRoute.value.params.sign;
    const ws = ref<WebSocket | null>(null);
    const member = ref<any>([])
    const createws = () => {
      const wss = store.state.websocket
      ws.value = wss
      // 监听信息
      wss.onmessage = (event: { data: string; }) => {
        const data = JSON.parse(event.data)
        if (data.type === 'join' || data.type === 'delete' ||data.type === 'check') {
          console.log(data)
          member.value = data.member
        }
      }
      try {
        if(sign === '1'){
          // 非房主就要加入该房间
          ws.value?.send(JSON.stringify({type:'join',roomId: roomId}))
        }else if(sign === '0'){
          ws.value?.send(JSON.stringify({type:'check',roomId: roomId}))
        }
      }catch (e){
        console.log(e)
      }
    };

    onMounted(() => {
      createws()
    })
    onBeforeUnmount(() => {
      console.log('onBeforeUnmount')
      ws.value?.send(JSON.stringify({type:'out'}))
    })
    return {
      member,
      roomId,
      createws
    }
  }
}
</script>

<style scoped>

</style>
