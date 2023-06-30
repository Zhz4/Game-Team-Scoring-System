<script lang="ts" setup>
import {inject, reactive, ref, Ref} from "vue";
import store from "@/store";
const ws = store.state.websocket;
// 预设集中颜色
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
]);

const props = defineProps({
  roomId: {
    type: String,
  },
  id: {
    type: String,
  },
});
const form = reactive({
  name: '',
  color: '#409EFF',
})
let dialogVisible_setUp_team =  inject('dialogVisible_setUp_team') as Ref<boolean>

const handleClose_team = ()=>{
  dialogVisible_setUp_team.value = false
}

const cancel = ()=>{
  dialogVisible_setUp_team.value = false
}

const confirmed = () => {
  console.log('dd')
  ws?.send(
    JSON.stringify({
      type: "changeTeamSetUp",
      roomId: props.roomId,
      id: props.id,
      name: form.name,
      color: form.color,
    })
  );
  dialogVisible_setUp_team.value = false
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible_setUp_team"
      :before-close="handleClose_team"
      style="background-color: #272a37; border-radius: 20px"
      width="50%"
  >
    <template #header="{ titleId }">
      <div class="my-header" style="color: #e2dfdfe8">
        <h4 :id="titleId">设置队伍</h4>
      </div>
    </template>
    <el-form
        :model="form"
        label-width="120px">
      <el-form-item label="队伍名" prop="ranksCount">
        <el-input v-model="form.name"  maxlength="3" />
      </el-form-item>
      <el-form-item label="队伍颜色" prop="ranksCount">
        <div class="demo-color-block">
          <el-color-picker v-model="form.color" show-alpha :predefine="predefineColors" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmed">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<style lang="less">

</style>
