<template>
  <div>
    <div>
      <p>输入房间号</p>
      <el-input v-model="roomId" placeholder="请输入房间号"/>
      <el-button type="primary" @click="create">创建房间</el-button>
      <el-button type="primary" @click="join">加入</el-button>
    </div>
    <div>
      <p>该房间的人员</p>
    </div>
  </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';

const wsUrl = `ws://localhost:3001`;

const ws = new WebSocket(wsUrl);

ws.onmessage = function (event){
  const data = JSON.parse(event.data)
  if(data.type == 'create') console.log('收到消息：' + data.roomId);
  else if(data.type == 'join') console.log(data);
}
export default {
  setup() {
    const roomId = ref('')
    // 创建房间
    const create = () =>{
      ws.send(JSON.stringify({type:'create'}))
    }
    // 加入房间
    const join = () => {
      ws.send(JSON.stringify({type:'join',roomId:roomId.value}))
    }
    return {
      roomId,
      join,
      create
    }
  }
}
</script>

<style scoped>

</style>
