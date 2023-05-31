<template>
  <div class="home">
    <div>{{ count }}</div>
    <button @click="add">添加</button>
    <el-input v-model="input" placeholder="Please input"/>
    {{ input }}
    <button @click="sendMessage">发送</button>
    <!-- 聊天框-->
    <div>
      连接的列表
      <div v-for="item in conns" @click="select(item)">
        {{ item }}
        <span v-if="token === item">本机</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {ElMessage} from 'element-plus';
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
const wsUrl = `ws://localhost:3000/privateChart?token=${encodeURIComponent(token)}`;
const ws = new WebSocket(wsUrl);


export default {
  setup() {
    const message = ref('');
    const state = reactive({
      count: 0,
      token:token
    });
    const input = ref('');
    // 选择的聊天的人
    const select_Id = ref('')
    const conns = ref<string[]>([]);
    const add = () => {
      state.count++;
    };
    // 发送信息
    const sendMessage = () => {
      try {
        ws.send(JSON.stringify({to: select_Id.value, content: input.value}))
        ElMessage({
          message: '发送成功',
          type: 'success',
        })
      }catch (e){
        console.error('WebSocket 发送消息失败：', e);
      }
    };
    // 监听 WebSocket 连接事件
    ws.onopen = function () {
      console.log('WebSocket 连接已建立！');
    };

    // 监听 WebSocket 消息事件
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data)
      console.log('收到消息：' + data.msg);
      if (data.type === 0) {
        conns.value = Array.from(new Set(data.conns));
        ElMessage({
          message: data.msg,
          type: 'success',
        })
        return
      }else if(data.type === 4){
        conns.value = Array.from(new Set(data.conns));
        ElMessage({
          message: data.msg,
          type: 'warning',
        })
        return
      }
      message.value = data;
    };
    // 监听 WebSocket 关闭事件
    ws.onclose = function () {
      console.log('WebSocket 连接已关闭！');
    };

    // 选择聊天的人
    const select = (e: any) => {
      console.log('选择了'+e)
      select_Id.value = e
    }
    return {
      ...state,
      input,
      conns,
      add,
      select,
      sendMessage,
    };
  },
};
</script>

<style lang="less">
@primary-color: #1DA57A;

.home {
  color: @primary-color;
}
</style>
