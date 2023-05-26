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
      <div v-for="item in member">
        {{item}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';
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

const ws = new WebSocket(wsUrl);


export default {
  setup() {
    const roomId = ref('')
    const member = ref<string[]>([])
    // 创建房间
    const create = () =>{
      ws.send(JSON.stringify({type:'create'}))
    }
    // 加入房间
    const join = () => {
      ws.send(JSON.stringify({type:'join',roomId:roomId.value}))
    }
    ws.onmessage = (event)=>{
      const data = JSON.parse(event.data)
      member.value = data.member
      console.log(data)
    }
    ws.onclose = function () {
      ws.send(JSON.stringify({type:'out'}))
    };
    return {
      roomId,
      member,
      join,
      create
    }
  }
}
</script>

<style scoped>

</style>
